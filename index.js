const express = require("express");
const crypto = require("crypto");
const fs = require('fs');
const socketio = require("socket.io");
const http = require("http");

const port = 3000;

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

const filePath = './public/singler/leaderboards.txt';
const userAccessKeys = new Map();

app.use(express.static("public"));

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

io.on("connection", (socket) => {
  const serverKey = crypto.randomBytes(20).toString('hex');

  socket.emit("request loc");
  socket.emit("request key");

  socket.on("send loc", (loc) => {
    console.log(`A user with id ${socket.id} and loc ${loc.split('/')[3]} joined.`);
  });

  socket.on("send key", (clientKey) => {
    if (clientKey === 'verify 82defcf324571e70b0521d79cce2bf3fffccd69') {
      userAccessKeys.set(socket.id, serverKey);
      socket.emit('send hitKey', serverKey);
    }
  });

  socket.on('send hits', (hits, hitKey) => {
    if (hitKey && userAccessKeys.get(socket.id) === hitKey) {
      fs.appendFile(filePath, `${hits} `, (err) => {
        if (err) {
          console.error(err);
        }
        console.log(`Attempted to write ${hits} into file.`);
        reorder(); 
      });
    } else {
      console.log('Invalid access key or no access key provided');
    }
  });

  function reorder() {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const sortedContent = content.split(' ')
        .filter(Boolean)
        .map(entry => {
          const [number, username] = entry.split(':');
          return { number: Number(number), username };
        })
        .sort((a, b) => b.number - a.number)
        .map(entry => `${entry.number}:${entry.username}`)
        .join(' ');

      fs.writeFileSync(filePath, `${sortedContent} `, 'utf-8');
      console.log('Sorted & written to file successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  }
});
