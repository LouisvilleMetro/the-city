/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

module.exports = handleAmazonCancelIntent;

/**
 * Handles the Amazon.CancelIntent.
 *
 * @param event The request body.
 * @param response The response object.
 * @returns {*}
 */
function handleAmazonCancelIntent(event, response) {
    return new Promise(function (resolve) {
        let speechOutput = {
            speech: `Bye.`,
            type: defaults.speechOutputType.PLAIN_TEXT
        };

        resolve(response.tell(speechOutput, null));
    });
}