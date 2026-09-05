const mysql = require('mysql2');

// 1. Configura as credenciais de conexão com o Workbench
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',          
  password: '@Bielzinho2007',
  database: 'servix'   
});

// 2. Conecta ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    return;
  }
  console.log('Conectado ao banco de dados MySQL com sucesso!');
  
  // Fecha a conexão após terminar tudo
    connection.end();
  });
