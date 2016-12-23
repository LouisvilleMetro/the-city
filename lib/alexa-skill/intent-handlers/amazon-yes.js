/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

let defaults = require('../defaults');

module.exports = handleAmazonYesIntent;

/**
 * Handles the Amazon.YesIntent taking into account the last action in the sequence. According to the last action, the request will be handed down
 * to the appropriate handler.
 *
 * @param event The request body.
 * @param response The response object.
 * @returns {*}
 */
function handleAmazonYesIntent(event, response) {
    var actions    = event.session.attributes.actions,
        lastAction = actions[actions.length - 1];

    switch (lastAction) {
        case 'ProvideAddressIntent':
            if (actions.includes('JunkPickUpDialogIntent')) { // We're dealing with a flow for junk set out date
                return getJunkSetOutData(event, response);
            }
            break;
    }
}

/**
 * Retrieves the junk set out information using the RubbishPickup API.
 *
 * @param event The request body.
 * @param response The response object.
 * @returns {*}
 */
function getJunkSetOutData(event, response) {
    let verifiedAddresses = event.session.attributes.VerifiedAddresses,
        address          = verifiedAddresses[0]; // The user just confirmed the top address in the list when he said yes

    if (address) {
        let streetAddress = address.number + ' ' + address.street;

        return rubbishPickupAPI.query(streetAddress, address.city)
                .then(function (result) {
                    if (Array.isArray(result) && result.length > 0) {
                        let speechOutput = {
                            speech: `The junk set out will begin in your area on ${result[0].JunkSetOutBegin} and will go on till ${result[0].JunkSetOutEnd}}`,
                            type: defaults.speechOutputType.PLAIN_TEXT
                        };

                        return response.tell(speechOutput);
                    } else {
                        return new Promise(function (resolve) {
                            let speechOutput = {
                                speech: `Bummer! It seems to me that I don't have the junk set out data for your address. You might be out of the area covered by the city services.`,
                                type: defaults.speechOutputType.PLAIN_TEXT
                            };

                            resolve(response.tell(speechOutput, null));
                        });
                    }
                });
    } else {
        return new Promise(function (resolve) {
            let speechOutput = {
                speech: `Bummer! I'm having a technical problem that prevents me from fulfilling your request. Try again in a couple minutes.`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            resolve(response.tell(speechOutput, null));
        });
    }
}