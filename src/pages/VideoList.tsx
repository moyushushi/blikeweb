import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Container, Card, CardMedia, CardContent, Typography, Box, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import request from '../utils/request';

// 后端统一响应格式（转换后）
interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;        // 这里 T 就是视频数组类型
    data?: T;          // 可选，兼容其他情况
}

// 视频类型定义
interface Video {
    id: number;
    title: string;
    cover: string;
    author: string;
    avatar: string;
    playCount: string;
    time: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const VideoList: React.FC = () => {
    const [videoList, setVideoList] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const getVideoList = async () => {
            try {
                // 使用完整路径 /api/video/list
                const res = (await request.get('/video/list')) as ApiResponse<Video[]>;
                if (res.status === 200) {
                    setVideoList(res.message || []);
                } else {
                    console.error('获取视频列表失败:', res.message);
                }
            } catch (error) {
                console.error('获取视频列表失败：', error);
                setVideoList([]);
            } finally {
                setLoading(false);
            }
        };
        getVideoList();
    }, []);

    if (loading) {
        return (
            <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Typography variant="h6">加载中...</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4, maxWidth: 1400 }}>
            {videoList.length === 0 ? (
                <Box sx={{ textAlign: 'center', padding: '50px 0' }}>
                    <Typography variant="h6" sx={{ color: '#999' }}>暂无视频数据</Typography>
                    <Typography variant="body2" sx={{ color: '#ccc', mt: 2 }}>请检查后端接口或添加测试视频</Typography>
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {videoList.map((video) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={video.id}>
                            <Card
                                sx={{
                                    borderRadius: 1,
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                                    cursor: 'pointer'
                                }}
                                component={Link}
                                to={`/video/${video.id}`}
                            >
                                {/* 核心修改区域：封面容器 */}
                                <Box sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={video.cover ? `${baseUrl}${video.cover}` : 'https://via.placeholder.com/300x180?text=暂无封面'}
                                        alt={video.title}
                                        sx={{ borderRadius: 1, objectFit: 'cover' }}
                                    />

                                    {/* 播放量 - 左下角 */}
                                    <Typography
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,       // 和时长同高度
                                            left: 4,         // 最左侧
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: '#fff',
                                            fontSize: 12,
                                            padding: '0 4px',
                                            borderRadius: 1,
                                            zIndex: 10,      // 确保在封面上方
                                            whiteSpace: 'nowrap' // 防止播放量文字换行
                                        }}
                                    >
                                        {video.playCount || 0} 播放
                                    </Typography>

                                    {/* 视频时长 - 右下角（保持原有位置） */}
                                    <Typography
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,       // 和播放量同高度
                                            right: 4,        // 最右侧
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: '#fff',
                                            fontSize: 12,
                                            padding: '0 4px',
                                            borderRadius: 1,
                                            zIndex: 10       // 确保在封面上方
                                        }}
                                    >
                                        {video.time || '00:00'}
                                    </Typography>
                                </Box>

                                <CardContent sx={{ padding: '12px 8px', display: 'flex', gap: 2 }}>
                                    <Avatar
                                        src={video.avatar ? `${baseUrl}${video.avatar}` : 'https://via.placeholder.com/36x36?text=头像'}
                                        alt={video.author}
                                        sx={{ width: 36, height: 36 }}
                                    />
                                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                        <Typography variant="subtitle2" noWrap sx={{ color: '#333', fontWeight: 500, lineHeight: 1.4 }}>
                                            {video.title || '无标题'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#999', mt: 1, display: 'block' }}>
                                            {video.author || '未知作者'}
                                        </Typography>

                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default VideoList;