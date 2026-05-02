import { useEffect, useState } from 'react';
import { getFoodById, likeFood } from '../api/food';
import { getAverageRating, getRatingsForRestaurant, rateRestaurant } from '../api/rating';
import { addToCart } from '../api/cart';
import { getOrdersByRestaurant } from '../api/order';
import { getDealOfTheDay } from '../api/restaurant';
import { setCartCount } from '../store/cartSlice';
import { useSelector, useDispatch } from 'react-redux';

const FOODTYPE_COLOR = { VEG: '#28a745', NON_VEG: '#dc3545', NO_RESTRICTION: '#fd7e14', VEGAN: '#6f42c1' };
const fallbackImg = (id) => `https://picsum.photos/seed/restaurant${id ?? 0}/1200/400`;
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

// ── Unsplash image fetched by food name ───────────────────────────────────────
export const FoodImage = ({ name, size = 72 }) => {
    const [src, setSrc] = useState(null);
    useEffect(() => {
        if (!name || !UNSPLASH_KEY) return;
        let cancelled = false;
        fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}+food&per_page=1&orientation=squarish&client_id=${UNSPLASH_KEY}`
        )
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) setSrc(data?.results?.[0]?.urls?.small ?? null);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [name]);
    const fallback = `https://picsum.photos/seed/${encodeURIComponent(name ?? 'food')}/${size}/${size}`;
    return (
        <img
            src={src || fallback}
            alt={name}
            style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
        />
    );
};

// ── Food List Row ─────────────────────────────────────────────────────────────
const FoodListRow = ({ food, restaurantId, onAddedToCart, isTopOrdered, isDealOfTheDay, discountedPrice }) => {
    const [likes, setLikes] = useState(food.like_count ?? 0);
    const [liking, setLiking] = useState(false);
    const [adding, setAdding] = useState(false);
    const [addMsg, setAddMsg] = useState('');

    const handleLike = async () => {
        setLiking(true);
        try {
            const updated = await likeFood(food.food_id);
            setLikes(updated.like_count ?? likes + 1);
        } catch {
            setLikes((l) => l + 1);
        } finally {
            setLiking(false);
        }
    };

    const handleAddToCart = async () => {
        setAdding(true); setAddMsg('');
        try {
            await addToCart(food.food_id, restaurantId, 1);
            setAddMsg('Added!');
            if (typeof onAddedToCart === 'function') onAddedToCart();
            setTimeout(() => setAddMsg(''), 1500);
        } catch (e) {
            setAddMsg(e?.response?.data?.message || 'Failed');
            setTimeout(() => setAddMsg(''), 2000);
        } finally {
            setAdding(false);
        }
    };

    return (
        <li
            className="list-group-item px-3 py-2"
            style={
                isDealOfTheDay
                    ? { borderLeft: '3px solid #22c55e', backgroundColor: '#f0fdf4' }
                    : isTopOrdered
                        ? { borderLeft: '3px solid #f59e0b', backgroundColor: '#fffdf5' }
                        : {}
            }
        >
            {isDealOfTheDay && (
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
            {isTopOrdered && !isDealOfTheDay && (
                <div
                    className="d-flex align-items-center gap-1 mb-2"
                    style={{
                        background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '2px 10px',
                        borderRadius: 20,
                        width: 'fit-content',
                    }}
                >
                    <span>🔥</span>
                    <span>MOST ORDERED TODAY</span>
                </div>
            )}
            <div className="d-flex align-items-center gap-3">
                <FoodImage name={food.name} size={72} />
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
                        <p className="text-muted mb-1" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{food.description}</p>
                    )}
                    {isDealOfTheDay && discountedPrice != null ? (
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-success">₹{Number(discountedPrice).toFixed(2)}</span>
                            <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.85rem' }}>
                                ₹{Number(food.price).toFixed(2)}
                            </span>
                            <span className="badge text-bg-success" style={{ fontSize: '0.65rem' }}>10% OFF</span>
                        </div>
                    ) : (
                        <span className="fw-bold text-success">
                            {food.price != null ? `₹${Number(food.price).toFixed(2)}` : '—'}
                        </span>
                    )}
                </div>
                <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                    {restaurantId && (
                        <button
                            type="button"
                            className={`btn btn-sm ${addMsg === 'Added!' ? 'btn-success' : 'btn-dark'}`}
                            onClick={handleAddToCart}
                            disabled={adding}
                            style={{ fontSize: '0.8rem', minWidth: 90 }}
                        >
                            {adding ? '…' : addMsg || '+ Add to Cart'}
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleLike}
                        disabled={liking}
                        style={{ fontSize: '0.8rem', minWidth: 56 }}
                    >
                        ♥ {likes}
                    </button>
                </div>
            </div>
        </li>
    );
};

// ── Star Rating Picker ────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
    <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
            <button
                key={s}
                type="button"
                className="btn p-0 border-0 bg-transparent"
                style={{ fontSize: '1.5rem', color: s <= value ? '#ffc107' : '#dee2e6', lineHeight: 1 }}
                onClick={() => onChange(s)}
            >
                ★
            </button>
        ))}
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const RestaurantMenu = ({ restaurant, onBack }) => {
    const { restaurant_id, name, foodtype, street, city, state, food_available_id } = restaurant || {};
    const address = [street, city, state].filter(Boolean).join(', ');
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);
    const role = useSelector((s) => s.auth.role);
    const isCustomer = role === 'CUSTOMER';

    // Menu items
    const [foods, setFoods] = useState([]);
    const [foodsLoading, setFoodsLoading] = useState(true);

    // Ratings
    const [avgRating, setAvgRating] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // Submit rating
    const [myRating, setMyRating] = useState(0);
    const [myReview, setMyReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');

    // Most ordered food id
    const [topFoodId, setTopFoodId] = useState(null);

    // Deal of the Day
    const [dealOfTheDay, setDealOfTheDay] = useState(null);

    // Filter
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        if (!restaurant_id) return;

        // Fetch food items
        const ids = Array.isArray(food_available_id) ? food_available_id : [];
        setFoodsLoading(true);
        Promise.all(ids.map((id) => getFoodById(id).catch(() => null)))
            .then((results) => setFoods(results.filter(Boolean)))
            .finally(() => setFoodsLoading(false));

        // Fetch ratings
        setReviewsLoading(true);
        Promise.all([
            getAverageRating(restaurant_id).catch(() => null),
            getRatingsForRestaurant(restaurant_id).catch(() => []),
        ]).then(([avg, ratingList]) => {
            setAvgRating(avg?.averageRating ?? null);
            setReviews(Array.isArray(ratingList) ? ratingList : []);
        }).finally(() => setReviewsLoading(false));

        // Fetch orders to determine most ordered item
        getOrdersByRestaurant(restaurant_id).then((orders) => {
            if (!Array.isArray(orders) || orders.length === 0) return;
            // Count frequency of each food_id across all orders
            const freq = {};
            orders.forEach((o) => {
                (Array.isArray(o.food_id) ? o.food_id : []).forEach((id) => {
                    freq[id] = (freq[id] ?? 0) + 1;
                });
            });
            const topId = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
            if (topId != null) setTopFoodId(Number(topId));
        }).catch(() => {});

        // Fetch Deal of the Day
        getDealOfTheDay(restaurant_id)
            .then((deal) => setDealOfTheDay(deal))
            .catch(() => setDealOfTheDay(null));
    }, [restaurant_id, food_available_id]);

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        if (!myRating) return;
        setSubmitting(true); setSubmitMsg('');
        try {
            await rateRestaurant(restaurant_id, myRating, myReview);
            setSubmitMsg('Rating submitted! Thank you.');
            setMyRating(0); setMyReview('');
            // Refresh ratings
            const [avg, ratingList] = await Promise.all([
                getAverageRating(restaurant_id).catch(() => null),
                getRatingsForRestaurant(restaurant_id).catch(() => []),
            ]);
            setAvgRating(avg?.averageRating ?? null);
            setReviews(Array.isArray(ratingList) ? ratingList : []);
        } catch (err) {
            setSubmitMsg(err?.response?.data?.message || 'Failed to submit rating.');
        } finally {
            setSubmitting(false);
        }
    };

    const typeOptions = ['ALL', ...new Set(foods.map((f) => f.type).filter(Boolean))];
    const filteredFoods = typeFilter === 'ALL' ? foods : foods.filter((f) => f.type === typeFilter);

    return (
        <div style={{ backgroundColor: 'var(--app-bg)', minHeight: '100vh' }}>

            {/* ── Hero Banner ── */}
            <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                <img
                    src={fallbackImg(restaurant_id)}
                    alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem 2rem',
                }}>
                    <button
                        type="button"
                        className="btn btn-light btn-sm mb-3"
                        style={{ width: 'fit-content' }}
                        onClick={onBack}
                    >
                        ← Back
                    </button>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <h2 className="text-white fw-bold mb-0">{name}</h2>
                        {foodtype && (
                            <span
                                className="badge"
                                style={{ backgroundColor: FOODTYPE_COLOR[foodtype] ?? '#6c757d', color: '#fff' }}
                            >
                                {foodtype}
                            </span>
                        )}
                        {avgRating != null && (
                            <span className="badge text-bg-warning">
                                ★ {Number(avgRating).toFixed(1)}
                                {reviews.length > 0 && <span className="ms-1 opacity-75">({reviews.length})</span>}
                            </span>
                        )}
                    </div>
                    {address && <p className="text-white-50 mb-0 small">📍 {address}</p>}
                </div>
            </div>

            <div className="container-fluid py-4">
                <div className="row g-4">

                    {/* ── Menu ── */}
                    <div className="col-12 col-lg-8">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">Menu</h5>
                            {!foodsLoading && (
                                <div className="d-flex gap-1 flex-wrap">
                                    {typeOptions.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`btn btn-sm ${typeFilter === t ? 'btn-dark' : 'btn-outline-secondary'}`}
                                            onClick={() => setTypeFilter(t)}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {foodsLoading ? (
                            <div className="card">
                                <div className="card-body d-flex gap-2 align-items-center">
                                    <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    <span>Loading menu...</span>
                                </div>
                            </div>
                        ) : filteredFoods.length === 0 ? (
                            <div className="card">
                                <div className="card-body text-muted text-center py-5">
                                    {foods.length === 0 ? 'No items on the menu yet.' : 'No items match the selected filter.'}
                                </div>
                            </div>
                        ) : (
                            <ul className="list-group shadow-sm">
                                {filteredFoods.map((food) => (
                                    <FoodListRow
                                        key={food.food_id}
                                        food={food}
                                        restaurantId={isCustomer ? restaurant_id : null}
                                        isTopOrdered={food.food_id === topFoodId}
                                        isDealOfTheDay={dealOfTheDay?.foodId === food.food_id}
                                        discountedPrice={dealOfTheDay?.foodId === food.food_id ? dealOfTheDay.discountedPrice : null}
                                        onAddedToCart={() => {
                                            // refresh cart badge
                                            import('../api/cart').then(({ getCart }) =>
                                                getCart().then((d) => dispatch(setCartCount(d?.totalItems ?? 0))).catch(() => {})
                                            );
                                        }}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ── Ratings sidebar ── */}
                    <div className="col-12 col-lg-4">

                        {/* Average summary */}
                        <div className="card shadow-sm mb-3 border-0">
                            <div className="card-body text-center">
                                <div style={{ fontSize: '3rem', fontWeight: 700, color: '#ffc107', lineHeight: 1 }}>
                                    {avgRating != null ? Number(avgRating).toFixed(1) : '—'}
                                </div>
                                <div className="text-warning mb-1" style={{ fontSize: '1.3rem' }}>
                                    {avgRating != null
                                        ? '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating))
                                        : '☆☆☆☆☆'}
                                </div>
                                <div className="text-muted small">
                                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        {/* Submit rating (logged-in users only) */}
                        {isLoggedIn && (
                            <div className="card shadow-sm mb-3 border-0">
                                <div className="card-header bg-white fw-semibold border-0 pb-0">Rate this restaurant</div>
                                <div className="card-body">
                                    {submitMsg && (
                                        <div className={`alert py-2 small ${submitMsg.includes('Thank') ? 'alert-success' : 'alert-danger'}`}>
                                            {submitMsg}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmitRating}>
                                        <StarPicker value={myRating} onChange={setMyRating} />
                                        <textarea
                                            className="form-control form-control-sm mt-2"
                                            rows={2}
                                            placeholder="Write a review (optional)"
                                            value={myReview}
                                            onChange={(e) => setMyReview(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-dark btn-sm w-100 mt-2"
                                            disabled={!myRating || submitting}
                                        >
                                            {submitting ? 'Submitting…' : 'Submit'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Reviews list */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white fw-semibold border-0 pb-0">Reviews</div>
                            <div className="card-body p-0">
                                {reviewsLoading ? (
                                    <div className="p-3 d-flex gap-2 align-items-center">
                                        <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                        <span className="small">Loading reviews...</span>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="p-3 text-muted small text-center">No reviews yet. Be the first!</div>
                                ) : (
                                    <ul className="list-group list-group-flush">
                                        {reviews.map((r) => (
                                            <li key={r.ratingId} className="list-group-item px-3 py-2">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-semibold small">{r.userName || `User #${r.userId}`}</span>
                                                    <span className="text-warning small">
                                                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                                    </span>
                                                </div>
                                                {r.review && <p className="mb-1 small text-muted">{r.review}</p>}
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantMenu;
