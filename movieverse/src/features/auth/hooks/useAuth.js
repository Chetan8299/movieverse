import { useSelector, useDispatch } from "react-redux";
import { fetchUser, loginUser, registerUser, logoutUser } from "../state/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (data) => dispatch(registerUser(data)),
    logout: () => dispatch(logoutUser()),
    fetchUser: () => dispatch(fetchUser()),
  };
}
