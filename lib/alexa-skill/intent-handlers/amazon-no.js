/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */
"use strict";

let defaults = require('../defaults');

module.exports = handleAmazonNoIntent;

/**
 * Handles the Amazon.NoIntent taking into account the last action in the sequence. According to the last action, the request will be handed down
 * to the appropriate handler.
 *
 * @param event The request body.
 * @param response The response object.
 * @returns {*}
 */
function handleAmazonNoIntent(event, response) {
    var actions    = event.session.attributes.actions,
        lastAction = actions[actions.length - 1];

    switch (lastAction) {
        case 'ProvideAddressIntent':
            return confirmNextAddress(event, response);
            break;

        default:
            return handleDefault(event, response);
    }
}

/**
 * Will remove the top address in the VerifiedAddresses array and will prompt the user to confirm the next address.
 * If there aren't any addresses left, will prompt the user to re-voice a valid address.
 *
 * @param event
 * @param response
 * @returns {Promise}
 */
function confirmNextAddress(event, response) {
    let verifiedAddresses = event.session.attributes.VerifiedAddresses;

    verifiedAddresses.shift(); // Remove address rejected by the user
    
    if (verifiedAddresses.length > 0) {
        return new Promise(function (resolve) {
            let speechOutput = {
                speech: `OK, is your address ${verifiedAddresses[0].formattedAddress}`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            let repromptSpeech = {
                speech: `Is your address ${verifiedAddresses[0].formattedAddress}`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            response._session.attributes.VerifiedAddresses = verifiedAddresses; // Resend the list of addresses minus the first one.
            resolve(response.ask(speechOutput, repromptSpeech));
        });
    } else {
        return new Promise(function (resolve) {
            let speechOutput = {
                speech: `Let's try that again. Say your address as clearly as possible including your city or state. Ignore the zip code and unit number.`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            let repromptSpeech = {
                speech: `Please, say your address clearly.`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            resolve(response.ask(speechOutput, repromptSpeech));
        });
    }
}

function handleDefault(event, response){
    return new Promise(function (resolve) {
        let speechOutput = {
            speech: `Bye`,
            type: defaults.speechOutputType.PLAIN_TEXT
        };

        resolve(response.ask(speechOutput, null));
    });
}
