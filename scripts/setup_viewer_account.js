const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createViewerUser(email, password, name) {
  console.log(`Creating viewer user: ${email}...`);

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log(`User ${email} already exists in Auth. Checking database...`);
      // Fallback: try to find the user by email
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const existingUser = users.find(u => u.email === email);
      if (!existingUser) throw new Error('User reported as existing but not found in list.');

      await updateAdminTable(existingUser.id, email, name);
      return;
    }
    throw authError;
  }

  const userId = authData.user.id;
  console.log(`Created Auth user with ID: ${userId}`);

  // 2. Add to admin_users table with 'viewer' role
  await updateAdminTable(userId, email, name);
}

async function updateAdminTable(id, email, name) {
  const { data, error } = await supabase
    .from('admin_users')
    .upsert({
      id,
      email,
      name,
      role: 'viewer'
    }, { onConflict: 'email' })
    .select();

  if (error) throw error;

  console.log('Successfully added to admin_users table as viewer:', data[0]);
}

// Define the viewer account
const viewerAccount = {
  email: 'viewer@manthan.in',
  password: 'viewmanthan2026', // They can change this later if they have access to SQL
  name: 'Manthan Viewer'
};

async function main() {
  try {
    await createViewerUser(viewerAccount.email, viewerAccount.password, viewerAccount.name);
    console.log('\nViewer account generated successfully!');
    console.log('-----------------------------------');
    console.log(`Email: ${viewerAccount.email}`);
    console.log(`Password: ${viewerAccount.password}`);
    console.log('-----------------------------------');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
