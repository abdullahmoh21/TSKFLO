import { useEffect, useState } from "react";
import { useRefreshMutation } from "../features/auth/authApiSlice";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken, setCredentials } from "../features/auth/authSlice";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const token = useSelector(selectCurrentToken);
  const [refresh, { isUninitialized, isSuccess, isError }] =
    useRefreshMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    // First, check if we already have a token
    if (token) {
      setIsLoading(false);
      return;
    }

    const verifyRefreshToken = async () => {
      console.log("Verifying refresh token...");
      try {
        // Try to refresh the token
        const result = await refresh().unwrap();
        console.log("Refresh successful:", result);
      } catch (err) {
        console.error("Error refreshing token:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only try to refresh if we don't have a token
    verifyRefreshToken();
  }, []);

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
