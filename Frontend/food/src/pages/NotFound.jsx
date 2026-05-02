import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const { isLoggedIn, role } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();

    const homePath = isLoggedIn
        ? (role === 'OWNER' ? '/owner' : '/')
        : '/login';

    return (
        <section style={{ backgroundColor: 'var(--app-bg)', minHeight: 'calc(100vh - 56px)' }}>
            <div className="container py-5" style={{ maxWidth: 720 }}>
                <div className="card shadow-sm">
                    <div className="card-body p-4">
                        <h4 className="fw-bold mb-2">404 — Page not found</h4>
                        <div className="text-muted mb-3">
                            No route matches <span className="fw-semibold">{location.pathname}</span>.
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <button type="button" className="btn btn-dark" onClick={() => navigate(homePath)}>
                                Go to home
                            </button>
                            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                Go back
                            </button>
                        </div>
                        {!isLoggedIn && (
                            <div className="small text-muted mt-3">
                                Tip: Sign in first, then try again.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NotFound;
