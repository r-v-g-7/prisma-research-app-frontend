import { BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Register from "./pages/Register"
import Workspace from "./components/Workspace";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import PostDetail from "./pages/postDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
          >
            <Route
              path='/feed'
              element={
                <Feed />
              }
            />
            <Route
              path='/workspace/:id'
              element={
                <Workspace />
              }
            />
            <Route
              path='/post/:postId'
              element={
                <PostDetail />
              }
            />
            <Route
              path='/post/:postId'
              element={
                <PostDetail />
              }
            />
          </Route>





        </Routes>
      </BrowserRouter>
    </AuthProvider >
  );
}

export default App;
