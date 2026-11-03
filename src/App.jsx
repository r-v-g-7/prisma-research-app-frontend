import { BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Register from "./pages/Register";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import { Workspaces } from "./pages/Workspaces";
import { CreateWorkspace } from "./pages/CreateWorkspace";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import SavedResearch from "./pages/SavedResearch";
import SearchResults from "./pages/SearchResults";
import Discovery from "./pages/Discovery";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
          >
            <Route path='/feed' element={<Feed />} />
            <Route path='/post/:postId' element={<PostDetail />} />
            <Route path='/create-post' element={<CreatePost />} />
            <Route path='/workspaces' element={<Workspaces />} />
            <Route path='/workspace/create' element={<CreateWorkspace />} />
            <Route path='/workspace/:id' element={<WorkspaceDetail />} />
            <Route path='/saved' element={<SavedResearch />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/profile/:userId' element={<PublicProfile />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider >
  );
}

export default App;
