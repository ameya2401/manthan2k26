import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Security check
async function verifyAdmin(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const authClient = supabaseAdmin.auth as unknown as {
        getUser?: (jwt: string) => Promise<{ data?: { user?: { id: string; email?: string | null } | null }; error?: unknown }>;
        api?: {
            getUser?: (jwt: string) => Promise<{ user?: { id: string; email?: string | null } | null; error?: unknown }>;
        };
    };

    let user: { id: string; email?: string | null } | null | undefined;

    if (authClient.getUser) {
        const { data, error } = await authClient.getUser(token);
        if (error) return null;
        user = data?.user;
    } else if (authClient.api?.getUser) {
        const { user: apiUser, error } = await authClient.api.getUser(token);
        if (error) return null;
        user = apiUser;
    }

    if (!user) return null;

    const { data: adminById } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (adminById) return adminById;

    if (!user.email) return null;

    const { data: adminByEmail } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .ilike('email', user.email)
        .maybeSingle();

    return adminByEmail;
}

function escapeCsv(field: string | number | boolean | null | undefined): string {
    if (field === null || field === undefined) return '';
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

export async function GET(request: NextRequest) {
    const admin = await verifyAdmin(request);

    // In strict environments, block unauthorized. To allow testing via direct URL if needed, you might bypass this temporarily, 
    // but returning a secure API response is best.
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized. Please login with Admin panel headers first.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get('event_name');

    // Query our new Optimized View
    let query = supabaseAdmin
        .from('organized_event_registrations_export')
        .select('*')
        .order('registration_date', { ascending: false });

    // Optional event filter
    if (eventName && eventName !== 'all') {
        query = query.ilike('event_name', `%${eventName}%`);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: 'Failed to generate export data' }, { status: 500 });
    }

    // Convert JSON array of objects to CSV
    if (!data || data.length === 0) {
        return new NextResponse("No data available to export.", { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    // Dynamic CSV generation
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add Headers
    csvRows.push(headers.map(escapeCsv).join(','));

    // Add Body
    data.forEach((row) => {
        const rowValues = headers.map(header => escapeCsv(row[header]));
        csvRows.push(rowValues.join(','));
    });

    const csvContent = csvRows.join('\n');

    const headersList = new Headers();
    headersList.set('Content-Type', 'text/csv; charset=utf-8');
    headersList.set('Content-Disposition', `attachment; filename="manthan_registrations_${new Date().toISOString().slice(0, 10)}.csv"`);

    return new NextResponse(csvContent, { status: 200, headers: headersList });
}
