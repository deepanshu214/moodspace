from datetime import datetime, timedelta, timezone
from typing import Any, Union
import jwt
from passlib.context import CryptContext
from src.core.config import settings

# Bcrypt context (Cost 12 as per specifications)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# AES-256-GCM Encryption logic for Journal Notes
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64

def encrypt_note(plaintext: str) -> tuple[str, str]:
    """Encrypts a string using AES-GCM and the server secret key."""
    if not plaintext:
        return None, None
        
    # Derive a 32-byte key from the SECRET_KEY for AES-256
    import hashlib
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    
    # Encrypt
    ct = aesgcm.encrypt(nonce, plaintext.encode(), None)
    
    # Base64 encode for storage
    encrypted_base64 = base64.b64encode(ct).decode('utf-8')
    nonce_base64 = base64.b64encode(nonce).decode('utf-8')
    
    return encrypted_base64, nonce_base64

def decrypt_note(encrypted_base64: str, nonce_base64: str) -> str:
    """Decrypts a base64 encoded AES-GCM string."""
    if not encrypted_base64 or not nonce_base64:
        return None
        
    import hashlib
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    
    aesgcm = AESGCM(key)
    
    ct = base64.b64decode(encrypted_base64)
    nonce = base64.b64decode(nonce_base64)
    
    try:
        plaintext = aesgcm.decrypt(nonce, ct, None)
        return plaintext.decode('utf-8')
    except Exception:
        return "[Decryption Error]"
