import axios from 'axios';

const request = axios.create({
    baseURL: '/api',          // 空字符串，请求路径需以 /api 开头
    timeout: 5000,
    withCredentials: false, // JWT 不需要 Cookie
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
});

// 请求拦截器：添加 JWT Token
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    console.log('Request URL:', config.url);
    console.log('Token from localStorage:', token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added Authorization header');
    } else {
        console.warn('⚠️ No token found');
    }
    return config;
});

// 响应拦截器：统一格式转换和错误处理
request.interceptors.response.use(
    (response) => {
        const originalData = response.data;
        // 如果后端返回格式为 { code, msg, data }，转换为 { status, success, message, data }
        if (originalData && typeof originalData.code !== 'undefined') {
            return {
                status: originalData.code,
                success: originalData.code === 200,
                message: originalData.msg,
                data: originalData.data,
            };
        }
        // 如果后端已经是 { status, success, message } 格式（如认证模块），直接返回
        return originalData;
    },
    (error) => {
        // 统一错误处理：可提取后端返回的错误信息，或返回通用错误
        console.error('接口请求失败：', error);
        // 如果有响应体，尝试提取错误消息
        if (error.response && error.response.data) {
            const errData = error.response.data;
            // 兼容 { code, msg } 或 { status, message } 格式
            const message = errData.msg || errData.message || '请求失败';
            return Promise.reject({ status: errData.code || errData.status || 500, message });
        }
        return Promise.reject({ status: 500, message: '网络错误，请稍后重试' });
    }
);

export default request;