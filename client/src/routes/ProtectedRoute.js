import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ component: Component, role, ...rest }) => {
    const { token, rol } = useAuth();

    return (
        <Route
            {...rest}
            render={(props) =>
                token && rol === role ? <Component {...props} /> : <Navigate to="/login" />
            }
        />
    );
};

export default ProtectedRoute;
