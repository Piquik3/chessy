import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Game from "./pages/Game/Game";
import Theory from "./pages/Theory/Theory";


function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:opening" element={<Game />} />
        <Route path="/theory/:opening" element={<Theory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;