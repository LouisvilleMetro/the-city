/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

var CONFIG  = require('../config'),
    _       = require('lodash'),
    mysql   = require('mysql2'),
    Promise = require('bluebird');

module.exports = DataManager;

/**
 * Creates a DataManager instance.
 *
 * @constructor
 */
function DataManager(opts) {
    this.connection = mysql.createConnection({
        host: opts.host,
        user: opts.user,
        password: opts.password,
        database: opts.database,
        namedPlaceholders: true
    });

    var self = this;

    this.connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL server: ' + err.stack);
        }

        console.log('Successfully connected with MySQL server with ID:' + self.connection.threadId);
    })
}