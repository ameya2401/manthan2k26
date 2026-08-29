const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runE2E() {
    const baseUrl = 'http://localhost:3000';
    console.log('--- Starting Manthan 2026 E2E Flow Testing ---');

    // 1. Fetch Events
    console.log('\n[1] Fetching Event Catalog...');
    const eventsRes = await fetch(`${baseUrl}/api/events`);
    const eventsData = await eventsRes.json();
    const events = eventsData.events || [];
    console.log(`✓ Fetched ${events.length} active events.`);

    const soloEvent = events.find(e => e.team_size === 1 || e.team_size_fixed === 1);
    const teamEvent = events.find(e => (e.team_size > 1 || (e.team_size_min && e.team_size_min > 1) || (e.team_size_fixed && e.team_size_fixed > 1)));

    console.log(`  Selected Solo Event: "${soloEvent?.name}" (ID: ${soloEvent?.id}, Fee: ₹${(soloEvent?.fee||0)/100})`);
    console.log(`  Selected Team Event: "${teamEvent?.name}" (ID: ${teamEvent?.id}, Fee: ₹${(teamEvent?.fee||0)/100})`);

    // 2. Test Solo Registration
    console.log('\n[2] Testing Solo Registration Flow (POST /api/payment/create-order)...');
    const soloPayload = {
        name: 'Aarav Patel',
        email: 'aarav.patel@testmail.com',
        phone: '9820112233',
        college: 'BVIMIT Navi Mumbai',
        year: 'UG',
        department: 'Information Technology',
        event_ids: [soloEvent.id],
        team_registrations: []
    };

    const soloOrderRes = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soloPayload)
    });

    const soloOrderData = await soloOrderRes.json();
    let soloTicketId = null;
    if (soloOrderRes.status === 200 && soloOrderData.ticket_id) {
        soloTicketId = soloOrderData.ticket_id;
        console.log(`  ✓ Solo Registration successful! Ticket ID: ${soloTicketId}`);
        console.log(`    Payment Status: ${soloOrderData.payment_status}`);
        console.log(`    WhatsApp URL generated: ${soloOrderData.whatsapp_url ? 'YES' : 'NO'}`);
        console.log(`    Coordinator: ${soloOrderData.coordinator_name} (${soloOrderData.coordinator_phone})`);
    } else {
        console.error(`  ✗ Solo Registration failed:`, soloOrderData);
    }

    // 3. Test Registration Lookup for Solo Ticket
    if (soloTicketId) {
        console.log('\n[3] Testing Ticket Lookup (GET /api/registration/[ticketId])...');
        const ticketRes = await fetch(`${baseUrl}/api/registration/${soloTicketId}`);
        const ticketData = await ticketRes.json();
        if (ticketRes.status === 200 && ticketData.registration) {
            console.log(`  ✓ Found registration for ${ticketData.registration.name}`);
            console.log(`    Events: ${ticketData.events?.map(e => e.name).join(', ')}`);
            console.log(`    Amount: ₹${ticketData.registration.total_amount / 100}`);
            console.log(`    Status: ${ticketData.registration.payment_status}`);
        } else {
            console.error(`  ✗ Ticket lookup failed:`, ticketData);
        }
    }

    // 4. Test Team Registration
    if (teamEvent) {
        console.log('\n[4] Testing Team Registration Flow...');
        const teamSize = teamEvent.team_size_fixed || teamEvent.team_size_min || teamEvent.team_size || 4;
        const members = [{ name: 'Priya Sen' }];
        for (let i = 2; i <= teamSize; i++) {
            members.push({ name: `Teammate ${i}` });
        }

        const teamPayload = {
            name: 'Priya Sen',
            email: 'priya.sen@testmail.com',
            phone: '9833445566',
            college: 'DY Patil College',
            year: 'PG',
            department: 'Computer Applications',
            event_ids: [teamEvent.id],
            team_registrations: [
                {
                    event_id: teamEvent.id,
                    team_name: 'Code Ninjas',
                    team_size: teamSize,
                    members: members
                }
            ]
        };

        const teamOrderRes = await fetch(`${baseUrl}/api/payment/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teamPayload)
        });

        const teamOrderData = await teamOrderRes.json();
        if (teamOrderRes.status === 200 && teamOrderData.ticket_id) {
            console.log(`  ✓ Team Registration successful! Ticket ID: ${teamOrderData.ticket_id}`);
            console.log(`    Payment Status: ${teamOrderData.payment_status}`);
            console.log(`    WhatsApp URL: ${teamOrderData.whatsapp_url ? 'YES' : 'NO'}`);
        } else {
            console.error(`  ✗ Team Registration failed:`, teamOrderData);
        }
    }

    // 5. Test Admin Accounts & Authentication
    console.log('\n[5] Testing Admin Accounts & Authentication...');
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: adminRows, error: adminErr } = await supabaseAdmin.from('admin_users').select('*');
    if (adminErr) {
        console.error('  ✗ Error querying admin_users:', adminErr.message);
    } else {
        console.log(`  ✓ Registered admin_users in DB (${adminRows.length} accounts):`);
        adminRows.forEach(a => console.log(`    - [${a.role}] ${a.email} (${a.name})`));
    }

    // Check stats endpoint if token available
    console.log('\n--- Manthan 2026 E2E Flow Testing Completed ---');
}

runE2E();
