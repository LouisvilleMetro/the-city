/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

var Config                       = require('../../config'),
    config                       = new Config(),
    util                         = require('util'),
    AlexaSkill                   = require('./alexa-skill'),
    Promise                      = require('bluebird'),
    request                      = require('request-promise'),
    _                            = require('lodash'),
    defaults                     = require('./defaults'),
    handleJunkPickUpDialogIntent = require('./intent-handlers/junk-pickup-dialog'),
    handleProvideAddressIntent   = require('./intent-handlers/provide-address'),
    handleAmazonYesIntent        = require('./intent-handlers/amazon-yes'),
    handleAmazonNoIntent         = require('./intent-handlers/amazon-no'),
    handleAmazonCancelIntent     = require('./intent-handlers/amazon-cancel');

// ----------------------- Define the skill -----------------------

module.exports = TheCitySkill;

/**
 * This is the actual skill we're going to be using.
 * @constructor
 */
function TheCitySkill() {
    AlexaSkill.call(this, config.alexa.appID);
}

// Extend AlexaSkill
util.inherits(TheCitySkill, AlexaSkill);

// ----------------------- Override request handlers -----------------------

TheCitySkill.prototype.requestHandlers.LaunchRequest = function (event, response) {
    return TheCitySkill.prototype.eventHandlers.onLaunch.call(this, event, response);
};

TheCitySkill.prototype.requestHandlers.IntentRequest = function (event, response) {
    return TheCitySkill.prototype.eventHandlers.onIntent.call(this, event, response);
};

TheCitySkill.prototype.requestHandlers.SessionEndedRequest = function (event, response) {
    return TheCitySkill.prototype.eventHandlers.onSessionEnded.call(this, event, response);
};

// ----------------------- Override event handlers -----------------------

TheCitySkill.prototype.eventHandlers.onSessionStarted = function (event) {
    //console.log("onSessionStarted requestId: " + eventRequest.requestId
    //        + ", sessionId: " + session.sessionId);

    // Add any session initialization logic here
    event.session.attributes.actions = [];
};

TheCitySkill.prototype.eventHandlers.onLaunch = function (event, response) {
    return handleWelcomeRequest(response);
};

TheCitySkill.prototype.eventHandlers.onIntent = function (event, response) {
    var request       = event.request,
        intent        = request.intent,
        intentName    = request.intent.name,
        intentHandler = TheCitySkill.prototype.intentHandlers[intentName];
    if (intentHandler) {
        return intentHandler.call(this, event, response);
    } else {
        let err = new Error(`Alexa intent [${intentName}] not supported.`);
        err.property = 'intentName';
        err.code = 10003;
        err.developerMessage = `Alexa intent [${intentName}] not supported. Verify that you are using a valid intent name`;

        throw err;
    }
};

TheCitySkill.prototype.eventHandlers.onSessionEnded = function (event, response) {
    //console.log("onSessionEnded requestId: " + event.request.requestId
    //        + ", sessionId: " + event.session.sessionId);

    // Add any logic for session cleanup logic here.
    return handleSessionEndRequest(response);
};

// ----------------------- Override intent handlers -----------------------

TheCitySkill.prototype.intentHandlers = {
    // ----------------------- Junk pickup related intents -----------------------
    JunkPickupForFullAddressIntent: function (event, response) {
        return handlePickupForFullAddressIntent(event, response);
    },
    JunkPickUpDialogIntent: function (event, response) {
        return handleJunkPickUpDialogIntent(event, response);
    },
    ProvideAddressIntent: function (event, response) {
        return handleProvideAddressIntent(event, response);
    },
    'AMAZON.YesIntent': function (event, response) {
        return handleAmazonYesIntent(event, response);
    },
    'AMAZON.NoIntent': function (event, response) {
        return handleAmazonNoIntent(event, response);
    },
    'AMAZON.CancelIntent': function (event, response) {
        return handleAmazonCancelIntent(event, response);
    }
};

// ----------------------- Business logic handlers -----------------------

function handleWelcomeRequest(response) {
    return new Promise(function (resolve) {
        var speechOutput = {
            speech: "City Services here! To start, you can say things like: Alexa, ask city services when is the next junk pickup, or Alexa, ask city" +
            " services when are they coming to pick up my junk. What can I help you with?",
            type: defaults.speechOutputType.PLAIN_TEXT
        };

        var repromptSpeech = {
            speech: "What can I help you with?",
            type: defaults.speechOutputType.PLAIN_TEXT
        };

        resolve(response.ask(speechOutput, repromptSpeech));
    });
}

function handleSessionEndRequest(response) {
    return new Promise(function (resolve) {
        var speechOutput = {
            speech: "Goodbye",
            type: defaults.speechOutputType.PLAIN_TEXT
        };

        resolve(response.tell(speechOutput, null));
    });
}