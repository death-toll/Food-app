import { Outlet } from 'react-router-dom';
import NavbarRestaurant from '../components/navbar_restaurant';

const OwnerLayout = () => {
    return (
        <>
            {/* Owner navigation header + nested owner routes */}
            <NavbarRestaurant />
            <Outlet />
        </>
    );
};

export default OwnerLayout;
