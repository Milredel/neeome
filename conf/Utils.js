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


        return [parseFloat(x), parseFloat(y)];
    },
    sortObj: function(obj, type, caseSensitive) {
        var temp_array = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (!caseSensitive) {
                    key = (key['toLowerCase'] ? key.toLowerCase() : key);
                }
                temp_array.push(key);
            }
        }
        if (typeof type === 'function') {
            temp_array.sort(type);
        } else if (type === 'value') {
            temp_array.sort(function(a,b) {
                var x = obj[a];
                var y = obj[b];
                if (!caseSensitive) {
                    x = (x['toLowerCase'] ? x.toLowerCase() : x);
                    y = (y['toLowerCase'] ? y.toLowerCase() : y);
                }
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        } else {
            temp_array.sort();
        }
        var temp_obj = {};
        for (var i=0; i<temp_array.length; i++) {
            temp_obj[temp_array[i]] = obj[temp_array[i]];
        }
        return temp_obj;
    },
    colors: function () {
        /**
         * Represents a CIE 1931 XY coordinate pair.
         *
         * @param {Number} X coordinate.
         * @param {Number} Y coordinate.
         * @constructor
         */
        var XYPoint = function (x, y) {
            this.x = x;
            this.y = y;
        },

        Red = new XYPoint(0.675, 0.322),
        Lime = new XYPoint(0.4091, 0.518),
        Blue = new XYPoint(0.167, 0.04),

        /**
         * Parses a valid hex color string and returns the Red RGB integer value.
         *
         * @param {String} Hex color string.
         * @return {Number} Red integer value.
         */
        hexToRed = function (hex) {
            return parseInt( hex.substring(0, 2), 16 );
        },

        /**
         * Parses a valid hex color string and returns the Green RGB integer value.
         *
         * @param {String} Hex color string.
         * @return {Number} Green integer value.
         */
        hexToGreen = function (hex) {
            return parseInt( hex.substring(2, 4), 16 );
        },

        /**
         * Parses a valid hex color string and returns the Blue RGB integer value.
         *
         * @param {String} Hex color string.
         * @return {Number} Blue integer value.
         */
        hexToBlue = function (hex) {
            return parseInt( hex.substring(4, 6), 16 );
        },

        /**
         * Converts a valid hex color string to an RGB array.
         *
         * @param {String} Hex color String (e.g. FF00FF)
         * @return {Array} Array containing R, G, B values
         */
        hexToRGB = function (h) {
            var rgb = [hexToRed(h), hexToGreen(h), hexToBlue(h)];
            return rgb;
        },

        /**
         * Converts an RGB component to a hex string.
         *
         * @param {Number} RGB value, integer between 0 and 255.
         * @returns {String} Hex value string (e.g. FF)
         */
        componentToHex = function (c) {
            var hex = c.toString(16);
            return hex.length == 1 ? '0' + hex : hex;
        },

        /**
         * Converts RGB color components to a valid hex color string.
         *
         * @param {Number} RGB red value, integer between 0 and 255.
         * @param {Number} RGB green value, integer between 0 and 255.
         * @param {Number} RGB blue value, integer between 0 and 255.
         * @returns {String} Hex color string (e.g. FF0000)
         */
        rgbToHex = function (r, g, b) {
            return componentToHex(r) + componentToHex(g) + componentToHex(b);
        },

        /**
         * Generates a random number between 'from' and 'to'.
         *
         * @param {Number} Number representing the start of a range.
         * @param {Number} Number representing the end of a range.
         */
        randomFromInterval = function (from /* Number */, to /* Number */) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        },

        /**
         * Return a random Integer in the range of 0 to 255, representing an RGB
         * color value.
         *
         * @return {number} Integer between 0 and 255.
         */
        randomRGBValue = function () {
            return randomFromInterval(0, 255);
        },

        /**
         * Returns the cross product of two XYPoints.
         *
         * @param {XYPoint} Point 1.
         * @param {XYPoint} Point 2.
         * @return {Number} Cross-product of the two XYPoints provided.
         */
        crossProduct = function (p1, p2) {
            return (p1.x * p2.y - p1.y * p2.x);
        },

        /**
         * Check if the provided XYPoint can be recreated by a Hue lamp.
         *
         * @param {XYPoint} XYPoint to check.
         * @return {boolean} Flag indicating if the point is within reproducible range.
         */
        checkPointInLampsReach = function (p) {
            var v1 = new XYPoint(Lime.x - Red.x, Lime.y - Red.y),
                v2 = new XYPoint(Blue.x - Red.x, Blue.y - Red.y),

                q = new XYPoint(p.x - Red.x, p.y - Red.y),

                s = crossProduct(q, v2) / crossProduct(v1, v2),
                t = crossProduct(v1, q) / crossProduct(v1, v2);

            return (s >= 0.0) && (t >= 0.0) && (s + t <= 1.0);
        },

        /**
         * Find the closest point on a line. This point will be reproducible by a Hue lamp.
         *
         * @param {XYPoint} The point where the line starts.
         * @param {XYPoint} The point where the line ends.
         * @param {XYPoint} The point which is close to the line.
         * @return {XYPoint} A point that is on the line, and closest to the XYPoint provided.
         */
        getClosestPointToLine = function (A, B, P) {
            var AP = new XYPoint(P.x - A.x, P.y - A.y),
                AB = new XYPoint(B.x - A.x, B.y - A.y),
                ab2 = AB.x * AB.x + AB.y * AB.y,
                ap_ab = AP.x * AB.x + AP.y * AB.y,
                t = ap_ab / ab2;

            if (t < 0.0) {
                t = 0.0;
            } else if (t > 1.0) {
                t = 1.0;
            }

            return new XYPoint(A.x + AB.x * t, A.y + AB.y * t);
        },

        getClosestPointToPoint = function (xyPoint) {
            // Color is unreproducible, find the closest point on each line in the CIE 1931 'triangle'.
            var pAB = getClosestPointToLine(Red, Lime, xyPoint),
                pAC = getClosestPointToLine(Blue, Red, xyPoint),
                pBC = getClosestPointToLine(Lime, Blue, xyPoint),

                // Get the distances per point and see which point is closer to our Point.
                dAB = getDistanceBetweenTwoPoints(xyPoint, pAB),
                dAC = getDistanceBetweenTwoPoints(xyPoint, pAC),
                dBC = getDistanceBetweenTwoPoints(xyPoint, pBC),

                lowest = dAB,
                closestPoint = pAB;

            if (dAC < lowest) {
                lowest = dAC;
                closestPoint = pAC;
            }

            if (dBC < lowest) {
                lowest = dBC;
                closestPoint = pBC;
            }

            return closestPoint;
        },

        /**
         * Returns the distance between two XYPoints.
         *
         * @param {XYPoint} The first point.
         * @param {XYPoint} The second point.
         * @param {Number} The distance between points one and two.
         */
        getDistanceBetweenTwoPoints = function (one, two) {
            var dx = one.x - two.x, // horizontal difference
                dy = one.y - two.y; // vertical difference

            return Math.sqrt(dx * dx + dy * dy);
        },

        /**
         * Returns an XYPoint object containing the closest available CIE 1931
         * coordinates based on the RGB input values.
         *
         * @param {Number} RGB red value, integer between 0 and 255.
         * @param {Number} RGB green value, integer between 0 and 255.
         * @param {Number} RGB blue value, integer between 0 and 255.
         * @return {XYPoint} CIE 1931 XY coordinates, corrected for reproducibility.
         */
        getXYPointFromRGB = function (red, green, blue) {

            var r = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92),
                g = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92),
                b = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92),

                X = r * 0.4360747 + g * 0.3850649 + b * 0.0930804,
                Y = r * 0.2225045 + g * 0.7168786 + b * 0.0406169,
                Z = r * 0.0139322 + g * 0.0971045 + b * 0.7141733,

                cx = X / (X + Y + Z),
                cy = Y / (X + Y + Z);

            cx = isNaN(cx) ? 0.0 : cx;
            cy = isNaN(cy) ? 0.0 : cy;

            //Check if the given XY value is within the colourreach of our lamps.
            var xyPoint = new XYPoint(cx, cy),
                inReachOfLamps = checkPointInLampsReach(xyPoint);

            if (!inReachOfLamps) {
                var closestPoint = getClosestPointToPoint(xyPoint);
                cx = closestPoint.x;
                cy = closestPoint.y;
            }

            return new XYPoint(cx, cy);
        },

        /**
         * Returns a rgb array for given x, y values. Not actually an inverse of
         * getXYPointFromRGB. Implementation of the instructions found on the
         * Philips Hue iOS SDK docs: http://goo.gl/kWKXKl
         */
        getRGBFromXYAndBrightness = function (x, y, bri) {
            var xyPoint = new XYPoint(x, y);

            if (bri === undefined) {
                bri = 1;
            }

            // Check if the xy value is within the color gamut of the lamp.
            // If not continue with step 2, otherwise step 3.
            // We do this to calculate the most accurate color the given light can actually do.
            if (! checkPointInLampsReach(xyPoint)) {
                // Calculate the closest point on the color gamut triangle
                // and use that as xy value See step 6 of color to xy.
                xyPoint = getClosestPointToPoint(xyPoint);
            }

            // Calculate XYZ values Convert using the following formulas:
            var Y = bri,
                X = (Y / xyPoint.y) * xyPoint.x,
                Z = (Y / xyPoint.y) * (1 - xyPoint.x - xyPoint.y);

            // Convert to RGB using Wide RGB D65 conversion.
            var rgb =  [
                 X * 1.612 - Y * 0.203 - Z * 0.302,
                -X * 0.509 + Y * 1.412 + Z * 0.066,
                 X * 0.026 - Y * 0.072 + Z * 0.962
            ];

            // Apply reverse gamma correction.
            rgb = rgb.map(function (x) {
                return (x <= 0.0031308) ? (12.92 * x) : ((1.0 + 0.055) * Math.pow(x, (1.0 / 2.4)) - 0.055);
            });

            // Bring all negative components to zero.
            rgb = rgb.map(function (x) { return Math.max(0, x); });

            // If one component is greater than 1, weight components by that value.
            var max = Math.max(rgb[0], rgb[1], rgb[2]);
            if (max > 1) {
                rgb = rgb.map(function (x) { return x / max; });
            }

            rgb = rgb.map(function (x) { return Math.floor(x * 255); });

            return rgb;
        };

        /**
         * Publicly accessible functions exposed as API.
         */
        return {
            /**
             * Converts hexadecimal colors represented as a String to approximate
             * CIE 1931 coordinates. May not produce accurate values.
             *
             * @param {String} Value representing a hexadecimal color value
             * @return {Array{Number}} Approximate CIE 1931 x,y coordinates.
             */
            hexToCIE1931 : function (h) {
                var rgb = hexToRGB(h);
                return this.rgbToCIE1931(rgb[0], rgb[1], rgb[2]);
            },

            /**
             * Converts red, green and blue integer values to approximate CIE 1931
             * x and y coordinates. Algorithm from:
             * http://www.easyrgb.com/index.php?X=MATH&H=02#text2. May not produce
             * accurate values.
             *
             * @param {Number} red Integer in the 0-255 range.
             * @param {Number} green Integer in the 0-255 range.
             * @param {Number} blue Integer in the 0-255 range.
             * @return {Array{Number}} Approximate CIE 1931 x,y coordinates.
             */
            rgbToCIE1931 : function (red, green, blue) {
                var point = getXYPointFromRGB(red, green, blue);
                return [point.x, point.y];
            },

            /**
             * Returns the approximate CIE 1931 x,y coordinates represented by the
             * supplied hexColor parameter, or of a random color if the parameter
             * is not passed.
             *
             * @param {String} hexColor String representing a hexidecimal color value.
             * @return {Array{Number}} Approximate CIE 1931 x,y coordinates.
             */
            getCIEColor : function (hexColor /* String */) {
                var hex = hexColor || null,
                    xy = [];
                if (null !== hex) {
                    xy = this.hexToCIE1931(hex);
                } else {
                    var r = randomRGBValue(),
                        g = randomRGBValue(),
                        b = randomRGBValue();
                    xy = this.rgbToCIE1931(r, g, b);
                }
                return xy;
            },

            /**
             * Returns the approximate hexColor represented by the supplied
             * CIE 1931 x,y coordinates and brightness value.
             *
             * @param {Number} X coordinate.
             * @param {Number} Y coordinate.
             * @param {Number} brightness value expressed between 0 and 1.
             * @return {String} hex color string.
             */
            CIE1931ToHex : function (x, y, bri) {
                if (bri === undefined) {
                    bri = 1;
                }
                var rgb = getRGBFromXYAndBrightness(x, y, bri);
                return rgbToHex(rgb[0], rgb[1], rgb[2]);
            },

            hexFullRed:     "FF0000",
            hexFullGreen:   "00FF00",
            hexFullBlue:    "0000FF",
            hexFullWhite:   "FFFFFF"
        };
    }
}
