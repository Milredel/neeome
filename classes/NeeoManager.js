"use strict";

require('../conf/Constants.js');

const Logger = SRV_DEPENDENCIES.logger;
const fetch = require('node-fetch');

class NeeoManager {

    constructor() {
        
    }

    async getAllRecipes() {
        var url = "http://"+CONFIG.neeo.brain_ip+":3000/"+CONFIG.neeo.api_version+"/api/Recipes";
        try {
            var response = await fetch(url);
            var recipes = await response.json();
            var that = this;
            recipes.forEach(function(recipe, index) {
                recipes[index].detail.roomname = decodeURI(recipes[index].detail.roomname);
                recipes[index].detail.devicename = decodeURI(recipes[index].detail.devicename);
                var distantUrl = UTILS.formatDistantUrl(recipe.url.setPowerOn, "on");
                recipes[index].url.distantSetPowerOn = distantUrl;
                var pattern = /[0-9]{8,}/;
                var regex = new RegExp(pattern, "g");
                var matches = distantUrl.match(regex);
                recipes[index].url.distantSetPowerOnId = matches[1];
                var steps = SRV_VARS.data.recipeSteps[matches[1]].steps;
                //TODO deal with recipes which don't have "volume" step
                //id est load volume buttons directly from the volume buttons of the device
                for (var i = 0; i < steps.length; i++) {
                    var step = steps[i];
                    if(step.type == "volume") {
                        var volumeDevice = that.getDeviceByKey(step.deviceKey);
                        if (null != volumeDevice) {
                            recipes[index].url.volumeUp = volumeDevice.macros["VOLUME UP"].distantUrl;
                            recipes[index].url.volumeDown = volumeDevice.macros["VOLUME DOWN"].distantUrl;
                            recipes[index].url.muteToggle = volumeDevice.macros["MUTE TOGGLE"].distantUrl;
                        }
                    }
                }
                recipes[index].url.distantSetPowerOff = null;
                recipes[index].url.distantSetPowerOffId = null;
                if (recipe.url.setPowerOff != undefined) {
                    var distantUrl = UTILS.formatDistantUrl(recipe.url.setPowerOff, "off");
                    recipes[index].url.distantSetPowerOff = distantUrl;
                    var pattern = /[0-9]{8,}/;
                    var regex = new RegExp(pattern, "g");
                    var matches = distantUrl.match(regex);
                    recipes[index].url.distantSetPowerOffId = matches[1];
                }
            });
            var data = recipes;
        } catch (e) {
            Logger.err("something went wrong when getting recipes : "+e);
        }
        return data;
    }

    async getAllRecipeSteps() {
        var url = "http://"+CONFIG.neeo.brain_ip+":3000/"+CONFIG.neeo.api_version+"/projects/home/rooms";
        try {
            var response = await fetch(url);
            var rooms = await response.json();
            var recipeSteps = {};
            rooms.forEach(function(room, index) {
                var recipes = room.recipes;
                for (var key in recipes) {
                    var recipe = recipes[key];
                    recipeSteps[key] = recipe;
                };
            });
            var data = recipeSteps;
        } catch (e) {
            Logger.err("something went wrong when getting recipe steps : "+e);
        }
        return data;
    }

    async getAllRooms() {
        var url = "http://"+CONFIG.neeo.brain_ip+":3000/"+CONFIG.neeo.api_version+"/projects/home/rooms";
        try {
            var response = await fetch(url);
            var roomsRaw = await response.json();
            var rooms = [];
            roomsRaw.forEach(function(room, index) {
                var roomDevices = room.devices;
                if (!(Object.keys(roomDevices).length === 0 && roomDevices.constructor === Object)) {
                    room.iconName = room.icon.split('.')[room.icon.split('.').length - 1 ];
                    Object.keys(roomDevices).forEach(function(deviceKey, index) {
                        var macros = roomDevices[deviceKey].macros;
                        Object.keys(macros).forEach(function(macroKey, index) {
                            var macro = macros[macroKey];
                            var distantUrl = UTILS.formatDistantButtonUrl(macro.roomKey, macro.deviceKey, macro.key);
                            room.devices[deviceKey].macros[macroKey].distantUrl = distantUrl;
                        });
                    });
                    rooms.push(room);
                }
            });
            var data = rooms;
        } catch (e) {
            Logger.err("something went wrong when getting rooms : "+e);
        }
        return data;
    }

    async getByUrl(myurl) {
        try {
            var response = await fetch(myurl);
            var result = await response.json();
            var data = result;
        } catch (e) {
            Logger.err("something went wrong when getting by url : "+e);
        }
        return data;
    }

    updateRecipe(type, name, data) {
        for (var index = 0; index < SRV_VARS.data.recipes.length; index++) {
            var recipe = SRV_VARS.data.recipes[index];
            if (recipe.type == type && recipe.detail.devicename == name) {
                for (var key in data) {
                    SRV_VARS.data.recipes[index][key] = data[key];
                }
                return SRV_VARS.data.recipes[index];
            }
        }
        return null;
    }

    getRecipeByName(name) {
        for (var index = 0; index < SRV_VARS.data.recipes.length; index++) {
            var recipe = SRV_VARS.data.recipes[index];
            if (recipe.type == type && recipe.detail.devicename == name) {
                return SRV_VARS.data.recipes[index];
            }
        }
        return null;
    }

    getActiveRecipes() {
        let activeRecipes = [];
        for (var index = 0; index < SRV_VARS.data.recipes.length; index++) {
            var recipe = SRV_VARS.data.recipes[index];
            if (true == recipe.isPoweredOn) {
                activeRecipes.push(recipe);
            }
        }
        return activeRecipes;
    }

    getDeviceByKey(key) {
        for (var index = 0; index < SRV_VARS.data.rooms.length; index++) {
            var room = SRV_VARS.data.rooms[index];
            for (var deviceKey in room.devices) {
                var device = room.devices[deviceKey];
                if (key == device.key) {
                    return device;
                }
            }
        }
        return null;
    }

    getDeviceByName(name) {
        for (var index = 0; index < SRV_VARS.data.rooms.length; index++) {
            var room = SRV_VARS.data.rooms[index];
            for (var deviceKey in room.devices) {
                var device = room.devices[deviceKey];
                if (name == device.name) {
                    return device;
                }
            }
        }
        return null;
    }
}

module.exports = NeeoManager;
