'use client';

import { useState, useEffect } from 'react';

export default function CheckoutPage() {
    const [step, setStep] = useState<'form' | 'waiting' | 'approved'>('form');
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: 'adalmirpsantos@gmail.com',
        phone: '',
        plan: '1 mês',
        value: '29.90'
    });

    // Monitora o Firebase em tempo real
    useEffect(() => {
        if (!pixData?.transactionId) return;

        const checkPaymentStatus = setInterval(async () => {
            try {
                const res = await fetch(`/api/pix/status?transactionId=${pixData.transactionId}`);
                const data = await res.json();

                if (data.status === 'aprovado') {
                    setStep('approved');
                    clearInterval(checkPaymentStatus);
                }
            } catch (error) {
                console.error('Erro ao verificar status:', error);
            }
        }, 3000); // Verifica a cada 3 segundos

        return () => clearInterval(checkPaymentStatus);
    }, [pixData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/pix/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                setPixData(data);
                setStep('waiting');
            } else {
                alert('Erro: ' + (data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            alert('Erro ao conectar com a API');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Código Pix copiado!');
    };

    if (step === 'approved') {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>✅</div>
                    <h1 style={styles.successTitle}>Pagamento Aprovado!</h1>
                    <p style={styles.successText}>
                        Seu pagamento foi confirmado com sucesso!
                    </p>
                    <p style={styles.successSubtext}>
                        Você receberá um email de confirmação em <strong>{formData.email}</strong>
                    </p>
                    <p style={styles.successSubtext}>
                        Acesse seu painel para começar a usar o serviço.
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'waiting') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h1 style={styles.title}>Escaneie o QR Code</h1>
                    <p style={styles.subtitle}>Aguardando pagamento...</p>

                    {pixData?.qrCode && (
                        <div style={styles.qrContainer}>
                            <img
                                src={`data:image/png;base64,${pixData.qrCode}`}
                                alt="QR Code Pix"
                                style={styles.qrCode}
                            />
                        </div>
                    )}

                    {pixData?.pixCode && (
                        <div style={styles.pixCodeContainer}>
                            <p style={styles.pixLabel}>Ou copie o código Pix:</p>
                            <div style={styles.pixCodeBox}>
                                <code style={styles.pixCode}>{pixData.pixCode}</code>
                            </div>
                            <button
                                onClick={() => copyToClipboard(pixData.pixCode)}
                                style={styles.copyButton}
                            >
                                📋 Copiar Código
                            </button>
                        </div>
                    )}

                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>Aguardando confirmação do pagamento...</p>
                    </div>

                    <p style={styles.infoText}>
                        Após o pagamento, você será redirecionado automaticamente.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Finalizar Assinatura</h1>
                <p style={styles.subtitle}>Preencha seus dados para gerar o Pix</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Nome Completo</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={styles.input}
                            placeholder="Seu nome"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>E-mail</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={styles.input}
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Telefone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            required
                            style={styles.input}
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Plano</label>
                        <select
                            value={formData.plan}
                            onChange={e => {
                                const plan = e.target.value;
                                let value = '29.90';
                                if (plan === '3 meses') value = '79.90';
                                if (plan === '6 meses') value = '149.90';
                                setFormData({ ...formData, plan, value });
                            }}
                            style={styles.select}
                        >
                            <option value="1 mês">1 mês - R$ 29,90</option>
                            <option value="3 meses">3 meses - R$ 79,90</option>
                            <option value="6 meses">6 meses - R$ 149,90</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitButton,
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Gerando Pix...' : `Gerar Pix - R$ ${formData.value}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    successCard: {
        background: 'white',
        borderRadius: '16px',
        padding: '60px 40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
    },
    successIcon: {
        fontSize: '80px',
        marginBottom: '20px',
    },
    successTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: '16px',
    },
    successText: {
        fontSize: '18px',
        color: '#374151',
        marginBottom: '12px',
    },
    successSubtext: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#1f2937',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '32px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        padding: '12px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'border-color 0.2s',
        outline: 'none',
    },
    select: {
        padding: '12px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '16px',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    submitButton: {
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '12px',
        transition: 'transform 0.2s',
    },
    qrContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    qrCode: {
        width: '250px',
        height: '250px',
        border: '4px solid #e5e7eb',
        borderRadius: '12px',
    },
    pixCodeContainer: {
        marginTop: '24px',
    },
    pixLabel: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '8px',
        textAlign: 'center',
    },
    pixCodeBox: {
        background: '#f3f4f6',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '12px',
        wordBreak: 'break-all',
    },
    pixCode: {
        fontSize: '12px',
        color: '#374151',
    },
    copyButton: {
        width: '100%',
        padding: '12px',
        background: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginTop: '32px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '14px',
        color: '#6b7280',
    },
    infoText: {
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: '24px',
    },
};
