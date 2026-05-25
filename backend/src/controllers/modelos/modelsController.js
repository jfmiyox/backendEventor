import supabase from '../../config/supabase.js';

export const getModelos = async (req, res) => {
    try {
        const { marcaId } = req.params;

        if (!marcaId) {
            return res.status(400).json({ error: 'Falta el ID de la marca' });
        }

        const { data, error } = await supabase
            .from('modelos')
            .select('id, nombre_modelo')
            .eq('id_marca', marcaId)
            .eq('activo', true);

        if (error) throw error;

        const modelos = data.map(modelo => ({
            id: modelo.id,
            nombre: modelo.nombre_modelo
        }));

        return res.status(200).json({
            success: true,
            modelos
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: error.message
        });
    }
};

export const getModeloById = async (id) => {
    try {
        const { data: modelo, error } = await supabase
            .from('modelos')
            .select(' nombre_modelo')
            .eq('id', id)
            .eq('activo', true)
            .single();
        if (error) {
            throw error;
        }
        if (!modelo) {
            return null;
        }
        return modelo.nombre_modelo;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }   
};



export const createModelo = async (req, res) => {
    try {
        const { nombre_modelo, descripcion_tecnica, referencia_fabricante, id_marca } = req.body;

        if (!nombre_modelo || !id_marca) {
            return res.status(400).json({ error: 'El nombre del modelo y la marca son obligatorios' });
        }

        const { data, error } = await supabase
            .from('modelos')
            .insert([{
                nombre_modelo,
                descripcion_tecnica: descripcion_tecnica || null,
                referencia_fabricante: referencia_fabricante || null,
                id_marca,
                activo: true,
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            modelo: {
                id: data.id,
                nombre: data.nombre_modelo,
            },
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
