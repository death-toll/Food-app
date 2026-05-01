import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from "../services/axiosInstance";
import { getUserById } from "../api/customer";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

/** Fetch a portrait photo from Unsplash, deterministic per userId */
const useProfilePhoto = (userId) => {
    const [src, setSrc] = useState(null);

    // Stable fallback — same avatar for same userId, no randomness
    const fallback = `https://i.pravatar.cc/280?u=${encodeURIComponent(String(userId ?? 'guest'))}`;

    useEffect(() => {
        if (!userId || !UNSPLASH_KEY) return;
        let cancelled = false;
        // Use userId to pick a deterministic page (1–50); each page has 1 result → same image every time
        const page = (Math.abs(Number(userId)) % 50) + 1;
        fetch(
            `https://api.unsplash.com/search/photos?query=portrait+person&per_page=1&page=${page}&orientation=squarish&client_id=${UNSPLASH_KEY}`
        )
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) {
                    const url = data?.results?.[0]?.urls?.small;
                    if (url) setSrc(url);
                }
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [userId]);

    return { src: src || fallback, fallback };
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const UserProfile = () => {
    const userId = useSelector((state) => state.auth.userId);
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [restaurantPrefs, setRestaurantPrefs] = useState([]);
    const [foodPrefs, setFoodPrefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const address = useMemo(() => {
        if (!user) return '';
        return [user.street, user.city, user.state].filter(Boolean).join(', ');
    }, [user]);

    const { src: profilePhoto, fallback: profileFallbackPhoto } = useProfilePhoto(userId);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');

            try {
                const userResponse = await getUserById(userId);
                if (cancelled) return;
                setUser(userResponse);

                try {
                    const prefResponse = await axiosInstance.get(`/user-preferences/${userId}`);
                    if (cancelled) return;
                    setPreferences(prefResponse.data);

                    const restaurantIds = safeArray(prefResponse.data?.restaurant_id);
                    const foodIds = safeArray(prefResponse.data?.food_id);

                    const [restaurants, foods] = await Promise.all([
                        Promise.all(
                            restaurantIds.map((id) =>
                                axiosInstance
                                    .get(`/restaurants/${id}`)
                                    .then((r) => r.data)
                                    .catch(() => ({ restaurant_id: id, name: `Restaurant #${id}` })),
                            ),
                        ),
                        Promise.all(
                            foodIds.map((id) =>
                                axiosInstance
                                    .get(`/foods/${id}`)
                                    .then((r) => r.data)
                                    .catch(() => ({ food_id: id, name: `Food #${id}` })),
                            ),
                        ),
                    ]);

                    if (cancelled) return;
                    setRestaurantPrefs(restaurants);
                    setFoodPrefs(foods);
                } catch {
                    if (cancelled) return;
                    setPreferences(null);
                    setRestaurantPrefs([]);
                    setFoodPrefs([]);
                }
            } catch (e) {
                if (cancelled) return;
                setError(e?.response?.data?.message || 'Failed to load user profile');
                setUser(null);
                setPreferences(null);
                setRestaurantPrefs([]);
                setFoodPrefs([]);
            } finally {
                if (cancelled) return;
                setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    return (
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-4">
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <div className="card">
                            <div className="card-body text-center">
                                <img
                                    src={profilePhoto}
                                    alt="avatar"
                                    className="rounded-circle img-fluid"
                                    style={{ width: 140 }}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = profileFallbackPhoto;
                                    }}
                                />

                                <h5 className="mt-3 mb-1">{user?.name || `User #${userId}`}</h5>

                                <div className="text-muted">
                                    {user?.role ? (
                                        <span className="badge text-bg-primary">{user.role}</span>
                                    ) : (
                                        <span className="badge text-bg-secondary">USER</span>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <div className="small text-muted">Email</div>
                                    <div className="fw-medium">{user?.email || '—'}</div>
                                </div>

                                <div className="mt-3">
                                    <div className="small text-muted">Address</div>
                                    <div className="fw-medium">{address || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        {loading ? (
                            <div className="card mb-4">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        <span>Loading profile...</span>
                                    </div>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        ) : (
                            <>
                                <div className="card mb-4">
                                    <div className="card-header bg-white">
                                        <div className="fw-semibold">Profile details</div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="small text-muted">User Id</div>
                                                <div className="fw-medium">{user?.user_id ?? userId}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="small text-muted">Age</div>
                                                <div className="fw-medium">{user?.age ?? '—'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="small text-muted">Email</div>
                                                <div className="fw-medium">{user?.email || '—'}</div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="small text-muted">Role</div>
                                                <div className="fw-medium">{user?.role || '—'}</div>
                                            </div>
                                            <div className="col-12">
                                                <div className="small text-muted">Address</div>
                                                <div className="fw-medium">{address || '—'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card mb-4">
                                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                        <div className="fw-semibold">Preferences</div>
                                        {preferences?.foodtype ? (
                                            <span className="badge text-bg-success">{preferences.foodtype}</span>
                                        ) : null}
                                    </div>

                                    <div className="card-body">
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="fw-medium mb-2">Restaurants</div>
                                                {restaurantPrefs.length ? (
                                                    <ul className="list-group">
                                                        {restaurantPrefs.map((r) => (
                                                            <li
                                                                key={r.restaurant_id}
                                                                className="list-group-item d-flex justify-content-between align-items-center"
                                                            >
                                                                <span>{r.name || `Restaurant #${r.restaurant_id}`}</span>
                                                                <span className="badge text-bg-light">#{r.restaurant_id}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="text-muted">No restaurant preferences</div>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <div className="fw-medium mb-2">Foods</div>
                                                {foodPrefs.length ? (
                                                    <ul className="list-group">
                                                        {foodPrefs.map((f) => (
                                                            <li
                                                                key={f.food_id}
                                                                className="list-group-item d-flex justify-content-between align-items-center"
                                                            >
                                                                <span>{f.name || `Food #${f.food_id}`}</span>
                                                                <span className="badge text-bg-light">#{f.food_id}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="text-muted">No food preferences</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UserProfile
