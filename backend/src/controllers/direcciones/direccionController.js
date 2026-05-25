import supabase from '../../config/supabase.js';


export const getDirecciones = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('direcciones')
            .select(`
                id,
                tipo_direccion,
                direccion_linea1,
                direccion_linea2,
                ciudad,
                departamento,
                codigo_postal,
                pais,
                es_principal,
                activo,
                ciudades:ciudad ( id, nombre_ciudad ),
                paises:pais    ( id, nombre_pais )
            `)
            .eq('activo', true);

        if (error) throw error;

        const formateadas = data.map(d => ({
            id: d.id,
            nombre: [d.direccion_linea1, d.ciudades?.nombre_ciudad, d.paises?.nombre_pais]
                .filter(Boolean).join(', '),
            tipo_direccion: d.tipo_direccion,
            direccion_linea1: d.direccion_linea1,
            direccion_linea2: d.direccion_linea2,
            ciudad: d.ciudad,
            nombre_ciudad: d.ciudades?.nombre_ciudad,
            departamento: d.departamento,
            codigo_postal: d.codigo_postal,
            pais: d.pais,
            nombre_pais: d.paises?.nombre_pais,
            es_principal: d.es_principal,
        }));

        return res.status(200).json({ success: true, direcciones: formateadas });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};


export const getDireccionById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Falta el ID' });

        const { data, error } = await supabase
            .from('direcciones')
            .select(`
                id, tipo_direccion, direccion_linea1, direccion_linea2,
                ciudad, departamento, codigo_postal, pais, es_principal, activo,
                ciudades:ciudad ( id, nombre_ciudad ),
                paises:pais    ( id, nombre_pais )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Dirección no encontrada' });

        return res.status(200).json({ success: true, direccion: data });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};



export const createDireccion = async (req, res) => {
    try {
        const {
            direccion_linea1,
            direccion_linea2,
            tipo_direccion,
            ciudad,       
            departamento,
            codigo_postal,
            pais,         
            es_principal,
        } = req.body;

        if (!direccion_linea1 || !ciudad || !pais) {
            return res.status(400).json({ error: 'Dirección, ciudad y país son obligatorios' });
        }

        const { data, error } = await supabase
            .from('direcciones')
            .insert([{
                direccion_linea1,
                direccion_linea2: direccion_linea2 || null,
                tipo_direccion: tipo_direccion || null,
                ciudad,
                departamento: departamento || null,
                codigo_postal: codigo_postal || null,
                pais,
                es_principal: es_principal ?? false,
                activo: true,
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, direccion: data });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

