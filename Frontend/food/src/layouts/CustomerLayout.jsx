import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCartCount } from '../store/cartSlice';
import { getCart } from '../api/cart';
import Navbar from '../components/Navbar';
import Cart from '../components/Cart';

const CustomerLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showCart, setShowCart] = useState(false);

    // Load cart count on mount
    useEffect(() => {
        getCart()
            .then((data) => dispatch(setCartCount(data?.totalItems ?? 0)))
            .catch(() => {});
    }, [dispatch]);

    const handleOrderPlaced = (summary) => {
        setShowCart(false);
        navigate('/order-confirmation', { state: { orderSummary: summary } });
    };

    return (
        <>
            <Navbar onCartClick={() => setShowCart(true)} />
            <Outlet />
            <Cart
                show={showCart}
                onClose={() => setShowCart(false)}
                onOrderPlaced={handleOrderPlaced}
            />
        </>
    );
};

export default CustomerLayout;
