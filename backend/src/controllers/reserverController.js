import supabase from '../config/supabase.js';

export const createReservation = async (req, res) => {
    const {
        idUsuario,
        itemId,
        itemType,
        startDate,
        endDate,
        notes,
        valor_total_reserva
    } = req.body;

    try {

        const { data: reserva, error: reservaError } = await supabase
            .from("reservas")
            .insert({
                id_cliente: idUsuario,
                fecha_inicio_reserva: startDate,
                fecha_fin_reserva: endDate,
                observaciones: notes,
                valor_total_reserva: valor_total_reserva,
                descuento_porcentaje: 0,
            })
            .select()
            .single();

        if (reservaError) throw reservaError;

        switch (itemType) {

            case "products":
                await supabase
                    .from("reserva_equipos")
                    .insert({
                        id_reserva: reserva.id,
                        id_equipo: itemId
                    });
                break;

            case "events":
                await supabase
                    .from("reserva_eventos")
                    .insert({
                        id_reserva: reserva.id,
                        id_evento: itemId
                    });
                break;

            case "combo":
                await supabase
                    .from("reserva_combos")
                    .insert({
                        id_reserva: reserva.id,
                        id_combo: itemId
                    });
                break;
        }

        res.json({
            success: true,
            reserva
        });

    } catch (error) {
    console.error(error);

    return res.status(500).json({
        success: false,
        error: error.message
    });
}
};

export const getReservationsByUser = async (req, res) => {
    const { userId } = req.params;

    const { data, error } = await supabase
        .from("reservas")
        .select(`
            *,
            reserva_eventos (
                eventos (
                    id,
                    nombre_evento,
                    fotos_eventos(
                        fotos(
                            url
                        )
                    )
                )
            ),
            reserva_equipos (
                equipos (
                    id,
                    nombre_equipo,
                    fotos_equipos(
                        fotos(
                            url
                        )
                    )
                )
            ),
            reserva_combos(
                combos(
                    id,
                    nombre_combo,
                    fotos_combos(
                        fotos(
                            url
                        )
                    )
                )
            )
        `)
        .eq("id_cliente", userId);

    const reservasFormateadas = data.map(reserva => {

    if (reserva.reserva_eventos.length > 0) {
            return {
                id: reserva.id,
                tipo: "evento",
                valor_total_reserva: reserva.valor_total_reserva,
                estado: reserva.estado,
                nombre: reserva.reserva_eventos[0].eventos.nombre_evento,
                itemId: reserva.reserva_eventos[0].eventos.id,
                imagen: reserva.reserva_eventos?.[0]?.eventos?.fotos_eventos?.[0]?.fotos?.url,
                fechaInicio: reserva.fecha_inicio_reserva,
                fechaFin: reserva.fecha_fin_reserva
            };
        }

        if (reserva.reserva_equipos.length > 0) {
            return {
                id: reserva.id,
                tipo: "equipo",
                valor_total_reserva: reserva.valor_total_reserva,
                estado: reserva.estado,
                nombre: reserva.reserva_equipos[0].equipos.nombre_equipo,
                imagen: reserva.reserva_equipos?.[0]?.equipos?.fotos_equipos?.[0]?.fotos?.url,
                itemId: reserva.reserva_equipos[0].equipos.id,
                fechaInicio: reserva.fecha_inicio_reserva,
                fechaFin: reserva.fecha_fin_reserva
            };
        }

        if (reserva.reserva_combos.length > 0) {
            return {
                id: reserva.id,
                tipo: "combo",
                valor_total_reserva: reserva.valor_total_reserva,
                nombre: reserva.reserva_combos[0].combos.nombre_combo,
                itemId: reserva.reserva_combos[0].combos.id,
                imagen: reserva.reserva_combos?.[0]?.combos?.fotos_combos?.[0]?.fotos?.url,
                fechaInicio: reserva.fecha_inicio_reserva,
                estado: reserva.estado,
                fechaFin: reserva.fecha_fin_reserva
            };
        }

        return null;
    }).filter(Boolean);

    return res.json({
        success: true,
        reservas: reservasFormateadas
    });
}

export const getReservationsByUserNotExpired = async (req, res) => {
    const { userId } = req.params;

    const { data, error } = await supabase
        .from("reservas")
        .select(`
            *,
            reserva_eventos (
                eventos (
                    id,
                    nombre_evento,
                    fotos_eventos (
                        fotos ( url )
                    )
                )
            ),
            reserva_equipos (
                equipos (
                    id,
                    nombre_equipo,
                    fotos_equipos (
                        fotos ( url )
                    )
                )
            ),
            reserva_combos (
                combos (
                    id,
                    nombre_combo,
                    fotos_combos (
                        fotos ( url )
                    )
                )
            )
        `)
        .eq("id_cliente", userId)
        .not("estado", "in", "(finalizada,cancelada,expirada)");

    if (error) {
        console.error("ERROR:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }

    if (!data) {
        return res.json({
            success: true,
            reservas: []
        });
    }

    const reservasFormateadas = data.map(reserva => {

        if (reserva.reserva_eventos?.length > 0) {
            const evento = reserva.reserva_eventos[0].eventos;

            return {
                id: reserva.id,
                tipo: "evento",
                nombre: evento.nombre_evento,
                itemId: evento.id,
                estado: reserva.estado,
                valor_total_reserva: reserva.valor_total_reserva,
                imagen: evento.fotos_eventos?.[0]?.fotos?.url,
                fechaInicio: reserva.fecha_inicio_reserva,
                fechaFin: reserva.fecha_fin_reserva
            };
        }

        if (reserva.reserva_equipos?.length > 0) {
            const equipo = reserva.reserva_equipos[0].equipos;

            return {
                id: reserva.id,
                tipo: "equipo",
                nombre: equipo.nombre_equipo,
                valor_total_reserva: reserva.valor_total_reserva,
                itemId: equipo.id,
                imagen: equipo.fotos_equipos?.[0]?.fotos?.url,
                fechaInicio: reserva.fecha_inicio_reserva,
                estado: reserva.estado,
                fechaFin: reserva.fecha_fin_reserva
            };
        }

        if (reserva.reserva_combos?.length > 0) {
            const combo = reserva.reserva_combos[0].combos;

            return {
                id: reserva.id,
                tipo: "combo",
                nombre: combo.nombre_combo,
                valor_total_reserva: reserva.valor_total_reserva,
                itemId: combo.id,
                imagen: combo.fotos_combos?.[0]?.fotos?.url,
                fechaInicio: reserva.fecha_inicio_reserva,
                estado: reserva.estado,
                fechaFin: reserva.fecha_fin_reserva
            };
        }

        return null;
    }).filter(Boolean);

    return res.json({
        success: true,
        reservas: reservasFormateadas
    });
};