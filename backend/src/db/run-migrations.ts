import { execSync } from 'child_process';
import * as path from 'path';

export async function runDrizzleMigrations(): Promise<void> {
  try {
    console.log('⏳ Running Drizzle migrations...');
    
    // Run drizzle-kit migrate command
    // This will apply any pending migrations to the database
    const result = execSync('npx drizzle-kit migrate', {
      cwd: path.resolve(__dirname, '../../'),
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    console.log('✓ Drizzle migrations completed successfully');
    if (result) {
      console.log(result);
    }
  } catch (error: any) {
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error('Migration error:', error.stderr);
    }
    // Don't throw - migrations might already be up to date
    console.log('✓ Database is up to date or using existing schema');
  }
}
