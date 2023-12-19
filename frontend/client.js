//Establishing a connection with the server on port 3000
//const socket = io('http://localhost:3000');

//heroku server
const socket = io("https://murdermysterysite.fly.dev/");

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

socket.on("makeHost", async () => {
  hideRoomValues()
  makeHost();
  isHost = true;
});
socket.on("denyHost", async () => {
  console.log('Host is already taken')
  document.getElementById('hostAlert').style.display='block'
  isHost = false;
});

socket.on("getCharacter", (imageSrc) => {
  console.log('Got Character Image')
  document.getElementById('image').src = imageSrc
})

startButton.addEventListener('click', async () => {  
      await generateHostTable();
      socket.emit('gameStarted', chosenRoom)
})

hostButton.addEventListener('click', () => { 
  chosenRoom = document.getElementById('roomNum').value;
  if (chosenRoom === ""){console.log('No Room to join');} 
  else{
    socket.emit('requestHost', chosenRoom);
  }
})

joinButton.addEventListener('click', async () => { 
    await joinRoom();
  })

characterIdSubmit.addEventListener('click', () => {
    var characterId = document.getElementById('characterId').value
    console.log('clicked button')
    //socket.emit('characterRequest', characterId)

    fetch(`/getImage?id=${characterId}&room=${chosenRoom}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      return response.blob();
    })
    .then(blob => {
      // Create an object URL for the blob
      const objectURL = URL.createObjectURL(blob);
      // Set the image source
      document.getElementById('image').src = objectURL;
      document.getElementById('image1').hidden = false;
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });

    //Send value to Server
    //Server will emit socket response with the PDF page number
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
  document.getElementById("characterIdForm").hidden = false;
  document.getElementById("characterIdSubmit").hidden = false;


  //Reveals the logoutButton button and the logout button
  document.getElementById("logoutButton").hidden = false;
  document.getElementById("countOfUsers").hidden = false;

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
  document.getElementById("characterIdForm").hidden = true;
  document.getElementById("characterIdSubmit").hidden = true;
  document.getElementById('hostDiv').hidden = true;
  document.getElementById('hostTableBody').innerHTML = '';
  document.getElementById('image').hidden = true;
  document.getElementById('image1').hidden = true;

}

function makeHost(){
  document.getElementById("startButton").hidden = false;
  document.getElementById("characterIdForm").hidden = true;
  document.getElementById("characterIdSubmit").hidden = true;
}

async function generateHostTable(){
  console.log('Generating table')

  let result = await fetch(`/getCharacters?id=${chosenRoom}&host=${isHost}`)
  const characterDictionary = await result.json();
  let table = document.getElementById('hostTable').getElementsByTagName('tbody')[0];

  for (const [key, value] of Object.entries(characterDictionary)) {
    row = table.insertRow();

    characterCell = row.insertCell();
    idCell = row.insertCell();
    part2IdCell = row.insertCell();
    characterCell.textContent = key;
    idCell.textContent = value[0]
    part2IdCell.textContent = value[1]
  }

  document.getElementById('hostDiv').hidden = false;
  document.getElementById('startButton').hidden = true;
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

document.getElementById('download').addEventListener('click', function() {
  var link = document.createElement('a');
  link.href = document.getElementById('image').src // Replace with your PDF file path
  link.download = link.href; // Replace with desired file name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});