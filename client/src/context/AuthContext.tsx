import * as React from 'react';
import { User, UserRole } from '@/types';
import { authService } from '@/services/authService';

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'cf_access_token';
const REFRESH_TOKEN_KEY = 'cf_refresh_token';
const USER_KEY = 'cf_user';

const safeGetStorage = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
};

const safeSetStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage errors
  }
};

const safeRemoveStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(() => {
    try {
      const saved = safeGetStorage(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = React.useState<string | null>(() => {
    return safeGetStorage(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Session restoration on mount
  React.useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const token = safeGetStorage(TOKEN_KEY);
      const refreshToken = safeGetStorage(REFRESH_TOKEN_KEY);

      if (!token && !refreshToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        if (token) {
          try {
            const { user: currentUser } = await authService.getMe(token);
            if (isMounted) {
              setUser(currentUser);
              safeSetStorage(USER_KEY, JSON.stringify(currentUser));
              setIsLoading(false);
              return;
            }
          } catch (_tokenErr) {
            // Access token might be expired, attempt refresh
          }
        }

        if (refreshToken) {
          const tokens = await authService.refresh(refreshToken);
          const { user: currentUser } = await authService.getMe(tokens.accessToken);
          if (isMounted) {
            setAccessToken(tokens.accessToken);
            setUser(currentUser);
            safeSetStorage(TOKEN_KEY, tokens.accessToken);
            safeSetStorage(REFRESH_TOKEN_KEY, tokens.refreshToken);
            safeSetStorage(USER_KEY, JSON.stringify(currentUser));
          }
        }
      } catch (_err) {
        // Clear corrupt session
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
          safeRemoveStorage(TOKEN_KEY);
          safeRemoveStorage(REFRESH_TOKEN_KEY);
          safeRemoveStorage(USER_KEY);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (!response.data) throw new Error('Invalid login response');

      const { user: authUser, accessToken: token, refreshToken } = response.data;
      setUser(authUser);
      setAccessToken(token);

      safeSetStorage(TOKEN_KEY, token);
      safeSetStorage(REFRESH_TOKEN_KEY, refreshToken);
      safeSetStorage(USER_KEY, JSON.stringify(authUser));

      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.register(name, email, password, role);
      if (!response.data) throw new Error('Invalid registration response');

      const { user: authUser, accessToken: token, refreshToken } = response.data;
      setUser(authUser);
      setAccessToken(token);

      safeSetStorage(TOKEN_KEY, token);
      safeSetStorage(REFRESH_TOKEN_KEY, refreshToken);
      safeSetStorage(USER_KEY, JSON.stringify(authUser));

      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    const token = accessToken || safeGetStorage(TOKEN_KEY) || undefined;
    const refreshToken = safeGetStorage(REFRESH_TOKEN_KEY) || undefined;

    await authService.logout(token, refreshToken);

    setUser(null);
    setAccessToken(null);
    safeRemoveStorage(TOKEN_KEY);
    safeRemoveStorage(REFRESH_TOKEN_KEY);
    safeRemoveStorage(USER_KEY);
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authService.resetPassword(token, newPassword);
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
