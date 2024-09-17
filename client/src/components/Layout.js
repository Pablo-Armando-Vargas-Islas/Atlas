import React from "react";
import Sidebar from "./Sidebar";  // Importa el sidebar
import { Outlet } from "react-router-dom";  // Outlet para las rutas

const Layout = () => {
    return (
        <div className="wrapper">
            <Sidebar />
            <div className="main-content">
                {/* Aquí es donde se cargará el contenido de las vistas */}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
