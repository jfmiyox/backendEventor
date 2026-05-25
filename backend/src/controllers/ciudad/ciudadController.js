import supabase from '../../config/supabase.js'

export const getCiudades = async (req, res) => {
    try {
    
        const { data: ciudades, error } = await supabase
            .from('ciudades')
            .select('id, nombre_ciudad, id_pais')

        if (error) {
            throw error;
        }

        if (ciudades.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron ciudades activas'
            });
        }

        
        const ciudadesFormateadas = ciudades.map(ciudad => ({
            id: ciudad.id,
            nombre: ciudad.nombre_ciudad,
            id_pais: ciudad.id_pais 
        }));

        return res.status(200).json({
            success: true,
            ciudades: ciudadesFormateadas
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    } 
};


export const getCiudadById = async (id) => {
    try {
        const { data: ciudad, error } = await supabase
            .from('ciudades')
            .select('nombre_ciudad, id_pais')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!ciudad) {
            return null;
        }

        return {
            nombre: ciudad.nombre_ciudad,
            id_pais: ciudad.id_pais
        };

    } catch (error) {
        console.error(error);
        return null;
    }
};