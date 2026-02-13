import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';
import { sendApprovedEmail } from '@/services/resend';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Webhook PushPay received:', body);

        // PushinPay usually sends status in 'status' field. 'paid' or 'approved'.
        // We expect the transaction ID or reference to find the client.
        const transactionId = body.id || body.transactionId;
        const status = body.status;

        if (status === 'paid' || status === 'approved' || status === '1') { // Adjust based on doc
            const clientQuery = await db.collection('clientes')
                .where('transactionId', '==', transactionId.toString())
                .limit(1)
                .get();

            if (clientQuery.empty) {
                console.error('Client not found for transaction:', transactionId);
                return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            }

            const clientDoc = clientQuery.docs[0];
            const clientData = clientDoc.data();

            // Calculate expiration date
            const approvalDate = new Date();
            let monthsToAdd = 1;
            if (clientData.plan.includes('3')) monthsToAdd = 3;
            if (clientData.plan.includes('6')) monthsToAdd = 6;

            const expirationDate = new Date(approvalDate);
            expirationDate.setMonth(expirationDate.getMonth() + monthsToAdd);

            // Update Firebase
            await clientDoc.ref.update({
                status: 'aprovado',
                approvedAt: approvalDate.toISOString(),
                expiresAt: expirationDate.toISOString(),
                updatedAt: approvalDate.toISOString(),
            });

            // Send "Approved" Email
            await sendApprovedEmail(
                clientData.email,
                clientData.name,
                expirationDate.toLocaleDateString('pt-BR')
            );

            return NextResponse.json({ success: true, message: 'Status updated' });
        }

        return NextResponse.json({ success: true, message: 'Status ignored' });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
