/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import request from '../utils/request';

// 定义后端 RestBean 响应类型
interface RestBean<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface User {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    fetchUser: () => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token || token === 'null') {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = (await request.get('/user/me')) as RestBean<User>;
            if (res.status === 200 && res.message) {
                setUser(res.message);
            } else if (res.status === 401) {
                // 仅当后端明确返回 401 未授权时，才清除 token
                console.error('Token 无效，清除本地存储');
                localStorage.removeItem('token');
                setUser(null);
            } else {
                console.error('获取用户信息失败，状态码:', res.status);
                // 不删除 token，保留尝试
            }
        } catch (error) {
            console.error('获取用户信息请求异常:', error);
            // 网络错误等，不清除 token，保留原有状态
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    useEffect(() => {
        void fetchUser(); // 忽略 Promise 返回值
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading, fetchUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};