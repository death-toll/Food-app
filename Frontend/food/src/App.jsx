import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setCredentials } from './store/authSlice';
import { getMe } from './api/auth';
import './App.css';
import NavbarRestaurant from './components/navbar_restaurant';
import Restaurantlist from './pages/Restaurantlist';
import MyRestaurants from './pages/MyRestaurants';
import RestaurantForm from './components/restaaurant_form';
import UserProfile from './components/UserProfile';
import Login from './pages/Login';
import CustomerUi from './pages/Customer_ui';
import OwnerOrders from './pages/OwnerOrders';

function App() {
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem('owner_page') || 'home'
  );

  const navigateTo = (page) => {
    setActivePage(page);
    localStorage.setItem('owner_page', page);
  };
  const [validating, setValidating] = useState(() => !!localStorage.getItem('token'));

  // On mount: re-validate stored token with the server.
  // If valid, refresh user info. If invalid/expired, force logout.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
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

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('owner_page');
    setActivePage('home');
  };

  // Show nothing while we check the token — avoids flash of login page
  if (validating) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  // Customer role → customer UI
  if (role === 'CUSTOMER') {
    return <CustomerUi />;
  }

  // OWNER role → restaurant owner UI
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Restaurantlist />;
      case 'my-restaurants':
        return <MyRestaurants onAddNew={() => navigateTo('add-restaurant')} />;
      case 'add-restaurant':
        return <RestaurantForm onSuccess={() => navigateTo('my-restaurants')} onCancel={() => navigateTo('my-restaurants')} />;
      case 'orders':
        return <OwnerOrders />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Restaurantlist />;
    }
  };

  return (
    <>
      <NavbarRestaurant active={activePage} onNavigate={navigateTo} onLogout={handleLogout} />
      {renderPage()}
    </>
  );
}

export default App;
