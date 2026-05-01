import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { setCartCount } from '../store/cartSlice';
import { getCart } from '../api/cart';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';
import Home from './Home';
import Orderlist from '../components/Orderlist';
import UserProfile from '../components/UserProfile';
import OrderConfirmation from './OrderConfirmation';

// Transient pages — not persisted across refresh
const TRANSIENT_PAGES = ['order-confirmation'];

const CustomerUi = () => {
    const dispatch = useDispatch();
    const [activePage, setActivePage] = useState(
        () => localStorage.getItem('customer_page') || 'home'
    );
    const [showCart, setShowCart] = useState(false);
    const [lastOrderSummary, setLastOrderSummary] = useState(null);

    const navigateTo = (page) => {
        setActivePage(page);
        if (!TRANSIENT_PAGES.includes(page)) {
            localStorage.setItem('customer_page', page);
        }
    };

    // Load cart count on mount
    useEffect(() => {
        getCart()
            .then((data) => dispatch(setCartCount(data?.totalItems ?? 0)))
            .catch(() => {});
    }, [dispatch]);

    const handleLogout = () => {
        localStorage.removeItem('customer_page');
        dispatch(logout());
    };

    const handleOrderPlaced = (summary) => {
        // summary is passed from Cart when order is placed
        setLastOrderSummary(summary ?? null);
        setShowCart(false);
        navigateTo('order-confirmation');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'orders':  return <Orderlist />;
            case 'profile': return <UserProfile />;
            case 'order-confirmation':
                return (
                    <OrderConfirmation
                        orderSummary={lastOrderSummary}
                        onBackHome={() => navigateTo('home')}
                        onViewOrders={() => navigateTo('orders')}
                    />
                );
            case 'home':
            default:        return <Home />;
        }
    };

    return (
        <>
            <Navbar
                active={activePage}
                onNavigate={navigateTo}
                onLogout={handleLogout}
                onCartClick={() => setShowCart(true)}
            />
            {renderPage()}
            <Cart
                show={showCart}
                onClose={() => setShowCart(false)}
                onOrderPlaced={handleOrderPlaced}
            />
        </>
    );
};

export default CustomerUi;
