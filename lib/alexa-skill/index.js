/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

var Config     = require('../../config'),
    config     = new Config(),
    util       = require('util'),
    AlexaSkill = require('./alexa-skill');

module.exports = TheCitySkill;

/**
 * This is the actual skill we're going to be using.
 * @constructor
 */
function TheCitySkill() {
    AlexaSkill.call(this, config.alexa.appID);
}

util.inherits(TheCitySkill, AlexaSkill);

/*
 * Override the request handlers
 */
/**
 * Need to override to use promises in the handlers.
 *
 * @param event The request
 * @returns {Promise}
 * @constructor
 */
TheCitySkill.prototype.requestHandlers.IntentRequest = function (event, response) {
    return TheCitySkill.prototype.eventHandlers.onIntent.call(this, event, response);
};

/*
 *   Override the event handlers
 */
TheCitySkill.prototype.eventHandlers.onSessionStarted = function (event, response) {
    console.log("onSessionStarted requestId: " + event.request.requestId
            + ", sessionId: " + event.session.sessionId);

    // Add logic to initialize the session here.
};

TheCitySkill.prototype.eventHandlers.onLaunch = function (event, response) {
    var speechOutput = {
        speech: "Your city here! I can provide you with information about the city services. You can say things like: Alexa, ask the city when is the next trash pickup or... Alexa, ask the" +
        " city what is the air quality. What can I help you with?",
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    var repromptSpeech = {
        speech: "What can I help you with?",
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    response.ask(speechOutput, repromptSpeech);
};

TheCitySkill.prototype.eventHandlers.onIntent = function (event, response) {
    "use strict";
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
    console.log("onSessionEnded requestId: " + event.request.requestId
            + ", sessionId: " + event.session.sessionId);

    //Add logic for session cleanup logic here.
};

/*
 * Override the intent handlers
 */
TheCitySkill.prototype.intentHandlers = {
    RubbishPickup: function (event, response) {
        return rubbishPickupAPI.query(config.rubbishPickupAPI.address, config.rubbishPickupAPI.city)
                .then(function (result) {
                    // Process the response as appropriate and return the result
                    let speechOutput = {
                        speech: `The next trash pickup will happen on ${result[0].GarbageDay} and the yard waste recycle day is on ${result[0].YardWasteRecycleDay}}`,
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };

                    return response.tell(speechOutput);
                });
    }
};