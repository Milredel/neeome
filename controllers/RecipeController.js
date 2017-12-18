"use strict";

const Logger = SRV_DEPENDENCIES.logger;

class RecipeController {

    constructor() { }

    async displayRecipes(req, res) {
        let result;

        const recipes = SRV_VARS.data.recipes;
        const rooms = SRV_VARS.data.rooms;
        
        
        return res.render('main', { title: 'Existing NEEO Recipes', recipes: recipes, rooms: rooms, runningOnConfigSample: CONFIG.ISCONFIGSAMPLE })
    }
}

module.exports = RecipeController;
