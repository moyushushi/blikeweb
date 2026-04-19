import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    Avatar,
    Button,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    CircularProgress,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Tabs,
    Tab,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import request from '../utils/request';

interface RestBean<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface FollowUser {
    id: number;
    username: string;
    avatar: string;
}

interface LikedVideo {
    id: number;
    title: string;
    cover: string;
    author: string;
    playCount: string;
    time: string;
    likeTime: string;
}

interface LikedArticle {
    id: number;
    title: string;
    cover: string;
    author: string;
    likeTime: string;
}

interface MyVideo {
    id: number;
    title: string;
    cover: string;
    playCount: string;
    time: string;
    publishTime: string;
}

interface MyArticle {
    id: number;
    title: string;
    cover: string;
    viewCount: number;
    publishTime: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ProfilePage: React.FC = () => {
    const { user, setUser, fetchUser } = useUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    // 基本信息 & 安全设置
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        type: 'success' as 'success' | 'error',
    });

    // 个人简介
    const [bio, setBio] = useState('');
    const [editBio, setEditBio] = useState(false);
    const [tempBio, setTempBio] = useState('');

    // 我的关注
    const [followingList, setFollowingList] = useState<FollowUser[]>([]);
    const [followingLoading, setFollowingLoading] = useState(false);
    const [unfollowLoading, setUnfollowLoading] = useState<number | null>(null);

    // 最近点赞视频
    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
    const [likedVideosLoading, setLikedVideosLoading] = useState(false);

    // 最近点赞文章
    const [likedArticles, setLikedArticles] = useState<LikedArticle[]>([]);
    const [likedArticlesLoading, setLikedArticlesLoading] = useState(false);

    // 我的视频
    const [myVideos, setMyVideos] = useState<MyVideo[]>([]);
    const [myVideosLoading, setMyVideosLoading] = useState(false);

    // 我的文章
    const [myArticles, setMyArticles] = useState<MyArticle[]>([]);
    const [myArticlesLoading, setMyArticlesLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) {
            void fetchUser();
        } else {
            setBio(user.bio || '');
            setTempBio(user.bio || '');
        }
    }, [user, fetchUser]);

    // 更新简介
    const handleUpdateBio = async () => {
        try {
            const res = (await request.post('/user/update-bio', { bio: tempBio })) as RestBean<string>;
            if (res.status === 200) {
                setBio(tempBio);
                setUser({ ...user!, bio: tempBio });
                setEditBio(false);
                setSnackbar({ open: true, message: '简介更新成功', type: 'success' });
            } else {
                setSnackbar({ open: true, message: res.message || '更新失败', type: 'error' });
            }
        } catch (error) {
            console.error('更新简介失败', error);
            setSnackbar({ open: true, message: '网络错误', type: 'error' });
        }
    };

    // 获取关注列表
    const fetchFollowing = useCallback(async () => {
        if (!user) return;
        setFollowingLoading(true);
        try {
            const res = (await request.get('/user/following')) as RestBean<FollowUser[]>;
            if (res.status === 200 && res.message) {
                setFollowingList(res.message);
            } else {
                setFollowingList([]);
            }
        } catch (error) {
            console.error('获取关注列表失败', error);
            setFollowingList([]);
        } finally {
            setFollowingLoading(false);
        }
    }, [user]);

    // 获取点赞视频
    const fetchLikedVideos = useCallback(async () => {
        if (!user) return;
        setLikedVideosLoading(true);
        try {
            const res = (await request.get('/user/liked-videos?limit=10')) as RestBean<LikedVideo[]>;
            if (res.status === 200 && res.message) {
                setLikedVideos(res.message);
            } else {
                setLikedVideos([]);
            }
        } catch (error) {
            console.error('获取点赞视频列表失败', error);
            setLikedVideos([]);
        } finally {
            setLikedVideosLoading(false);
        }
    }, [user]);

    // 获取点赞文章
    const fetchLikedArticles = useCallback(async () => {
        if (!user) return;
        setLikedArticlesLoading(true);
        try {
            const res = (await request.get('/article/liked?limit=10')) as RestBean<LikedArticle[]>;
            if (res.status === 200 && res.message) {
                setLikedArticles(res.message);
            } else {
                setLikedArticles([]);
            }
        } catch (error) {
            console.error('获取点赞文章列表失败', error);
            setLikedArticles([]);
        } finally {
            setLikedArticlesLoading(false);
        }
    }, [user]);

    // 获取我的视频
    const fetchMyVideos = useCallback(async () => {
        if (!user) return;
        setMyVideosLoading(true);
        try {
            const res = (await request.get(`/video/user/${user.id}`)) as RestBean<MyVideo[]>;
            if (res.status === 200 && res.message) {
                setMyVideos(res.message);
            } else {
                setMyVideos([]);
            }
        } catch (error) {
            console.error('获取我的视频失败', error);
            setMyVideos([]);
        } finally {
            setMyVideosLoading(false);
        }
    }, [user]);

    // 获取我的文章
    const fetchMyArticles = useCallback(async () => {
        if (!user) return;
        setMyArticlesLoading(true);
        try {
            const res = (await request.get(`/article/user/${user.id}`)) as RestBean<MyArticle[]>;
            if (res.status === 200 && res.message) {
                setMyArticles(res.message);
            } else {
                setMyArticles([]);
            }
        } catch (error) {
            console.error('获取我的文章失败', error);
            setMyArticles([]);
        } finally {
            setMyArticlesLoading(false);
        }
    }, [user]);

    // 切换 tab 时动态加载数据
    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            switch (activeTab) {
                case 2: await fetchFollowing(); break;
                case 3: await fetchLikedVideos(); break;
                case 4: await fetchLikedArticles(); break;
                case 5: await fetchMyVideos(); break;
                case 6: await fetchMyArticles(); break;
                default: break;
            }
        };
        void loadData().catch(console.error);
    }, [activeTab, user, fetchFollowing, fetchLikedVideos, fetchLikedArticles, fetchMyVideos, fetchMyArticles]);

    // 取消关注
    const handleUnfollow = async (followingId: number) => {
        if (!user) return;
        setUnfollowLoading(followingId);
        try {
            await request.delete(`/user/follow/${followingId}`);
            setFollowingList(prev => prev.filter(item => item.id !== followingId));
            setSnackbar({ open: true, message: '已取消关注', type: 'success' });
        } catch (error) {
            console.error('取消关注失败', error);
            setSnackbar({ open: true, message: '取消关注失败', type: 'error' });
        } finally {
            setUnfollowLoading(null);
        }
    };

    // 头像上传
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setSnackbar({ open: true, message: '请选择图片文件', type: 'error' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setSnackbar({ open: true, message: '图片不能超过 5MB', type: 'error' });
            return;
        }
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const res = (await request.post('/user/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })) as RestBean<string>;
            if (res.status === 200 && res.message) {
                setUser({ ...user!, avatar: res.message });
                setSnackbar({ open: true, message: '头像更新成功', type: 'success' });
                await fetchUser();
            } else {
                setSnackbar({ open: true, message: res.message || '上传失败', type: 'error' });
            }
        } catch (error) {
            console.error('上传头像失败', error);
            setSnackbar({ open: true, message: '网络错误', type: 'error' });
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdatePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setSnackbar({ open: true, message: '两次输入的新密码不一致', type: 'error' });
            return;
        }
        if (passwordForm.newPassword.length < 3 || passwordForm.newPassword.length > 14) {
            setSnackbar({ open: true, message: '密码长度需在3-14位之间', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            const res = (await request.post('/user/change-password', {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            })) as RestBean<string>;

            if (res.status === 200) {
                setSnackbar({ open: true, message: '密码修改成功', type: 'success' });
                setOpenPasswordDialog(false);
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setSnackbar({ open: true, message: res.message || '修改失败', type: 'error' });
            }
        } catch (error) {
            console.error('修改密码失败', error);
            setSnackbar({ open: true, message: '网络错误或旧密码不正确', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>加载中...</Typography>
            </Container>
        );
    }

    const avatarUrl = user.avatar ? `${baseUrl}${user.avatar}` : `${baseUrl}/upload/avatar/default.png`;

    // 渲染右侧内容
    const renderContent = () => {
        switch (activeTab) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>基本信息</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField label="用户名" value={user.username} disabled fullWidth />
                            <TextField label="电子邮箱" value={user.email} disabled fullWidth />
                        </Box>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>安全设置</Typography>
                        <Button
                            variant="contained"
                            onClick={() => setOpenPasswordDialog(true)}
                            sx={{ bgcolor: '#FB7299', '&:hover': { bgcolor: '#f857a6' } }}
                        >
                            修改密码
                        </Button>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>我的关注</Typography>
                        {followingLoading ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : followingList.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#999' }}>暂无关注的人</Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {followingList.map((follow) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={follow.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 1, borderRadius: 2, '&:hover': { bgcolor: '#f5f5f5' } }}>
                                            <Box onClick={() => navigate(`/user/${follow.id}`)} sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, cursor: 'pointer' }}>
                                                <Avatar src={follow.avatar ? `${baseUrl}${follow.avatar}` : `${baseUrl}/upload/avatar/default.png`} sx={{ width: 36, height: 36 }} />
                                                <Typography variant="body2" noWrap>{follow.username}</Typography>
                                            </Box>
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleUnfollow(follow.id)} disabled={unfollowLoading === follow.id} sx={{ minWidth: 60, borderRadius: 20, textTransform: 'none' }}>
                                                {unfollowLoading === follow.id ? <CircularProgress size={20} /> : '取消关注'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>最近点赞视频</Typography>
                        {likedVideosLoading ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : likedVideos.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#999' }}>暂无点赞视频</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {likedVideos.map((video) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                                        <Card component={Link} to={`/video/${video.id}`} sx={{ textDecoration: 'none' }}>
                                            <Box sx={{ position: 'relative' }}>
                                                <CardMedia component="img" height="140" image={video.cover ? `${baseUrl}${video.cover}` : 'https://via.placeholder.com/300x140?text=无封面'} alt={video.title} />
                                                <Typography sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 12, px: 0.5, borderRadius: 1 }}>{video.time}</Typography>
                                            </Box>
                                            <CardContent sx={{ p: 1 }}>
                                                <Typography variant="subtitle2" noWrap>{video.title}</Typography>
                                                <Typography variant="caption" sx={{ color: '#999' }}>{video.author} · {video.playCount}播放</Typography>
                                                <Typography variant="caption" sx={{ color: '#FB7299', display: 'block', mt: 0.5 }}>点赞于 {new Date(video.likeTime).toLocaleDateString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>最近点赞文章</Typography>
                        {likedArticlesLoading ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : likedArticles.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#999' }}>暂无点赞文章</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {likedArticles.map((article) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                                        <Card component={Link} to={`/article/${article.id}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardMedia component="img" height="140" image={article.cover ? `${baseUrl}${article.cover}` : 'https://via.placeholder.com/300x140?text=无封面'} alt={article.title} />
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>{article.title}</Typography>
                                                <Typography variant="body2" color="textSecondary">{article.author}</Typography>
                                                <Typography variant="caption" color="textSecondary">点赞于 {new Date(article.likeTime).toLocaleDateString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );
            case 5:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>我的视频</Typography>
                        {myVideosLoading ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : myVideos.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#999' }}>暂无上传视频</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {myVideos.map((video) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                                        <Card component={Link} to={`/video/${video.id}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardMedia component="img" height="140" image={video.cover ? `${baseUrl}${video.cover}` : 'https://via.placeholder.com/300x140?text=无封面'} alt={video.title} />
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>{video.title}</Typography>
                                                <Typography variant="body2" color="textSecondary">播放 {video.playCount}</Typography>
                                                <Typography variant="caption" color="textSecondary">发布于 {new Date(video.publishTime).toLocaleDateString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );
            case 6:
                return (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>我的文章</Typography>
                        {myArticlesLoading ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <CircularProgress size={30} />
                            </Box>
                        ) : myArticles.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#999' }}>暂无发布文章</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {myArticles.map((article) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                                        <Card component={Link} to={`/article/${article.id}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardMedia component="img" height="140" image={article.cover ? `${baseUrl}${article.cover}` : 'https://via.placeholder.com/300x140?text=无封面'} alt={article.title} />
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>{article.title}</Typography>
                                                <Typography variant="body2" color="textSecondary">阅读 {article.viewCount}</Typography>
                                                <Typography variant="caption" color="textSecondary">发布于 {new Date(article.publishTime).toLocaleDateString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ width: 240, flexShrink: 0 }}>
                    <Tabs orientation="vertical" variant="scrollable" value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ borderRight: 1, borderColor: 'divider' }}>
                        <Tab label="基本信息" />
                        <Tab label="安全设置" />
                        <Tab label="我的关注" />
                        <Tab label="最近点赞视频" />
                        <Tab label="最近点赞文章" />
                        <Tab label="我的视频" />
                        <Tab label="我的文章" />
                    </Tabs>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
                        <Avatar src={avatarUrl} sx={{ width: 100, height: 100, bgcolor: '#FB7299' }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                        <Box>
                            <Typography variant="h5">{user.username}</Typography>
                            <Typography variant="body2" color="textSecondary">注册邮箱：{user.email}</Typography>
                            <Button variant="outlined" size="small" sx={{ mt: 1, borderColor: '#FB7299', color: '#FB7299' }} onClick={handleAvatarClick} disabled={uploadingAvatar}>
                                {uploadingAvatar ? <CircularProgress size={20} /> : '更换头像'}
                            </Button>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                        </Box>
                    </Box>

                    {/* 个人简介 */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#666', mb: 1 }}>个人简介</Typography>
                        {editBio ? (
                            <Box>
                                <TextField fullWidth multiline rows={3} value={tempBio} onChange={(e) => setTempBio(e.target.value)} placeholder="介绍一下自己..." sx={{ mb: 1 }} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" variant="contained" onClick={handleUpdateBio}>保存</Button>
                                    <Button size="small" variant="outlined" onClick={() => { setEditBio(false); setTempBio(bio); }}>取消</Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#666',
                                        whiteSpace: 'pre-wrap',   // 保留空白并自动换行
                                        wordBreak: 'break-word',  // 长单词/URL 换行
                                    }}
                                >
                                    {bio || '这个人很懒，什么都没写~'}
                                </Typography>
                                <Button size="small" sx={{ mt: 1, textTransform: 'none' }} onClick={() => { setTempBio(bio); setEditBio(true); }}>编辑简介</Button>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />
                    {renderContent()}
                </Box>
            </Box>

            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
                <DialogTitle>修改密码</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="当前密码" type="password" fullWidth name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} />
                    <TextField margin="dense" label="新密码" type="password" fullWidth name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} helperText="长度3-14位" />
                    <TextField margin="dense" label="确认新密码" type="password" fullWidth name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>取消</Button>
                    <Button onClick={handleUpdatePassword} disabled={loading}>{loading ? <CircularProgress size={24} /> : '确认修改'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.type} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ProfilePage;