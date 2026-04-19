import React, { useState } from 'react';
import {
    Container, Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress,
    IconButton, InputAdornment, Stepper, Step, StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email, VerifiedUser } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { useCountdown } from '../hook/useCountdown';

interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;
}

const ForgetPage: React.FC = () => {
    const navigate = useNavigate();
    const { coldTime, startCountdown } = useCountdown();
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; code?: string; password?: string; confirmPassword?: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [codeLoading, setCodeLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

    const getMessage = (msg: unknown): string => {
        return typeof msg === 'string' ? msg : '';
    };

    const validateEmail = (val: string) => {
        if (!val) return '请输入邮箱';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val)) return '邮箱格式不正确';
        return '';
    };
    const validateCode = (val: string) => {
        if (!val) return '请输入验证码';
        if (val.length !== 6) return '验证码必须为6位';
        return '';
    };
    const validatePassword = (val: string) => {
        if (!val) return '请输入密码';
        if (val.length < 3 || val.length > 14) return '密码长度需在3-14位之间';
        return '';
    };
    const validateConfirm = (val: string, pwd: string) => {
        if (!val) return '请再次输入密码';
        if (val !== pwd) return '两次输入的密码不一致';
        return '';
    };

    const isEmailValid = () => validateEmail(email) === '';
    const isStep1Valid = () => isEmailValid() && validateCode(code) === '';

    const handleSendCode = async () => {
        if (!isEmailValid()) {
            setSnackbar({ open: true, message: '请先填写正确的邮箱', type: 'error' });
            return;
        }
        setCodeLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('email', email);
            const res = (await request.post('/vali-reset-email', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })) as ApiResponse;
            if (res.status === 200) {
                setSnackbar({ open: true, message: getMessage(res.message) || '验证码已发送', type: 'success' });
                startCountdown(60);
            } else {
                setSnackbar({ open: true, message: getMessage(res.message) || '发送失败', type: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: '网络错误，请重试', type: 'error' });
        } finally {
            setCodeLoading(false);
        }
    };

    const handleStartReset = async () => {
        const emailErr = validateEmail(email);
        const codeErr = validateCode(code);
        if (emailErr || codeErr) {
            setErrors({ email: emailErr, code: codeErr });
            return;
        }
        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('email', email);
            formData.append('code', code);
            const res = (await request.post('/start-reset', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })) as ApiResponse;
            if (res.status === 200) {
                setSnackbar({ open: true, message: getMessage(res.message) || '验证成功，请设置新密码', type: 'success' });
                setActiveStep(1);
            } else {
                setSnackbar({ open: true, message: getMessage(res.message) || '验证失败', type: 'error' });
            }
        } catch {
            setSnackbar({ open: true, message: '网络错误，请重试', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDoReset = async () => {
        const pwdErr = validatePassword(password);
        const confirmErr = validateConfirm(confirmPassword, password);
        if (pwdErr || confirmErr) {
            setErrors({ password: pwdErr, confirmPassword: confirmErr });
            return;
        }
        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('email', email);      // 关键：提交邮箱
            formData.append('password', password);
            const res = (await request.post('/do-password', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })) as ApiResponse;
            if (res.status === 200) {
                setSnackbar({ open: true, message: '密码重置成功！即将跳转登录...', type: 'success' });
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setSnackbar({ open: true, message: getMessage(res.message) || '重置失败', type: 'error' });
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
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    <Step><StepLabel>验证电子邮件</StepLabel></Step>
                    <Step><StepLabel>设定密码</StepLabel></Step>
                </Stepper>

                {activeStep === 0 && (
                    <>
                        <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 600 }}>重置密码</Typography>
                        <Typography variant="body2" align="center" sx={{ color: 'gray', mb: 3 }}>通过邮箱重置密码</Typography>
                        <TextField fullWidth label="电子邮箱" value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} helperText={errors.email} margin="normal" required
                                   slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> } }} />
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-start' }}>
                            <TextField fullWidth label="验证码" value={code} onChange={(e) => setCode(e.target.value)} error={!!errors.code} helperText={errors.code} margin="normal" required
                                       slotProps={{ input: { startAdornment: <InputAdornment position="start"><VerifiedUser color="action" /></InputAdornment> } }} />
                            <Button variant="contained" onClick={handleSendCode} disabled={!isEmailValid() || coldTime > 0 || codeLoading}
                                    sx={{ mt: 2, minWidth: 100, bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' }, whiteSpace: 'nowrap' }}>
                                {codeLoading ? <CircularProgress size={24} /> : (coldTime > 0 ? `${coldTime}秒` : '获取验证码')}
                            </Button>
                        </Box>
                        <Button fullWidth variant="contained" onClick={handleStartReset} disabled={loading || !isStep1Valid()}
                                sx={{ mt: 4, py: 1.2, borderRadius: 2, bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' } }}>
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '立即重置密码'}
                        </Button>
                    </>
                )}

                {activeStep === 1 && (
                    <>
                        <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: 600 }}>重置密码</Typography>
                        <Typography variant="body2" align="center" sx={{ color: 'gray', mb: 3 }}>请填写您的新密码</Typography>
                        <TextField fullWidth label="新密码" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} error={!!errors.password} helperText={errors.password} margin="normal" required
                                   slotProps={{
                                       input: {
                                           startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                                           endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                                       }
                                   }} />
                        <TextField fullWidth label="确认新密码" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={!!errors.confirmPassword} helperText={errors.confirmPassword} margin="normal" required
                                   slotProps={{
                                       input: {
                                           startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                                           endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                                       }
                                   }} />
                        <Button fullWidth variant="contained" onClick={handleDoReset} disabled={loading}
                                sx={{ mt: 4, py: 1.2, borderRadius: 2, bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' } }}>
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '重置密码'}
                        </Button>
                    </>
                )}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button variant="text" onClick={() => navigate('/login')} sx={{ color: '#FB7299' }}>返回登录</Button>
                </Box>
            </Box>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.type} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ForgetPage;