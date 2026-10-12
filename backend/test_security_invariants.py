"""
Privacy invariants that were each a live data leak before.

These run without a database: the point is to pin the shape of what the API is
allowed to say about somebody who is not the caller. Every assertion here
corresponds to a finding from the 2026-10 review — if one fails, that leak is
back.

Run: ./venv/bin/python backend/test_security_invariants.py
"""
import datetime
import re
import sys
import uuid
from pathlib import Path

BACKEND = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND))

SRC = BACKEND / "src"
failures = []


def check(label, condition, detail=""):
    if condition:
        print(f"  ok    {label}")
    else:
        print(f"  FAIL  {label}{(' — ' + detail) if detail else ''}")
        failures.append(label)


print("A stranger's profile never carries contact details")
from src.schemas.user import PublicUserResponse, UserResponse
from src.schemas.matching import MatchedUser

fields = set(PublicUserResponse.model_fields)
check("PublicUserResponse has no email", "email" not in fields)
check("PublicUserResponse has no status/role", not ({"status", "role"} & fields))
check(
    "PublicUserResponse does not inherit UserBase",
    not issubclass(PublicUserResponse, UserResponse.__bases__[0]),
    "inheriting UserBase is what put email on every match",
)
check(
    "matches describe users with the public schema",
    MatchedUser.model_fields["user"].annotation is PublicUserResponse,
)

print("Matching excludes private and incognito entries")
matching_src = (SRC / "services" / "matching_service.py").read_text()
check("uses a privacy whitelist", "privacy_level.in_(['public', 'community'])" in matching_src)
check("no privacy blacklist", "privacy_level != 'private'" not in matching_src)
check("skips incognito authors", "is_incognito.is_(False)" in matching_src)
check("builds no UserResponse", "UserResponse(" not in matching_src.replace("PublicUserResponse(", ""))

print("An anonymous community post has no author id")
from src.schemas.community import PostResponse


def make_post(is_anonymous):
    now = datetime.datetime.now()
    return PostResponse(
        id=uuid.uuid4(),
        community_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        post_type="discussion",
        content="x",
        is_anonymous=is_anonymous,
        has_content_warning=False,
        is_pinned=False,
        reaction_count=0,
        comment_count=0,
        created_at=now,
        updated_at=now,
    )


check("anonymous post redacts user_id", make_post(True).user_id is None)
check("anonymous post redacts it in the serialized body", make_post(True).model_dump()["user_id"] is None)
check("named post keeps user_id", make_post(False).user_id is not None)

print("Private communities are readable only by members")
community_src = (SRC / "services" / "community_service.py").read_text()
check("read path takes the viewer", "def get_community_posts(db: Session, viewer_id: UUID" in community_src)
check("read path checks privacy", 'comm.privacy != "public"' in community_src.split("def create_community_post")[0])
check(
    "read path requires membership",
    "CommunityMembership" in community_src.split("def create_community_post")[0],
)

print("A cloaked bubble does not ship its author's id")
mood_src = (SRC / "api" / "v1" / "mood.py").read_text()
check("nearby nulls user_id when cloaked", '"user_id": None if cloaked else str(entry.user_id)' in mood_src)
# Scope to /nearby: the /checkin response echoes the author their own id,
# which is not a disclosure to anyone else.
nearby_src = mood_src.split("def get_nearby_moods")[1]
check(
    "nearby never emits a bare user_id",
    not re.search(r'"user_id":\s*str\(entry\.user_id\)', nearby_src),
)
feed_src = (SRC / "api" / "v1" / "feed.py").read_text()
check("feed nulls the id for incognito", "None if entry.is_incognito else entry.user_id" in feed_src)

print("The heatmap aggregates instead of pinpointing")
map_src = (SRC / "services" / "map_service.py").read_text()
check("snaps points to a grid", "ST_SnapToGrid" in map_src)
check("groups by the grid cell, not the raw point", "func.ST_Y(cell)" in map_src)
check("uses the shareable whitelist", "privacy_level.in_(SHAREABLE_PRIVACY)" in map_src)
check("excludes dissolved bubbles", "live_bubbles_filter()" in map_src)
check("excludes deleted bubbles", "deleted_at.is_(None)" in map_src)
check(
    "no privacy blacklist outside the explanatory comment",
    map_src.count("!= 'private'") == 1 and "# " in map_src.split("!= 'private'")[0].rsplit("\n", 1)[-1],
)

print("Dissolving a bubble removes its files")
mood_service_src = (SRC / "services" / "mood_service.py").read_text()
purge = mood_service_src.split("def purge_dissolved_bubbles")[1]
check("purge collects attachment paths", "MoodAttachment.storage_path" in purge)
check("purge unlinks them", "delete_media_files(storage_paths)" in purge)
check("unlink verifies containment", "is_relative_to(root)" in mood_service_src)

print("Issued tokens can be revoked")
deps_src = (SRC / "api" / "deps.py").read_text()
security_src = (SRC / "core" / "security.py").read_text()
support_src = (SRC / "services" / "support_service.py").read_text()
check("access tokens carry a version claim", '"tv": token_version' in security_src)
check("requests verify the version", 'payload.get("tv") != user.token_version' in deps_src)
check("force logout bumps it", support_src.split("def force_logout_user")[1].count("token_version") >= 1)
check("suspend bumps it", "token_version" in support_src.split("def suspend_user")[1].split("def force_logout_user")[0])

print("Encryption metadata names the real algorithm")
messaging_src = (SRC / "api" / "v1" / "messaging.py").read_text()
check("labelled gcm", '"alg": "aes-256-gcm"' in messaging_src)
check("no stale cbc label", '"aes-256-cbc"' not in messaging_src)

print()
if failures:
    print(f"{len(failures)} invariant(s) FAILED: {', '.join(failures)}")
    sys.exit(1)
print("All privacy invariants hold.")
