/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

var _       = require('lodash'),
    Promise = require('bluebird'),
    util    = require('util'),
    request = require('request-promise'),
    Paths   = require('./paths');

module.exports = RubbishPickupAPI;

/**
 * Represents the RubbishPickupAPI.
 *
 * @param baseURL The service base URL.
 * @returns {Object} An object representing the RubbishPickupAPI.
 * @constructor
 */
function RubbishPickupAPI(baseURL) {
    this.baseRESTURL = `http://${baseURL}`;
}

/*
 * Queries for the rubbish pickup date?
 *
 * @param address {string} The address to lookup.
 * @param city {string} The city to which the address belong in.
 *
 * @returns {Promise.<Object|Error>} The gateway response if fulfilled, and error if rejected.
 */
RubbishPickupAPI.prototype.query = function (address, city) {
    let commandUrl = `${this.baseRESTURL + Paths.PICKUP}?address=${encodeURIComponent(address)}&city=${encodeURIComponent(city)}`;
    return request.get(commandUrl)
            .then(function (response) {
                // Process the response as necessary and then return the result as the value for the promise.
                return JSON.parse(response);
            });
};