const { database, redis, logger, errors } = require('@getplot/shared');

const { ValidationError, NotFoundError } = errors;

const LOCATION_MAP = {
  yabi: 'yabi',
  trabuom: 'trabuom',
  'dar-es-salaam': 'dar_es_salaam',
  dar_es_salaam: 'dar_es_salaam',
  'legon-hills': 'legon_hills',
  legon_hills: 'legon_hills',
  nthc: 'nthc',
  berekuso: 'berekuso',
  'royal-court-estate': 'saadi',
  saadi: 'saadi',
};

class PlotsService {
  async getPlots({
    location,
    status,
    minPrice,
    maxPrice,
    minSize,
    maxSize,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20,
  }) {
    const cacheKey = `plots:list:${JSON.stringify({
      location,
      status,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      sortBy,
      order,
      page,
      limit,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.debug('Plots list cache hit');
      return JSON.parse(cached);
    }

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM properties.all_properties WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (location) {
      const dbLocation = this._mapLocation(location);
      paramCount += 1;
      query += ` AND location = $${paramCount}`;
      params.push(dbLocation);
    }

    if (status) {
      paramCount += 1;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (minPrice) {
      paramCount += 1;
      query += ` AND plotTotalAmount >= $${paramCount}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      paramCount += 1;
      query += ` AND plotTotalAmount <= $${paramCount}`;
      params.push(maxPrice);
    }

    if (minSize) {
      paramCount += 1;
      query += ` AND (properties->>'SHAPE_Area')::float >= $${paramCount}`;
      params.push(minSize);
    }

    if (maxSize) {
      paramCount += 1;
      query += ` AND (properties->>'SHAPE_Area')::float <= $${paramCount}`;
      params.push(maxSize);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await database.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const sortFields = {
      plotNo: "properties->>'Plot_No'",
      price: 'plotTotalAmount',
      size: "(properties->>'SHAPE_Area')::float",
      createdAt: 'created_at',
    };
    const sortField = sortFields[sortBy] || 'created_at';
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${sortDirection}`;

    paramCount += 1;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount += 1;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await database.query(query, params);
    const plots = result.rows.map(this._formatPlot);

    const payload = {
      plots,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };

    await redis.setex(cacheKey, 300, JSON.stringify(payload));
    return payload;
  }

  async getPlotById(id, location = null) {
    const cacheKey = `plots:detail:${id}:${location || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.debug('Plot cache hit', { id });
      return JSON.parse(cached);
    }

    let query;
    let params = [id];
    if (location) {
      const dbLocation = this._mapLocation(location);
      query = `SELECT * FROM properties.${dbLocation} WHERE id = $1`;
    } else {
      query = 'SELECT * FROM properties.all_properties WHERE id = $1';
    }

    const result = await database.query(query, params);
    if (result.rows.length === 0) {
      throw new NotFoundError('Plot');
    }

    const plot = this._formatPlot(result.rows[0]);
    await redis.setex(cacheKey, 600, JSON.stringify(plot));
    return plot;
  }

  async getPlotsByLocation(location) {
    const dbLocation = this._mapLocation(location);
    const cacheKey = `plots:location:${dbLocation}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.debug('Plots location cache hit', { location: dbLocation });
      return JSON.parse(cached);
    }

    const query = `
      SELECT id, geometry, properties, status, plotTotalAmount, created_at
      FROM properties.${dbLocation}
      ORDER BY created_at DESC
    `;

    const result = await database.query(query);
    const featureCollection = {
      type: 'FeatureCollection',
      features: result.rows.map((row) => ({
        id: row.id,
        type: 'Feature',
        geometry: row.geometry,
        properties: {
          ...row.properties,
          id: row.id,
          status: row.status,
          plotTotalAmount: row.plotTotalAmount,
        },
      })),
    };

    await redis.setex(cacheKey, 300, JSON.stringify(featureCollection));
    return featureCollection;
  }

  async getStatistics(location = null) {
    const cacheKey = `plots:stats:${location || 'all'}`;
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
      const dbLocation = this._mapLocation(location);
      query += ' WHERE location = $1';
      params.push(dbLocation);
    }

    const result = await database.query(query, params);
    const stats = {
      total: parseInt(result.rows[0].total, 10),
      available: parseInt(result.rows[0].available, 10),
      reserved: parseInt(result.rows[0].reserved, 10),
      sold: parseInt(result.rows[0].sold, 10),
      averagePrice: parseFloat(result.rows[0].avg_price) || 0,
      minPrice: parseFloat(result.rows[0].min_price) || 0,
      maxPrice: parseFloat(result.rows[0].max_price) || 0,
    };

    await redis.setex(cacheKey, 900, JSON.stringify(stats));
    return stats;
  }

  _mapLocation(location) {
    const key = location?.toLowerCase();
    const mapped = LOCATION_MAP[key];
    if (!mapped) {
      throw new ValidationError('Invalid location');
    }
    return mapped;
  }

  _formatPlot(row) {
    return {
      id: row.id,
      location: row.location,
      plotNo: row.properties?.Plot_No || null,
      streetName: row.properties?.Street_Nam || null,
      status: row.status,
      area: row.properties?.SHAPE_Area || null,
      price: row.plotTotalAmount,
      geometry: row.geometry,
      metadata: row.properties,
      customer: {
        firstName: row.firstname,
        lastName: row.lastname,
        email: row.email,
        phone: row.phone,
        country: row.country,
      },
      timestamps: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        reservedAt: row.reserved_at,
        soldAt: row.sold_at,
      },
    };
  }
}

module.exports = new PlotsService();

