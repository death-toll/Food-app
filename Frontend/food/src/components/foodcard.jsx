import { useEffect, useState } from 'react';
import fallbackImg from '../assets/premium_photo-1683619761468-b06992704398.avif';

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const RestaurantCard = ({ restaurant }) => {
    const { name, rating, foodtype, street, city, state, restaurant_id } = restaurant || {};
    const address = [street, city, state].filter(Boolean).join(', ');

    const [imgSrc, setImgSrc] = useState(fallbackImg);

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
            .catch(() => { /* keep fallback */ });
    }, [restaurant_id]);

    return (
        <div className="card h-100 shadow-sm">
            <img
                src={imgSrc}
                alt={name || 'Restaurant'}
                className="card-img-top"
                style={{ height: '180px', objectFit: 'cover' }}
            />
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{name || `Restaurant #${restaurant_id}`}</h5>
                    {typeof rating === 'number' && (
                        <span className="badge text-bg-warning ms-2">&#9733; {rating}</span>
                    )}
                </div>
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
