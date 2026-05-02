import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { logout, setCredentials } from './store/authSlice';
import { getMe } from './api/auth';
import './App.css';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import OwnerLayout from './layouts/OwnerLayout';
import RequireAuth from './components/RequireAuth';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Orderlist from './components/Orderlist';
import UserProfile from './components/UserProfile';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import Restaurantlist from './pages/Restaurantlist';
import MyRestaurants from './pages/MyRestaurants';
import RestaurantForm from './components/restaaurant_form';
import OwnerOrders from './pages/OwnerOrders';
import NotFound from './pages/NotFound';

function App() {
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [validating, setValidating] = useState(() => !!localStorage.getItem('token'));

  // On mount: re-validate stored token with the server.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setValidating(false);
      return;
    }
    getMe()
      .then((user) => {
        dispatch(setCredentials({
          token,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        }));
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => setValidating(false));
  }, [dispatch]);

  // Show spinner while validating token
  if (validating) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={
        isLoggedIn 
          ? <Navigate to={role === 'OWNER' ? '/owner' : '/'} replace /> 
          : <Login />
      } />

      {/* Customer routes */}
      <Route element={
        <RequireAuth allowedRole="CUSTOMER">
          <CustomerLayout />
        </RequireAuth>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orderlist />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
      </Route>

      {/* Owner routes */}
      <Route path="/owner" element={
        <RequireAuth allowedRole="OWNER">
          <OwnerLayout />
        </RequireAuth>
      }>
        <Route index element={<Restaurantlist />} />
        <Route path="my-restaurants" element={<MyRestaurants />} />
        <Route path="add-restaurant" element={<RestaurantForm />} />
        <Route path="orders" element={<OwnerOrders />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;


