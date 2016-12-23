/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

let defaults = require('../defaults');

module.exports = handleJunkPickUpDialogIntent;

/**
 * Handles the JunkPickUpDialogIntent. This intent initiates the conversation for the junk set out dates.
 *
 * @param event The request body.
 * @param response The response object.
 * @returns {Promise}
 */
function handleJunkPickUpDialogIntent(event, response) {
    var actions = event.session.attributes.actions;

    return new Promise(function (resolve) {
        let speechOutput = {
            speech: `Sure! Tell me your address including your city or state. Ignore the zip code and unit number.`,
            type: defaults.speechOutputType.PLAIN_TEXT
        };

        let repromptSpeech = {
            speech: `Please, tell me your address.`,
            type: defaults.speechOutputType.PLAIN_TEXT
        };

        response._session.attributes.actions.push('JunkPickUpDialogIntent');
        resolve(response.ask(speechOutput, repromptSpeech));
    });
}