import 'dotenv/config';
import { generatePushinPayPix } from './src/services/pushinpay.ts';
import { db } from './src/services/firebase.ts';
import { sendPendingEmail } from './src/services/resend.ts';


async function runTest() {
    console.log('--- INICIANDO TESTE DE PIX ---');

    const testData = {
        name: 'Teste Local Antigravity',
        email: 'adalmir.web@gmail.com',
        phone: '71991644164',
        plan: '1 mês',
        value: 2990 // R$ 29,90 em centavos (mínimo é 50 centavos)
    };

    try {
        console.log('1. Testando PushinPay...');
        const pixData = await generatePushinPayPix({
            value: testData.value,
            webhook_url: 'https://streaming-iptv-three.vercel.app/api/pix/webhook',
            pix_key: process.env.VITE_PUSHINPAY_TOKEN || '',
            external_id: testData.email
        });
        console.log('✅ PushinPay OK:', pixData.transaction_id);

        console.log('2. Testando Firebase...');
        const clientRef = db.collection('clientes').doc('teste-local');
        await clientRef.set({
            ...testData,
            status: 'pendente',
            transactionId: pixData.transaction_id,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Firebase OK');

        console.log('3. Testando Resend...');
        await sendPendingEmail(testData.email, testData.name, pixData.copy_paste);
        console.log('✅ Resend OK (E-mail enviado)');

        console.log('\n--- TESTE CONCLUÍDO COM SUCESSO! ---');
    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        if (error.response) console.error('Detalhes:', error.response.data);
    }
}

runTest();
