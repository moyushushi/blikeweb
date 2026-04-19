import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Avatar, CircularProgress, Divider,
    InputBase, Button, List, ListItem, ListItemAvatar, ListItemText,
    Snackbar, Alert
} from '@mui/material';
import request from '../utils/request';
import { useUser } from '../contexts/UserContext';

interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface ArticleDetail {
    id: number;
    userId?: number;          // 作者ID，用于跳转
    title: string;
    content: string;
    cover: string;
    author: string;
    avatar: string;
    publishTime: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}

interface ArticleComment {
    id: number;
    articleId: number;
    userId: number;
    content: string;
    createTime: string;
    username: string;
    userAvatar: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ArticleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const [article, setArticle] = useState<ArticleDetail | null>(null);
    const [comments, setComments] = useState<ArticleComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchArticle = async () => {
            try {
                const res = (await request.get(`/article/${id}`)) as ApiResponse<ArticleDetail>;
                if (res.status === 200 && res.message) {
                    setArticle(res.message);
                }
            } catch (error) {
                console.error('获取文章详情失败:', error);
            }
        };

        const fetchComments = async () => {
            try {
                const res = (await request.get(`/comment/article/${id}`)) as ApiResponse<ArticleComment[]>;
                if (res.status === 200) {
                    setComments(res.message || []);
                }
            } catch (error) {
                console.error('获取评论失败:', error);
            }
        };

        const init = async () => {
            await fetchArticle();
            await fetchComments();
            setLoading(false);
        };

        void init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmitComment = async () => {
        if (!user) {
            setSnackbar({ open: true, message: '请先登录', type: 'error' });
            return;
        }
        if (!commentText.trim()) {
            setSnackbar({ open: true, message: '评论内容不能为空', type: 'error' });
            return;
        }
        setSubmitting(true);
        try {
            const res = (await request.post('/comment/article', {
                articleId: Number(id),
                content: commentText
            })) as ApiResponse;
            if (res.status === 200) {
                setCommentText('');
                // 刷新评论列表和文章详情
                const commentsRes = await request.get(`/comment/article/${id}`) as ApiResponse<ArticleComment[]>;
                if (commentsRes.status === 200) setComments(commentsRes.message || []);
                const articleRes = await request.get(`/article/${id}`) as ApiResponse<ArticleDetail>;
                if (articleRes.status === 200 && articleRes.message) setArticle(articleRes.message);
                setSnackbar({ open: true, message: '评论成功', type: 'success' });
            } else {
                const errorMsg = typeof res.message === 'string' ? res.message : '评论失败';
                setSnackbar({ open: true, message: errorMsg, type: 'error' });
            }
        } catch (error) {
            console.error('发表评论失败', error);
            setSnackbar({ open: true, message: '网络错误', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Container sx={{ py: 4 }}><CircularProgress /></Container>;
    if (!article) return <Container sx={{ py: 4 }}>文章不存在</Container>;

    const avatarUrl = article.avatar ? `${baseUrl}${article.avatar}` : `${baseUrl}/upload/avatar/default.png`;

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>{article.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                <Avatar
                    src={avatarUrl}
                    sx={{ cursor: article.userId ? 'pointer' : 'default' }}
                    onClick={() => article.userId && navigate(`/user/${article.userId}`)}
                />
                <Typography
                    sx={{ cursor: article.userId ? 'pointer' : 'default' }}
                    onClick={() => article.userId && navigate(`/user/${article.userId}`)}
                >
                    {article.author}
                </Typography>
                <Typography variant="body2" color="textSecondary">{article.publishTime}</Typography>
                <Typography variant="body2" color="textSecondary">阅读 {article.viewCount}</Typography>
            </Box>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>评论 ({article.commentCount})</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Avatar src={user?.avatar ? `${baseUrl}${user.avatar}` : `${baseUrl}/upload/avatar/default.png`} />
                <Box sx={{ flexGrow: 1 }}>
                    <InputBase
                        fullWidth
                        multiline
                        rows={2}
                        placeholder={user ? "写下你的评论..." : "请登录后评论"}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={!user}
                        sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            padding: '8px 12px',
                            backgroundColor: !user ? '#f5f5f5' : 'white'
                        }}
                    />
                </Box>
                <Button
                    variant="contained"
                    onClick={handleSubmitComment}
                    disabled={!user || !commentText.trim() || submitting}
                    sx={{ bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' }, alignSelf: 'flex-start' }}
                >
                    {submitting ? <CircularProgress size={24} /> : '发送'}
                </Button>
            </Box>

            {comments.length === 0 ? (
                <Typography variant="body2" color="textSecondary">暂无评论，快来抢沙发吧~</Typography>
            ) : (
                <List>
                    {comments.map((comment) => (
                        <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={comment.userAvatar ? `${baseUrl}${comment.userAvatar}` : `${baseUrl}/upload/avatar/default.png`}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/user/${comment.userId}`)}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: 600, cursor: 'pointer' }}
                                            onClick={() => navigate(`/user/${comment.userId}`)}
                                        >
                                            {comment.username}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(comment.createTime).toLocaleString()}
                                        </Typography>
                                    </Box>
                                }
                                secondary={comment.content}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.type} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ArticleDetail;