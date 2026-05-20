import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import RestaurantCard from '../components/foodcard';
import RestaurantMenu from './RestaurantMenu';

const RATINGS = [1, 2, 3, 4, 5];

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    // Filter state
    const [search, setSearch] = useState('');
    const [place, setPlace] = useState('');
    const [minRating, setMinRating] = useState(0);

    useEffect(() => {
        let cancelled = false;
        // Fetch all restaurants on mount; cancelled flag prevents state updates after unmount.
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axiosInstance.get('/restaurants');
                if (cancelled) return;
                setRestaurants(Array.isArray(response.data) ? response.data : []);
            } catch (e) {
                if (cancelled) return;
                setError(e?.response?.data?.message || 'Failed to load restaurants');
                setRestaurants([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    // Unique city options derived from data (for dropdown filter).
    const cities = useMemo(() => {
        const set = new Set(restaurants.map((r) => r.city).filter(Boolean));
        return [...set].sort();
    }, [restaurants]);

    // Apply local filters (search, city/place, min rating) on the client side.
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

    // If a restaurant is selected, drill into the menu view (single-page app style).
    if (selectedRestaurant) {
        return <RestaurantMenu restaurant={selectedRestaurant} onBack={() => setSelectedRestaurant(null)} />;
    }

    return (
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container-fluid py-4">
                <div className="row g-4">

                    {/* ── Sidebar with filter controls ── */}
                    <div className="col-12 col-md-3 col-xl-2">
                        {/* Sticky filter card */}
                        <div className="card shadow-sm sticky-top" style={{ top: 70 }}>
                            {/* Filter header with reset button */}
                            <div className="card-header bg-dark text-white fw-semibold d-flex justify-content-between align-items-center">
                                <span>Filters</span>
                                {hasFilters && (
                                    <button type="button" className="btn btn-link btn-sm text-white p-0 text-decoration-none" onClick={resetFilters}>
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                {/* Name search */}
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

                                {/* Place / City */}
                                <div className="mb-3">
                                    <label className="form-label small fw-medium mb-1">City / Place</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={place}
                                        onChange={(e) => setPlace(e.target.value)}
                                    >
                                        <option value="">All cities</option>
                                        {cities.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* ── Min Rating filter buttons ── */}
                                <div className="mb-1">
                                    <label className="form-label small fw-medium mb-1">
                                        Min rating&nbsp;
                                        {minRating > 0 && <span className="text-warning fw-bold">{minRating}★</span>}
                                    </label>
                                    {/* Rating button group — click toggles selection */}
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

                    {/* ── Restaurant grid (main content area) ── */}
                    <div className="col-12 col-md-9 col-xl-10">
                        {/* Header with title and result count badge */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 fw-semibold">Restaurants</h5>
                            {!loading && !error && (
                                <span className="badge text-bg-secondary">{filtered.length} found</span>
                            )}
                        </div>

                        {/* Conditional render: loading / error / grid / empty */}
                        {loading ? (
                            // Loading spinner
                            <div className="card">
                                <div className="card-body d-flex align-items-center gap-2">
                                    <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    <span>Loading restaurants...</span>
                                </div>
                            </div>
                        ) : error ? (
                            // Error alert
                            <div className="alert alert-danger" role="alert">{error}</div>
                        ) : filtered.length ? (
                            // Restaurant cards grid
                            <div className="row g-3">
                                {filtered.map((r) => (
                                    <div key={r.restaurant_id} className="col-12 col-sm-6 col-xl-4">
                                        {/* Each card is clickable to view restaurant menu */}
                                        <RestaurantCard restaurant={r} onSelect={setSelectedRestaurant} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Empty state with clear filters option
                            <div className="card">
                                <div className="card-body text-muted text-center py-4">
                                    No restaurants match your filters.{' '}
                                    {hasFilters && (
                                        <button type="button" className="btn btn-link p-0" onClick={resetFilters}>Clear filters</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Home;
