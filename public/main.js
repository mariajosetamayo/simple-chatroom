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
  var privateMessagesArea =  $('#privateMessageArea')
  
  // we hide the message box and users list on the screen where user enters their nickname
  messagesWrap.hide();
  usersWrap.hide();

  // variables that will be used to store user's information
  var state = {
    user: {},
    typing: false,
  }
  
  /* 
  TODO 
  Meter user, typing en state. hecho 
  Improve naming.
  Fix jQuery selectors. hecho
  Test
  
  Switch between divs. 
  */

  
  // Functions that will be used to manipulate the DOM 
  var addMessage = function(messageData) { // function to append the data/content of the message and username to the DOM
    messages.append('<b>' + messageData.username + '</b><div>' + messageData.message + '</div>');
  };
  
  var addPrivateMessageToDiv = function(privateMessageData) {
    var div = $('#'+privateMessageData.privateMessageDivId)
    div.append('<b>' + privateMessageData.username + '</b><div>' + privateMessageData.message + '</div>');
  }
  
  function fadeout (){
    userConnected.fadeOut().html('')
  }
  
  var numberOfUsersConnected = function(number){
    usersConnectedDiv.html('<h3>' + number + " " + "users connected:" + "</h3>")
  }
  
  var addToUserList = function (nickname) { // function to send details (id and nickname) to the server
    state.user.id = socket.io.engine.id
    state.user.nickname = nickname
    socket.emit('app-user', state.user) // here is where we send the user details to the server
  }
  
  var addUserList = function(users) {
    usersWrap.empty()
    var usersWithoutMe = users.filter(function(currentUser){ return state.user.id !== currentUser.id})
    usersWithoutMe.map(user =>  usersWrap.append('<li id=li_'+ user.id+'><a href="">' + ((user.nickname) ? user.nickname : user.id) + '</a></li>'))
    
    privateMessagesArea.empty()
   
    usersWithoutMe.map(function(user){
      var privateUserMessages = privateMessages.clone();
      privateUserMessages.find('h3').html('Private messages for: ' + ((user.nickname) ? user.nickname : user.id))
      privateUserMessages.attr("id", user.id);
      privateMessagesArea.append(privateUserMessages);
      privateMessagesArea.children().hide();
    })
   
  };
  
  
  // DOM Event Listners

  //Event listener for Messages to All.
  input.on('keydown', function(event) { // When user presses enter, event if is triggered
    if (event.keyCode != 13) {
      return;
    }
    var message = input.val();
    var messageData = {message:message, username:state.user.nickname}; // Object to save the message and the username info
    addMessage(messageData); // appends the messageData object
    socket.emit('message', messageData); // emits messageData object to the server
    input.val(''); 
  });
    
    //Event listener for Private Messages
  privateMessagesArea.on('keydown', 'input', function(event) { // When user presses enter, event if is triggered
    if (event.keyCode != 13) {
      return;
    }
    var privateDivId = $(this).parent('div').attr('id')
    console.log("this is the div id", privateDivId)
    var privateMessageData  = {message: $(this).val(), username:state.user.nickname, userId: state.user.id, privateMessageDivId: privateDivId}
    addPrivateMessageToDiv(privateMessageData)
    socket.emit('show-private-message', privateMessageData)
    $(this).val('');
  })

  // When a user starts typing. 
  socket.on('typing', function(data){
    if (data){
      typingMessage.html(data)
    }
    else{
      typingMessage.html('')
    }
  })
    
  // When user finished typing.
  input.keyup(function(){
    state.typing = true
    socket.emit('typing', state.user.nickname + ' ' + ' is typing...')
    clearTimeout(timeout)
    var timeout = setTimeout(function(){
      state.typing = false
      socket.emit('typing', false)
    }, 1000)
  });

// When a user clicks on a name
  usersWrap.on('click', "a", function(event){
    event.preventDefault()
    // aqui va el codigo para cuando alguien aplaste un nombre
    // este debe mostrar el div aplastado. y esconder los otros
    
    
    // Hide 
    var usernameClickedId = $(this).parent('li').attr('id').substring(3);
    console.log("id del elemento aplastado", usernameClickedId)
    
    privateMessagesArea.children().hide();
  
    

    // displayAndHideDivs(idPrivateDiv)
    // privateMessagesArea.children().find('idPrivateDiv').show();
    // privateMessagesArea.children(idPrivateDiv).show()
    $('#'+usernameClickedId).show()
  })
  
  // When a user enters their nickname
    usernameForm.submit(function(event){
    event.preventDefault();
    nicknameWrap.hide();
    messagesWrap.show();
    state.user['nickname'] = usernameInput.val();
    addToUserList(state.user.nickname)
    usersWrap.show();
  });
  
  
  // Listerners for server events
  
  socket.on('all-users', function (allUsers) {
    addUserList(allUsers)
    numberOfUsersConnected(allUsers.length)
  })
  
  socket.on('message', addMessage); // adds message to the div every time the server send you a message
  
  socket.on('user-has-connected', function(nickname){ //function to show a message when a user comes online
    setTimeout(fadeout, 2000)
    userConnected.html('<p>' + nickname + " " + "came online" + '</p>')
    userConnected.show()
  });
  
  socket.on('user-has-disconnected', function(nickname){ //function to show a message when a user comes online
    setTimeout(fadeout, 2000)
    userConnected.html('<p>' + nickname + " " + "went offline" + '</p>')
    userConnected.show()
  });
  
  socket.on('show-private-message', function(privateMessageData){
     
    var flip = privateMessageData.userId;
    privateMessageData.userId = privateMessageData.privateMessageDivId;
    privateMessageData.privateMessageDivId = flip
    addPrivateMessageToDiv(privateMessageData)
    privateMessagesArea.children().filter('#'+privateMessageData.privateMessageDivId).show()
  }) 
});