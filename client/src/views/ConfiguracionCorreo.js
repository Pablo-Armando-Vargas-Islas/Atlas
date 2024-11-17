import React, { useState, useEffect } from 'react';
import '../styles/ConfiguracionCorreo.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { Spinner } from 'react-bootstrap';

const API_URL = 'http://localhost:5000';

const ConfiguracionCorreo = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmailConfig = async () => {
            try {
                const response = await fetch(`${API_URL}/api/admin/correo`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setEmail(data.email);
                    setPassword(data.password);
                } else {
                    console.error(data.error);
                }
            } catch (error) {
                console.error("Error al obtener la configuración de correo:", error);
            }
        };

        fetchEmailConfig(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 

        try {
            const response = await fetch(`${API_URL}/api/admin/correo/actualizar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Cuenta de correo actualizada correctamente');
            } else {
                console.error(data.error);
                alert('No se pudo cambiar la cuenta, por favor verifique que sus credenciales sean correctas y que su cuenta de Microsoft Outlook tenga una configuración de seguridad simple.');
            }
        } catch (error) {
            console.error("Error al actualizar la configuración de correo:", error);
            alert("Error al actualizar la configuración de correo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="configuracion-correo-container">
            <div className="configuracion-correo-box">
                <h2>Correo del sistema Atlas</h2>
                <form onSubmit={handleSubmit}>
                    <div className="configuracion-correo-form-group">
                        <label>Correo de Microsoft Outlook*</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="configuracion-correo-form-control"
                        />
                    </div>
                    <div className="configuracion-correo-form-group">
                        <label>Contraseña</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="configuracion-correo-form-control password-input"
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password-icon"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`configuracion-correo-btn-primary ${loading ? "loading-button" : ""}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                Validando cuenta{' '} 
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                            </>
                        ) : (
                            'Guardar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConfiguracionCorreo;
