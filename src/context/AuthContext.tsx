import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, College } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  currentCollege: College | null;
  login: (email: string, role?: string) => boolean;
  registerStudent: (data: {
    name: string;
    email: string;
    college_id: string;
    roll_number: string;
    department: string;
    academic_year: string;
    phone?: string;
  }) => User;
  logout: () => void;
  switchUser: (userId: string) => void;
  availableUsers: User[];
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCollege, setCurrentCollege] = useState<College | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const safeGetStoredUserId = (): string | null => {
    try {
      return localStorage.getItem('campusfind_current_user_id');
    } catch {
      return null;
    }
  };

  const safeSetStoredUserId = (id: string) => {
    try {
      localStorage.setItem('campusfind_current_user_id', id);
    } catch {
      // ignore
    }
  };

  const safeRemoveStoredUserId = () => {
    try {
      localStorage.removeItem('campusfind_current_user_id');
    } catch {
      // ignore
    }
  };

  const refreshAuth = () => {
    try {
      const users = storage.getUsers();
      setAvailableUsers(users);

      const savedUserId = safeGetStoredUserId();
      let userToSet: User | null = null;

      if (savedUserId) {
        userToSet = users.find(u => u.id === savedUserId) || null;
      }
      
      // Default to Rahul Sharma (Student at DY Patil) on first load for a rich initial experience
      if (!userToSet && users.length > 0) {
        userToSet = users.find(u => u.id === 'usr_student_rahul') || users[0];
        if (userToSet) {
          safeSetStoredUserId(userToSet.id);
        }
      }

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

  const login = (email: string): boolean => {
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      safeSetStoredUserId(user.id);
      setCurrentUser(user);
      if (user.college_id) {
        setCurrentCollege(storage.getCollegeById(user.college_id) || null);
      } else {
        setCurrentCollege(null);
      }
      return true;
    }
    return false;
  };

  const registerStudent = (data: {
    name: string;
    email: string;
    college_id: string;
    roll_number: string;
    department: string;
    academic_year: string;
    phone?: string;
  }): User => {
    const newUser = storage.addUser({
      name: data.name,
      email: data.email,
      college_id: data.college_id,
      roll_number: data.roll_number,
      department: data.department,
      academic_year: data.academic_year,
      phone: data.phone,
      role: 'student',
      status: 'active',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
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

  const switchUser = (userId: string) => {
    safeSetStoredUserId(userId);
    refreshAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCollege,
        login,
        registerStudent,
        logout,
        switchUser,
        availableUsers,
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
