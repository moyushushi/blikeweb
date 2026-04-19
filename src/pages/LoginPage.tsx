import React, { useState } from 'react';
import {
    Container, Box, Typography, TextField, Button, Checkbox,
    FormControlLabel, Divider, Snackbar, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { useUser } from '../contexts/UserContext';

interface LoginSuccessData {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface LoginForm {
    username: string;
    password: string;
    remember: boolean;
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const [form, setForm] = useState<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success' as 'success' | 'error',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'remember' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            setSnackbar({ open: true, message: '请输入账号和密码', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const res = (await request.post('/login', {
                username: form.username,
                password: form.password,
                remember: form.remember,
            })) as ApiResponse<LoginSuccessData | string>;

            if (res.status === 200) {
                if (res.message && typeof res.message === 'object' && 'token' in res.message) {
                    const token = res.message.token;
                    const user = res.message.user;
                    console.log('Token to save:', token);
                    localStorage.setItem('token', token);
                    setUser(user);
                    setSnackbar({ open: true, message: '登录成功', type: 'success' });
                    setTimeout(() => navigate('/'), 1000);
                } else {
                    setSnackbar({ open: true, message: '登录成功但未收到令牌', type: 'error' });
                }
            } else {
                const errorMsg = typeof res.message === 'string' ? res.message : '登录失败';
                setSnackbar({ open: true, message: errorMsg, type: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: '网络异常或账号密码错误', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ py: 10 }}>
            <Box sx={{ p: 4, boxShadow: 3, borderRadius: 3, bgcolor: 'white' }}>
                <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                    账号登录
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="用户名/邮箱"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="密码"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={loading}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="remember"
                                checked={form.remember}
                                onChange={handleChange}
                                color="primary"
                            />
                        }
                        label="记住我"
                        sx={{ mt: 1 }}
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 2,
                            py: 1.2,
                            borderRadius: 2,
                            bgcolor: '#FB7299',
                            '&:hover': { bgcolor: '#f857a6' },
                        }}
                    >
                        {loading ? '登录中...' : '登录'}
                    </Button>
                </form>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{ color: '#666', cursor: 'pointer' }}
                        onClick={() => navigate('/forget')}
                    >
                        忘记密码？
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#FB7299', cursor: 'pointer' }}
                        onClick={() => navigate('/register')}
                    >
                        注册账号
                    </Typography>
                </Box>
                <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>其他登录方式</Typography>
                </Divider>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                        游客可浏览视频，登录后可评论、投稿
                    </Typography>
                </Box>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.type} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default LoginPage;