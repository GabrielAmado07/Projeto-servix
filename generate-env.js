const fs = require('fs');

// Pega as variáveis de ambiente (na Vercel, elas virão do painel)
// No ambiente local, você precisaria do pacote 'dotenv' para ler o .env local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Cria o conteúdo do arquivo que será injetado no HTML
const content = `window.ENV = {
  SUPABASE_URL: "${supabaseUrl}",
  SUPABASE_KEY: "${supabaseKey}"
};`;

// Salva o arquivo na raiz (ou na pasta pública, dependendo da sua estrutura)
fs.writeFileSync('./env-config.js', content);
console.log('Arquivo env-config.js gerado com sucesso!');