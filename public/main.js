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
  var privateMessages = $('.privateMessagesWrap')
  var messagesPrivate = $('#messages-private')
  var privateMessageInput = $('.message-input-private')
  
  // we hide the message box and users list on the screen where user enters their nickname
  messagesWrap.hide();
  usersWrap.hide();

  
  // variables that will be used to store user's information
  var username = "";
  var usersArray = [];
  var user = {};
  var typing;
  // var bindedDivPrivateMsg
  // var usernameClickedId;
  
  ///// Functions that will be used to manipulate the DOM ////
  var addMessage = function(messageData) { // function to append the data/content of the message and username to the DOM
    messages.append('<b>' + messageData.username + '</b><div>' + messageData.message + '</div>');
  };
  
  var addPrivateMessageToDiv = function(privateMessageData) {
    var div = $('#'+privateMessageData.id2)
    div.append('<b>' + privateMessageData.username + '</b><div>' + privateMessageData.message + '</div>');
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

    usersWrap.empty()
    users.map(user =>  usersWrap.append('<li><a href="">' + ((user.nickname) ? user.nickname : user.id) + '</a></li>'))
  
    $('#privateMessageArea').empty()
    var otherUsers = users.filter(function(currentUser){ return user.id !== currentUser.id })
    otherUsers.map(function(user){
      var privateUserMessages = privateMessages.clone();
      privateUserMessages.find('h3').html('Private messages for: ' + ((user.nickname) ? user.nickname : user.id))
      privateUserMessages.attr("id", user.id);
      $('#privateMessageArea').append(privateUserMessages);
    })
    

  
  };
  
  
  usernameForm.submit(function(event){
    event.preventDefault();
    nicknameWrap.hide();
    messagesWrap.show();
    username = usernameInput.val()
    user['nickname'] = username
    addToUserList(user.nickname)
    usersWrap.show();
    usersArray.push(user);
  });
  
  function timeoutFunc (){
    typing = false
    socket.emit('typing', false)
  }
  
  $('#privateMessageArea').on('keydown', 'input', function(event) { // When user presses enter, event if is triggered
    if (event.keyCode != 13) {
      return;
    }
    var privateDivId = $(this).parent('div').attr('id')
    var privateMessageData  = privateMessageObject(privateDivId, $(this).val())
    addPrivateMessageToDiv(privateMessageData)
    socket.emit('show-private-message', privateMessageData)
    $(this).val('');
  })
  
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
    var privateDivId = $(this).parent('li').attr('id')
    // bindedDivPrivateMsg = addPrivateMessage(null, privateDivId)
    // addPrivateMessage(privateDivId)
    privateMessageObject(privateDivId)
    // usernameClickedId = $(this).parent('li').attr('id')
    console.log("this is the id of clicked element", privateDivId)
  })
  
  
  
  ///// Event Listners that will communicate with the server //////

  input.on('keydown', function(event) { // When user presses enter, event if is triggered
    if (event.keyCode != 13) {
      return;
    }

    var message = input.val();
    var messageData = {message:message, username:username}; // Object to save the message and the username info
    addMessage(messageData); // appends the messageData object
    socket.emit('message', messageData); // emits messageData object to the server
    input.val(''); 
  });
  
  var privateMessageObject = function(divId, message2){
    return {message: message2, username:username, id: user.id, id2: divId}
  }
  
  socket.on('typing', function(data){
    if (data){
      typingMessage.html(data)
    }
    else{
      typingMessage.html('')
    }
  })
  
  
  socket.on('all_users', function (allUsers) {
    usersArray = allUsers
    addUserList(usersArray)
  })
  
  socket.on('message', addMessage); // adds message to the div every time the server send you a message
  
  socket.on('user-has-connected', userStatus)
  
  socket.on('user-has-disconnected', userStatusDisconnected )
  
  socket.on('number-connected', numberOfUsersConnected)
  
  socket.on('show-private-message', function(privateMessageData){
    console.log('received')
    console.log(privateMessageData)
    var flip = privateMessageData.id;
    privateMessageData.id = privateMessageData.id2;
    privateMessageData.id2 = flip
    addPrivateMessageToDiv(privateMessageData)
  }) 
  
  // socket.on('private-message', addPrivateMessage)
});