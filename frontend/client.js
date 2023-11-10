//Establishing a connection with the server on port 3000
const socket = io('http://localhost:3000');

//heroku server
//const socket = io("https://serene-peak-32376.herokuapp.com/");

var chosenRoom;
var currentBackground;
var isHost = false;

socket.on("connect", () => {
  console.log('Connected to socket!')
});

// handle the event sent with socket.send()
socket.on("message", data => {
  console.log(data);
});

socket.on("makeHost", () => {
  document.getElementById("startButton").hidden = false;
  isHost = true;
});

startButton.addEventListener('click', () => {  
      socket.emit('gameStarted', chosenRoom)
})

hostButton.addEventListener('click', () => { 
  chosenRoom = document.getElementById('roomNum').value;
  if (chosenRoom === ""){console.log('No Room to join');} 
  else{
    socket.emit('requestHost', chosenRoom);
    hideRoomValues();
  }
})

joinButton.addEventListener('click', async () => { 
    await joinRoom();
  })

logoutButton.addEventListener('click', async () => { 
    await logout();
    backToMainScreen();
})

//Hides the room submission values when client joins a room
function hideRoomValues(){
  document.getElementById("hostButton").hidden = true;
  document.getElementById("joinButton").hidden = true;
  document.getElementById("roomLabel").hidden = true; 
  document.getElementById("roomNum").hidden = true;

  //Displays the Active Room number
  document.getElementById("activeRoom").hidden = false;
  document.getElementById("activeRoom").innerHTML = "Room Name: " + String(chosenRoom);

  //Reveals the logoutButton button and the logout button
  document.getElementById("logoutButton").hidden = false;
  document.getElementById("countOfUsers").hidden = false;

  //Reveals the role card container
  // document.getElementById("roleCardContainer").style.display = "flex";
}

function backToMainScreen(){
  //Reveals the room submission
  document.getElementById("hostButton").hidden = false;
  document.getElementById("joinButton").hidden = false;
  document.getElementById("roomLabel").hidden = false; 
  document.getElementById("roomNum").hidden = false;

  //Displays the Active Room number
  document.getElementById("activeRoom").hidden = true;
  document.getElementById("activeRoom").innerHTML = "Room Name: " + String(chosenRoom);

  //Reveals the switch button and the logout button
  document.getElementById("startButton").hidden = true;
  document.getElementById("logoutButton").hidden = true;
  document.getElementById("countOfUsers").hidden = true;

}

async function joinRoom()
{
    //Grabbing the room value from input
    chosenRoom = document.getElementById('roomNum').value;
    //Checks whether the input has any value:
    if (chosenRoom === ""){console.log('No Room to join');} 
    else{
      //Sending room value to join that socket
      socket.emit('joinRoom', chosenRoom);
      hideRoomValues();
    }
}

async function logout(){
    console.log('Logging out of the room')
    socket.emit('logoutRoom', chosenRoom);
}