const { io } = require('socket.io-client');

// Array de URLs de teste
const test_urls = [
  "https://supacall.onrender.com",
  "https://socket-io-7yss.onrender.com",
  "http://localhost:3000"  
];

// Seleciona a URL de teste (mude o índice para alternar entre as URLs)
const test_url = test_urls[0]; // 0 para a primeira URL, 1 para a segunda, etc.

const user_name = Math.random().toString(36).substring(2);
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
  console.log('\x1b[32mTest ok\x1b[0m');
});