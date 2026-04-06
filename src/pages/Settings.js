import React, { useState, useEffect } from 'react';
import { HiOutlineCog } from 'react-icons/hi';
import { fetchSettings, updateSettings } from '../services/api';
import { toast } from 'react-toastify';
import { Skeleton, CardSkeleton } from '../components/Skeleton';

function Settings() {
    const [form, setForm] = useState({
        companyName: '', businessPhone: '', businessEmail: '', address: '',
        currency: 'INR', currencySymbol: '₹',
        defaultEventTypes: '', defaultExpenseCategories: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings().then(res => {
            const s = res.data;
            setForm({
                companyName: s.companyName || '',
                businessPhone: s.businessPhone || '',
                businessEmail: s.businessEmail || '',
                address: s.address || '',
                currency: s.currency || 'INR',
                currencySymbol: s.currencySymbol || '₹',
                defaultEventTypes: (s.defaultEventTypes || []).join(', '),
                defaultExpenseCategories: (s.defaultExpenseCategories || []).join(', ')
            });
        }).catch(() => toast.error('Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                defaultEventTypes: form.defaultEventTypes.split(',').map(s => s.trim()).filter(Boolean),
                defaultExpenseCategories: form.defaultExpenseCategories.split(',').map(s => s.trim()).filter(Boolean)
            };
            await updateSettings(payload);
            toast.success('Settings saved!');
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="page-container"><div className="page-header"><Skeleton width="180px" height="32px"/></div><CardSkeleton /></div>;

    return (
        <div className="page-container">
            <div className="page-header"><h1>Settings</h1></div>
            <div className="card" style={{ maxWidth: 700 }}>
                <form onSubmit={handleSubmit}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: 'var(--space-lg)' }}>
                        <HiOutlineCog style={{ verticalAlign: 'middle', marginRight: 8 }} /> Business Information
                    </h3>
                    <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input className="form-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.businessPhone} onChange={e => setForm({ ...form, businessPhone: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.businessEmail} onChange={e => setForm({ ...form, businessEmail: e.target.value })} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Address</label><textarea className="form-textarea" rows="2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}></textarea></div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Currency</label><input className="form-input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Currency Symbol</label><input className="form-input" value={form.currencySymbol} onChange={e => setForm({ ...form, currencySymbol: e.target.value })} /></div>
                    </div>

                    <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', margin: 'var(--space-xl) 0 var(--space-lg)' }}>Defaults</h3>
                    <div className="form-group"><label className="form-label">Event Types (comma-separated)</label><input className="form-input" value={form.defaultEventTypes} onChange={e => setForm({ ...form, defaultEventTypes: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Expense Categories (comma-separated)</label><input className="form-input" value={form.defaultExpenseCategories} onChange={e => setForm({ ...form, defaultExpenseCategories: e.target.value })} /></div>

                    <div style={{ marginTop: 'var(--space-xl)' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Settings;
