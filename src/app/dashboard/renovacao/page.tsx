'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string;
    value: number;
    status: string;
    expiresAt?: string;
}

export default function RenovacaoPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [discount, setDiscount] = useState(10);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/admin/clients');
            const data = await res.json();
            const approved = (data.clients || []).filter((c: Client) => c.status === 'aprovado');
            setClients(approved);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysUntilExpiry = (expiresAt?: string) => {
        if (!expiresAt) return 0;
        const expiry = new Date(expiresAt);
        const today = new Date();
        const diff = expiry.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const calculateDiscountedPrice = (originalPrice: number) => {
        return (originalPrice * (1 - discount / 100)).toFixed(2);
    };

    const sendRenewalOffer = (client: Client) => {
        const discountedPrice = calculateDiscountedPrice(client.value);
        const checkoutUrl = `${window.location.origin}/checkout?plan=${client.plan.toLowerCase().replace(' ', '-')}&discount=${discount}`;

        const message = `🎉 *Oferta Especial de Renovação!* 🎉

Olá ${client.name}! 👋

Temos uma *oferta exclusiva* para você renovar sua assinatura Redflix! 🔥

📦 *Plano:* ${client.plan}
💰 *Valor Original:* R$ ${client.value.toFixed(2)}
🎁 *Desconto:* ${discount}%
✅ *Valor com Desconto:* R$ ${discountedPrice}

Não perca essa oportunidade! Renove agora:
${checkoutUrl}

Qualquer dúvida, estamos à disposição! 😊`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
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
                <h1 style={styles.title}>Renovação de Clientes</h1>

                {/* Slider de Desconto */}
                <div className="card-redflix" style={styles.discountCard}>
                    <h2 style={styles.cardTitle}>Configurar Desconto</h2>
                    <div style={styles.sliderContainer}>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={discount}
                            onChange={e => setDiscount(parseInt(e.target.value))}
                            style={styles.slider}
                        />
                        <div style={styles.discountValue}>{discount}% OFF</div>
                    </div>
                    <p style={styles.discountDesc}>
                        Arraste o controle para definir o desconto que será aplicado na renovação
                    </p>
                </div>

                {/* Lista de Clientes */}
                <div className="card-redflix" style={styles.tableCard}>
                    <h2 style={styles.cardTitle}>Clientes Ativos</h2>

                    {loading ? (
                        <div style={styles.loading}>Carregando...</div>
                    ) : clients.length === 0 ? (
                        <div style={styles.empty}>Nenhum cliente ativo</div>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        <th style={styles.th}>Nome</th>
                                        <th style={styles.th}>Telefone</th>
                                        <th style={styles.th}>Plano Atual</th>
                                        <th style={styles.th}>Dias para Expirar</th>
                                        <th style={styles.th}>Valor Original</th>
                                        <th style={styles.th}>Valor com Desconto</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => {
                                        const daysLeft = getDaysUntilExpiry(client.expiresAt);
                                        const discountedPrice = calculateDiscountedPrice(client.value);

                                        return (
                                            <tr key={client.id} style={styles.tableRow}>
                                                <td style={styles.td}>{client.name}</td>
                                                <td style={styles.td}>{client.phone}</td>
                                                <td style={styles.td}>{client.plan}</td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.badge,
                                                        ...(daysLeft <= 7 ? styles.badgeRed : daysLeft <= 15 ? styles.badgeYellow : styles.badgeGreen)
                                                    }}>
                                                        {daysLeft} dias
                                                    </span>
                                                </td>
                                                <td style={styles.td}>R$ {client.value.toFixed(2)}</td>
                                                <td style={styles.td}>
                                                    <strong style={{ color: '#22c55e' }}>R$ {discountedPrice}</strong>
                                                </td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() => sendRenewalOffer(client)}
                                                        style={styles.whatsappBtn}
                                                    >
                                                        💬 Enviar Oferta
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
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
    discountCard: {
        padding: '32px',
        marginBottom: '32px',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '24px',
    },
    sliderContainer: {
        marginBottom: '16px',
    },
    slider: {
        width: '100%',
        height: '8px',
        borderRadius: '4px',
        background: '#1a1a1a',
        outline: 'none',
        marginBottom: '16px',
    },
    discountValue: {
        fontSize: '48px',
        fontWeight: 900,
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: '8px',
    },
    discountDesc: {
        fontSize: '14px',
        color: '#a3a3a3',
        textAlign: 'center',
    },
    tableCard: {
        padding: '32px',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        borderBottom: '2px solid #1a1a1a',
    },
    th: {
        padding: '16px',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: 700,
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tableRow: {
        borderBottom: '1px solid #1a1a1a',
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#fff',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 700,
    },
    badgeGreen: {
        background: 'rgba(34, 197, 94, 0.2)',
        color: '#22c55e',
    },
    badgeYellow: {
        background: 'rgba(245, 158, 11, 0.2)',
        color: '#f59e0b',
    },
    badgeRed: {
        background: 'rgba(220, 38, 38, 0.2)',
        color: '#dc2626',
    },
    whatsappBtn: {
        background: '#22c55e',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        color: '#a3a3a3',
        fontSize: '16px',
    },
    empty: {
        textAlign: 'center',
        padding: '60px',
        color: '#737373',
        fontSize: '14px',
    },
};
