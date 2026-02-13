import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPendingEmail = async (email: string, name: string, pixCode: string) => {
    try {
        await resend.emails.send({
            from: 'Streaming IPTV <noreply@streaming-iptv.com>',
            to: email,
            subject: 'Pagamento Pendente - Seu acesso está quase pronto!',
            html: `
        <h1>Olá ${name},</h1>
        <p>Seu pedido de assinatura foi gerado. Status: <strong>Pagamento pendente</strong>.</p>
        <p>Para ativar seu acesso, utilize o código Copia e Cola abaixo ou escaneie o QR Code em nosso site.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; word-break: break-all;">
          <code>${pixCode}</code>
        </div>
        <p><strong>Importante:</strong> Verifique sua caixa de spam se não receber outros avisos.</p>
        <p>Caso tenha dúvidas, clique no botão abaixo para falar com nosso suporte via WhatsApp:</p>
        <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5500000000000'}" style="background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Suporte WhatsApp</a>
      `,
        });
    } catch (error) {
        console.error('Error sending pending email:', error);
    }
};

export const sendApprovedEmail = async (email: string, name: string, expirationDate: string) => {
    try {
        await resend.emails.send({
            from: 'Streaming IPTV <noreply@streaming-iptv.com>',
            to: email,
            subject: 'Pagamento Aprovado! - Seu acesso está ATIVO',
            html: `
        <h1>Olá ${name}, 🎉</h1>
        <p>Seu pagamento foi confirmado com sucesso!</p>
        <p><strong>Status:</strong> Ativado</p>
        <p><strong>Validade do acesso:</strong> ${expirationDate}</p>
        <p><strong>Próximos passos:</strong> Você receberá em instantes as credenciais de acesso no seu e-mail.</p>
        <p>Dúvidas? Fale conosco:</p>
        <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5500000000000'}" style="background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Suporte WhatsApp</a>
      `,
        });
    } catch (error) {
        console.error('Error sending approved email:', error);
    }
};
