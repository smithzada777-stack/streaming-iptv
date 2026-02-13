import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';

export async function GET() {
    try {
        const snapshot = await db.collection('clientes').orderBy('createdAt', 'desc').get();

        if (snapshot.empty) {
            return NextResponse.json({ clients: [] });
        }

        const clients = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Garantir timestamp correto se vier como objeto Timestamp do Firestore
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                approvedAt: data.approvedAt?.toDate ? data.approvedAt.toDate().toISOString() : data.approvedAt,
                expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt,
            };
        });

        return NextResponse.json({ clients });
    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ clients: [], error: error.message }, { status: 500 });
    }
}
