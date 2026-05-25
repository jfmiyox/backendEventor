import supabase from '../../config/supabase.js';

export const getCategorias = async (req, res) => {
    try {
        const { data: categorias, error } = await supabase
            .from('categorias')
            .select('id, nombre_categoria')
            .eq('activo', true);

        if (error) {
            throw error;
        }

        if (categorias.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron categorías activas'
            });
        }

        const categoriasFormateas = categorias.map(categoria => ({
            id: categoria.id,
            nombre: categoria.nombre_categoria
        }));

        return res.status(200).json({
            success: true,
            categorias: categoriasFormateas
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    } 
};


export const getCategoriaById = async (id) => {
    try {
        const { data: categoria, error } = await supabase
            .from('categorias')
            .select(' nombre_categoria')
            .eq('id', id)
            .eq('activo', true)
            .single();

        if (error) {
            throw error;
        }

        if (!categoria) {
            return null;
        }

        return categoria.nombre_categoria;
    } catch (error) {

        console.error(error);
        return null;
    }
};
