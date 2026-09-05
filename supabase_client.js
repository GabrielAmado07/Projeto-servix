// 1. Carrega as variáveis do arquivo .env
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

// 2. Puxa as variáveis através do process.env
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testarConexao() {
  console.log('Tentando conectar usando variáveis de ambiente...')
  
  // Substitua 'nome_da_sua_tabela' por uma tabela real do seu banco
  const { data, error } = await supabase.from('nome_da_sua_tabela').select('*').limit(1)
  
  if (error) {
    console.error('❌ Erro ao conectar:', error.message)
  } else {
    console.log('✅ Conexão funcionando via .env! Dados:', data)
  }
}

testarConexao()
