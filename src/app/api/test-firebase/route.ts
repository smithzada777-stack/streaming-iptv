import { NextResponse } from 'next/server';
import { db } from '@/services/firebase';

export async function GET() {
    try {
        console.log('Testing Firebase connection...');
        const testRef = db.collection('test_connection').doc('ping');
        await testRef.set({
            status: 'online',
            timestamp: new Date().toISOString()
        });

        const doc = await testRef.get();
        return NextResponse.json({
            success: true,
            data: doc.data(),
            message: 'Firebase connection successful!'
        });
    } catch (error: any) {
        console.error('Firebase Test Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
