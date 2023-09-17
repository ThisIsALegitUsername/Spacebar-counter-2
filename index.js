const express = require("express");
const fs = require('fs');
const socketio = require("socket.io");
const http = require("http");
const port = 3000;

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

const filePath = './public/singler/leaderboards.txt';

app.use(express.static("public"));

server.listen(port, function() {
  console.log("listening on port " + port);
});

io.on("connection", function(socket) {
  socket.emit("request loc");

  socket.on("send loc", function(loc) {
    console.log("A user with id " + socket.id + " and loc " + loc.split('/')[3] + " joined.")
  });

  socket.on('send hits', function(hits) {
    fs.appendFile(filePath, hits + " ", err => {
        if (err) {
            console.log(err);
        }
        console.log('attempted to write ' + hits + ' into file.');
        reorder(); // Call reorder after appending hits
    });
});

function reorder() {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const sortedContent = content.split(' ')
            .filter(Boolean)
            .map(entry => {
                const parts = entry.split(':');
                return {
                    number: Number(parts[0]),
                    username: parts[1]
                };
            })
            .sort((a, b) => b.number - a.number)
            .map(entry => `${entry.number}:${entry.username}`)
            .join(' ');

        fs.writeFileSync(filePath, sortedContent + " ", 'utf-8');
        console.log('sorted & written to file successfully');
    } catch (error) {
        console.error('asdfasdf:', error);
    }
}

});
