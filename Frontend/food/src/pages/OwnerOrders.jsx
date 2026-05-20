import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getRestaurantsByOwner } from '../api/restaurant';
import { getOrdersByRestaurant, updateOrderStatus } from '../api/order';
import { getFoodById, getFoods } from '../api/food';

// ── Status config ─────────────────────────────────────────────────────────────
// Backend order statuses; owners can advance or cancel orders.
const STATUSES = ['PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];

const STATUS_META = {
    PLACED:    { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
    CONFIRMED: { label: 'Preparing', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
    DELIVERED: { label: 'Completed', color: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
    CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
};

const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6', border: '#d1d5db' };
    return (
        <span
            className="badge"
            style={{ backgroundColor: m.bg, color: m.color, border: `1px solid ${m.border}`, fontWeight: 600, fontSize: '0.75rem' }}
        >
            {m.label}
        </span>
    );
};

// ── Status change dropdown ────────────────────────────────────────────────────
const StatusChanger = ({ order, onUpdated }) => {
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    const handleChange = async (newStatus) => {
        if (newStatus === order.status) return;
        setBusy(true); setErr('');
        try {
            const updated = await updateOrderStatus(order, newStatus);
            onUpdated(updated);
        } catch (e) {
            setErr(e?.response?.data?.message || 'Update failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="d-flex flex-column align-items-end gap-1">
            <select
                className="form-select form-select-sm"
                style={{ width: 140 }}
                value={order.status}
                onChange={(e) => handleChange(e.target.value)}
                disabled={busy}
            >
                {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
                ))}
            </select>
            {busy && <span className="text-muted" style={{ fontSize: '0.7rem' }}>Saving…</span>}
            {err && <span className="text-danger" style={{ fontSize: '0.7rem' }}>{err}</span>}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const OwnerOrders = () => {
    const ownerId = useSelector((s) => s.auth.userId);

    const [restaurants, setRestaurants] = useState([]);
    const [restaurantNameById, setRestaurantNameById] = useState({});
    const [selectedRestId, setSelectedRestId] = useState('ALL');
    const [orders, setOrders] = useState([]);
    const [foodNameById, setFoodNameById] = useState({});
    const [loading, setLoading] = useState(false);
    const [restsLoading, setRestsLoading] = useState(true);
    const [error, setError] = useState('');

    // Any food IDs present in orders that we haven't resolved to names yet.
    const missingFoodIds = useMemo(() => {
        const allIds = new Set();
        orders.forEach((o) => {
            (Array.isArray(o?.food_id) ? o.food_id : []).forEach((id) => {
                if (id != null) allIds.add(String(id));
            });
        });
        return Array.from(allIds).filter((id) => !foodNameById[id]);
    }, [orders, foodNameById]);

    // Filter
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    // Load owner's restaurants so we can fetch orders for each.
    useEffect(() => {
        if (!ownerId) return;
        setRestsLoading(true);
        getRestaurantsByOwner(ownerId)
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setRestaurants(list);
                // Build name lookup map for display in order rows.
                const nameMap = {};
                list.forEach((r) => {
                    nameMap[String(r.restaurant_id)] = r.name || `Restaurant #${r.restaurant_id}`;
                });
                setRestaurantNameById(nameMap);
            })
            .catch(() => {})
            .finally(() => setRestsLoading(false));
    }, [ownerId]);

    // Load food name map once
    useEffect(() => {
        getFoods().then((foods) => {
            const map = {};
            (Array.isArray(foods) ? foods : []).forEach((f) => {
                if (f?.food_id != null) map[String(f.food_id)] = f.name || 'Food';
            });
            setFoodNameById(map);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (missingFoodIds.length === 0) return;
        let cancelled = false;

        Promise.all(
            missingFoodIds.map((id) =>
                getFoodById(id)
                    .then((food) => ({ id: String(food?.food_id ?? id), name: food?.name }))
                    .catch(() => null)
            )
        ).then((results) => {
            if (cancelled) return;
            const additions = {};
            (results.filter(Boolean) ?? []).forEach(({ id, name }) => {
                if (id && name) additions[id] = name;
            });
            if (Object.keys(additions).length > 0) {
                setFoodNameById((prev) => ({ ...prev, ...additions }));
            }
        });

        return () => { cancelled = true; };
    }, [missingFoodIds.join('|')]);

    // Load orders for ALL owner's restaurants (combined view).
    // Orders are fetched in parallel then merged and sorted (newest first).
    useEffect(() => {
        if (restaurants.length === 0) return;
        setLoading(true); setError('');
        // Fetch orders from all restaurants in parallel
        Promise.all(
            restaurants.map((r) => getOrdersByRestaurant(r.restaurant_id).catch(() => []))
        )
            .then((results) => {
                // Flatten and sort newest first by order_id.
                const combined = results.flat().sort((a, b) => Number(b.order_id) - Number(a.order_id));
                setOrders(combined);
            })
            .catch((e) => setError(e?.response?.data?.message || 'Failed to load orders'))
            .finally(() => setLoading(false));
    }, [restaurants]);

    const handleUpdated = (updatedOrder) => {
        setOrders((prev) => prev.map((o) => o.order_id === updatedOrder.order_id ? updatedOrder : o));
    };

    const filtered = orders.filter((o) => {
        const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
        const matchRestaurant = selectedRestId === 'ALL' || o.restaurant_id === selectedRestId;
        const matchSearch = !search.trim() || String(o.order_id).includes(search.trim()) ||
            String(o.user_id).includes(search.trim()) ||
            (restaurantNameById[String(o.restaurant_id)] || '').toLowerCase().includes(search.trim().toLowerCase());
        return matchStatus && matchRestaurant && matchSearch;
    });

    const counts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
    }, {});

    return (
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container-fluid py-4">

                {/* ── Page header with title and restaurant dropdown ── */}
                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                    <div>
                        <h4 className="mb-0 fw-bold">Order Management</h4>
                        <span className="text-muted small">View and update order statuses across your restaurants</span>
                    </div>

                    {/* Restaurant picker dropdown to filter by restaurant */}
                    {!restsLoading && restaurants.length > 0 && (
                        <select
                            className="form-select form-select-sm ms-auto"
                            style={{ width: 240 }}
                            value={selectedRestId}
                            onChange={(e) => setSelectedRestId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                        >
                            <option value="ALL">All Restaurants</option>
                            {restaurants.map((r) => (
                                <option key={r.restaurant_id} value={r.restaurant_id}>{r.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* ── Status summary cards — clickable filters ── */}
                {!loading && orders.length > 0 && (
                    <div className="row g-3 mb-4">
                        {/* Each card shows count for a status; clicking filters the table */}
                        {[['ALL', { label: 'All Orders', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' }], ...Object.entries(STATUS_META)].map(([key, meta]) => {
                            const count = key === 'ALL' ? orders.length : (counts[key] ?? 0);
                            const isActive = statusFilter === key;
                            return (
                                <div key={key} className="col-6 col-sm-3 col-xl-2">
                                    <button
                                        type="button"
                                        className="card w-100 border-0 text-start"
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: isActive ? meta.bg : '#fff',
                                            border: isActive ? `2px solid ${meta.color}` : '2px solid transparent',
                                            borderRadius: 10,
                                            boxShadow: isActive ? `0 0 0 1px ${meta.color}33` : '0 1px 3px rgba(0,0,0,0.08)',
                                            padding: '0.75rem 1rem',
                                            transition: 'all 0.15s',
                                        }}
                                        onClick={() => setStatusFilter(key)}
                                    >
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: meta.color }}>{count}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{meta.label}</div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Search bar for quick order lookup ── */}
                {!loading && orders.length > 0 && (
                    <div className="mb-3 d-flex gap-2 align-items-center">
                        {/* Text search input */}
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ maxWidth: 300 }}
                            placeholder="Search by Order #, User ID, or Restaurant"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSearch('')}>
                                Clear
                            </button>
                        )}
                        <span className="text-muted small ms-auto">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                )}

                {/* ── Orders table with status changer ── */}
                {restsLoading || loading ? (
                    // Loading state
                    <div className="card">
                        <div className="card-body d-flex gap-2 align-items-center">
                            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            <span>{restsLoading ? 'Loading restaurants…' : 'Loading orders…'}</span>
                        </div>
                    </div>
                ) : error ? (
                    // Error state
                    <div className="alert alert-danger">{error}</div>
                ) : restaurants.length === 0 ? (
                    // No restaurants yet
                    <div className="card">
                        <div className="card-body text-muted text-center py-5">
                            You have no restaurants yet.
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    // No orders match filter
                    <div className="card">
                        <div className="card-body text-muted text-center py-5">
                            {orders.length === 0 ? 'No orders for this restaurant yet.' : 'No orders match the current filter.'}
                        </div>
                    </div>
                ) : (
                    // Orders data table
                    <div className="card shadow-sm border-0">
                        <div className="table-responsive">
                            {/* Sortable table with status change dropdown */}
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark">
                                    <tr>
                                        <th style={{ width: 80 }}>Order #</th>
                                        <th style={{ width: 90 }}>User ID</th>
                                        <th style={{ width: 180 }}>Restaurant</th>
                                        <th>Items</th>
                                        <th style={{ width: 120 }}>Current Status</th>
                                        <th style={{ width: 160 }}>Change Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Each row is an order with inline status changer */}
                                    {filtered.map((order) => (
                                        <tr key={order.order_id}>
                                            <td className="fw-semibold">#{order.order_id}</td>
                                            <td>
                                                <span className="badge text-bg-secondary">{order.user_id}</span>
                                            </td>
                                            <td>
                                                <span className="fw-medium text-primary" style={{ fontSize: '0.88rem' }}>
                                                    {restaurantNameById[String(order.restaurant_id)] || `Restaurant #${order.restaurant_id}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(() => {
                                                        const ids = Array.isArray(order.food_id) ? order.food_id : [];
                                                        const counts = new Map();

                                                        ids.forEach((id) => {
                                                            const key = String(id);
                                                            counts.set(key, (counts.get(key) ?? 0) + 1);
                                                        });

                                                        return Array.from(counts.entries()).map(([id, count]) => (
                                                            <span
                                                                key={`${order.order_id}-${id}`}
                                                                className="badge rounded-pill"
                                                                style={{ backgroundColor: '#edf6f2', color: '#0f6d4b', fontWeight: 500, fontSize: '0.72rem' }}
                                                            >
                                                                {(foodNameById[id] || 'Food') + (count > 1 ? ` × ${count}` : '')}
                                                            </span>
                                                        ));
                                                    })()}
                                                    {(!order.food_id || order.food_id.length === 0) && (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td><StatusBadge status={order.status} /></td>
                                            <td>
                                                <StatusChanger order={order} onUpdated={handleUpdated} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OwnerOrders;
