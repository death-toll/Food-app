import { useState } from 'react';
import './App.css';
import NavbarRestaurant from './components/navbar_restaurant';
import Restaurantlist from './pages/Restaurantlist';
import RestaurantForm from './components/restaaurant_form';
import UserProfile from './pages/UserProfile';

function App() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'my-restaurants':
      case 'home':        return <Restaurantlist />;
      case 'add-restaurant': return <RestaurantForm />;
      case 'profile':    return <UserProfile />;
      default:           return <Restaurantlist />;
    }
  };

  return (
    <>
      <NavbarRestaurant active={activePage} onNavigate={setActivePage} />
      {renderPage()}
    </>
  );
}

export default App;
