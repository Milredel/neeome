"use strict";

require('./../conf/Constants.js');

const util = require('util');
const srvManager = SRV_DEPENDENCIES.srvManager;
const neeoManager = SRV_DEPENDENCIES.neeoManager;
const commandConfigManager = SRV_DEPENDENCIES.commandConfigManager;
const hueLightManager = SRV_DEPENDENCIES.hueLightManager;
const freeboxManager = SRV_DEPENDENCIES.freeboxManager;
const Logger = SRV_DEPENDENCIES.logger;

class ServerController {

    constructor() { }

    async loadServerData() {
        let result;

        try {
            Logger.info('Chargement des données');

            const tvChannels = await freeboxManager.getChannelsFromConfig();

            SRV_VARS.data.tvChannels = {};
            
            if (tvChannels) {
                SRV_VARS.data.tvChannels = tvChannels;
                Logger.success(Object.keys(tvChannels).length + " TV channels have been added !");
            } else {
                Logger.warn('No TV channels have been found.');
            }

            const rooms = await neeoManager.getAllRooms();

            SRV_VARS.data.rooms = {};
            
            if (rooms) {
                SRV_VARS.data.rooms = rooms;
                Logger.success(rooms.length + " rooms have been added !");
            } else {
                Logger.warn('No room have been found.');
            }

            const recipeSteps = await neeoManager.getAllRecipeSteps();

            SRV_VARS.data.recipeSteps = {};
            
            if (recipeSteps) {
                SRV_VARS.data.recipeSteps = recipeSteps;
                Logger.success(Object.keys(recipeSteps).length + " recipeSteps have been added !");
            } else {
                Logger.warn('No recipeSteps have been found.');
            }
            
            const recipes = await neeoManager.getAllRecipes();

            SRV_VARS.data.recipes = {};
            
            if (recipes) {
                SRV_VARS.data.recipes = recipes;
                Logger.success(recipes.length + " recipes have been added !");
            } else {
                Logger.warn('No recipe have been found.');
            }

            const commandConfigs = await commandConfigManager.getAllCommandConfigs();

            SRV_VARS.data.commandConfigs = {};
            
            if (commandConfigs) {
                SRV_VARS.data.commandConfigs = commandConfigs;
                Logger.success(Object.keys(commandConfigs).length + " commandConfigs have been added !");
            } else {
                Logger.warn('No commandConfigs have been found.');
            }

        } catch (e) {
            throw new Error('An error has occured while loading data from Neeo (Reason: ' + e + ').');
        }
    }

    async displayLanding(req, res) {
        const vars = {private_token : CONFIG.home.private_token};

        const recipes = SRV_VARS.data.recipes;
        const rooms = SRV_VARS.data.rooms;

        var linkHome = "/?token="+CONFIG.home.private_token;
        
        var linkRecipes = "/recipes?token="+CONFIG.home.private_token;

        var linkTVGuide = "/tv/guide?token="+CONFIG.home.private_token;

        const activeRecipes = neeoManager.getActiveRecipes();

        var roomsWithRecipe = {};
        for (var room of rooms) {
            for (var recipe of recipes) {
                if (recipe.type == 'launch' && recipe.detail.roomname == room.name && recipe.detail.devicetype != 'LIGHT') {
                    roomsWithRecipe[room.name] = room.key;
                }
            }
        }

        var onlyOneRoomWithRecipes = false;
        if (Object.keys(roomsWithRecipe).length == 1) {
            onlyOneRoomWithRecipes = true;
            var onlyRoomWithRecipes = Object.keys(roomsWithRecipe)[0];
        }
        
        return res.render('main', { title: 'Your NeeOme', recipes: recipes, rooms: rooms, runningOnConfigSample: CONFIG.ISCONFIGSAMPLE, linkHome: linkHome, linkRecipes: linkRecipes, linkTVGuide: linkTVGuide, activeRecipes: activeRecipes, onlyOneRoomWithRecipes: onlyOneRoomWithRecipes, onlyRoomWithRecipes: onlyRoomWithRecipes, vars: vars })
    }

    async displayImage(req, res) {
        var file = req.params.img;
        var options = {
            root: BASE_DIR + '/views/img/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        return res.sendFile(file, options);
    }
}

module.exports = ServerController;
