const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const configSample = require('./config.sample');
let runningOnConfigSample = true;
let config = configSample;

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
            recipes[index].url.distantSetPowerOn = formatDistantUrl(recipe.url.setPowerOn, "on");
            recipes[index].url.distantSetPowerOff = formatDistantUrl(recipe.url.setPowerOff, "off");
        });
        var response = await fetch(getAllRooms);
        var roomsRaw = await response.json();
        var rooms = [];
        roomsRaw.forEach(function(room, index) {
            var roomDevices = room.devices;
            if (!(Object.keys(roomDevices).length === 0 && roomDevices.constructor === Object)) {
                Object.keys(roomDevices).forEach(function(key, index) {
                    //TODO generate url for each macro                    
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

function formatLocalUrl(action, roomId, recipeId) {
    return "http://"+config.neeo.brain_ip+":3000/"+config.neeo.api_version+"/projects/home/rooms/"+roomId+"/recipes/"+recipeId+"/"+action;
}

async function executeHandler(req, res) {
    try {
        var qData = req.query;
        var roomId = qData.room;
        var action = qData.action;
        var recipeId = qData.recipe;
        if (roomId == undefined || recipeId == undefined || action == undefined) {
            throw new Error('Missing parameter room, recipe or action. Cannot move on.');
        }
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
    } catch (e) {
        res.send('Error executing action ('+e+').');
    }
}