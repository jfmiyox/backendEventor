import supabase from '../../config/supabase.js'

export const getCountries = async (req ,res) => {
    try {
        const {data: paises, error} = await supabase
        .from('paises')
        .select('id, nombre_pais');


        if (error){
            throw error;
        }

        if (paises.length===0){
            return res.status(404).json({
                success: false,
                message: 'No se han encontrado paises'
            })
        }

        const paisesFormateadosOrden = paises.map( pais =>({
            id: pais.id,
            nombre: pais.nombre_pais
        }) );

        return res.status(200).json({
            success: true,
            paises: paisesFormateadosOrden
        })

    } catch (error){
        console.error(error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const getCountryById = async (id) => {
    try {
        const {data: country, error} = await supabase
        .from('paises')
        .select('*')
        .eq('id', id)
        .single();

        if (error){
            throw error
        }

        if (!country){
           return null;

        }

        return country.nombre_pais
    } catch (error){
        return null;
    }
};