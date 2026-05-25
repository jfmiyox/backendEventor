import supabase from '../../config/supabase.js';
import bcrypt from 'bcryptjs'; 
import { getRolById } from '../roles/rolesController.js';
export const getFotoPerfilUsuario = async (userId) => {
    try {
        if (!userId) {
            return null;
        }

        const { data, error } = await supabase
            .from('fotos_usuarios')
            .select(`
                fotos(
                    url,
                    public_id
                )
            `)
            .eq('usuario_id', userId)
            .single();

        if (error) {
            return null; 
        }

        return data?.fotos?.url || null;

    } catch (error) {
        console.error("Error:", error);
        return null;
    }
};




export const createPerfilFromAdmin = async (req, res) => {
    try {
        const { full_name, username, email, password, documento, id_rol } = req.body;

       
        if (!full_name || !username || !email || !password || !id_rol) {
            return res.status(400).json({ 
                success: false, 
                message: "Todos los campos obligatorios deben ser proporcionados." 
            });
        }

        const { data: existingUser, error: searchError } = await supabase
            .from('usuarios')
            .select('id')
            .or(`email.eq.${email}`)
            .maybeSingle();

        if (searchError) throw searchError;

        if (existingUser) {
            return res.status(409).json({ 
                success: false, 
                message: "El correo  ya está registrado." 
            });
        }

        
        const saltRounds = 11;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

       
        const { data: nuevoUsuario, error: insertError } = await supabase
            .from('usuarios')
            .insert([{
                full_name: full_name,
                nombre_usuario : username,
                email,
                password_hash: hashedPassword,
                documento: documento || null,
                id_rol,
                activo: true
            }])
            .select() 
            .single();

        if (insertError) throw insertError;

        return res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            usuario: {
                id: nuevoUsuario.id
            }
        });

    } catch (error) {
        console.error("Error en createPerfilFromAdmin:", error);
        
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear el usuario.",
            error: error.message || error.details || "Error desconocido"
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { data: Users, error } = await supabase
            .from(`usuarios`)
            .select(`*`);

        if (error) {
            throw error;
        }

        const usersMapeado = await Promise.all(
            Users.map(async (usuario) => {
                const nombreRol = await getRolById(usuario.id_rol);

                return {
                    id:             usuario.id,
                    email:          usuario.email,
                    full_name:      usuario.full_name,
                    nombre_usuario: usuario.nombre_usuario,  
                    documento:      usuario.documento,
                    number:         usuario.number,
                    activo:         usuario.activo,
                    rol:            nombreRol
                };
            })
        );

        return res.status(200).json({
            success: true,
            total: usersMapeado.length,
            usuarios: usersMapeado  
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error en el servidor"
        });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const nombreRol = await getRolById(usuario.id_rol);

        const usuarioMapeado = {
            id:             usuario.id,
            email:          usuario.email,
            full_name:      usuario.full_name,
            nombre_usuario: usuario.nombre_usuario,
            documento:      usuario.documento,
            number:         usuario.number,
            activo:         usuario.activo,
            rol:            nombreRol
        };

        return res.status(200).json({
            success: true,
            usuario: usuarioMapeado
        });

    } catch (error) {
        console.error('Error fetching user by id:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};


export const updateUser = async (req, res) => {
    const { id } = req.params;

    try {
        const { full_name, nombre_usuario, email, documento, number, activo, id_rol } = req.body;

        const { data: usuarioActualizado, error } = await supabase
            .from('usuarios')
            .update({
                full_name,
                nombre_usuario,
                email,
                documento,
                number,
                activo,
                id_rol,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (!usuarioActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};



export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: deleted, error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)
            .select();


        

        if (error) throw error;

       
        if (!deleted || deleted.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo eliminar. Verifica permisos RLS en Supabase.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};