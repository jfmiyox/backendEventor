
import supabase from "../../config/supabase.js";
import {getCategoriaById} from "../categorias/categoriasController.js";
import {getModeloById} from "../modelos/modelsController.js";


const fotoVACIA = process.env.CLOUDINARY_IMAGE_COMUN; 

export const getReviews = async (req, res) => {

    const productId = req.params.id;

    try {

        const { data: product, error } = await supabase
            .from('equipos')
            .select(`
                resenias_equipo(
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
            .eq('id', productId)
            .single();

        if (error) {
            throw error;
        }

        const resenias = (product.resenias_equipo || []).reverse();

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

export const getProducts = async (req, res ) => {
    try {
        const {data:Products, error} = await supabase
        .from('equipos')
        .select
        (`
           id,
           categorias(
           nombre_categoria),
           id_modelo,
           numero_serie,
           unidad_medida,
           valor_compra,
           codigo_interno,
           nombre_equipo, 
           descripcion,
           tarifa_alquiler_dia,
           estado,
           activo,
           fecha_adquisicion,
           vida_util_meses,
           proxima_revision,
           observaciones,
           fotos_equipos(
                fotos(
                    url
                )
            ),
            resenias_equipo(
                    resenias(
                        calificacion
                    )
            )
        `)
        .eq('activo', true);

        if (error) {
            throw error;
        }

       const equiposOrden = await Promise.all(
        Products.map(async (equipo) => {

        const resenias = equipo.resenias_equipo || [];
        const categoriaName= await getCategoriaById(equipo.id_categoria);
        const modeloName= await getModeloById(equipo.id_modelo);


        const totalResenias = resenias.length;

        const sumaCalificaciones = resenias.reduce((acc, item) => {
            return acc + (item.resenias?.calificacion || 0);
        }, 0);

        const promedio =
            totalResenias > 0
                ? sumaCalificaciones / totalResenias
                : 0;

        return {
            id: equipo.id,
            nombre: equipo.nombre_equipo,
            category: equipo.categorias?.nombre_categoria,
            model: modeloName,
            internalCode: equipo.codigo_interno,
            serialNumber: equipo.numero_serie,
            unidadDeMedida: equipo.unidad_medida,
            precioCosto: equipo.valor_compra,
            adquisicion: equipo.fecha_adquisicion,
            descripcion: equipo.descripcion,
            precio: equipo.tarifa_alquiler_dia,
            imagen: equipo.fotos_equipos?.[0]?.fotos?.url || fotoVACIA,
            estado: equipo.estado,
            activo: equipo.activo,
            vidaUtilMeses: equipo.vida_util_meses,
            nextRevision: equipo.proxima_revision,
            notas: equipo.observaciones,
            reviews: totalResenias,
            stars: Number(promedio.toFixed(1))
        };
    }));
    
        return res.status(200).json({
            success: true,
            total: equiposOrden.length,
            productos: equiposOrden
        });
    } catch (error) {

           console.error(error);
        return res.status(500).json({
                success: false,
                error: error.message
        });

    }
}

export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del producto es requerido'
            });
        }

        const { data: producto, error } = await supabase 
        .from('equipos')
        .select(`
            id,
            id_categoria,
            id_modelo,
            codigo_interno,
            numero_serie,
            nombre_equipo,
            descripcion,
            unidad_medida,
            valor_compra,
            tarifa_alquiler_dia,
            estado,
            observaciones,
            activo,
            vida_util_meses,
            proxima_revision,
            activo,
            fotos_equipos(
                fotos(
                    url
                )
            ),
            resenias_equipo(
                    resenias(
                        calificacion
                    )
                )
        `)
        .eq('id', id)
        .single();

        if (error) {
            throw error;
        }

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const resenias = producto.resenias_equipo || [];

        const totalResenias = resenias.length;

        const sumaCalificaciones = resenias.reduce((acc, item) => {
            return acc + (item.resenias?.calificacion || 0);
        }, 0);

        const promedio =
            totalResenias > 0
                ? sumaCalificaciones / totalResenias
                : 0;

        const productosMapeo = {
            id: producto.id,
            id_categoria: producto.id_categoria,
            codigo_interno: producto.codigo_interno,
            nombre: producto.nombre_equipo,
            descripcion: producto.descripcion,
            unidad_medida: producto.unidad_medida,
            valor_compra: producto.valor_compra,
            tarifa_alquiler_dia: producto.tarifa_alquiler_dia,
            estado: producto.estado,
            observaciones: producto.observaciones,
            imagen: producto.fotos_equipos?.[0]?.fotos?.url || fotoVACIA,
            reviews: totalResenias,
            id_modelo: producto.id_modelo,
            numero_serie: producto.numero_serie,
            activo: producto.disponibilidad,
            vida_util_meses: producto.vida_util_meses,
            proxima_revision: producto.proxima_revision,
            stars: Number(promedio.toFixed(1)),
            type:"products"
        };

        return res.status(200).json({
            success: true,
            product: productosMapeo
        });
    } catch (error) {  
        console.error(error);
        return res.status(500).json({
            success: false,
                error: error.message
        });
    }
};



export const createNewProduct = async (req, res) => {
    try {
        const {
            nombre_equipo,
            codigo_interno,
            numero_serie,
            descripcion,
            id_categoria,
            id_modelo,
            tarifa_alquiler_dia,
            valor_compra,
            unidad_medida,
            estado,
            fecha_adquisicion,
            vida_util_meses,
            proxima_revision,
            observaciones
        } = req.body;

        if (!nombre_equipo || !codigo_interno || !id_categoria || !id_modelo || !unidad_medida || !estado) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const { data, error } = await supabase
            .from('equipos')
            .insert([{
                nombre_equipo,
                codigo_interno,
                numero_serie: numero_serie || null,
                descripcion: descripcion || null,
                id_categoria,
                id_modelo,
                tarifa_alquiler_dia: tarifa_alquiler_dia || null,
                valor_compra: valor_compra || null,
                unidad_medida,
                estado,
                fecha_adquisicion: fecha_adquisicion || null,
                vida_util_meses: vida_util_meses || null,
                proxima_revision: proxima_revision || null,
                observaciones: observaciones || null,
                activo: true
            }])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            equipo: data
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: error.message
        });
    }
};


export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_equipo,
            codigo_interno,
            numero_serie,
            descripcion,
            id_categoria,
            id_modelo,
            tarifa_alquiler_dia,
            valor_compra,
            unidad_medida,
            disponibilidad,
            estado,
            vida_util_meses,
            proxima_revision,
            observaciones,
        } = req.body;

        const { data, error } = await supabase
            .from('equipos')
            .update({
                nombre_equipo,
                codigo_interno,
                numero_serie: numero_serie || null,
                descripcion: descripcion || null,
                id_categoria: id_categoria || null,
                id_modelo: id_modelo || null,
                tarifa_alquiler_dia: tarifa_alquiler_dia || null,
                valor_compra: valor_compra || null,
                unidad_medida: unidad_medida || null,
                activo : disponibilidad==='disponible'? true : false,
                estado: estado || null,
                vida_util_meses: vida_util_meses || null,
                proxima_revision: proxima_revision || null,
                observaciones: observaciones || null,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            equipo: data,
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID del producto es requerido'
            });
        }

      
        await Promise.all([
            supabase.from('fotos_equipos').delete().eq('equipo_id', id),
            supabase.from('resenias_equipo').delete().eq('id_equipo', id),
            supabase.from('combos_equipos').delete().eq('id_equipo', id),
        ]);

     
        const { error } = await supabase
            .from('equipos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};