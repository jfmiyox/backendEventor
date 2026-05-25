import supabase from '../../config/supabase.js';


export const createTipoEvento = async (req, res) => {
    try {
        const {
            nombre_tipo,
            descripcion,
            duracion_promedio_horas,
            requiere_montaje,
            activo,
        } = req.body;

   
        if (!nombre_tipo) {
            return res.status(400).json({
                success: false,
                message: "El nombre del tipo de evento es obligatorio.",
            });
        }

       
        const { data: existingTipo, error: searchError } = await supabase
            .from("tipos_evento")
            .select("id")
            .ilike("nombre_tipo", nombre_tipo.trim())
            .maybeSingle();

        if (searchError) throw searchError;

        if (existingTipo) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un tipo de evento con ese nombre.",
            });
        }

  
        const { data: nuevoTipo, error: insertError } = await supabase
            .from("tipos_evento")
            .insert([
                {
                    nombre_tipo: nombre_tipo.trim(),
                    descripcion: descripcion?.trim() || null,
                    duracion_promedio_horas: duracion_promedio_horas || null,
                    requiere_montaje: requiere_montaje ?? false,
                    activo: activo ?? true,
                },
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        return res.status(201).json({
            success: true,
            message: "Tipo de evento creado exitosamente.",
            tipoEvento: {
                id: nuevoTipo.id,
                nombre_tipo: nuevoTipo.nombre_tipo,
            },
        });
    } catch (error) {
        console.error("Error en createTipoEvento:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear el tipo de evento.",
            error: error.message || error.details || "Error desconocido",
        });
    }
};

export const getTiposEvento = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("tipos_evento")
            .select("id, nombre_tipo")
            .eq("activo", true)
            .order("nombre_tipo", { ascending: true });
 
        if (error) throw error;
 
        return res.status(200).json({
            success: true,
            tiposEvento: data,
        });
    } catch (error) {
        console.error("Error en getTiposEvento:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno al obtener los tipos de evento.",
            error: error.message || "Error desconocido",
        });
    }
};


export const getTipoEventoById = async (req, res) => {
    try {
        const { id } = req.params;
 
        const { data, error } = await supabase
            .from("tipos_evento")
            .select("id, nombre_tipo, descripcion, duracion_promedio_horas, requiere_montaje, activo")
            .eq("id", id)
            .single();
 
        if (error) throw error;
 
        return res.status(200).json({ success: true, tipoEvento: data });
 
    } catch (error) {
        console.error("Error en getTipoEventoById:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno al obtener el tipo de evento.",
            error: error.message || "Error desconocido",
        });
    }
};

