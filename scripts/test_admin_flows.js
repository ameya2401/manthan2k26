const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function testAdminFlows() {
    const baseUrl = 'http://localhost:3000';
    console.log('--- Testing Admin API & Dashboard Flows ---');

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const supabaseAnon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // 1. Get admin users from table
    const { data: adminUsers } = await supabaseAdmin.from('admin_users').select('*');
    console.log('Admin users found:', adminUsers.map(a => `${a.email} (${a.role})`));

    // Ensure a test admin has a known password in auth for login testing
    const testEmail = process.env.ADMIN_ACCOUNT_EMAIL || 'admin@manthan.in';
    const testPass = process.env.ADMIN_ACCOUNT_PASSWORD || 'manthan@2026';

    // Update or create user in Supabase Auth
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === testEmail);
    let authUserId = existingUser?.id;

    if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password: testPass, email_confirm: true });
        console.log(`✓ Password updated for ${testEmail}`);
    } else {
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email: testEmail,
            password: testPass,
            email_confirm: true,
            user_metadata: { name: 'Manthan Admin' }
        });
        if (createErr) console.error('Error creating admin auth user:', createErr);
        authUserId = created?.user?.id;
    }

    if (authUserId) {
        await supabaseAdmin.from('admin_users').upsert({
            id: authUserId,
            email: testEmail,
            name: 'Manthan Admin',
            role: 'admin'
        }, { onConflict: 'email' });
    }

    // 2. Test Admin Login API Route (POST /api/admin/login)
    console.log('\n[1] Testing Admin Login (POST /api/admin/login)...');
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPass })
    });

    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.access_token) {
        console.log(`  ✓ Login successful! Role: ${loginData.user?.role}, Name: ${loginData.user?.name}`);
    } else {
        console.error('  ✗ Login failed:', loginData);
        return;
    }

    const token = loginData.access_token;
    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 3. Test Admin Stats (GET /api/admin/stats)
    console.log('\n[2] Testing Admin Stats (GET /api/admin/stats)...');
    const statsRes = await fetch(`${baseUrl}/api/admin/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    if (statsRes.status === 200) {
        console.log(`  ✓ Stats fetched successfully:`, statsData.stats);
    } else {
        console.error('  ✗ Stats failed:', statsData);
    }

    // 4. Test Admin Registrations List & Filters (GET /api/admin/registrations)
    console.log('\n[3] Testing Admin Registrations (GET /api/admin/registrations)...');
    const regRes = await fetch(`${baseUrl}/api/admin/registrations?page=1&limit=10`, { headers: authHeaders });
    const regData = await regRes.json();
    if (regRes.status === 200) {
        console.log(`  ✓ Registrations fetched successfully. Total: ${regData.total}, Page Count: ${regData.registrations?.length}`);
    } else {
        console.error('  ✗ Registrations failed:', regData);
    }

    // 5. Test Cash Payment Verification on a Pending Registration
    console.log('\n[4] Testing Cash Payment Recording (POST /api/admin/cash-payment)...');
    const pendingReg = regData.registrations?.find(r => r.payment_status === 'PENDING');
    if (pendingReg) {
        const cashRes = await fetch(`${baseUrl}/api/admin/cash-payment`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                registration_id: pendingReg.id,
                cash_amount: pendingReg.total_amount,
                cash_receipt_number: 'RCPT-TEST-001',
                cash_notes: 'Paid cash at registration desk'
            })
        });
        const cashData = await cashRes.json();
        if (cashRes.status === 200 && cashData.success) {
            console.log(`  ✓ Successfully recorded cash payment for ticket ${pendingReg.ticket_id}!`);
        } else {
            console.error('  ✗ Cash payment failed:', cashData);
        }

        // 6. Test Check-in for the newly Paid Registration (POST /api/admin/check-in/[id])
        console.log(`\n[5] Testing Check-in for Ticket ${pendingReg.ticket_id}...`);
        const checkInRes = await fetch(`${baseUrl}/api/admin/check-in/${pendingReg.id}`, {
            method: 'POST',
            headers: authHeaders
        });
        const checkInData = await checkInRes.json();
        if (checkInRes.status === 200 && checkInData.success) {
            console.log(`  ✓ Successfully checked in ticket ${pendingReg.ticket_id}!`);
        } else {
            console.error('  ✗ Check-in failed:', checkInData);
        }

        // 7. Test Undo Check-in (PATCH /api/admin/check-in/[id])
        console.log(`\n[6] Testing Undo Check-in for Ticket ${pendingReg.ticket_id}...`);
        const undoRes = await fetch(`${baseUrl}/api/admin/check-in/${pendingReg.id}`, {
            method: 'PATCH',
            headers: authHeaders
        });
        const undoData = await undoRes.json();
        if (undoRes.status === 200 && undoData.success) {
            console.log(`  ✓ Successfully undid check-in for ticket ${pendingReg.ticket_id}!`);
        } else {
            console.error('  ✗ Undo check-in failed:', undoData);
        }
    } else {
        console.log('  Note: No pending registrations available for cash testing.');
    }

    // 8. Test CSV Export (GET /api/admin/export)
    console.log('\n[7] Testing Admin CSV Export (GET /api/admin/export)...');
    const exportRes = await fetch(`${baseUrl}/api/admin/export`, { headers: authHeaders });
    if (exportRes.status === 200) {
        const csvText = await exportRes.text();
        const lineCount = csvText.split('\n').length;
        console.log(`  ✓ CSV Export successful! Content-Type: ${exportRes.headers.get('content-type')}, Lines: ${lineCount}`);
        console.log(`    Header sample: ${csvText.split('\n')[0]}`);
    } else {
        console.error('  ✗ CSV Export failed:', exportRes.status);
    }

    console.log('\n--- Admin Flow Testing Completed Successfully ---');
}

testAdminFlows();
