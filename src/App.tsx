import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import store from './store';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import TokenDashboard from './pages/TokenDashboard';
import NotFound from './pages/NotFound';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: any) => state.user);
  
  if (!user.isRegistered) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Routes component that uses Redux
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/new"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/token"
        element={
          <ProtectedRoute>
            <TokenDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Provider store={store}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
    </Provider>
  );
};

export default App;
