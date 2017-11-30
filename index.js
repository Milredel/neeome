const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.set('view engine', 'pug');

app.get('/', safeHandler(defaultHandler));
app.get('/recipes', safeHandler(recipesHandler));

app.listen(8080);

function safeHandler(handler) {
    return function(req, res) {
        handler(req, res).catch(error => res.status(500).send(error.message));
    };
}

async function defaultHandler(req, res) {
    res.send('Welcome on this little server created to control NEEO recipes from Google Home via IFTTT');
}

async function recipesHandler(req, res) {
    var getAllRecipesUrl = "http://"+config.neeo.brain.ip+":3000/"+config.neeo.api.version+"/api/Recipes";
    try {
        var response = await fetch(getAllRecipesUrl);
        var recipes = await response.json();
        res.render('recipes', { title: 'Existing NEEO Recipes', recipes: recipes })
    } catch (e) {
        req.send('Error from the recipesHandler (' + e +').');
    }
}