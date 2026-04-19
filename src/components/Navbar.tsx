import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, InputBase, Button, Box, Badge,
    Avatar, Menu, MenuItem, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import UploadIcon from '@mui/icons-material/Upload';
import ArticleIcon from '@mui/icons-material/Article';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [postAnchorEl, setPostAnchorEl] = useState<null | HTMLElement>(null);
    const openUserMenu = Boolean(anchorEl);
    const openPostMenu = Boolean(postAnchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handlePostMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setPostAnchorEl(event.currentTarget);
    };

    const handlePostMenuClose = () => {
        setPostAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    };

    const handleUploadVideo = () => {
        if (!user) {
            alert('请先登录后再上传视频！');
            navigate('/login');
            return;
        }
        navigate('/upload');
        handlePostMenuClose();
    };

    const handleWriteArticle = () => {
        if (!user) {
            alert('请先登录后再写文章！');
            navigate('/login');
            return;
        }
        navigate('/article-upload');
        handlePostMenuClose();
    };

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: 64
            }}
        >
            <Toolbar sx={{ padding: '0 24px' }}>
                {/* 左侧 Logo + 首页 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                    <Typography
                        variant="h5"
                        sx={{ color: '#FB7299', fontWeight: 700, mr: 3, cursor: 'pointer' }}
                        component={Link}
                        to="/"
                    >
                        blike
                    </Typography>
                    <Button
                        color="inherit"
                        sx={{ color: '#333', fontWeight: 500 }}
                        startIcon={<HomeIcon />}
                        component={Link}
                        to="/"
                    >
                        首页
                    </Button>
                    <Button
                        color="inherit"
                        sx={{ color: '#333' }}
                        startIcon={<ExploreIcon />}
                    >
                        发现
                    </Button>
                    {/* 新增：文章按钮 */}
                    <Button
                        color="inherit"
                        sx={{ color: '#333' }}
                        startIcon={<ArticleIcon />}
                        component={Link}
                        to="/articles"
                    >
                        文章
                    </Button>
                </Box>

                {/* 中间：搜索框 */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        maxWidth: 600,
                        position: 'relative'
                    }}
                >
                    <InputBase
                        placeholder="搜索视频、UP主..."
                        sx={{
                            backgroundColor: '#f4f4f4',
                            borderRadius: 20,
                            padding: '2px 16px',
                            width: '100%',
                            height: 36,
                            '&::placeholder': {
                                color: '#999'
                            }
                        }}
                    />
                    <SearchIcon
                        sx={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#999'
                        }}
                    />
                </Box>

                {/* 右侧：功能按钮 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge badgeContent={3} color="error" sx={{ color: '#333' }}>
                        <NotificationsIcon />
                    </Badge>

                    {/* 投稿下拉菜单 */}
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#FB7299',
                            '&:hover': { backgroundColor: '#f857a6' },
                            borderRadius: 20,
                            textTransform: 'none',
                            padding: '0 16px',
                        }}
                        onClick={handlePostMenuOpen}
                    >
                        投稿
                    </Button>
                    <Menu
                        anchorEl={postAnchorEl}
                        open={openPostMenu}
                        onClose={handlePostMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={handleUploadVideo}>
                            <UploadIcon fontSize="small" sx={{ mr: 1 }} /> 上传视频
                        </MenuItem>
                        <MenuItem onClick={handleWriteArticle}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> 写文章
                        </MenuItem>
                    </Menu>

                    {user ? (
                        <>
                            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                                <Avatar sx={{ bgcolor: '#FB7299', width: 32, height: 32 }}>
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={openUserMenu}
                                onClose={handleMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                                    个人中心
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    退出登录
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: '#FB7299',
                                color: '#FB7299',
                                ml: 2,
                                borderRadius: 20,
                                textTransform: 'none'
                            }}
                            onClick={() => navigate('/login')}
                        >
                            登录
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;