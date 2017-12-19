"use strict";

require('../conf/Constants.js');

const util = require("util");
const request = util.promisify(require("request"));

class ServerManager {

    constructor() { }

    getTokenFromRequest(request) {
        try {
            return request.body.token || request.query.token || request.headers['x-access-token'];
        } catch(e) {
            return null;
        }
    }

    getAuthedUserFromToken(token) {
        try {
            return SRV_VARS.users[SRV_VARS.tokens[token]];
        } catch (e) {
            throw new Error('Erreur lors de la récupération des informations de l\'utilisateur après du serveur.');
        }
    }

    manageResult(res, data) {
        if (!data.error) {
            return res.json(data);
        }

        return res.status(data.code).send(data.message);
    }
}

module.exports = ServerManager;
