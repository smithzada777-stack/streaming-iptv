import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/firebase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const transactionId = searchParams.get('transactionId');

        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
        }

        // Busca o cliente pelo transactionId
        const clientQuery = await db.collection('payments')
            .where('transactionId', '==', transactionId.toLowerCase())
            .get();

        if (clientQuery.empty) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const clientData = clientQuery.docs[0].data();

        return NextResponse.json({
            status: clientData.status,
            approvedAt: clientData.approvedAt,
            expiresAt: clientData.expiresAt,
        });

    } catch (error: any) {
        console.error('Error checking payment status:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
