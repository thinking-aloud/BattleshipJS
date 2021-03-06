'use strict';

var init = require('./controller/init.controller');
var game = require('./controller/game.controller');
var util = require('./controller/util');


module.exports.init = function (io) {
	var nsp = io.of('/init');

	nsp.on('connection', function (socket) {
		console.log('Player ' + socket.id + ' connected!');

		init.createPlayer(socket, nsp);

		socket.on('createSession', function (data) {
			init.createSession(socket, nsp, data.opponentId, function (sessionId) {
				createGame(io, sessionId);
			});
		});

		socket.on('disconnect', function () {
			console.log('Player', socket.id, 'disconnected');
			util.deletePlayer(socket.id);
		});
	});
};

var createGame = function (io, sessionId) {
	var nsp = io.of('/' + sessionId);

	nsp.on('connection', function (socket) {

		console.log('Player ' + socket.id + ' connected! (' + socket.server.eio.clientsCount + ' players)');

		socket.emit('welcome', 'welcome to the game, please place your ships!');

		socket.on('setShips', function (ships) {
			game.setShips(socket, nsp, ships, function () {
				util.areAllPlayersReady(sessionId, function () {
					util.getPlayerWithTurn(sessionId, function (player) {
						socket.to(player.socketId).emit('turn', 'Your turn, happy shooting!');
					});
				});
			});
		});

		socket.on('shoot', function (target) {
			game.shoot(sessionId, socket.id, target, function (result) {
				if (!result) {
					console.log('Player left, game ended');
					socket.emit('shoot', 'Sorry, you can\'t shoot because your opponent left the game.');
				} else {
					socket.emit('shoot', result);
					game.changeTurn(sessionId, socket.id, function (socketId) {
						socket.to(socketId).emit('turn', 'Your turn, happy shooting!');
					});
				}
			});
		});

		socket.on('disconnect', function () {
			console.log('Player', socket.id, 'disconnected');
			socket.broadcast.emit('playerLeft', 'Your opponent disconnected');
			util.deletePlayer(socket.id);
		});
	});
};
