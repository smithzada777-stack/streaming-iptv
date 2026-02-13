'use client';

import { useState } from 'react';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: 'Cliente Teste',
        email: 'teste@exemplo.com',
        phone: '71991644164',
        plan: '1 mês',
        value: '29.90'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/pix/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                setResult(data);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro ao conectar com a API');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Teste de Geração de Pix</h1>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                Utilize este formulário para testar o "cérebro" do sistema (PushinPay + Firebase + Resend).
            </p>

            <form onSubmit={handleSubmit}>
                <label>
                    Nome
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </label>
                <label>
                    E-mail
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Telefone
                    <input
                        type="text"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Plano
                    <select
                        value={formData.plan}
                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                    >
                        <option value="1 mês">1 mês - R$ 29,90</option>
                        <option value="3 meses">3 meses - R$ 79,90</option>
                        <option value="6 meses">6 meses - R$ 149,90</option>
                    </select>
                </label>
                <label>
                    Valor (R$)
                    <input
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                        required
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? 'Gerando Pix...' : 'Gerar Pix de Teste'}
                </button>
            </form>

            {result && (
                <div className="result">
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>✅ Pix Gerado!</h2>
                    <p style={{ fontSize: '0.9rem' }}>Escaneie o QR Code ou copie o código abaixo:</p>

                    {result.qrCode && (
                        <img
                            src={`data:image/png;base64,${result.qrCode}`}
                            alt="QR Code Pix"
                            className="qr-code"
                        />
                    )}

                    <div className="pix-code">
                        {result.pixCode}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                        ID da Transação: {result.transactionId}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '1rem' }}>
                        Check seu Firebase e seu E-mail (Resend) para confirmar o registro.
                    </p>
                </div>
            )}
        </div>
    );
}
