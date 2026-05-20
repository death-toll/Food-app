import React from 'react';

// Format currency with rupee symbol.
const money = (v) => `₹${Number(v ?? 0).toFixed(2)}`;

// Presentational component; receives order summary from parent and shows receipt.
const OrderConfirmation = ({ orderSummary, onBackHome, onViewOrders }) => {
    // Guard: if no summary provided, prompt user to view their orders.
    if (!orderSummary) {
        return (
            <section className="container py-4">
                <div className="alert alert-warning">
                    No order summary found. Please go to <button className="btn btn-link p-0" onClick={onViewOrders}>Orders</button>.
                </div>
            </section>
        );
    }

    const {
        order,
        restaurantId,
        restaurantName,
        items,
        totalItems,
        totalPrice,
        placedAt,
    } = orderSummary;

    return (
        // Order confirmation page with gradient background
        <section style={{ background: 'linear-gradient(180deg, #f8f9fa 0%, #eef1f4 100%)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
                    <div className="card-body p-4">
                        {/* Header with success message and status badge */}
                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                            <div>
                                <h4 className="mb-1 fw-bold">Order placed successfully</h4>
                                <div className="text-muted small">
                                    {placedAt ? `Placed at ${new Date(placedAt).toLocaleString()}` : 'Thank you for your order!'}
                                </div>
                            </div>
                            <span className="badge text-bg-success align-self-start" style={{ fontSize: '0.85rem' }}>
                                PLACED
                            </span>
                        </div>

                        {/* Order and restaurant info cards */}
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <div className="p-3 bg-light border rounded-3">
                                    <div className="text-muted small">Order</div>
                                    <div className="fw-semibold">#{order?.order_id ?? '—'}</div>
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="p-3 bg-light border rounded-3">
                                    <div className="text-muted small">Restaurant</div>
                                    <div className="fw-semibold">{restaurantName ?? `#${restaurantId}`}</div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-4" />

                        {/* Order items summary */}
                        <h6 className="fw-semibold mb-3">Summary</h6>
                        <ul className="list-group mb-3">
                            {/* Each item with name, price, quantity, subtotal */}
                            {(items ?? []).map((it) => (
                                <li key={it.cartItemId ?? `${it.foodId}-${it.restaurantId}`} className="list-group-item d-flex justify-content-between align-items-start">
                                    <div className="me-3">
                                        <div className="fw-semibold">{it.foodName}</div>
                                        <div className="text-muted small">{money(it.foodPrice)} × {it.quantity}</div>
                                    </div>
                                    <div className="fw-semibold text-success">{money(it.subtotal)}</div>
                                </li>
                            ))}
                        </ul>

                        {/* Total row */}
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small">{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
                            <div className="fs-5 fw-bold">{money(totalPrice)}</div>
                        </div>

                        {/* Action buttons */}
                        <div className="d-flex flex-wrap gap-2 mt-4">
                            <button type="button" className="btn btn-dark" onClick={onViewOrders}>View Orders</button>
                            <button type="button" className="btn btn-outline-secondary" onClick={onBackHome}>Back to Home</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OrderConfirmation;

