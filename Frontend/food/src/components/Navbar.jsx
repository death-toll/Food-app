import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';

const Navbar = ({ onCartClick }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { name } = useSelector((state) => state.auth);
    const cartCount = useSelector((state) => state.cart.totalItems);
    const themeMode = useSelector((state) => state.theme.mode);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `nav-link btn btn-link px-2${isActive ? ' active fw-semibold' : ''}`;

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <span className="navbar-brand fw-bold">Food App</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink to="/" className={linkClass} end>
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/orders" className={linkClass}>
                                Orders
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/profile" className={linkClass}>
                                Profile
                            </NavLink>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto align-items-center">
                        {name && <li className="nav-item me-2"><span className="navbar-text small text-muted">Hi, {name}</span></li>}
                        {/* Theme toggle */}
                        <li className="nav-item me-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => dispatch(toggleTheme())}
                                aria-label="Toggle theme"
                                title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {themeMode === 'dark' ? '☀️' : '🌙'}
                            </button>
                        </li>
                        {/* Cart icon */}
                        <li className="nav-item me-2">
                            <button
                                type="button"
                                className="btn btn-outline-dark btn-sm position-relative"
                                onClick={typeof onCartClick === 'function' ? onCartClick : undefined}
                                aria-label="Open cart"
                            >
                                🛒
                                {cartCount > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        style={{ fontSize: '0.65rem' }}
                                    >
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
