'use strict';

const path = require('path');

// Define globals var
global.BASE_DIR = __dirname;
global.SRV_DEPENDENCIES = {
    'app': null,
    'logger': null,
    'neeoManager': null,
    'srvManager': null,
    'speaker': null,
    'commandConfigManager': null
};
global.SRV_VARS = {
    'data': {}
};

// Requiring constants
require(BASE_DIR + '/conf/Constants.js');

// Loadding logger
const Logger = require(BASE_DIR + '/classes/Logger');
SRV_DEPENDENCIES.logger = new Logger();

// Loading server manager
SRV_DEPENDENCIES.logger.log('Chargement de la dépendance ServerManager...');
const ServerManager = require(BASE_DIR + '/classes/ServerManager');
SRV_DEPENDENCIES.srvManager = new ServerManager();

// Loading Neeo manager
SRV_DEPENDENCIES.logger.log('Chargement de la dépendance NeeoManager...');
const NeeoManager = require(BASE_DIR + '/classes/NeeoManager');
SRV_DEPENDENCIES.neeoManager = new NeeoManager();

// Loading CommandConfig manager
SRV_DEPENDENCIES.logger.log('Chargement de la dépendance CommandConfigManager...');
const CommandConfigManager = require(BASE_DIR + '/classes/CommandConfigManager');
SRV_DEPENDENCIES.commandConfigManager = new CommandConfigManager();

// Loading notifier
SRV_DEPENDENCIES.logger.log('Chargement de la dépendance Notifier...');
const Notifier = require(BASE_DIR + '/classes/Notifier');
Notifier.init(CONFIG, []).then(function(resource) {
    SRV_DEPENDENCIES.speaker = resource;
});

// Loading express
SRV_DEPENDENCIES.logger.log('Chargement de la dépendance applicative...');
const express = require('express');
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(BASE_DIR, '/views'));
app.use('/views', express.static(path.join(BASE_DIR, 'views')));
SRV_DEPENDENCIES.app = app;

SRV_DEPENDENCIES.logger.success('Dépendances chargées !');

//Including router and now let's starting the beast !
const Router = require(BASE_DIR + '/classes/Router');
const router = new Router();

router.start();
