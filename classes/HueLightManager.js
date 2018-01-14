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
        
        return this.client.lights.getAll()
            .then(lights => {
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    var name = light.name;
                    lights[i].name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                    lights[i].rgbcolor = UTILS.cie_to_rgb(light['xy'][0], light['xy'][1], light.brightness);
                }
                return lights;
            })
            .catch(error => {
                throw new Error("Cannot get all lights");
            });
    }

    async updateLight(params) {
        if (params.id == undefined) {
            throw new Error("Light id is undefined");
        }

        return this.client.lights.getById(params.id)
            .then(light => {
                for (var param in params) {
                    if (param != "id") {
                        var value = params[param];
                        if (value == "false") value = false;
                        if (value == "true") value = true;
                        light[param] = value;
                    }
                }
                return this.client.lights.save(light);
            })
            .catch(error => {
                throw new Error("Error updating light state : ("+error.stack+")");
            });
    }
}

module.exports = HueLightManager;
