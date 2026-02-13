'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GerarPixPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [pixData, setPixData] = useState<any>(null);

    // Pix Anônimo
    const [anonValue, setAnonValue] = useState('');

    // Pix com Dados
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        value: ''
    });

    const generateAnonPix = async () => {
        if (!anonValue || parseFloat(anonValue) <= 0) {
            alert('Digite um valor válido');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/pix/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Cliente Anônimo',
                    email: 'anonimo@redflix.com',
                    phone: '00000000000',
                    plan: 'Pix Manual',
                    value: anonValue
                })
            });
            const data = await res.json();
            if (data.success) {
                setPixData(data);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro ao gerar Pix');
        } finally {
            setLoading(false);
        }
    };

    const generateDataPix = async () => {
        if (!formData.email || !formData.phone || !formData.value) {
            alert('Preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/pix/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Cliente Manual',
                    email: formData.email,
                    phone: formData.phone,
                    plan: 'Pix Manual',
                    value: formData.value
                })
            });
            const data = await res.json();
            if (data.success) {
                setPixData(data);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro ao gerar Pix');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Código copiado!');
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={{ ...styles.sidebar, width: sidebarOpen ? '250px' : '70px' }}>
                <div style={styles.sidebarHeader}>
                    <h2 style={{ ...styles.logo, display: sidebarOpen ? 'block' : 'none' }}>REDFLIX</h2>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleBtn}>
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav style={styles.nav}>
                    <Link href="/dashboard" style={styles.navItem}>
                        <span style={styles.navIcon}>📊</span>
                        {sidebarOpen && <span style={styles.navText}>Dashboard</span>}
                    </Link>
                    <Link href="/dashboard/gerar-pix" style={styles.navItem}>
                        <span style={styles.navIcon}>💳</span>
                        {sidebarOpen && <span style={styles.navText}>Gerar Pix</span>}
                    </Link>
                    <Link href="/dashboard/renovacao" style={styles.navItem}>
                        <span style={styles.navIcon}>🔄</span>
                        {sidebarOpen && <span style={styles.navText}>Renovação</span>}
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div style={{ ...styles.main, marginLeft: sidebarOpen ? '250px' : '70px' }}>
                <h1 style={styles.title}>Gerar Pix</h1>

                <div style={styles.grid}>
                    {/* Pix Anônimo */}
                    <div className="card-redflix" style={styles.card}>
                        <h2 style={styles.cardTitle}>Pix Anônimo</h2>
                        <p style={styles.cardDesc}>Gere um Pix rápido sem dados do cliente</p>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={anonValue}
                                onChange={e => setAnonValue(e.target.value)}
                                style={styles.input}
                                placeholder="0.00"
                            />
                        </div>

                        <button
                            onClick={generateAnonPix}
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                        >
                            {loading ? 'Gerando...' : 'Gerar Pix'}
                        </button>
                    </div>

                    {/* Pix com Dados */}
                    <div className="card-redflix" style={styles.card}>
                        <h2 style={styles.cardTitle}>Pix com Dados</h2>
                        <p style={styles.cardDesc}>Gere um Pix com informações do cliente</p>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>E-mail</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={styles.input}
                                placeholder="cliente@email.com"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Telefone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={styles.input}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                style={styles.input}
                                placeholder="0.00"
                            />
                        </div>

                        <button
                            onClick={generateDataPix}
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                        >
                            {loading ? 'Gerando...' : 'Gerar Pix'}
                        </button>
                    </div>
                </div>

                {/* Resultado do Pix */}
                {pixData && (
                    <div className="card-redflix" style={{ ...styles.card, marginTop: '32px' }}>
                        <h2 style={styles.cardTitle}>Pix Gerado com Sucesso!</h2>

                        {/* QR Code Logic */}
                        {(pixData.qrCodeBase64 || pixData.qrCode) && (
                            <div style={styles.qrContainer}>
                                <img
                                    src={
                                        pixData.qrCodeBase64
                                            ? `data:image/png;base64,${pixData.qrCodeBase64}`
                                            : pixData.qrCode
                                    }
                                    alt="QR Code"
                                    style={styles.qrCode}
                                />
                            </div>
                        )}

                        {(pixData.pixCode || pixData.copyPaste || pixData.copy_paste) && (
                            <div style={styles.pixCodeContainer}>
                                <p style={styles.pixLabel}>Código Pix (Copia e Cola):</p>
                                <div style={styles.pixCodeBox}>
                                    <code style={styles.pixCode}>
                                        {pixData.pixCode || pixData.copyPaste || pixData.copy_paste}
                                    </code>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(pixData.pixCode || pixData.copyPaste || pixData.copy_paste)}
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    📋 Copiar Código
                                </button>
                            </div>
                        )}
                    </button>
                            </div>
                        )}
        </div>
    )
}
            </div >
        </div >
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        background: '#000',
    },
    sidebar: {
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a',
        transition: 'width 0.3s ease',
        zIndex: 1000,
        overflow: 'hidden',
    },
    sidebarHeader: {
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1a1a1a',
    },
    logo: {
        fontSize: '20px',
        fontWeight: 900,
        color: '#dc2626',
        letterSpacing: '1px',
    },
    toggleBtn: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '8px',
    },
    nav: {
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        color: '#a3a3a3',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    },
    navIcon: {
        fontSize: '20px',
        minWidth: '20px',
    },
    navText: {
        fontSize: '14px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
    },
    main: {
        flex: 1,
        padding: '40px',
        transition: 'margin-left 0.3s ease',
    },
    title: {
        fontSize: '32px',
        fontWeight: 900,
        color: '#fff',
        marginBottom: '32px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
    },
    card: {
        padding: '32px',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '8px',
    },
    cardDesc: {
        fontSize: '14px',
        color: '#a3a3a3',
        marginBottom: '24px',
    },
    formGroup: {
        marginBottom: '16px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#a3a3a3',
        marginBottom: '8px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #1a1a1a',
        borderRadius: '8px',
        fontSize: '16px',
        background: '#000',
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
};
