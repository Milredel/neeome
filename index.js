const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const configSample = require('./config.sample');
let runningOnConfigSample = true;
let config = configSample;

if (fs.existsSync("./config.js")) {
    config = require('./config');
    runningOnConfigSample = false;
}

const app = express();

app.set('view engine', 'pug');

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
    try {
        var response = await fetch(getAllRecipesUrl);
        var recipes = await response.json();
        recipes.forEach(function(recipe, index) {
            recipes[index].url.distantSetPowerOn = formatDistantUrl(recipe.url.setPowerOn);
            recipes[index].url.distantSetPowerOff = formatDistantUrl(recipe.url.setPowerOff);
        });
        res.render('recipes', { title: 'Existing NEEO Recipes', recipes: recipes, runningOnConfigSample: runningOnConfigSample })
    } catch (e) {
        res.send('Error from the recipesHandler (' + e +').');
    }
}

function formatDistantUrl(url) {
    var pattern = /[0-9]{8,}/;
    var regex = new RegExp(pattern, "g");
    var matches = url.match(regex);
    var myToken = config.home.private_token;
    return config.home.public_dns+"/neeo?token="+myToken+"&room="+matches[0]+"&recipe="+matches[1];
}

function formatLocalUrl(action, roomId, recipeId) {
    return "http://"+config.neeo.brain_ip+":3000/"+config.neeo.api_version+"/projects/home/rooms/"+roomId+"/recipes/"+recipeId+"/"+action;
}

async function executeHandler(req, res) {
    try {
        var qData = req.query;
        var roomId = qData.room;
        var recipeId = qData.recipe;
        if (roomId == undefined || recipeId == undefined) {
            throw new Error('Missing parameter room or recipe. Cannot move on.');
        }
        var recipeIsActiveUrl = formatLocalUrl("isactive", roomId, recipeId);
        var response = await fetch(recipeIsActiveUrl);
        var responseJSON = await response.json();
        if (responseJSON.active == undefined) {
            throw new Error("Cannot get powerState for the recipe.");
        }
        if (!responseJSON.active) {
            console.log("recipe is not active, calling execute command");
            var executeUrl = formatLocalUrl("execute", roomId, recipeId);
            var response = await fetch(executeUrl);
        } else {
            console.log("recipe already active, doing nothing");
        }
        res.send('OK, I received something from IFTTT and treated the command appropriately');
    } catch (e) {
        res.send('Error executing action ('+e+').');
    }
}