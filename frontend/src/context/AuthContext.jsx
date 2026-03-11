import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (email, password, role) => {
    const res = await apiRegister({ email, password, role });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, loading: user === undefined }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
