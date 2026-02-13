import axios from 'axios';

const PUSHINPAY_API_URL = 'https://api.pushinpay.com.br/api/pix/cashIn';

interface PixRequest {
    value: number;
    webhook_url: string;
    pix_key: string;
    // External reference to identify the user/order
    external_id?: string;
}

export const generatePushPayPix = async (data: PixRequest) => {
    try {
        // Note: User emphasized NO TOKEN. Using only Pix Key in payload if required.
        // Based on PushinPay usual patterns, it might need the pix_key in the body.
        const response = await axios.post(PUSHINPAY_API_URL, {
            value: data.value,
            webhook_url: data.webhook_url,
            pix_key: data.pix_key,
            // Some platforms use 'reference' or 'external_id'
            reference: data.external_id,
        });

        return {
            qr_code: response.data.qr_code,
            qr_code_base64: response.data.qr_code_base64,
            copy_paste: response.data.pix_code || response.data.copy_paste,
            transaction_id: response.data.id,
        };
    } catch (error: any) {
        console.error('Error generating Pix via PushPay:', error.response?.data || error.message);
        throw new Error('Falha ao gerar Pix');
    }
};
