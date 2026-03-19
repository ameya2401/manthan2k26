const { createClient } = require('@supabase/supabase-js');
const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const brevoApiKey = process.env.BREVO_API_KEY;
const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;
const brevoSenderName = process.env.BREVO_SENDER_NAME || "Manthan 2k26 Team";

if (!supabaseUrl || !supabaseServiceRole || !razorpayKeyId || !razorpayKeySecret) {
    console.error("❌ Missing required environment variables in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);
const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret
});

// Since we can't easily import the catalog or mail-service due to ESM/TS mismatch in a quick script,
// we will recreate the essential logic here for absolute safety.

const EVENT_CATALOG = [
    { id: '10000000-0000-0000-0000-000000000001', name: 'VantraSutra' },
    { id: '10000000-0000-0000-0000-000000000002', name: 'Akshar Vedha' },
    { id: '10000000-0000-0000-0000-000000000003', name: 'Gyansabha' },
    { id: '10000000-0000-0000-0000-000000000004', name: 'Rachnatmak Kala' },
    { id: '10000000-0000-0000-0000-000000000006', name: 'Dance' },
    { id: '10000000-0000-0000-0000-000000000007', name: 'Singing' },
    { id: '20000000-0000-0000-0000-000000000001', name: 'Badminton' },
    { id: '20000000-0000-0000-0000-000000000002', name: 'Box Cricket' },
    { id: '20000000-0000-0000-0000-000000000003', name: 'Volleyball' },
    { id: '20000000-0000-0000-0000-000000000004', name: 'Tug of war' },
    { id: '20000000-0000-0000-0000-000000000005', name: 'Chess' },
    { id: '20000000-0000-0000-0000-000000000006', name: 'Carrom' },
    { id: '20000000-0000-0000-0000-000000000007', name: 'Ludo' },
    { id: '20000000-0000-0000-0000-000000000008', name: 'BGMI' },
    { id: '20000000-0000-0000-0000-000000000009', name: 'Deadlift' },
    { id: '20000000-0000-0000-0000-000000000010', name: 'Bench Press' },
];

async function sendEmailViaBrevo(details) {
    // Instead of using jsPDF here (which might be complex to setup in standalone node),
    // we will hit the existing webhook or verify endpoint if possible, 
    // OR we can just use the Brevo API directly with a simplified HTML.
    // However, the best way to "reproduce" the exact ticket is to trigger the live webhook.
    
    // BUT since we want to be safe, we'll just use the already working WEBHOOK route 
    // by simulating a call to it! This ensures the user gets the PERFECT ticket.
    
    const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(details.payload))
        .digest('hex');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
        const response = await fetch(`${baseUrl}/api/payment/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-razorpay-signature': signature
            },
            body: JSON.stringify(details.payload)
        });
        return response.ok;
    } catch (e) {
        console.error("Error triggering webhook:", e.message);
        return false;
    }
}

const crypto = require('crypto');

async function reconcile() {
    console.log("🚀 Starting Reconciliation Process...");

    // 1. Get all pending registrations with order IDs
    const { data: pendings, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('payment_status', 'PENDING')
        .not('razorpay_order_id', 'is', null);

    if (error) {
        console.error("❌ Failed to fetch pending registrations:", error);
        return;
    }

    console.log(`Found ${pendings.length} pending registrations to check.`);

    let fixedCount = 0;

    for (const reg of pendings) {
        process.stdout.write(`Checking Ticket ${reg.ticket_id} (Order: ${reg.razorpay_order_id})... `);

        try {
            // 2. Fetch payments for this order from Razorpay
            const payments = await razorpay.orders.fetchPayments(reg.razorpay_order_id);
            
            // 3. Check if any payment is 'captured'
            const successfulPayment = payments.items.find(p => p.status === 'captured');

            if (successfulPayment) {
                console.log(`✅ PAID! (Payment ID: ${successfulPayment.id})`);
                
                // 4. Trigger the Webhook logic to fix it (Safest way: it reuses all logic)
                const payload = {
                    event: "payment.captured",
                    payload: {
                        payment: {
                            entity: {
                                id: successfulPayment.id,
                                order_id: reg.razorpay_order_id,
                                status: "captured"
                            }
                        }
                    }
                };

                const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
                const signature = crypto
                    .createHmac('sha256', webhookSecret)
                    .update(JSON.stringify(payload))
                    .digest('hex');

                // We hit the production URL if possible, otherwise local
                const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                
                const response = await fetch(`${appUrl}/api/payment/webhook`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-razorpay-signature': signature
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log(`   Successfully fixed and emailed Ticket ${reg.ticket_id}`);
                    fixedCount++;
                } else {
                    const errText = await response.text();
                    console.log(`   ❌ Failed to trigger fix: ${errText}`);
                }
            } else {
                console.log(`⏳ Still Pending.`);
            }
        } catch (err) {
            console.log(`❌ Error checking Razorpay: ${err.message}`);
        }

        // Add a small delay to be gentle
        await new Promise(r => setTimeout(r, 500));
    }

    console.log("\n--- Reconciliation Summary ---");
    console.log(`Total Checked: ${pendings.length}`);
    console.log(`Total Fixed:   ${fixedCount}`);
    console.log("-------------------------------");
}

reconcile();
