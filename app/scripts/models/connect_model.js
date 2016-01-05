define([
	'backbone'
], function (
	Backbone
) {
	'use strict';
	return Backbone.Model.extend({

		defaults: {
			'playerId': null,
			'name':'',
			'opponentId': null
		},

		url: 'http://localhost:9000/api/player'
	});
});
