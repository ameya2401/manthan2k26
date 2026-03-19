const crypto = require('crypto');

// --- Configuration ---
// 1. URL of your deployed application or local server
const SERVER_URL = 'http://localhost:3000'; // Change to production URL if needed 

// 2. The webhook secret you configured in .env.local (RAZORPAY_WEBHOOK_SECRET)
const WEBHOOK_SECRET = 'your_webhook_secret_here'; 

// 3. The Order ID and Payment ID of the person who missed their pass
const ORDER_ID = 'order_XXXXXXXXXX'; 
const PAYMENT_ID = 'pay_XXXXXXXXXX';

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
