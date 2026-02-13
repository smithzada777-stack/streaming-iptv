import axios from 'axios';

const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api/pix/cashIn';

interface PixRequest {
    value: number;
    webhook_url: string;
    pix_key: string;
    // External reference to identify the user/order
    external_id?: string;
}

export const generatePushinPayPix = async (data: PixRequest) => {
    const token = process.env.VITE_PUSHINPAY_TOKEN || process.env.PUSHINPAY_TOKEN;

    if (!token) {
        throw new Error('Configuração ausente: VITE_PUSHINPAY_TOKEN não encontrado nas variáveis de ambiente.');
    }

    try {
        const response = await axios.post(PUSHINPAY_API_URL, {
            value: Math.round(data.value * 100), // Converte R$ para centavos
            webhook_url: data.webhook_url,
            // Per instructions, we use the Token in Auth Header instead of pix_key in body if needed
            // But if your account setup requires it, we keep reference
            reference: data.external_id,
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const responseData = response.data as any;

        // Log completo para debug
        console.log('PushinPay Full Response:', JSON.stringify(responseData, null, 2));

        // Mapeamento super robusto
        let qrCodeBase64 =
            responseData.qr_code_base64 ||
            responseData.qrCodeBase64 ||
            responseData.base64 ||
            responseData.qrcode_base64 ||
            null;

        // Se não tiver base64, tentar achar imagem ou url
        const qrCodeUrl =
            responseData.qr_code_image ||
            responseData.qr_code_url ||
            responseData.location ||
            null;

        let pixCode =
            responseData.pix_code ||
            responseData.copy_paste ||
            responseData.emv || // Código copia e cola
            responseData.brcode ||
            responseData.payload ||
            null;

        let transactionId =
            responseData.id ||
            responseData.transaction_id ||
            responseData.transactionId ||
            null;

        // Se o transactionId estiver aninhado (algumas APIs fazem isso)
        if (!transactionId && responseData.data?.id) transactionId = responseData.data.id;

        return {
            qrCode: qrCodeBase64 || qrCodeUrl,
            qrCodeBase64: qrCodeBase64,
            pixCode: pixCode,
            transactionId: String(transactionId).toLowerCase(),
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        console.error('Error generating Pix via PushinPay:', errorMessage);
        throw new Error(`Falha na PushinPay: ${errorMessage}`);
    }
};
