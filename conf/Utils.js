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
    }
}
