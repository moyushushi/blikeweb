# Blike 前端

仿B站视频与文章分享平台的前端应用，基于 React 18 + Vite + Material-UI 构建，支持用户认证、视频/文章发布、评论、点赞、关注等功能。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Material-UI (MUI) v9
- **路由**: React Router v6
- **HTTP 请求**: Axios
- **富文本编辑器**: TipTap（文章发布）
- **状态管理**: React Context (UserContext)
- **视频播放**: HTML5 Video

## 主要功能

- 用户注册、登录（JWT Token 认证）
- 视频上传（支持 FFmpeg 自动修复 moov 原子，封面可手动上传或自动截取）
- 文章发布（富文本编辑器，支持 Markdown 风格）
- 视频/文章列表展示（瀑布流布局）
- 视频/文章详情页（播放器、内容展示、评论区）
- 点赞、关注、取消关注
- 个人中心（修改密码、更换头像、编辑个人简介）
- 访客主页（查看用户发布的视频和文章）
- 响应式设计（适配移动端、平板、桌面）

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install