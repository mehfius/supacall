const { io } = require('socket.io-client');

const socket = io("https://supacall.onrender.com", {
//const socket = io("https://socket-io-7yss.onrender.com", {
  query: {
    room: "test-room",
    user: Math.random().toString(36).substring(2),
    room_name: "Test Room",
    card_date: new Date().toISOString()
  }
});