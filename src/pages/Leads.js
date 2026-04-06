import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { fetchLeads, createLead, updateLead, deleteLead } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../components/Skeleton';

function Leads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [form, setForm] = useState({ clientName: '', phone: '', email: '', eventType: '', eventDate: '', budget: '', source: '', status: 'New', notes: '' });

    const load = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterStatus) params.status = filterStatus;
            const res = await fetchLeads(params);
            setLeads(res.data);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    }, [search, filterStatus]);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setForm({ clientName: '', phone: '', email: '', eventType: '', eventDate: '', budget: '', source: '', status: 'New', notes: '' }); setEditing(null); setShowForm(true); };
    const openEdit = (l) => {
        setForm({ clientName: l.clientName, phone: l.phone || '', email: l.email || '', eventType: l.eventType || '', eventDate: l.eventDate ? format(new Date(l.eventDate), 'yyyy-MM-dd') : '', budget: l.budget || '', source: l.source || '', status: l.status, notes: l.notes || '' });
        setEditing(l); setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, budget: Number(form.budget) || 0 };
            if (editing) { await updateLead(editing._id, payload); toast.success('Updated!'); }
            else { await createLead(payload); toast.success('Added!'); }
            setShowForm(false); load();
        } catch { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        try { await deleteLead(id); toast.success('Deleted'); load(); }
        catch { toast.error('Failed'); }
    };

    const statusBadge = (s) => ({ New: 'badge-info', 'Follow Up': 'badge-warning', Converted: 'badge-success', Closed: 'badge-danger' }[s] || 'badge-primary');

    if (loading) return <PageSkeleton cols={7} rows={5} />;

    return (
        <div className="page-container">
            <div className="page-header"><h1>Leads & Inquiries</h1><button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Lead</button></div>
            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-search"><HiOutlineSearch size={18} /><input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                    <div className="table-filters">
                        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All Status</option><option>New</option><option>Follow Up</option><option>Converted</option><option>Closed</option>
                        </select>
                    </div>
                </div>
                {leads.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🎯</div><h3>No leads</h3><p>Track potential clients</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Client</th><th>Contact</th><th>Event</th><th>Budget</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {leads.map(l => (
                                    <tr key={l._id}>
                                        <td style={{ fontWeight: 500 }}>{l.clientName}</td>
                                        <td><div>{l.phone}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.email}</div></td>
                                        <td><div>{l.eventType || '-'}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.eventDate ? format(new Date(l.eventDate), 'MMM dd, yyyy') : '-'}</div></td>
                                        <td style={{ fontWeight: 500 }}>{l.budget ? `₹${l.budget.toLocaleString('en-IN')}` : '-'}</td>
                                        <td>{l.source || '-'}</td>
                                        <td><span className={`badge ${statusBadge(l.status)}`}><span className="badge-dot"></span>{l.status}</span></td>
                                        <td><div className="table-actions"><button className="btn-icon" onClick={() => openEdit(l)}><HiOutlinePencil size={16} /></button><button className="btn-icon" onClick={() => handleDelete(l._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button></div></td>
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
                        <div className="modal-header"><h2>{editing ? 'Edit Lead' : 'Add Lead'}</h2><button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Client Name *</label><input className="form-input" required value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} /></div>
                                <div className="form-row"><div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div><div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div></div>
                                <div className="form-row-3"><div className="form-group"><label className="form-label">Event Type</label><input className="form-input" value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })} /></div><div className="form-group"><label className="form-label">Event Date</label><input className="form-input" type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} /></div><div className="form-group"><label className="form-label">Budget</label><input className="form-input" type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} /></div></div>
                                <div className="form-row"><div className="form-group"><label className="form-label">Source</label><input className="form-input" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Instagram, Referral..." /></div><div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>New</option><option>Follow Up</option><option>Converted</option><option>Closed</option></select></div></div>
                                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Lead'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Leads;
