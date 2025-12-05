import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Safely load .env.test, excluding conflicting PLAYWRIGHT_BROWSERS_PATH
// This file should be imported at the top of playwright.config.ts

const envPath = path.resolve(process.cwd(), '.env.test');

if (fs.existsSync(envPath)) {
  console.log('🌍 Loading .env.test safely...');
  const envParams = dotenv.parse(fs.readFileSync(envPath));
  
  for (const k in envParams) {
    if (k !== 'PLAYWRIGHT_BROWSERS_PATH') {
      process.env[k] = envParams[k];
    }
  }
}
