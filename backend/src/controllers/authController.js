import supabase from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getFotoPerfilUsuario } from '../controllers/usuarios/usuariosController.js';
import { getCountryById } from './paises/paisesController.js';
import { getCiudadById } from './ciudad/ciudadController.js';
import { getGeneroById } from './genero/generosController.js';


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Se jodio esta vaina x2, no puede estar vacio"
            });
        }

        const { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({
                message: 'El correo o la contraseña son incorrectas'
            });
        }

        const esIgual = await bcrypt.compare(password, user.password_hash);

        if (!esIgual) {
            return res.status(400).json({
                message: "Credenciales Incorrectas"
            });
        }

        if (user.is_pending_delete) {
            const fechaSolicitud = new Date(user.deleted_at);
            const fechaLimite = new Date(fechaSolicitud);
            fechaLimite.setDate(fechaLimite.getDate() + 20); 

            const hoy = new Date();

            if (hoy > fechaLimite) {
                return res.status(410).json({
                    message: 'Esta cuenta ha sido eliminada definitivamente.'
                });
            }

            return res.status(200).json({
                requiresReactivation: true,
                message: 'Tu cuenta está programada para ser borrada. ¿Deseas recuperarla?',
                userId: user.id 
            });
        }

        const token = jwt.sign(
            {
                userId: user.id, 
                email: user.email
            },
            process.env.JWT_SECRET, 
            {
                expiresIn: '26h'
            }
        );

        return res.status(200).json({
            message: "Login exitoso", 
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                number: user.number,
                rol: user.id_rol
            }
        });
    } catch (error) {
        console.error('Error en el login.', error.message);
        return res.status(500).json({
            message: "Error en el Servidor"
        });
    }
};



export const signup = async (req, res) => {

    try {
        const { fullName, email, password } = req.body;


        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }



        const { data: userExists, error } = await supabase
            .from('usuarios').select('*').eq('email', email).limit(1);


        if (error) throw error;
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 11);

        const { data: newUser, error: insertError } = await supabase
            .from('usuarios').insert([
                {
                    full_name: fullName,
                    email: email,
                    password_hash: hashedPassword,
                }
            ]).select().single()

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
      throw insertError;
    }

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '18h' }
        )

        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                number:newUser.number
            }
        });

    } catch (error) {
        console.error('ERROR COMPLETO:', error);
     res.status(500).json({
        message: 'Error en el servidor',
        error: error.message
    });
    }
};



export const getMe = async (req, res) => {
    try {
        if (req.user?.userId === undefined) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            }); 
        }

        const { data: user, error } = await supabase
            .from('usuarios')
            .select(`
                id,
                email,
                full_name,
                number,
                id_rol,
                nombre_usuario,
                id_pais,
                id_genero,
                id_ciudad,
                fecha_nacimiento
            `)
            .eq('id', req.user.userId)
            .single();

        if (error || !user) {
            return res.status(401).json({
                message: 'Usuario no encontrado'
            });
        }
        

        const fotoUrl = await getFotoPerfilUsuario(req.user.userId);
    
        const nombrePais = user.id_pais ? await getCountryById(user.id_pais) : null;
        const nombreGenero = user.id_genero ? await getGeneroById(user.id_genero) : null;
        const nombreCiudad= user.id_ciudad? await getCiudadById(user.id_ciudad) : null;

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                number: user.number,
                fotoUrl: fotoUrl, 
                rol: user.id_rol,
                userName: user.nombre_usuario,
                fecha_nacimiento: user.fecha_nacimiento,
                pais: nombrePais,
                genero: nombreGenero,
                ciudad: nombreCiudad?.nombre || null
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error en el Servidor'
        });
    }
};



export const updateProfile = async (req, res) => {
    try {
        if (req.user?.userId === undefined) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            }); 
        }

        const { fullName, userName, idPais, idCiudad, idGenero, fechaNacimiento } = req.body;

        if (idCiudad) {
            const infoCiudad = await getCiudadById(idCiudad);
            
            if (!infoCiudad || infoCiudad.id_pais !== idPais) {
                return res.status(400).json({
                    success: false,
                    message: 'La ciudad seleccionada no corresponde al país elegido.'
                });
            }
        }

        const { data: usuarioActualizado, error } = await supabase
            .from('usuarios')
            .update({
                full_name: fullName,
                nombre_usuario: userName,
                id_pais: idPais || null,
                id_ciudad: idCiudad || null,
                id_genero: idGenero || null,
                fecha_nacimiento: fechaNacimiento || null
            })
            .eq('id', req.user.userId)
            .select() 
            .single();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Perfil actualizado correctamente',
            user: usuarioActualizado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};


export const requestDeleteAccount = async (req, res) => {
    try {
        if (req.user?.userId===undefined){
            return res.status(401).json({
                success: false, 
                message: 'Usuario no Autenticado'
            });
        }

        const {data, error}= await supabase
        .from('usuarios')
        .update({
            is_pending_delete: true,
            deleted_at: new Date().toISOString()
        })
        .eq('id',req.user.userId);

        if (error){
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Tu cuenta ha sido programa para borrarse en 20 dias'
        })
    } catch (error){
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
};

export const reactivateAccount = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID del usuario es requerido"
            });
        }

        const { data, error } = await supabase
            .from('usuarios')
            .update({
                is_pending_delete: false,
                deleted_at: null
            })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: '¡Cuenta reactivada con éxito! Ya puedes iniciar sesión.'
        });

    } catch (error) {
        console.error('Error al reactivar:', error);
        return res.status(500).json({
            success: false,
            message: 'No se pudo reactivar la cuenta.'
        });
    }
};


export const updateAccountData = async (req, res) => {
    try {
        const {email, number, currentPassword, newPassword} = req.body;
        const userId= req.user.userId;

          if (!email || !number) {
            return res.status(400).json({
                success: false,
                message: 'Email y teléfono son requeridos'
            });
        }

          if (currentPassword && newPassword) {
                    const { data: user, error: userError } = await supabase
                .from('usuarios')
                .select('password_hash')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            const esValida = await bcrypt.compare(currentPassword, user.password_hash);
            if (!esValida) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña actual es incorrecta'
                });
            }

             const newPasswordHash = await bcrypt.hash(newPassword, 11);

            const { data, error } = await supabase
                .from('usuarios')
                .update({
                    email,
                    number,
                    password_hash: newPasswordHash
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                message: 'Cuenta actualizada con éxito',
                user: data
            });
        }

        const { data, error } = await supabase
            .from('usuarios')
            .update({
                email,
                number
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Cuenta actualizada con éxito',
            user: data
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar la cuenta'
        });
    }
};
