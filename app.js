var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var express = require('express');
// npm install 

var port = process.env.PORT || 80; // Required for Heroku

var app = express();

app.use(express.json());

function getBoardName(i, j) {
	var name = '';
	if (i == 0) {
		name += 'A';
	}
	else if (i == 1) {
		name += 'B';
	}
	else if (i == 2) {
		name += 'C';
	}
	name += (j+1)+'';
	return name;
}

// Easy Strategy
function randomChoice(board) {
	//console.log('Random choice');
	var choice = '';
	var tries = 0;
	while (tries < 10) {
		var rnd = Math.floor(Math.random()*9);
		var i = Math.floor(rnd / 3);
		var j = rnd % 3;
		if (board[i][j] == 0) {
			choice = getBoardName(i, j);
			break;
		}
		tries++;
	}
	if (choice == '') {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				if (board[i][j] == 0) {
					choice = getBoardName(i, j);
					break;
				}
			}
		}
	}
	return choice;
}

// Medium Strategy
function blockStrategy(board) {
	var value = 2;
	//console.log(board);
	while (value > 0) {
		// Win if you can
		if ((board[0][1] == value && board[0][2] == value) || (board[1][0] == value && board[2][0] == value) || (board[1][1] == value && board[2][2] == value)) {
			if (board[0][0] == 0) { return 'A1'; }
		}
		if ((board[0][0] == value && board[0][2] == value) || (board[1][1] == value && board[2][1] == value)) {
			if (board[0][1] == 0) { return 'A2'; }
		}
		if ((board[0][0] == value && board[0][1] == value) || (board[1][2] == value && board[2][2] == value) || (board[2][0] == value && board[1][1] == value)) {
			if (board[0][2] == 0) { return 'A3'; }
		}
		if ((board[0][0] == value && board[2][0] == value) || (board[1][1] == value && board[1][2] == value)) {
			if (board[1][0] == 0) { return 'B1'; }
		}
		if ((board[0][0] == value && board[2][2] == value) || (board[0][1] == value && board[2][1] == value) || (board[1][0] == value && board[1][2] == value) || (board[2][0] == value && board[0][2] == value)) {
			if (board[1][1] == 0) { return 'B2'; }
		}
		if ((board[0][2] == value && board[2][2] == value) || (board[1][0] == value && board[1][1] == value)) {
			if (board[1][2] == 0) { return 'B3'; }
		}
		if ((board[0][0] == value && board[1][0] == value) || (board[0][2] == value && board[1][1] == value) || (board[2][1] == value && board[2][2] == value)) {
			if (board[2][0] == 0) { return 'C1'; }
		}
		if ((board[0][1] == value && board[1][1] == value) || (board[2][0] == value && board[2][2] == value)) {
			if (board[2][1] == 0) { return 'C2'; }
		}
		if ((board[0][2] == value && board[1][2] == value) || (board[0][0] == value && board[1][1] == value) || (board[2][0] == value && board[2][1] == value)) {
			if (board[2][2] == 0) { return 'C3'; }
		}
		// Otherwise block if you can
		value--;
	}
	// Otherwise just move randomly
	return randomChoice(board);
}

// Hard Strategies
function XStrategy(board, turnCount) {
	if (turnCount == 1) {
		return 'A1';
	}
	else if (turnCount == 3) {
		if (board[0][1] == 1 || board[1][0] == 1 || board[1][2] == 1 || board[2][1] == 1) {
			return 'B2';
		}
		else if (board[1][1] == 1) {
			return 'C3';
		}
		else if (board[2][0] == 1 || board[2][2] == 1) {
			return 'A3';
		}
		else if (board[0][2] == 1) {
			return 'C1';
		}
	}
	else if (turnCount == 5) {
		if (board[1][1] == 2 && board[2][2] == 1 && (board[1][0] == 1 || board[1][2] == 1)) {
			return 'A3';
		}
		else if (board[1][1] == 2 && board[2][2] == 1 && (board[0][1] == 1 || board[2][1] == 1)) {
			return 'C1';
		}
		else if (board[0][2] == 2 && board[0][1] == 1 && board[2][0] == 1) {
			return 'C3';
		}
		else if (board[0][2] == 2 && board[0][1] == 1 && board[2][2] == 1) {
			return 'C1';
		}
		else if (board[2][0] == 2 && board[0][2] == 1 && board[1][0] == 1) {
			return 'C3';
		}
	}
	return blockStrategy(board);
}

function OStrategy(board, turnCount) {
	if (board[1][1] == 1) {
		// Corner
		if (turnCount == 2) {
			return 'A1';
		}
		else if (turnCount == 4 && board[2][2] == 1) {
			return 'C1';
		}
		else if (turnCount == 6) {
			if (board[2][1] == 2 && board[2][2] == 1) {
				return 'C1';
			}
			else if (board[1][1] == 3 && board[2][2] == 1) {
				return 'A3';
			}
		}
	}
	else {
		// Center
		if (turnCount == 2) {
			return 'B2';
		}
		else if (turnCount == 4) {
			if (board[0][0] == 1 && (board[1][2] == 1 || board[2][1] == 1)) {
				return 'C3';
			}
			else if (board[0][2] == 1 && (board[1][0] == 1 || board[2][1] == 1)) {
				return 'C1';
			}
			else if (board[2][0] == 1 && (board[0][1] == 1 || board[1][2] == 1)) {
				return 'A3';
			}
			else if (board[2][2] == 1 && (board[0][1] == 1 || board[1][0] == 1)) {
				return 'A1';
			}
			else if (((board[0][0] == 1 && board[2][2] == 1) || (board[0][2] == 1 && board[2][0] == 1) || (board[1][0] == 1 && board[1][2] == 1))) {
				return 'A2';
			}
			else if (board[0][1] == 1 && board[2][1] == 1) {
				return 'B1';
			}
		}
		else if (turnCount == 6) {
			if ((board[0][0] == 1 && board[2][0] == 1 && board[1][2] == 1 && board[0][1] == 2) || (board[0][2] == 1 && board[2][2] == 1 && board[1][0] == 1 && board[1][2] == 2)) {
				return 'A2';
			}
			else if ((board[0][0] == 1 && board[0][2] == 1 && board[2][1] == 1 && board[0][1] == 2) || (board[2][0] == 1 && board[2][2] == 1 && board[0][1] == 1 && board[2][1] == 2)) {
				return 'B1';
			}
			else if ((board[0][0] == 1 && board[1][2] == 1 && board[2][1] == 1 && board[2][2] == 2) || (board[0][1] == 1 && board[1][0] == 1 && board[2][2] == 1 && board[0][0] == 2)) {
				return 'A3';
			}
			else if ((board[0][2] == 1 && board[1][0] == 1 && board[2][1] == 1 && board[2][0] == 2) || (board[0][1] == 1 && board[1][2] == 1 && board[2][0] == 1 && board[0][2] == 2)) {
				return 'A1';
			}
			else if ((board[1][0] == 1 && board[1][2] == 1 && board[2][1] == 1 && board[0][1] == 2) || (board[0][1] == 1 && board[1][2] == 1 && board[2][1] == 1 && board[1][0] == 2)) {
				return 'A1';
			}
			else if ((board[0][1] == 1 && board[1][0] == 1 && board[2][1] == 1 && board[1][2] == 2) || (board[0][1] == 1 && board[1][0] == 1 && board[1][2] == 1 && board[2][1] == 2)) {
				return 'C3';
			}
		}
	}
	return blockStrategy(board);
}

function createResponse(move) {
	projectID = 'seanoneil-sandbox';
	locationID = 'global';
	agentID = 'dc33f3d1-ee94-4351-8c5e-014096b590e6';
	flowID = '00000000-0000-0000-0000-000000000000';
	pageID = '';
	if (move == 'A1') {
		pageID = 'e94a2649-ccc6-477b-85c8-2d4fcac3c0c5';
	}
	else if (move == 'A2') {
		pageID = '97c41bca-6877-439b-8d23-31fc46bb7ee4';
	}
	else if (move == 'A3') {
		pageID = '9d63453a-1bb2-428d-9584-70e0f35b30f0';
	}
	else if (move == 'B1') {
		pageID = 'be372a5a-20e0-4eda-a9f4-59dd93ecf494';
	}
	else if (move == 'B2') {
		pageID = '9f21c8e0-53a0-487f-afde-11bb76966486';
	}
	else if (move == 'B3') {
		pageID = 'dc0d0da6-f90c-492f-ad9a-273d2fd2a196';
	}
	else if (move == 'C1') {
		pageID = '6e383136-ddff-4ce7-8e7d-2119c325b7f6';
	}
	else if (move == 'C2') {
		pageID = '3ecf9a68-ea21-4ca6-b37e-8c7eea186a56';
	}
	else if (move == 'C3') {
		pageID = '1543eb37-ab1e-45ae-ba9e-0bc5b4359410';
	}
	res =
	{
		"payload": {},
		"targetPage": "projects/"+projectID+"/locations/"+locationID+"/agents/"+agentID+"/flows/"+flowID+"/pages/"+pageID,
	};
	console.log(JSON.stringify(res));
	return JSON.stringify(res);
}

app.post('/ai', function(req, res) {
	var params = req.body.sessionInfo.parameters;
	//console.log(params);
	var board = [[parseInt(params.a1), parseInt(params.a2), parseInt(params.a3)], [parseInt(params.b1), parseInt(params.b2), parseInt(params.b3)], [parseInt(params.c1), parseInt(params.c2), parseInt(params.c3)]];
	var turnCount = parseInt(params.turnCount);
	var startingPlayer = params.startingPlayer;
	var difficulty = params.diff;
	var move = '';
	if (difficulty == 'easy') {
		move = randomChoice(board);
	}
	else if (difficulty == 'medium') {
		move = blockStrategy(board);
	}
	else if (difficulty == 'hard') {
		if (startingPlayer == 'Human') {
			move = OStrategy(board, turnCount);
		}
		else if (startingPlayer == 'AI') {
			move = XStrategy(board, turnCount);
		}
	}
	if (move == '') {
		//move = randomChoice(board)
		res.writeHead(500);
		res.end(move);
		console.log('Move was not chosen');
	}
	else {
		res.writeHead(200);
		res.end(createResponse(move));
		console.log('Responded '+move);
	}
});

app.post('/wake', function(req, res) {
	res.writeHead(200);
	res.end('ok');
});

app.listen(port);
