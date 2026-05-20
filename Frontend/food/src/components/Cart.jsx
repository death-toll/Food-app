import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../api/cart';
import { createOrder } from '../api/order';
import { setCartCount, clearCartCount } from '../store/cartSlice';

// ── Small spinner ─────────────────────────────────────────────────────────────
const Spin = () => (
    <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
);

// ── Qty stepper ───────────────────────────────────────────────────────────────
const QtyControl = ({ value, onDecrease, onIncrease, disabled }) => (
    <div className="d-flex align-items-center gap-1">
        <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            style={{ width: 28, height: 28, padding: 0, lineHeight: 1 }}
            onClick={onDecrease}
            disabled={disabled}
        >−</button>
        <span className="fw-semibold" style={{ minWidth: 20, textAlign: 'center' }}>{value}</span>
        <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            style={{ width: 28, height: 28, padding: 0, lineHeight: 1 }}
            onClick={onIncrease}
            disabled={disabled}
        >+</button>
    </div>
);

// ── Cart Panel ────────────────────────────────────────────────────────────────
// Slide-in side panel showing current cart items; grouped by restaurant.
const Cart = ({ show, onClose, onOrderPlaced }) => {
    const dispatch = useDispatch();
    const userId = useSelector((s) => s.auth.userId);

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Per-item loading map (cartItemId → true)
    const [itemLoading, setItemLoading] = useState({});

    // Order placement state
    const [placingFor, setPlacingFor] = useState(null); // restaurantId
    const [orderSuccess, setOrderSuccess] = useState('');
    const [orderError, setOrderError] = useState('');
    const [clearing, setClearing] = useState(false);

    const fetchCart = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const data = await getCart();
            setCart(data);
            dispatch(setCartCount(data?.totalItems ?? 0));
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    // Fetch full cart when panel is shown; resets order messages.
    useEffect(() => {
        if (show) { fetchCart(); setOrderSuccess(''); setOrderError(''); }
    }, [show, fetchCart]);

    const setItem = (cartItemId, busy) =>
        setItemLoading((prev) => ({ ...prev, [cartItemId]: busy }));

    const handleQtyChange = async (cartItemId, newQty) => {
        if (newQty < 1) return;
        setItem(cartItemId, true);
        try {
            const updated = await updateCartItem(cartItemId, newQty);
            setCart(updated);
            dispatch(setCartCount(updated?.totalItems ?? 0));
        } catch (e) {
            setError(e?.response?.data?.message || 'Update failed');
        } finally {
            setItem(cartItemId, false);
        }
    };

    const handleRemove = async (cartItemId) => {
        setItem(cartItemId, true);
        try {
            const updated = await removeFromCart(cartItemId);
            setCart(updated);
            dispatch(setCartCount(updated?.totalItems ?? 0));
        } catch (e) {
            setError(e?.response?.data?.message || 'Remove failed');
        } finally {
            setItem(cartItemId, false);
        }
    };

    const handleClear = async () => {
        setClearing(true); setError('');
        try {
            const updated = await clearCart();
            setCart(updated);
            dispatch(clearCartCount());
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to clear cart');
        } finally {
            setClearing(false);
        }
    };

    // Place order for one restaurant's items; backend expects food IDs repeated per qty.
    const handlePlaceOrder = async (restaurantId, items) => {
        setPlacingFor(restaurantId); setOrderError(''); setOrderSuccess('');
        try {
            // Build payload: repeat each foodId by its quantity.
            const foodIds = items.flatMap((item) => Array(item.quantity).fill(item.foodId));
            const payload = { status: 'PLACED', user_id: userId, restaurant_id: restaurantId, food_id: foodIds };
            const created = await createOrder(payload);

            // Build an order summary for confirmation UI
            const restaurantName = items?.[0]?.restaurantName;
            const totalItems = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
            const totalPrice = items.reduce((s, i) => s + (i.subtotal ?? 0), 0);
            const summary = {
                order: created ?? null,
                restaurantId,
                restaurantName,
                items,
                totalItems,
                totalPrice,
                placedAt: new Date().toISOString(),
            };

            // Clear cart after successful order
            const updated = await clearCart();
            setCart(updated);
            dispatch(clearCartCount());

            setOrderSuccess('Order placed successfully! 🎉');
            if (typeof onOrderPlaced === 'function') onOrderPlaced(summary);
        } catch (e) {
            setOrderError(e?.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacingFor(null);
        }
    };

    // Group items by restaurant so each restaurant is a separate checkout.
    const grouped = (cart?.items ?? []).reduce((acc, item) => {
        const key = item.restaurantId;
        if (!acc[key]) acc[key] = { restaurantName: item.restaurantName, restaurantId: key, items: [] };
        acc[key].items.push(item);
        return acc;
    }, {});
    const groups = Object.values(grouped);
    const isEmpty = !cart?.items?.length;

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
                    zIndex: 1040, transition: 'opacity 0.2s',
                }}
            />

            {/* Side panel */}
            <div
                style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
                    maxWidth: '100vw', background: '#fff', zIndex: 1050,
                    display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom">
                    <h5 className="mb-0 fw-bold">🛒 Your Cart</h5>
                    <div className="d-flex gap-2 align-items-center">
                        {!isEmpty && (
                            <button
                                type="button" className="btn btn-outline-danger btn-sm"
                                onClick={handleClear} disabled={clearing}
                            >
                                {clearing ? <Spin /> : 'Clear all'}
                            </button>
                        )}
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
                    </div>
                </div>

                {/* ── Body — scrollable cart content ── */}
                <div className="flex-grow-1 overflow-auto px-3 py-2">
                    {loading ? (
                        // Loading state
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <Spin /><span className="ms-2 text-muted">Loading cart…</span>
                        </div>
                    ) : error ? (
                        // Error state
                        <div className="alert alert-danger small py-2">{error}</div>
                    ) : isEmpty ? (
                        // Empty cart illustration
                        <div className="text-center text-muted py-5">
                            <div style={{ fontSize: '3rem' }}>🍽️</div>
                            <div className="mt-2">Your cart is empty</div>
                            <div className="small mt-1">Browse restaurants and add items!</div>
                        </div>
                    ) : (
                        <>
                            {orderSuccess && (
                                <div className="alert alert-success py-2 small mt-2">{orderSuccess}</div>
                            )}
                            {orderError && (
                                <div className="alert alert-danger py-2 small mt-2">{orderError}</div>
                            )}

                            {groups.map((group) => {
                                const groupTotal = group.items.reduce((s, i) => s + (i.subtotal ?? 0), 0);
                                return (
                                    // Restaurant group container
                                    <div key={group.restaurantId} className="mb-3">
                                        {/* Restaurant header with name and subtotal */}
                                        <div className="d-flex justify-content-between align-items-center py-2">
                                            <span className="fw-semibold text-dark small">{group.restaurantName}</span>
                                            <span className="text-muted small">₹{groupTotal.toFixed(2)}</span>
                                        </div>
                                        <hr className="my-1" />

                                        {/* Cart items list for this restaurant */}
                                        <ul className="list-unstyled mb-2">
                                            {group.items.map((item) => (
                                                // Single cart item row
                                                <li key={item.cartItemId} className="d-flex align-items-center gap-2 py-2 border-bottom">
                                                    <div className="flex-grow-1 min-w-0">
                                                        <div className="fw-semibold small text-truncate">{item.foodName}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            ₹{Number(item.foodPrice).toFixed(2)} × {item.quantity} = <span className="text-success fw-semibold">₹{Number(item.subtotal).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <QtyControl
                                                        value={item.quantity}
                                                        onDecrease={() => handleQtyChange(item.cartItemId, item.quantity - 1)}
                                                        onIncrease={() => handleQtyChange(item.cartItemId, item.quantity + 1)}
                                                        disabled={!!itemLoading[item.cartItemId]}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-link btn-sm text-danger p-0 flex-shrink-0"
                                                        style={{ fontSize: '1rem', lineHeight: 1 }}
                                                        onClick={() => handleRemove(item.cartItemId)}
                                                        disabled={!!itemLoading[item.cartItemId]}
                                                        title="Remove"
                                                    >
                                                        {itemLoading[item.cartItemId] ? <Spin /> : '✕'}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Place Order button for this restaurant group */}
                                        <button
                                            type="button"
                                            className="btn btn-dark btn-sm w-100"
                                            onClick={() => handlePlaceOrder(group.restaurantId, group.items)}
                                            disabled={placingFor === group.restaurantId}
                                        >
                                            {placingFor === group.restaurantId
                                                ? <><Spin /><span className="ms-2">Placing order…</span></>
                                                : `Place Order · ₹${groupTotal.toFixed(2)}`}
                                        </button>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* ── Footer showing grand total ── */}
                {!isEmpty && !loading && (
                    <div className="border-top px-3 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">{cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}</span>
                            <span className="fw-bold fs-5">₹{Number(cart.totalPrice ?? 0).toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
