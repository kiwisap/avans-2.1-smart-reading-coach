import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// For a page the user may not open: quietly send them back to where they came from, or to the
// home page when there is no previous page in this app (for example after typing the address).
export default function RedirectBack() {
    const navigate = useNavigate();

    useEffect(() => {
        const hasPreviousPage = (window.history.state as { idx?: number } | null)?.idx;
        if (hasPreviousPage) {
            void navigate(-1);
        } else {
            void navigate('/', { replace: true });
        }
    }, [navigate]);

    return null;
}
