import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { fetchEquipment, createEquipment, updateEquipment, deleteEquipment } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

function Equipment() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showDelete, setShowDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [form, setForm] = useState({ name: '', brand: '', model: '', serialNumber: '', purchaseDate: '', purchasePrice: '', status: 'Available', notes: '' });

    const load = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterStatus) params.status = filterStatus;
            const res = await fetchEquipment(params);
            setItems(res.data);
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    }, [search, filterStatus]);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setForm({ name: '', brand: '', model: '', serialNumber: '', purchaseDate: '', purchasePrice: '', status: 'Available', notes: '' }); setEditing(null); setShowForm(true); };
    const openEdit = (item) => {
        setForm({ name: item.name, brand: item.brand || '', model: item.model || '', serialNumber: item.serialNumber || '', purchaseDate: item.purchaseDate ? format(new Date(item.purchaseDate), 'yyyy-MM-dd') : '', purchasePrice: item.purchasePrice || '', status: item.status, notes: item.notes || '' });
        setEditing(item); setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, purchasePrice: Number(form.purchasePrice) || 0 };
            if (editing) { await updateEquipment(editing._id, payload); toast.success('Updated!'); }
            else { await createEquipment(payload); toast.success('Added!'); }
            setShowForm(false); load();
        } catch { toast.error('Failed to save'); }
    };

    const handleDelete = async (id) => {
        try { await deleteEquipment(id); toast.success('Deleted'); setShowDelete(null); load(); }
        catch { toast.error('Failed'); }
    };

    const statusBadge = (s) => s === 'Available' ? 'badge-success' : s === 'In Use' ? 'badge-info' : 'badge-warning';

    if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Equipment</h1>
                <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> Add Equipment</button>
            </div>
            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-search"><HiOutlineSearch size={18} /><input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                    <div className="table-filters">
                        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="Available">Available</option><option value="In Use">In Use</option><option value="Under Repair">Under Repair</option>
                        </select>
                    </div>
                </div>
                {items.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">📷</div><h3>No equipment</h3><p>Add your gear</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>Name</th><th>Brand / Model</th><th>Serial</th><th>Purchase</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item._id}>
                                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                                        <td><div>{item.brand}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.model}</div></td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.serialNumber || '-'}</td>
                                        <td><div style={{ fontWeight: 500 }}>₹{(item.purchasePrice || 0).toLocaleString('en-IN')}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.purchaseDate ? format(new Date(item.purchaseDate), 'MMM yyyy') : '-'}</div></td>
                                        <td><span className={`badge ${statusBadge(item.status)}`}><span className="badge-dot"></span>{item.status}</span></td>
                                        <td><div className="table-actions"><button className="btn-icon" onClick={() => openEdit(item)}><HiOutlinePencil size={16} /></button><button className="btn-icon" onClick={() => setShowDelete(item._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button></div></td>
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
                        <div className="modal-header"><h2>{editing ? 'Edit Equipment' : 'Add Equipment'}</h2><button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="form-row"><div className="form-group"><label className="form-label">Brand</label><input className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div><div className="form-group"><label className="form-label">Model</label><input className="form-input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} /></div></div>
                                <div className="form-row"><div className="form-group"><label className="form-label">Serial Number</label><input className="form-input" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} /></div><div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>Available</option><option>In Use</option><option>Under Repair</option></select></div></div>
                                <div className="form-row"><div className="form-group"><label className="form-label">Purchase Date</label><input className="form-input" type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></div><div className="form-group"><label className="form-label">Purchase Price</label><input className="form-input" type="number" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} /></div></div>
                                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showDelete && (
                <div className="modal-overlay" onClick={() => setShowDelete(null)}><div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}><div className="modal-body"><div className="delete-confirm-content"><div className="delete-confirm-icon">⚠️</div><h3>Delete Equipment?</h3><p>This cannot be undone.</p></div></div><div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={() => handleDelete(showDelete)}>Delete</button></div></div></div>
            )}
        </div>
    );
}

export default Equipment;
