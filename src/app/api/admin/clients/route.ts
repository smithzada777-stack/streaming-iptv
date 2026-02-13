import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';

export async function GET() {
    try {
        // Busca todos os clientes
        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/clientes`
        );

        if (!response.ok) {
            return NextResponse.json({ clients: [] });
        }

        const data = await response.json();
        const clients = (data.documents || []).map((doc: any) => {
            const fields = doc.fields || {};
            return {
                id: fields.id?.stringValue || '',
                name: fields.name?.stringValue || '',
                email: fields.email?.stringValue || '',
                phone: fields.phone?.stringValue || '',
                plan: fields.plan?.stringValue || '',
                value: parseFloat(fields.value?.integerValue || fields.value?.doubleValue || 0),
                status: fields.status?.stringValue || '',
                transactionId: fields.transactionId?.stringValue || '',
                createdAt: fields.createdAt?.timestampValue || fields.createdAt?.stringValue || '',
                approvedAt: fields.approvedAt?.timestampValue || fields.approvedAt?.stringValue,
                expiresAt: fields.expiresAt?.timestampValue || fields.expiresAt?.stringValue,
            };
        });

        // Ordena por data de criação (mais recentes primeiro)
        clients.sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return NextResponse.json({ clients });

    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ clients: [], error: error.message }, { status: 500 });
    }
}
