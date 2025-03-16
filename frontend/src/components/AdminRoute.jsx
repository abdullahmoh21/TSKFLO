import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    const role = useSelector((state) => state.auth.role);
    
    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return children;
}

export default AdminRoute; 