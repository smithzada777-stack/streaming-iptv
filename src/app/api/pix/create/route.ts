import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';
import { generatePushPayPix } from '@/services/pushpay';
import { sendPendingEmail } from '@/services/resend';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, plan, value } = body;

        if (!name || !email || !phone || !plan || !value) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
        }

        // 1. Generate Pix via PushPay
        const baseUrl = process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const pixData = await generatePushPayPix({
            value: parseFloat(value),
            webhook_url: `${baseUrl}/api/pix/webhook`,
            pix_key: process.env.PUSH_PAY_PIX_KEY || '',
            external_id: email, // Using email as reference for simplicity
        });

        // 2. Save to Firebase with "pendente" status
        const clientRef = db.collection('clientes').doc();
        const clientData = {
            id: clientRef.id,
            name,
            email,
            phone,
            plan,
            value: parseFloat(value),
            status: 'pendente',
            transactionId: pixData.transaction_id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await clientRef.set(clientData);

        // 3. Send "Pending" Email via Resend
        await sendPendingEmail(email, name, pixData.copy_paste);

        return NextResponse.json({
            success: true,
            qrCode: pixData.qr_code_base64,
            pixCode: pixData.copy_paste,
            transactionId: pixData.transaction_id,
        });

    } catch (error: any) {
        console.error('API Error (create-pix):', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
