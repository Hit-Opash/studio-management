import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { fetchPackages, createPackage, updatePackage, deletePackage } from '../services/api';
import { toast } from 'react-toastify';

function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', includedServices: '', duration: '', notes: '' });

    useEffect(() => { load(); }, []);
    const load = async () => {
        try { const res = await fetchPackages(); setPackages(res.data); }
        catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm({ name: '', description: '', price: '', includedServices: '', duration: '', notes: '' }); setEditing(null); setShowForm(true); };
    const openEdit = (pkg) => {
        setForm({ name: pkg.name, description: pkg.description || '', price: pkg.price, includedServices: (pkg.includedServices || []).join(', '), duration: pkg.duration || '', notes: pkg.notes || '' });
        setEditing(pkg); setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, price: Number(form.price), includedServices: form.includedServices.split(',').map(s => s.trim()).filter(Boolean) };
            if (editing) { await updatePackage(editing._id, payload); toast.success('Updated!'); }
            else { await createPackage(payload); toast.success('Created!'); }
            setShowForm(false); load();
        } catch { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        try { await deletePackage(id); toast.success('Deleted'); load(); }
        catch { toast.error('Failed'); }
    };

    if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

    return (
        <div className="page-container">
            <div className="page-header"><h1>Packages</h1><button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> New Package</button></div>

            {packages.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📦</div><h3>No packages</h3><p>Create service packages</p></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
                    {packages.map(pkg => (
                        <div key={pkg._id} className="card" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-white)' }}>{pkg.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{pkg.description || 'No description'}</p>
                                </div>
                                <div className="table-actions">
                                    <button className="btn-icon" onClick={() => openEdit(pkg)}><HiOutlinePencil size={16} /></button>
                                    <button className="btn-icon" onClick={() => handleDelete(pkg._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }}>₹{pkg.price.toLocaleString('en-IN')}</div>
                            {pkg.duration && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>⏱ {pkg.duration}</div>}
                            {pkg.includedServices?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'var(--space-sm)' }}>
                                    {pkg.includedServices.map((s, i) => (
                                        <span key={i} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>✓ {s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>{editing ? 'Edit Package' : 'New Package'}</h2><button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea></div>
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Price *</label><input className="form-input" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                                    <div className="form-group"><label className="form-label">Duration</label><input className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="Full day / 4 hours" /></div>
                                </div>
                                <div className="form-group"><label className="form-label">Included Services (comma-separated)</label><input className="form-input" value={form.includedServices} onChange={e => setForm({ ...form, includedServices: e.target.value })} placeholder="e.g. 300 photos, Drone shots, Album" /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Packages;
