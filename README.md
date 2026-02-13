# Streaming IPTV - Backend Base

Estrutura base do backend configurada para deploy na Vercel com integração Firebase, PushPay e Resend.

## 🚀 Como começar

1. **Configurar Variáveis de Ambiente:**
   Copie os valores necessários para o seu arquivo `.env.local`. Você precisará das chaves do Firebase, Resend e a Chave Pix da PushPay.

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

## 📡 Endpoints da API

### 1. Gerar Pix (`POST /api/pix/create`)
Endpoint para iniciar uma cobrança.

**Payload:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "plan": "1 mês",
  "value": "29.90"
}
```

**O que ele faz:**
- Cria a cobrança na PushPay.
- Salva o cliente no Firebase como `status: pendente`.
- Envia e-mail de "Pagamento Pendente" via Resend.
- Retorna o QR Code e o código Copia e Cola.

### 2. Webhook PushPay (`POST /api/pix/webhook`)
Endpoint para receber notificações de pagamento.

**O que ele faz:**
- Verifica se o status é pago.
- Atualiza o cliente no Firebase para `status: aprovado`.
- Calcula e salva a data de expiração (1, 3 ou 6 meses).
- Envia e-mail de "Pagamento Aprovado" via Resend.

## 📁 Estrutura do Projeto

- `src/app/api/`: Rotas da API (Next.js App Router).
- `src/services/`: Camada de serviços (Firebase, PushPay, Resend).
- `src/utils/`: Funções utilitárias.
- `.env.local`: Configurações de chaves e segredos.
