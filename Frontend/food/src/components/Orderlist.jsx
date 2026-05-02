import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFoods } from '../api/food';
import { getOrdersByUser } from '../api/order';
import { getRestaurantById } from '../api/restaurant';

// ── Status → step index mapping ───────────────────────────────────────────────
// Backend statuses: PLACED, CONFIRMED, DELIVERED, CANCELLED
// UI steps: Pending (0), Preparing (1), Ready (2), Completed (3)
const STEP_INDEX = { PLACED: 0, CONFIRMED: 1, DELIVERED: 3 };

const STEPS = [
    { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Preparing', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Ready',     color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Completed', color: '#22c55e', bg: '#f0fdf4' },
];

const CANCELLED_COLOR = '#ef4444';

// ── Progress tracker ─────────────────────────────────────────────────────────
const OrderStatusTracker = ({ status }) => {
    if (status === 'CANCELLED') {
        return (
            <div
                className="d-flex align-items-center gap-2 px-3 py-2 rounded"
                style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
            >
                <span
                    style={{
                        width: 10, height: 10, borderRadius: '50%',
                        backgroundColor: CANCELLED_COLOR, flexShrink: 0,
                    }}
                />
                <span style={{ color: CANCELLED_COLOR, fontWeight: 600, fontSize: '0.85rem' }}>
                    Order Cancelled
                </span>
            </div>
        );
    }

    const activeIdx = STEP_INDEX[status] ?? 0;

    return (
        <div className="d-flex align-items-center w-100" style={{ gap: 0 }}>
            {STEPS.map((step, idx) => {
                const isDone    = idx < activeIdx;
                const isActive  = idx === activeIdx;
                const isPending = idx > activeIdx;
                const dotColor  = isDone || isActive ? step.color : '#d1d5db';
                const lineColor = idx < STEPS.length - 1
                    ? (idx < activeIdx ? STEPS[idx].color : '#d1d5db')
                    : null;

                return (
                    <div
                        key={step.label}
                        className="d-flex align-items-center"
                        style={{ flex: idx < STEPS.length - 1 ? '1 1 0' : 'none' }}
                    >
                        {/* Step dot + label */}
                        <div className="d-flex flex-column align-items-center" style={{ minWidth: 56 }}>
                            <div
                                style={{
                                    width: isActive ? 18 : 14,
                                    height: isActive ? 18 : 14,
                                    borderRadius: '50%',
                                    backgroundColor: dotColor,
                                    border: isActive ? `3px solid ${step.color}33` : 'none',
                                    boxShadow: isActive ? `0 0 0 3px ${step.color}22` : 'none',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                }}
                            />
                            <span
                                style={{
                                    fontSize: '0.68rem',
                                    fontWeight: isActive ? 700 : isDone ? 500 : 400,
                                    color: isActive ? step.color : isDone ? '#6b7280' : '#9ca3af',
                                    marginTop: 4,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {idx < STEPS.length - 1 && (
                            <div
                                style={{
                                    flex: 1,
                                    height: 3,
                                    borderRadius: 2,
                                    backgroundColor: lineColor,
                                    alignSelf: 'flex-start',
                                    marginTop: 6,
                                    transition: 'background-color 0.3s',
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const STATUS_BADGE = {
    PLACED:    'text-bg-warning',
    CONFIRMED: 'text-bg-primary',
    DELIVERED: 'text-bg-success',
    CANCELLED: 'text-bg-danger',
};

const Orderlist = () => {
    const userId = useSelector((state) => state.auth.userId);
    const [orders, setOrders] = useState([]);
    const [foodNameById, setFoodNameById] = useState({});
    const [restaurantNameById, setRestaurantNameById] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const totalItems = useMemo(
        () => orders.reduce((count, order) => count + (Array.isArray(order.food_id) ? order.food_id.length : 0), 0),
        [orders]
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [orderResponse, foods] = await Promise.all([
                    getOrdersByUser(userId),
                    getFoods().catch(() => []),
                ]);
                if (cancelled) return;
                const mine = (Array.isArray(orderResponse) ? orderResponse : [])
                    .sort((a, b) => Number(b.order_id) - Number(a.order_id));

                // Build restaurant name lookup for orders
                const uniqueRestaurantIds = Array.from(
                    new Set(
                        mine
                            .map((o) => o?.restaurant_id)
                            .filter((id) => id != null)
                            .map((id) => String(id))
                    )
                );

                const restaurantResults = await Promise.all(
                    uniqueRestaurantIds.map((id) =>
                        getRestaurantById(id)
                            .then((r) => ({ id, name: r?.name }))
                            .catch(() => ({ id, name: null }))
                    )
                );

                const restaurantMap = {};
                restaurantResults.forEach(({ id, name }) => {
                    if (id) restaurantMap[String(id)] = name || 'Restaurant';
                });

                const map = {};
                (Array.isArray(foods) ? foods : []).forEach((food) => {
                    if (food?.food_id != null) {
                        map[String(food.food_id)] = food.name || `Food #${food.food_id}`;
                    }
                });

                setFoodNameById(map);
                setRestaurantNameById(restaurantMap);
                setOrders(mine);
            } catch (e) {
                if (cancelled) return;
                setError(e?.response?.data?.message || 'Failed to load orders');
            } finally {
                if (cancelled) return;
                setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [userId]);

    return (
        <section
            style={{
                backgroundColor: 'var(--app-bg)',
                minHeight: 'calc(100vh - 56px)',
            }}
        >
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="mb-0 fw-semibold">My Orders</h4>
                        <small className="text-muted">Track your recent food purchases</small>
                    </div>
                    {!loading && !error && (
                        <div className="d-flex gap-2">
                            <span className="badge rounded-pill text-bg-secondary px-3 py-2">
                                {orders.length} order{orders.length !== 1 ? 's' : ''}
                            </span>
                            <span className="badge rounded-pill text-bg-light border text-dark px-3 py-2">
                                {totalItems} item{totalItems !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="card">
                        <div className="card-body d-flex align-items-center gap-2">
                            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            <span>Loading orders...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">{error}</div>
                ) : orders.length ? (
                    <ul className="list-unstyled d-grid gap-3">
                        {orders.map((order) => (
                            <li
                                key={order.order_id}
                                className="card border-0 shadow-sm"
                                style={{ borderRadius: 14 }}
                            >
                                <div className="card-body d-flex justify-content-between align-items-start gap-3">
                                    <div className="flex-grow-1">
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                            <span className="fw-semibold fs-6">Order #{order.order_id}</span>
                                            <span className={`badge ${STATUS_BADGE[order.status] ?? 'text-bg-secondary'}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="text-muted small mb-2">
                                            Restaurant{' '}
                                            <span className="fw-medium text-dark">
                                                {restaurantNameById[String(order.restaurant_id)] || 'Restaurant'}
                                            </span>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mb-3">
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
                                                        style={{ backgroundColor: '#edf6f2', color: '#0f6d4b', fontWeight: 500 }}
                                                    >
                                                        {(foodNameById[id] || `Food #${id}`) + (count > 1 ? ` × ${count}` : '')}
                                                    </span>
                                                ));
                                            })()}
                                            {!Array.isArray(order.food_id) || order.food_id.length === 0 ? (
                                                <span className="text-muted small">No items in this order.</span>
                                            ) : null}
                                        </div>

                                        {/* ── Status tracker ── */}
                                        <OrderStatusTracker status={order.status} />
                                    </div>
                                    <span className="badge text-bg-light border text-dark align-self-center">
                                        {(Array.isArray(order.food_id) ? order.food_id.length : 0)} item
                                        {(Array.isArray(order.food_id) ? order.food_id.length : 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="card">
                        <div className="card-body text-muted">No orders found yet. Add food to cart and place your first order.</div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Orderlist;
