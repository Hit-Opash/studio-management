import React, { useState } from 'react';
import { HiOutlineDocumentReport, HiOutlineDownload } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { fetchReport } from '../services/api';
import { toast } from 'react-toastify';

const CHART_COLORS = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#74b9ff', '#e17055', '#00b894'];

function Reports() {
    const [reportType, setReportType] = useState('revenue');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadReport = async () => {
        setLoading(true);
        try {
            const params = { type: reportType };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const res = await fetchReport(params);
            setData(res.data);
        } catch { toast.error('Failed to load report'); }
        finally { setLoading(false); }
    };

    const fmt = (v) => '₹' + (v || 0).toLocaleString('en-IN');

    const exportCSV = () => {
        if (!data) return;
        let csv = '';
        if (reportType === 'revenue' && data.monthly) {
            csv = 'Month,Revenue,Events\n' + data.monthly.map(m => `${m.month},${m.revenue},${m.count}`).join('\n');
        } else if (reportType === 'expense' && data.byCategory) {
            csv = 'Category,Total,Count\n' + data.byCategory.map(c => `${c.category},${c.total},${c.count}`).join('\n');
        } else if (reportType === 'profit' && data.monthly) {
            csv = 'Month,Revenue,Expenses,Profit\n' + data.monthly.map(m => `${m.month},${m.revenue},${m.expenses},${m.profit}`).join('\n');
        }
        if (csv) {
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${reportType}_report.csv`; a.click();
            toast.success('Report exported!');
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 10, padding: '12px 16px' }}>
                    <p style={{ color: '#f0f0f5', fontWeight: 600 }}>{label}</p>
                    {payload.map((p, i) => <p key={i} style={{ color: p.color, fontSize: '0.85rem' }}>{p.name}: {fmt(p.value)}</p>)}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page-container">
            <div className="page-header"><h1>Reports</h1>
                {data && <button className="btn btn-secondary" onClick={exportCSV}><HiOutlineDownload size={18} /> Export CSV</button>}
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Report Type</label>
                        <select className="form-select" value={reportType} onChange={e => { setReportType(e.target.value); setData(null); }}>
                            <option value="revenue">Revenue Report</option><option value="expense">Expense Report</option>
                            <option value="profit">Profit Report</option><option value="event">Event Report</option>
                            <option value="worker">Worker Performance</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Start Date</label>
                        <input className="form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">End Date</label>
                        <input className="form-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={loadReport} disabled={loading}>
                        <HiOutlineDocumentReport size={18} /> {loading ? 'Loading...' : 'Generate'}
                    </button>
                </div>
            </div>

            {data && reportType === 'revenue' && (
                <div>
                    <div className="stat-cards-grid">
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Revenue</div><div className="stat-card-value">{fmt(data.total)}</div></div></div>
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Received</div><div className="stat-card-value" style={{ color: 'var(--color-success)' }}>{fmt(data.received)}</div></div></div>
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Pending</div><div className="stat-card-value" style={{ color: 'var(--color-warning)' }}>{fmt(data.pending)}</div></div></div>
                    </div>
                    {data.monthly?.length > 0 && (
                        <div className="chart-card"><h3>Monthly Revenue</h3>
                            <ResponsiveContainer width="100%" height={300}><BarChart data={data.monthly}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" /><XAxis dataKey="month" stroke="#5a5a72" /><YAxis stroke="#5a5a72" /><Tooltip content={<CustomTooltip />} /><Bar dataKey="revenue" fill="#6c5ce7" radius={[6, 6, 0, 0]} name="Revenue" /></BarChart></ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {data && reportType === 'expense' && (
                <div>
                    <div className="stat-cards-grid">
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Expenses</div><div className="stat-card-value" style={{ color: '#e17055' }}>{fmt(data.total)}</div></div></div>
                    </div>
                    {data.byCategory?.length > 0 && (
                        <div className="charts-grid">
                            <div className="chart-card"><h3>By Category</h3>
                                <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data.byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                                    {data.byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                            </div>
                            <div className="chart-card"><h3>Monthly Expenses</h3>
                                <ResponsiveContainer width="100%" height={300}><BarChart data={data.monthly}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" /><XAxis dataKey="month" stroke="#5a5a72" /><YAxis stroke="#5a5a72" /><Tooltip content={<CustomTooltip />} /><Bar dataKey="expenses" fill="#e17055" radius={[6, 6, 0, 0]} name="Expenses" /></BarChart></ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {data && reportType === 'profit' && (
                <div>
                    <div className="stat-cards-grid">
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Revenue</div><div className="stat-card-value">{fmt(data.totalRevenue)}</div></div></div>
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Expenses</div><div className="stat-card-value" style={{ color: '#e17055' }}>{fmt(data.totalExpenses)}</div></div></div>
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Worker Pay</div><div className="stat-card-value" style={{ color: 'var(--color-warning)' }}>{fmt(data.totalWorkerPayments)}</div></div></div>
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Net Profit</div><div className="stat-card-value" style={{ color: data.netProfit >= 0 ? 'var(--color-success)' : '#e17055' }}>{fmt(data.netProfit)}</div></div></div>
                    </div>
                    {data.monthly?.length > 0 && (
                        <div className="chart-card"><h3>Monthly Profit Breakdown</h3>
                            <ResponsiveContainer width="100%" height={300}><BarChart data={data.monthly}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" /><XAxis dataKey="month" stroke="#5a5a72" /><YAxis stroke="#5a5a72" /><Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="revenue" fill="#6c5ce7" name="Revenue" /><Bar dataKey="expenses" fill="#e17055" name="Expenses" /><Bar dataKey="profit" fill="#00cec9" name="Profit" /></BarChart></ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {data && reportType === 'event' && (
                <div>
                    <div className="stat-cards-grid">
                        <div className="stat-card"><div className="stat-card-content"><div className="stat-card-label">Total Events</div><div className="stat-card-value">{data.total}</div></div></div>
                        {data.byStatus && Object.entries(data.byStatus).map(([k, v]) => (
                            <div key={k} className="stat-card"><div className="stat-card-content"><div className="stat-card-label">{k}</div><div className="stat-card-value">{v}</div></div></div>
                        ))}
                    </div>
                    {data.byType && (
                        <div className="chart-card"><h3>Events by Type</h3>
                            <ResponsiveContainer width="100%" height={300}><BarChart data={Object.entries(data.byType).map(([k, v]) => ({ type: k, count: v }))}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" /><XAxis dataKey="type" stroke="#5a5a72" /><YAxis stroke="#5a5a72" /><Tooltip /><Bar dataKey="count" fill="#6c5ce7" radius={[6, 6, 0, 0]} name="Events" /></BarChart></ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {data && reportType === 'worker' && (
                <div>
                    {data.byWorker?.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Worker</th><th>Role</th><th>Events</th><th>Total Payments</th></tr></thead>
                                <tbody>
                                    {data.byWorker.map((w, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{w.worker?.name}</td>
                                            <td><span className="badge badge-primary">{w.worker?.role}</span></td>
                                            <td>{w.eventCount}</td>
                                            <td style={{ fontWeight: 600 }}>{fmt(w.totalPayment)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <div className="empty-state"><p>No worker data for this period</p></div>}
                </div>
            )}

            {!data && !loading && (
                <div className="empty-state"><div className="empty-state-icon">📊</div><h3>Select a report type</h3><p>Choose a report and click Generate</p></div>
            )}
        </div>
    );
}

export default Reports;
