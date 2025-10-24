const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

class BcryptHelper {
  /**
   * Hash password
   */
  static async hash(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  static async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password) {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  /**
   * Generate random password
   */
  static generateRandomPassword(length = 12) {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const special = '@$!%*?&';
    const all = uppercase + lowercase + numbers + special;

    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}

module.exports = BcryptHelper;

