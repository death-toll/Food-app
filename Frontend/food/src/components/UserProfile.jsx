import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from "../services/axiosInstance";
import { getUserById } from "../api/customer";
import { getRestaurants } from '../api/restaurant';
import { getFoods } from '../api/food';
import Notification from './Notification';

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

const CUISINES = ['INDIAN', 'CHINESE', 'ITALIAN', 'MEXICAN', 'THAI', 'JAPANESE', 'KOREAN', 'MEDITERRANEAN', 'AMERICAN'];

const FOODTYPE_OPTIONS = ['VEG', 'NON_VEG', 'NO_RESTRICTION', 'VEGAN'];

const UserProfile = () => {
    const userId = useSelector((state) => state.auth.userId);
    const role = useSelector((state) => state.auth.role);
    const isCustomer = role === 'CUSTOMER';
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [restaurantPrefs, setRestaurantPrefs] = useState([]);
    const [foodPrefs, setFoodPrefs] = useState([]);
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [allFoods, setAllFoods] = useState([]);
    const [prefFoodtype, setPrefFoodtype] = useState('VEG');
    const [prefRestaurantIds, setPrefRestaurantIds] = useState([]);
    const [prefFoodIds, setPrefFoodIds] = useState([]);
    const [prefCuisines, setPrefCuisines] = useState([]);
    const [prefSaving, setPrefSaving] = useState(false);
    const [prefNotice, setPrefNotice] = useState(null); // { message, variant }
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

    // Load selectable options for preferences (customer only)
    useEffect(() => {
        if (!isCustomer) {
            setAllRestaurants([]);
            setAllFoods([]);
            return;
        }

        Promise.all([
            getRestaurants().catch(() => []),
            getFoods().catch(() => []),
        ]).then(([restaurants, foods]) => {
            setAllRestaurants(Array.isArray(restaurants) ? restaurants : []);
            setAllFoods(Array.isArray(foods) ? foods : []);
        });
    }, [isCustomer]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');

            try {
                const userResponse = await getUserById(userId);
                if (cancelled) return;
                setUser(userResponse);

                // Preferences are customer-only
                if (!isCustomer) {
                    setPreferences(null);
                    setRestaurantPrefs([]);
                    setFoodPrefs([]);
                    setPrefFoodtype('VEG');
                    setPrefRestaurantIds([]);
                    setPrefFoodIds([]);
                    setPrefCuisines([]);
                    return;
                }

                try {
                    const prefResponse = await axiosInstance.get(`/user-preferences/${userId}`);
                    if (cancelled) return;

                    const pref = prefResponse.data;
                    setPreferences(pref);

                    const restaurantIds = safeArray(pref?.restaurant_id).map((id) => String(id));
                    const foodIds = safeArray(pref?.food_id).map((id) => String(id));
                    const cuisines = safeArray(pref?.cuisines).map((c) => String(c));
                    setPrefFoodtype(pref?.foodtype || 'VEG');
                    setPrefRestaurantIds(restaurantIds);
                    setPrefFoodIds(foodIds);
                    setPrefCuisines(cuisines);

                    const [restaurants, foods] = await Promise.all([
                        Promise.all(
                            safeArray(pref?.restaurant_id).map((id) =>
                                axiosInstance
                                    .get(`/restaurants/${id}`)
                                    .then((r) => r.data)
                                            .catch(() => ({ restaurant_id: id, name: 'Restaurant' })),
                            ),
                        ),
                        Promise.all(
                            safeArray(pref?.food_id).map((id) =>
                                axiosInstance
                                    .get(`/foods/${id}`)
                                    .then((r) => r.data)
                                        .catch(() => ({ food_id: id, name: 'Food' })),
                            ),
                        ),
                    ]);

                    if (cancelled) return;
                    setRestaurantPrefs(restaurants);
                    setFoodPrefs(foods);
                } catch {
                    if (cancelled) return;
                    // No preferences yet — allow user to create
                    setPreferences(null);
                    setRestaurantPrefs([]);
                    setFoodPrefs([]);
                    setPrefFoodtype('VEG');
                    setPrefRestaurantIds([]);
                    setPrefFoodIds([]);
                    setPrefCuisines([]);
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

    const handleSavePreferences = async () => {
        if (!isCustomer || !userId) return;
        setPrefSaving(true);
        setPrefNotice(null);

        try {
            const payload = {
                user_id: userId,
                foodtype: prefFoodtype,
                restaurant_id: prefRestaurantIds.map((id) => Number(id)).filter((n) => Number.isFinite(n)),
                food_id: prefFoodIds.map((id) => Number(id)).filter((n) => Number.isFinite(n)),
                cuisines: prefCuisines,
            };

            const res = await axiosInstance.put('/user-preferences', payload);
            const saved = res.data;
            setPreferences(saved);
            setPrefNotice({ message: 'Preferences saved.', variant: 'success' });

            // Refresh display lists using loaded options when possible
            const savedRestaurantIds = new Set(safeArray(saved?.restaurant_id).map((id) => String(id)));
            const savedFoodIds = new Set(safeArray(saved?.food_id).map((id) => String(id)));

            if (allRestaurants.length) {
                setRestaurantPrefs(allRestaurants.filter((r) => savedRestaurantIds.has(String(r.restaurant_id))));
            }
            if (allFoods.length) {
                setFoodPrefs(allFoods.filter((f) => savedFoodIds.has(String(f.food_id))));
            }
        } catch (e) {
            setPrefNotice({ message: e?.response?.data?.message || 'Failed to save preferences', variant: 'danger' });
        } finally {
            setPrefSaving(false);
        }
    };

    const readSelectedValues = (e) => Array.from(e.target.selectedOptions).map((o) => o.value);

    return (
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <Notification
                message={prefNotice?.message || ''}
                variant={prefNotice?.variant || 'success'}
                onClose={() => setPrefNotice(null)}
            />
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
                                        {isCustomer && prefFoodtype ? (
                                            <span className="badge text-bg-success">{prefFoodtype}</span>
                                        ) : null}
                                    </div>

                                    <div className="card-body">
                                        {!isCustomer ? (
                                            <div className="text-muted">Preferences are available for customers only.</div>
                                        ) : (
                                            <>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium">Food preference</label>
                                                        <select
                                                            className="form-select"
                                                            value={prefFoodtype}
                                                            onChange={(e) => setPrefFoodtype(e.target.value)}
                                                            disabled={prefSaving}
                                                        >
                                                            {FOODTYPE_OPTIONS.map((t) => (
                                                                <option key={t} value={t}>{t}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label fw-medium">Preferred cuisines</label>
                                                        <select
                                                            className="form-select"
                                                            multiple
                                                            size={4}
                                                            value={prefCuisines}
                                                            onChange={(e) => setPrefCuisines(readSelectedValues(e))}
                                                            disabled={prefSaving}
                                                        >
                                                            {CUISINES.map((c) => (
                                                                <option key={c} value={c}>{c}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="row g-4">
                                                    <div className="col-md-6">
                                                        <div className="fw-medium mb-2">Preferred Restaurants</div>
                                                        <select
                                                            className="form-select"
                                                            multiple
                                                            size={8}
                                                            value={prefRestaurantIds}
                                                            onChange={(e) => setPrefRestaurantIds(readSelectedValues(e))}
                                                            disabled={prefSaving || allRestaurants.length === 0}
                                                        >
                                                            {allRestaurants.map((r) => (
                                                                <option key={r.restaurant_id} value={String(r.restaurant_id)}>
                                                                    {r.name || 'Restaurant'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="small text-muted mt-1">
                                                            Selected: {prefRestaurantIds.length}. Tip: hold Ctrl (Windows) / Cmd (Mac) to select multiple.
                                                        </div>
                                                        {allRestaurants.length === 0 && (
                                                            <div className="text-muted small mt-1">No restaurants available to choose from.</div>
                                                        )}
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="fw-medium mb-2">Preferred Foods</div>
                                                        <select
                                                            className="form-select"
                                                            multiple
                                                            size={8}
                                                            value={prefFoodIds}
                                                            onChange={(e) => setPrefFoodIds(readSelectedValues(e))}
                                                            disabled={prefSaving || allFoods.length === 0}
                                                        >
                                                            {allFoods.map((f) => (
                                                                <option key={f.food_id} value={String(f.food_id)}>
                                                                    {f.name || 'Food'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="small text-muted mt-1">
                                                            Selected: {prefFoodIds.length}. Tip: hold Ctrl (Windows) / Cmd (Mac) to select multiple.
                                                        </div>
                                                        {allFoods.length === 0 && (
                                                            <div className="text-muted small mt-1">No foods available to choose from.</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="d-flex flex-wrap gap-2 mt-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-dark"
                                                        onClick={handleSavePreferences}
                                                        disabled={prefSaving}
                                                    >
                                                        {prefSaving ? 'Saving…' : (preferences ? 'Update Preferences' : 'Save Preferences')}
                                                    </button>
                                                </div>

                                                {/* Read-only summary (optional) */}
                                                <div className="row g-4 mt-4">
                                                    <div className="col-md-6">
                                                        <div className="fw-medium mb-2">Saved Restaurants</div>
                                                        {restaurantPrefs.length ? (
                                                            <ul className="list-group">
                                                                {restaurantPrefs.map((r) => (
                                                                    <li
                                                                        key={r.restaurant_id}
                                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                                    >
                                                                        <span>{r.name || 'Restaurant'}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="text-muted">No restaurant preferences</div>
                                                        )}
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="fw-medium mb-2">Saved Foods</div>
                                                        {foodPrefs.length ? (
                                                            <ul className="list-group">
                                                                {foodPrefs.map((f) => (
                                                                    <li
                                                                        key={f.food_id}
                                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                                    >
                                                                        <span>{f.name || 'Food'}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="text-muted">No food preferences</div>
                                                        )}
                                                    </div>

                                                    <div className="col-12">
                                                        <div className="fw-medium mb-2">Saved Cuisines</div>
                                                        {safeArray(preferences?.cuisines).length ? (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {safeArray(preferences?.cuisines).map((c) => (
                                                                    <span key={c} className="badge text-bg-info">{c}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted">No cuisine preferences</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
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
