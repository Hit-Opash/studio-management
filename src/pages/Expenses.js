import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../components/Skeleton';

function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [form, setForm] = useState({ title: '', category: 'Travel', amount: '', date: '', notes: '' });

    const load = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterCategory) params.category = filterCategory;
            const res = await fetchExpenses(params);
            setExpenses(res.data.expenses || []);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    }, [search, filterCategory]);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setForm({ title: '', category: 'Travel', amount: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' }); setEditing(null); setShowForm(true); };
    const openEdit = (ex) => {
        setForm({ title: ex.title, category: ex.category, amount: ex.amount, date: format(new Date(ex.date), 'yyyy-MM-dd'), notes: ex.notes || '' });
        setEditing(ex); setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, amount: Number(form.amount) };
            if (editing) { await updateExpense(editing._id, payload); toast.success('Updated!'); }
            else { await createExpense(payload); toast.success('Added!'); }
            setShowForm(false); load();
        } catch { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        try { await deleteExpense(id); toast.success('Deleted'); load(); }
        catch { toast.error('Failed'); }
    };

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const catBadge = (c) => ({ Travel: 'badge-primary', Marketing: 'badge-info', Equipment: 'badge-warning', Salary: 'badge-success', Rent: 'badge-danger' }[c] || 'badge-secondary');

    if (loading) return <PageSkeleton cols={5} rows={6} />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Expenses</h1>
                <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Expense</button>
            </div>

            <div className="stat-cards-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-label">Total Expenses (Filtered)</div>
                        <div className="stat-card-value" style={{ color: '#e17055' }}>₹{total.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-search"><HiOutlineSearch size={18} /><input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                    <div className="table-filters">
                        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            <option>Travel</option><option>Marketing</option><option>Equipment</option><option>Salary</option><option>Rent</option><option>Other</option>
                        </select>
                    </div>
                </div>
                {expenses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💸</div>
                        <h3>No expenses found</h3>
                        <p>Try adjusting your search or add a new expense.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th>Actions</th></tr></thead>
                            <tbody>
                                {expenses.map(ex => (
                                    <tr key={ex._id}>
                                        <td style={{ fontWeight: 500 }}>{ex.title}</td>
                                        <td><span className={`badge ${catBadge(ex.category)}`}><span className="badge-dot"></span>{ex.category}</span></td>
                                        <td>{format(new Date(ex.date), 'MMM dd, yyyy')}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>₹{ex.amount.toLocaleString('en-IN')}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon" onClick={() => openEdit(ex)}><HiOutlinePencil size={16} /></button>
                                                <button className="btn-icon" onClick={() => handleDelete(ex._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button>
                                            </div>
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
                        <div className="modal-header"><h2>{editing ? 'Edit Expense' : 'Add Expense'}</h2><button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Title *</label><input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option>Travel</option><option>Marketing</option><option>Equipment</option><option>Salary</option><option>Rent</option><option>Other</option></select></div>
                                    <div className="form-group"><label className="form-label">Amount *</label><input className="form-input" type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
                                </div>
                                <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Expense'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Expenses;
