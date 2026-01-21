import { BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./components/Feed";
import Register from "./pages/Register";
import Workspace from "./components/Workspace";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route
          path='/feed'
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path='/workspace/:id'
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
