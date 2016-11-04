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
  var typingMessage = $('#typing-message')
  var usersConnectedDiv = $('#usersInfo')
  var privateMessages = $('#privateMessagesWrap')
  var messagesPrivate = $('#messages-private')
  var privateMessageInput = $('#message-input-private')
  
  // we hide the message box and users list on the screen where user enters their nickname
  messagesWrap.hide();
  usersWrap.hide();
  privateMessages.hide();
  
  // variables that will be used to store user's information
  var username = "";
  var usersArray = [];
  var user = {};
  var typing;
  var usernameClickedId;
  
  ///// Functions that will be used to manipulate the DOM ////
  var addMessage = function(messageData) { // function to append the data/content of the message and username to the DOM
    messages.append('<b>' + messageData.username + '</b><div>' + messageData.message + '</div>');
  };
  
  var addPrivateMessage = function(privateMessage) {
    messagesPrivate.append('<b>' + privateMessage.username + '</b><div>' + privateMessage.message + '</div>')
    
    usernameClickedId = privateMessage.id
    console.log(usernameClickedId)
    ////asd
  }
  
  function fadeout (){
    userConnected.fadeOut().html('')
  }
  
  var userStatus = function(nickname){ //function to show a message when a user comes online
    setTimeout(fadeout, 2000)
    userConnected.html('<p>' + nickname + " " + "came online" + '</p>')
    userConnected.show()
  }
  
  var userStatusDisconnected = function(nickname){ //function to show a message when a user comes online
    setTimeout(fadeout, 2000)
    userConnected.html('<p>' + nickname + " " + "went offline" + '</p>')
    userConnected.show()
  }
  
  var numberOfUsersConnected = function(number){
    usersConnectedDiv.html('<h3>' + number + " " + "users connected:" + "</h3>")
  }
  
  var addToUserList = function (nickname) { // function to send details (id and nickname) to the server
    user.id = socket.io.engine.id
    user.nickname = nickname
    socket.emit('app_user', user) // here is where we send the user details to the server
  }
  
  var addUserList = function(users) {
    //console.log("WHAT IS USERS? ", users)
    usersWrap.html()
    usersWrap.empty()
    users.map(user =>  usersWrap.append('<li id = '+ user.id +'><a href="">' + ((user.nickname) ? user.nickname : user.id) + '</a></li>'))
  }
  
  
  usernameForm.submit(function(event){
    event.preventDefault();
    nicknameWrap.hide();
    messagesWrap.show();
    username = usernameInput.val()
    
    user['nickname'] = username
    addToUserList(user.nickname)
    //console.log(user)
    
    usersWrap.show();
    //console.log("The user is: ", user)
    // userStatus(user.nickname)
    usersArray.push(user);
    //console.log(usersArray)
  });
  
  function timeoutFunc (){
    typing = false
    socket.emit('typing', false)
  }
  
  input.keyup(function(){
    console.log("user is typing")
    typing = true
    socket.emit('typing', user.nickname + ' ' + ' is typing...')
    clearTimeout(timeout)
    var timeout = setTimeout(timeoutFunc, 1000)
  })
  
  usersWrap.on('click', "a", function(event){
    event.preventDefault()
    privateMessages.show()
    usernameClickedId = $(this).parent('li').attr('id')
   // console.log("this is the id of clicked element", usernameClickedId)
  })
  
  
  
  ///// Event Listners that will communicate with the server //////

  input.on('keydown', function(event) { // When user presses enter, event if is triggered
    if (event.keyCode != 13) {
      return;
    }

    var message = input.val();
    var messageData = {message:message, username:username}; // Object to save the message and the username info
   // console.log(messageData)
    addMessage(messageData); // appends the messageData object
    socket.emit('message', messageData); // emits messageData object to the server
    input.val(''); 
  });
  
  privateMessageInput.on('keydown', function(event) { // When user presses enter, event if is triggered
    if (event.keyCode != 13) {
      return;
    }
    var message2 = privateMessageInput.val()
   // console.log("this is the private message", message2)
    var privateMessageData = {message: message2, username:username, id: user.id, id2: usernameClickedId}
     addPrivateMessage(privateMessageData)
     socket.emit('show-private-message', privateMessageData)
     privateMessageInput.val('');
  })
  
  socket.on('typing', function(data){
    if (data){
      typingMessage.html(data)
    }
    else{
      typingMessage.html('')
    }
  })
  
  
  socket.on('all_users', function (allUsers) {
   // console.log("RECEIVING ALL USERS: ", allUsers)
    usersArray = allUsers
    addUserList(usersArray)
  })
  
  socket.on('message', addMessage); // adds message to the div every time the server send you a message
  
  socket.on('user-has-connected', userStatus)
  
  socket.on('user-has-disconnected', userStatusDisconnected )
  
  socket.on('number-connected', numberOfUsersConnected)
  
  socket.on('show-private-message', function(privateMessageData){
    privateMessages.show()
    addPrivateMessage(privateMessageData)
  }) 
  
  // socket.on('private-message', addPrivateMessage)
});