var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = 3000;
var url = 'localhost'
var server = app.listen(port);
var io = require("socket.io").listen(server);
var mobileDetect = require('mobile-detect');

var device;
var rooms = [];
var paired;

var forewardBackward, sideSide, upDown;


//check if computer or phone
app.get('/', function(req, res, next){
	console.log('getting device type');
	var md = new mobileDetect(req.headers['user-agent']);
	console.log(md.ua);
	console.log(md.ua.indexOf('iPhone'));

	if(md.ua.indexOf('iPhone') !== -1 || md.ua.indexOf('Android') !== -1) {
		console.log('A PHONE HAS BEEN CONNECTED');
		device = 'm';
	} else {
		console.log('A COMPUTER HAS CONNECTED');
		device = 'd';
	}

	next();


});

//make rooms
var deskObjX = {
	id: 1,  //get id from client
	members: [],
	paired: false
}
rooms.push(deskObjX);

var deskObjY = {
	id: 2,  //get id from client
	members: [],
	paired: false
}
rooms.push(deskObjY);

var deskObjZ = {
	id: 3,  //get id from client
	members: [],
	paired: false
}
rooms.push(deskObjZ);


//create server instance with both clients
app.use(express.static(__dirname + ''));
app.use('/inside',express.static(__dirname + ''));
app.use('/reload',express.static(__dirname + ''));
console.log('Simple static server listening at '+url+':'+port);



//open socket connection
io.on('connection', function(socket){

	console.log('connected to socket');

	//send greeting to client with id and device type
	socket.emit('greet',{
		message: 'Hello from the server side!',
		id: socket.id,
		d:device
	});


	socket.on('newPhone', function(data){

		console.log(data);

		//if device = 'm'
		if(data.device == 'm'){
			var count = 0;

			//loop through rooms and check which is empty
			for(var i = 0; i < rooms.length; i++){

				console.log('looking for empty room');

				//add device (with socket id) to the first empty room
				if(rooms[i].members.length == 0){
					console.log('found room');

					socket.join(rooms[i].id);

					//add phonedevice to room
					rooms[i].members.push(socket.id);

					console.log('successfully added phone to '+ rooms[i].id);

					//send success message back to client
					socket.emit('phone access', {
						msg: 'successfully added phone to a room!',
						id: rooms[i].id
					});

					break;

				}else if(rooms[i].members.length == 1){
					count++;

					if(count >= 3){
						socket.emit('no room', {
							msg:'true'
						})
					}
				}
			}
		}
	})


	//capture all values from seperate rooms
	socket.on('toScreenZ', function(data){
		upDown = data.xVal;
		console.log(upDown);
	})

	socket.on('toScreenX', function(data){
		forewardBackward = data.xVal;
		console.log(forewardBackward);
	})

	socket.on('toScreenY', function(data){
		sideSide = data.yVal;
		console.log(sideSide);
	})



	//send all values to three.js sketch
    var interval = setInterval(function () {
        socket.emit('toConsole', {x:forewardBackward, y:sideSide, z:upDown});
    }, 100);


	//on disconnect from socket
	socket.on('disconnect', function(){
		console.log('Got disconnected!');
		console.log(socket.id);

		//look through the rooms
		for(var i = 0; i < rooms.length; i++){

			//check if the id in each room matches the disconnected id
			if(rooms[i].members[0] == socket.id){
				console.log(rooms[i].id);

				//remove id from array in that room
				rooms[i].members.splice(0, 1);

				////reset values after disconnect
				if(i == 0){
					forewardBackward = 0;
					//z = 0;
				}else if(i == 1){
					sideSide = 0;
					//x = 0;
				}else if(i == 2){
					upDown = 0;
					//y = 0;
				}

			}
		}
	})


});



