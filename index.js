var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var requireReadLine = require("readline");
var readline = requireReadLine.createInterface({
	input: process.stdin, output: process.stdout
});
var showCommands = "\n\tAvailable Commands\n" + '**  "displaystudents" - Lists out all students\n' +
    '**  "displaybyid" - display a student info by id\n' +
    '**  "getstudents" - Command to consume the displaystudents api\n' +
    '**  "getbyid" - Command to consume the displaybyid api\n' +
    '**   NOTE -- "YOU MUST BE CONNECTED TO THE INTERNET"\n'+
    '          -- "MAKE SURE DATA IS BROADCASTING BEFORE GETTING"\n' +
    '          ie. Display BEFORE Getting\n ' +
    '**   TO QUIT AT ANYTIME PRESS "CTRL+C" TWICE';



console.log("\n********************CLI-API********************");
console.log("\n**********************BY***********************");
console.log("\n****************HENSHAW ROWLAND****************\n");
//function call to start app
requestPort();
//function to create server and request port
//if port is in use, user will be prompted to enter a new port
function requestPort(){
	readline.question("\nPLEASE ENTER YOUR PREFFERED PORT TO CONTINUE \nPORT >>>", function(answer){
		//CHECK IF PORT IS AVAILABLE; IF AVAILABLE CREATE SERVER
		var port = answer;
		var server = app.listen(port, function(){
			displayMsg(port,server);
		});
		server.on('error',function(error){
			console.log("\nPORT IS CURRENTLY IN USE...\n TRY AGAIN!!");
			requestPort();

		});
	});
}
//function to process user input
function displayMsg(port,server){
	var host = "localhost";
	var _port = port;
	console.log("App currently running at http://%s:%s",host,_port);
	readline.question("PRESS ENTER TO CONTINUE", function(_port){
		console.log(showCommands);
		readline.setPrompt(">>>");
		readline.prompt();
		readline.on('line',function(line){
			var lineAnswer = line;
			var port = server.address().port;
			if(lineAnswer === "displaystudents"){
				showStudentsPrompt(port);
			}
			else if(lineAnswer === "displaybyid"){
				showByIdPrompt(port);
			}
			else if(lineAnswer === "getstudents"){
				console.log("Performing API get request...");
				displayStudents(port);
				readline.question(">>>");
			}
			else if(lineAnswer==="getbyid"){
				displayById(port);
			}
			else{
				console.log(lineAnswer + " - Unrecognized command!");
				readline.setPrompt(">>>");
				readline.prompt();
			}
		});
	});
}
//function to create RESTful api and broadcast all student data at GET/api/listStudents
function showStudentsPrompt(port){
	console.log("Go to http://localhost:%s/api/listStudents on your browser to view data",port);
	console.log("TIP: HIGHLIGHT THE LINK ABOVE RIGHT-CLICK AND CLICK OPEN");
	app.get('/api/listStudents',function(req,res){
		fs.readFile("students.json",'utf8',function(err,data){
			res.end(data, function(){
				console.log(showCommands);
				readline.setPrompt(">>>");
				readline.prompt();
			});
		});
	});
}
//function to create RESTful api and broadcast data by id
function showByIdPrompt(port){
	var _port = port;
	readline.question("Enter ID >>>", function(answer){
		var id = answer;
		fs.readFile("students.json","utf8",function(err,data){
			data = JSON.parse(data);
			if(data["student"+id]){
				console.log("Go to http://localhost:%s/api/listStudents/%s on your browser to view results",port,id);
				console.log("TIP: HIGHLIGHT THE LINK ABOVE RIGHT-CLICK AND CLICK OPEN");
				app.get('/api/listStudents/:id',function(request,response){

					fs.readFile("students.json",'utf8',function(err,data){
						data = JSON.parse(data);
						var student = data["student" + request.params.id];
						response.end(JSON.stringify(student),function(){
							console.log(showCommands);
							readline.setPrompt(">>>");
							readline.prompt();
						});
					});
				});
			}
			else{
					console.log("Oops! Student does not exist!! Try again!!! ");
					showByIdPrompt(_port);
			}
		});
	});
}
// function to consume api/listStudents and display in console
function displayStudents(port){
	var host = "localhost";
	var url = "http://" + host +":"+ port +"/api/listStudents";
	var request = http.get(url,function(res){
		var body = '';
		console.log("FETCHING DATA FROM http://%s:%s/api/listStudents",host,port);
		res.on('data',function(dataChunk){
			body = body + dataChunk;
			console.log(body);
			readline.setPrompt(">>>");
			readline.prompt();
		});
	});
	request.on('error', function(res){
		console.log("Oops! An error occured!!\n\t POSSIBLE FAULTS\n1.Not connected to Internet.\n2.Or Wrong command... I bet it be the first!");
	});
}
//function to consume api/listStudents/id and display in console
function displayById(port){
	readline.question("ENTER ID >>>", function(answer){
		var id = answer;
		var host = "localhost";
		var url = "http://" + host +":"+ port +"/api/listStudents/" + id;
		var request = http.get(url,function(res){
			var body = '';
			res.on('data',function(data){
				body += data;
				console.log(body);
				readline.setPrompt(">>>");
				readline.prompt();
			});

		});
	});
}


