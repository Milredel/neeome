"use strict";

require('../conf/Constants.js');

const Logger = SRV_DEPENDENCIES.logger;
const neeoManager = SRV_DEPENDENCIES.neeoManager;
const fs = require('fs');
const util = require("util");
const parseDir = util.promisify(fs.readdir);
const commandConfigFileDir = BASE_DIR + '/conf/commands';

class CommandConfigManager {

    constructor() {
        
    }

    async getAllCommandConfigs() {
        try {
            let commandConfigs = Array();

            const files = await parseDir(commandConfigFileDir);

            if (!files) {
                throw new Error('No command config file found.');
            }

            let commandConfig;

            for (let index in files) {
                const file = files[index];
                if (UTILS.isCommandConfigFile(file)) {
                    Logger.log('Importation du fichier ' + file);
                    var scenarioName = UTILS.getScenarioName(file);
                    commandConfig = require(commandConfigFileDir + '/' + file);

                    for (var i = 0; i < commandConfig.length; i++) {
                        var block = commandConfig[i];
                        if (block.lines != undefined) {
                            for (var j = 0; j < block.lines.length; j++) {
                                var line = block.lines[j];
                                for (var k = 0; k < line.length; k++) {
                                    var elem = line[k];
                                    if (elem.button != undefined && !(Object.keys(elem.button).length === 0 && elem.button.constructor === Object)) {
                                        var button = elem.button;
                                        var button_name = (button.button_name).replace(/ |\//g, "_");
                                        if (button.label == undefined) {
                                            if (BUTTONS[button_name] != undefined && BUTTONS[button_name].label != undefined) {
                                                commandConfig[i].lines[j][k].button.label = BUTTONS[button_name].label;
                                            }
                                        }
                                        if (button.class == undefined) {
                                            if (BUTTONS[button_name] != undefined && BUTTONS[button_name].class != undefined) {
                                                commandConfig[i].lines[j][k].button.class = BUTTONS[button_name].class;
                                            }
                                        }
                                        if (button.icon == undefined) {
                                            if (BUTTONS[button_name] != undefined && BUTTONS[button_name].icon != undefined) {
                                                commandConfig[i].lines[j][k].button.icon = BUTTONS[button_name].icon;
                                            }
                                        }
                                        var device = neeoManager.getDeviceByName(button.device_name);
                                        commandConfig[i].lines[j][k].button.distantUrl = device.macros[button.button_name].distantUrl;
                                    }
                                }
                            }
                        }
                    }
                    commandConfigs[scenarioName] = commandConfig;
                }
            }
            var data = commandConfigs;
        } catch (e) {
            Logger.log(e);
            throw new Error('Problem loading command configs. (Reason: ' + e + ')');
        }
        return data;
    }

    
}

module.exports = CommandConfigManager;
