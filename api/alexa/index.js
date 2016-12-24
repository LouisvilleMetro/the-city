/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

var Config       = require('../../config'),
    config       = new Config(),
    router       = require('koa-router')(),
    parse        = require('co-body'),
    TheCitySkill = require('./../../lib/alexa-skill'),
    theCitySkill = new TheCitySkill();

/**
 * Handles Alexa skill requests.
 */
router.post('/alexa', function *(next) {
    let request = yield parse.json(this);

    this.body = yield theCitySkill.handle(request);
});

module.exports = router;