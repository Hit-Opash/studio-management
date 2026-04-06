import React, { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { fetchDocuments, createDocument, deleteDocument, fetchEvents } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../components/Skeleton';

function Documents() {
    const [docs, setDocs] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ event: '', fileName: '', fileType: 'Other', notes: '' });

    useEffect(() => {
        Promise.all([fetchDocuments(), fetchEvents()])
            .then(([d, e]) => { setDocs(d.data); setEvents(e.data); })
            .catch(() => toast.error('Failed'))
            .finally(() => setLoading(false));
    }, []);

    const load = async () => { const r = await fetchDocuments(); setDocs(r.data); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try { await createDocument(form); toast.success('Added!'); setShowForm(false); load(); }
        catch { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        try { await deleteDocument(id); toast.success('Deleted'); load(); }
        catch { toast.error('Failed'); }
    };

    const typeBadge = (t) => ({ Contract: 'badge-primary', Invoice: 'badge-success', 'Client Document': 'badge-info', 'Event Schedule': 'badge-warning' }[t] || 'badge-secondary');

    if (loading) return <PageSkeleton cols={6} rows={5} />;

    return (
        <div className="page-container">
            <div className="page-header"><h1>Documents</h1><button className="btn btn-primary" onClick={() => { setForm({ event: '', fileName: '', fileType: 'Other', notes: '' }); setShowForm(true); }}><HiOutlinePlus size={18} /> Add Document</button></div>
            <div className="table-container">
                {docs.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">📄</div><h3>No documents</h3><p>Manage event documents</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead><tr><th>File Name</th><th>Type</th><th>Event</th><th>Date</th><th>Notes</th><th>Actions</th></tr></thead>
                            <tbody>
                                {docs.map(d => (
                                    <tr key={d._id}>
                                        <td style={{ fontWeight: 500 }}>{d.fileName}</td>
                                        <td><span className={`badge ${typeBadge(d.fileType)}`}>{d.fileType}</span></td>
                                        <td>{d.event?.clientName || '-'}</td>
                                        <td>{format(new Date(d.uploadDate), 'MMM dd, yyyy')}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{d.notes || '-'}</td>
                                        <td><button className="btn-icon" onClick={() => handleDelete(d._id)} style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button></td>
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
                        <div className="modal-header"><h2>Add Document</h2><button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="form-label">File Name *</label><input className="form-input" required value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} /></div>
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">File Type</label><select className="form-select" value={form.fileType} onChange={e => setForm({ ...form, fileType: e.target.value })}><option>Contract</option><option>Invoice</option><option>Client Document</option><option>Event Schedule</option><option>Other</option></select></div>
                                    <div className="form-group"><label className="form-label">Event</label><select className="form-select" value={form.event} onChange={e => setForm({ ...form, event: e.target.value })}><option value="">None</option>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.clientName} - {ev.eventType}</option>)}</select></div>
                                </div>
                                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add Document</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Documents;
