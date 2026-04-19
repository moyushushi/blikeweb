export const isLogin = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const login = (token: string) => {
    localStorage.setItem('token', token);
};

export const logout = () => {
    localStorage.removeItem('token');
};