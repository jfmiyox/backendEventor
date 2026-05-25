import supabase from "../../config/supabase.js";
import { getTipoEventoById } from "../tipoEvento/tipoEventoController.js";

const imagenDefault = process.env.CLOUDINARY_IMAGE_COMUN;

export const getEventos = async (req, res) => {
    try {
        const { data: eventos, error } = await supabase
            .from('eventos')
            .select(`
                id,
                nombre_evento,
                notas_internas,
                requerimientos_especiales,
                descripcion,
                estado,
                valor_total,
                aforo_estimado,
                fecha_creacion,
                tipos_evento(
                    nombre_tipo
                ),
                activo,
                fotos_eventos(
                    fotos(
                        url
                    )
                ),
                ubicaciones_evento(
                    ubicaciones(
                        nombre_ubicacion,
                        direcciones(
                            ciudades(
                                nombre_ciudad
                            ),
                            paises(
                                nombre_pais
                            )
                        )
                    )
                ),
                resenias_eventos(
                    resenias(
                        calificacion
                    )
                ),
                categorias_eventos(
                    categorias(
                        nombre_categoria
                    )
                )
            `)
            .eq('activo', true);

        if (error) throw error;

        const eventosOrden = eventos.map(evento => {
            const resenias = evento.resenias_eventos || [];
            const totalResenias = resenias.length;
            const sumaCalificaciones = resenias.reduce((acc, item) => {
                return acc + (item.resenias?.calificacion || 0);
            }, 0);
            const promedio = totalResenias > 0 ? sumaCalificaciones / totalResenias : 0;
            const category = evento.categorias_eventos.map(
                (item) => item.categorias.nombre_categoria
            );

            return {
                id: evento.id,
                notas_internas: evento.notas_internas,
                requerimientos_especiales: evento.requerimientos_especiales,
                nombre: evento.nombre_evento,
                descripcion: evento.descripcion,
                nombre_tipo: evento.tipos_evento?.nombre_tipo,
                precio: evento.valor_total,
                aforo_estimado: evento.aforo_estimado,
                fecha_creacion: evento.fecha_creacion,
                imagen: evento.fotos_eventos?.[0]?.fotos?.url || imagenDefault,
                lugar: evento.ubicaciones_evento?.ubicaciones?.nombre_ubicacion,
                ciudad: evento.ubicaciones_evento?.ubicaciones?.direcciones?.ciudades?.nombre_ciudad,
                pais: evento.ubicaciones_evento?.ubicaciones?.direcciones?.paises?.nombre_pais,
                estado: evento.estado,
                reviews: totalResenias,
                stars: Number(promedio.toFixed(1)),
                category,
            };
        });

        return res.status(200).json({
            success: true,
            total: eventosOrden.length,
            eventos: eventosOrden
        });

    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};



export const getEventsById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del evento es requerido'
            });
        }

        const { data: evento, error } = await supabase 
        .from('eventos')
        .select(`
                id,
                nombre_evento,
                descripcion,
                aforo_estimado,
                requerimientos_especiales,
                estado,
                valor_total,
                activo,
                tipos_evento(
                    nombre_tipo
                ),
                activo,
                fotos_eventos(
                    fotos(
                        url
                    )
                ),
                ubicaciones_evento(
                    ubicaciones(
                        nombre_ubicacion,
                        direcciones(
                            ciudades(
                                nombre_ciudad
                            ),
                            paises(
                                nombre_pais
                            )
                        )
                    )
                ),
                resenias_eventos(
                    resenias(
                        calificacion
                    )
                ),
                categorias_eventos(
                    categorias(
                        nombre_categoria
                    )
                )

            `)
        .eq('id', id)
        .single();

        if (error) {
            throw error;
        }

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        const resenias = evento.resenias_eventos || [];

        const totalResenias = resenias.length;

        const sumaCalificaciones = resenias.reduce((acc, item) => {
            return acc + (item.resenias?.calificacion || 0);
        }, 0);

        const promedio =
            totalResenias > 0
                ? sumaCalificaciones / totalResenias
                : 0;

        const eventosMapeo = {
            id: evento.id,
            id_categoria: evento.id_categoria,
            valor_total: evento.valor_total,
            codigo_interno: evento.codigo_interno,
            aforo_estimado: evento.aforo_estimado,
            tipo_evento: evento.tipos_evento?.nombre_tipo,
            nombre: evento.nombre_evento,
            descripcion: evento.descripcion,
            unidad_medida: evento.unidad_medida,
            valor_compra: evento.valor_compra,
            tarifa_alquiler_dia: evento.tarifa_alquiler_dia,
            estado: evento.estado,
            observaciones: evento.observaciones,
            imagen: evento.fotos_eventos?.[0]?.fotos?.url || imagenDefault,
            reviews: totalResenias,
            stars: Number(promedio.toFixed(1)),
            type:"events",
            requerimientos_especiales: evento.requerimientos_especiales,
            activo: evento.activo
        };

        return res.status(200).json({
            success: true,
            event: eventosMapeo
        });
    } catch (error) {  
        console.error(error);
        return res.status(500).json({
            success: false,
                error: error.message
        });
    }
};


export const createEvento = async (req, res) => {
    try {
        const {
            nombre_evento,
            id_tipo_evento,
            estado,
            aforo_estimado,
            descripcion,
            requerimientos_especiales,
            valor_total,
            notas_internas,
            activo,
        } = req.body;

        if (!nombre_evento?.trim()) {
            return res.status(400).json({
                success: false,
                message: "El nombre del evento es obligatorio.",
            });
        }
        if (!id_tipo_evento) {
            return res.status(400).json({
                success: false,
                message: "El tipo de evento es obligatorio.",
            });
        }
        if (!estado) {
            return res.status(400).json({
                success: false,
                message: "El estado del evento es obligatorio.",
            });
        }

        const { data, error } = await supabase
            .from("eventos")
            .insert([{
                nombre_evento: nombre_evento.trim(),
                id_tipo_evento,
                estado,
                aforo_estimado: aforo_estimado ? Number(aforo_estimado) : null,
                descripcion: descripcion?.trim() || null,
                requerimientos_especiales: requerimientos_especiales?.trim() || null,
                valor_total: valor_total ? Number(valor_total) : null,
                notas_internas: notas_internas?.trim() || null,
                activo: activo ?? true,
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: "Evento creado exitosamente.",
            evento: data,
        });

    } catch (error) {
        console.error("Error en createEvento:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear el evento.",
            error: error.message || error.details || "Error desconocido",
        });
    }
};

export const deleteEvento = async (req, res) => {
    try {
        const { id } = req.params;
 
        const { data, error } = await supabase
            .from("eventos")
            .update({ activo: false })
            .eq("id", id)
            .select()
            .single();
 
        if (error) throw error;
 
        return res.status(200).json({
            success: true,
            message: "Evento eliminado correctamente.",
            evento: { id: data.id },
        });
 
    } catch (error) {
        console.error("Error en deleteEvento:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno al eliminar el evento.",
            error: error.message || "Error desconocido",
        });
    }
};
 