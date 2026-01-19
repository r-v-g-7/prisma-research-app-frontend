import { Button } from "@/components/ui/button";
import { BrowserRouter } from "react-router-dom";
import Login from "./components/login";
import Feed from "./components/Feed";
import Register from "./components/Register";
import Workspace from "./components/Workspace";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/Login' element={<Login />}></Route>
        <Route path='/Feed' element={<Feed />}></Route>
        <Route path='/Register' element={<Register />}></Route>
        <Route path='/Workspace' element={<Workspace />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
