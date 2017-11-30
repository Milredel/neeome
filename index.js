const express = require('express');
const fetch = require('node-fetch');
const config = require('./config.sample');

const app = express();

app.set('view engine', 'pug');

app.get('/', safeHandler(defaultHandler));
app.get('/recipes', safeHandler(recipesHandler));
app.get('/neeo', safeHandler(executeHandler));

app.listen(8080);

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
        res.render('recipes', { title: 'Existing NEEO Recipes', recipes: recipes })
    } catch (e) {
        req.send('Error from the recipesHandler (' + e +').');
    }
}

function formatDistantUrl(url) {
    var pattern = /[0-9]{8,}/;
    var regex = new RegExp(pattern, "g");
    var matches = url.match(regex);
    var myToken = config.home.private_token;
    return config.home.public_dns+"/neeo?token="+myToken+"&room="+matches[0]+"&recipe="+matches[1];
}

async function executeHandler(req, res) {
    res.send('OK, I received something from IFTTT, sending command to NEEO');
}