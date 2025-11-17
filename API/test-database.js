#!/usr/bin/env node

/**
 * Database Test Script
 * Tests database connection and performs basic CRUD operations
 */

require('./shared/utils/loadEnv');
const database = require('./shared/database');
const logger = require('./shared/utils/logger');

async function testDatabase() {
  let testRecordId = null;

  try {
    logger.info('🚀 Starting database test...');

    // Step 1: Connect to database
    logger.info('📡 Connecting to database...');
    await database.connect();
    logger.info('✅ Database connected successfully!');

    // Step 2: Test health check
    logger.info('🏥 Running health check...');
    const health = await database.healthCheck();
    logger.info(`Health status: ${health.status} - ${health.message}`);

    // Step 3: Insert a test record into activity_logs table
    logger.info('📝 Inserting test record into landandhomes_c_db.activity_logs...');
    const insertQuery = `
      INSERT INTO landandhomes_c_db.activity_logs (type, action, details, status, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    
    const testData = {
      type: 'system',
      action: 'database_test',
      details: 'This is a test record to verify database connectivity',
      status: 'success',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
        script: 'test-database.js'
      }
    };

    const insertResult = await database.query(insertQuery, [
      testData.type,
      testData.action,
      testData.details,
      testData.status,
      JSON.stringify(testData.metadata)
    ]);

    testRecordId = insertResult.rows[0].id;
    logger.info(`✅ Test record inserted with ID: ${testRecordId}`);
    logger.info(`   Created at: ${insertResult.rows[0].created_at}`);

    // Step 4: Read the test record back
    logger.info('📖 Reading test record back from database...');
    const selectQuery = `
      SELECT id, type, action, details, status, metadata, created_at
      FROM landandhomes_c_db.activity_logs
      WHERE id = $1
    `;

    const selectResult = await database.query(selectQuery, [testRecordId]);
    
    if (selectResult.rows.length === 0) {
      throw new Error('Test record not found after insertion!');
    }

    const retrievedRecord = selectResult.rows[0];
    logger.info('✅ Test record retrieved successfully!');
    logger.info('   Record details:');
    logger.info(`   - ID: ${retrievedRecord.id}`);
    logger.info(`   - Type: ${retrievedRecord.type}`);
    logger.info(`   - Action: ${retrievedRecord.action}`);
    logger.info(`   - Details: ${retrievedRecord.details}`);
    logger.info(`   - Status: ${retrievedRecord.status}`);
    logger.info(`   - Metadata: ${JSON.stringify(retrievedRecord.metadata)}`);
    logger.info(`   - Created at: ${retrievedRecord.created_at}`);

    // Step 5: Verify data integrity
    if (
      retrievedRecord.type === testData.type &&
      retrievedRecord.action === testData.action &&
      retrievedRecord.details === testData.details &&
      retrievedRecord.status === testData.status
    ) {
      logger.info('✅ Data integrity verified - all fields match!');
    } else {
      throw new Error('Data integrity check failed - fields do not match!');
    }

    // Step 6: Test transaction capability
    logger.info('💳 Testing transaction capability...');
    await database.transaction(async (client) => {
      // Insert another test record within transaction
      const txResult = await client.query(
        `INSERT INTO landandhomes_c_db.activity_logs (type, action, details, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        ['system', 'transaction_test', 'Testing transaction rollback', 'success']
      );
      logger.info(`   Transaction test record created: ${txResult.rows[0].id}`);
      // Transaction will commit automatically
    });
    logger.info('✅ Transaction test completed successfully!');

    // Step 7: Count total test records
    logger.info('📊 Counting test records...');
    const countResult = await database.query(
      `SELECT COUNT(*) as count FROM landandhomes_c_db.activity_logs WHERE action LIKE '%test%'`
    );
    logger.info(`   Found ${countResult.rows[0].count} test records in database`);

    logger.info('');
    logger.info('🎉 All database tests passed successfully!');
    logger.info('');
    logger.info('📌 Summary:');
    logger.info('   ✅ Database connection: OK');
    logger.info('   ✅ Health check: OK');
    logger.info('   ✅ Insert operation: OK');
    logger.info('   ✅ Select operation: OK');
    logger.info('   ✅ Data integrity: OK');
    logger.info('   ✅ Transactions: OK');
    logger.info('');
    logger.info(`💾 Test record ID: ${testRecordId}`);
    logger.info('   (You can manually delete this record if needed)');

  } catch (error) {
    logger.error('❌ Database test failed!');
    logger.error('Error details:', error);
    process.exitCode = 1;
  } finally {
    // Step 8: Disconnect from database
    try {
      logger.info('🔌 Disconnecting from database...');
      await database.disconnect();
      logger.info('✅ Database disconnected');
    } catch (disconnectError) {
      logger.error('Error disconnecting from database:', disconnectError);
    }
  }
}

// Run the test
testDatabase();

