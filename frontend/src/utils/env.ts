export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};
