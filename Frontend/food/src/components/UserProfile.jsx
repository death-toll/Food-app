import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from "../services/axiosInstance";
import { getUserById } from "../api/customer";

/** Default avatar fallback */
const getDefaultAvatar = (userId) =>
    `https://i.pravatar.cc/280?u=${encodeURIComponent(String(userId ?? 'guest'))}`;

/** Hook to manage profile photo stored in localStorage, mapped by userId */
const useProfilePhoto = (userId) => {
    const storageKey = `profile_photo_${userId}`;
    const fallback = getDefaultAvatar(userId);

    const [src, setSrc] = useState(() => {
        if (!userId) return fallback;
        return localStorage.getItem(storageKey) || fallback;
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Re-read from storage if userId changes
    useEffect(() => {
        if (!userId) {
            setSrc(fallback);
            return;
        }
        const stored = localStorage.getItem(storageKey);
        setSrc(stored || fallback);
    }, [userId, storageKey, fallback]);

    const uploadPhoto = (file) => {
        if (!file || !userId) return;
        setUploadError('');

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setUploadError('Only JPEG, PNG, or WEBP images are allowed.');
            return;
        }

        // Validate file size (max 2MB for localStorage safety)
        if (file.size > 2 * 1024 * 1024) {
            setUploadError('Image must be smaller than 2MB.');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const base64 = reader.result;
                localStorage.setItem(storageKey, base64);
                setSrc(base64);
            } catch (e) {
                setUploadError('Failed to save image. Storage may be full.');
            } finally {
                setUploading(false);
            }
        };
        reader.onerror = () => {
            setUploadError('Failed to read file.');
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        if (!userId) return;
        localStorage.removeItem(storageKey);
        setSrc(fallback);
    };

    return { src, fallback, uploadPhoto, removePhoto, uploading, uploadError };
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

    const { src: profilePhoto, fallback: profileFallbackPhoto, uploadPhoto, removePhoto, uploading, uploadError } = useProfilePhoto(userId);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) uploadPhoto(file);
        e.target.value = ''; // Reset so same file can be re-selected
    };

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
                                    style={{ width: 140, height: 140, objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = profileFallbackPhoto;
                                    }}
                                />

                                {/* Upload photo controls */}
                                <div className="mt-3">
                                    <label className="btn btn-outline-secondary btn-sm mb-2" style={{ cursor: 'pointer' }}>
                                        {uploading ? 'Uploading...' : 'Change Photo'}
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            className="d-none"
                                            onChange={handleFileSelect}
                                            disabled={uploading}
                                        />
                                    </label>
                                    {profilePhoto !== profileFallbackPhoto && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm ms-2"
                                            onClick={removePhoto}
                                            disabled={uploading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                    {uploadError && (
                                        <div className="text-danger small mt-1">{uploadError}</div>
                                    )}
                                </div>

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
