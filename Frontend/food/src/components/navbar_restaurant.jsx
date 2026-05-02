import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';

const NavbarRestaurant = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const themeMode = useSelector((state) => state.theme.mode);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `nav-link btn btn-link text-white px-3${isActive ? ' fw-semibold text-warning' : ''}`;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <span className="navbar-brand fw-bold">Food App</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#restaurantNav" aria-controls="restaurantNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="restaurantNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink to="/owner" className={linkClass} end>Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/owner/my-restaurants" className={linkClass}>My Restaurants</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/owner/orders" className={linkClass}>Orders</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/owner/add-restaurant" className={linkClass}>Add Restaurant</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/owner/profile" className={linkClass}>Profile</NavLink>
                        </li>
                        <li className="nav-item ms-2">
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm"
                                onClick={() => dispatch(toggleTheme())}
                                aria-label="Toggle theme"
                                title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            >
                                {themeMode === 'dark' ? '☀️' : '🌙'}
                            </button>
                        </li>
                        <li className="nav-item ms-2">
                            <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavbarRestaurant;
