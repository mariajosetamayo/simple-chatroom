$(document).ready(function() {
  var socket = io();
  var input = $('#message-input');
  var messages = $('#messages');
  
  
  var usernameForm = $('#nicknameForm');
  var userButton = $('.userButton')
  var messagesWrap = $('#messagesWrap')
  var nicknameWrap = $('.nicknameWrap')
  var usernameInput= $('#usernameInput')
  var usersWrap = $('#usersWrap')
  var disconnectButton = $('#disconnectBtn')
  var userConnected = $('#status')
  
  messagesWrap.hide();
  usersWrap.hide();
  disconnectButton.hide();
  
  var username = "";
  var usersArray = []
  // var idArray = []
  var user = {}
  var id
  
  var addMessage = function(messageData) { // function to append the data and username to the DOM
    messages.append('<b>' + messageData.username + '</b><div>' + messageData.message + '</div>');
  };
  
  var userStatus = function(nickname){
    user.nickname = nickname
    userConnected.append('<p>' + user.nickname + " " + "came online" + '</p>')
  }
  
  var addToUserList = function (nickname) {
    //new
    user.id = socket.io.engine.id
    user.nickname = nickname
    socket.emit('app_user', user)
    // usersWrap.append('<li>' + user.nickname + '</li>')
    //new
    //old
    // usersWrap.append('<li>' + user + '</li>')
    //old
  }
  
  var addUserList = function(users) {
    //new
    console.log("WHAT IS USERS? ", users)
    usersWrap.html()
    usersWrap.empty()
    users.map(user =>  usersWrap.append('<li>' + ((user.nickname) ? user.nickname : user.id) + '</li>'))
    //new
    //old
    // usersWrap.append('<li>' + users + '</li>')
    //old
  }
  
  // var removeUser = function(user) {
  //   usersArray.splice(usersArray.indexOf(user), 1);
  // }
  
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
  
  usernameForm.submit(function(event){
    event.preventDefault();
    nicknameWrap.hide();
    messagesWrap.show();
    username = usernameInput.val()
    
    user['nickname'] = username
    //new
    addToUserList(user.nickname)
    //new
    //old
    // addUserList(user.nickname)
    //old
    console.log(user)
    
    usersWrap.show();
    disconnectButton.show();
    // socket.connect()
    console.log("The user is: ", user)
    userStatus(user.nickname)
    usersArray.push(user);
    console.log(usersArray)
    //old
    // socket.emit('users', user);
    //old
    
    // socket.emit('disconnect', usersArray);
    // removeUser(usersArray)
    // user.on('disconnect', function(){
    //   users.splice(users.indexOf(user), 1);
    // });
    
  });
  
  
  
  // disconnectButton.click(function(event){
  //   event.preventDefault()
  //   socket.disconnect();
  //   // socket.emit('disconnect', username)
  //   // removeUser(username)
  // })
  
  //new
  socket.on('all_users', function (allUsers) {
    console.log("RECEIVING ALL USERS: ", allUsers)
    usersArray = allUsers
    addUserList(usersArray)
  })
  //new
  socket.on('message', addMessage); // adds message to the div every time the server send you a message
  //old
  // socket.on('users', addUserList);
  //old
  socket.on('connect', function(){
    console.log('user is connected')
    // id = socket.io.engine.id
    // console.log(id)
    // idArray.push(id)
    //old
    // user = {
    //   id:socket.io.engine.id,
    // }  
    // socket.emit('app_user', user)
    //old
    
    // socket.on('disconnect', function(){
    //   console.log(user.nickname + ' ' +  "went offline")
    //   removeUser(user)
    //   console.log(usersArray)
    // })
  })
  

  
  
  // socket.on('connect', function (user) {
  //   addUserList(usersArray)
  //   user.on('disconnect', function(){
  //     usersArray.splice(usersArray.indexOf(user), 1);
  //   });
  // });
  
});