'use client';

import { useState, useEffect } from 'react';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string;
    value: number;
    status: string;
    transactionId: string;
    createdAt: string;
    approvedAt?: string;
    expiresAt?: string;
}

export default function DashboardPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Carregando...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Dashboard - Clientes</h1>
                <button onClick={fetchClients} style={styles.refreshButton}>
                    🔄 Atualizar
                </button>
            </div>

            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{clients.length}</div>
                    <div style={styles.statLabel}>Total de Clientes</div>
                </div>
                <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
                    <div style={styles.statNumber}>
                        {clients.filter(c => c.status === 'aprovado').length}
                    </div>
                    <div style={styles.statLabel}>Pagamentos Aprovados</div>
                </div>
                <div style={{ ...styles.statCard, ...styles.statCardYellow }}>
                    <div style={styles.statNumber}>
                        {clients.filter(c => c.status === 'pendente').length}
                    </div>
                    <div style={styles.statLabel}>Pagamentos Pendentes</div>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nome</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Plano</th>
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id} style={styles.tableRow}>
                                <td style={styles.td}>{client.name}</td>
                                <td style={styles.td}>{client.email}</td>
                                <td style={styles.td}>{client.plan}</td>
                                <td style={styles.td}>R$ {client.value.toFixed(2)}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        ...(client.status === 'aprovado' ? styles.badgeGreen : styles.badgeYellow)
                                    }}>
                                        {client.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    {new Date(client.createdAt).toLocaleString('pt-BR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {clients.length === 0 && (
                    <div style={styles.emptyState}>
                        Nenhum cliente cadastrado ainda.
                    </div>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '40px 20px',
    },
    header: {
        maxWidth: '1200px',
        margin: '0 auto 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1f2937',
    },
    refreshButton: {
        padding: '12px 24px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    stats: {
        maxWidth: '1200px',
        margin: '0 auto 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    statCard: {
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
    },
    statCardGreen: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
    },
    statCardYellow: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
    },
    statNumber: {
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    statLabel: {
        fontSize: '14px',
        opacity: 0.9,
    },
    tableContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        background: '#f9fafb',
    },
    th: {
        padding: '16px',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#6b7280',
        textTransform: 'uppercase',
        borderBottom: '2px solid #e5e7eb',
    },
    tableRow: {
        borderBottom: '1px solid #e5e7eb',
    },
    td: {
        padding: '16px',
        fontSize: '14px',
        color: '#374151',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    badgeGreen: {
        background: '#d1fae5',
        color: '#065f46',
    },
    badgeYellow: {
        background: '#fef3c7',
        color: '#92400e',
    },
    emptyState: {
        padding: '60px 20px',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '16px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '24px',
        color: '#6b7280',
    },
};
