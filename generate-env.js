const fs = require('fs');
const path = require('path');

function carregarEnvLocal() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => {
        const separador = line.indexOf('=');
        if (separador < 0) return [line.trim(), ''];
        return [
          line.slice(0, separador).trim(),
          line.slice(separador + 1).trim().replace(/^['"]|['"]$/g, '')
        ];
      })
  );
}

const envLocal = carregarEnvLocal();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  || process.env.SUPABASE_URL
  || envLocal.NEXT_PUBLIC_SUPABASE_URL
  || envLocal.SUPABASE_URL
  || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.SUPABASE_KEY
  || envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || envLocal.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || envLocal.SUPABASE_KEY
  || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente ou em .env.local.');
}

// Cria o conteúdo do arquivo que será injetado no HTML
const content = `window.ENV = {
  SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  SUPABASE_KEY: ${JSON.stringify(supabaseKey)}
};`;

// Salva o arquivo na raiz (ou na pasta pública, dependendo da sua estrutura)
fs.writeFileSync('./env-config.js', content);
console.log('Arquivo env-config.js gerado com sucesso!');