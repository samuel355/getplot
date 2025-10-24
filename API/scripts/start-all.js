#!/usr/bin/env node
/**
 * Start all microservices
 */

const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'Gateway', path: 'gateway', port: 3000 },
  { name: 'Auth', path: 'services/auth-service', port: 3001 },
  { name: 'Properties', path: 'services/properties-service', port: 3002 },
  { name: 'Transactions', path: 'services/transactions-service', port: 3003 },
  { name: 'Users', path: 'services/users-service', port: 3004 },
  { name: 'Notifications', path: 'services/notifications-service', port: 3005 },
];

console.log('🚀 Starting all microservices...\n');

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', service.path);
  
  console.log(`📦 Starting ${service.name} Service on port ${service.port}...`);
  
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
  });

  proc.on('error', (error) => {
    console.error(`❌ ${service.name} Service failed:`, error);
  });
});

console.log('\n✨ All services started!');
console.log('Press Ctrl+C to stop all services\n');

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  process.exit(0);
});

