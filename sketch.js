var socket;
var url = '10.0.1.2';
var port = 3000;



var accelerationX;
var accelerationY;
var accelerationZ;

	window.ondevicemotion = function(event){
		accelerationX = event.accelerationIncludingGravity.x;
		accelerationY = event.accelerationIncludingGravity.y;
		accelerationZ = event.accelerationIncludingGravity.z;


	}


function setup(){
socket = io.connect(url+':'+port);
}

function draw(){


		socket.emit('toScreen', {xVal:accelerationX, yVal:accelerationY, zVal:accelerationZ})

	
	document.getElementById("tag").innerHTML = accelerationX;
	document.getElementById("tag2").innerHTML = accelerationY;
	document.getElementById("tag3").innerHTML = accelerationZ;

	

}