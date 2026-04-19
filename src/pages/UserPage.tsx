import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Container,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Avatar,
    CircularProgress,
    Tabs,
    Tab,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import request from '../utils/request';

// 视频类型
interface Video {
    id: number;
    title: string;
    cover: string;
    author: string;
    avatar: string;
    playCount: string;
    time: string;
    publishTime: string;
}

// 文章类型
interface Article {
    id: number;
    title: string;
    cover: string;
    author: string;
    publishTime: string;
    viewCount: number;
}

// 用户信息（包含简介）
interface UserInfo {
    id: number;
    username: string;
    avatar: string;
    bio?: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const UserPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                // 由于 request 拦截器已解包响应，直接断言为包含 status/message 的对象
                const [infoRes, videosRes, articlesRes] = await Promise.all([
                    request.get(`/user/info/${id}`),
                    request.get(`/video/user/${id}`),
                    request.get(`/article/user/${id}`),
                ]) as unknown as [{ status: number; message: UserInfo }, { status: number; message: Video[] }, { status: number; message: Article[] }];

                if (infoRes.status === 200 && infoRes.message) {
                    setUserInfo(infoRes.message);
                }
                if (videosRes.status === 200 && videosRes.message) {
                    setVideos(videosRes.message);
                }
                if (articlesRes.status === 200 && articlesRes.message) {
                    setArticles(articlesRes.message);
                }
            } catch (error) {
                console.error('加载用户数据失败', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            void fetchUserData();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!userInfo) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6">用户不存在</Typography>
            </Container>
        );
    }

    const avatarUrl = userInfo.avatar ? `${baseUrl}${userInfo.avatar}` : `${baseUrl}/upload/avatar/default.png`;

    return (
        <Container sx={{ py: 4, maxWidth: 1400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Avatar src={avatarUrl} sx={{ width: 80, height: 80 }} />
                <Box>
                    <Typography variant="h4">{userInfo.username}</Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mt: 0.5,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {userInfo.bio || '这个人很懒，什么都没写~'}
                    </Typography>
                </Box>
            </Box>

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label={`视频 ${videos.length}`} />
                <Tab label={`文章 ${articles.length}`} />
            </Tabs>

            {tabValue === 0 && (
                <>
                    {videos.length === 0 ? (
                        <Typography variant="body1" sx={{ textAlign: 'center', color: '#999', mt: 4 }}>
                            暂无视频
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {videos.map((video) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={video.id}>
                                    <Card component={Link} to={`/video/${video.id}`} sx={{ textDecoration: 'none' }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={video.cover ? `${baseUrl}${video.cover}` : 'https://via.placeholder.com/300x180?text=无封面'}
                                                alt={video.title}
                                            />
                                            <Typography
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 4,
                                                    right: 4,
                                                    bgcolor: 'rgba(0,0,0,0.7)',
                                                    color: '#fff',
                                                    fontSize: 12,
                                                    px: 0.5,
                                                    borderRadius: 1,
                                                }}
                                            >
                                                {video.time}
                                            </Typography>
                                        </Box>
                                        <CardContent sx={{ padding: '12px 8px' }}>
                                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
                                                {video.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                                                {video.playCount} 播放
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {tabValue === 1 && (
                <>
                    {articles.length === 0 ? (
                        <Typography variant="body1" sx={{ textAlign: 'center', color: '#999', mt: 4 }}>
                            暂无文章
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {articles.map((article) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={article.id}>
                                    <Card
                                        component={Link}
                                        to={`/article/${article.id}`}
                                        sx={{
                                            textDecoration: 'none',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={article.cover ? `${baseUrl}${article.cover}` : `${baseUrl}/upload/cover/default.jpg`}
                                            alt={article.title}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {article.title}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {article.author}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {article.publishTime} · 阅读 {article.viewCount}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
        </Container>
    );
};

export default UserPage;