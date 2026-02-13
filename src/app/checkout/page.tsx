'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const planParam = searchParams.get('plan') || '1-mes';

    const plans = {
        '1-mes': { name: '1 Mês', value: '29.90', oldValue: '39.90', months: 1, economy: '10.00' },
        '3-meses': { name: '3 Meses', value: '79.90', oldValue: '89.70', months: 3, economy: '9.80' },
        '6-meses': { name: '6 Meses', value: '149.90', oldValue: '179.40', months: 6, economy: '29.50' },
    };

    const currentPlan = plans[planParam as keyof typeof plans] || plans['1-mes'];

    const [step, setStep] = useState<'form' | 'waiting' | 'approved'>('form');
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(600);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        plan: currentPlan.name,
        value: currentPlan.value
    });

    useEffect(() => {
        if (step !== 'form') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [step]);

    useEffect(() => {
        if (!pixData?.transactionId) return;
        const checkPayment = setInterval(async () => {
            try {
                const res = await fetch(`/api/pix/status?transactionId=${pixData.transactionId}`);
                const data = await res.json();
                if (data.status === 'aprovado') {
                    setStep('approved');
                    clearInterval(checkPayment);
                }
            } catch (error) {
                console.error('Erro ao verificar status:', error);
            }
        }, 3000);
        return () => clearInterval(checkPayment);
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

    const openWhatsApp = () => {
        window.open('https://wa.me/5571991644164', '_blank');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (step === 'approved') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>✅</div>
                    <h1 style={styles.successTitle}>Pagamento confirmado com sucesso</h1>
                    <div style={styles.successDetails}>
                        <p><strong>Plano:</strong> {currentPlan.name}</p>
                        <p><strong>Valor:</strong> R$ {currentPlan.value}</p>
                        <p><strong>Expira em:</strong> {new Date(Date.now() + currentPlan.months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <p style={styles.spamWarning}>
                        ⚠️ Verifique sua caixa de spam para o email de confirmação
                    </p>
                    <button onClick={openWhatsApp} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                        💬 Falar no WhatsApp
                    </button>
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
                            <button onClick={() => copyToClipboard(pixData.pixCode)} className="btn-primary" style={{ width: '100%' }}>
                                📋 Copiar Código
                            </button>
                        </div>
                    )}

                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>Aguardando confirmação do pagamento...</p>
                    </div>

                    <p style={styles.spamWarning}>
                        ⚠️ Verifique sua caixa de spam
                    </p>
                    <button onClick={openWhatsApp} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                        💬 Precisa de ajuda?
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.timer}>
                    ⏰ Oferta expira em: <strong>{formatTime(timeLeft)}</strong>
                </div>

                <h1 style={styles.title}>Plano {currentPlan.name} - Redflix</h1>

                <div style={styles.planBox}>
                    <p style={styles.planName}>{currentPlan.name} Completo</p>
                    <div style={styles.pricing}>
                        <span style={styles.oldPrice}>R$ {currentPlan.oldValue}</span>
                        <span style={styles.newPrice}>R$ {currentPlan.value}</span>
                    </div>
                    <p style={styles.economy}>Economia de R$ {currentPlan.economy}</p>
                </div>

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

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                        {loading ? 'Gerando Pix...' : 'Gerar Pix'}
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
        background: '#000',
        padding: '20px',
    },
    card: {
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
    },
    timer: {
        background: '#dc2626',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '24px',
        fontSize: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#fff',
    },
    subtitle: {
        fontSize: '14px',
        color: '#a3a3a3',
        marginBottom: '24px',
        textAlign: 'center',
    },
    planBox: {
        background: '#1a1a1a',
        border: '1px solid #dc2626',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center',
    },
    planName: {
        fontSize: '18px',
        color: '#fff',
        marginBottom: '12px',
    },
    pricing: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
    },
    oldPrice: {
        fontSize: '16px',
        color: '#737373',
        textDecoration: 'line-through',
    },
    newPrice: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#dc2626',
    },
    economy: {
        fontSize: '14px',
        color: '#22c55e',
        fontWeight: 'bold',
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
        color: '#a3a3a3',
    },
    input: {
        padding: '12px 16px',
        border: '1px solid #1a1a1a',
        borderRadius: '8px',
        fontSize: '16px',
        background: '#0a0a0a',
        color: '#fff',
        outline: 'none',
    },
    qrContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    qrCode: {
        width: '250px',
        height: '250px',
        border: '4px solid #dc2626',
        borderRadius: '12px',
    },
    pixCodeContainer: {
        marginTop: '24px',
    },
    pixLabel: {
        fontSize: '14px',
        color: '#a3a3a3',
        marginBottom: '8px',
        textAlign: 'center',
    },
    pixCodeBox: {
        background: '#1a1a1a',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '12px',
        wordBreak: 'break-all',
    },
    pixCode: {
        fontSize: '12px',
        color: '#fff',
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
        border: '4px solid #1a1a1a',
        borderTop: '4px solid #dc2626',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '14px',
        color: '#a3a3a3',
    },
    spamWarning: {
        fontSize: '14px',
        color: '#f59e0b',
        textAlign: 'center',
        marginTop: '24px',
    },
    successIcon: {
        fontSize: '80px',
        textAlign: 'center',
        marginBottom: '20px',
    },
    successTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#22c55e',
        textAlign: 'center',
        marginBottom: '24px',
    },
    successDetails: {
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        color: '#fff',
    },
};

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>Carregando...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
