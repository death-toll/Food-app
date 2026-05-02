import { Outlet } from 'react-router-dom';
import NavbarRestaurant from '../components/navbar_restaurant';

const OwnerLayout = () => {
    return (
        <>
            <NavbarRestaurant />
            <Outlet />
        </>
    );
};

export default OwnerLayout;
