const NavbarRestaurant = ({ active = 'home', onNavigate }) => {
    const go = (page) => typeof onNavigate === 'function' && onNavigate(page);
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
                            <button type="button" className={`nav-link btn btn-link text-white px-3${active === 'home' ? ' fw-semibold text-warning' : ''}`} onClick={() => go('home')}>Home</button>
                        </li>
                        <li className="nav-item">
                            <button type="button" className={`nav-link btn btn-link text-white px-3${active === 'my-restaurants' ? ' fw-semibold text-warning' : ''}`} onClick={() => go('my-restaurants')}>My Restaurants</button>
                        </li>
                        <li className="nav-item">
                            <button type="button" className={`nav-link btn btn-link text-white px-3${active === 'add-restaurant' ? ' fw-semibold text-warning' : ''}`} onClick={() => go('add-restaurant')}>Add Restaurant</button>
                        </li>
                        <li className="nav-item">
                            <button type="button" className={`nav-link btn btn-link text-white px-3${active === 'profile' ? ' fw-semibold text-warning' : ''}`} onClick={() => go('profile')}>Profile</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavbarRestaurant;
