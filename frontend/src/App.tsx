import Arena from "./components/Game";
import { Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Home from "./components/Home";
function App() {
  return (
    <>
      <Routes>
        <Route path="/game" element={<Arena />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
