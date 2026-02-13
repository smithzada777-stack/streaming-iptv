
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
    transactionId?: string;
    pixCode?: string;     // Adicionado
    qrCode?: string;      // Adicionado
    createdAt: string;
    approvedAt?: string;
    expiresAt?: string;
}

export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    // Função para copiar Pix
    const copyPix = (pixCode: string) => {
        navigator.clipboard.writeText(pixCode);
        alert('Código Pix copiado!');
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch('/api/admin/clients');
            const data = await res.json();
            setClients(data.clients || []);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalSales = clients.filter(c => c.status === 'aprovado').reduce((sum, c) => sum + c.value, 0);
    const pendingSales = clients.filter(c => c.status === 'pendente').length;
    const approvedCount = clients.filter(c => c.status === 'aprovado').length;

    const planCounts = clients.reduce((acc: any, c) => {
        acc[c.plan] = (acc[c.plan] || 0) + 1;
        return acc;
    }, {});
    const mostSoldPlan = Object.keys(planCounts).reduce((a, b) => planCounts[a] > planCounts[b] ? a : b, '1 mês');

    const openWhatsApp = (phone: string, name: string) => {
        const message = encodeURIComponent(`Olá ${name}! Tudo bem?`);
        window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
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
                <div style={styles.header}>
                    <h1 style={styles.title}>Dashboard</h1>
                    <button onClick={fetchClients} className="btn-primary">
                        🔄 Atualizar
                    </button>
                </div>

                {/* Cards de Estatísticas */}
                <div style={styles.statsGrid}>
                    <div className="card-redflix" style={styles.statCard}>
                        <div style={styles.statIcon}>💰</div>
                        <div style={styles.statValue}>R$ {totalSales.toFixed(2)}</div>
                        <div style={styles.statLabel}>Total de Vendas</div>
                    </div>

                    <div className="card-redflix" style={styles.statCard}>
                        <div style={styles.statIcon}>⏳</div>
                        <div style={styles.statValue}>{pendingSales}</div>
                        <div style={styles.statLabel}>Vendas Pendentes</div>
                    </div>

                    <div className="card-redflix" style={styles.statCard}>
                        <div style={styles.statIcon}>📦</div>
                        <div style={styles.statValue}>{mostSoldPlan}</div>
                        <div style={styles.statLabel}>Plano Mais Vendido</div>
                    </div>

                    <div className="card-redflix" style={styles.statCard}>
                        <div style={styles.statIcon}>✅</div>
                        <div style={styles.statValue}>{approvedCount}</div>
                        <div style={styles.statLabel}>Pagamentos Aprovados</div>
                    </div>
                </div>

                {/* Tabela de Clientes */}
                <div className="card-redflix" style={styles.tableCard}>
                    <h2 style={styles.tableTitle}>Clientes</h2>

                    {loading ? (
                        <div style={styles.loading}>Carregando...</div>
                    ) : clients.length === 0 ? (
                        <div style={styles.empty}>Nenhum cliente cadastrado</div>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeader}>
                                        <th style={styles.th}>Nome</th>
                                        <th style={styles.th}>Data</th>
                                        <th style={styles.th}>Hora</th>
                                        <th style={styles.th}>Plano</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => {
                                        const date = new Date(client.createdAt);
                                        return (
                                            <tr key={client.id} style={styles.tableRow}>
                                                <td style={styles.td}>{client.name}</td>
                                                <td style={styles.td}>{date.toLocaleDateString('pt-BR')}</td>
                                                <td style={styles.td}>{date.toLocaleTimeString('pt-BR')}</td>
                                                <td style={styles.td}>{client.plan}</td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.badge,
                                                        ...(client.status === 'aprovado' ? styles.badgeGreen : styles.badgeYellow)
                                                    }}>
                                                        {client.status}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => openWhatsApp(client.phone, client.name)}
                                                            style={styles.whatsappBtn}
                                                        >
                                                            💬 WhatsApp
                                                        </button>

                                                        {/* Se estiver pendente e tiver código, mostrar botão de copiar pix */}
                                                        {client.status === 'pendente' && client.pixCode && (
                                                            <button
                                                                onClick={() => copyPix(client.pixCode!)}
                                                                style={{ ...styles.whatsappBtn, background: '#f59e0b' }}
                                                                title="Copiar Pix"
                                                            >
                                                                📋 Pix
                                                            </button>
                                                        )}
                                                    </div>
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
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '32px',
        fontWeight: 900,
        color: '#fff',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        textAlign: 'center',
        padding: '32px 24px',
    },
    statIcon: {
        fontSize: '40px',
        marginBottom: '12px',
    },
    statValue: {
        fontSize: '32px',
        fontWeight: 900,
        color: '#dc2626',
        marginBottom: '8px',
    },
    statLabel: {
        fontSize: '14px',
        color: '#a3a3a3',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tableCard: {
        padding: '32px',
    },
    tableTitle: {
        fontSize: '24px',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '24px',
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
        transition: 'background 0.2s ease',
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
        textTransform: 'uppercase',
    },
    badgeGreen: {
        background: 'rgba(34, 197, 94, 0.2)',
        color: '#22c55e',
    },
    badgeYellow: {
        background: 'rgba(245, 158, 11, 0.2)',
        color: '#f59e0b',
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
        transition: 'transform 0.2s ease',
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
