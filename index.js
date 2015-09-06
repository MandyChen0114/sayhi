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
var fs=require("fs");
var file="sayhi.db";
var exists=fs.existsSync(file);
var sqlite3=require('sqlite3').verbose();
var db = new sqlite3.Database(file);

app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'little sun',cookie: { maxAge: 60000 }}));
app.use(cookieParser());
app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/sayhi.html');
});
var Cookies;

app.post('/chat',urlencodedParser,function(req,res){

	var username = req.body.username;
	Cookies = new cookies(req,res);
	Cookies.set("username",username,{ httpOnly: false });
	res.sendFile(__dirname + '/views/chat.html');
});


db.serialize(function(){
if(!exists){
	db.run("CREATE TABLE chatmsg (id INTEGER PRIMARY KEY AUTOINCREMENT,time TEXT,username TEXT,msg TEXT)");
	}
});

io.on('connection', function(socket){
	db.all("SELECT rowid AS id, * FROM chatmsg",function(err,rows){
		rows.forEach(function(row){
		    socket.emit('history',row);
		});
	});
	socket.on('newuser',function(newuser){
		socket.username=newuser;
		io.emit('newuser',newuser);
	});

	socket.on('new message', function(msg_data){
		io.emit('new message',msg_data);
		var stmt=db.prepare("INSERT INTO chatmsg (time,username,msg) VALUES($1,$2,$3)");
	    stmt.run([msg_data.time, msg_data.username, msg_data.msg]);
	    stmt.finalize();
	});
	socket.on('disconnect',function(){
		io.emit('userleft',socket.username);
	});

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

// db.close();
