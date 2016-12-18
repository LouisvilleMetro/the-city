/**
 * @module      com.louisvillemetro.the-city
 * @author      Reydel Leon Machado
 * @copyright   Copyright (c) 2016 Reydel Leon Machado
 * @license     This code is license under the MIT license. See the LICENSE file in the project root for license terms.
 */

"use strict";

var Config            = require('./config'),
    config            = new Config(),
    _                 = require('lodash'),
    views             = require('koa-views'),
    responseTime      = require('koa-response-time'),
    compress          = require('koa-compress'),
    DataManager       = require('./lib/datamanager'),
    LE                = require('letsencrypt-express'),
    RubbishPickupAPI  = require('./lib/rubbish-pickup-api'),
    bunyan            = require('bunyan'),
    bunyanSerializers = require('./lib/bunyanserializers'),
    http              = require('http'),
    https             = require('spdy'),
    fs                = require('fs'),
    koa               = require('koa'),
    app               = koa(),
    koaSslify         = require('koa-sslify'),
    api               = require('./api'),
    mysql             = require('mysql2'),
    Uuid              = require('uuid');

// Support Services
global.log = bunyan.createLogger({
    name: 'the-city',
    src: false,
    streams: [
        {
            name: 'console',
            level: bunyan.INFO, // This is the default anyway
            stream: process.stdout
        },
        {
            type: 'rotating-file',
            path: config.logging.logPath,
            period: '1d',   // daily rotation
            count: 3        // keep 3 back copies
        }
    ],
    serializers: {
        req: bunyan.stdSerializers.req,
        res: bunyan.stdSerializers.res,
        err: bunyanSerializers.errSerializer
    }
});

global.lcLog = log.child({ eventType: 'appLifeCycle' });
global.reqLog = log.child({ eventType: 'reqLifeCycle' });
global.scLog = log.child({ eventType: 'security' });
global.errLog = log.child({ eventType: 'error' });

// Core Services
global.rubbishPickupAPI = new RubbishPickupAPI(config.rubbishPickupAPI.host);

app.use(function *(next) {
    let uuid = Uuid.v4();
    this.set('X-Request-ID', uuid);

    reqLog.info({ reqID: uuid, req: this.req });

    yield next;

    reqLog.info({ reqID: uuid, res: this.res });
});

// Error Handling
app.use(function *(next) {
    try {
        yield next;
    } catch (err) {
        this.status = err.statusCode || 500;
        this.body = {
            requestID: this.response.get('X-Request-ID'),
            status: this.status,
            code: err.code,
            property: err.property,
            message: err.message,
            developerMessage: err.developerMessage,
            moreInfo: 'http://doc.myapi.com'
        };

        err.requestID = this.response.get('X-Request-ID'); // This is essential for error tracking

        this.app.emit('error', err, this);
    }
});

app.on('error', (err) => {
    errLog.info({ requestID: err.requestID, err: err });
});

// Utility Middleware
app.use(responseTime());
app.use(compress({}));

// Core API routes
app.use(api.routes());

app.listen(config.bindPort, config.bindAddress);