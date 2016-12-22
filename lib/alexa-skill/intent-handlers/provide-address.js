/**
 * @module      com.reydelleonmachado.
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     All rights reserved
 */

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
    let streetAddress = event.request.intent.slots.StreetAddress;

    if (streetAddress && streetAddress.value) {
        let googleApiUrl = config.googleGeoApi.url + config.googleGeoApi.format + '?address=' + encodeURI(streetAddress.value) + '&key=' + config.googleGeoApi.key;

        return request.get(googleApiUrl)
                .then(function (verifiedAddress) {
                    verifiedAddress = JSON.parse(verifiedAddress);

                    var speechOutput,
                        repromptSpeech;

                    if (verifiedAddress.status && verifiedAddress.status == 'OK') {
                        speechOutput = {
                            speech: `Thanks! Just to make sure: Is your address ${verifiedAddress.results[0].formatted_address}?`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };

                        repromptSpeech = {
                            speech: `Please, confirm if your address is ${verifiedAddress.results[0].formatted_address}`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };

                        // Segment address for Junk Pickup API consumption
                        var verifiedStreetNumber  = '',
                            verifiedStreetAddress = '',
                            verifiedCity          = '';

                        _.forEach(verifiedAddress.results[0].address_components, function (component) {
                            if (component.types.includes('street_number')) {
                                verifiedStreetNumber = component.long_name;
                            }

                            if (component.types.includes('route')) {
                                verifiedStreetAddress = component.short_name;
                            }

                            if (component.types.includes('locality')) {
                                verifiedCity = component.long_name;
                            }
                        });

                        response._session.attributes.VerifiedStreetAddress = verifiedStreetNumber + ' ' + verifiedStreetAddress;
                        response._session.attributes.VerifiedCity = verifiedCity;
                    } else {
                        speechOutput = {
                            speech: `Uhmmm! The address you provided seems to be invalid. Please, repeat your address, number first. Remember to include your city or state.`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };

                        repromptSpeech = {
                            speech: `Please, repeat your address, number first.`,
                            type: AlexaSkill.speechOutputType.PLAIN_TEXT
                        };
                    }

                    return response.ask(speechOutput, repromptSpeech);
                }).catch(function (err) {
                    console.dir(err);

                    let speechOutput = {
                        speech: `I'm having some trouble verifying that address. Please, repeat your address, number first.`,
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };

                    let repromptSpeech = {
                        speech: `Please, repeat your address, number first`,
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };

                    return response.ask(speechOutput, repromptSpeech);
                });
    } else {
        return new Promise(function (resolve) {
            let speechOutput = {
                speech: `I didn't quite get that. Please, repeat your address, number first.`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            let repromptSpeech = {
                speech: `Please, repeat your address, number first.`,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };

            resolve(response.ask(speechOutput, repromptSpeech));
        });
    }
}
