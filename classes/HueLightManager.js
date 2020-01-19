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

        try {
            var url = "http://" + CONFIG.hue.bridge_ip_address + "/api/" + CONFIG.hue.username +"/lights";
            var response = await fetch(url);
            let lights = await response.json();
            let myLights = [];
            for (var key of Object.keys(lights)) {
                var light = lights[key];
                light.id = key;
                var name = light.name;
                light.name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                if (light['state']['xy']) {
                    light.rgbcolor = UTILS.cie_to_rgb(light['state']['xy'][0], light['state']['xy'][1], light['state'].bri);
                }
                myLights.push(light);
            }
            return myLights;
        } catch (e) {
            throw new Error("Unable to retrieve all lights");
        }
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
