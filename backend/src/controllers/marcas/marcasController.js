import supabase from '../../config/supabase.js';
import { getCountryById } from '../paises/paisesController.js';


export const getMarcas = async (req, res) => {
    try {
        const { data: marcas, error } = await supabase
            .from('marcas')
            .select('id, nombre_marca')
            .eq('activo', true);

        if (error) {
            throw error;
        }

        if (marcas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron marcas activas'
            });
        }

        const marcasFormateas = marcas.map(marca => ({
            id: marca.id,
            nombre: marca.nombre_marca
        }));

        return res.status(200).json({
            success: true,
            marcas: marcasFormateas
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


export const createNewMarca= async (req, res) => {
    try {
        const {
            nombre,
            sitio_web,
            id_pais
        }   = req.body

        if (!nombre || !sitio_web  || !id_pais){
            return res.status(400).json({
                error: 'FALTAN CAMPOS OBLIGATORIOS'
            });
        }

        const nombrePais=  await getCountryById(id_pais);

        const {data, error} = await supabase
        .from('marcas')
        .insert([{
            nombre_marca: nombre,
            sitio_web,
            pais_origen: nombrePais,
            activo: true,
            fecha_creacion : new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        }])
        .select()
        .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Marca creada exitosamente'
        });

    } catch (error){
       
        return res.status(400).json({
            error: error.message
        })

    }

};