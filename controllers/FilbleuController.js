"use strict";

const Logger = SRV_DEPENDENCIES.logger;
const Speaker = SRV_DEPENDENCIES.speaker;
const FormData = require('form-data');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

class FilbleuController {

    constructor() { }

    async getFilbleuHoraires(req, res) {
        try {
            var qData = req.query;
            var arret = qData.arret;
            
            var authorizedArrets = ["porte de Loire", "saint - cyr mairie"];
            if (authorizedArrets.indexOf(arret) === -1) {
                Speaker.action("Désolé, je ne connais pas cet arrêt.");
                throw new Error('Unauthorized arret. Cannot move on.');
            }

            var executeUrl = "https://www.filbleu.fr/horaires-et-trajet/horaires-temps-reel?view=tempsreel";

            const form = new FormData();
            form.append('id_ligne', '953');
            form.append('id_arret', 'WEDEB-1,WEDEB-2');
            form.append('ordering', 1);
            form.append('user', 0);
            
            var options = { method: 'POST', 
                            body: form };
            var response = await fetch(executeUrl, options);
            var responseText = await response.text();

            var $ = cheerio.load(responseText);

            var horairesPorteDeLoire, horairesStCyrMairie = null;
            $('.result #resultslist .item').each(function(index) {
                if ($(this).find(".passage0 em").length > 0) {
                    var horaire1 = "inconnu";
                } else {
                    var horaire1 = $(this).find('.passage0').text();
                }
                if ($(this).find(".passage1 em").length > 0) {
                    var horaire2 = "inconnu";
                } else {
                    var horaire2 = $(this).find('.passage1').text();
                }
            
                if (index == 1) {
                    horairesPorteDeLoire = {horaire1 : horaire1,
                                            horaire2 : horaire2};
                } else if (index == 0) {
                    horairesStCyrMairie = {horaire1 : horaire1,
                                            horaire2 : horaire2};
                }
            });

            if (horairesPorteDeLoire != null || horairesStCyrMairie != null) {
                if (arret == "porte de Loire") {
                    var horaire1 = horairesPorteDeLoire["horaire1"];
                    var horaire2 = horairesPorteDeLoire["horaire2"];
                    if (horaire1 == "inconnu" && horaire2 == "inconnu") {
                        Speaker.action("Désolé, les horaires sont inconnues chez Fil Bleu");
                    } else {
                        var sentence = "Le prochain bus vers Porte de Loire est dans ";
                        if (horaire1 == "inconnu") {
                            sentence += horaire2;
                        } else {
                            sentence += horaire1;
                            if (horaire2 != "inconnu") {
                                sentence += "Le suivant dans "+horaire2;
                            }
                        }
                    }
                    Speaker.action(sentence);
                }
                if (arret == "saint - cyr mairie") {
                    var horaire1 = horairesStCyrMairie["horaire1"];
                    var horaire2 = horairesStCyrMairie["horaire2"];
                    if (horaire1 == "inconnu" && horaire2 == "inconnu") {
                        Speaker.action("Désolé, les horaires sont inconnues chez Fil Bleu");
                    } else {
                        var sentence = "Le prochain bus vers Saint Cyr Mairie est dans ";
                        if (horaire1 == "inconnu") {
                            sentence += horaire2;
                        } else {
                            sentence += horaire1;
                            if (horaire2 != "inconnu") {
                                sentence += "Le suivant dans "+horaire2;
                            }
                        }
                    }
                    Speaker.action(sentence);
                }
            } else {
                Speaker.action("Désolé, je n'ai pas réussi à récupérer l'information");
            }

            res.send("OK, I gave the information I could retrieve");
        } catch (e) {
            res.send('Error executing action ('+e+').');
        }
    }
}

module.exports = FilbleuController;
