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

// Transient pages — not persisted across refresh (e.g., order confirmation is one-time).
const TRANSIENT_PAGES = ['order-confirmation'];

const CustomerUi = () => {
    const dispatch = useDispatch();

    // Restore last visited page on mount (for refresh resiliency).
    const [activePage, setActivePage] = useState(
        () => localStorage.getItem('customer_page') || 'home'
    );
    const [showCart, setShowCart] = useState(false);
    const [lastOrderSummary, setLastOrderSummary] = useState(null);

    // Navigate between pages; save current page unless it's transient.
    const navigateTo = (page) => {
        setActivePage(page);
        // Don't persist order-confirmation — user shouldn't land back there on refresh.
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

    // Callback when Cart places an order; closes drawer and shows confirmation.
    const handleOrderPlaced = (summary) => {
        // summary is passed from Cart when order is placed (contains items/total/etc.).
        setLastOrderSummary(summary ?? null);
        setShowCart(false);
        navigateTo('order-confirmation');
    };

    // Simple client-side page router based on activePage state.
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
