const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const configSample = require('./config.sample');
let runningOnConfigSample = true;
let config = configSample;

//this file is launched on raspi boot via script in /etc/rc.local

var configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) {
    config = require(configPath);
    runningOnConfigSample = false;
}

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));
app.use('/views', express.static(path.join(__dirname, 'views')));

app.get('/', safeHandler(defaultHandler));
app.get('/recipes', safeHandler(recipesHandler));
app.get('/neeo', safeHandler(executeHandler));
app.get('/neeo/freebox', safeHandler(executeFreeboxHandler));

app.listen(config.home.local_port, function () {
    console.log('server listening on port '+config.home.local_port);
});

function safeHandler(handler) {
    return function(req, res) {
        if (req.query.token == undefined || req.query.token != config.home.private_token) {
            res.status(403).send("unauthorized request");
        } else {
            handler(req, res).catch(error => res.status(500).send(error.message));
        }
    };
}

async function defaultHandler(req, res) {
    res.send('Welcome on this little server created to control NEEO recipes from Google Home via IFTTT');
}

async function recipesHandler(req, res) {
    var getAllRecipesUrl = "http://"+config.neeo.brain_ip+":3000/"+config.neeo.api_version+"/api/Recipes";
    var getAllRooms = "http://"+config.neeo.brain_ip+":3000/"+config.neeo.api_version+"/projects/home/rooms";
    try {
        var response = await fetch(getAllRecipesUrl);
        var recipes = await response.json();
        recipes.forEach(function(recipe, index) {
            var distantUrl = formatDistantUrl(recipe.url.setPowerOn, "on");;
            recipes[index].url.distantSetPowerOn = distantUrl;
            var pattern = /[0-9]{8,}/;
            var regex = new RegExp(pattern, "g");
            var matches = distantUrl.match(regex);
            recipes[index].url.distantSetPowerOnId = matches[1];
            var distantUrl = formatDistantUrl(recipe.url.setPowerOff, "off");
            recipes[index].url.distantSetPowerOff = distantUrl;
            var pattern = /[0-9]{8,}/;
            var regex = new RegExp(pattern, "g");
            var matches = distantUrl.match(regex);
            recipes[index].url.distantSetPowerOffId = matches[1];
        });
        var response = await fetch(getAllRooms);
        var roomsRaw = await response.json();
        var rooms = [];
        roomsRaw.forEach(function(room, index) {
            var roomDevices = room.devices;
            if (!(Object.keys(roomDevices).length === 0 && roomDevices.constructor === Object)) {
                Object.keys(roomDevices).forEach(function(deviceKey, index) {
                    var macros = roomDevices[deviceKey].macros;
                    Object.keys(macros).forEach(function(macroKey, index) {
                        var macro = macros[macroKey];
                        var distantUrl = formatDistantButtonUrl(macro.roomKey, macro.deviceKey, macro.key);
                        room.devices[deviceKey].macros[macroKey].distantUrl = distantUrl;
                    });
                });
                rooms.push(room);
            }
        });
        res.render('main', { title: 'Existing NEEO Recipes', recipes: recipes, rooms: rooms, runningOnConfigSample: runningOnConfigSample })
    } catch (e) {
        res.send('Error from the recipesHandler (' + e +').');
    }
}

function formatDistantUrl(url, action) {
    var pattern = /[0-9]{8,}/;
    var regex = new RegExp(pattern, "g");
    var matches = url.match(regex);
    var myToken = config.home.private_token;
    return config.home.public_dns+"/neeo?token="+myToken+"&room="+matches[0]+"&recipe="+matches[1]+"&action="+action;
}

function formatDistantButtonUrl(roomId, deviceId, buttonId) {
    var myToken = config.home.private_token;
    return config.home.public_dns+"/neeo?token="+myToken+"&room="+roomId+"&device="+deviceId+"&button="+buttonId+"&action=trigger";
}

function formatLocalUrl(action, roomId, recipeId) {
    return "http://"+config.neeo.brain_ip+":3000/"+config.neeo.api_version+"/projects/home/rooms/"+roomId+"/recipes/"+recipeId+"/"+action;
}

function formatLocalButtonUrl(action, roomId, deviceId, buttonId) {
    return url = "http://"+config.neeo.brain_ip+":3000/"+config.neeo.api_version+"/projects/home/rooms/"+roomId+"/devices/"+deviceId+"/macros/"+buttonId+"/"+action;
}

async function executeHandler(req, res) {
    try {
        var qData = req.query;
        var roomId = qData.room;
        var action = qData.action;
        var recipeId = qData.recipe;
        var deviceId = qData.device;
        var buttonId = qData.button;
        var repeat = qData.repeat;

        var authorizedActions = ["on", "off", "trigger"];
        if (action == undefined) {
            throw new Error('Missing parameter action. Cannot move on.');
        }
        if (authorizedActions.indexOf(action) === -1) {
            throw new Error('Unauthorized action. Cannot move on.');
        }
        if ((action == "on" || action == "off") && (roomId == undefined || recipeId == undefined)) {
            throw new Error('Missing parameter room or recipe for this action. Cannot move on.');
        }
        if ((action == "trigger") && (roomId == undefined || deviceId == undefined || buttonId == undefined)) {
            throw new Error('Missing parameter room, device or button for this action. Cannot move on.');
        }
        if (repeat != undefined && !Number.isInteger(parseInt(repeat, 10))) {
            throw new Error('Repeat parameter is not valid. Cannot move on.');    
        }
        if (action == "on" || action == "off") {
            var recipeIsActiveUrl = formatLocalUrl("isactive", roomId, recipeId);
            var response = await fetch(recipeIsActiveUrl);
            var responseJSON = await response.json();
            if (responseJSON.active == undefined) {
                throw new Error("Cannot get powerState for the recipe.");
            }
            if ((action == "on" && !responseJSON.active) || (action == "off" && responseJSON.active)) {
                var executeUrl = formatLocalUrl("execute", roomId, recipeId);
                var response = await fetch(executeUrl);
                res.send('OK, I received something from IFTTT and executed the recipe');
            } else {
                res.send('OK, I received something from IFTTT but nothing to do regarding state of the recipe');
            }
        }
        if (action == "trigger") {
            if (repeat == undefined) {
                repeat = 1;
            }
            var executeUrl = formatLocalButtonUrl("trigger", roomId, deviceId, buttonId);
            for (var i = 0; i < repeat; i++) {
                var response = await fetch(executeUrl);
            }
            if (repeat > 1) {
                res.send('OK, I received something from IFTTT and triggered the button '+repeat+' times');    
            }
            res.send('OK, I received something from IFTTT and triggered the button');
        }
    } catch (e) {
        res.send('Error executing action ('+e+').');
    }
}

function filterInt(value) {
    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) return Number(value);
    return NaN;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function getChannelNumberFromName(name) {
    return getKeyByValue(config.freebox.channels, name);
}

async function executeFreeboxHandler(req, res) {
    try {
        var qData = req.query;
        var channel = qData.channel;
        var roomId = config.freebox.roomId;
        var deviceId = config.freebox.deviceId;
        if (channel == undefined) {
            throw new Error('Missing parameter channel. Cannot move on.');
        }
        if (roomId == undefined) {
            throw new Error('Missing config parameter roomId for freebox. Cannot move on.');
        }
        if (deviceId == undefined) {
            throw new Error('Missing config parameter deviceId for freebox. Cannot move on.');
        }
        var filteredChannel = filterInt(channel);
        if (isNaN(filteredChannel)) {
            var channelNumber = getChannelNumberFromName(channel);
            if (channelNumber == undefined) {
                throw new Error('Impossible to find channel number for "'+channel+'". Cannot move on.');
            }
            channel = channelNumber;
        }    
        var digits = channel.split('');
        for (var i = 0; i < digits.length ; i++) {
            var digit = digits[i];
            var buttonId = config.freebox.buttons[digit];
            if (buttonId == undefined) {
                throw new Error('Button not found "'+digit+'". Cannot move on.');            
            }
            var executeUrl = formatLocalButtonUrl("trigger", roomId, deviceId, buttonId);
            var response = await fetch(executeUrl);
        }
        res.send("OK I received something from IFTTT and triggered the button(s) accordingly");
    } catch (e) {
        res.send('Error executing action ('+e+').');
    }
}