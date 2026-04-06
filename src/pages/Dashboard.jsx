import React, { useState, useEffect } from 'react';
import {
    HiOutlineCalendar, HiOutlineClock, HiOutlineCurrencyDollar,
    HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineExclamationCircle,
    HiOutlineCheckCircle, HiOutlineRefresh
} from 'react-icons/hi';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { fetchDashboard } from '../services/api';
import { format } from 'date-fns';
import { DashboardSkeleton } from '../components/Skeleton';

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const res = await fetchDashboard();
            setData(res.data);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fmt = (val) => {
        if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
        if (val >= 1000)   return '₹' + (val / 1000).toFixed(1) + 'K';
        return '₹' + val;
    };
    const fmtFull = (val) => '₹' + (val || 0).toLocaleString('en-IN');

    if (loading) return <DashboardSkeleton />;

    if (!data) return (
        <div className="page-container">
            <div className="empty-state">
                <div className="empty-state-icon">📡</div>
                <h3>Could not reach the server</h3>
                <p>Make sure the backend is running on the correct port.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={loadDashboard}>
                    <HiOutlineRefresh size={16} /> Retry
                </button>
            </div>
        </div>
    );

    const { stats, todayEvents, tomorrowEvents, recentBookings, recentExpenses, chartData } = data;

    const statCards = [
        { label: 'Total Events',      value: stats.totalEvents,             icon: HiOutlineCalendar,          color: '#4f6ef3', bg: 'rgba(79,110,243,0.12)'   },
        { label: 'Upcoming Events',   value: stats.upcomingEvents,          icon: HiOutlineClock,             color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
        { label: "Today's Events",    value: stats.todaysEvents,            icon: HiOutlineCheckCircle,       color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'    },
        { label: 'Monthly Revenue',   value: fmt(stats.monthlyRevenue),     icon: HiOutlineCurrencyDollar,    color: '#10b981', bg: 'rgba(16,185,129,0.12)'   },
        { label: 'Total Revenue',     value: fmt(stats.totalRevenue),       icon: HiOutlineTrendingUp,        color: '#4f6ef3', bg: 'rgba(79,110,243,0.12)'   },
        { label: 'Total Expenses',    value: fmt(stats.totalExpenses),      icon: HiOutlineTrendingDown,      color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'    },
        { label: 'Net Profit',        value: fmt(stats.netProfit),          icon: HiOutlineCurrencyDollar,
          color: stats.netProfit >= 0 ? '#10b981' : '#f43f5e',
          bg:    stats.netProfit >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)' },
        { label: 'Pending Payments',  value: fmt(stats.pendingPayments),    icon: HiOutlineExclamationCircle, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'   },
    ];

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) return (
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 160
            }}>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 6, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, fontSize: '0.875rem', fontWeight: 600, marginTop: 3 }}>
                        {p.name}: {fmtFull(p.value)}
                    </p>
                ))}
            </div>
        );
        return null;
    };

    const gridStroke = 'var(--border-color)';
    const axisStroke = 'var(--text-muted)';

    return (
        <div className="page-container">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 5, fontSize: '0.9rem', fontWeight: 500 }}>
                        Welcome back! Here's your studio at a glance.
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={loadDashboard} style={{ gap: 8 }}>
                    <HiOutlineRefresh size={16} /> Refresh
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="stat-cards-grid">
                {statCards.map((card, i) => (
                    <div className="stat-card" key={i} style={{ animationDelay: `${i * 40}ms` }}>
                        <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
                            <card.icon size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">{card.label}</div>
                            <div className="stat-card-value">{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Charts ── */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>📈 Revenue &amp; Expenses</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor="#4f6ef3" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#4f6ef3" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                            <XAxis dataKey="month" stroke={axisStroke} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} tickFormatter={fmt} axisLine={false} tickLine={false} width={52} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '0.8rem', fontWeight: 600 }} />
                            <Area type="monotone" dataKey="revenue"  stroke="#4f6ef3" fill="url(#revGrad)" strokeWidth={2.5} dot={false} name="Revenue" />
                            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#expGrad)" strokeWidth={2.5} dot={false} name="Expenses" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>💰 Monthly Profit</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} barSize={22}>
                            <defs>
                                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor="#06b6d4" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#4f6ef3" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                            <XAxis dataKey="month" stroke={axisStroke} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} tickFormatter={fmt} axisLine={false} tickLine={false} width={52} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="profit" fill="url(#profGrad)" radius={[8, 8, 0, 0]} name="Profit" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Today & Tomorrow ── */}
            <div className="charts-grid">
                {[
                    { title: "📅 Today's Events", events: todayEvents, badgeClass: 'badge-primary' },
                    { title: "🔜 Tomorrow's Events", events: tomorrowEvents, badgeClass: 'badge-info' },
                ].map(({ title, events, badgeClass }) => (
                    <div className="card" key={title}>
                        <div className="section-header">
                            <h3 className="section-title">{title}</h3>
                            <span className={`badge ${badgeClass}`}>
                                <span className="badge-dot" /> {events.length} events
                            </span>
                        </div>
                        {events.length === 0
                            ? <div className="empty-state" style={{ padding: '24px 0' }}><p>No events scheduled</p></div>
                            : <div className="event-list">
                                {events.map(ev => (
                                    <div key={ev._id} className="event-list-item">
                                        <div className="event-list-time">{ev.eventTime || '--:--'}</div>
                                        <div className="event-list-info">
                                            <h4>{ev.clientName}</h4>
                                            <p>{ev.eventType} • {ev.venueName || 'No venue'}</p>
                                        </div>
                                        <span className={`badge ${ev.paymentStatus === 'Paid' ? 'badge-success' : ev.paymentStatus === 'Partial' ? 'badge-warning' : 'badge-danger'}`}>
                                            {ev.paymentStatus}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                ))}
            </div>

            {/* ── Recent Activity ── */}
            <div className="charts-grid" style={{ marginTop: 'var(--space-md)' }}>
                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title">🗓️ Recent Bookings</h3>
                    </div>
                    <div className="event-list">
                        {recentBookings.map(ev => (
                            <div key={ev._id} className="event-list-item">
                                <div className="event-list-info">
                                    <h4>{ev.clientName}</h4>
                                    <p>{ev.eventType} • {format(new Date(ev.eventDate), 'MMM dd, yyyy')}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{fmtFull(ev.totalAmount)}</div>
                                    <span className={`badge ${ev.status === 'Completed' ? 'badge-success' : ev.status === 'Cancelled' ? 'badge-danger' : 'badge-info'}`}>
                                        {ev.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title">💸 Recent Expenses</h3>
                    </div>
                    <div className="event-list">
                        {recentExpenses.map(exp => (
                            <div key={exp._id} className="event-list-item">
                                <div className="event-list-info">
                                    <h4>{exp.title}</h4>
                                    <p>{exp.category} • {format(new Date(exp.date), 'MMM dd, yyyy')}</p>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.9rem' }}>
                                    -{fmtFull(exp.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
