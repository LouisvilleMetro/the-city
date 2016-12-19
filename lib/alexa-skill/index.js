/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

var Config     = require('../../config'),
    config     = new Config(),
    util       = require('util'),
    AlexaSkill = require('./alexa-skill'),
    Promise    = require('bluebird'),
    request    = require('request-promise');

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

// ----------------------- Override event handlers -----------------------

TheCitySkill.prototype.eventHandlers.onSessionStarted = function (eventRequest, session) {
    //console.log("onSessionStarted requestId: " + eventRequest.requestId
    //        + ", sessionId: " + session.sessionId);

    // Add any session initialization logic here
};

TheCitySkill.prototype.eventHandlers.onLaunch = function (event, response) {
    handleWelcomeRequest(response);
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
    ProvideZipCodeIntent: function (event, response) {
        return handleProvideZipCodeIntent(event, response);
    }
};

// ----------------------- Business logic handlers -----------------------

function handleWelcomeRequest(response) {
    return new Promise(function (resolve) {
        var speechOutput = {
            speech: "Your city here! I can provide you with information about the city services. You can say things like: Alexa, ask the city when is the next trash pickup or... Alexa, ask the" +
            " city what is the air quality. What can I help you with?",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        var repromptSpeech = {
            speech: "What can I help you with?",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        resolve(response.ask(speechOutput, repromptSpeech));
    });
}

//function handleJunkPickUpDialogIntent(event, response) {
//    return rubbishPickupAPI.query(config.rubbishPickupAPI.address, config.rubbishPickupAPI.city)
//            .then(function (result) {
//                // Process the response as appropriate and return the result
//                let speechOutput = {
//                    speech: `The junk set out will begin in your area on ${result[0].JunkSetOutBegin} and will go on till ${result[0].JunkSetOutEnd}}`,
//                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
//                };
//
//                return response.tell(speechOutput);
//            });
//}

function handleJunkPickUpDialogIntent(event, response) {
    return new Promise(function (resolve) {
        let speechOutput = {
            speech: `Please, tell me your street address, number first. You can ignore the unit number.`,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        let repromptSpeech = {
            speech: `Can you please tell me your street address, number first?`,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

        resolve(response.ask(speechOutput, repromptSpeech));
    });
}

function handleProvideAddressIntent(event, response) {
    let streetAddress = event.request.intent.slots.StreetAddress;

    if (streetAddress && streetAddress.value) {
        return new Promise(function (resolve) {
            var speechOutput,
                repromptSpeech;

            speechOutput = {
                speech: `Thanks! What's your zip code?`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            repromptSpeech = {
                speech: `Please, tell me your zip code.`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            response._session.attributes.StreetAddress = streetAddress.value;
            resolve(response.ask(speechOutput, repromptSpeech));
        });
    } else {
        return new Promise(function (resolve) {
            let speechOutput = {
                speech: `I didn't quite get that. Please, repeat the street address, number first.`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            let repromptSpeech = {
                speech: `Please, repeat the street address, number first.`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            resolve(response.ask(speechOutput, repromptSpeech));
        });
    }

}

function handleProvideZipCodeIntent(event, response) {
    let zipCode       = event.request.intent.slots.ZipCode,
        streetAddress = event.session.attributes.StreetAddress;

    if (streetAddress && zipCode && zipCode.value) {
        let googleApiUrl = config.googleGeoApi.url + config.googleGeoApi.format + '?address=' + encodeURI(streetAddress);

        return request.get(googleApiUrl)
                .then(function (verifiedAddress) {
                    verifiedAddress = JSON.parse(verifiedAddress);

                    var speechOutput,
                        repromptSpeech;
                    console.dir(verifiedAddress.status);
                    if (verifiedAddress.status && verifiedAddress.status == 'OK') {
                        speechOutput = {
                            speech: `Thanks! Just to make sure: Is your address ${verifiedAddress.results[0].formatted_address}?`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };

                        repromptSpeech = {
                            speech: `Please, confirm if your address is ${verifiedAddress.results[0].formatted_address}`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };

                        response._session.attributes.address = verifiedAddress;
                    } else {
                        speechOutput = {
                            speech: `Uhmmm! The address you provided seems to be invalid. Please, repeat the street address, number first`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };

                        repromptSpeech = {
                            speech: `Please, repeat the street address, number first`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };
                    }

                    return response.ask(speechOutput, repromptSpeech);
                }).catch(function (err) {
                    console.dir(err);

                    let speechOutput = {
                        speech: `I'm having some trouble verifying that address. Please, repeat the street address, number first`,
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };

                    let repromptSpeech = {
                        speech: `Please, repeat the street address, number first`,
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };

                    return response.ask(speechOutput, repromptSpeech);
                });
    } else {
        return new Promise(function (resolve) {
            let speechOutput = {
                speech: `I didn't quite get that. Please, repeat the street address, number first.`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            let repromptSpeech = {
                speech: `Please, repeat the street address, number first.`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            resolve(response.ask(speechOutput, repromptSpeech));
        });
    }
}