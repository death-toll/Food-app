import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Syncs Redux theme state → data-bs-theme on <html>.
 * Bootstrap 5.3 reads this attribute to switch all components to dark mode.
 */
export default function ThemeSync() {
    const mode = useSelector((state) => state.theme.mode);

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', mode);
    }, [mode]);

    return null;
}
