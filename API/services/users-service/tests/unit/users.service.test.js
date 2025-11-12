const UsersService = require('../../../src/services/users.service');
const { errors } = require('@getplot/shared');

const { NotFoundError } = errors;

describe('UsersService - Unit Tests', () => {
  describe('getProfile', () => {
    it('should require userId', async () => {
      await expect(
        UsersService.getProfile(null)
      ).rejects.toThrow();
    });

    it('should throw NotFoundError for non-existent user', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rows: [] });

      await expect(
        UsersService.getProfile('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });

    it('should use cache when available', async () => {
      const { redis } = require('@getplot/shared');
      const cachedProfile = { id: 'user-id', email: 'test@example.com' };
      
      redis.get = jest.fn().mockResolvedValue(JSON.stringify(cachedProfile));

      const result = await UsersService.getProfile('user-id');

      expect(result).toEqual(cachedProfile);
      expect(redis.get).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should require userId', async () => {
      await expect(
        UsersService.updateProfile(null, {})
      ).rejects.toThrow();
    });

    it('should update profile fields', async () => {
      const { database, redis } = require('@getplot/shared');
      const updatedProfile = {
        id: 'user-id',
        first_name: 'Updated',
        last_name: 'Name',
        phone: '+233241234567'
      };

      database.query = jest.fn().mockResolvedValue({ rows: [updatedProfile] });
      redis.del = jest.fn().mockResolvedValue(1);

      const result = await UsersService.updateProfile('user-id', {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+233241234567'
      });

      expect(result).toBeDefined();
      expect(redis.del).toHaveBeenCalled(); // Cache invalidation
    });

    it('should throw NotFoundError for non-existent profile', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rows: [] });

      await expect(
        UsersService.updateProfile('non-existent-id', {})
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPreferences', () => {
    it('should create default preferences if none exist', async () => {
      const { database } = require('@getplot/shared');
      
      // First call: no preferences
      database.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ 
          rows: [{ 
            user_id: 'user-id',
            notifications_email: true,
            notifications_sms: false,
            language: 'en',
            currency: 'GHS'
          }] 
        });

      const result = await UsersService.getPreferences('user-id');

      expect(result).toBeDefined();
      expect(database.query).toHaveBeenCalledTimes(2); // Check + Create
    });
  });

  describe('saveProperty', () => {
    it('should save property to favorites', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      const result = await UsersService.saveProperty('user-id', 'property-id');

      expect(result.success).toBe(true);
      expect(database.query).toHaveBeenCalled();
    });
  });

  describe('unsaveProperty', () => {
    it('should remove property from favorites', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      const result = await UsersService.unsaveProperty('user-id', 'property-id');

      expect(result.success).toBe(true);
      expect(database.query).toHaveBeenCalled();
    });
  });

  describe('getSavedProperties', () => {
    it('should handle pagination', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn()
        .mockResolvedValueOnce({ rows: [{ count: '10' }] }) // Count
        .mockResolvedValueOnce({ rows: [] }); // Properties

      const result = await UsersService.getSavedProperties('user-id', {
        page: 1,
        limit: 20
      });

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });
});

