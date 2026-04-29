const Navbar = ({ active = 'home', onNavigate }) => {
    const go = (page) => typeof onNavigate === 'function' && onNavigate(page);

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
                            <button
                                type="button"
                                className={`nav-link btn btn-link px-2${active === 'home' ? ' active fw-semibold' : ''}`}
                                onClick={() => go('home')}
                            >
                                Home
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link px-2${active === 'orders' ? ' active fw-semibold' : ''}`}
                                onClick={() => go('orders')}
                            >
                                Orders
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                type="button"
                                className={`nav-link btn btn-link px-2${active === 'profile' ? ' active fw-semibold' : ''}`}
                                onClick={() => go('profile')}
                            >
                                Profile
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
