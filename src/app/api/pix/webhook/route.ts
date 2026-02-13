import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';
import { sendApprovedEmail } from '@/services/resend';

export async function POST(req: Request) {
    console.log('--- WEBHOOK INICIADO ---');
    try {
        let body: any = {};
        const contentType = req.headers.get('content-type') || '';
        console.log('Content-Type:', contentType);

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData();
            body = Object.fromEntries(formData.entries());
        } else if (contentType.includes('application/json')) {
            body = await req.json();
        } else {
            // Tentar ler como text e parsear querystring manualmente se necessário
            const text = await req.text();
            console.log('Raw Body:', text);
            try {
                body = JSON.parse(text);
            } catch {
                const params = new URLSearchParams(text);
                body = Object.fromEntries(params.entries());
            }
        }

        console.log('Webhook Body Parseado:', JSON.stringify(body, null, 2));

        // Normalização de dados
        const transactionId = (body.id || body.transactionId || body.transaction_id || '').toString().toLowerCase();
        const status = (body.status || body.situation || '').toString().toLowerCase();

        console.log(`Processando: TransactionID=${transactionId}, Status=${status}`);

        // Verificar se é status de pago
        // PushinPay pode enviar: 'paid', 'approved', '1' (pago), 'COMPLETED'
        const isPaid = ['paid', 'approved', '1', 'completed'].includes(status);

        if (isPaid && transactionId) {
            console.log('Pagamento confirmado! Buscando cliente...');

            // Buscar cliente pelo transactionId
            const clientsRef = db.collection('clientes');
            const snapshot = await clientsRef.where('transactionId', '==', transactionId).get();

            if (snapshot.empty) {
                console.error('CLIENTE NÃO ENCONTRADO para transactionId:', transactionId);
                return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            }

            const clientDoc = snapshot.docs[0];
            const clientData = clientDoc.data();
            console.log('Cliente encontrado:', clientData.id, clientData.name);

            // Calcular expiração
            const validadeMeses = clientData.plan.includes('3') ? 3 : clientData.plan.includes('6') ? 6 : 1;
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setMonth(expiresAt.getMonth() + validadeMeses);

            // Atualizar status no Firebase
            await clientDoc.ref.update({
                status: 'aprovado',
                approvedAt: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
                updatedAt: now.toISOString()
            });

            console.log('Status atualizado no Firebase para APROVADO.');

            // Enviar email
            try {
                await sendApprovedEmail(
                    clientData.email,
                    clientData.name,
                    expiresAt.toLocaleDateString('pt-BR')
                );
                console.log('Email de aprovação enviado com sucesso.');
            } catch (emailError) {
                console.error('Falha ao enviar email de aprovação:', emailError);
            }

            return NextResponse.json({ success: true, message: 'Pago e atualizado' });
        } else {
            console.log('Status não é de pagamento ou sem ID:', status);
            return NextResponse.json({ success: true, message: 'Status ignorado' });
        }

    } catch (error: any) {
        console.error('ERRO NO WEBHOOK:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
