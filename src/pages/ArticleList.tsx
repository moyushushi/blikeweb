import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardMedia, Grid, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import request from '../utils/request';

// 定义响应类型（与拦截器转换后一致）
interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface Article {
    id: number;
    title: string;
    cover: string;
    author: string;
    publishTime: string;
}

// 后端基础 URL（用于拼接静态资源）
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ArticleList: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = (await request.get('/article/list')) as ApiResponse<Article[]>;
                if (res.status === 200) {
                    setArticles(res.message || []);
                } else {
                    console.error('获取文章列表失败:', res.message);
                }
            } catch (error) {
                console.error('请求错误:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>文章列表</Typography>
            {articles.length === 0 ? (
                <Typography variant="body1" color="textSecondary">暂无文章</Typography>
            ) : (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {articles.map((article) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                            <Card
                                component={Link}
                                to={`/article/${article.id}`}
                                sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                <CardMedia
                                    component="img"
                                    height="140"
                                    // 拼接 baseUrl 和 cover 相对路径
                                    image={article.cover ? `${baseUrl}${article.cover}` : `${baseUrl}/upload/cover/default.jpg`}
                                    alt={article.title}
                                />
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{article.title}</Typography>
                                    <Typography variant="body2" color="textSecondary">{article.author}</Typography>
                                    <Typography variant="caption" color="textSecondary">{article.publishTime}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default ArticleList;