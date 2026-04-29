import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';

const USER_ID = 1;

const STATUS_BADGE = {
    PLACED:    'text-bg-warning',
    CONFIRMED: 'text-bg-primary',
    DELIVERED: 'text-bg-success',
    CANCELLED: 'text-bg-danger',
};

const Orderlist = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axiosInstance.get('/orders');
                if (cancelled) return;
                const all = Array.isArray(response.data) ? response.data : [];
                setOrders(all.filter((o) => o.user_id === USER_ID));
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
    }, []);

    return (
        <section style={{ backgroundColor: '#eee', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0 fw-semibold">My Orders</h4>
                    {!loading && !error && (
                        <span className="badge text-bg-secondary">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
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
                    <ul className="list-group shadow-sm">
                        {orders.map((order) => (
                            <li
                                key={order.order_id}
                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-start py-3"
                            >
                                <div>
                                    <div className="fw-semibold mb-1">Order #{order.order_id}</div>
                                    <div className="text-muted small">
                                        Restaurant&nbsp;
                                        <span className="fw-medium text-dark">#{order.restaurant_id}</span>
                                    </div>
                                    {Array.isArray(order.food_id) && order.food_id.length > 0 && (
                                        <div className="text-muted small mt-1">
                                            Items:&nbsp;
                                            {order.food_id.map((id) => (
                                                <span key={id} className="badge text-bg-light me-1">#{id}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className={`badge ${STATUS_BADGE[order.status] ?? 'text-bg-secondary'} ms-3 align-self-center`}>
                                    {order.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="card">
                        <div className="card-body text-muted">No orders found.</div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Orderlist;
