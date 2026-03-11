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

    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Registrations paid via Cash
    const { data: cashRegistrations, error: regError } = await supabaseAdmin
        .from('registrations')
        .select('ticket_id, name, phone, email, cash_amount, total_amount, cash_receipt_number, cash_received_by, cash_received_at, cash_notes')
        .eq('payment_method', 'cash')
        .eq('payment_status', 'PAID')
        .order('cash_received_at', { ascending: false });

    // 2. Fetch Manual Cash Entries
    const { data: manualEntries, error: manualError } = await supabaseAdmin
        .from('manual_cash_entries')
        .select('*')
        .order('collected_at', { ascending: false });

    if (regError || manualError) {
        return NextResponse.json({ error: 'Failed to fetch cash entries' }, { status: 500 });
    }

    const rows: Record<string, string>[] = [];

    // Add Cash Registrations to rows
    (cashRegistrations || []).forEach(reg => {
        rows.push({
            'Type': 'Registration',
            'Ticket ID': reg.ticket_id,
            'Name/Payer': reg.name,
            'Phone': reg.phone,
            'Email': reg.email,
            'Amount (INR)': ((reg.cash_amount ?? reg.total_amount) / 100).toFixed(2),
            'Receipt #': reg.cash_receipt_number || '',
            'Collector': reg.cash_received_by || '',
            'Date/Time': reg.cash_received_at ? new Date(reg.cash_received_at).toLocaleString('en-IN') : '',
            'Notes': reg.cash_notes || ''
        });
    });

    // Add Manual Entries to rows
    (manualEntries || []).forEach(entry => {
        rows.push({
            'Type': 'Manual Entry',
            'Ticket ID': '-',
            'Name/Payer': entry.payer_name,
            'Phone': entry.payer_phone || '',
            'Email': entry.payer_email || '',
            'Amount (INR)': (entry.amount / 100).toFixed(2),
            'Receipt #': entry.receipt_number || '',
            'Collector': entry.collected_by || '',
            'Date/Time': entry.collected_at ? new Date(entry.collected_at).toLocaleString('en-IN') : '',
            'Notes': entry.notes || ''
        });
    });

    // Sort combined rows by Date/Time descending
    rows.sort((a, b) => new Date(b['Date/Time']).getTime() - new Date(a['Date/Time']).getTime());

    if (rows.length === 0) {
        return new NextResponse("No cash data available to export.", { status: 200 });
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(','))
    ].join('\n');

    const headersList = new Headers();
    headersList.set('Content-Type', 'text/csv; charset=utf-8');
    headersList.set('Content-Disposition', `attachment; filename="manthan_cash_entries_${new Date().toISOString().slice(0, 10)}.csv"`);

    return new NextResponse(csvContent, { status: 200, headers: headersList });
}
