import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Container,
    Card,
    CardContent,
    TextField,
    InputLabel,
    FormControl,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    LinearProgress,
    CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { useUser } from '../contexts/UserContext';

interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: string;
    data?: T;
}

const VIDEO_CATEGORIES = [
    { value: 'game', label: '游戏' },
    { value: 'life', label: '生活' },
    { value: 'tech', label: '科技' },
    { value: 'entertainment', label: '娱乐' },
    { value: 'knowledge', label: '知识' }
];

const UploadPage: React.FC = () => {
    const { user, loading: userLoading } = useUser();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success' as 'success' | 'error'
    });

    const videoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // 未登录拦截
    useEffect(() => {
        if (!userLoading && !user) {
            alert('请先登录后再上传视频！');
            navigate('/');
        }
    }, [user, userLoading, navigate]);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            showSnackbar('请选择视频文件（MP4、AVI、MOV等）', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024 * 1024) {
            showSnackbar('视频文件不能超过 10GB', 'error');
            return;
        }
        setVideoFile(file);
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showSnackbar('封面请选择图片文件（JPG、PNG等）', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showSnackbar('封面图片不能超过 5MB', 'error');
            return;
        }
        setCoverFile(file);
    };

    const showSnackbar = (message: string, type: 'success' | 'error') => {
        setSnackbar({ open: true, message, type });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const validateForm = (): boolean => {
        if (!videoFile) {
            showSnackbar('请选择要上传的视频文件', 'error');
            return false;
        }
        if (!title.trim()) {
            showSnackbar('请填写视频标题', 'error');
            return false;
        }
        if (!category) {
            showSnackbar('请选择视频分类', 'error');
            return false;
        }
        return true;
    };

    const handleUpload = async () => {
        if (!validateForm()) return;

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('video', videoFile!);
        if (coverFile) formData.append('cover', coverFile);
        formData.append('title', title.trim());
        formData.append('desc', description.trim());
        formData.append('category', category);

        try {
            const response = (await request.post('/video/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                },
            })) as ApiResponse;

            if (response.status === 200) {
                showSnackbar('视频发布成功！正在跳转...', 'success');
                setTimeout(() => navigate('/'), 1500);
            } else {
                throw new Error(response.message || '上传失败');
            }
        } catch (err) {
            console.error('上传错误:', err);
            let errorMsg = '视频上传失败，请重试';
            if (err instanceof Error) {
                errorMsg = err.message;
            }
            showSnackbar(errorMsg, 'error');
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const handleCancel = () => navigate('/');

    if (userLoading) {
        return <Container sx={{ py: 8, textAlign: 'center' }}>验证登录状态中...</Container>;
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Typography variant="h4" align="center" sx={{ mb: 6, color: '#333', fontWeight: 500 }}>
                视频投稿
            </Typography>

            <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                    {/* 视频文件上传区域 */}
                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: videoFile ? '#FB7299' : '#e0e0e0',
                            borderRadius: 3,
                            p: 4,
                            textAlign: 'center',
                            mb: 3,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#FB7299', bgcolor: '#fafafa' },
                            bgcolor: videoFile ? '#fef0f3' : '#fafafa'
                        }}
                        onClick={() => videoInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={videoInputRef}
                            onChange={handleVideoChange}
                            accept="video/*"
                            style={{ display: 'none' }}
                        />
                        <CloudUploadIcon sx={{ fontSize: 56, color: videoFile ? '#FB7299' : '#999', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: videoFile ? '#FB7299' : '#666', mb: 1 }}>
                            {videoFile ? videoFile.name : '点击上传视频文件'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                            支持 MP4、AVI、MOV 等格式，最大 10GB
                        </Typography>
                        {videoFile && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#FB7299' }}>
                                已选择：{(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </Typography>
                        )}
                    </Box>

                    {/* 封面图片上传区域 */}
                    <Box
                        sx={{
                            border: '1px solid',
                            borderColor: coverFile ? '#FB7299' : '#e0e0e0',
                            borderRadius: 3,
                            p: 2,
                            textAlign: 'center',
                            mb: 4,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#FB7299', bgcolor: '#fafafa' },
                            bgcolor: coverFile ? '#fef0f3' : 'transparent'
                        }}
                        onClick={() => coverInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={coverInputRef}
                            onChange={handleCoverChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <ImageIcon sx={{ fontSize: 32, color: coverFile ? '#FB7299' : '#999', mb: 1 }} />
                        <Typography variant="body1" sx={{ color: coverFile ? '#FB7299' : '#666' }}>
                            {coverFile ? `封面：${coverFile.name}` : '点击上传视频封面（可选）'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                            建议尺寸 16:9，JPG/PNG，不超过 5MB
                        </Typography>
                    </Box>

                    {/* 上传进度条 */}
                    {isUploading && (
                        <Box sx={{ mb: 4 }}>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{ height: 8, borderRadius: 4, bgcolor: '#ffe6ec', '& .MuiLinearProgress-bar': { bgcolor: '#FB7299' } }}
                            />
                            <Typography variant="body2" align="right" sx={{ mt: 0.5, color: '#666' }}>
                                {uploadProgress}% 上传中...
                            </Typography>
                        </Box>
                    )}

                    {/* 视频信息表单 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="视频标题"
                            variant="outlined"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="请输入吸引人的视频标题"
                            required
                            fullWidth
                            disabled={isUploading}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        <FormControl fullWidth required disabled={isUploading}>
                            <InputLabel>视频分类</InputLabel>
                            <Select
                                value={category}
                                label="视频分类"
                                onChange={(e) => setCategory(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                {VIDEO_CATEGORIES.map((item) => (
                                    <MenuItem key={item.value} value={item.value}>
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="视频描述"
                            variant="outlined"
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="介绍一下你的视频内容吧..."
                            disabled={isUploading}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>

                    {/* 操作按钮 */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 6 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={isUploading}
                            sx={{ borderColor: '#ccc', color: '#666', borderRadius: 2, px: 3 }}
                        >
                            取消
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={isUploading || !videoFile || !title || !category}
                            sx={{
                                backgroundColor: '#FB7299',
                                borderRadius: 2,
                                px: 4,
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': { backgroundColor: '#f857a6' },
                                '&.Mui-disabled': { backgroundColor: '#ffb3c6', color: '#fff' }
                            }}
                        >
                            {isUploading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '提交发布'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.type} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UploadPage;