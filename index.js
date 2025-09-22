// Setup basic express server

import { PrismaClient } from '@prisma/client';
import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
  console.log('Server listening at port %d', port);
});
const client = new PrismaClient()
// Routing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', async (text) => {
    
    //  Добавляем сообщение в бд
    const message = await client.message.create({
      data: {userID, text}
    })
  
   

  // when the client emits 'add user', this listens and executes
  socket.on('add user', async (username) => {
    if (addedUser) return;
    //* *//

    const user = await client.user.create({
      data: {username, password: ""}
    })

    console.log(message) //получчаем сообщение
    console.log(user);
    
  });
    //* *//
    // we store the username in the socket session for this client
    socket.username = username;
    
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});