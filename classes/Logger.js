"use strict";

class Logger {

    constructor() {
        const winston = require('winston');
        const colors = require('colors');

        this.logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    formatter: function(options) {
                        return '[STRATOS - ' + UTILS.toFrenchDate(new Date, true) + '] ' + options.message;
                    }
                }),
                new (winston.transports.File)({
                    name: 'general-log',
                    filename: BASE_DIR + '/logs/general.log'
                })
            ]
        });
    }

    log(message) {
        this.logger.info(message);
    }

    err(message) {
        this.logger.error(message.red);
    }

    success(message) {
        this.logger.info(message.green);
    }

    info(message) {
        this.logger.info(message.blue);
    }

    warn(message) {
        this.logger.warn(message.yellow);
    }

    multicolor(message) {
        this.logger.info(message.rainbow);
    }
}

module.exports = Logger;
