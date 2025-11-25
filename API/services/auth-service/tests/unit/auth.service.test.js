const { BcryptHelper } = require('@getplot/shared');

describe('Auth Service - Unit Tests', () => {
  describe('BcryptHelper', () => {
    describe('hash', () => {
      it('should hash password correctly', async () => {
        const password = 'TestPass123!';
        const hashed = await BcryptHelper.hash(password);
        
        expect(hashed).toBeDefined();
        expect(hashed).not.toBe(password);
        expect(hashed.length).toBeGreaterThan(50);
      });

      it('should create different hashes for same password', async () => {
        const password = 'TestPass123!';
        const hash1 = await BcryptHelper.hash(password);
        const hash2 = await BcryptHelper.hash(password);
        
        expect(hash1).not.toBe(hash2);
      });
    });

    describe('compare', () => {
      it('should validate correct password', async () => {
        const password = 'TestPass123!';
        const hashed = await BcryptHelper.hash(password);
        const isValid = await BcryptHelper.compare(password, hashed);
        
        expect(isValid).toBe(true);
      });

      it('should reject incorrect password', async () => {
        const password = 'TestPass123!';
        const hashed = await BcryptHelper.hash(password);
        const isValid = await BcryptHelper.compare('WrongPass123!', hashed);
        
        expect(isValid).toBe(false);
      });
    });

    describe('isStrongPassword', () => {
      it('should accept strong password', () => {
        expect(BcryptHelper.isStrongPassword('TestPass123!')).toBe(true);
        expect(BcryptHelper.isStrongPassword('MyP@ssw0rd')).toBe(true);
      });

      it('should reject weak passwords', () => {
        expect(BcryptHelper.isStrongPassword('weak')).toBe(false);
        expect(BcryptHelper.isStrongPassword('noupppercase1!')).toBe(false);
        expect(BcryptHelper.isStrongPassword('NOLOWERCASE1!')).toBe(false);
        expect(BcryptHelper.isStrongPassword('NoNumbers!')).toBe(false);
        expect(BcryptHelper.isStrongPassword('NoSpecial123')).toBe(false);
      });
    });

    describe('generateRandomPassword', () => {
      it('should generate strong password', () => {
        const password = BcryptHelper.generateRandomPassword();
        
        expect(password).toBeDefined();
        expect(password.length).toBe(12);
        expect(BcryptHelper.isStrongPassword(password)).toBe(true);
      });

      it('should generate password of specified length', () => {
        const password = BcryptHelper.generateRandomPassword(16);
        
        expect(password.length).toBe(16);
        expect(BcryptHelper.isStrongPassword(password)).toBe(true);
      });
    });
  });
});

