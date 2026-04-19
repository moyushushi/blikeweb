import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Snackbar,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock, Email, VerifiedUser } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { useCountdown } from '../hook/useCountdown';

// 后端统一响应格式（与 RestBean 一致）
interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface RegisterForm {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    code: string;
}

const validators = {
    username: (value: string) => {
        if (!value) return '请输入用户名';
        if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) return '用户名只能包含字母、数字或中文';
        if (value.length < 3 || value.length > 14) return '用户名长度需在3-14位之间';
        return '';
    },
    password: (value: string) => {
        if (!value) return '请输入密码';
        if (value.length < 3 || value.length > 14) return '密码长度需在3-14位之间';
        return '';
    },
    confirmPassword: (value: string, password: string) => {
        if (!value) return '请再次输入密码';
        if (value !== password) return '两次输入的密码不一致';
        return '';
    },
    email: (value: string) => {
        if (!value) return '请输入邮箱';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) return '邮箱格式不正确';
        return '';
    },
    code: (value: string) => {
        if (!value) return '请输入验证码';
        if (value.length !== 6) return '验证码必须为6位';
        return '';
    },
};

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { coldTime, startCountdown } = useCountdown(); // 修复：解构 startCountdown
    const [form, setForm] = useState<RegisterForm>({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        code: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success' as 'success' | 'error',
    });

    const validateField = (name: keyof RegisterForm, value: string): string => {
        switch (name) {
            case 'confirmPassword':
                return validators.confirmPassword(value, form.password);
            default:
                return validators[name](value);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        const error = validateField(name as keyof RegisterForm, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const isEmailValid = () => validators.email(form.email) === '';

    const handleSendCode = async () => {
        if (!isEmailValid()) {
            setSnackbar({ open: true, message: '请先填写正确的邮箱', type: 'error' });
            return;
        }
        setCodeLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('email', form.email);
            const res = (await request.post('/vali-register-email', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })) as ApiResponse;
            if (res.status === 200) {
                setSnackbar({ open: true, message: String(res.message) || '验证码已发送', type: 'success' });
                startCountdown(60); // 开始倒计时
            } else {
                setSnackbar({ open: true, message: String(res.message) || '发送失败', type: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: '网络错误，请重试', type: 'error' });
        } finally {
            setCodeLoading(false);
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const newErrors: Partial<Record<keyof RegisterForm, string>> = {};
        (Object.keys(form) as Array<keyof RegisterForm>).forEach(key => {
            const error = validateField(key, form[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        if (Object.values(newErrors).some(e => e)) return;

        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', form.username);
            formData.append('password', form.password);
            formData.append('email', form.email);
            formData.append('code', form.code);
            const res = (await request.post('/register', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })) as ApiResponse;
            if (res.status === 200) {
                setSnackbar({ open: true, message: '注册成功！即将跳转登录...', type: 'success' });
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setSnackbar({ open: true, message: String(res.message) || '注册失败', type: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: '网络错误，请重试', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <Box sx={{ p: 4, boxShadow: 3, borderRadius: 3, bgcolor: 'white' }}>
                <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 600 }}>注册新用户</Typography>
                <Typography variant="body2" align="center" sx={{ color: 'gray', mb: 3 }}>欢迎注册，请填写相关信息</Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth label="用户名" name="username" value={form.username} onChange={handleChange}
                        error={!!errors.username} helperText={errors.username} margin="normal" required disabled={loading}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> } }}
                    />
                    <TextField
                        fullWidth label="密码" name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                        onChange={handleChange} error={!!errors.password} helperText={errors.password} margin="normal" required disabled={loading}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                            }
                        }}
                    />
                    <TextField
                        fullWidth label="确认密码" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword}
                        onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} margin="normal" required disabled={loading}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                            }
                        }}
                    />
                    <TextField
                        fullWidth label="电子邮箱" name="email" value={form.email} onChange={handleChange}
                        error={!!errors.email} helperText={errors.email} margin="normal" required disabled={loading}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-start' }}>
                        <TextField
                            fullWidth label="验证码" name="code" value={form.code} onChange={handleChange}
                            error={!!errors.code} helperText={errors.code} margin="normal" required disabled={loading}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><VerifiedUser color="action" /></InputAdornment> } }}
                        />
                        <Button variant="contained" onClick={handleSendCode} disabled={!isEmailValid() || coldTime > 0 || codeLoading}
                                sx={{ mt: 2, minWidth: 100, bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' }, whiteSpace: 'nowrap' }}>
                            {codeLoading ? <CircularProgress size={24} /> : (coldTime > 0 ? `${coldTime}秒` : '获取验证码')}
                        </Button>
                    </Box>
                    <Button fullWidth type="submit" variant="contained" disabled={loading}
                            sx={{ mt: 4, py: 1.2, borderRadius: 2, bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' } }}>
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '立即注册'}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }}><Typography variant="body2" sx={{ color: '#999' }}>已有账号？</Typography></Divider>
                <Box sx={{ textAlign: 'center' }}>
                    <Button variant="text" onClick={() => navigate('/login')} sx={{ color: '#FB7299' }}>立即登录</Button>
                </Box>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.type} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default RegisterPage;