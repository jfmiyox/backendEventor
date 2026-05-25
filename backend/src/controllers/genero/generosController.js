import supabase from '../../config/supabase.js'


export const getGeneros = async (req, res) => {
    try {
        const { data: generos, error } = await supabase
            .from('genero')
            .select('id, nombre_genero')

        if (error) {
            throw error;
        }

        if (generos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron géneros activos'
            });
        }

        const generosFormateados = generos.map(genero => ({
            id: genero.id,
            nombre: genero.nombre_genero
        }));

        return res.status(200).json({
            success: true,
            generos: generosFormateados
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    } 
};


export const getGeneroById = async (id) => {
    try {
        const { data: genero, error } = await supabase
            .from('genero')
            .select('nombre_genero')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!genero) {
            return null;
        }

        return genero.nombre_genero;
    } catch (error) {
        console.error(error);
        return null;
    }
};