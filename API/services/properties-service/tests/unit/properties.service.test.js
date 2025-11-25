const PropertiesService = require('../../../src/services/properties.service');
const { errors } = require('@getplot/shared');

const { ValidationError } = errors;

describe('PropertiesService - Unit Tests', () => {
  describe('getProperties', () => {
    it('should validate location parameter', async () => {
      await expect(
        PropertiesService.getProperties({ location: 'invalid-location' })
      ).rejects.toThrow(ValidationError);
    });

    it('should accept valid locations', async () => {
      const validLocations = ['yabi', 'trabuom', 'legon-hills', 'nthc', 'berekuso', 'saadi'];
      
      for (const location of validLocations) {
        // Mock database query to avoid actual DB call
        const originalQuery = require('@getplot/shared').database.query;
        require('@getplot/shared').database.query = jest.fn().mockResolvedValue({ rows: [] });
        
        await expect(
          PropertiesService.getProperties({ location })
        ).resolves.not.toThrow();
        
        require('@getplot/shared').database.query = originalQuery;
      }
    });

    it('should handle pagination parameters', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ 
        rows: [],
        rowCount: 0 
      });

      const result = await PropertiesService.getProperties({ 
        page: 2, 
        limit: 10 
      });

      expect(database.query).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getPropertyById', () => {
    it('should require property ID', async () => {
      await expect(
        PropertiesService.getPropertyById(null)
      ).rejects.toThrow();
    });

    it('should handle non-existent property', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rows: [] });

      await expect(
        PropertiesService.getPropertyById('non-existent-id')
      ).rejects.toThrow();
    });
  });

  describe('getPropertiesByLocation', () => {
    it('should validate location', async () => {
      await expect(
        PropertiesService.getPropertiesByLocation('invalid')
      ).rejects.toThrow(ValidationError);
    });

    it('should accept valid location formats', async () => {
      const validLocations = [
        'yabi',
        'trabuom',
        'dar-es-salaam',
        'dar_es_salaam',
        'legon-hills',
        'legon_hills'
      ];

      for (const location of validLocations) {
        const { database } = require('@getplot/shared');
        database.query = jest.fn().mockResolvedValue({ rows: [] });

        await expect(
          PropertiesService.getPropertiesByLocation(location)
        ).resolves.not.toThrow();
      }
    });
  });

  describe('searchProperties', () => {
    it('should handle empty filters', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await PropertiesService.searchProperties({});

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
    });

    it('should handle price range filters', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await PropertiesService.searchProperties({
        minPrice: 10000,
        maxPrice: 100000
      });

      expect(result).toBeDefined();
    });

    it('should handle size range filters', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await PropertiesService.searchProperties({
        minSize: 100,
        maxSize: 1000
      });

      expect(result).toBeDefined();
    });
  });
});
