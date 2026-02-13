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

        // Log completo para debug (visível nos logs da Vercel)
        console.log('PushinPay Full Response:', JSON.stringify(responseData, null, 2));

        // Tentar buscar na raiz ou dentro de .data
        const root = responseData.data || responseData;

        // Mapeamento super robusto
        let qrCodeBase64 =
            root.qr_code_base64 ||
            root.qrCodeBase64 ||
            root.base64 ||
            root.qrcode_base64 ||
            null;

        const qrCodeUrl =
            root.qr_code_image ||
            root.qr_code_url ||
            root.location ||
            root.qr_code ||
            null;

        let pixCode =
            root.pix_code ||
            root.copy_paste ||
            root.emv ||
            root.brcode ||
            root.payload ||
            root.pix_code_copy_paste ||
            null;

        let transactionId =
            root.id ||
            root.transaction_id ||
            root.transactionId ||
            null;

        return {
            qrCode: qrCodeBase64 || qrCodeUrl,
            qrCodeBase64: qrCodeBase64,
            pixCode: pixCode,
            transactionId: String(transactionId).toLowerCase(),
            raw: root // Passamos o raw para debug no front se precisar
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        console.error('Error generating Pix via PushinPay:', errorMessage);
        throw new Error(`Falha na PushinPay: ${errorMessage}`);
    }
};
