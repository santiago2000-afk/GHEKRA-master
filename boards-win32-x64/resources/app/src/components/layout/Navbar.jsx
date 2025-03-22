import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.svg";

export default function Navbar() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(""); // Para almacenar el nombre del usuario
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility

  // Verifica si el usuario ya está autenticado al cargar la página
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (user && token) {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role_id);
      setUserName(parsedUser.name);  // Establece el nombre del usuario
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, []);

  const handleClickLogin = () => {
    setShowLoginMenu(false); // Cerrar el modal de login
    navigate("/login"); // Redirigir a la página de login
  };
  

  const handleClickLogout = async () => {
    try {
      // Llamada al endpoint de logout
      const response = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Si la respuesta es exitosa, eliminamos el usuario y token del localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Actualizamos el estado de la sesión
        setIsAuth(false);
        setUserRole(null);
        setUserName("");  // Limpiamos el nombre del usuario
        navigate("/login");  // Redirigir al login o a una página deseada
      } else {
        // Si hubo un error en la solicitud, lo manejamos aquí
        console.error("Error al cerrar sesión:", response.status);
      }
    } catch (error) {
      // Manejo de errores si la solicitud falla
      console.error("Error al hacer la solicitud de logout:", error);
    }
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
          {isAuth && userRole === 2 && (
            <>
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

              {/* Dropdown for Registrar */}
              <div className="relative">
                <button
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  type="button"
                  id="registrarDropdown"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  Registrar
                  <svg
                    className="w-5 h-5 ml-2 -mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showDropdown && (
                  <div
                    className="absolute right-0 z-10 mt-2 origin-top-right bg-white rounded-md shadow-lg w-56 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="registrarDropdown"
                  >
                    <div className="py-1" role="none">
                      <button
                        className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100"
                        onClick={() => navigate("/tarjetas")}
                        role="menuitem"
                      >
                        Crear tarjetas
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100"
                        onClick={() => navigate("/familias")}
                        role="menuitem"
                      >
                        Crear Familias
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100"
                        onClick={() => navigate("/lineas")}
                        role="menuitem"
                      >
                        Crear Lineas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {isAuth && userRole === 3 && (
            <button
              onClick={() => navigate("/useboardpage")}
              className="text-white hover:text-gray-300"
            >
              Usar Tarjeta
            </button>
          )}

          {isAuth && userRole === 4 && (
            <button
              onClick={() => navigate("/registerviewpage")}
              className="text-white hover:text-gray-300"
            >
              Ver Registro
            </button>
          )}
        </div>
        <div>
          {isAuth ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">{userName}</span> {/* Mostramos el nombre del usuario */}
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