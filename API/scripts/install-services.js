#!/usr/bin/env node
/**
 * Install dependencies for all services
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const services = [
  'gateway',
  'services/auth-service',
  'services/properties-service',
  'services/transactions-service',
  'services/users-service',
  'services/notifications-service',
  'shared',
];

console.log('🚀 Installing dependencies for all services...\n');

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', service);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⏭️  Skipping ${service} (directory not found)`);
    return;
  }

  if (!fs.existsSync(path.join(servicePath, 'package.json'))) {
    console.log(`⏭️  Skipping ${service} (no package.json)`);
    return;
  }

  console.log(`📦 Installing dependencies for ${service}...`);
  
  try {
    execSync('npm install', {
      cwd: servicePath,
      stdio: 'inherit',
    });
    console.log(`✅ ${service} - Done\n`);
  } catch (error) {
    console.error(`❌ ${service} - Failed`);
    console.error(error.message);
  }
});

console.log('✨ All dependencies installed successfully!');

