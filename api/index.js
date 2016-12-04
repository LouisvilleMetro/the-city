/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

var router   = require('koa-router')(),
    alexa    = require('./alexa');
    //someRoute    = require('./someRoute');

router.use('/v1', alexa.routes());
//router.use('/v1', someRoute.routes());

module.exports = router;
