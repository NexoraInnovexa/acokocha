import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xpwbhvtizeozplxphpri.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2JodnRpemVvenBseHBocHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjE3NDYsImV4cCI6MjA3NjM5Nzc0Nn0.OLssexGt8gG1O2vEbs0wfUME1lDxdAe3gXTEpl2j-5g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
