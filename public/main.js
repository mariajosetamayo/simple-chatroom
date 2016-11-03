$(document).ready(function() {
  var socket = io();
  
  // variables for selecting elements from the DOM
  var input = $('#message-input');
  var messages = $('#messages');
  var usernameForm = $('#nicknameForm');
  var userButton = $('.userButton')
  var messagesWrap = $('#messagesWrap')
  var nicknameWrap = $('.nicknameWrap')
  var usernameInput= $('#usernameInput')
  var usersWrap = $('#usersWrap')
  var userConnected = $('#status')
  
  // hiding message box and users list when user enters their nickname
  messagesWrap.hide();
  usersWrap.hide();
  
  // variables that will be used to store user's information
  var username = "";
  var usersArray = []
  var user = {}
  
  ///// Functions that will be used to manipulate the DOM ////
  var addMessage = function(messageData) { // function to append the data and username to the DOM
    messages.append('<b>' + messageData.username + '</b><div>' + messageData.message + '</div>');
  };
  
  var userStatus = function(nickname){
    user.nickname = nickname
    userConnected.append('<p>' + user.nickname + " " + "came online" + '</p>')
  }
  
  var addToUserList = function (nickname) {
    user.id = socket.io.engine.id
    user.nickname = nickname
    socket.emit('app_user', user)
  }
  
  var addUserList = function(users) {
    console.log("WHAT IS USERS? ", users)
    usersWrap.html()
    usersWrap.empty()
    users.map(user =>  usersWrap.append('<li>' + ((user.nickname) ? user.nickname : user.id) + '</li>'))
  }
  
  usernameForm.submit(function(event){
    event.preventDefault();
    nicknameWrap.hide();
    messagesWrap.show();
    username = usernameInput.val()
    
    user['nickname'] = username
    addToUserList(user.nickname)
    console.log(user)
    
    usersWrap.show();
    console.log("The user is: ", user)
    userStatus(user.nickname)
    usersArray.push(user);
    console.log(usersArray)
  });
  
  ///// Event Listners that will communicate with the server //////

  input.on('keydown', function(event) { // When user presses enter, event if triggered
    if (event.keyCode != 13) {
      return;
    }

    var message = input.val();
    var messageData = {message:message, username:username}; // Object to save the message and the username info
    console.log(messageData)
    addMessage(messageData); // appends the messageData object
    socket.emit('message', messageData); // emits messageData object to the server
    input.val(''); 
  });
  
  socket.on('all_users', function (allUsers) {
    console.log("RECEIVING ALL USERS: ", allUsers)
    usersArray = allUsers
    addUserList(usersArray)
  })
  
  socket.on('message', addMessage); // adds message to the div every time the server send you a message
});