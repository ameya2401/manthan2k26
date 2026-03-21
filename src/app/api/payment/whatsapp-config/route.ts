import { NextResponse } from 'next/server';

function sanitizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}

export async function GET() {
    const phone = sanitizePhone(process.env.WHATSAPP_PAYMENT_NUMBER || '');

    if (!/^\d{11,15}$/.test(phone)) {
        return NextResponse.json({ phone: '' });
    }

    return NextResponse.json({ phone });
}
