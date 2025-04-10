const { io } = require('socket.io-client');

const user_name = Math.random().toString(36).substring(2);
console.log('Testando User: ' + user_name);
const socket = io("https://supacall.onrender.com", {

//const socket = io("https://socket-io-7yss.onrender.com", {
  query: {
    room: "test-room",
    user: user_name,
    room_name: "Test Room",
    card_date: new Date().toISOString()
  }
});

socket.on('connect', function () {
    console.log('Teste ok');
});

socket.on('disconnect-user', function () {
    console.log('User disconnected:');
});