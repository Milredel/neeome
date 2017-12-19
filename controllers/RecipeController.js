"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;

class RecipeController {

    constructor() { }

    async displayRecipes(req, res) {
        let result;

        const recipes = SRV_VARS.data.recipes;
        const rooms = SRV_VARS.data.rooms;
        
        return res.render('recipes', { title: 'Existing NEEO Recipes', recipes: recipes, rooms: rooms, runningOnConfigSample: CONFIG.ISCONFIGSAMPLE })
    }
}

module.exports = RecipeController;
