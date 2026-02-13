'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showSupportMessage, setShowSupportMessage] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSupportMessage(true);
            setTimeout(() => setShowSupportMessage(false), 5000);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToPlans = () => {
        document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
    };

    const openWhatsApp = () => {
        window.open('https://wa.me/5571991644164', '_blank');
    };

    return (
        <>
            {/* Barra de progresso */}
            <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div className="container" style={styles.navContainer}>
                    <div style={styles.logo}>REDFLIX</div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={styles.hero}>
                <div className="container">
                    <div style={styles.heroGrid}>
                        <div style={styles.heroLeft} className="fade-in-up">
                            <h1 style={styles.heroTitle}>
                                Cansado de <span className="text-red">pagar caro</span> por{' '}
                                <span className="text-underline">catálogos ilimitados</span>?
                            </h1>
                            <p style={styles.heroSubtitle}>
                                Pare de pagar e depois pagar novamente para depois nem ter o filme que você queria.
                            </p>
                            <button onClick={scrollToPlans} className="btn-primary">
                                Ver Planos
                            </button>
                        </div>
                        <div style={styles.heroRight}>
                            <div style={styles.heroImageOverlay}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparação */}
            <section style={styles.comparison}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>
                        Você paga mensalidade e ainda cobram mais por filmes.{' '}
                        <span className="text-red">Diferença absurda.</span>
                    </h2>

                    <div style={styles.comparisonGrid}>
                        {[
                            { name: 'Disney+', monthly: 43.90 },
                            { name: 'HBO Max', monthly: 34.90 },
                            { name: 'Globoplay', monthly: 49.90 },
                            { name: 'Netflix', monthly: 55.90 },
                            { name: 'Prime Video', monthly: 19.90 },
                        ].map((service) => (
                            <div key={service.name} className="card-redflix">
                                <h3 style={styles.serviceName}>{service.name}</h3>
                                <p style={styles.servicePrice}>R$ {service.monthly.toFixed(2)}/mês</p>
                                <p style={styles.serviceYear}>R$ {(service.monthly * 12).toFixed(2)}/ano</p>
                            </div>
                        ))}
                    </div>

                    <div style={styles.totalComparison}>
                        <div style={styles.totalBox}>
                            <p style={styles.totalLabel}>Total se assinar tudo:</p>
                            <p style={styles.totalValue}>R$ 2.461,40/ano</p>
                        </div>
                        <div style={styles.vsText}>VS</div>
                        <div style={{ ...styles.totalBox, ...styles.redflixBox }}>
                            <p style={styles.totalLabel}>Redflix (6 meses):</p>
                            <p style={styles.totalValue}>R$ 149,90</p>
                            <p style={styles.economy}>Economia de R$ 2.311,50!</p>
                        </div>
                    </div>

                    <div style={styles.ctaCenter}>
                        <button onClick={scrollToPlans} className="btn-primary">
                            Quero Economizar
                        </button>
                    </div>
                </div>
            </section>

            {/* Catálogo */}
            <section style={styles.catalog}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>
                        Na Redflix você tem acesso a{' '}
                        <span className="text-red">jogos ao vivo</span> e muito mais
                    </h2>
                    <p style={styles.catalogSubtitle}>
                        Filmes, séries, documentários, esportes e entretenimento sem limites
                    </p>
                </div>
            </section>

            {/* Prova Social */}
            <section style={styles.social}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>
                        Vê o que a <span className="text-red">galera real</span> tá achando
                    </h2>

                    <div style={styles.testimonialsGrid}>
                        {[
                            { name: 'Carlos M.', text: 'Melhor custo-benefício! Cancelei todos os outros.' },
                            { name: 'Ana Paula', text: 'Funciona perfeitamente, sem travamentos.' },
                            { name: 'Roberto S.', text: 'Suporte rápido e eficiente. Recomendo!' },
                        ].map((testimonial, i) => (
                            <div key={i} className="card-redflix">
                                <p style={styles.testimonialText}>"{testimonial.text}"</p>
                                <p style={styles.testimonialAuthor}>— {testimonial.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bônus */}
            <section style={styles.bonus}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>
                        O que você <span className="text-red">ganha</span> com a Redflix
                    </h2>

                    <div style={styles.bonusGrid}>
                        {[
                            { icon: '📺', title: '3 Telas Simultâneas', desc: 'Assista em até 3 dispositivos' },
                            { icon: '⚡', title: 'Sem Travamento', desc: 'Streaming em alta velocidade' },
                            { icon: '💬', title: 'Suporte 24h', desc: 'Atendimento sempre disponível' },
                            { icon: '✅', title: 'Garantia 7 Dias', desc: 'Não gostou? Devolvemos seu dinheiro' },
                            { icon: '🎬', title: '4K Ultra HD', desc: 'Qualidade cinematográfica' },
                            { icon: '📱', title: 'Modo Offline', desc: 'Baixe e assista sem internet' },
                        ].map((bonus, i) => (
                            <div key={i} className="card-redflix" style={styles.bonusCard}>
                                <div style={styles.bonusIcon}>{bonus.icon}</div>
                                <h3 style={styles.bonusTitle}>{bonus.title}</h3>
                                <p style={styles.bonusDesc}>{bonus.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Planos */}
            <section id="planos" style={styles.plans}>
                <div className="container">
                    <h2 style={styles.sectionTitle}>
                        Escolha seu plano e <span className="text-red">economize</span>
                    </h2>

                    <div style={styles.plansGrid}>
                        {/* Plano 1 */}
                        <div className="card-redflix" style={styles.planCard}>
                            <h3 style={styles.planName}>1 Mês</h3>
                            <div style={styles.planPricing}>
                                <span style={styles.planOldPrice}>R$ 39,90</span>
                                <span style={styles.planPrice}>R$ 29,90</span>
                            </div>
                            <p style={styles.planDesc}>Plano mensal completo</p>
                            <p style={styles.planSocial}>+ de 5.000 ativações</p>
                            <Link href="/checkout?plan=1-mes">
                                <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                                    Assinar
                                </button>
                            </Link>
                        </div>

                        {/* Plano 2 (Destaque) */}
                        <div className="card-redflix" style={{ ...styles.planCard, ...styles.planFeatured }}>
                            <div style={styles.badge}>MAIS POPULAR</div>
                            <h3 style={styles.planName}>3 Meses</h3>
                            <div style={styles.planPricing}>
                                <span style={styles.planOldPrice}>R$ 89,70</span>
                                <span style={styles.planPrice}>R$ 79,90</span>
                            </div>
                            <p style={styles.planEconomy}>Economize 11%</p>
                            <p style={styles.planSocial}>1.345 clientes ativos</p>
                            <p style={styles.planSatisfaction}>Clientes satisfeitos</p>
                            <Link href="/checkout?plan=3-meses">
                                <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                                    Assinar
                                </button>
                            </Link>
                        </div>

                        {/* Plano 3 */}
                        <div className="card-redflix" style={styles.planCard}>
                            <h3 style={styles.planName}>6 Meses</h3>
                            <div style={styles.planPricing}>
                                <span style={styles.planOldPrice}>R$ 179,40</span>
                                <span style={styles.planPrice}>R$ 149,90</span>
                            </div>
                            <p style={styles.planEconomy}>Economize 16%</p>
                            <p style={styles.planSocial}>570 pessoas ativas</p>
                            <Link href="/checkout?plan=6-meses">
                                <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                                    Assinar
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Botão WhatsApp */}
            <div style={styles.whatsappButton} onClick={openWhatsApp}>
                <span style={styles.whatsappIcon}>💬</span>
                {showSupportMessage && (
                    <div style={styles.whatsappMessage}>
                        Precisa de ajuda? Fale com nosso suporte agora.
                    </div>
                )}
            </div>
        </>
    );
}

const styles: Record<string, React.CSSProperties> = {
    navbar: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'transparent',
        padding: '20px 0',
        zIndex: 1000,
    },
    navContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: '28px',
        fontWeight: 900,
        color: '#dc2626',
        letterSpacing: '2px',
    },
    hero: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '80px',
    },
    heroGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        alignItems: 'center',
    },
    heroLeft: {
        zIndex: 2,
    },
    heroTitle: {
        fontSize: '56px',
        fontWeight: 900,
        lineHeight: 1.2,
        marginBottom: '24px',
    },
    heroSubtitle: {
        fontSize: '20px',
        color: '#a3a3a3',
        marginBottom: '32px',
        lineHeight: 1.6,
    },
    heroRight: {
        position: 'relative',
        height: '500px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
    },
    heroImageOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(0, 0, 0, 0.8))',
    },
    comparison: {
        background: '#0a0a0a',
    },
    sectionTitle: {
        fontSize: '42px',
        fontWeight: 800,
        textAlign: 'center',
        marginBottom: '48px',
    },
    comparisonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
    },
    serviceName: {
        fontSize: '20px',
        fontWeight: 700,
        marginBottom: '12px',
    },
    servicePrice: {
        fontSize: '16px',
        color: '#a3a3a3',
        marginBottom: '4px',
    },
    serviceYear: {
        fontSize: '14px',
        color: '#737373',
    },
    totalComparison: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        marginTop: '60px',
        flexWrap: 'wrap',
    },
    totalBox: {
        background: '#1a1a1a',
        padding: '32px',
        borderRadius: '12px',
        textAlign: 'center',
        minWidth: '250px',
    },
    redflixBox: {
        border: '2px solid #dc2626',
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(0, 0, 0, 0.5))',
    },
    totalLabel: {
        fontSize: '14px',
        color: '#a3a3a3',
        marginBottom: '8px',
    },
    totalValue: {
        fontSize: '32px',
        fontWeight: 900,
        color: '#fff',
    },
    economy: {
        fontSize: '16px',
        color: '#22c55e',
        marginTop: '8px',
        fontWeight: 700,
    },
    vsText: {
        fontSize: '24px',
        fontWeight: 900,
        color: '#dc2626',
    },
    ctaCenter: {
        textAlign: 'center',
        marginTop: '48px',
    },
    catalog: {
        padding: '100px 0',
    },
    catalogSubtitle: {
        textAlign: 'center',
        fontSize: '18px',
        color: '#a3a3a3',
        marginTop: '16px',
    },
    social: {
        background: '#0a0a0a',
    },
    testimonialsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
    },
    testimonialText: {
        fontSize: '16px',
        fontStyle: 'italic',
        marginBottom: '16px',
        color: '#d4d4d4',
    },
    testimonialAuthor: {
        fontSize: '14px',
        color: '#dc2626',
        fontWeight: 700,
    },
    bonus: {
        padding: '100px 0',
    },
    bonusGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
    },
    bonusCard: {
        textAlign: 'center',
    },
    bonusIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    bonusTitle: {
        fontSize: '18px',
        fontWeight: 700,
        marginBottom: '8px',
    },
    bonusDesc: {
        fontSize: '14px',
        color: '#a3a3a3',
    },
    plans: {
        background: '#0a0a0a',
        padding: '100px 0',
    },
    plansGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    planCard: {
        position: 'relative',
        textAlign: 'center',
        padding: '40px 32px',
    },
    planFeatured: {
        border: '2px solid #dc2626',
        transform: 'scale(1.05)',
    },
    badge: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#dc2626',
        color: '#fff',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 700,
    },
    planName: {
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '16px',
    },
    planPricing: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
    },
    planOldPrice: {
        fontSize: '18px',
        color: '#737373',
        textDecoration: 'line-through',
    },
    planPrice: {
        fontSize: '42px',
        fontWeight: 900,
        color: '#dc2626',
    },
    planDesc: {
        fontSize: '16px',
        color: '#a3a3a3',
        marginBottom: '8px',
    },
    planEconomy: {
        fontSize: '16px',
        color: '#22c55e',
        fontWeight: 700,
        marginBottom: '8px',
    },
    planSocial: {
        fontSize: '14px',
        color: '#737373',
        marginBottom: '4px',
    },
    planSatisfaction: {
        fontSize: '14px',
        color: '#737373',
    },
    whatsappButton: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        background: '#dc2626',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
        zIndex: 1000,
        transition: 'transform 0.3s ease',
    },
    whatsappIcon: {
        fontSize: '28px',
    },
    whatsappMessage: {
        position: 'absolute',
        right: '70px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: '#1a1a1a',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        whiteSpace: 'nowrap',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        animation: 'slideInRight 0.3s ease',
    },
};
