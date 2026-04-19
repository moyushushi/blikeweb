import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Avatar,
    Button,
    CircularProgress,
    TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MessageIcon from '@mui/icons-material/Message';
import request from '../utils/request';
import { useUser } from '../contexts/UserContext';

interface ApiResponse<T = null> {
    status: number;
    success: boolean;
    message: T;
}

interface VideoDetail {
    id: number;
    userId: number;
    title: string;
    url: string;
    cover: string;
    author: string;
    avatar: string;
    playCount: string;
    time: string;
    desc: string;
    publishTime: string;
    likeCount: string;
    commentCount: string;
}

interface CommentItem {
    id: number;
    videoId: number;
    userId: number;
    content: string;
    createTime: string;
    username: string;
    avatar: string;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const VideoPlayer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const [video, setVideo] = useState<VideoDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // 关注相关状态
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    // 点赞相关状态
    const [hasLiked, setHasLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    // 播放量增加防重复标记
    const hasPlayIncremented = useRef(false);

    // 获取视频详情
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = (await request.get(`/video/${id}`)) as ApiResponse<VideoDetail>;
                if (res.status === 200 && res.message) {
                    setVideo(res.message);
                } else {
                    console.error('获取视频详情失败:', res.message);
                    setVideo(null);
                }
            } catch (error) {
                console.error('获取视频详情失败:', error);
                setVideo(null);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id]);

    // 增加播放量（仅执行一次）
    useEffect(() => {
        if (hasPlayIncremented.current) return;
        hasPlayIncremented.current = true;
        const incrementPlayCount = async () => {
            try {
                await request.post(`/video/${id}/play`);
            } catch (error) {
                console.error('增加播放量失败', error);
            }
        };
        incrementPlayCount();
    }, [id]);

    // 检查关注状态
    const checkFollowStatus = async (authorId: number) => {
        if (!user || user.id === authorId) return;
        try {
            const res = (await request.get(`/user/is-following?userId=${authorId}`)) as ApiResponse<boolean>;
            if (res.status === 200 && typeof res.message === 'boolean') {
                setIsFollowing(res.message);
            }
        } catch (error) {
            console.error('检查关注状态失败', error);
        }
    };

    // 检查点赞状态
    const checkLikeStatus = async (videoId: number) => {
        if (!user) return;
        try {
            const res = (await request.get(`/user/is-liked?videoId=${videoId}`)) as ApiResponse<boolean>;
            if (res.status === 200 && typeof res.message === 'boolean') {
                setHasLiked(res.message);
            }
        } catch (error) {
            console.error('检查点赞状态失败', error);
        }
    };

    useEffect(() => {
        if (video && user) {
            checkFollowStatus(video.userId);
            checkLikeStatus(video.id);
        }
    }, [video, user]);

    // 获取评论列表
    const fetchComments = async () => {
        try {
            const res = (await request.get(`/comment/video/${id}`)) as ApiResponse<CommentItem[]>;
            if (res.status === 200 && res.message) {
                setComments(res.message);
            } else {
                console.error('获取评论列表失败:', res.message);
                setComments([]);
            }
        } catch (error) {
            console.error('获取评论列表失败:', error);
            setComments([]);
        }
    };

    useEffect(() => {
        if (id) {
            fetchComments();
        }
    }, [id]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = 0.2;
        }
    }, [video]);

    // 发送评论
    const handleSendComment = async () => {
        if (!user) {
            alert('请先登录');
            return;
        }
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            const res = (await request.post('/comment/video', {
                videoId: video?.id,
                content: commentText.trim(),
            })) as ApiResponse;

            if (res.status === 200) {
                setCommentText('');
                await fetchComments();
                if (video) {
                    setVideo({
                        ...video,
                        commentCount: String(Number(video.commentCount) + 1),
                    });
                }
            } else {
                alert(typeof res.message === 'string' ? res.message : '评论失败');
            }
        } catch (err) {
            console.error(err);
            alert('评论发送失败');
        } finally {
            setSubmitting(false);
        }
    };

    // 关注/取消关注
    const handleFollowToggle = async () => {
        if (!user) {
            alert('请先登录');
            return;
        }
        if (!video) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await request.delete(`/user/follow/${video.userId}`);
                setIsFollowing(false);
            } else {
                await request.post(`/user/follow/${video.userId}`);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('操作关注失败', error);
            alert(isFollowing ? '取消关注失败' : '关注失败');
        } finally {
            setFollowLoading(false);
        }
    };

    // 点赞/取消点赞
    const handleLikeToggle = async () => {
        if (!user) {
            alert('请先登录');
            return;
        }
        if (!video) return;
        setLikeLoading(true);
        try {
            if (hasLiked) {
                await request.delete(`/user/like/${video.id}`);
                setHasLiked(false);
                setVideo({
                    ...video,
                    likeCount: String(Number(video.likeCount) - 1),
                });
            } else {
                await request.post(`/user/like/${video.id}`);
                setHasLiked(true);
                setVideo({
                    ...video,
                    likeCount: String(Number(video.likeCount) + 1),
                });
            }
        } catch (error) {
            console.error('点赞操作失败', error);
            alert(hasLiked ? '取消点赞失败' : '点赞失败');
        } finally {
            setLikeLoading(false);
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }
    if (!video) {
        return <Container sx={{ py: 4 }}>视频不存在</Container>;
    }

    const isOwnVideo = user && user.id === video.userId;

    return (
        <Container sx={{ py: 4, maxWidth: 1400 }}>
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box
                        sx={{
                            width: '100%',
                            backgroundColor: '#000',
                            borderRadius: 1,
                            aspectRatio: '16/9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <video
                            ref={videoRef}
                            key={video.id}
                            src={`${baseUrl}${video.url}`}
                            controls
                            preload="metadata"
                            style={{ width: '100%', height: '100%' }}
                            poster={`${baseUrl}${video.cover}`}
                        >
                            您的浏览器不支持 HTML5 视频播放。
                        </video>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 600, color: '#333' }}>
                        {video.title}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 2,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                src={`${baseUrl}${video.avatar}`}
                                alt={video.author}
                                sx={{ width: 48, height: 48, cursor: 'pointer' }}
                                onClick={() => video.userId && navigate(`/user/${video.userId}`)}
                            />
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 500, cursor: 'pointer' }}
                                    onClick={() => video.userId && navigate(`/user/${video.userId}`)}
                                >
                                    {video.author}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#999' }}>
                                    发布于 {video.publishTime}
                                </Typography>
                            </Box>
                            {!isOwnVideo && (
                                <Button
                                    variant={isFollowing ? "outlined" : "contained"}
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    sx={{
                                        ml: 2,
                                        backgroundColor: isFollowing ? 'transparent' : '#FB7299',
                                        borderColor: '#FB7299',
                                        color: isFollowing ? '#FB7299' : '#fff',
                                        '&:hover': {
                                            backgroundColor: isFollowing ? 'rgba(251,114,153,0.04)' : '#f857a6',
                                            borderColor: '#FB7299',
                                        },
                                        textTransform: 'none',
                                        borderRadius: 20,
                                        padding: '0 24px',
                                    }}
                                >
                                    {followLoading ? <CircularProgress size={20} /> : (isFollowing ? '已关注' : '关注')}
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant={hasLiked ? "contained" : "outlined"}
                                onClick={handleLikeToggle}
                                disabled={likeLoading}
                                sx={{
                                    borderColor: '#FB7299',
                                    color: hasLiked ? '#fff' : '#FB7299',
                                    backgroundColor: hasLiked ? '#FB7299' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: hasLiked ? '#f857a6' : 'rgba(251,114,153,0.04)',
                                        borderColor: '#FB7299',
                                    },
                                    borderRadius: 20,
                                    minWidth: 80,
                                    textTransform: 'none',
                                }}
                                startIcon={<ThumbUpIcon />}
                            >
                                {likeLoading ? <CircularProgress size={20} /> : video.likeCount}
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: '#999',
                                    color: '#999',
                                    '&:hover': { borderColor: '#666' },
                                    borderRadius: 20,
                                    minWidth: 80,
                                    textTransform: 'none',
                                }}
                                startIcon={<ThumbDownIcon />}
                            >
                                踩
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: '#999',
                                    color: '#999',
                                    '&:hover': { borderColor: '#666' },
                                    borderRadius: 20,
                                    minWidth: 80,
                                    textTransform: 'none',
                                }}
                                startIcon={<ShareIcon />}
                            >
                                分享
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: '#999',
                                    color: '#999',
                                    '&:hover': { borderColor: '#666' },
                                    borderRadius: 20,
                                    minWidth: 80,
                                    textTransform: 'none',
                                }}
                                startIcon={<MessageIcon />}
                            >
                                {video.commentCount}
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: '#999',
                                    color: '#999',
                                    '&:hover': { borderColor: '#666' },
                                    borderRadius: 20,
                                    minWidth: 40,
                                    padding: 0,
                                }}
                                startIcon={<MoreVertIcon />}
                            />
                        </Box>
                    </Box>

                    {/* 视频描述：修复换行问题 */}
                    <Box sx={{ mt: 2, padding: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#333',
                                whiteSpace: 'pre-wrap',      // 保留空白并自动换行
                                wordBreak: 'break-word',     // 长单词/URL换行
                            }}
                        >
                            {video.desc}
                        </Typography>
                    </Box>

                    {/* 评论区域 */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            评论 ({video.commentCount})
                        </Typography>
                        <Box sx={{ height: 1, bgcolor: '#eee', my: 2 }} />

                        {/* 评论输入框：修复打字不显示问题 */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <Avatar
                                src={user?.avatar ? `${baseUrl}${user.avatar}` : `${baseUrl}/upload/avatar/default.png`}
                                sx={{ width: 40, height: 40 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    placeholder={user ? '发一条友善的评论...' : '请登录后发表评论'}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={!user || submitting}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 20,
                                            backgroundColor: !user ? '#f5f5f5' : 'white',
                                        },
                                        '& .MuiInputBase-input': {
                                            color: '#333',   // 确保文字可见
                                        },
                                    }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleSendComment}
                                disabled={!user || !commentText.trim() || submitting}
                                sx={{
                                    backgroundColor: '#FB7299',
                                    '&:hover': { backgroundColor: '#f857a6' },
                                    textTransform: 'none',
                                    borderRadius: 20,
                                    alignSelf: 'flex-start',
                                }}
                            >
                                {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '发送'}
                            </Button>
                        </Box>

                        {/* 评论列表 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {comments.length === 0 ? (
                                <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                                    暂无评论，来做第一个评论的人吧~
                                </Typography>
                            ) : (
                                comments.map((comment) => (
                                    <Box key={comment.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <Avatar
                                            src={comment.avatar ? `${baseUrl}${comment.avatar}` : `${baseUrl}/upload/avatar/default.png`}
                                            sx={{ width: 36, height: 36, flexShrink: 0, cursor: 'pointer' }}
                                            onClick={() => navigate(`/user/${comment.userId}`)}
                                        />
                                        <Box sx={{ flex: 1, textAlign: 'left' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ fontWeight: 600, color: '#333', cursor: 'pointer' }}
                                                    onClick={() => navigate(`/user/${comment.userId}`)}
                                                >
                                                    {comment.username || `用户${comment.userId}`}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#999' }}>
                                                    {new Date(comment.createTime).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#333',
                                                    mt: 0.5,
                                                    lineHeight: 1.5,
                                                    textAlign: 'left',
                                                    display: 'block',
                                                    width: '100%',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {comment.content}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
                        推荐视频
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
                        暂无推荐视频
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
};

export default VideoPlayer;