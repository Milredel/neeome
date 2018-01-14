"use strict";

module.exports = {
    formatReturn: function(code, message, isError, data) {
        return {'error': isError, 'code': code, 'message': message, 'data': data};
    },
    handleJsonFormatError: function(context, errors) {
        SRV_DEPENDENCIES.logger.err(errors.length + " erreurs ont été trouvé lors de la vérification du format JSON des données reçus. Contexte: " + context);
        console.log(errors);
    },
    handleExceptionError: function (ex) {
        SRV_DEPENDENCIES.logger.err('Une exception est survenue : ' + ex);
    },
    handleError: function (err) {
        SRV_DEPENDENCIES.logger.err('Une erreur est survenue : ' + err);
    },
    generateToken: function() {
        return Math.random().toString(36).substr(2);
    },
    isObject: function(val) {
        if (val === null) { return false;}
        return ( (typeof val === 'function') || (typeof val === 'object') );
    },
    isNull: function(val) {
        return (typeof val === 'undefined' || val === null);
    },
    toFrenchDate: function(date, withTime = false) {
        try {
            if (!date) {
                throw new Error('Need a date !');
            }

            let day = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
            let monthNum = date.getMonth() + 1;
            let month = (monthNum < 10 ? "0" + monthNum : monthNum);

            let result = day + "/" + month + "/" + date.getFullYear();

            if (withTime === true) {
                let hours = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours());
                let minutes = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
                let seconds = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());

                result += " " + hours + ':' + minutes + ':' + seconds;
            }

            return result;
        } catch (e) {
            return date;
        }
    },
    isRoutingFile: function(filename) {
        return filename.match(/([a-zA-Z_-]+)\.routing\.json$/);
    },
    isControllerFile: function(filename) {
        return filename.match(/([a-zA-Z]+)Controller\.js$/);
    },
    getControllerName: function(filename) {
        try {
            return filename.match(/([a-zA-Z]+)Controller\.js$/)[1];
        } catch(e) {
            throw new Error('Erreur lors de la récupération du nom du controleur pour le fichier ' + filename);
        }
    },
    isCommandConfigFile: function(filename) {
        return filename.match(/^commands-scenario-([a-zA-Z_-\s]+)\.json$/);
    },
    getScenarioName: function(filename) {
        try {
            return filename.match(/^commands-scenario-([a-zA-Z_-\s]+)\.json$/)[1];
        } catch(e) {
            throw new Error('Error while getting scenario name for ' + filename);
        }
    },
    applyObjectChanges: function(object, changes) {
        for (let prop in changes) {
            object[prop] = changes[prop];
        }

        return object;
    },
    getDaysInMonth: function(month, year) {
        return new Date(year, month, 0).getDate();
    },
    getMonthLabelFromNum: function(monthNumber) {
        const months = ['Janv.', 'Fév.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Aôut', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
        return months[monthNumber];
    },
    formatDistantUrl: function(url, action) {
        var pattern = /[0-9]{8,}/;
        var regex = new RegExp(pattern, "g");
        var matches = url.match(regex);
        var myToken = CONFIG.home.private_token;
        return CONFIG.home.public_dns+"/neeo?token="+myToken+"&room="+matches[0]+"&recipe="+matches[1]+"&action="+action;
    },
    formatDistantButtonUrl: function(roomId, deviceId, buttonId) {
        var myToken = CONFIG.home.private_token;
        return CONFIG.home.public_dns+"/neeo?token="+myToken+"&room="+roomId+"&device="+deviceId+"&button="+buttonId+"&action=trigger";
    },
    formatLocalUrl: function(action, roomId, recipeId) {
        return "http://"+CONFIG.neeo.brain_ip+":3000/"+CONFIG.neeo.api_version+"/projects/home/rooms/"+roomId+"/recipes/"+recipeId+"/"+action;
    },
    formatLocalButtonUrl: function(action, roomId, deviceId, buttonId) {
        return "http://"+CONFIG.neeo.brain_ip+":3000/"+CONFIG.neeo.api_version+"/projects/home/rooms/"+roomId+"/devices/"+deviceId+"/macros/"+buttonId+"/"+action;
    },
    filterInt: function(value) {
        if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) return Number(value);
        return NaN;
    },
    getKeyByValue: function(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    },
    getChannelNumberFromName: function(name) {
        return getKeyByValue(CONFIG.freebox.channels, name);
    },
    /**
     * Converts CIE color space to RGB color space
     * @param {Number} x
     * @param {Number} y
     * @param {Number} brightness - Ranges from 1 to 254
     * @return {Array} Array that contains the color values for red, green and blue
     */
    cie_to_rgb: function(x, y, brightness) {
        //Set to maximum brightness if no custom value was given (Not the slick ECMAScript 6 way for compatibility reasons)
        if (brightness === undefined) {
            brightness = 254;
        }

        var z = 1.0 - x - y;
        var Y = (brightness / 254).toFixed(2);
        var X = (Y / y) * x;
        var Z = (Y / y) * z;

        //Convert to RGB using Wide RGB D65 conversion
        var red     =  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
        var green   = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
        var blue    =  X * 0.051713 - Y * 0.121364 + Z * 1.011530;

        //If red, green or blue is larger than 1.0 set it back to the maximum of 1.0
        if (red > blue && red > green && red > 1.0) {

            green = green / red;
            blue = blue / red;
            red = 1.0;
        }
        else if (green > blue && green > red && green > 1.0) {

            red = red / green;
            blue = blue / green;
            green = 1.0;
        }
        else if (blue > red && blue > green && blue > 1.0) {

            red = red / blue;
            green = green / blue;
            blue = 1.0;
        }

        //Reverse gamma correction
        red     = red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
        green   = green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
        blue    = blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;


        //Convert normalized decimal to decimal
        red     = Math.round(red * 255);
        green   = Math.round(green * 255);
        blue    = Math.round(blue * 255);

        if (isNaN(red))
            red = 0;

        if (isNaN(green))
            green = 0;

        if (isNaN(blue))
            blue = 0;


        return [red, green, blue];
    },
    /**
     * Converts RGB color space to CIE color space
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     * @return {Array} Array that contains the CIE color values for x and y
     */
    rgb_to_cie: function(red, green, blue) {
        //Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
        var red     = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
        var green   = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
        var blue    = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92); 

        //RGB values to XYZ using the Wide RGB D65 conversion formula
        var X       = red * 0.664511 + green * 0.154324 + blue * 0.162028;
        var Y       = red * 0.283881 + green * 0.668433 + blue * 0.047685;
        var Z       = red * 0.000088 + green * 0.072310 + blue * 0.986039;

        //Calculate the xy values from the XYZ values
        var x       = (X / (X + Y + Z)).toFixed(4);
        var y       = (Y / (X + Y + Z)).toFixed(4);

        if (isNaN(x))
            x = 0;

        if (isNaN(y))
            y = 0;   


        return [x, y];
    }
}
