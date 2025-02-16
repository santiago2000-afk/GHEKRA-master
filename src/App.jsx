// Paginas
import MenuPage from "./pages/menuPage/MenuPage.jsx";
import BoardsPage from "./pages/boardsPage/BoardsPage.jsx";
import ControlPanelPage from "./pages/controlPanelPage/ControlPanelPage.jsx";
import RegisterViewPage from "./pages/registerViewPage/RegisterViewPage.jsx";
import UseBoardPage from "./pages/useBoardPage/UseBoardPage.jsx";
// Componentes
import Navbar from "./components/layout/Navbar.jsx";
//utilidades
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Store/Context.jsx";

function App() {
  return (
    <>
      <ThemeProvider>
        <HashRouter>
          <div className=" bg-gray-200">
            <Navbar />
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/boardpage" element={<BoardsPage />}></Route>
              <Route
                path="/controlpanelpage"
                element={<ControlPanelPage />}
              ></Route>
              <Route
                path="/registerviewpage"
                element={<RegisterViewPage />}
              ></Route>
              <Route path="/useboardpage" element={<UseBoardPage />}></Route>
            </Routes>
          </div>
        </HashRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
