import { useEffect, useState } from 'react';
import { getAverageRating } from '../api/rating';

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

// Stable per-id placeholder — no local asset import needed
const fallback = (id) => `https://picsum.photos/seed/restaurant${id ?? 0}/400/220`;

const RestaurantCard = ({ restaurant, onSelect }) => {
    const { name, foodtype, street, city, state, restaurant_id } = restaurant || {};
    const address = [street, city, state].filter(Boolean).join(', ');

    const [imgSrc, setImgSrc] = useState(() => fallback(restaurant_id));
    const [avgRating, setAvgRating] = useState(null);

    useEffect(() => {
        if (!restaurant_id) return;
        // Average rating can be requested by many cards; API layer caches briefly.
        getAverageRating(restaurant_id)
            .then((data) => setAvgRating(data?.averageRating ?? null))
            .catch(() => setAvgRating(null));
    }, [restaurant_id]);

    useEffect(() => {
        if (!ACCESS_KEY) return;
        // Use restaurant_id as the page offset so each card gets a distinct image
        const page = restaurant_id ?? 1;
        fetch(
            `https://api.unsplash.com/search/photos?query=food+restaurant&page=${page}&per_page=1&client_id=${ACCESS_KEY}`
        )
            .then((res) => res.json())
            .then((data) => {
                const url = data?.results?.[0]?.urls?.regular;
                if (url) setImgSrc(url);
            })
            .catch(() => setImgSrc(fallback(restaurant_id)));
    }, [restaurant_id]);

    return (
        // Clickable restaurant card with hover effect
        <div
            className="card h-100 shadow-sm"
            style={{ cursor: onSelect ? 'pointer' : 'default', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onClick={onSelect ? () => onSelect(restaurant) : undefined}
            onMouseEnter={(e) => { if (onSelect) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            {/* Restaurant image from Unsplash or fallback */}
            <img
                src={imgSrc}
                alt={name || 'Restaurant'}
                className="card-img-top"
                style={{ height: '180px', objectFit: 'cover' }}
            />

            <div className="card-body">
                {/* Title and rating badge row */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{name || `Restaurant #${restaurant_id}`}</h5>
                    {/* Average rating badge (fetched from API) */}
                    {avgRating != null && (
                        <span className="badge text-bg-warning ms-2">&#9733; {Number(avgRating).toFixed(1)}</span>
                    )}
                </div>

                {/* Restaurant details list */}
                <ul className="list-group list-group-flush mb-2">
                    <li className="list-group-item px-0">
                        <span className="text-muted small">Food Type&nbsp;</span>
                        <span className="fw-medium">{foodtype || '—'}</span>
                    </li>
                    <li className="list-group-item px-0">
                        <span className="text-muted small">Address&nbsp;</span>
                        <span className="fw-medium">{address || '—'}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default RestaurantCard;
