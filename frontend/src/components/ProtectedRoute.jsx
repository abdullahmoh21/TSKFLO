import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const token = useSelector((state) => state.auth.token);
    
    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute;