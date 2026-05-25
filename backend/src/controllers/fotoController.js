import crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import supabase from '../config/supabase.js';

function calcularHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function obtenerTipoFotoId(nombre) {
  const { data, error } = await supabase
    .from('tipos_foto')
    .select('id')
    .eq('nombre', nombre)
    .single();

  if (error) throw error;
  return data.id;
}

export async function subirFotoPreview(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió imagen' });
    }

    const buffer = req.file.buffer;
    const hash = calcularHash(buffer);
    const nombreUnico = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mi-app/fotos',
          public_id: nombreUnico.split('.')[0]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    res.json({
      success: true,
      imageUrl: result.secure_url,
      public_id: result.public_id,
      hash: hash,
      message: 'Foto lista para confirmar'
    });

  } catch (error) {
    console.error('Error al subir preview:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function confirmarFotoPerfil(req, res) {
  try {
    const { userId, imageUrl, public_id, hash } = req.body;

    if (!userId || !imageUrl || !public_id) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const tipoFotoId = await obtenerTipoFotoId('perfil');

    const { data: fotoExistente } = await supabase
      .from('fotos')
      .select('id')
      .eq('hash_imagen', hash)
      .single();

    let fotoId;

    if (fotoExistente) {
      fotoId = fotoExistente.id;
    } else {
      const { data: fotoNueva, error: errorFoto } = await supabase
        .from('fotos')
        .insert([{
          tipo_foto_id: tipoFotoId,
          url: imageUrl,
          public_id: public_id,
          hash_imagen: hash,
          creada_por: userId
        }])
        .select();

      if (errorFoto) throw errorFoto;
      fotoId = fotoNueva[0].id;
    }

    await supabase
      .from('fotos_usuarios')
      .delete()
      .eq('usuario_id', userId);

    const { error: errorAsociar } = await supabase
      .from('fotos_usuarios')
      .insert([{ foto_id: fotoId, usuario_id: userId }]);

    if (errorAsociar) throw errorAsociar;

    res.json({
      success: true,
      message: 'Foto de perfil actualizada',
      fotoId,
      imageUrl
    });

  } catch (error) {
    console.error('Error al confirmar foto:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function obtenerFotoPerfil(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Falta el userId' });
    }

    const { data, error } = await supabase
      .from('fotos_usuarios')
      .select(`
        foto_id,
        fotos (
          id,
          url,
          descripcion,
          created_at
        )
      `)
      .eq('usuario_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Usuario sin foto de perfil' });
    }

    res.json({ success: true, foto: data.fotos });

  } catch (error) {
    console.error('Error al obtener foto perfil:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function confirmarFotoProducto(req, res) {
  try {
    const { productoId, imageUrl, public_id, hash } = req.body;

    if (!productoId || !imageUrl || !public_id) {
      return res.status(400).json({ error: 'Faltan datos (productoId, imageUrl, public_id)' });
    }

    const tipoFotoId = await obtenerTipoFotoId('equipo');

    let fotoId;
    const { data: fotoExistente } = await supabase
      .from('fotos')
      .select('id')
      .eq('hash_imagen', hash)
      .maybeSingle();

    if (fotoExistente) {
      fotoId = fotoExistente.id;
    } else {
      const { data: fotoNueva, error: errorFoto } = await supabase
        .from('fotos')
        .insert([{
          tipo_foto_id: tipoFotoId,
          url: imageUrl,
          public_id,
          hash_imagen: hash,
        }])
        .select('id')
        .single();

      if (errorFoto) throw errorFoto;
      fotoId = fotoNueva.id;
    }

    await supabase
      .from('fotos_equipos')
      .delete()
      .eq('equipo_id', productoId);

    const { error: errorAsociar } = await supabase
      .from('fotos_equipos')
      .insert([{ foto_id: fotoId, equipo_id: productoId }]);

    if (errorAsociar) throw errorAsociar;

    res.json({ success: true, message: 'Foto del producto guardada', fotoId, imageUrl });

  } catch (error) {
    console.error('Error al confirmar foto de producto:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function obtenerFotoProducto(req, res) {
  try {
    const { productoId } = req.params;
    if (!productoId) return res.status(400).json({ error: 'Falta productoId' });

    const { data, error } = await supabase
      .from('fotos_equipos')
      .select(`
        foto_id,
        fotos (
          id,
          url,
          descripcion,
          created_at
        )
      `)
      .eq('equipo_id', productoId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Equipo sin foto asociada' });

    res.json({ success: true, foto: data.fotos });

  } catch (error) {
    console.error('Error al obtener foto de producto:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function confirmarFotoUbicacion(req, res) {
  try {
    const { ubicacionId, imageUrl, public_id, hash } = req.body;

    if (!ubicacionId || !imageUrl || !public_id) {
      return res.status(400).json({ error: 'Faltan datos (ubicacionId, imageUrl, public_id)' });
    }

    const tipoFotoId = await obtenerTipoFotoId('ubicacion');

    let fotoId;
    const { data: fotoExistente } = await supabase
      .from('fotos')
      .select('id')
      .eq('hash_imagen', hash)
      .maybeSingle();

    if (fotoExistente) {
      fotoId = fotoExistente.id;
    } else {
      const { data: fotoNueva, error: errorFoto } = await supabase
        .from('fotos')
        .insert([{
          tipo_foto_id: tipoFotoId,
          url: imageUrl,
          public_id,
          hash_imagen: hash,
        }])
        .select('id')
        .single();

      if (errorFoto) throw errorFoto;
      fotoId = fotoNueva.id;
    }

    await supabase
      .from('fotos_ubicaciones')
      .delete()
      .eq('id_ubicacion', ubicacionId);

    const { error: errorAsociar } = await supabase
      .from('fotos_ubicaciones')
      .insert([{ id_foto: fotoId, id_ubicacion: ubicacionId }]);

    if (errorAsociar) throw errorAsociar;

    res.json({ success: true, message: 'Foto de ubicación guardada', fotoId, imageUrl });

  } catch (error) {
    console.error('Error al confirmar foto de ubicación:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function obtenerFotoUbicacion(req, res) {
  try {
    const { ubicacionId } = req.params;
    if (!ubicacionId) return res.status(400).json({ error: 'Falta ubicacionId' });

    const { data, error } = await supabase
      .from('fotos_ubicaciones')
      .select(`
        id_foto,
        fotos (
          id,
          url,
          descripcion,
          created_at
        )
      `)
      .eq('id_ubicacion', ubicacionId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Ubicación sin foto asociada' });

    res.json({ success: true, foto: data.fotos });

  } catch (error) {
    console.error('Error al obtener foto de ubicación:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function confirmarFotoEvento(req, res) {
  try {
    const { eventoId, imageUrl, public_id, hash } = req.body;

    if (!eventoId || !imageUrl || !public_id) {
      return res.status(400).json({ error: 'Faltan datos (eventoId, imageUrl, public_id)' });
    }

    const tipoFotoId = await obtenerTipoFotoId('evento');

    let fotoId;
    const { data: fotoExistente } = await supabase
      .from('fotos')
      .select('id')
      .eq('hash_imagen', hash)
      .maybeSingle();

    if (fotoExistente) {
      fotoId = fotoExistente.id;
    } else {
      const { data: fotoNueva, error: errorFoto } = await supabase
        .from('fotos')
        .insert([{
          tipo_foto_id: tipoFotoId,
          url: imageUrl,
          public_id,
          hash_imagen: hash,
        }])
        .select('id')
        .single();

      if (errorFoto) throw errorFoto;
      fotoId = fotoNueva.id;
    }

    const { error: errorAsociar } = await supabase
      .from('fotos_eventos')
      .insert([{ foto_id: fotoId, evento_id: eventoId }]);

    if (errorAsociar) throw errorAsociar;

    res.json({ success: true, message: 'Foto del evento guardada', fotoId, imageUrl });

  } catch (error) {
    console.error('Error al confirmar foto de evento:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function obtenerFotosEvento(req, res) {
  try {
    const { eventoId } = req.params;
    if (!eventoId) return res.status(400).json({ error: 'Falta eventoId' });

    const { data, error } = await supabase
      .from('fotos_eventos')
      .select(`
        foto_id,
        fotos (
          id,
          url,
          descripcion,
          created_at
        )
      `)
      .eq('evento_id', eventoId);

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Evento sin fotos asociadas' });

    res.json({ success: true, fotos: data.map(d => d.fotos) });

  } catch (error) {
    console.error('Error al obtener fotos de evento:', error);
    res.status(500).json({ error: error.message });
  }
}

export default {
  subirFotoPreview,
  confirmarFotoPerfil,
  obtenerFotoPerfil,
  confirmarFotoProducto,
  obtenerFotoProducto,
  confirmarFotoUbicacion,
  obtenerFotoUbicacion,
  confirmarFotoEvento,
  obtenerFotosEvento,
};