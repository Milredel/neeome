"use strict";

require('../conf/Constants.js');

const Logger = SRV_DEPENDENCIES.logger;
const huejay = require('huejay');

class HueLightManager {

    constructor() {
        this.client = new huejay.Client({
            host:     CONFIG.hue.bridge_ip_address,
            port:     CONFIG.hue.port,        // Optional
            username: CONFIG.hue.username,    // Optional
            timeout:  CONFIG.hue.timeout,     // Optional, timeout in milliseconds (15000 is the default)
        });
    }

    async isAuthenticated() {
        return this.client.bridge.isAuthenticated()
            .then(() => {
                return true;
            })
            .catch(error => {
                throw new Error("Not authenticated");
            });
    }

    async getAllLights() {
        await this.isAuthenticated();
        
        let result;
        return this.client.lights.getAll()
            .then(lights => {
                return lights;
            })
            .catch(error => {
                throw new Error("Cannot get all lights");
            });
    }
}

module.exports = HueLightManager;
