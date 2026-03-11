import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

/**
 * Utility to send transactional emails via Brevo (formerly Sendinblue)
 * with a clean email body and a PDF attachment.
 */
export async function sendTicketEmail(details: {
    email: string;
    name: string;
    ticketId: string;
    qrCodeDataUrl: string;
    eventNames: string;
    phone: string;
    college: string;
    totalAmount: string | number;
    events: Array<{ name: string; venue?: string; event_date?: string }>;
}) {
    const { email, name, ticketId, qrCodeDataUrl, phone, college, totalAmount, events } = details;

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Manthan 2k26 Team";

    if (!apiKey || !senderEmail) {
        console.error("Brevo credentials missing in environment variables.");
        return { success: false, error: "Configuration missing" };
    }

    try {
        // --- 1. PREPARE RESOURCES ---
        const publicDir = path.join(process.cwd(), 'public');
        const logoLPath = path.join(publicDir, 'manthan_final_logo.png');
        const logoRPath = path.join(publicDir, 'bbbg-removebg-preview.png');

        const logoLBase64 = fs.readFileSync(logoLPath).toString('base64');
        const logoRBase64 = fs.readFileSync(logoRPath).toString('base64');
        const qrBase64 = qrCodeDataUrl.split(",")[1];

        // Format Amount (convert paise to rupees if needed)
        let formattedAmount = totalAmount;
        if (typeof totalAmount === 'string') {
            const numericPart = totalAmount.replace(/[^\d.-]/g, '');
            const amount = parseFloat(numericPart);
            // If it's a huge number like 5000, it's likely paise
            if (amount >= 100) {
                formattedAmount = `INR ${ (amount / 100).toFixed(2) }`;
            } else {
                formattedAmount = `INR ${ amount.toFixed(2) }`;
            }
        } else if (typeof totalAmount === 'number') {
            formattedAmount = `INR ${ (totalAmount / 100).toFixed(2) }`;
        }

        // --- 2. GENERATE PDF ---
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Set Background: Pitch Black
        doc.setFillColor(5, 5, 5);
        doc.rect(0, 0, 210, 297, 'F');

        // Main Gold Border (Double line effect)
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(1.0);
        doc.rect(8, 8, 194, 281, 'S');
        doc.setLineWidth(0.3);
        doc.rect(10, 10, 190, 277, 'S');

        // Maroon Corner Decorations
        doc.setDrawColor(139, 0, 0); // Maroon
        doc.setLineWidth(2.0);
        // Top Left
        doc.line(8, 20, 8, 8); doc.line(8, 8, 20, 8);
        // Top Right
        doc.line(190, 8, 202, 8); doc.line(202, 8, 202, 20);
        // Bottom Left
        doc.line(8, 277, 8, 289); doc.line(8, 289, 20, 289);
        // Bottom Right
        doc.line(190, 289, 202, 289); doc.line(202, 289, 202, 277);

        // Header Logos (Placing them more strategically)
        doc.addImage(`data:image/png;base64,${logoLBase64}`, 'PNG', 18, 18, 35, 35);
        doc.addImage(`data:image/png;base64,${logoRBase64}`, 'PNG', 157, 18, 35, 35);

        // Header Text
        doc.setTextColor(212, 175, 55); // Gold
        doc.setFont('times', 'bold');
        doc.setFontSize(48);
        doc.text("MANTHAN", 105, 42, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(139, 0, 0); // Maroon
        doc.text("2026 • Festival of Ancient Wisdom", 105, 51, { align: 'center' });

        // Ticket ID Section
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.6);
        doc.setLineDashPattern([2, 1], 0);
        doc.rect(55, 65, 100, 18, 'S');
        doc.setLineDashPattern([], 0);

        doc.setTextColor(255, 255, 255);
        doc.setFont('courier', 'bold');
        doc.setFontSize(24);
        doc.text(ticketId, 105, 77, { align: 'center' });

        doc.setTextColor(74, 222, 128); // Green
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text("✓ VERIFIED • PAID ENTRY", 105, 88, { align: 'center' });

        // QR Code Box
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(60, 95, 90, 100, 4, 4, 'F'); // Increased size
        doc.addImage(`data:image/png;base64,${qrBase64}`, 'PNG', 65, 100, 80, 80);

        doc.setTextColor(212, 175, 55);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("PRESENT THIS QR AT THE VENUE ENTRANCE", 105, 188, { align: 'center' });

        // Divider
        doc.setDrawColor(100, 100, 100); // Using a grey color instead of alpha
        doc.setLineWidth(0.1);
        doc.line(20, 200, 190, 200);

        // User Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const startY = 210;
        const lineSpacing = 10;

        const labels = ["NAME:", "COLLEGE:", "PHONE:", "EMAIL:"];
        const values = [name, college, phone, email];

        labels.forEach((label, i) => {
            doc.setTextColor(212, 175, 55);
            doc.text(label, 25, startY + (i * lineSpacing));
            doc.setTextColor(255, 255, 255);
            doc.text(String(values[i]), 60, startY + (i * lineSpacing));
        });

        // Registered Events
        doc.setTextColor(139, 0, 0); // Maroon
        doc.setFontSize(12);
        doc.text("REGISTERED EVENTS", 25, startY + 45);
        doc.setDrawColor(139, 0, 0);
        doc.line(25, startY + 47, 75, startY + 47);

        let eventY = startY + 55;
        events.slice(0, 4).forEach((event) => {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text(`• ${event.name}`, 30, eventY);
            doc.setFontSize(8);
            doc.setTextColor(180, 180, 180);
            doc.text(`${event.venue || 'Main Campus'} | ${event.event_date ? new Date(event.event_date).toDateString() : 'Mar 24-25'}`, 34, eventY + 4);
            eventY += 12;
        });

        // Bottom Total
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: ${formattedAmount}`, 185, 265, { align: 'right' });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text("This is an official digital entry pass for Manthan 2k26. Do not share.", 105, 282, { align: 'center' });

        const pdfBuffer = doc.output('arraybuffer');
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

        // --- 3. CONSTRUCT EMAIL BODY ---
        const emailHtml = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; line-height: 1.6; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000; padding: 25px 20px;">
        <tr>
            <td width="60" align="left" style="vertical-align: middle;">
                <img src="cid:logo_l" width="60" style="display: block; border: 0;" />
            </td>
            <td align="center" style="vertical-align: middle;">
                <h1 style="color: #D4AF37; margin: 0; font-size: 20px; font-family: 'Times New Roman', Times, serif; text-transform: uppercase; letter-spacing: 2px;">MANTHAN 2k26</h1>
            </td>
            <td width="60" align="right" style="vertical-align: middle;">
                <img src="cid:logo_r" width="60" style="display: block; border: 0;" />
            </td>
        </tr>
    </table>
    
    <div style="padding: 40px 30px;">
        <h2 style="color: #111; margin-top: 0; font-size: 22px;">Success! Your Passage is Confirmed.</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your journey into the <strong>Festival of Ancient Wisdom</strong> has been inscribed. Your payment has been verified successfully.</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">Official Ticket ID</p>
            <p style="margin: 8px 0 0; font-size: 26px; font-weight: bold; color: #111; letter-spacing: 1px;">${ticketId}</p>
        </div>

        <p>We have attached your official <strong>Entry Pass (PDF)</strong>. Please keep it ready on your phone or carry a printout when you arrive at the venue entrance.</p>
        
        <p style="margin-top: 30px;">See you at the fest!</p>
        <p style="margin: 0;">Warm regards,<br/><strong>Team Manthan</strong></p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #6b7280;">
        <p style="margin: 0;">© 2026 Manthan Festival • March 24th - 25th</p>
    </div>
</div>
        `;

        // --- 4. SEND EMAIL ---
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
                "accept": "application/json",
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: email, name: name }],
                subject: `🎟️ Entry Pass Confirmed: ${ticketId} - Manthan 2k26`,
                htmlContent: emailHtml,
                attachment: [
                    {
                        content: pdfBase64,
                        name: `Manthan_Pass_${ticketId}.pdf`,
                    },
                ],
                inline: [
                    { content: logoLBase64, cid: "logo_l" },
                    { content: logoRBase64, cid: "logo_r" },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        return { success: true };
    } catch (error) {
        console.error("Brevo Email Error:", error);
        return { success: false, error };
    }
}
