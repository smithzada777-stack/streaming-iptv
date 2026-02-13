# 🎯 PLANO DE CORREÇÃO DEFINITIVO - PIX INTEGRATION

## 📊 DIAGNÓSTICO DOS PROBLEMAS

### 1. **Código Pix não aparece**
- **Causa**: A API PushinPay retorna os dados dentro de `response.data.data` mas estamos procurando em `response.data`
- **Solução**: Buscar em ambos os lugares (root e nested)

### 2. **Status não aprova automaticamente**
- **Causa**: Usando `setInterval` (polling) em vez de `onSnapshot` (Firebase real-time)
- **Solução**: Implementar `onSnapshot` conforme instruções

### 3. **Email não chega**
- **Causa**: Usando domínio não verificado (`streaming-iptv.com`)
- **Solução**: Usar `onboarding@resend.dev` para testes

### 4. **Webhook pode não estar recebendo**
- **Causa**: URL configurada na PushinPay pode estar errada
- **Ação**: Verificar se está `https://seu-site.vercel.app/api/pix/webhook`

---

## 🔧 IMPLEMENTAÇÃO (SEGUINDO INSTRUCOES_PIX.MD)

### PASSO 1: Corrigir serviço PushinPay
**Arquivo**: `src/services/pushinpay.ts`
**Mudança**: Buscar dados em `responseData.data` também

```typescript
const root = responseData.data || responseData;
const pixCode = root.pix_code || root.copy_paste || root.emv || root.brcode || root.payload;
```

### PASSO 2: Usar coleção `payments` (conforme instruções)
**Arquivos afetados**:
- `src/app/api/pix/create/route.ts`
- `src/app/api/pix/webhook/route.ts`
- `src/app/api/pix/status/route.ts`

**Mudança**: Trocar `db.collection('clientes')` por `db.collection('payments')`

### PASSO 3: Implementar onSnapshot no Checkout
**Arquivo**: `src/app/checkout/page.tsx`
**Mudança**: Substituir `setInterval` por Firebase `onSnapshot`

```typescript
import { db } from '@/services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

useEffect(() => {
    if (!pixData?.transactionId) return;
    
    const q = query(
        collection(db, 'payments'),
        where('transactionId', '==', pixData.transactionId.toLowerCase())
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'aprovado') {
                setStep('approved');
            }
        });
    });
    
    return () => unsubscribe();
}, [pixData]);
```

### PASSO 4: Garantir lowercase em TODOS os lugares
**Regra**: SEMPRE usar `.toLowerCase()` ao salvar e buscar `transactionId`

### PASSO 5: Ajustar regras do Firebase
**Firebase Console** > **Firestore Database** > **Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /payments/{document=**} { 
      allow read, write: if true; 
    }
    match /clientes/{document=**} { 
      allow read, write: if true; 
    }
  }
}
```

---

## 🧪 TESTES A FAZER (APÓS DEPLOY)

### Teste 1: Geração de Pix
1. Acessar checkout
2. Preencher dados
3. Gerar Pix
4. **VERIFICAR**: QR Code E código copia-e-cola aparecem

### Teste 2: Email Pendente
1. Após gerar Pix
2. **VERIFICAR**: Email chegou na caixa de entrada
3. **VERIFICAR**: Email contém código Pix

### Teste 3: Aprovação Automática
1. Pagar o Pix (sandbox ou real)
2. **VERIFICAR**: Tela muda para "Aprovado" em até 5 segundos
3. **VERIFICAR**: Status no Dashboard mudou para "aprovado"

### Teste 4: Email Aprovado
1. Após pagamento
2. **VERIFICAR**: Email de aprovação chegou
3. **VERIFICAR**: Email contém data de expiração

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

### Vercel (Environment Variables)
- [ ] `VITE_PUSHINPAY_TOKEN` - Token da API PushinPay
- [ ] `RESEND_API_KEY` - Chave da API Resend
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` - Credenciais Firebase Admin

### PushinPay Dashboard
- [ ] Webhook URL: `https://seu-site.vercel.app/api/pix/webhook`
- [ ] Webhook Token: Configurado (opcional)

### Firebase Console
- [ ] Regras do Firestore permitem leitura/escrita em `payments`
- [ ] Coleção `payments` existe (será criada automaticamente)

### Resend Dashboard
- [ ] API Key criada
- [ ] (Opcional) Domínio verificado para produção

---

## 🚨 SE NADA DISSO FUNCIONAR

### Opção 1: Vercel KV (Storage)
Migrar de Firebase para Vercel KV Storage:
- Mais simples
- Integrado com Vercel
- Sem configuração de regras

### Opção 2: Supabase
Alternativa ao Firebase:
- PostgreSQL real-time
- Mais fácil de debugar
- Melhor documentação

---

## ⏭️ PRÓXIMOS PASSOS

1. Você revisa este plano
2. Eu implemento cada passo
3. Fazemos commit
4. Deploy na Vercel
5. Testamos juntos cada funcionalidade
6. Se falhar, migramos para Vercel KV

**Posso começar a implementação?**
