import { type FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  const envPath = path.resolve(process.cwd(), '.env.test');
  
  if (fs.existsSync(envPath)) {
    console.log('🌍 Global Setup: Loading .env.test safely...');
    const envParams = dotenv.parse(fs.readFileSync(envPath));
    
    for (const k in envParams) {
      if (k !== 'PLAYWRIGHT_BROWSERS_PATH') {
        process.env[k] = envParams[k];
      }
    }
  }
}

export default globalSetup;
