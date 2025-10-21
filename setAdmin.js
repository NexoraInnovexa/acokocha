import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xpwbhvtizeozplxphpri.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwd2JodnRpemVvenBseHBocHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgyMTc0NiwiZXhwIjoyMDc2Mzk3NzQ2fQ.QKsrGJmh1JWNiYdkvvSMSh915Xxm8JfhsHsqy5t4qbE');

const setAdminRole = async (userId) => {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin' },
  });

  if (error) console.error('Error:', error.message);
  else console.log('Admin role set:', data);
};

// Replace with your admin user's ID
setAdminRole('4a13bee9-2905-4f11-b0fe-8cab74dcecb7');
// node setAdmin.js
