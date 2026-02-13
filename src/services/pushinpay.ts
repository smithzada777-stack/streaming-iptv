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
    try {
        const response = await axios.post(PUSHINPAY_API_URL, {
            value: data.value,
            webhook_url: data.webhook_url,
            // Per instructions, we use the Token in Auth Header instead of pix_key in body if needed
            // But if your account setup requires it, we keep reference
            reference: data.external_id,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.VITE_PUSHINPAY_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const responseData = response.data as any;

        return {
            qr_code: responseData.qr_code,
            qr_code_base64: responseData.qr_code_base64,
            copy_paste: responseData.pix_code || responseData.copy_paste,
            transaction_id: String(responseData.id).toLowerCase(), // Rule of gold: Lowercase IDs
        };
    } catch (error: any) {
        console.error('Error generating Pix via PushinPay:', error.response?.data || error.message);
        throw new Error('Falha ao gerar Pix');
    }
};
