"use strict";

require('./../conf/Constants.js');

const util = require('util');
const srvManager = SRV_DEPENDENCIES.srvManager;
const neeoManager = SRV_DEPENDENCIES.neeoManager;
const Logger = SRV_DEPENDENCIES.logger;

class ServerController {

    constructor() { }

    async loadServerData() {
        let result;

        try {
            Logger.info('Chargement des données');
            
            const recipes = await neeoManager.getAllRecipes();

            SRV_VARS.data.recipes = {};
            
            if (recipes) {
                SRV_VARS.data.recipes = recipes;
                Logger.success(recipes.length + " recipes have been added !");
            } else {
                Logger.warn('No recipe have been found.');
            }

            const rooms = await neeoManager.getAllRooms();

            SRV_VARS.data.rooms = {};
            
            if (rooms) {
                SRV_VARS.data.rooms = rooms;
                Logger.success(rooms.length + " rooms have been added !");
            } else {
                Logger.warn('No room have been found.');
            }
            
        } catch (e) {
            throw new Error('An error has occured while loading data from Neeo (Reason: ' + e + ').');
        }
    }

    async displayLanding(req, res) {
        const recipes = SRV_VARS.data.recipes;
        const rooms = SRV_VARS.data.rooms;
        
        
        return res.render('main', { title: 'Existing NEEO Recipes', recipes: recipes, rooms: rooms, runningOnConfigSample: CONFIG.ISCONFIGSAMPLE })
    }
}

module.exports = ServerController;
