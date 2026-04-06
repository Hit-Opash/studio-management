import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { fetchPayments, createPayment, deletePayment, fetchEvents } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ event: '', amount: '', paymentMethod: 'Cash', notes: '' });

    useEffect(() => {
        Promise.all([fetchPayments(), fetchEvents()])
            .then(([pRes, eRes]) => { setPayments(pRes.data); setEvents(eRes.data); })
            .catch(() => toast.error('Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const reload = async () => {
        const res = await fetchPayments();
        setPayments(res.data);
        const eRes = await fetchEvents();
        setEvents(eRes.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPayment({ ...form, amount: Number(form.amount) });
            toast.success('Payment recorded!');
            setShowForm(false);
            reload();
        } catch (err) { toast.error('Failed to save payment'); }
    };

    const handleDelete = async (id) => {
        try {
            await deletePayment(id);
            toast.success('Payment deleted');
            reload();
        } catch (err) { toast.error('Failed to delete'); }
    };

    const getMethodBadge = (m) => {
        const map = { Cash: 'badge-success', 'Bank Transfer': 'badge-info', UPI: 'badge-primary', Card: 'badge-secondary', Cheque: 'badge-warning' };
        return map[m] || 'badge-primary';
    };

    if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Payments</h1>
                <button className="btn btn-primary" onClick={() => { setForm({ event: '', amount: '', paymentMethod: 'Cash', notes: '' }); setShowForm(true); }}>
                    <HiOutlinePlus size={18} /> Record Payment
                </button>
            </div>

            <div className="table-container">
                {payments.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">💳</div><h3>No payments recorded</h3><p>Record client payments</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Client</th><th>Event</th><th>Amount</th><th>Method</th><th>Date</th><th>Notes</th><th>Actions</th></tr></thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p._id}>
                                        <td style={{ fontWeight: 500 }}>{p.event?.clientName || '-'}</td>
                                        <td>{p.event?.eventType || '-'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                                        <td><span className={`badge ${getMethodBadge(p.paymentMethod)}`}>{p.paymentMethod}</span></td>
                                        <td>{format(new Date(p.paymentDate), 'MMM dd, yyyy')}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{p.notes || '-'}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => handleDelete(p._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Record Payment</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Event *</label>
                                    <select className="form-select" required value={form.event} onChange={e => setForm({ ...form, event: e.target.value })}>
                                        <option value="">Select event</option>
                                        {events.map(ev => (
                                            <option key={ev._id} value={ev._id}>
                                                {ev.clientName} - {ev.eventType} (Remaining: ₹{(ev.remainingPayment || 0).toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Amount *</label>
                                        <input className="form-input" type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Method</label>
                                        <select className="form-select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                                            {['Cash', 'Bank Transfer', 'UPI', 'Card', 'Cheque', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Record Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Payments;
