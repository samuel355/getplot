const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

function loadEnv() {
  if (process.env.__GETPLOT_ENV_LOADED) {
    return;
  }

  const apiRoot = path.resolve(__dirname, '..', '..');
  const envFiles = ['.env', 'env.local'];

  envFiles.forEach((file) => {
    const filePath = path.join(apiRoot, file);
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: true });
    }
  });

  process.env.__GETPLOT_ENV_LOADED = 'true';
}

loadEnv();

module.exports = process.env;

