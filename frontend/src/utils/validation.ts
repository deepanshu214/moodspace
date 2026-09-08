export const validation = {
  validateEmail(email: string): string | null {
    if (!email || !email.trim()) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    return null;
  },

  validatePassword(password: string): string | null {
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return null;
  },

  validateDisplayName(name: string): string | null {
    if (!name || !name.trim()) {
      return 'Display name / pseudonym is required.';
    }
    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters.';
    }
    if (name.trim().length > 30) {
      return 'Name cannot exceed 30 characters.';
    }
    return null;
  },

  validateDOB(dob: string): string | null {
    if (!dob || !dob.trim()) {
      return 'Date of birth is required.';
    }
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob.trim())) {
      return 'Please enter date in YYYY-MM-DD format.';
    }
    const birthDate = new Date(dob.trim());
    if (isNaN(birthDate.getTime())) {
      return 'Invalid date.';
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return 'You must be at least 18 years old to join MoodSpace.';
    }
    if (age > 120) {
      return 'Please enter a valid date of birth.';
    }
    return null;
  },

  validateBio(bio: string): string | null {
    if (bio && bio.length > 160) {
      return 'Bio cannot exceed 160 characters.';
    }
    return null;
  },
};
