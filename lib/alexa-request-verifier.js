/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

module.exports = alexaVerifier;

var Promise    = require('bluebird'),
    verifier   = require('alexa-verifier'),
    getRawBody = require('raw-body'),
    co         = require('co');

function alexaVerifier() {
    return function *alexaVerifier(next) {
        let self = this; // Got ctx here;

        try {
            yield new Promise(function (resolve, reject) {
                        if (self.request.get('signaturecertchainurl')) {
                            let cert_url  = self.request.get('signaturecertchainurl'),
                                signature = self.request.get('signature');

                            self.req._body = true; // Use this to verify if body parsing has been performed before trying to parse

                            co(function* () {
                                let result = yield getRawBody(self.req);
                                return result;
                            }).then(function (rawBody) {
                                try {
                                    self.req.body = JSON.parse(rawBody);
                                } catch (error) {
                                    let err = new Error('Bad Request');
                                    err.statusCode = 400;
                                    err.code = 10004;
                                    err.developerMessage = 'Your request is invalid.';

                                    reject(err);
                                }

                                verifier(cert_url, signature, rawBody, function (error) {
                                    if (error) {
                                        let err = new Error('You are not authorized to access this resource');
                                        err.statusCode = 403;
                                        err.code = 10004;
                                        err.developerMessage = 'You are not authorized to access this resource. The signature for the request is not valid.';

                                        reject(err);
                                    }

                                    resolve();
                                });
                            });
                        } else {
                            resolve();
                        }
                    }
            );
        } catch (err) {
            throw err;
        }

        yield next;
    };
}