/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

let defaults = require('../defaults'),
    Config   = require('../../../config'),
    config   = Config(),
    _        = require('lodash'),
    request  = require('request-promise'),
    Promise  = require('bluebird');

module.exports = handleProvideAddressIntent;

/**
 * Handles the ProvideAddressIntent. This intent is used to process an address that the user has voiced.
 * It will verify the address and in case multiple addresses are found to match the address provided by
 * the user, will cycle through them till the user selects one or discard them all.
 *
 * @param event The request body
 * @param response The response object
 * @returns {*}
 */
function handleProvideAddressIntent(event, response) {
    let address = event.request.intent.slots.Address;

    // Remove the ProvideAddressIntent action, since we don't want to set it if the result of this request is not positive.
    var actions = event.session.attributes.actions;

    if (actions.includes('ProvideAddressIntent')) {
        let index = actions.indexOf('ProvideAddressIntent');
        actions.splice(index, 1);
        response._session.attributes.actions = actions;
    }

    if (address && address.value) {
        let googleApiUrl = config.googleGeoApi.url + config.googleGeoApi.format + '?address=' + encodeURI(address.value) + '&key=' + config.googleGeoApi.key;

        return request.get(googleApiUrl)
                .then(function (verificationResult) {
                    var speechOutput,
                        repromptSpeech,
                        verifiedAddresses = [];

                    verificationResult = JSON.parse(verificationResult);

                    if (verificationResult.status && verificationResult.status == 'OK') {
                        if (verificationResult.results.length > 3) {
                            verificationResult.results = verificationResult.results.splice(0, config.addressVerificationParams.maxMatches);
                        }

                        _.forEach(verificationResult.results, function (matchingAddress) {
                            let verifiedAddress = {};

                            _.forEach(matchingAddress.address_components, function (component) {
                                if (component.types.includes('street_number')) {
                                    verifiedAddress.number = component.long_name;
                                }

                                if (component.types.includes('route')) {
                                    verifiedAddress.street = component.short_name;
                                }

                                if (component.types.includes('locality')) {
                                    verifiedAddress.city = component.long_name;
                                }
                            });

                            verifiedAddress.formattedAddress = matchingAddress.formatted_address;
                            verifiedAddresses.push(verifiedAddress);
                        });

                        speechOutput = {
                            speech: `Thanks! Just to make sure: Is your address ${verificationResult.results[0].formatted_address}?`,
                            type: defaults.speechOutputType.PLAIN_TEXT
                        };

                        repromptSpeech = {
                            speech: `Please, confirm if your address is ${verificationResult.results[0].formatted_address}`,
                            type: defaults.speechOutputType.PLAIN_TEXT
                        };

                        response._session.attributes.actions.push('ProvideAddressIntent'); // Only set in case it all went well.
                        response._session.attributes.VerifiedAddresses = verifiedAddresses; // Rewrite verified addresses every time this intent is invoked.
                    } else {
                        speechOutput = {
                            speech: `Uhmmm! The address you provided seems to be invalid. Please, repeat your address, number first. Remember to include your city or state.`,
                            type: defaults.speechOutputType.PLAIN_TEXT
                        };

                        repromptSpeech = {
                            speech: `Please, repeat your address, number first.`,
                            type: defaults.speechOutputType.PLAIN_TEXT
                        };
                    }

                    return response.ask(speechOutput, repromptSpeech);
                }).catch(function (err) {
                    let speechOutput = {
                        speech: `I'm having some trouble verifying that address. Please, repeat your address, number first.`,
                        type: defaults.speechOutputType.PLAIN_TEXT
                    };

                    let repromptSpeech = {
                        speech: `Please, repeat your address, number first`,
                        type: defaults.speechOutputType.PLAIN_TEXT
                    };

                    return response.ask(speechOutput, repromptSpeech);
                });
    } else {
        return new Promise(function (resolve) {
            let speechOutput = {
                speech: `I didn't quite get that. Please, repeat your address, number first.`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            let repromptSpeech = {
                speech: `Please, repeat your address, number first.`,
                type: defaults.speechOutputType.PLAIN_TEXT
            };

            resolve(response.ask(speechOutput, repromptSpeech));
        });
    }
}
