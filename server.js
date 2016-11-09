

var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);
var app_users = [];


io.on('connection', function (socket) {
    console.log('Client connected');
    
    socket.on('app-user', function(user){
        socket.user = user
        app_users.push(user)
        io.sockets.emit('all-users', app_users) //this broadcasts to ALL sockets the all users array
        socket.broadcast.emit('user-has-connected', user.nickname)
    })
    
    socket.on('message', function(messageData) { // receives messageData object from main.js
        socket.broadcast.emit('message', messageData); // sends the message to all the users of the chat
    });
    
    socket.on('show-private-message', function(privateMessageData){
        var privateUserId2 = privateMessageData.id2
        socket.to(privateUserId2).emit('show-private-message', privateMessageData)
    })
    
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data)
    })
    
    socket.on('disconnect', function(user){
        app_users.splice(app_users.indexOf(socket.user), 1);
        io.sockets.emit('all-users', app_users)
        socket.broadcast.emit('user-has-disconnected', socket.user.nickname)
        io.sockets.emit('number-connected', app_users.length)
    })
});

server.listen(process.env.PORT || 8080);