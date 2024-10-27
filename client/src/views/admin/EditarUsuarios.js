import React, { useState, useEffect } from "react";
import "../../styles/EditarUsuarios.css";

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editingUser, setEditingUser] = useState({});

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/admin/usuarios", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUsuarios(data);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
        }
    };

    const handleSearchChange = (e) => {
        setBusqueda(e.target.value);
    };

    const highlightText = (text) => {
        if (!busqueda) return text;
        const regex = new RegExp(`(${busqueda})`, "gi");
        return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    };

    const filteredUsuarios = usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.correo_institucional.toLowerCase().includes(busqueda.toLowerCase()) ||
        (usuario.cedula || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (usuario.codigo_estudiante || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.nombre_rol.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleEdit = (index) => {
        setEditIndex(index);
        setEditingUser({ ...filteredUsuarios[index] });
    };

    const handleInputChange = (e) => {
        setEditingUser({
            ...editingUser,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/usuarios/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(editingUser)
            });

            if (response.ok) {
                setEditIndex(null);
                fetchUsuarios();
            } else {
                const data = await response.json();
                console.error("Error al actualizar el usuario:", data.error);
            }
        } catch (error) {
            console.error("Error al actualizar el usuario:", error);
        }
    };

    return (
        <div className="admin-usuarios-container">
            <div className="box-container">
                <h1 className="titulo-gestion-usuarios">Gestión de Usuarios</h1>
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={busqueda}
                    onChange={handleSearchChange}
                    className="buscador-usuarios"
                />
                <table className="tabla-usuarios">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Usuario (Cédula/Código)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsuarios.map((usuario, index) => (
                            <tr key={usuario.id}>
                                {editIndex === index ? (
                                    <>
                                        <td><input type="text" name="nombre" value={editingUser.nombre} onChange={handleInputChange} /></td>
                                        <td><input type="text" name="correo_institucional" value={editingUser.correo_institucional} onChange={handleInputChange} /></td>
                                        <td>
                                            <select name="rol_id" value={editingUser.rol_id} onChange={handleInputChange}>
                                                <option value="1">Administrador</option>
                                                <option value="2">Docente</option>
                                                <option value="3">Alumno</option>
                                            </select>
                                        </td>
                                        <td><input type="text" name="cedula" value={editingUser.cedula || editingUser.codigo_estudiante} onChange={handleInputChange} /></td>
                                        <td><button onClick={handleSave}>Finalizar</button></td>
                                    </>
                                ) : (
                                    <>
                                        <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.nombre) }}></td>
                                        <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.correo_institucional) }}></td>
                                        <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.nombre_rol) }}></td>
                                        <td dangerouslySetInnerHTML={{ __html: highlightText(usuario.cedula || usuario.codigo_estudiante) }}></td>
                                        <td><button onClick={() => handleEdit(index)}>Editar</button></td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsuarios;
