import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/Navbar';
import VideoList from './pages/VideoList';
import VideoPlayer from './pages/VideoPlayer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgetPage from './pages/ForgetPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from "./pages/ProfilePage.tsx";
import UserPage from "./pages/UserPage.tsx";
import UploadArticlePage from "./pages/UploadArticlePage.tsx";
import ArticleList from "./pages/ArticleList.tsx";
import ArticleDetail from "./pages/ArticleDetail.tsx";
import './App.css';

const theme = createTheme({
    palette: {
        primary: { main: '#FB7299' },
        secondary: { main: '#00A1D6' },
        mode: 'light',
    },
    typography: {
        fontFamily: '"Microsoft YaHei", "Heiti SC", sans-serif',
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <UserProvider>   {/* 包裹整个应用 */}
                <BrowserRouter>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<VideoList />} />
                        <Route path="/video/:id" element={<VideoPlayer />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forget" element={<ForgetPage />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/user/:id" element={<UserPage />} />
                        <Route path="/article-upload" element={<UploadArticlePage />} />
                        <Route path="/articles" element={<ArticleList />} />
                        <Route path="/article/:id" element={<ArticleDetail />} />
                    </Routes>
                </BrowserRouter>
            </UserProvider>
        </ThemeProvider>
    );
}

export default App;