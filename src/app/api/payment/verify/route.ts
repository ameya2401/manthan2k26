import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { supabaseAdmin } from '@/lib/supabase/server';
import { EVENT_CATALOG } from '@/lib/events-catalog';
import { paymentVerificationSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendTicketEmail } from '@/lib/mail-service';

type DbErrorLike = {
    message?: string;
    details?: string;
    hint?: string;
};

function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    return request.headers.get('x-real-ip') || 'unknown';
}

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
        // Rate limiting
        const ip = getClientIp(request);
        const { allowed } = await checkRateLimit(ip, 'verify-payment');
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse and validate input
        const body = await request.json();
        const validation = paymentVerificationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid payment data', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

        // CRITICAL: Verify Razorpay signature using HMAC SHA256
        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay secret is not configured');
        }

        const body_text = razorpay_order_id + '|' + razorpay_payment_id;
        const expected_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body_text)
            .digest('hex');

        if (expected_signature !== razorpay_signature) {
            console.error('Payment signature verification failed', {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
            });

            // Mark as failed
            await updateRegistrationWithCompat(
                { razorpay_order_id },
                { payment_status: 'FAILED' }
            );

            return NextResponse.json(
                { error: 'Payment verification failed. Signature mismatch.' },
                { status: 400 }
            );
        }

        // Find the pending registration
        const { data: registration, error: findError } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .eq('razorpay_order_id', razorpay_order_id)
            .eq('payment_status', 'PENDING')
            .single();

        if (findError || !registration) {
            return NextResponse.json(
                { error: 'Registration not found or already processed.' },
                { status: 404 }
            );
        }

        // Generate QR code with detailed information
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
            console.error('QR generation failed:', qrError);
        }

        // Update registration: mark as PAID and store payment details
        const updateError = await updateRegistrationWithCompat(
            { id: registration.id },
            {
                payment_status: 'PAID',
                razorpay_payment_id,
                razorpay_signature,
                qr_code: qrCodeDataUrl,
                updated_at: new Date().toISOString(),
            }
        );

        if (updateError) {
            console.error('Failed to update registration:', updateError);
            return NextResponse.json(
                {
                    error: `Failed to confirm registration. ${updateError.message || 'Contact support with your payment ID.'}`.trim(),
                },
                { status: 500 }
            );
        }

        // NEW: SEND TICKET VIA EMAIL
        if (qrCodeDataUrl) {
            try {
                // Get full event details for the email and pass
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

                // We fire this asynchronously so the user doesn't wait for email delivery to see success screen
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
                        console.log(`✅ Event pass email sent to ${registration.email}`);
                    } else {
                        console.error(`❌ Failed to send email to ${registration.email}:`, result.error);
                    }
                });
            } catch (emailTriggerError) {
                console.error("Critical error triggering email send:", emailTriggerError);
            }
        }

        return NextResponse.json({
            success: true,
            ticket_id: registration.ticket_id,
            message: 'Payment verified and registration confirmed!',
        });
    } catch (err) {
        console.error('Verify payment error:', err);
        return NextResponse.json(
            { error: 'Internal server error. Please contact support.' },
            { status: 500 }
        );
    }
}
