//Dependencies for NodeBB
var	fs = require('fs'),
	nconf = require('nconf'),
	user = require('../../src/user');
//Dependencies for SteamUser
var SteamUser = require('steam-user'), // Steam Bot app
	SteamTotp = require('steam-totp'); // Steam mobile authenticator handler
//Config 
var config = require('./config/config.js'),
    resource = require('./config/resource.js');
//Declarations
var client = new SteamUser(); //make a new "user instance"
var steamBot = {};

//Initial
steamBot.init = function(params, callback) {
	//Turn our bot online
	//Log in
	client.logOn({
	    "accountName": config.botAccountName,
	    "password": config.botAccountPwd,
	    "twoFactorCode": SteamTotp.generateAuthCode(config.botSharedSecret)
	});

	//Once logged in
	client.on('loggedOn', function(details) {
	    console.log('Logged into steam as ' + client.steamID.getSteam3RenderedID());
	    client.setPersona(SteamUser.Steam.EPersonaState.Online);
	});

	//If there's an error
	client.on('error', function(err) {
	    console.log(err);
	});

	//If a message is received
	client.on('friendMessage', function(steamID,message) {
		client.chatMessage(steamID,resource.responses['DefaultResponse']);
	});

	client.on('friendRelationship', function(steamID,relationship) {
	    if(relationship == SteamUser.Steam.EFriendRelationship.RequestRecipient) {
	        client.addFriend(steamID);
	    }
	});

	callback();
};


var newPostNotify = function(steamID,respondingUser,siteURL,topicID) {
	client.chatMessage(steamID, respondingUser + ' replied to the topic you\'re subscribed to at ' + siteURL + '/topic/' + topicID );
}

var newFollowNotify = function(steamID,followingUser,siteURL) {
	client.chatMessage(steamID, followingUser + ' is now following you!' + ' (Check your notifications at (' + siteURL + ' )'  );
}

var newUpvoteNotify = function(steamID,upvotingUser,topicName,siteURL) {
	client.chatMessage(steamID, upvotingUser + ' has upvoted your post in "' + topicName + '"' + '(Check your notifications at (' + siteURL + ' )'  );
}

var newMentionNotify = function(steamID,mentioningUser,siteURL,topicID,topicName) {
	client.chatMessage(steamID, mentioningUser + ' has mentioned you at ' + siteURL + '/topic/' + topicID + ' (' + topicName + ')');
}

//On new notification push
steamBot.sendNotification = function(response, callback) {
	//list of user IDs.
	var IDList = response.uids;

	IDList.forEach(function(userID) {
		user.getUserField(userID, 'int-steam-id', function(err, data) {
			if (err) {
				console.log(err);
				return(err,null);
			}

			//If data is undefined, do nothing. Pass along profile Info as is.
			if (data == null) {
				return callback(null,null);
			//send our user a message
			} else {
				var userSteamID = data;
				var siteURL = nconf.get('url');

				var bodyShortSplit = response.notification.bodyShort,
				    bodyShort = bodyShortSplit.slice(2,bodyShortSplit.length-2).split(', '),
				    notificationType = bodyShort[0];

				switch(notificationType) {
					//A post in a topic - notifications:user_posted_to
					case 'notifications:user_posted_to':
						var respondingUserName = bodyShort[1];
						var topicID = response.notification.tid;

						newPostNotify(userSteamID,respondingUserName,siteURL,topicID);
						break;
					//User follows you - notifications:user_started_following_you
					case 'notifications:user_started_following_you':
						var followingUserName = bodyShort[1];
						newFollowNotify(userSteamID,followingUserName,siteURL);
						break;
					//User mentions you - mentions:user_mentioned_you_in
					case 'mentions:user_mentioned_you_in':
						var mentioningUser = bodyShort[1];
						var topicName = bodyShort[2];
						var topicID = response.notification.tid;

						newMentionNotify(userSteamID,mentioningUser,siteURL,topicID,topicName);
						break;
					case 'notifications:upvoted_your_post_in':
						var upvotingUser = bodyShort[1];
						var topicName = bodyShort[2];

						newUpvoteNotify(userSteamID,upvotingUser,topicName,siteURL);
						break;
					default: 
						break;
				}
			}
		});	
	});
};




module.exports = steamBot;
