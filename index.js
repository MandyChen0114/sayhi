var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var users = {};
var cookies = require( "cookies" );
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'little sun',cookie: { maxAge: 60000 }}));
app.use(cookieParser());
app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/sayhi.html');
});
var Cookies;

app.post('/chat',urlencodedParser,function(req,res){

	username = req.body.username;
	Cookies = new cookies(req,res);
	Cookies.set("username",username,{ httpOnly: false });
	res.sendFile(__dirname + '/views/chat.html');
});


io.on('connection', function(socket){
	socket.on('msg_username',function(msg_username){
		io.emit('msg_username',msg_username);
	});
	socket.on('new message', function(msg){
		io.emit('new message',msg);
	});

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});


