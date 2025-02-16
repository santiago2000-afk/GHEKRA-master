import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";

export default function Navbar() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(true);
  const [showLoginMenu, setShowLoginMenu] = useState(false);

  const handleClickLogin = () => {
    setShowLoginMenu(true);
  };

  const handleClickLogout = () => {
    setIsAuth(false);
  };

  const handleCloseLoginMenu = () => {
    setShowLoginMenu(false);
  };

  return (
    <nav className="bg-azul-obscuro p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer focus:outline-none"
        >
          <div className="flex justify-center gap-2 items-center">
            <img src={Logo} alt="Bosch" className="w-8 h-8 object-contain" />
            <h2 className=" font-sans text-red-600 font-extrabold text-4xl">
              BOSCH
            </h2>
          </div>
        </button>

        {/* Navigation Links */}
        <div className="flex space-x-6">
          <button
            onClick={() => navigate("/boardpage")}
            className="text-white hover:text-gray-300"
          >
            Tarjetas
          </button>
          <button
            onClick={() => navigate("/useboardpage")}
            className="text-white hover:text-gray-300"
          >
            Usar Tarjeta
          </button>
          <button
            onClick={() => navigate("/registerviewpage")}
            className="text-white hover:text-gray-300"
          >
            Ver Registro
          </button>
          <button
            onClick={() => navigate("/controlpanelpage")}
            className="text-white hover:text-gray-300"
          >
            Panel de Control
          </button>
        </div>

        {/* User Menu */}
        <div>
          {isAuth ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">Usuario</span>
              <button
                className="text-white bg-red-500 hover:bg-red-700 px-3 py-2 rounded"
                onClick={handleClickLogout}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button
              className="text-white bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded"
              onClick={handleClickLogin}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginMenu && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Iniciar sesión</h2>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  id="username"
                  className="mt-1 block w-full px-3 py-2 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full px-3 py-2 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCloseLoginMenu}
                  type="button"
                  className="px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
