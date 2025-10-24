const { database, redis, logger, errors } = require('@getplot/shared');

const { NotFoundError, ValidationError } = errors;

// Map frontend route names to database table names
const LOCATION_MAP = {
  'yabi': 'yabi',
  'trabuom': 'trabuom',
  'dar-es-salaam': 'dar_es_salaam',
  'dar_es_salaam': 'dar_es_salaam',
  'legon-hills': 'legon_hills',
  'legon_hills': 'legon_hills',
  'nthc': 'nthc',
  'berekuso': 'berekuso',
  'royal-court-estate': 'saadi',
  'saadi': 'saadi',
};

const VALID_LOCATIONS = Object.keys(LOCATION_MAP);

class PropertiesService {
  /**
   * Get all properties with filters and pagination
   */
  async getProperties({ location, status, minPrice, maxPrice, minSize, maxSize, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 }) {
    try {
      const offset = (page - 1) * limit;
      
      // Build query
      let query = 'SELECT * FROM properties.all_properties WHERE 1=1';
      const params = [];
      let paramCount = 0;

      if (location) {
        const dbLocation = LOCATION_MAP[location];
        if (!dbLocation) {
          throw new ValidationError('Invalid location');
        }
        paramCount++;
        query += ` AND location = $${paramCount}`;
        params.push(dbLocation);
      }

      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }

      if (minPrice) {
        paramCount++;
        query += ` AND plotTotalAmount >= $${paramCount}`;
        params.push(minPrice);
      }

      if (maxPrice) {
        paramCount++;
        query += ` AND plotTotalAmount <= $${paramCount}`;
        params.push(maxPrice);
      }

      if (minSize) {
        paramCount++;
        query += ` AND (properties->>'SHAPE_Area')::float >= $${paramCount}`;
        params.push(minSize);
      }

      if (maxSize) {
        paramCount++;
        query += ` AND (properties->>'SHAPE_Area')::float <= $${paramCount}`;
        params.push(maxSize);
      }

      // Count total
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const countResult = await database.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count, 10);

      // Add sorting
      const validSortFields = {
        'plotNo': "properties->>'Plot_No'",
        'price': 'plotTotalAmount',
        'size': "(properties->>'SHAPE_Area')::float",
        'createdAt': 'created_at',
      };
      
      const sortField = validSortFields[sortBy] || 'created_at';
      const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY ${sortField} ${sortOrder}`;

      // Add pagination
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      // Execute query
      const result = await database.query(query, params);

      // Format results
      const properties = result.rows.map(this._formatProperty);

      logger.info('Properties fetched', { count: properties.length, total, page, limit });

      return {
        properties,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('Error fetching properties:', error);
      throw error;
    }
  }

  /**
   * Get single property by ID
   */
  async getPropertyById(id, location = null) {
    try {
      // Try cache first
      const cacheKey = `property:${id}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        logger.debug('Property cache hit', { id });
        return JSON.parse(cached);
      }

      let query;
      let params;

      if (location) {
        const dbLocation = LOCATION_MAP[location];
        if (!dbLocation) {
          throw new ValidationError('Invalid location');
        }
        
        query = `SELECT * FROM properties.${dbLocation} WHERE id = $1`;
        params = [id];
      } else {
        query = 'SELECT * FROM properties.all_properties WHERE id = $1';
        params = [id];
      }

      const result = await database.query(query, params);

      if (result.rows.length === 0) {
        throw new NotFoundError('Property');
      }

      const property = this._formatProperty(result.rows[0]);

      // Cache result (10 minutes)
      await redis.setex(cacheKey, 600, JSON.stringify(property));

      logger.info('Property fetched', { id });

      return property;
    } catch (error) {
      logger.error('Error fetching property:', error);
      throw error;
    }
  }

  /**
   * Get properties by location (optimized for map view)
   */
  async getPropertiesByLocation(location) {
    try {
      const dbLocation = LOCATION_MAP[location];
      if (!dbLocation) {
        throw new ValidationError('Invalid location');
      }

      // Try cache first
      const cacheKey = `properties:location:${dbLocation}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        logger.debug('Location properties cache hit', { location: dbLocation });
        return JSON.parse(cached);
      }

      const query = `
        SELECT 
          id,
          geometry,
          properties,
          status,
          plotTotalAmount,
          created_at
        FROM properties.${dbLocation}
        ORDER BY created_at DESC
      `;

      const result = await database.query(query);
      
      const properties = result.rows.map(row => ({
        id: row.id,
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          ...row.properties,
          status: row.status,
          plotTotalAmount: row.plotTotalAmount,
          id: row.id,
        },
      }));

      const featureCollection = {
        type: 'FeatureCollection',
        features: properties,
      };

      // Cache result (5 minutes)
      await redis.setex(cacheKey, 300, JSON.stringify(featureCollection));

      logger.info('Location properties fetched', { location: dbLocation, count: properties.length });

      return featureCollection;
    } catch (error) {
      logger.error('Error fetching location properties:', error);
      throw error;
    }
  }

  /**
   * Search properties (advanced)
   */
  async searchProperties(filters, page = 1, limit = 20) {
    try {
      // This would be more complex with spatial queries, full-text search, etc.
      // For now, use the regular getProperties with filters
      return await this.getProperties({ ...filters, page, limit });
    } catch (error) {
      logger.error('Error searching properties:', error);
      throw error;
    }
  }

  /**
   * Get property statistics
   */
  async getStatistics(location = null) {
    try {
      const cacheKey = location ? `stats:${location}` : 'stats:all';
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'available') as available,
          COUNT(*) FILTER (WHERE status = 'reserved') as reserved,
          COUNT(*) FILTER (WHERE status = 'sold') as sold,
          AVG(plotTotalAmount) as avg_price,
          MIN(plotTotalAmount) as min_price,
          MAX(plotTotalAmount) as max_price
        FROM properties.all_properties
      `;

      const params = [];
      
      if (location) {
        const dbLocation = LOCATION_MAP[location];
        query += ' WHERE location = $1';
        params.push(dbLocation);
      }

      const result = await database.query(query, params);
      const stats = result.rows[0];

      // Format statistics
      const formatted = {
        total: parseInt(stats.total, 10),
        available: parseInt(stats.available, 10),
        reserved: parseInt(stats.reserved, 10),
        sold: parseInt(stats.sold, 10),
        averagePrice: parseFloat(stats.avg_price) || 0,
        minPrice: parseFloat(stats.min_price) || 0,
        maxPrice: parseFloat(stats.max_price) || 0,
      };

      // Cache for 15 minutes
      await redis.setex(cacheKey, 900, JSON.stringify(formatted));

      return formatted;
    } catch (error) {
      logger.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Update property status (for transactions service)
   */
  async updatePropertyStatus(id, location, status, customerData = null) {
    try {
      const dbLocation = LOCATION_MAP[location];
      if (!dbLocation) {
        throw new ValidationError('Invalid location');
      }

      let query = `
        UPDATE properties.${dbLocation}
        SET status = $1, updated_at = CURRENT_TIMESTAMP
      `;
      const params = [status];
      let paramCount = 1;

      if (customerData) {
        paramCount++;
        query += `, firstname = $${paramCount}`;
        params.push(customerData.firstName);

        paramCount++;
        query += `, lastname = $${paramCount}`;
        params.push(customerData.lastName);

        paramCount++;
        query += `, email = $${paramCount}`;
        params.push(customerData.email);

        paramCount++;
        query += `, phone = $${paramCount}`;
        params.push(customerData.phone);

        if (customerData.country) {
          paramCount++;
          query += `, country = $${paramCount}`;
          params.push(customerData.country);
        }

        if (customerData.residentialAddress) {
          paramCount++;
          query += `, residentialAddress = $${paramCount}`;
          params.push(customerData.residentialAddress);
        }
      }

      if (status === 'reserved') {
        const holdExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        paramCount++;
        query += `, hold_expires_at = $${paramCount}, reserved_at = CURRENT_TIMESTAMP`;
        params.push(holdExpires);
      }

      if (status === 'sold') {
        query += `, sold_at = CURRENT_TIMESTAMP`;
      }

      paramCount++;
      query += ` WHERE id = $${paramCount} RETURNING *`;
      params.push(id);

      const result = await database.query(query, params);

      if (result.rows.length === 0) {
        throw new NotFoundError('Property');
      }

      // Invalidate cache
      await redis.del(`property:${id}`);
      await redis.del(`properties:location:${dbLocation}`);
      await redis.del(`stats:${location}`);
      await redis.del('stats:all');

      logger.info('Property status updated', { id, location, status });

      return this._formatProperty(result.rows[0]);
    } catch (error) {
      logger.error('Error updating property status:', error);
      throw error;
    }
  }

  /**
   * Private: Format property data
   */
  _formatProperty(row) {
    return {
      id: row.id,
      location: row.location,
      plotNo: row.properties?.Plot_No || null,
      streetName: row.properties?.Street_Nam || null,
      status: row.status,
      area: row.properties?.SHAPE_Area || null,
      areaUnit: 'acres',
      price: row.plotTotalAmount,
      paidAmount: row.paidAmount || 0,
      remainingAmount: row.remainingAmount || row.plotTotalAmount,
      currency: 'GHS',
      coordinates: row.geometry,
      metadata: {
        cadastral: row.properties?.Cadastral || '',
        ownerInfo: row.properties?.Owner_Info || '',
        remarks: row.properties?.Remarks || '',
        objectId: row.properties?.OBJECTID || null,
        shapeLength: row.properties?.Shape_Length || null,
      },
      customerInfo: row.firstname ? {
        firstName: row.firstname,
        lastName: row.lastname,
        email: row.email,
        phone: row.phone,
        country: row.country,
        residentialAddress: row.residentialAddress,
      } : null,
      holdExpiresAt: row.hold_expires_at,
      reservedAt: row.reserved_at,
      soldAt: row.sold_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = new PropertiesService();

