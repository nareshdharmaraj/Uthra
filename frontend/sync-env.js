const fs = require('fs');
const path = require('path');

// Read root .env file
const rootEnvPath = path.join(__dirname, '..', '.env');
const frontendEnvPath = path.join(__dirname, '.env.local');

if (fs.existsSync(rootEnvPath)) {
  const rootEnv = fs.readFileSync(rootEnvPath, 'utf8');
  
  // Extract React app environment variables from root .env
  const reactEnvVars = rootEnv
    .split('\n')
    .filter(line => line.trim() && line.startsWith('REACT_APP_') && !line.startsWith('#'))
    .join('\n');

  if (reactEnvVars) {
    // Create clean .env.local with only React app variables
    const cleanEnv = '# Environment variables from root .env\n' + reactEnvVars;
    
    // Write to .env.local (overwrite to avoid duplicates)
    fs.writeFileSync(frontendEnvPath, cleanEnv);
    
    console.log('✅ Environment variables copied from root .env to frontend/.env.local');
    console.log('📋 Copied variables:', reactEnvVars.split('\n').filter(line => line.trim()));
  } else {
    console.log('⚠️ No REACT_APP_ variables found in root .env');
  }
} else {
  console.log('❌ Root .env file not found');
}