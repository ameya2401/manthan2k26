const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceResetViewer() {
  const email = process.env.VIEWER_ACCOUNT_EMAIL || '';
  const password = process.env.VIEWER_ACCOUNT_PASSWORD || '';
  const name = process.env.VIEWER_ACCOUNT_NAME || 'Manthan Viewer';

  if (!email || !password) {
    throw new Error('VIEWER_ACCOUNT_EMAIL and VIEWER_ACCOUNT_PASSWORD are required in .env.local');
  }

  console.log(`Force resetting account: ${email}...`);

  // 1. Get the user ID from Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existingUser = users.find(u => u.email === email);
  let userId;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`Found existing user ID: ${userId}. Updating password...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password });
    if (updateError) throw updateError;
  } else {
    console.log(`User not found. Creating new...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });
    if (authError) throw authError;
    userId = authData.user.id;
  }

  // 2. Upsert into admin_users table
  console.log(`Ensuring permissions in admin_users table...`);
  const { data, error: dbError } = await supabase
    .from('admin_users')
    .upsert({
      id: userId,
      email,
      name,
      role: 'viewer'
    }, { onConflict: 'email' })
    .select();

  if (dbError) {
    if (dbError.message.includes('violates check constraint')) {
      console.error('\n❌ ERROR: Database rejected the "viewer" role.');
      console.error('Please make sure you have run the SQL in add_viewer_role.sql in your Supabase SQL Editor!');
    } else {
      throw dbError;
    }
    return;
  }

  console.log('\n✅ SUCCESS!');
  console.log('-----------------------------------');
  console.log(`Email: ${email}`);
  console.log('Password: [reset from VIEWER_ACCOUNT_PASSWORD]');
  console.log('Role: viewer');
  console.log('-----------------------------------');
  console.log('You can now log in at /admin');
}

forceResetViewer().catch(err => console.error('Error:', err.message));
