import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { supabaseAdmin } from '@/lib/supabase/server';
import { registrationSchema } from '@/lib/validations';
import { generateTicketId, sanitizeInput } from '@/lib/constants';
import { checkRateLimit } from '@/lib/rate-limit';
import { EVENT_CATALOG, getEventsByIds } from '@/lib/events-catalog';
import { sendTicketEmail } from '@/lib/mail-service';

type TeamRegistrationPayload = {
    event_id: string;
    team_name?: string | null;
    team_size: number;
    members: Array<{ name: string }>;
};

type DbErrorLike = {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
};

function getTeamBounds(event: {
    team_size: number;
    team_size_fixed: number | null;
    team_size_min: number | null;
    team_size_max: number | null;
}) {
    if (event.team_size_fixed && event.team_size_fixed > 0) {
        return { min: event.team_size_fixed, max: event.team_size_fixed };
    }

    if (event.team_size_min && event.team_size_max) {
        return { min: event.team_size_min, max: event.team_size_max };
    }

    if (event.team_size > 1) {
        return { min: event.team_size, max: event.team_size };
    }

    return { min: 1, max: 1 };
}

function sanitizeTeamRegistrations(payload: TeamRegistrationPayload[]) {
    return payload.map((team) => ({
        event_id: team.event_id,
        team_name: team.team_name?.trim() ? sanitizeInput(team.team_name) : null,
        team_size: team.team_size,
        members: team.members.map((member) => ({
            name: sanitizeInput(member.name),
        })),
    }));
}

function getWhatsAppConfig() {
    const phone = process.env.WHATSAPP_PAYMENT_NUMBER?.replace(/\D/g, '');
    const coordinatorName = process.env.WHATSAPP_COORDINATOR_NAME?.trim() || 'our coordinator';

    if (!phone) {
        throw new Error('WHATSAPP_PAYMENT_NUMBER is not configured');
    }

    if (!/^\d{11,15}$/.test(phone)) {
        throw new Error('WHATSAPP_PAYMENT_NUMBER must include country code and contain 11 to 15 digits');
    }

    return {
        phone,
        coordinatorName,
    };
}

function formatAmountInINR(paise: number): string {
    return `INR ${(paise / 100).toFixed(2)}`;
}

function buildWhatsAppMessage(params: {
    name: string;
    phone: string;
    email: string;
    college: string;
    year: string;
    department: string;
    ticketId: string;
    eventNames: string[];
    amountPaise: number;
}) {
    const {
        name,
        phone,
        email,
        college,
        year,
        department,
        ticketId,
        eventNames,
        amountPaise,
    } = params;

    return [
        'Hello, I would like to complete my Manthan 2K26 registration payment.',
        '',
        `Ticket ID: ${ticketId}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `College: ${college}`,
        `Year: ${year}`,
        `Department: ${department}`,
        `Selected Events: ${eventNames.join(', ') || 'N/A'}`,
        `Total Amount: ${formatAmountInINR(amountPaise)}`,
    ].join('\n');
}

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
        code: typeof candidate.code === 'string' ? candidate.code : undefined,
        message: typeof candidate.message === 'string' ? candidate.message : undefined,
        details: typeof candidate.details === 'string' ? candidate.details : undefined,
        hint: typeof candidate.hint === 'string' ? candidate.hint : undefined,
    };
}

function extractMissingColumnFromError(error: unknown): string | null {
    const parsedError = toDbErrorLike(error);
    const haystacks = [parsedError.message, parsedError.details, parsedError.hint]
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

function isTicketIdUniqueViolation(error: unknown): boolean {
    const parsedError = toDbErrorLike(error);
    const code = String(parsedError.code || '');
    const message = String(parsedError.message || '');
    const details = String(parsedError.details || '');

    if (code === '23505' && /ticket_id/i.test(`${message} ${details}`)) {
        return true;
    }

    return /duplicate key value violates unique constraint/i.test(message) && /ticket_id/i.test(`${message} ${details}`);
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIp(request);
        let allowed = true;
        try {
            const limitResult = await checkRateLimit(ip, 'create-order');
            allowed = limitResult.allowed;
        } catch (rlError) {
            console.error('Rate limit service error:', rlError);
            // We continue even if rate limiting fails to avoid blocking users
        }

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Parse and validate input
        const body = await request.json();
        console.log('Payment API Request Body:', JSON.stringify(body, null, 2));
        const validation = registrationSchema.safeParse(body);

        if (!validation.success) {
            console.error('Validation failure details:', JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
            const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
            return NextResponse.json(
                {
                    error: firstError ? `Validation error: ${firstError}` : 'Invalid input',
                    details: validation.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const {
            name,
            email,
            phone,
            college,
            year,
            department,
            event_ids,
            team_registrations = [],
        } = validation.data;

        const teamRegistrationMap = new Map(
            team_registrations.map((item) => [item.event_id, item as TeamRegistrationPayload])
        );

        // Fetch events from static catalog to calculate amount SERVER-SIDE
        console.log('Validating event IDs:', event_ids);
        const events = getEventsByIds(event_ids);

        if (!events || events.length === 0) {
            console.warn('No events found for IDs:', event_ids);
            return NextResponse.json(
                { error: 'Selected events not found or are no longer active' },
                { status: 400 }
            );
        }

        // Verify all selected events exist and are active
        if (events.length !== event_ids.length) {
            console.warn('Mismatched event count. Requested:', event_ids.length, 'Found:', events.length);
            return NextResponse.json(
                { error: 'Some selected events are invalid or inactive' },
                { status: 400 }
            );
        }

        // Validate team payload + calculate total amount SERVER-SIDE (source of truth)
        let totalAmountPaise = 0;

        for (const event of events) {
            const teamPayload = teamRegistrationMap.get(event.id);
            const bounds = getTeamBounds(event);

            let teamSize = 1;

            if (bounds.max > 1) {
                if (!teamPayload) {
                    return NextResponse.json(
                        { error: `Team details are required for "${event.name}".` },
                        { status: 400 }
                    );
                }

                teamSize = teamPayload.team_size;
                if (teamSize < bounds.min || teamSize > bounds.max) {
                    return NextResponse.json(
                        {
                            error:
                                bounds.min === bounds.max
                                    ? `"${event.name}" requires exactly ${bounds.min} participants.`
                                    : `"${event.name}" requires team size between ${bounds.min} and ${bounds.max}.`,
                        },
                        { status: 400 }
                    );
                }

                const expectedMembers = Math.max(0, teamSize);
                if ((teamPayload.members || []).length !== expectedMembers) {
                    return NextResponse.json(
                        {
                            error: `"${event.name}" requires ${expectedMembers} team member name(s).`,
                        },
                        { status: 400 }
                    );
                }
            } else if (teamPayload && teamPayload.team_size !== 1) {
                return NextResponse.json(
                    { error: `"${event.name}" is an individual event and does not accept team entries.` },
                    { status: 400 }
                );
            }

            let eventAmount = event.fee_calculation === 'per_participant' ? event.fee * teamSize : event.fee;

            // Special case for Cultural events: Solo 200, Group 400
            if (event.category === 'cultural' && (event.name === 'Ekal / Samuha Nritya (Dance)' || event.name === 'Swara Ekam / Sangam (Singing)')) {
                eventAmount = teamSize > 1 ? 40000 : 20000;
            }

            totalAmountPaise += eventAmount;
        }

        if (totalAmountPaise <= 0) {
            return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
        }

        // Generate ticket ID
        const primaryCategory = events[0]?.category || 'gen';
        let ticketId = generateTicketId(primaryCategory);
        const { phone: whatsappPhone, coordinatorName } = getWhatsAppConfig();

        const sanitizedName = sanitizeInput(name);
        const sanitizedCollege = sanitizeInput(college);
        const sanitizedDepartment = sanitizeInput(department);
        const sanitizedPhone = phone.trim();
        const sanitizedEmail = email.toLowerCase().trim();

        const eventNames = events.map((event) => event.name);

        const qrContent = `MANTHAN 2026 ENTRY PASS\n---------------------------\nTicket ID: ${ticketId}\nStatus: PAYMENT PENDING\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nPhone: ${sanitizedPhone}\nCollege: ${sanitizedCollege}\nEvents: ${eventNames.join(', ') || 'None'}\nRegistered At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n---------------------------\nPlease coordinate payment via WhatsApp.`;

        const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });

        // Store PENDING registration (not confirmed until payment verified)
        const baseInsertPayload: Record<string, unknown> = {
            ticket_id: ticketId,
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            college: sanitizedCollege,
            year,
            department: sanitizedDepartment,
            event_ids,
            team_registrations: sanitizeTeamRegistrations(team_registrations as TeamRegistrationPayload[]),
            total_amount: totalAmountPaise,
            payment_status: 'PENDING',
            qr_code: qrCodeDataUrl,
        };

        let insertError: DbErrorLike | null = null;
        let insertPayload: Record<string, unknown> = { ...baseInsertPayload };

        for (let attempt = 1; attempt <= 4; attempt++) {
            const { error } = await supabaseAdmin.from('registrations').insert(insertPayload);

            if (!error) {
                insertError = null;
                break;
            }

            insertError = toDbErrorLike(error);

            if (isTicketIdUniqueViolation(error)) {
                ticketId = generateTicketId(primaryCategory);
                insertPayload = {
                    ...insertPayload,
                    ticket_id: ticketId,
                };
                continue;
            }

            const missingColumn = extractMissingColumnFromError(error);
            if (missingColumn && Object.prototype.hasOwnProperty.call(insertPayload, missingColumn)) {
                const rest = { ...insertPayload };
                delete rest[missingColumn];
                insertPayload = rest;
                console.warn(`registrations insert retrying without missing column: ${missingColumn}`);
                continue;
            }

            break;
        }

        if (insertError) {
            console.error('Failed to create registration (Supabase Error):', insertError);
            return NextResponse.json(
                {
                    error: `Failed to create registration in database. ${insertError.message || ''}`.trim(),
                    details: insertError.message,
                },
                { status: 500 }
            );
        }

        const whatsappMessage = buildWhatsAppMessage({
            name: sanitizedName,
            phone: sanitizedPhone,
            email: sanitizedEmail,
            college: sanitizedCollege,
            year,
            department: sanitizedDepartment,
            ticketId,
            eventNames,
            amountPaise: totalAmountPaise,
        });
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(whatsappMessage)}`;

        const registeredEvents = (event_ids || [])
            .map((id: string) => {
                const event = EVENT_CATALOG.find((entry) => entry.id === id);
                return event
                    ? {
                        name: event.name,
                        venue: event.venue,
                        event_date: event.event_date,
                    }
                    : null;
            })
            .filter(Boolean) as Array<{ name: string; venue: string; event_date: string }>;

        sendTicketEmail({
            email: sanitizedEmail,
            name: sanitizedName,
            ticketId,
            qrCodeDataUrl,
            eventNames: eventNames.join(', '),
            phone: sanitizedPhone,
            college: sanitizedCollege,
            totalAmount: totalAmountPaise,
            events: registeredEvents,
            paymentStatus: 'PENDING',
            coordinatorName,
            coordinatorPhone: whatsappPhone,
        }).then((result) => {
            if (result.success) {
                console.log(`Pending ticket email sent to ${sanitizedEmail}`);
            } else {
                console.error(`Failed to send pending ticket email to ${sanitizedEmail}`, result.error);
            }
        });

        return NextResponse.json({
            ticket_id: ticketId,
            payment_status: 'PENDING',
            whatsapp_url: whatsappUrl,
            coordinator_name: coordinatorName,
            coordinator_phone: whatsappPhone,
        });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        const responseData =
            typeof err === 'object' && err !== null && 'response' in err
                ? (err as { response?: { data?: unknown } }).response?.data
                : undefined;
        console.error('Create order error details:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            response: responseData,
        });
        return NextResponse.json(
            { error: 'Internal server error. Please try again.', details: error.message },
            { status: 500 }
        );
    }
}
