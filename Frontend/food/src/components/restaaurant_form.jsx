import { useState } from 'react';
import { useSelector } from 'react-redux';
import { createRestaurant, updateRestaurant } from '../api/restaurant';

const FOODTYPES = ['VEG', 'NON_VEG', 'NO_RESTRICTION', 'VEGAN'];

const empty = (ownerId) => ({
    name: '', foodtype: 'VEG',
    street: '', city: '', state: '',
    ownerId, date: new Date().toISOString().split('T')[0],
});

const RestaurantForm = ({ existing = null, onSuccess, onCancel }) => {
    const ownerId = useSelector((state) => state.auth.userId);
    const [form, setForm] = useState(existing ?? empty(ownerId));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError(''); setSuccess('');
        try {
            const payload = {
                ...form,
                ownerId,
            };
            if (existing?.restaurant_id) {
                await updateRestaurant(existing.restaurant_id, payload);
                setSuccess('Restaurant updated successfully!');
            } else {
                await createRestaurant(payload);
                setSuccess('Restaurant created successfully!');
                setForm(empty(ownerId));
            }
            if (typeof onSuccess === 'function') onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || 'Save failed. Check all fields.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-4" style={{ maxWidth: 640 }}>
                <h4 className="fw-semibold mb-4 text-warning">{existing ? 'Edit Restaurant' : 'Add Restaurant'}</h4>
                {onCancel && (
                    <button type="button" className="btn btn-link p-0 mb-3 text-decoration-none" onClick={onCancel}>
                        ← Back to my restaurants
                    </button>
                )}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-medium">Restaurant Name *</label>
                                <input type="text" className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-md-12">
                                    <label className="form-label fw-medium">Food Type *</label>
                                    <select className="form-select" value={form.foodtype} onChange={(e) => set('foodtype', e.target.value)} required>
                                        {FOODTYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-medium">Street *</label>
                                <input type="text" className="form-control" value={form.street} onChange={(e) => set('street', e.target.value)} required />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">City *</label>
                                    <input type="text" className="form-control" value={form.city} onChange={(e) => set('city', e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">State *</label>
                                    <input type="text" className="form-control" value={form.state} onChange={(e) => set('state', e.target.value)} required />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-medium">Opening Date *</label>
                                <input type="date" className="form-control" value={form.date} onChange={(e) => set('date', e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-dark w-100" disabled={saving}>
                                {saving ? 'Saving...' : existing ? 'Update Restaurant' : 'Create Restaurant'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RestaurantForm;
