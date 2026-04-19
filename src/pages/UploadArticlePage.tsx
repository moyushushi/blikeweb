import React, { useState, useRef } from 'react';
import {
    Container, Box, Typography, TextField, Button, FormControl, InputLabel,
    Select, MenuItem, Snackbar, Alert, CircularProgress, Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { useUser } from '../contexts/UserContext';
import RichTextEditor from '../components/RichTextEditor';

interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface Article {
    id: number;
    title: string;
    content: string;
    cover: string;
    category: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishTime: string;
    userId: number;
    status: number;
    author?: string;
    avatar?: string;
}

const CATEGORIES = ['科技', '生活', '娱乐', '知识', '游戏'];

const UploadArticlePage: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setSnackbar({ open: true, message: '请填写文章标题', type: 'error' });
            return;
        }
        if (!content.trim()) {
            setSnackbar({ open: true, message: '请填写文章内容', type: 'error' });
            return;
        }
        if (!category) {
            setSnackbar({ open: true, message: '请选择分类', type: 'error' });
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        if (coverFile) formData.append('cover', coverFile);
        try {
            const res = (await request.post('/article/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })) as ApiResponse<Article>;
            if (res.status === 200) {
                setSnackbar({ open: true, message: '发布成功！', type: 'success' });
                setTimeout(() => navigate('/articles'), 1500);
            } else {
                const errorMsg = typeof res.message === 'string' ? res.message : '发布失败';
                setSnackbar({ open: true, message: errorMsg, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: '网络错误', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>发布文章</Typography>
                <TextField
                    fullWidth
                    label="文章标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>分类</InputLabel>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORIES.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                </FormControl>
                <Box sx={{ my: 2 }}>
                    <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                        上传封面图片
                    </Button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleCoverChange} />
                    {coverPreview && (
                        <Box sx={{ mt: 2 }}>
                            <img src={coverPreview} alt="封面预览" style={{ maxWidth: '100%', maxHeight: 200 }} />
                        </Box>
                    )}
                </Box>
                <Typography variant="subtitle1" gutterBottom>文章内容</Typography>
                <RichTextEditor value={content} onChange={setContent} placeholder="写点东西..." />
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mt: 4, bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' } }}
                >
                    {loading ? <CircularProgress size={24} /> : '发布文章'}
                </Button>
            </Paper>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                <Alert severity={snackbar.type}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default UploadArticlePage;