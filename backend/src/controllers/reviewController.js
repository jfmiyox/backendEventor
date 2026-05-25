import supabase from '../config/supabase.js';
import jwt from "jsonwebtoken";


export const createReview = async (req, res) => {

    const itemId = req.params.id;

    const type = req.params.type;

    const {
        comentario,
        calificacion
    } = req.body;

    try {

        const id_usuario = req.user.userId;

        const { data: nuevaResenia, error } = await supabase
            .from("resenias")
            .insert({
                comentario,
                calificacion,
                id_usuario
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        const relationTable =
            type === "products"
                ? "resenias_equipo"
                : "resenias_eventos";

        const relationField =
            type === "products"
                ? "id_equipo"
                : "id_evento";

        const { error: relationError } = await supabase
            .from(relationTable)
            .insert({
                id_resenia: nuevaResenia.id,

                [relationField]: itemId
            });

        if (relationError) {
            throw relationError;
        }

        return res.status(201).json({
            success: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getReviews = async (req, res) => {

    const itemId = req.params.id;
    const type = req.params.type;
    const mainTable =
    type === "products"
        ? "equipos"
        : "eventos";
    
    const relationTable =
    type === "products"
        ? "resenias_equipo"
        : "resenias_eventos";

    try {

        const { data: item, error } = await supabase
    .from(mainTable)
    .select(`
        ${relationTable}(
            resenias(
                id,
                calificacion,
                comentario,
                fecha,
                usuarios(
                    full_name,
                    fotos_usuarios(
                        fotos(
                            url
                        )
                    )
                )
            )
        )
    `)
    .eq('activo', true)
    .eq('id', itemId)
    .single();

        if (error) {
            throw error;
        }

        const resenias = item[relationTable] || [];
        

        const totalResenias = resenias.length;

        const sumaCalificaciones = resenias.reduce((acc, item) => {
            return acc + (item.resenias?.calificacion || 0);
        }, 0);

        const promedio =
            totalResenias > 0
                ? sumaCalificaciones / totalResenias
                : 0;

        const reviewData = {
            reviewList: resenias,
            reviews: totalResenias,
            stars: Number(promedio.toFixed(1))
        };

        return res.status(200).json({
            success: true,
            product: reviewData
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


export const authMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No autorizado"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Token inválido"
        });
    }
};