const express = require('express');
const app = express();
var cors = require('cors')

app.use(cors())

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", '*');
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
//   if (req.method === 'OPTIONS') {

//     res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, OPTIONS');
//     res.header('Access-Control-Max-Age', 120);
//     return res.status(200).json({});
// }
//   next();
// });


//Allow for CORS to get in
// app.all('*', function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });
app.get('/', (req, res) => {
  res.sendFile('/frontend/', {root: __dirname });

});

// Define a route to handle image requests
app.get('/getImage', (req, res) => {
  // Get the image number from the query parameter (default to 1)
  const imageNumber = req.query.id || 1;
  var imagePath;
  console.log(imageNumber)
  if (imageNumber == 1){
    imagePath = path.join(__dirname, 'assets', "CassandraAdkins.jpg");
  }
  else if(imageNumber == 2){
    imagePath = path.join(__dirname, 'assets', "LilianErikson.jpg")
  }
  else{
    return res.status(404).send('Image not found');
  }
  console.log(imagePath)
  
  res.sendFile(imagePath);
});

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server,{
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    allowedHeaders: ['Access-Control-Allow-Private-Network: true', 'Access-Control-Allow-Origin: *'],

  },
})

var path = require('path');

const { count } = require('console');


//Send over the frontend information to the client side.
var htmlPath = path.join(__dirname, 'frontend');
app.use(express.static(htmlPath)) 


//Socket commands from client
var roomHosts = {};
var roomLocation = {};


//app.use(cors())
//app.options('*', cors())


var roomCount = {}; 
io.on("connection", socket => {

  //If error connecting to client, reports error to Server
  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("requestHost", async data => {
    await requestHost(socket, data);
  })

  socket.on("joinRoom", async data => {
    await joinRoom(socket, data);
  })

  socket.on('gameStarted', (chosenRoom) => {
    console.log('Game has been started')
  })

  socket.on('characterRequest', (characterId) =>{
    //Check the ID to the character
    console.log('In here')
    //io.to(socket.id).emit('getCharacter', 'assets/CassandraAdkins.jpg')
  })

  socket.on('logoutRoom', async () => {
    await logoutRoom(socket);
  })

  socket.on('disconnect', async data => {
    await userDisconnect(socket, data);
  })

});


server.listen(process.env.PORT || 3000, () => {
  console.log(`listening on *:${process.env.PORT || 3000}`);
});


async function joinRoom(socket, data){
    console.log(socket.id + ' is joining socket: ' + data);
    socket.join(data);
}

async function requestHost(socket, data){
    console.log(socket.id + ' is requesting to host socket: ' + data);
    if (Object.values(roomHosts).includes(data)) console.log("Host is already taken")    
    else{
        console.log("Creating new host")
        socket.join(data);
        roomLocation[String(socket.id)] = data
        roomHosts[socket.id] = data
        io.to(socket.id).emit('makeHost');
    }
}

async function logoutRoom(socket){
    //Leaves the socket and removes from logging
    socket.leave(roomLocation[socket.id])
    delete roomLocation[socket.id]
    if (Object.keys(roomHosts).includes(socket.id)) delete roomHosts[socket.id]
}

async function userDisconnect(socket){
    //Removes the user from record of active connected rooms
    if (roomLocation[socket.id]){
        console.log(socket.id + ' has disconnected from socket: ' + roomLocation[socket.id]);
        delete roomLocation[socket.id]
        if (Object.keys(roomHosts).includes(socket.id)) delete roomHosts[socket.id]
    }

}