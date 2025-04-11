const { io } = require('socket.io-client');

const test_urls = [
  "https://supacall.onrender.com",
  "https://socket-io-7yss.onrender.com",
  "http://localhost:3000",
  "https://easy-koala-usefully.ngrok-free.app"
];

const test_url = test_urls[3];
const user_name = process.argv[2] || Math.random().toString(36).substring(2);
console.log(user_name + ' está conectando...');

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

socket.on('user-list', (users) => {
  if (users.length === 0) {
    console.log('\x1b[36msala vazia\x1b[0m');
  } else {
    console.log('\x1b[36mUsuários na sala:\x1b[0m');
    users.forEach(user => {
      console.log(`\x1b[36m- ${user.userName}\x1b[0m`);
    });
  }
});

socket.on('user-connected', (data) => {
  console.log(`\x1b[33m${data.userName} entrou na sala\x1b[0m`);
});

socket.on('disconnect-user', (data) => {
  console.log(`\x1b[31m${data.data.user} saiu da sala\x1b[0m`);
});