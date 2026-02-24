import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

console.log('=== AuthContext 初始化 ===');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('process.env.EXPO_PUBLIC_BACKEND_BASE_URL:', process.env.EXPO_PUBLIC_BACKEND_BASE_URL);

export interface User {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  avatar_type?: 'preset' | 'custom';
  avatar_url?: string;
  bio?: string;
  age?: number;
  gender?: 'male' | 'female';
  is_admin?: boolean;
  password_plain?: string; // 明文密码（仅管理员可见）
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  login: (name: string, password: string) => Promise<boolean>;
  register: (name: string, password: string, nickname?: string, avatar?: string, age?: number, gender?: 'male' | 'female', isAdmin?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (userId: string, password: string) => Promise<boolean>;
  updateUser: (userId: string, updates: Partial<Omit<User, 'id' | 'name' | 'created_at' | 'updated_at'>>, newPassword?: string, currentPassword?: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
  verifyCurrentPassword: (userId: string, currentPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_ID_KEY = 'currentUserId';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载用户数据
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('=== 初始化认证 ===');
      
      // 1. 加载所有用户
      await refreshUsers();
      
      // 2. 检查是否有缓存的当前用户 ID
      const savedUserId = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
      
      if (savedUserId) {
        // 3. 尝试从后端获取该用户的详细信息
        const user = await fetchUserById(savedUserId);
        if (user) {
          setCurrentUser(user);
          console.log('恢复登录用户:', user.name);
        }
      }
    } catch (error) {
      console.error('初始化认证失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新所有用户列表
  const refreshUsers = async () => {
    try {
      console.log('刷新用户列表...');
      const response = await fetch(`${API_BASE_URL}/api/v1/users`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setAllUsers(result.data);
        console.log('用户列表已更新:', result.data.length, '个用户');
        
        // 如果没有用户，创建默认用户
        if (result.data.length === 0) {
          await createDefaultUsers();
          await refreshUsers(); // 重新刷新
        }
      }
    } catch (error) {
      console.error('刷新用户列表失败:', error);
    }
  };

  // 创建默认用户
  const createDefaultUsers = async () => {
    try {
      console.log('创建默认用户...');
      
      // 创建普通用户
      const defaultUserResponse = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '安安',
          password: '1234',
          nickname: '小安安',
          avatar: 'cat',
          avatar_type: 'preset',
          age: 10,
          gender: 'female',
          is_admin: false,
        }),
      });
      
      // 创建管理员用户
      const adminUserResponse = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'admin',
          password: 'admin123',
          nickname: '超级管理员',
          avatar: 'dragon',
          avatar_type: 'preset',
          age: 30,
          gender: 'male',
          is_admin: true,
        }),
      });
      
      if (defaultUserResponse.ok && adminUserResponse.ok) {
        console.log('默认用户创建成功: 安安/1234 和 admin/admin123');
      }
    } catch (error) {
      console.error('创建默认用户失败:', error);
    }
  };

  // 根据 ID 获取单个用户
  const fetchUserById = async (userId: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  };

  // 根据用户名获取用户（用于登录验证）
  const fetchUserByName = async (name: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/by-name/${encodeURIComponent(name)}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  };

  const register = async (
    name: string,
    password: string,
    nickname?: string,
    avatar?: string,
    age?: number,
    gender?: 'male' | 'female',
    isAdmin?: boolean
  ): Promise<boolean> => {
    try {
      console.log('=== 开始注册 ===');
      console.log('用户名:', name);
      
      // 检查用户名是否已存在
      const existingUser = await fetchUserByName(name);
      if (existingUser) {
        console.log('用户名已存在:', name);
        return false;
      }
      
      // 调用后端 API 创建用户
      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          password,
          nickname,
          avatar: avatar || 'cat',
          avatar_type: avatar ? 'preset' : undefined,
          age,
          gender,
          is_admin: isAdmin,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 自动登录新用户
        await AsyncStorage.setItem(CURRENT_USER_ID_KEY, result.data.id);
        setCurrentUser(result.data);
        await refreshUsers();
        
        console.log('=== 注册成功 ===');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    }
  };

  const login = async (name: string, password: string): Promise<boolean> => {
    try {
      console.log('=== 开始登录 ===');
      console.log('用户名:', name);
      
      // 调用后端登录API验证密码
      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 登录成功
        await AsyncStorage.setItem(CURRENT_USER_ID_KEY, result.data.id);
        setCurrentUser(result.data);
        
        console.log('=== 登录成功 ===');
        return true;
      }
      
      console.log('登录失败:', result.error);
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  const switchUser = async (userId: string, password: string): Promise<boolean> => {
    try {
      // 1. 获取用户信息
      const user = await fetchUserById(userId);
      if (!user) {
        return false;
      }
      
      // 2. 切换用户
      await AsyncStorage.setItem(CURRENT_USER_ID_KEY, user.id);
      setCurrentUser(user);
      
      return true;
    } catch (error) {
      console.error('切换用户失败:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_ID_KEY);
      setCurrentUser(null);
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 验证当前密码
  const verifyCurrentPassword = async (userId: string, currentPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword }),
      });
      
      const result = await response.json();
      return result.success && result.valid;
    } catch (error) {
      console.error('验证密码失败:', error);
      return false;
    }
  };

  // 更新用户信息
  const updateUser = async (
    userId: string,
    updates: Partial<Omit<User, 'id' | 'name' | 'created_at' | 'updated_at'>>,
    newPassword?: string,
    currentPassword?: string
  ): Promise<boolean> => {
    try {
      console.log('=== 开始更新用户信息 ===');
      console.log('更新内容:', updates);
      console.log('是否修改密码:', !!newPassword);
      
      // 如果要修改密码，先验证当前密码
      if (newPassword && currentPassword) {
        const isValid = await verifyCurrentPassword(userId, currentPassword);
        if (!isValid) {
          console.log('当前密码验证失败');
          return false;
        }
        console.log('当前密码验证成功');
      }
      
      let success = true;
      
      // 1. 更新用户基本信息（只有当有更新内容时才调用）
      if (Object.keys(updates).length > 0) {
        console.log('正在更新基本信息...');
        const updateResponse = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        const updateResult = await updateResponse.json();
        if (!updateResult.success) {
          console.log('更新用户信息失败:', updateResult.error);
          success = false;
        } else {
          console.log('基本信息更新成功');
        }
      }
      
      // 2. 如果提供了新密码，更新密码
      if (newPassword && success) {
        console.log('正在更新密码...');
        const passwordResponse = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword }),
        });
        
        const passwordResult = await passwordResponse.json();
        if (!passwordResult.success) {
          console.log('更新密码失败:', passwordResult.error);
          success = false;
        } else {
          console.log('密码更新成功');
        }
      }
      
      // 3. 刷新用户列表
      if (success) {
        await refreshUsers();
        
        // 4. 如果更新的是当前用户，同步更新当前用户
        if (currentUser?.id === userId) {
          const updatedUser = await fetchUserById(userId);
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        }
      }
      
      console.log('=== 用户信息更新完成，结果:', success ? '成功' : '失败');
      return success;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return false;
    }
  };

  // 注销用户（删除账号）
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      console.log('=== 开始注销用户 ===');
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // 刷新用户列表
        await refreshUsers();
        
        // 如果删除的是当前用户，退出登录
        if (currentUser?.id === userId) {
          await AsyncStorage.removeItem(CURRENT_USER_ID_KEY);
          setCurrentUser(null);
        }
        
        console.log('=== 用户注销成功 ===');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('注销用户失败:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        login,
        register,
        logout,
        switchUser,
        updateUser,
        deleteUser,
        refreshUsers,
        verifyCurrentPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}
