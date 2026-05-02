import { useEffect, useState } from 'react';
import { getFoodById, createFood, updateFood, deleteFood } from '../api/food';
import { addFoodToRestaurant, getDealOfTheDay, setDealOfTheDay, removeDealOfTheDay } from '../api/restaurant';
import { FoodImage } from '../pages/RestaurantMenu';

const FOODTYPE_COLOR = { VEG: '#28a745', NON_VEG: '#dc3545', NO_RESTRICTION: '#fd7e14', VEGAN: '#6f42c1' };
const CUISINES = ['INDIAN', 'CHINESE', 'ITALIAN', 'MEXICAN', 'THAI', 'JAPANESE', 'KOREAN', 'MEDITERRANEAN', 'AMERICAN'];
const TYPES = ['VEG', 'NON_VEG', 'NO_RESTRICTION', 'VEGAN'];

const EMPTY_FORM = { name: '', price: '', type: 'VEG', cuisine: 'INDIAN', description: '' };

// ── Food row with edit / delete actions ───────────────────────────────────────
const FoodRow = ({ food, onEdit, onDelete, isDeal, onSetDeal, onRemoveDeal, dealLoading }) => (
    <li
        className="list-group-item px-3 py-2"
        style={isDeal ? { borderLeft: '3px solid #22c55e', backgroundColor: '#f0fdf4' } : {}}
    >
        {isDeal && (
            <div
                className="d-flex align-items-center gap-1 mb-2"
                style={{
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '2px 10px',
                    borderRadius: 20,
                    width: 'fit-content',
                }}
            >
                <span>⭐</span>
                <span>DEAL OF THE DAY — 10% OFF!</span>
            </div>
        )}
        <div className="d-flex align-items-center gap-3">
            <FoodImage name={food.name} size={64} />
            <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className="fw-semibold">{food.name}</span>
                    {food.type && (
                        <span
                            className="badge"
                            style={{ backgroundColor: FOODTYPE_COLOR[food.type] ?? '#6c757d', color: '#fff', fontSize: '0.65rem' }}
                        >
                            {food.type}
                        </span>
                    )}
                    {food.cuisine && (
                        <span className="badge text-bg-info" style={{ fontSize: '0.65rem' }}>{food.cuisine}</span>
                    )}
                </div>
                {food.description && (
                    <p className="text-muted mb-1" style={{ fontSize: '0.78rem', lineHeight: 1.4 }}>{food.description}</p>
                )}
                {isDeal ? (
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-success small">
                            ₹{(food.price * 0.9).toFixed(2)}
                        </span>
                        <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                            ₹{Number(food.price).toFixed(2)}
                        </span>
                        <span className="badge text-bg-success" style={{ fontSize: '0.6rem' }}>10% OFF</span>
                    </div>
                ) : (
                    <span className="fw-bold text-success small">
                        {food.price != null ? `₹${Number(food.price).toFixed(2)}` : '—'}
                    </span>
                )}
            </div>
            <div className="d-flex flex-column gap-1 flex-shrink-0">
                <div className="d-flex gap-1">
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => onEdit(food)}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => onDelete(food.food_id)}
                    >
                        Delete
                    </button>
                </div>
                {isDeal ? (
                    <button
                        type="button"
                        className="btn btn-outline-warning btn-sm"
                        onClick={onRemoveDeal}
                        disabled={dealLoading}
                        style={{ fontSize: '0.75rem' }}
                    >
                        {dealLoading ? '...' : '✕ Remove Deal'}
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => onSetDeal(food.food_id)}
                        disabled={dealLoading}
                        style={{ fontSize: '0.75rem' }}
                    >
                        {dealLoading ? '...' : '⭐ Set as Deal'}
                    </button>
                )}
            </div>
        </div>
    </li>
);

// ── Main Component ────────────────────────────────────────────────────────────
const RestaurantFoodManager = ({ restaurant, onBack }) => {
    const { restaurant_id, name, food_available_id } = restaurant || {};

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state (null = hidden, EMPTY_FORM or food object = open)
    const [form, setForm] = useState(null);       // null | { food_id?, name, price, type, cuisine }
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Delete confirmation
    const [deletingId, setDeletingId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Deal of the Day
    const [dealFoodId, setDealFoodId] = useState(null);
    const [dealLoading, setDealLoading] = useState(false);
    const [dealError, setDealError] = useState('');

    // Load foods
    const loadFoods = async () => {
        const ids = Array.isArray(food_available_id) ? food_available_id : [];
        setLoading(true);
        const results = await Promise.all(ids.map((id) => getFoodById(id).catch(() => null)));
        setFoods(results.filter(Boolean));
        setLoading(false);
    };

    // Load deal of the day
    const loadDeal = async () => {
        try {
            const deal = await getDealOfTheDay(restaurant_id);
            setDealFoodId(deal?.foodId ?? null);
        } catch {
            setDealFoodId(null);
        }
    };

    useEffect(() => {
        loadFoods();
        loadDeal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurant_id]);

    // ── Deal handlers ──────────────────────────────────────────────────────────
    const handleSetDeal = async (foodId) => {
        setDealLoading(true);
        setDealError('');
        try {
            const deal = await setDealOfTheDay(restaurant_id, foodId);
            setDealFoodId(deal?.foodId ?? foodId);
        } catch (e) {
            setDealError(e?.response?.data?.message || 'Failed to set deal');
        } finally {
            setDealLoading(false);
        }
    };

    const handleRemoveDeal = async () => {
        setDealLoading(true);
        setDealError('');
        try {
            await removeDealOfTheDay(restaurant_id);
            setDealFoodId(null);
        } catch (e) {
            setDealError(e?.response?.data?.message || 'Failed to remove deal');
        } finally {
            setDealLoading(false);
        }
    };

    // ── Form handlers ──────────────────────────────────────────────────────────
    const openAdd = () => { setForm({ ...EMPTY_FORM }); setFormError(''); };
    const openEdit = (food) => {
        setForm({ food_id: food.food_id, name: food.name, price: String(food.price ?? ''), type: food.type ?? 'VEG', cuisine: food.cuisine ?? 'INDIAN', description: food.description ?? '' });
        setFormError('');
    };
    const closeForm = () => { setForm(null); setFormError(''); };

    const handleSave = async (e) => {
        e.preventDefault();
        const { name: fname, price, type, cuisine, food_id, description } = form;
        if (!fname.trim() || !price || !type || !cuisine) { setFormError('All fields are required.'); return; }
        const payload = { name: fname.trim(), price: parseFloat(price), type, cuisine, description: description.trim() || null };
        setSaving(true); setFormError('');
        try {
            if (food_id) {
                // Edit existing
                const updated = await updateFood(food_id, payload);
                setFoods((prev) => prev.map((f) => (f.food_id === food_id ? updated : f)));
            } else {
                // Create new and link to restaurant
                const created = await createFood(payload);
                await addFoodToRestaurant(restaurant_id, created.food_id);
                setFoods((prev) => [...prev, created]);
            }
            closeForm();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Failed to save food item.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete handlers ────────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        setDeleteLoading(true); setDeleteError('');
        try {
            await deleteFood(deletingId);
            setFoods((prev) => prev.filter((f) => f.food_id !== deletingId));
            setDeletingId(null);
        } catch (err) {
            setDeleteError(err?.response?.data?.message || 'Delete failed.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <section style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container-fluid py-4">
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onBack}>
                        ← Back
                    </button>
                    <div>
                        <h5 className="mb-0 fw-bold">{name}</h5>
                        <span className="text-muted small">Manage menu items</span>
                    </div>
                    <button
                        type="button"
                        className="btn btn-dark btn-sm ms-auto"
                        onClick={openAdd}
                        disabled={!!form}
                    >
                        + Add Food
                    </button>
                </div>

                <div className="row g-4">
                    {/* ── Food list ── */}
                    <div className={form ? 'col-12 col-lg-7' : 'col-12'}>

                        {/* Deal error message */}
                        {dealError && (
                            <div className="alert alert-danger py-2 small mb-3">
                                {dealError}
                                <button type="button" className="btn-close float-end" style={{ fontSize: '0.6rem' }} onClick={() => setDealError('')} />
                            </div>
                        )}

                        {/* Delete confirmation */}
                        {deletingId && (
                            <div className="alert alert-warning d-flex justify-content-between align-items-center mb-3">
                                <span>
                                    {deleteError
                                        ? <span className="text-danger">{deleteError}</span>
                                        : 'Delete this food item permanently?'}
                                </span>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button" className="btn btn-danger btn-sm"
                                        onClick={handleDeleteConfirm} disabled={deleteLoading}
                                    >
                                        {deleteLoading ? 'Deleting…' : 'Delete'}
                                    </button>
                                    <button
                                        type="button" className="btn btn-secondary btn-sm"
                                        onClick={() => { setDeletingId(null); setDeleteError(''); }}
                                        disabled={deleteLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="card">
                                <div className="card-body d-flex gap-2 align-items-center">
                                    <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    <span>Loading menu items...</span>
                                </div>
                            </div>
                        ) : foods.length === 0 ? (
                            <div className="card">
                                <div className="card-body text-muted text-center py-5">
                                    No items yet.{' '}
                                    <button type="button" className="btn btn-link p-0" onClick={openAdd}>Add your first item</button>
                                </div>
                            </div>
                        ) : (
                            <ul className="list-group shadow-sm">
                                {foods.map((food) => (
                                    <FoodRow
                                        key={food.food_id}
                                        food={food}
                                        onEdit={openEdit}
                                        onDelete={(id) => { setDeletingId(id); setDeleteError(''); }}
                                        isDeal={dealFoodId === food.food_id}
                                        onSetDeal={handleSetDeal}
                                        onRemoveDeal={handleRemoveDeal}
                                        dealLoading={dealLoading}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ── Add / Edit form ── */}
                    {form && (
                        <div className="col-12 col-lg-5">
                            <div className="card shadow-sm border-0 sticky-top" style={{ top: 70 }}>
                                <div className="card-header bg-dark text-white fw-semibold border-0">
                                    {form.food_id ? 'Edit Food Item' : 'Add Food Item'}
                                </div>
                                <div className="card-body">
                                    {formError && (
                                        <div className="alert alert-danger py-2 small">{formError}</div>
                                    )}
                                    <form onSubmit={handleSave}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium">Name *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="e.g. Paneer Tikka"
                                                value={form.name}
                                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium">Price (₹) *</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                placeholder="e.g. 250"
                                                min="0"
                                                step="0.01"
                                                value={form.price}
                                                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-medium">Type *</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={form.type}
                                                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                                            >
                                                {TYPES.map((t) => (
                                                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-medium">Cuisine *</label>
                                            <select
                                                className="form-select form-select-sm"
                                                value={form.cuisine}
                                                onChange={(e) => setForm((f) => ({ ...f, cuisine: e.target.value }))}
                                            >
                                                {CUISINES.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-medium">Description <span className="text-muted">(optional)</span></label>
                                            <textarea
                                                className="form-control form-control-sm"
                                                rows={3}
                                                maxLength={1000}
                                                placeholder="Describe the dish, ingredients, etc."
                                                value={form.description}
                                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                            />
                                            <div className="text-end" style={{ fontSize: '0.7rem', color: '#999' }}>{form.description.length}/1000</div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-dark btn-sm flex-grow-1"
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving…' : (form.food_id ? 'Update' : 'Add')}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={closeForm}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RestaurantFoodManager;
