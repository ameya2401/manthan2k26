import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { supabaseAdmin } from '@/lib/supabase/server';
import { EVENT_CATALOG } from '@/lib/events-catalog';
import { sendTicketEmail } from '@/lib/mail-service';

type DbErrorLike = {
    message?: string;
    details?: string;
    hint?: string;
};

// Simplified parser to extract column from error when doing compat updates
function toDbErrorLike(error: unknown): DbErrorLike {
    if (!error || typeof error !== 'object') {
        return {};
    }

    const candidate = error as Record<string, unknown>;
    return {
        message: typeof candidate.message === 'string' ? candidate.message : undefined,
        details: typeof candidate.details === 'string' ? candidate.details : undefined,
        hint: typeof candidate.hint === 'string' ? candidate.hint : undefined,
    };
}

function extractMissingColumnFromError(error: unknown): string | null {
    const parsed = toDbErrorLike(error);
    const haystacks = [parsed.message, parsed.details, parsed.hint]
        .filter(Boolean)
        .map((value) => String(value));

    for (const text of haystacks) {
        const relationMatch = text.match(/column\s+["']?([a-zA-Z_][a-zA-Z0-9_]*)["']?\s+of\s+relation\s+["']?registrations["']?\s+does\s+not\s+exist/i);
        if (relationMatch?.[1]) {
            return relationMatch[1];
        }

        const schemaCacheMatch = text.match(/Could not find the ['"]([a-zA-Z_][a-zA-Z0-9_]*)['"] column of ['"]registrations['"] in the schema cache/i);
        if (schemaCacheMatch?.[1]) {
            return schemaCacheMatch[1];
        }
    }

    return null;
}

async function updateRegistrationWithCompat(
    where: { id?: string; razorpay_order_id?: string },
    payload: Record<string, unknown>
) {
    let updatePayload = { ...payload };
    let lastError: DbErrorLike | null = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
        let query = supabaseAdmin.from('registrations').update(updatePayload);
        if (where.id) {
            query = query.eq('id', where.id);
        }
        if (where.razorpay_order_id) {
            query = query.eq('razorpay_order_id', where.razorpay_order_id);
        }

        const { error } = await query;
        if (!error) {
            return null;
        }

        lastError = toDbErrorLike(error);
        const missingColumn = extractMissingColumnFromError(error);
        if (missingColumn && Object.prototype.hasOwnProperty.call(updatePayload, missingColumn)) {
            const rest = { ...updatePayload };
            delete rest[missingColumn];
            updatePayload = rest;
            continue;
        }

        break;
    }

    return lastError;
}

export async function POST(request: NextRequest) {
    try {
        const bodyText = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not set');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(bodyText)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('Webhook signature mismatch');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        let event;
        try {
            event = JSON.parse(bodyText);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        console.log(`Received Razorpay webhook event: ${event.event}`);

        // We specifically listen to payment.captured or order.paid
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            let razorpay_order_id = null;
            let razorpay_payment_id = null;

            if (event.event === 'payment.captured') {
                const paymentInfo = event.payload.payment.entity;
                razorpay_order_id = paymentInfo.order_id;
                razorpay_payment_id = paymentInfo.id;
            } else if (event.event === 'order.paid') {
                const orderInfo = event.payload.order.entity;
                const paymentInfo = event.payload.payment?.entity; // Could be available
                razorpay_order_id = orderInfo.id;
                razorpay_payment_id = paymentInfo?.id || 'fetched-via-webhook'; // Webhook fallback
            }

            if (!razorpay_order_id) {
                return NextResponse.json({ success: true, message: 'Skipped - no order ID found' });
            }

            // Find the pending registration
             const { data: registration, error: findError } = await supabaseAdmin
             .from('registrations')
             .select('*')
             .eq('razorpay_order_id', razorpay_order_id)
             .single();
 
            if (findError || !registration) {
                 return NextResponse.json({ success: true, message: 'Registration not found' });
            }

            if (registration.payment_status === 'PAID') {
                console.log(`Registration with order ${razorpay_order_id} is already PAID. Webhook skipping.`);
                return NextResponse.json({ success: true, message: 'Already processed' });
            }

            // Generate QR code and mark as PAID
            let qrCodeDataUrl = null;
            let eventNames = "";
            try {
                eventNames = (registration.event_ids || [])
                    .map((id: string) => EVENT_CATALOG.find((e) => e.id === id)?.name)
                    .filter(Boolean)
                    .join(', ');

                const qrContent = `MANTHAN 2026 ENTRY PASS
---------------------------
Ticket ID: ${registration.ticket_id}
Payment ID: ${razorpay_payment_id}
Name: ${registration.name}
Email: ${registration.email}
Phone: ${registration.phone}
College: ${registration.college}
Events: ${eventNames || 'None'}
Registered At: ${new Date(registration.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
---------------------------
Pass Status: VERIFIED & PAID`;

                qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff',
                    },
                });
            } catch (qrError) {
                console.error('Webhook QR generation failed:', qrError);
            }

            // Update registration: mark as PAID and store payment details
            const updateError = await updateRegistrationWithCompat(
                { id: registration.id },
                {
                    payment_status: 'PAID',
                    razorpay_payment_id,
                    qr_code: qrCodeDataUrl,
                    updated_at: new Date().toISOString(),
                }
            );

            if (updateError) {
                 console.error('Webhook failed to update registration:', updateError);
                 return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
            }

            // SEND TICKET VIA EMAIL
            if (qrCodeDataUrl) {
                try {
                    const registeredEvents = (registration.event_ids || [])
                        .map((id: string) => {
                            const event = EVENT_CATALOG.find((e) => e.id === id);
                            return event ? {
                                name: event.name,
                                venue: event.venue,
                                event_date: event.event_date
                            } : null;
                        })
                        .filter(Boolean);

                    sendTicketEmail({
                        email: registration.email,
                        name: registration.name,
                        ticketId: registration.ticket_id,
                        qrCodeDataUrl: qrCodeDataUrl,
                        eventNames: eventNames,
                        phone: registration.phone || "N/A",
                        college: registration.college || "N/A",
                        totalAmount: `₹${registration.total_amount || 0}`,
                        events: registeredEvents as Array<{ name: string; venue: string; event_date: string }>,
                    }).then(result => {
                        if (result.success) {
                            console.log(`✅ Webhook event pass email sent to ${registration.email}`);
                        } else {
                            console.error(`❌ Webhook failed to send email to ${registration.email}:`, result.error);
                        }
                    });
                } catch (emailTriggerError) {
                    console.error("Critical error triggering webhook email send:", emailTriggerError);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Webhook processing error:', err);
        return NextResponse.json(
            { error: 'Internal server error while processing webhook.' },
            { status: 500 }
        );
    }
}
