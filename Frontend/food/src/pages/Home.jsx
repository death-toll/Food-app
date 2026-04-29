import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import RestaurantCard from '../components/foodcard';

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

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
                    <h4 className="mb-0 fw-semibold">Restaurants</h4>
                    {!loading && !error && (
                        <span className="badge text-bg-secondary">{restaurants.length} found</span>
                    )}
                </div>

                {loading ? (
                    <div className="card">
                        <div className="card-body d-flex align-items-center gap-2">
                            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            <span>Loading restaurants...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">{error}</div>
                ) : restaurants.length ? (
                    <div className="row g-3">
                        {restaurants.map((r) => (
                            <div key={r.restaurant_id} className="col-12 col-md-6 col-lg-4">
                                <RestaurantCard restaurant={r} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-body text-muted">No restaurants found.</div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Home;
