const { io } = require('socket.io-client');

// Array de URLs de teste
const test_urls = [
  "https://supacall.onrender.com",
  "https://socket-io-7yss.onrender.com",
  "http://localhost:3000",
  "https://easy-koala-usefully.ngrok-free.app"
];

// Seleciona a URL de teste (mude o índice para alternar entre as URLs)
const test_url = test_urls[3]; // 0 para a primeira URL, 1 para a segunda, etc.

// Pega o nome do usuário passado como parâmetro
const user_name = process.argv[2] || Math.random().toString(36).substring(2);
console.log('Testando User: ' + user_name);

const socket = io(test_url, {
  query: {
    room: "test-room",
    user: user_name,
    room_name: "Test Room",
    card_date: new Date().toISOString()
  }
});

socket.on('connect', function () {
  console.log('\x1b[32mOnline\x1b[0m');
});

// Recebe a lista de usuários conectados na sala
socket.on('user-list', (users) => {
  console.log('\x1b[36mUsuários na sala:\x1b[0m');
  users.forEach(user => {
    console.log(`\x1b[36m- ${user.userName}\x1b[0m`);
  });
});

// Recebe notificação quando um novo usuário entra na sala
socket.on('user-connected', (data) => {
  console.log(`\x1b[33m${data.userName} entrou na sala\x1b[0m`);
});

// Recebe notificação quando um usuário sai da sala
socket.on('disconnect-user', (data) => {
  console.log(`\x1b[31m${data.data.user} saiu da sala\x1b[0m`);
});