import supabase from "../../config/supabase.js";

const imagenDefault = process.env.CLOUDINARY_IMAGE_COMUN;

export const getUbicaciones = async (req, res) => {
    try {
        const { data: ubicaciones, error } = await supabase
            .from('ubicaciones')
            .select(`
                id,
                nombre_ubicacion,
                tipo_espacio,
                latitud,
                longitud,
                aforo_maximo,
                contacto_venue,
                telefono_venue,
                notas_tecnicas,
                activo,
                direcciones(
                    ciudades( nombre_ciudad ),
                    paises( nombre_pais )
                ),
                fotos_ubicaciones(
                    fotos( url )
                )
            `)
            .eq('activo', true);

        if (error) throw error;

        const ubicacionesOrden = ubicaciones.map(u => ({
            id: u.id,
            nombre: u.nombre_ubicacion,
            venueType: u.tipo_espacio,
            latitude: u.latitud,
            longitude: u.longitud,
            maxCapacity: u.aforo_maximo,
            venueContact: u.contacto_venue,
            venuePhone: u.telefono_venue,
            technicalNotes: u.notas_tecnicas,
            status: u.activo ? 'Sí' : 'No',
            imagen: u.fotos_ubicaciones?.[0]?.fotos?.url || imagenDefault,
            ciudad: u.direcciones?.ciudades?.nombre_ciudad,
            pais: u.direcciones?.paises?.nombre_pais,
        }));

        return res.status(200).json({
            success: true,
            total: ubicacionesOrden.length,
            ubicaciones: ubicacionesOrden
        });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getUbicacionById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de la ubicacion es requerido'
            });
        }

        const { data: ubicaciones, error } = await supabase 
        .from('ubicaciones')
        .select(`
            id,
            descripcion,
            nombre_ubicacion,
            tipo_espacio,
            id_direccion,
            direcciones(
                direccion_linea1,
                direccion_linea2,
                ciudades(
                    nombre_ciudad
                ),
                paises(
                    nombre_pais
                )
            ),
            aforo_maximo,
            contacto_venue,
            telefono_venue,
            latitud,
            longitud,
            fotos_ubicaciones(
                fotos(
                    url
                )
            ),
            activo
        `)
        .eq('id', id)
        .single();

        if (error) {
            throw error;
        }

        if (!ubicaciones) {
            return res.status(404).json({
                success: false,
                message: 'Ubicacion no encontrada'
            });
        }
        const ubicacionesOrden = {
            id: ubicaciones.id,
            nombre_ubicacion: ubicaciones.nombre_ubicacion,
            imagen:
                ubicaciones.fotos_ubicaciones?.[0]?.fotos?.url || imagenDefault,
            ciudad: ubicaciones.direcciones?.ciudades?.nombre_ciudad,
            direccion: [
                ubicaciones.direcciones?.direccion_linea1,
                ubicaciones.direcciones?.direccion_linea2
            ]
                .filter(Boolean)
                .join(', '),
            pais: ubicaciones.direcciones?.paises?.nombre_pais,
            id_direccion: ubicaciones.id_direccion,
            tipo_espacio: ubicaciones.tipo_espacio,
            latitud: ubicaciones.latitud,
            longitud: ubicaciones.longitud,
            aforo_maximo: ubicaciones.aforo_maximo,
            contacto_venue: ubicaciones.contacto_venue,
            telefono_venue: ubicaciones.telefono_venue,
            descripcion: ubicaciones.descripcion,
            activo: ubicaciones.activo
        };

        return res.status(200).json({
            success: true,
            ubicaciones: ubicacionesOrden
        });

    } catch(error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    };
}

export const createUbicacion = async (req, res) => {
    try {
        const {
            nombre_ubicacion, tipo_espacio, id_direccion,
            latitud, longitud, aforo_maximo, contacto_venue,
            telefono_venue, notas_tecnicas, descripcion,
            url_imagen, activo,
        } = req.body;

        if (!nombre_ubicacion) {
            return res.status(400).json({ error: 'El nombre del recinto es obligatorio' });
        }

        const lat = latitud ? parseFloat(latitud) : null;
const lng = longitud ? parseFloat(longitud) : null;

if (lat !== null && Math.abs(lat) > 90) {
    return res.status(400).json({ error: 'Latitud inválida (debe estar entre -90 y 90)' });
}
if (lng !== null && Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'Longitud inválida (debe estar entre -180 y 180)' });
}




        const { data, error } = await supabase
            .from('ubicaciones')
            .insert([{
                nombre_ubicacion,
                tipo_espacio: tipo_espacio || null,
                id_direccion: id_direccion || null,
                latitud: lat,
                longitud: lng,
                aforo_maximo: aforo_maximo || null,
                contacto_venue: contacto_venue || null,
                telefono_venue: telefono_venue || null,
                notas_tecnicas: notas_tecnicas || null,
                descripcion: descripcion || null,
                activo: activo ?? true,
            }])
            .select()
            .single();

        if (error) throw error;

        if (url_imagen && data.id) {
            const tipoFotoId = await obtenerTipoFotoId('ubicacion');
            const { data: foto, error: errorFoto } = await supabase
                .from('fotos')
                .insert([{ tipo_foto_id: tipoFotoId, url: url_imagen }])
                .select('id')
                .single();

            if (!errorFoto && foto) {
                await supabase
                    .from('fotos_ubicaciones')
                    .insert([{ foto_id: foto.id, ubicacion_id: data.id }]);
            }
        }

        return res.status(201).json({ success: true, ubicacion: data });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const updateUbicacion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_ubicacion, tipo_espacio, id_direccion,
            latitud, longitud, aforo_maximo, contacto_venue,
            telefono_venue, notas_tecnicas, descripcion,
            url_imagen, activo,
        } = req.body;

        const { data, error } = await supabase
            .from('ubicaciones')
            .update({
                nombre_ubicacion,
                tipo_espacio: tipo_espacio || null,
                id_direccion: id_direccion || null,
                latitud: latitud || null,
                longitud: longitud || null,
                aforo_maximo: aforo_maximo || null,
                contacto_venue: contacto_venue || null,
                telefono_venue: telefono_venue || null,
                notas_tecnicas: notas_tecnicas || null,
                descripcion: descripcion || null,
                activo: activo ?? true,
                fecha_actualizacion: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        if (url_imagen) {
            const tipoFotoId = await obtenerTipoFotoId('ubicacion');

            const { data: foto, error: errorFoto } = await supabase
                .from('fotos')
                .insert([{ tipo_foto_id: tipoFotoId, url: url_imagen }])
                .select('id')
                .single();

            if (!errorFoto && foto) {
                await supabase.from('fotos_ubicaciones').delete().eq('ubicacion_id', id);
                await supabase.from('fotos_ubicaciones').insert([{ foto_id: foto.id, ubicacion_id: id }]);
            }
        }

        return res.status(200).json({ success: true, ubicacion: data });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const deleteUbicacion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'Falta el ID' });

        await supabase.from('fotos_ubicaciones').delete().eq('id_ubicacion', id);

        const { error } = await supabase.from('ubicaciones').delete().eq('id', id);
        if (error) throw error;

        return res.status(200).json({ success: true, message: 'Recinto eliminado exitosamente' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

async function obtenerTipoFotoId(nombre) {
    const { data, error } = await supabase
        .from('tipos_foto')
        .select('id')
        .eq('nombre', nombre)
        .single();
    if (error) throw error;
    return data.id;
}