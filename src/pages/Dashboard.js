import React, { useState, useEffect } from 'react';
import {
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineExclamationCircle,
    HiOutlineCheckCircle,
    HiOutlineLocationMarker
} from 'react-icons/hi';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { fetchDashboard } from '../services/api';
import { format } from 'date-fns';

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await fetchDashboard();
            setData(res.data);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
        if (val >= 1000) return '₹' + (val / 1000).toFixed(1) + 'K';
        return '₹' + val;
    };

    const formatFullCurrency = (val) => '₹' + (val || 0).toLocaleString('en-IN');

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-spinner"><div className="spinner"></div></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <h3>Unable to load dashboard</h3>
                    <p>Make sure the backend server is running</p>
                </div>
            </div>
        );
    }

    const { stats, todayEvents, tomorrowEvents, recentBookings, recentExpenses, chartData } = data;

    const statCards = [
        { label: 'Total Events', value: stats.totalEvents, icon: HiOutlineCalendar, color: '#6c5ce7', bg: 'rgba(108,92,231,0.15)' },
        { label: 'Upcoming Events', value: stats.upcomingEvents, icon: HiOutlineClock, color: '#74b9ff', bg: 'rgba(116,185,255,0.15)' },
        { label: "Today's Events", value: stats.todaysEvents, icon: HiOutlineCheckCircle, color: '#00cec9', bg: 'rgba(0,206,201,0.15)' },
        { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: HiOutlineCurrencyDollar, color: '#00b894', bg: 'rgba(0,184,148,0.15)' },
        { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: HiOutlineTrendingUp, color: '#6c5ce7', bg: 'rgba(108,92,231,0.15)' },
        { label: 'Total Expenses', value: formatCurrency(stats.totalExpenses), icon: HiOutlineTrendingDown, color: '#e17055', bg: 'rgba(225,112,85,0.15)' },
        { label: 'Net Profit', value: formatCurrency(stats.netProfit), icon: HiOutlineCurrencyDollar, color: stats.netProfit >= 0 ? '#00b894' : '#e17055', bg: stats.netProfit >= 0 ? 'rgba(0,184,148,0.15)' : 'rgba(225,112,85,0.15)' },
        { label: 'Pending Payments', value: formatCurrency(stats.pendingPayments), icon: HiOutlineExclamationCircle, color: '#fdcb6e', bg: 'rgba(253,203,110,0.15)' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#1a1a2e',
                    border: '1px solid #2a2a3e',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                }}>
                    <p style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: 4 }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color, fontSize: '0.85rem' }}>
                            {p.name}: {formatFullCurrency(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards-grid">
                {statCards.map((card, i) => (
                    <div className="stat-card" key={i}>
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

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Revenue & Expenses Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#e17055" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#e17055" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                            <XAxis dataKey="month" stroke="#5a5a72" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#5a5a72" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#6c5ce7" fill="url(#revenueGrad)" strokeWidth={2} name="Revenue" />
                            <Area type="monotone" dataKey="expenses" stroke="#e17055" fill="url(#expenseGrad)" strokeWidth={2} name="Expenses" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Monthly Profit</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                            <XAxis dataKey="month" stroke="#5a5a72" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#5a5a72" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="profit" fill="#00cec9" radius={[6, 6, 0, 0]} name="Profit" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Today & Tomorrow Events */}
            <div className="charts-grid">
                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title">📅 Today's Events</h3>
                        <span className="badge badge-primary"><span className="badge-dot"></span>{todayEvents.length} events</span>
                    </div>
                    {todayEvents.length === 0 ? (
                        <div className="empty-state" style={{ padding: '24px 0' }}>
                            <p>No events scheduled for today</p>
                        </div>
                    ) : (
                        <div className="event-list">
                            {todayEvents.map(ev => (
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
                    )}
                </div>

                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title">🔜 Tomorrow's Events</h3>
                        <span className="badge badge-info"><span className="badge-dot"></span>{tomorrowEvents.length} events</span>
                    </div>
                    {tomorrowEvents.length === 0 ? (
                        <div className="empty-state" style={{ padding: '24px 0' }}>
                            <p>No events scheduled for tomorrow</p>
                        </div>
                    ) : (
                        <div className="event-list">
                            {tomorrowEvents.map(ev => (
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
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="charts-grid" style={{ marginTop: 'var(--space-md)' }}>
                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title">Recent Bookings</h3>
                    </div>
                    <div className="event-list">
                        {recentBookings.map(ev => (
                            <div key={ev._id} className="event-list-item">
                                <div className="event-list-info">
                                    <h4>{ev.clientName}</h4>
                                    <p>{ev.eventType} • {format(new Date(ev.eventDate), 'MMM dd, yyyy')}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-white)', fontSize: '0.9rem' }}>{formatFullCurrency(ev.totalAmount)}</div>
                                    <span className={`badge badge-sm ${ev.status === 'Completed' ? 'badge-success' : ev.status === 'Cancelled' ? 'badge-danger' : 'badge-info'}`}>
                                        {ev.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title">Recent Expenses</h3>
                    </div>
                    <div className="event-list">
                        {recentExpenses.map(exp => (
                            <div key={exp._id} className="event-list-item">
                                <div className="event-list-info">
                                    <h4>{exp.title}</h4>
                                    <p>{exp.category} • {format(new Date(exp.date), 'MMM dd, yyyy')}</p>
                                </div>
                                <div style={{ fontWeight: 600, color: '#e17055', fontSize: '0.9rem' }}>
                                    -{formatFullCurrency(exp.amount)}
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
