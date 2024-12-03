const request = require("supertest");
const { app } = require("../app.js"); 
let server;

let userToken; 

beforeAll(async () => {
  server = app.listen(5000);  

  // Cria um usuário antes dos testes
  const user = {
    name: 'teste',
    email: 'testuser@example.com',
    password: 'password123'
  };

  // Cria o usuário
  await request(app)
    .post('/api/auth/signup')  // Chama a rota de cadastro
    .send(user);

  // Loga com o usuário criado e armazena o token
  const res = await request(app)
    .post('/api/auth/login')
    .send(user);
  
  userToken = res.body.token;
});

afterAll(async () => {
  if (server) {
    server.close(); // Fecha o servidor após os testes
  }

  // Deleta o usuário criado após os testes
  await request(app)
    .delete('/api/users')  // Chama a rota de exclusão do usuário
    .set('Authorization', `${userToken}`);  // Autentica a requisição com o token
});

describe('Smoke Tests', () => {
  it('should respond with status 200 for GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  it('should log in successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should create a task successfully', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `${userToken}`)  // Autentica a requisição com o token
      .send({
        description: 'This is a task for smoke testing',
        team: "alice.wonderland@example.com"
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('task');
    expect(res.body.msg).toBe('Task created successfully..');

    // Deletando a tarefa criada após o teste
    const taskId = res.body.task._id;
    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `${userToken}`);  // Autentica a requisição com o token
  });
});
