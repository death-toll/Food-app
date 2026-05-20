import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createRestaurant, updateRestaurant } from '../api/restaurant';

const FOODTYPES = ['VEG', 'NON_VEG', 'NO_RESTRICTION', 'VEGAN'];

// Factory for blank form state (used when creating a new restaurant).
const empty = (ownerId) => ({
    name: '', foodtype: 'VEG',
    street: '', city: '', state: '',
    ownerId, date: new Date().toISOString().split('T')[0],
});

// Form component for creating or editing a restaurant.
const RestaurantForm = ({ existing = null, onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const ownerId = useSelector((state) => state.auth.userId);

    // ISO yyyy-mm-dd (matches <input type="date"> format).
    const today = new Date().toISOString().split('T')[0];
    // Pre-fill form with existing data if editing; otherwise start empty.
    const [form, setForm] = useState(existing ?? empty(ownerId));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    // Submit handler: create or update restaurant via API.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Guard: opening date cannot be in the future.
        // (String compare works for yyyy-mm-dd.)
        if (form.date && form.date > today) {
            setError('Opening date cannot be in the future.');
            return;
        }

        setSaving(true); setError(''); setSuccess('');
        try {
            // Always include ownerId so backend knows who owns the restaurant.
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
            if (typeof onSuccess === 'function') {
                onSuccess();
            } else {
                navigate('/owner/my-restaurants');
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Save failed. Check all fields.');
        } finally {
            setSaving(false);
        }
    };

    return (
        // Restaurant creation/edit form container
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-4" style={{ maxWidth: 640 }}>
                {/* Page title (changes based on create vs edit mode) */}
                <h4 className="fw-semibold mb-4 text-warning">{existing ? 'Edit Restaurant' : 'Add Restaurant'}</h4>

                {/* Back navigation link */}
                {(onCancel || !existing) && (
                    <button type="button" className="btn btn-link p-0 mb-3 text-decoration-none" onClick={onCancel || (() => navigate('/owner/my-restaurants'))}>
                        ← Back to my restaurants
                    </button>
                )}

                {/* Error/success alerts */}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Form card */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Restaurant name input */}
                            <div className="mb-3">
                                <label className="form-label fw-medium">Restaurant Name *</label>
                                <input type="text" className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                            </div>

                            {/* Food type dropdown (VEG/NON_VEG) */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-12">
                                    <label className="form-label fw-medium">Food Type *</label>
                                    <select className="form-select" value={form.foodtype} onChange={(e) => set('foodtype', e.target.value)} required>
                                        {FOODTYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Street address */}
                            <div className="mb-3">
                                <label className="form-label fw-medium">Street *</label>
                                <input type="text" className="form-control" value={form.street} onChange={(e) => set('street', e.target.value)} required />
                            </div>

                            {/* City and state row */}
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

                            {/* Opening date picker */}
                            <div className="mb-4">
                                <label className="form-label fw-medium">Opening Date *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.date}
                                    onChange={(e) => set('date', e.target.value)}
                                    required
                                    max={today}
                                />
                            </div>

                            {/* Submit button */}
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
