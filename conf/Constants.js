//Result codes
global.RESULT_OK = '200';
global.RESULT_KO = '400';
global.RESULT_FORBIDDEN = '403';
global.RESULT_MISSING = '404';
global.RESULT_INTERNAL = '500';
global.RESULT_EMPTY = '204';

//Utils
global.UTILS = require('./Utils');

//Database
global.DB = require('./Database');

//Config
const fs = require('fs');
const path = require('path');
const configSample = require('./config.sample');
global.ISCONFIGSAMPLE = true;
global.CONFIG = configSample;
var configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) {
    global.CONFIG = require(configPath);
    global.ISCONFIGSAMPLE = false;
}