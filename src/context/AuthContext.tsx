import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, College } from '../types';
import { storage } from '../services/storage';

const ADMIN_ID = 'admin@campusfind.in';
const ADMIN_PASS = 'CampusFind@2026';
const ADMIN_USER_ID = 'admin_master';
const AUTH_STORAGE_KEY = 'campusfind_current_user_id_v2';

const buildAdminUser = (): User => ({
  id: ADMIN_USER_ID,
  college_id: null,
  name: 'CampusFind Administrator',
  email: ADMIN_ID,
  role: 'super_admin',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  currentUser: User | null;
  currentCollege: College | null;
  isAdmin: boolean;
  login: (email: string, password: string) => AuthResult;
  loginAdmin: (adminId: string, password: string) => AuthResult;
  registerStudent: (data: {
    name: string;
    email: string;
    college_id: string;
    roll_number: string;
    department: string;
    academic_year: string;
    phone?: string;
    password: string;
  }) => User;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCollege, setCurrentCollege] = useState<College | null>(null);

  const safeGetStoredUserId = (): string | null => {
    try {
      // Remove legacy demo auto-login key if present
      localStorage.removeItem('campusfind_current_user_id');
      return localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const safeSetStoredUserId = (id: string) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const safeRemoveStoredUserId = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const refreshAuth = () => {
    try {
      const savedUserId = safeGetStoredUserId();
      if (!savedUserId) {
        setCurrentUser(null);
        setCurrentCollege(null);
        return;
      }

      if (savedUserId === ADMIN_USER_ID) {
        setCurrentUser(buildAdminUser());
        setCurrentCollege(null);
        return;
      }

      const users = storage.getUsers();
      const userToSet = users.find(u => u.id === savedUserId && u.role === 'student') || null;
      setCurrentUser(userToSet);

      if (userToSet?.college_id) {
        const college = storage.getCollegeById(userToSet.college_id) || null;
        setCurrentCollege(college);
      } else {
        setCurrentCollege(null);
      }
    } catch (e) {
      console.error('Error refreshing auth:', e);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = (email: string, password: string): AuthResult => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ADMIN_ID) {
      return {
        success: false,
        error: 'Administrators must sign in through the separate Admin Portal.',
      };
    }

    const users = storage.getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === cleanEmail && u.role === 'student'
    );

    if (!user) {
      return {
        success: false,
        error: 'No registered student account found with this email. Please register first.',
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    safeSetStoredUserId(user.id);
    setCurrentUser(user);
    if (user.college_id) {
      setCurrentCollege(storage.getCollegeById(user.college_id) || null);
    } else {
      setCurrentCollege(null);
    }
    return { success: true };
  };

  const loginAdmin = (adminId: string, password: string): AuthResult => {
    const cleanId = adminId.trim().toLowerCase();
    if (cleanId !== ADMIN_ID || password !== ADMIN_PASS) {
      return {
        success: false,
        error: 'Invalid Admin ID or Password. Access denied.',
      };
    }

    const adminUser = buildAdminUser();
    safeSetStoredUserId(ADMIN_USER_ID);
    setCurrentUser(adminUser);
    setCurrentCollege(null);
    return { success: true };
  };

  const registerStudent = (data: {
    name: string;
    email: string;
    college_id: string;
    roll_number: string;
    department: string;
    academic_year: string;
    phone?: string;
    password: string;
  }): User => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (cleanEmail === ADMIN_ID) {
      throw new Error('This email address is reserved.');
    }

    const existing = storage.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }

    const newUser = storage.addUser({
      name: data.name.trim(),
      email: cleanEmail,
      college_id: data.college_id,
      roll_number: data.roll_number.trim(),
      department: data.department,
      academic_year: data.academic_year,
      phone: data.phone,
      password: data.password,
      role: 'student',
      status: 'active',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name.trim())}`,
    });

    safeSetStoredUserId(newUser.id);
    refreshAuth();
    return newUser;
  };

  const logout = () => {
    safeRemoveStoredUserId();
    setCurrentUser(null);
    setCurrentCollege(null);
  };

  const isAdmin = currentUser?.id === ADMIN_USER_ID;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCollege,
        isAdmin,
        login,
        loginAdmin,
        registerStudent,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
