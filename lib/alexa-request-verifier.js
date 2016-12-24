/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is licensed under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

module.exports = alexaVerifier;

var Promise  = require('bluebird'),
    verifier = require('alexa-verifier');

function alexaVerifier() {
    return function *alexaVerifier(next) {
        let self = this;
        errLog.info('1. Handling the request signing.');
        try {
            yield new Promise(function (resolve, reject) {
                if (self.request.get('signaturecertchainurl')) {
                    self.req._body = true; // The body will be ignored by other body-parsers
                    self.req.rawBody = '';
                    self.req.on('data', function (data) {
                        return self.req.rawBody += data;
                    });

                    self.req.on('end', function () {
                        errLog.info('2. Handling the request signing.');
                        var cert_url, requestBody, signature;
                        try {
                            self.req.body = JSON.parse(self.req.rawBody);
                        } catch (error) {
                            let err = new Error('Bad Request');
                            err.statusCode = 400;
                            err.code = 10004;
                            err.developerMessage = 'Your request is invalid.';

                            reject(err);
                        }

                        cert_url = self.request.get('signaturecertchainurl');
                        signature = self.request.get('signature');
                        requestBody = self.req.rawBody;

                        verifier(cert_url, signature, requestBody, function (error) {
                            errLog.info('3. Handling the request signing.');
                            if (error) {
                                let err = new Error('You are not authorized to access this resource');
                                err.statusCode = 403;
                                err.code = 10004;
                                err.developerMessage = 'You are not authorized to access this resource. The signature for the request is not valid.';

                                reject(err);
                            }
                        });

                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        } catch (err) {
            throw err;
        }

        yield next;
    };
}