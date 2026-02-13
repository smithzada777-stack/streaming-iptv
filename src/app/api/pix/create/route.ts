import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';
import { generatePushinPayPix } from '@/services/pushinpay';
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
        const pixData = await generatePushinPayPix({
            value: parseFloat(value),
            webhook_url: `${baseUrl}/api/pix/webhook`,
            pix_key: process.env.VITE_PUSHINPAY_TOKEN || '',
            external_id: email, // Using email as reference for simplicity
        });

        // 2. Save to Firebase with "pendente" status
        console.log('Tentando salvar no Firebase...', { name, email, plan, value });

        try {
            const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const clientData = {
                id: clientId,
                name,
                email,
                phone,
                plan,
                value: parseFloat(value),
                status: 'pendente',
                transactionId: pixData.transactionId,
                pixCode: pixData.pixCode,
                qrCode: pixData.qrCode,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.collection('clientes').doc(clientId).set(clientData);
            console.log('Salvo no Firebase com SUCESSO:', clientId);
        } catch (fbError: any) {
            console.error('ERRO FATAL AO SALVAR NO FIREBASE:', fbError);
        }

        // 3. Send "Pending" Email via Resend
        try {
            await sendPendingEmail(email, name, pixData.pixCode);
            console.log('Email pendente enviado.');
        } catch (emailError) {
            console.error('Erro ao enviar email:', emailError);
        }

        return NextResponse.json({
            success: true,
            qrCode: pixData.qrCode,
            pixCode: pixData.pixCode,
            transactionId: pixData.transactionId,
        });

    } catch (error: any) {
        console.error('API Error (create-pix):', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error',
            details: error.response?.data || null
        }, { status: 500 });
    }
}
