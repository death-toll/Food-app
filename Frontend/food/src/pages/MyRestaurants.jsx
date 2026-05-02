import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getRestaurantsByOwner, deleteRestaurant } from '../api/restaurant';
import RestaurantForm from '../components/restaaurant_form';
import RestaurantFoodManager from '../components/RestaurantFoodManager';

const RATINGS = [1, 2, 3, 4, 5];

const FOODTYPE_BADGE = {
    VEG:            'text-bg-success',
    NON_VEG:        'text-bg-danger',
    NO_RESTRICTION: 'text-bg-warning',
    VEGAN:          'text-bg-info',
};

const MyRestaurants = ({ onAddNew }) => {
    const navigate = useNavigate();
    const handleAddNew = onAddNew || (() => navigate('/owner/add-restaurant'));
    const ownerId = useSelector((state) => state.auth.userId);

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Inline edit state
    const [editing, setEditing] = useState(null); // restaurant object being edited
    // Manage food state
    const [managingFoods, setManagingFoods] = useState(null); // restaurant object

    // Delete confirmation state
    const [deleting, setDeleting] = useState(null); // restaurant_id being deleted
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Filter state
    const [search, setSearch] = useState('');
    const [place, setPlace] = useState('');
    const [minRating, setMinRating] = useState(0);

    const load = async () => {
        if (!ownerId) return;
        setLoading(true); setError('');
        try {
            const data = await getRestaurantsByOwner(ownerId);
            setRestaurants(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load your restaurants');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerId]);

    const cities = useMemo(() => {
        const set = new Set(restaurants.map((r) => r.city).filter(Boolean));
        return [...set].sort();
    }, [restaurants]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return restaurants.filter((r) => {
            const nameMatch = !q || r.name?.toLowerCase().includes(q);
            const placeMatch = !place || r.city === place || r.state === place;
            const ratingMatch = !minRating || (r.rating ?? 0) >= minRating;
            return nameMatch && placeMatch && ratingMatch;
        });
    }, [restaurants, search, place, minRating]);

    const resetFilters = () => { setSearch(''); setPlace(''); setMinRating(0); };
    const hasFilters = search || place || minRating > 0;

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true); setDeleteError('');
        try {
            await deleteRestaurant(deleting);
            setDeleting(null);
            load();
        } catch (e) {
            setDeleteError(e?.response?.data?.message || 'Delete failed');
        } finally {
            setDeleteLoading(false);
        }
    };

    // If managing food — show food manager
    if (managingFoods) {
        return <RestaurantFoodManager restaurant={managingFoods} onBack={() => setManagingFoods(null)} />;
    }

    // If editing — show the form inline
    if (editing) {
        return (
            <RestaurantForm
                existing={editing}
                onSuccess={() => { setEditing(null); load(); }}
                onCancel={() => setEditing(null)}
            />
        );
    }

    return (
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container-fluid py-4">
                <div className="row g-4">

                    {/* ── Sidebar ── */}
                    <div className="col-12 col-md-3 col-xl-2">
                        <div className="card shadow-sm sticky-top" style={{ top: 70 }}>
                            <div className="card-header bg-dark text-white fw-semibold d-flex justify-content-between align-items-center">
                                <span>Filters</span>
                                {hasFilters && (
                                    <button type="button" className="btn btn-link btn-sm text-white p-0 text-decoration-none" onClick={resetFilters}>
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label small fw-medium mb-1">Search by name</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="e.g. Pizza Palace"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium mb-1">City / Place</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={place}
                                        onChange={(e) => setPlace(e.target.value)}
                                    >
                                        <option value="">All cities</option>
                                        {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="mb-1">
                                    <label className="form-label small fw-medium mb-1">
                                        Min rating&nbsp;
                                        {minRating > 0 && <span className="text-warning fw-bold">{minRating}★</span>}
                                    </label>
                                    <div className="d-flex flex-wrap gap-1">
                                        {RATINGS.map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                className={`btn btn-sm ${minRating === r ? 'btn-warning' : 'btn-outline-secondary'}`}
                                                onClick={() => setMinRating(minRating === r ? 0 : r)}
                                            >
                                                {r}★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Main content ── */}
                    <div className="col-12 col-md-9 col-xl-10">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 fw-semibold">My Restaurants</h5>
                            <div className="d-flex align-items-center gap-2">
                                {!loading && !error && (
                                    <span className="badge text-bg-secondary">{filtered.length} found</span>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-dark btn-sm"
                                    onClick={handleAddNew}
                                >
                                    + Add Restaurant
                                </button>
                            </div>
                        </div>

                        {/* Delete confirmation alert */}
                        {deleting && (
                            <div className="alert alert-warning d-flex justify-content-between align-items-center">
                                <span>
                                    {deleteError
                                        ? <span className="text-danger">{deleteError}</span>
                                        : 'Are you sure you want to delete this restaurant?'}
                                </span>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={handleDeleteConfirm}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? 'Deleting…' : 'Delete'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => { setDeleting(null); setDeleteError(''); }}
                                        disabled={deleteLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="card">
                                <div className="card-body d-flex align-items-center gap-2">
                                    <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    <span>Loading your restaurants...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : filtered.length === 0 ? (
                            <div className="card">
                                <div className="card-body text-muted text-center py-5">
                                    {hasFilters ? (
                                        <>No restaurants match your filters.{' '}
                                            <button type="button" className="btn btn-link p-0" onClick={resetFilters}>Clear filters</button>
                                        </>
                                    ) : (
                                        <>You haven't added any restaurants yet.{' '}
                                            <button
                                                type="button"
                                                className="btn btn-link p-0"
                                                onClick={handleAddNew}
                                            >
                                                Add your first restaurant
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card shadow-sm">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>Rating</th>
                                                <th>Location</th>
                                                <th>Since</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((r) => (
                                                <tr key={r.restaurant_id}>
                                                    <td className="text-muted small">{r.restaurant_id}</td>
                                                    <td className="fw-semibold">{r.name}</td>
                                                    <td>
                                                        <span className={`badge ${FOODTYPE_BADGE[r.foodtype] ?? 'text-bg-secondary'}`}>
                                                            {r.foodtype}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {r.rating != null
                                                            ? <span className="text-warning fw-bold">{r.rating}★</span>
                                                            : <span className="text-muted">—</span>}
                                                    </td>
                                                    <td className="small text-muted">
                                                        {[r.street, r.city, r.state].filter(Boolean).join(', ')}
                                                    </td>
                                                    <td className="small text-muted">
                                                        {r.date ? new Date(r.date).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-success btn-sm me-1"
                                                            onClick={() => setManagingFoods(r)}
                                                        >
                                                            🍽 Food
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm me-1"
                                                            onClick={() => setEditing(r)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => { setDeleting(r.restaurant_id); setDeleteError(''); }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MyRestaurants;
