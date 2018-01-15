"use strict";

const fs = require('fs');
const util = require("util");
const parseDir = util.promisify(fs.readdir);
const routesDir = BASE_DIR + '/conf/routes';
const controllersDir = BASE_DIR + '/controllers';
const Logger = SRV_DEPENDENCIES.logger;
const srvManager = SRV_DEPENDENCIES.srvManager;

class Router {

    constructor() {
        this.routes = [];
        this.routesSecured = {};
        this.controllers = {};
    }

    async loadRoutes() {
        try {
            const files = await parseDir(routesDir);

            if (!files) {
                throw new Error('Aucune route trouvée.');
            }

            let routes;

            for (let i in files) {
                const file = files[i];

                if (UTILS.isRoutingFile(file)) {
                    Logger.log('Importation des routes du fichier ' + file);

                    routes = require(routesDir + '/' + file);

                    for (let j in routes) {
                        let route = routes[j];
                        this.routes.push(route);
                    }
                }
            }
        } catch (e) {
            Logger.log(e);
            throw new Error('Une erreur est survenue lors du chargement des routes de l\'API. (Raison: ' + e + ')');
        }
    }

    async loadControllers() {
        try {
            const files = await parseDir(controllersDir);

            if (!files) {
                throw new Error('Aucun controleur trouvé.');
            }

            let Controller;
            let controllerName;

            for (let i in files) {
                const file = files[i];

                if (UTILS.isControllerFile(file)) {
                    Controller = require(controllersDir + '/' + file);
                    controllerName = UTILS.getControllerName(file);

                    Logger.log('Instanciation du contrôleur ' + controllerName + '...');
                    this.controllers[UTILS.getControllerName(file)] = new Controller();
                }
            }
        } catch (e) {
            Logger.log(e);
            throw new Error('Une erreur est survenue lors du chargement des contrôleurs de l\'API. (Raison: ' + e + ')');
        }
    }

    async generateAppRoutes() {
        const bodyParser = require('body-parser');
        const jwt = require('jsonwebtoken');
        const express = require('express');
        const cors = require('cors');

        var io = require('socket.io').listen(SRV_DEPENDENCIES.app.listen(CONFIG.home.local_port));

        io.sockets.on('connection', function (socket) {
            console.log('a user connected');
 
            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });

        SRV_DEPENDENCIES.app.use(function(req,res,next) {
            req.io = io;
            next();
        });

        SRV_DEPENDENCIES.app.use(cors({credentials: true, origin: DB.CROS_FRONT_URL}));
        SRV_DEPENDENCIES.app.use(bodyParser.urlencoded({ extended: false }));
        SRV_DEPENDENCIES.app.use(bodyParser.json());

        const apiRoutes = express.Router();

        apiRoutes.use((req, res, next) => {
            const token = SRV_DEPENDENCIES.srvManager.getTokenFromRequest(req);
        
            if (token) {
                if (token == CONFIG.home.private_token) {
                    next();
                } else {
                    const result = UTILS.formatReturn(RESULT_FORBIDDEN, "Erreur lors de l'identification du token de sécurité.", true, {});
                    return srvManager.manageResult(res, result);
                }
                /*jwt.verify(token, SRV_DEPENDENCIES.app.get('appSecret'), function(err, decoded) {      
                    if (err) {
                        const result = UTILS.formatReturn(RESULT_FORBIDDEN, "Erreur lors de l'identification du token de sécurité.", true, {});
                        return SRV_DEPENDENCIES.srvManager.manageResult(res, result);
                    } else {
                        req.appUser = decoded;    
                        next();
                    }
                });*/
            } else {
                const result = UTILS.formatReturn(RESULT_FORBIDDEN, "You forgot the magic word !", true, {});
                return SRV_DEPENDENCIES.srvManager.manageResult(res, result);
            }
        });

        for (let i in this.routes) {
            let routing = this.routes[i];
            let cls;
            let call;

            Logger.log('Génération de la route ' + routing.route + ' (method: ' + routing.method + ' / type: ' + routing.type + ')');

            if (routing.type === "controller") {
                cls = this.controllers[routing.class];
            } else if (routing.type === "dependency") {
                cls = SRV_DEPENDENCIES[routing.class];
            } else {
                throw new Error("Le router ne peut pas charger la route" + routing.route + " car son type de routing est inconnu.");
            }

            // Preparing app call
            call = cls[routing.function];

            if (routing.binding) {
                call = call.bind(cls);
            }

            let router = SRV_DEPENDENCIES.app;

            // Preparing func args
            let args = [];
            args.push(routing.route);

            // If your is secured, we need to controll user role. Changing call for Router to be the middleware app call
            if (routing.secure) {
                Logger.info('La route '+ routing.method + ':' + routing.route + ' a été ajoutée dans la vérification des routes sécurisées...');
                this.routesSecured[routing.method.toLowerCase() + ":" + routing.route] = {call: call, routing: routing};
                call = this.checkSecuredRoute.bind(this);
                router = apiRoutes;
            }

            args.push(call);

            router[routing.method].apply(router, args);
        }

        SRV_DEPENDENCIES.app.use('', apiRoutes);
    }

    async checkSecuredRoute(req, res) {
        const routeConfig = this.routesSecured[req.method.toLowerCase() + ":" + req.route.path];
        return routeConfig['call'](req, res);
        /*try {
            Logger.info('La route' + req.route.path + ' est une route sécurisée, vérification du rôle utilisateur...');

            const routeConfig = this.routesSecured[req.method.toLowerCase() + ":" + req.route.path];

            if (routeConfig.routing.hasOwnProperty('bypassRoleCheck') && routeConfig.routing.bypassRoleCheck === true) {
                Logger.success("La route " + req.method + ":" + req.route.path + " ne necessite pas de vérification de rôle utilisateur...");
                return routeConfig['call'](req, res);
            }

            const userJwt = srvManager.getTokenFromRequest(req);
            const user = srvManager.getAuthedUserFromToken(userJwt);

            //Check if user role is included in routing roles
            if (user && user.hasOwnProperty('role.keyname') && routeConfig.routing.roles.includes(user['role.keyname'])) {
                Logger.success("L'utilisateur " + user.firstname + " " + user.lastname + " dispose d'un niveau accès suffisant pour accéder à " + req.route.path);
                return routeConfig['call'](req, res);
            }

            //On renvoie dans ses 22 le gars qui ask la requête
            const result = UTILS.formatReturn(RESULT_FORBIDDEN, "Vous ne pouvez pas consulter cette ressource (Niveau d'accès insuffisant).", true, {});
            return SRV_DEPENDENCIES['srvManager'].manageResult(res, result);
        } catch (e) {
            throw new Error('Une erreur est survenue lors de la vérification d\'une route sécurisée. (Erreur: ' + e + ')');
        }*/
    }

    async start() {
        try {
            Logger.info('Chargement des routes...');
            await this.loadRoutes();
            Logger.success('Routes chargées !');

            Logger.info('Chargement des contrôleurs...');
            await this.loadControllers();
            Logger.success('Contrôleurs chargés !');

            Logger.info('Génération des routes...');
            await this.generateAppRoutes();
            Logger.success('Génération des routes réussie !');

            Logger.info('Chargement des données serveur...');
            await this.controllers['Server'].loadServerData();
            Logger.success('Données serveur chargées !');

            // Lets rock baby !
            
            Logger.success('Le serveur est démarré !');
        } catch (e) {
            Logger.err('Une erreur est survenue lors du démarrage du serveur. (Raison: ' + e + ')');
        }
    }
}

module.exports = Router;
