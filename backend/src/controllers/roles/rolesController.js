import { success } from 'zod';
import supabase from '../../config/supabase.js';
export const getRoles = async (req,res) => {
    try {
        const {data: roles, error} = await supabase
        .from(`roles`)
        .select(`id,
            nombre_rol,
            nivel
        `)
        .eq('activo',true);

        if (error){
            throw error;
        }

        const rolesMapeado = roles.map( (rol) => {
            return {
                id: rol.id,
                nombre: rol.nombre_rol,
                nivel: rol.nivel
            }
        });
        
        return res.status(200).json({
            success: true,
            roles: rolesMapeado
        })
    } catch(error){
      
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getRolById =  async (id) => {
    try{
        const {data, error} = await supabase
        .from(`roles`)
        .select('nombre_rol')
        .eq(`id`,id)
        .single()

        if (error){
            throw error;
        }
        if (!data){
            return null;
        }

        return data.nombre_rol;
    } catch (error){
        return null;
    }
}