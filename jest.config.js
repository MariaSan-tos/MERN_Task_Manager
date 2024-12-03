module.exports = {
    testEnvironment: 'node',  // Configura o Jest para usar o ambiente Node.js
    setupFilesAfterEnv: ['./backend/tests/setup.js'],  // Arquivo para carregar variáveis de ambiente
    verbose: true,  // Exibe os detalhes dos testes
    globals: {
      'process.env': require('dotenv').config().parsed, // Carrega as variáveis de ambiente no Jest
    },
    silent: false
    
  };
  