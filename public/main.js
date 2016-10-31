$(document).ready(function() {
    var socket = io();
    var input = $('#message-input');
    var messages = $('#messages');
    
    var usernameForm = $('#nicknameForm');
    var userButton = $('.userButton')
    var messagesWrap = $('#messagesWrap')
    var nicknameWrap = $('.nicknameWrap')
    var usernameInput= $('#usernameInput')
    
    messagesWrap.hide();

    var addMessage = function(message) {
        messages.append('<div>' + message + '</div>');
    };

    input.on('keydown', function(event) {
    if (event.keyCode != 13) {
        return;
    }

    var message = input.val();
    addMessage(message);
    socket.emit('message', message);
    input.val('');
  });
  
    usernameForm.submit(function(event){
        event.preventDefault();
        nicknameWrap.hide();
        messagesWrap.show();
        var username = usernameInput.val()
        console.log(username)
    });
    
  socket.on('message', addMessage);
});