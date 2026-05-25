import supabase from '../config/supabase.js'

export const testConnection = async (req, res) => {
  const { data, error } = await supabase
    .from('test')
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
}