import { useEffect, useState } from "react";
import { useRefreshMutation } from "../features/auth/authApiSlice";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../features/auth/authSlice";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const token = useSelector(selectCurrentToken);
  const [refresh, { isUninitialized, isSuccess, isError }] =
    useRefreshMutation();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only try to refresh if we don't have a token
    !token ? verifyRefreshToken() : setIsLoading(false);
  }, []);

  return <>{isLoading ? <p>Loading...</p> : <Outlet />}</>;
};

export default PersistLogin;
