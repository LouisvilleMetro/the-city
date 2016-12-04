/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

function errSerializer(err) { // Move this somewhere else?
    return {
        name: err.name,
        statusCode: err.statusCode,
        property: err.property,
        code: err.code,
        developerMessage: err.developerMessage,
        options: err.options,
        timeout: err.timeout,
        uri: err.uri,
        stack: err.stack
    };
}

module.exports.errSerializer = errSerializer;