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
  
  var username = "";
  
  var addMessage = function(messageData) {
    messages.append('<b>' + messageData.username + '</b><div>' + messageData.message + '</div>');
  };
  
  input.on('keydown', function(event) {
    if (event.keyCode != 13) {
      return;
    }

    var message = input.val();
    var messageData = {message:message, username:username};
    console.log(messageData)
    addMessage(messageData);
    socket.emit('message', messageData);
    input.val('');
  });
  
  usernameForm.submit(function(event){
    event.preventDefault();
    nicknameWrap.hide();
    messagesWrap.show();
    username = usernameInput.val()
    
  });
  
  socket.on('message', addMessage);
});