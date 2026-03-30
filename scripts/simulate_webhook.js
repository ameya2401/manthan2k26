const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// --- Configuration ---
// 1. URL of your deployed application or local server
const SERVER_URL = process.env.SIMULATE_WEBHOOK_SERVER_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// 2. The webhook secret configured in .env.local
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// 3. The Order ID and Payment ID for simulation
const ORDER_ID = process.env.SIMULATE_WEBHOOK_ORDER_ID || '';
const PAYMENT_ID = process.env.SIMULATE_WEBHOOK_PAYMENT_ID || '';

if (!WEBHOOK_SECRET || !ORDER_ID || !PAYMENT_ID) {
    console.error('Missing required values. Set RAZORPAY_WEBHOOK_SECRET, SIMULATE_WEBHOOK_ORDER_ID, and SIMULATE_WEBHOOK_PAYMENT_ID in .env.local');
    process.exit(1);
}

// --- Script ---
async function simulateWebhook() {
    console.log(`Simulating Razorpay Webhook for Order: ${ORDER_ID}...`);

    const payload = {
        entity: "event",
        account_id: "acc_XXXXXXXXXX",
        event: "payment.captured",
        contains: ["payment"],
        payload: {
            payment: {
                entity: {
                    id: PAYMENT_ID,
                    entity: "payment",
                    amount: 50000,
                    currency: "INR",
                    status: "captured",
                    order_id: ORDER_ID,
                    method: "upi",
                }
            }
        },
        created_at: Math.floor(Date.now() / 1000)
    };

    const body = JSON.stringify(payload);

    // Generate Signature
    const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

    try {
        const response = await fetch(`${SERVER_URL}/api/payment/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-razorpay-signature': signature
            },
            body: body
        });

        const data = await response.json();
        console.log(`Status Code:`, response.status);
        console.log(`Response:`, data);

        if (response.ok) {
            console.log("\n✅ Success! The registration was updated to PAID and the ticket email was sent.");
        } else {
            console.error("\n❌ Webhook simulation failed. Check the server logs.");
        }
    } catch (error) {
        console.error("Error making request:", error);
    }
}

simulateWebhook();
