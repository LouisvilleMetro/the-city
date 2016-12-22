/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * NOTICE: This file has been modified and differs from the original, which can be found at https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/helloWorld/src/AlexaSkill.js
 */


"use strict";

module.exports = AlexaSkill;

function AlexaSkill(appId) {
    this._appId = appId;
}

AlexaSkill.speechOutputType = {
    PLAIN_TEXT: 'PlainText',
    SSML: 'SSML'
};

AlexaSkill.prototype.requestHandlers = {
    LaunchRequest: function (event, response) {
        this.eventHandlers.onLaunch.call(this, event, response);
    },

    IntentRequest: function (event, response) {
        this.eventHandlers.onIntent.call(this, event, response);
    },

    SessionEndedRequest: function (event, response) {
        this.eventHandlers.onSessionEnded(event, response);
    }
};

AlexaSkill.prototype.eventHandlers = {
    /**
     * Called when the session starts.
     */
    onSessionStarted: function (event) {
    },

    /**
     * Called when the user invokes the skill without specifying what they want.
     */
    onLaunch: function (event, response) {
        throw "onLaunch should be overriden by subclass";
    },

    /**
     * Called when the user specifies an intent.
     *
     * @param event
     * @returns {Promise}
     */
    onIntent: function (event, response) {
        var request       = event.request,
            intent        = request.intent,
            intentName    = request.intent.name,
            intentHandler = this.intentHandlers[intentName];

        if (intentHandler) {
            intentHandler.call(this, event, response);
        } else {
            let err = new Error(`Alexa intent [${intentName}] not supported.`);
            err.property = 'intentName';
            err.code = 10003;
            err.developerMessage = `Alexa intent [${intentName}] not supported. Verify that you are using a valid intent name`;

            throw err;
        }
    },

    /**
     * Called when the user ends the session.
     */
    onSessionEnded: function (event, response) {
    }
};

/**
 * Subclasses should override the intentHandlers with the functions to handle specific intents.
 */
AlexaSkill.prototype.intentHandlers = {};

/**
 * Handles a request to the Alexa skill.
 *
 * @param event The request.
 * @returns {Promise}
 */
AlexaSkill.prototype.handle = function (event) {
    try {
        // Validate that this request originated from authorized source.
        if (this._appId && event.session.application.applicationId !== this._appId) {
            let err = new Error('You are not authorized to access this resource.');
            err.statusCode = 401;
            err.code = 10004;
            err.developerMessage = 'You are not authorized to access this resource.';

            throw err;
        }

        if (!event.session.attributes) {
            event.session.attributes = {};
        }
console.dir(event.session);
        if (event.session.new) {
            this.eventHandlers.onSessionStarted(event);
        }

        // Route the request to the proper handler which may have been overridden.
        var requestHandler = this.requestHandlers[event.request.type];
        return requestHandler.call(this, event, new Response(event.session));
    } catch (err) {
        throw  err;
    }
};

var Response = function (session) {
    this._session = session;
};

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam.speech
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam.speech || optionsParam
        }
    }
}

Response.prototype = (function () {
    var buildSpeechletResponse = function (options) {
        var alexaResponse = {
            outputSpeech: createSpeechObject(options.output),
            shouldEndSession: options.shouldEndSession
        };
        if (options.reprompt) {
            alexaResponse.reprompt = {
                outputSpeech: createSpeechObject(options.reprompt)
            };
        }
        if (options.cardTitle && options.cardContent) {
            alexaResponse.card = {
                type: "Simple",
                title: options.cardTitle,
                content: options.cardContent
            };
        }
        var returnResult = {
            version: '1.0',
            response: alexaResponse
        };
        if (options.session && options.session.attributes) {
            returnResult.sessionAttributes = options.session.attributes;
        }

        return returnResult;
    };

    return {
        tell: function (speechOutput, directive) {
            return buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                shouldEndSession: true
            });
        },

        tellWithCard: function (speechOutput, cardTitle, cardContent) {
            return buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                cardTitle: cardTitle,
                cardContent: cardContent,
                shouldEndSession: true
            });
        },

        ask: function (speechOutput, repromptSpeech) {
            return buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                shouldEndSession: false
            });
        },

        askWithCard: function (speechOutput, repromptSpeech, cardTitle, cardContent) {
            return buildSpeechletResponse({
                session: this._session,
                output: speechOutput,
                reprompt: repromptSpeech,
                cardTitle: cardTitle,
                cardContent: cardContent,
                shouldEndSession: false
            });
        }
    };
})();