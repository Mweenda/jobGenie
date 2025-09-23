/**
 * Environment configuration for JobGenie
 * Centralizes all environment variables and provides type safety
 */

interface Config {
  isDevelopment: boolean
  isProduction: boolean
  apiUrl: string
  supabaseUrl?: string
  supabaseAnonKey?: string
  appUrl: string
  version: string
}

export const config: Config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
}

// Validate required environment variables in production
if (config.isProduction) {
  const requiredVars = ['VITE_API_URL']
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
}

export default config