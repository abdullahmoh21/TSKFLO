import { useEffect, useState } from "react";
import { useRefreshMutation } from "../features/auth/authApiSlice";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const token = useSelector(selectCurrentToken);
  const [refresh, { isUninitialized, isSuccess, isError, error }] =
    useRefreshMutation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      console.log("Verifying refresh token...");
      try {
        // Always try to refresh the token on page load
        const result = await refresh().unwrap();
        console.log("Refresh successful:", result);
      } catch (err) {
        console.error("Error refreshing token:", err);
        // Don't show error immediately, let the component handle it
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // If we already have a token in memory, we can skip the refresh
    if (token) {
      setIsLoading(false);
    } else {
      verifyRefreshToken();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Show error message if refresh failed and we don't have a token
  if (isError && !token) {
    console.error("Refresh error:", error);
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-secondary-50 dark:bg-secondary-900">
        <p className="text-red-600 mb-4">
          {error?.data?.message || "Unable to refresh your session."}
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Login Again
        </button>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen bg-secondary-50 dark:bg-secondary-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;
