/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

let defaults = require('../defaults');

module.exports = handleAmazonYesIntent;

function handleAmazonYesIntent(event, response) {
    let streetAddress = event.session.attributes.VerifiedStreetAddress;
    let city = event.session.attributes.VerifiedCity;

    if (streetAddress && city) {
        return rubbishPickupAPI.query(streetAddress, city)
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
                speech: `Bummer! I'm having a technical problem that prevents me from fulfilling your request. Try again in a second.`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            resolve(response.tell(speechOutput, null));
        });
    }
}
