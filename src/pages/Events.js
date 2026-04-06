import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineX } from 'react-icons/hi';
import { fetchEvents, createEvent, updateEvent, deleteEvent, fetchPackages } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const EVENT_TYPES = ['Wedding', 'Pre-Wedding', 'Birthday', 'Corporate', 'Engagement', 'Baby Shower', 'Portrait', 'Product', 'Fashion', 'Other'];

function Events() {
    const [events, setEvents] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterPayment, setFilterPayment] = useState('');

    const [form, setForm] = useState({
        clientName: '', clientPhone: '', clientEmail: '', clientAddress: '',
        eventType: 'Wedding', eventDate: '', eventTime: '', eventDuration: '',
        venueName: '', venueAddress: '', latitude: '', longitude: '', eventNotes: '',
        packageId: '', packagePrice: 0, extraCharges: 0, discount: 0,
        advancePayment: 0, status: 'Upcoming'
    });

    const loadEvents = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterStatus) params.status = filterStatus;
            if (filterType) params.eventType = filterType;
            if (filterPayment) params.paymentStatus = filterPayment;
            const res = await fetchEvents(params);
            setEvents(res.data);
        } catch (err) {
            toast.error('Failed to load events');
        } finally { setLoading(false); }
    }, [search, filterStatus, filterType, filterPayment]);

    useEffect(() => { loadEvents(); }, [loadEvents]);
    useEffect(() => { fetchPackages().then(r => setPackages(r.data)).catch(() => { }); }, []);

    const resetForm = () => {
        setForm({ clientName: '', clientPhone: '', clientEmail: '', clientAddress: '', eventType: 'Wedding', eventDate: '', eventTime: '', eventDuration: '', venueName: '', venueAddress: '', latitude: '', longitude: '', eventNotes: '', packageId: '', packagePrice: 0, extraCharges: 0, discount: 0, advancePayment: 0, status: 'Upcoming' });
        setEditingEvent(null);
    };

    const openCreate = () => { resetForm(); setShowForm(true); };
    const openEdit = (ev) => {
        setForm({
            clientName: ev.clientName || '', clientPhone: ev.clientPhone || '', clientEmail: ev.clientEmail || '', clientAddress: ev.clientAddress || '',
            eventType: ev.eventType || 'Wedding', eventDate: ev.eventDate ? format(new Date(ev.eventDate), 'yyyy-MM-dd') : '', eventTime: ev.eventTime || '', eventDuration: ev.eventDuration || '',
            venueName: ev.venueName || '', venueAddress: ev.venueAddress || '', latitude: ev.latitude || '', longitude: ev.longitude || '', eventNotes: ev.eventNotes || '',
            packageId: ev.packageId?._id || ev.packageId || '', packagePrice: ev.packagePrice || 0, extraCharges: ev.extraCharges || 0, discount: ev.discount || 0,
            advancePayment: ev.advancePayment || 0, status: ev.status || 'Upcoming'
        });
        setEditingEvent(ev);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, packagePrice: Number(form.packagePrice), extraCharges: Number(form.extraCharges), discount: Number(form.discount), advancePayment: Number(form.advancePayment), latitude: form.latitude ? Number(form.latitude) : undefined, longitude: form.longitude ? Number(form.longitude) : undefined };
            if (!payload.packageId) delete payload.packageId;
            if (editingEvent) {
                await updateEvent(editingEvent._id, payload);
                toast.success('Event updated!');
            } else {
                await createEvent(payload);
                toast.success('Event created!');
            }
            setShowForm(false);
            resetForm();
            loadEvents();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to save event'); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteEvent(id);
            toast.success('Event deleted');
            setShowDeleteConfirm(null);
            loadEvents();
        } catch (err) { toast.error('Failed to delete'); }
    };

    const handlePackageSelect = (pkgId) => {
        const pkg = packages.find(p => p._id === pkgId);
        setForm(f => ({ ...f, packageId: pkgId, packagePrice: pkg ? pkg.price : f.packagePrice }));
    };

    const openMap = (ev) => {
        if (ev.latitude && ev.longitude) {
            window.open(`https://www.google.com/maps?q=${ev.latitude},${ev.longitude}`, '_blank');
        } else if (ev.venueAddress) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venueAddress)}`, '_blank');
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Completed') return 'badge-success';
        if (status === 'Cancelled') return 'badge-danger';
        return 'badge-info';
    };

    const getPaymentBadge = (status) => {
        if (status === 'Paid') return 'badge-success';
        if (status === 'Partial') return 'badge-warning';
        return 'badge-danger';
    };

    const totalAmount = (ev) => (ev.packagePrice + ev.extraCharges) - ev.discount;

    if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Events & Bookings</h1>
                <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus size={18} /> New Event</button>
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-search">
                        <HiOutlineSearch size={18} />
                        <input placeholder="Search client, phone, venue..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="table-filters">
                        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="">All Types</option>
                            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select className="filter-select" value={filterPayment} onChange={e => setFilterPayment(e.target.value)}>
                            <option value="">Payment Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>

                {events.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No events found</h3><p>Create your first event booking</p></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Client</th><th>Event</th><th>Date</th><th>Venue</th>
                                    <th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev._id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{ev.clientName}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.clientPhone}</div>
                                        </td>
                                        <td><span className="badge badge-secondary">{ev.eventType}</span></td>
                                        <td>
                                            <div>{format(new Date(ev.eventDate), 'MMM dd, yyyy')}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.eventTime}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {ev.venueName || '-'}
                                                {(ev.latitude || ev.venueAddress) && (
                                                    <button className="btn-icon" onClick={() => openMap(ev)} title="Open Map">
                                                        <HiOutlineLocationMarker size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>₹{(ev.totalAmount || 0).toLocaleString('en-IN')}</td>
                                        <td><span className={`badge ${getStatusBadge(ev.status)}`}><span className="badge-dot"></span>{ev.status}</span></td>
                                        <td><span className={`badge ${getPaymentBadge(ev.paymentStatus)}`}><span className="badge-dot"></span>{ev.paymentStatus}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon" onClick={() => openEdit(ev)} title="Edit"><HiOutlinePencil size={16} /></button>
                                                <button className="btn-icon" onClick={() => setShowDeleteConfirm(ev._id)} title="Delete" style={{ color: 'var(--color-danger)' }}><HiOutlineTrash size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingEvent ? 'Edit Event' : 'New Event Booking'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><HiOutlineX size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <h3 style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }}>Client Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Client Name *</label>
                                        <input className="form-input" required value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Enter client name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} placeholder="client@email.com" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <input className="form-input" value={form.clientAddress} onChange={e => setForm({ ...form, clientAddress: e.target.value })} placeholder="Client address" />
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', margin: 'var(--space-lg) 0 var(--space-md)' }}>Event Details</h3>
                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Event Type *</label>
                                        <select className="form-select" value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}>
                                            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Event Date *</label>
                                        <input className="form-input" type="date" required value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Event Time</label>
                                        <input className="form-input" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} placeholder="09:00 AM" />
                                    </div>
                                </div>
                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Duration</label>
                                        <input className="form-input" value={form.eventDuration} onChange={e => setForm({ ...form, eventDuration: e.target.value })} placeholder="Full Day / 4 hours" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Venue Name</label>
                                        <input className="form-input" value={form.venueName} onChange={e => setForm({ ...form, venueName: e.target.value })} placeholder="Venue name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Venue Address</label>
                                        <input className="form-input" value={form.venueAddress} onChange={e => setForm({ ...form, venueAddress: e.target.value })} placeholder="Venue address" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                            <option value="Upcoming">Upcoming</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Notes</label>
                                        <input className="form-input" value={form.eventNotes} onChange={e => setForm({ ...form, eventNotes: e.target.value })} placeholder="Any notes..." />
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', margin: 'var(--space-lg) 0 var(--space-md)' }}>Financial Details</h3>
                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Package</label>
                                        <select className="form-select" value={form.packageId} onChange={e => handlePackageSelect(e.target.value)}>
                                            <option value="">No package</option>
                                            {packages.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price.toLocaleString()}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Package Price</label>
                                        <input className="form-input" type="number" value={form.packagePrice} onChange={e => setForm({ ...form, packagePrice: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Extra Charges</label>
                                        <input className="form-input" type="number" value={form.extraCharges} onChange={e => setForm({ ...form, extraCharges: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Discount</label>
                                        <input className="form-input" type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Advance Payment</label>
                                        <input className="form-input" type="number" value={form.advancePayment} onChange={e => setForm({ ...form, advancePayment: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Amount</label>
                                        <div className="form-input" style={{ background: 'var(--bg-tertiary)', fontWeight: 600, color: 'var(--color-success)' }}>
                                            ₹{((Number(form.packagePrice) + Number(form.extraCharges)) - Number(form.discount)).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingEvent ? 'Update Event' : 'Create Event'}</button>
                            </div>
                        </form>
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
                                <h3>Delete Event?</h3>
                                <p>This action cannot be undone. All data related to this event will be permanently removed.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Events;
