import { useLocation, useNavigate } from 'react-router-dom';
import OrderConfirmation from './OrderConfirmation';

/**
 * Wrapper that reads orderSummary from router location state
 * and provides navigation callbacks.
 */
const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderSummary = location.state?.orderSummary ?? null;

    return (
        <OrderConfirmation
            orderSummary={orderSummary}
            onBackHome={() => navigate('/')}
            onViewOrders={() => navigate('/orders')}
        />
    );
};

export default OrderConfirmationPage;
