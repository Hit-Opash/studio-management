import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { fetchWorkers, createWorker, updateWorker, deleteWorker, fetchEventWorkers } from '../services/api';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../components/Skeleton';

const ROLES = ['Photographer', 'Videographer', 'Assistant', 'Editor'];
const SALARY_TYPES = ['Monthly', 'Per Event', 'Per Day'];

function Workers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerAssignments, setWorkerAssignments] = useState([]);

    const [form, setForm] = useState({
        name: '', phone: '', email: '', role: 'Photographer', salaryType: 'Per Event', salaryAmount: 0
    });

    const loadWorkers = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterRole) params.role = filterRole;
            const res = await fetchWorkers(params);
            setWorkers(res.data);
        } catch (err) { toast.error('Failed to load workers'); }
        finally { setLoading(false); }
    }, [search, filterRole]);

    useEffect(() => { loadWorkers(); }, [loadWorkers]);

    const openCreate = () => { setForm({ name: '', phone: '', email: '', role: 'Photographer', salaryType: 'Per Event', salaryAmount: 0 }); setEditingWorker(null); setShowForm(true); };

    const openEdit = (w) => {
        setForm({ name: w.name, phone: w.phone || '', email: w.email || '', role: w.role, salaryType: w.salaryType, salaryAmount: w.salaryAmount });
        setEditingWorker(w);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, salaryAmount: Number(form.salaryAmount) };
            if (editingWorker) {
                await updateWorker(editingWorker._id, payload);
                toast.success('Worker updated!');
            } else {
                await createWorker(payload);
                toast.success('Worker added!');
            }
            setShowForm(false);
            loadWorkers();
        } catch (err) { toast.error('Failed to save worker'); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteWorker(id);
            toast.success('Worker removed');
            setShowDeleteConfirm(null);
            loadWorkers();
        } catch (err) { toast.error('Failed to delete'); }
    };

    const viewSchedule = async (worker) => {
        try {
            const res = await fetchEventWorkers({ worker: worker._id });
            setWorkerAssignments(res.data);
            setSelectedWorker(worker);
        } catch (err) { toast.error('Failed to load schedule'); }
    };

    const getRoleBadge = (role) => {
        const map = { Photographer: 'badge-primary', Videographer: 'badge-secondary', Assistant: 'badge-info', Editor: 'badge-warning' };
        return map[role] || 'badge-primary';
    };

    if (loading) return <PageSkeleton cols={5} rows={4} />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Workers</h1>
                <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Worker</button>
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-search">
                        <HiOutlineSearch size={18} />
                        <input placeholder="Search workers..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="table-filters">
                        <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                            <option value="">All Roles</option>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                {workers.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No workers found</h3><p>Add your team members</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr><th>Name</th><th>Contact</th><th>Role</th><th>Salary</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {workers.map(w => (
                                    <tr key={w._id}>
                                        <td style={{ fontWeight: 500 }}>{w.name}</td>
                                        <td>
                                            <div>{w.phone}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.email}</div>
                                        </td>
                                        <td><span className={`badge ${getRoleBadge(w.role)}`}>{w.role}</span></td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>₹{(w.salaryAmount || 0).toLocaleString('en-IN')}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.salaryType}</div>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-sm btn-secondary" onClick={() => viewSchedule(w)}>Schedule</button>
                                                <button className="btn-icon" onClick={() => openEdit(w)}><HiOutlinePencil size={16} /></button>
                                                <button className="btn-icon" onClick={() => setShowDeleteConfirm(w._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Worker Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingWorker ? 'Edit Worker' : 'Add Worker'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Worker name" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="worker@email.com" />
                                    </div>
                                </div>
                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Role *</label>
                                        <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Salary Type</label>
                                        <select className="form-select" value={form.salaryType} onChange={e => setForm({ ...form, salaryType: e.target.value })}>
                                            {SALARY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Salary Amount</label>
                                        <input className="form-input" type="number" value={form.salaryAmount} onChange={e => setForm({ ...form, salaryAmount: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingWorker ? 'Update' : 'Add Worker'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {selectedWorker && (
                <div className="modal-overlay" onClick={() => setSelectedWorker(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedWorker.name} — Schedule</h2>
                            <button className="modal-close" onClick={() => setSelectedWorker(null)}><HiOutlineX size={20} /></button>
                        </div>
                        <div className="modal-body">
                            {workerAssignments.length === 0 ? (
                                <div className="empty-state"><p>No event assignments found</p></div>
                            ) : (
                                <div className="event-list">
                                    {workerAssignments.map(a => (
                                        <div key={a._id} className="event-list-item">
                                            <div className="event-list-info">
                                                <h4>{a.event?.clientName || 'Unknown Event'}</h4>
                                                <p>{a.event?.eventType} • {a.role}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>₹{(a.payment || 0).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.event?.eventDate ? new Date(a.event.eventDate).toLocaleDateString() : ''}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-body">
                            <div className="delete-confirm-content">
                                <div className="delete-confirm-icon">⚠️</div>
                                <h3>Remove Worker?</h3>
                                <p>This will permanently remove this worker from the system.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Workers;
