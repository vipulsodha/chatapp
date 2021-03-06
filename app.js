var express = require('express'),
	app =  express(),
 	server = require('http').createServer(app),
 	io = require('socket.io').listen(server),
 	ejs = require('ejs');
 	users = {},
 	server.listen(9000),
 	mongoose = require('mongoose');
personal_nickname ={};
io.set('log level', 2);
mongoose.connect('mongodb://localhost/chat' , function(error){

if(error){
	console.log(error);
}
else{
	console.log('mongodb connected :)');
}

});
var dbSchema = mongoose.Schema({
	nickname: String,
	msg : String,
	created : {type : Date , default: Date.now}
});

var chatModel = mongoose.model('message',dbSchema);

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}


 	app.get('/',function(req,res){

		res.render(__dirname + '/index.ejs');

 	});

var my_nickname = '';
app.set('view engine', 'ejs');


 io.sockets.on('connection',function(socket){
 	chatModel.find({},function(error , data){
 		if(error)
 			throw error;
 		else
 			console.log(data);

 	});
	console.log('Client Joined ...\n');


var patt = new RegExp(/\W@\w/);
socket.on('send_message',function(data,callback){
		msg = data.trim();
		if(msg.substr(0,1) === '@')
		{
			
			msg = msg.substr(1);
			
			ind = msg.indexOf(' ');
			username = msg.substr(0,ind);
			username = username.trim();
			username = username.toLowerCase();
			msg = msg.substr(ind);
			if(ind !== -1)
			{

			console.log('private message  |  username : ' + username + ' message : ' + msg);				
				if(username in users)
				{callback('user found');
					console.log('User in List');
					users[username].emit('private_message',{nickname : socket.nickname , message : msg});
				}
				else
				{
					callback('User not on server');
					console.log('user not found');
				}
			}
			else
			{
				callback('please enter a message');
				console.log('Please enter a message !! ');

			}
		}
		else if(msg.match(patt))
		{
			msg +=" ";
			var n = msg.search(patt);
	msg = msg.replaceAt(n+1," ");
	username = msg.substr(n+2);
	temp_index = username.indexOf(' ');
	username= username.substr(0,temp_index);
	msg = msg.trim();
	if(username in users)
				{callback('user found');
					console.log('User in List');
					users[username].emit('private_message',{nickname : socket.nickname , message : msg});
				}
				else
				{
					callback('User not on server');
					console.log('user not found');
				}

		}
		else
		{
			var newMessage = new chatModel({msg:msg , nickname : socket.nickname});
			newMessage.save(function(error){
				if(error)
					throw error;
				else
					console.log("saved to database");

			});
			
		console.log(socket.nickname + " : " + data);
		io.sockets.emit('new_message',{nickname: socket.nickname , message : msg});
		}

	});


socket.on('personal_chat' ,function(data,callback){
console.log(data.message +" to  : " + data.to);
users[data.to].emit('personal_chat' , {message  :data.message , from :socket.nickname});
callback(true);

});


	socket.on('new_user',function(data,callback){
		console.log('username : ' + data);
		data = data.trim();
		data = data.toLowerCase();
		if(data in users)
		{
			console.log("clallback false");
			callback(false);
		}
		else
		{
			callback(true);
			console.log("clallback true");
			socket.nickname  = data;
			my_nickname = data;
			console.log('nick name in socket registered  ' + socket.nickname);
 
			io.sockets.emit('user_noti' , {username : socket.nickname , message : 'joined...'});
			users[socket.nickname] = socket;
			io.sockets.emit('username',Object.keys(users));
			console.log(Object.keys(users));

		}

	});

	socket.on('disconnect' , function(data){
		if (!socket.nickname)return;
		else{
			delete users[socket.nickname];
			io.sockets.emit('username',Object.keys(users));
			io.sockets.emit('user_noti',{username : socket.nickname , message : ' disconnected ... '});
			console.log(socket.nickname + 'disconnected....');
		}

	});

//personal chat startes
/*
app.get('/personal_chat/:nickname' , function(req, res){

if(req.params.nickname in users)
{
//personal_nickname[req.params.nickname]  = users[req.params.nickname] ;
res.render(__dirname + '/personal_chat.ejs' , {username : req.params.nickname });
console.log('got a user for personal_chat ' + req.params.nickname + ' with ' + my_nickname);
users[req.params.nickname].emit('personal_message_window', my_nickname);

}
else
{
	res.render(__dirname + '/personal_chat.ejs' , {username : 'user not on list sorry' });
	console.log('user does not exist');
}
});
*/
//personal cht ends

 	});
