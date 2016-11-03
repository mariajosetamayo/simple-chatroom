

var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);
var app_users = []


io.on('connection', function (socket) {
    console.log('Client connected');
    
    socket.on('app_user', function(user){
        //new
        socket.user = user
        app_users.push(user)
        console.log(app_users)
        console.log("ON THE SERVER, ALL USERS ARE: ", app_users)
        io.sockets.emit('all_users', app_users) //this broadcasts to ALL sockets the all users array
        //new
    })

    socket.on('message', function(messageData) { // receives messageData object from main.js
        console.log('Received message:', messageData.message);
        socket.broadcast.emit('message', messageData); // sends the message to all the users of the chat
    });
    
    // socket.on('users', function(user){
    //     //new
    //     socket.broadcast.emit('users', app_users)
    //     //new
    //     //old
    // //   socket.broadcast.emit('users', user.nickname)
    //   //old
    // })
    
    socket.on('disconnect', function(user){
        console.log('user is disconnected')
        app_users.splice(app_users.indexOf(socket.user), 1);
        console.log("these are the users after splice", app_users)
        io.sockets.emit('all_users', app_users)
    })
});

server.listen(process.env.PORT || 8080);