//-------------------------------------------
// Config initialization
//-------------------------------------------
let config = {};
config.neeo = {};
config.home = {};
config.freebox = {};
config.googlehome = {};
config.hue = {};

//-------------------------------------------
// NEEO Settings
//-------------------------------------------

//your public ip or DNS
config.home.public_dns = 'myowndns';

//a private token to "authenticate" from IFTT
config.home.private_token = 'myprivatetoken';

//the port you want this server to listen to
config.home.local_port = 8080;

//-------------------------------------------
// NEEO Settings
//-------------------------------------------

//neeo brain ip
config.neeo.brain_ip = 'myneeobrainip';

//neeo api version
config.neeo.api_version = 'v1';

//-------------------------------------------
// Google Home Settings
//-------------------------------------------

config.googlehome.ip_address = 'googlehomelocalip';

//-------------------------------------------
// Philips Hue Settings
//-------------------------------------------

//Philips Hue Bridge IP address
config.hue.bridge_ip_address = 'philipshuebridgelocalip';

//port used to communicate with bridge
config.hue.port = 80;

//username used to communicate with bridge/
//to be created manually (one tap on bridge needed)
config.hue.username = 'myhueusername';

//timeout for hue request
config.hue.timeout = 15000;

//-------------------------------------------
// Freebox Settings
//-------------------------------------------

config.freebox.roomId = "myfreeeboxroomid";

config.freebox.deviceId = "myfreeboxdeviceid";

config.freebox.buttons = {
    "1" : "buttondigit1id",
    "2" : "buttondigit2id",
    "3" : "buttondigit3id",
    "4" : "buttondigit4id",
    "5" : "buttondigit5id",
    "6" : "buttondigit6id",
    "7" : "buttondigit7id",
    "8" : "buttondigit8id",
    "9" : "buttondigit9id",
    "0" : "buttondigit0id",
    "red" : "buttonredid"
};

config.freebox.channels = {
    "1" : "TF 1",
    "2" : "france 2",
    "3" : "france 3",
    "4" : "Canal",
    "5" : "france 5",
    "6" : "M 6",
    "7" : "Arte",
    "8" : "C 8",
    "9" : "W 9",
    "10" : "TMC",
    "11" : "TFX",
    "12" : "NRJ 12",
    "14" : "france 4",
    "16" : "cnews",
    "17" : "cstar",
    "18" : "Gulli",
    "19" : "France Ô",
    "20" : "TF1 Séries Films",
    "21" : "l ' Equipe 21",
    "22" : "6 ter",
    "23" : "numéro 23",
    "24" : "RMC découverte",
    "25" : "Chérie 25",
    "28" : "Paris Première",
    "29" : "RTL 9",
    "31" : "BeIn Sport 1",
    "32" : "BeIn Sport 2",
    "33" : "BeIn Sport 3",
    "34" : "Eurosport 1",
    "35" : "Eurosport 2",
    "37" : "Game One",
    "38" : "Téva",
    "39" : "AB 1",
    "48" : "Disney Channel",
    "49" : "Disney Channel   1",
    "60" : "National Geographic Channel",
    "61" : "NAT géo wild",
    "71" : "TV Breizh",
    "80" : "comédie plus",
    "81" : "polar plus",
    "82" : "Warner TV",
    "83" : "Série Club",
    "90" : "manga",
    "red" : "chaîne précédente"
};

config.freebox.channels_for_program = {
    1: "TF1",
    2: "France 2",
    3: "France 3",
    4: "Canal+",
    5: "France 5",
    6: "M6",
    7: "Arte",
    8: "C8",
    9: "W9",
    10: "TMC",
    11: "TFX",
    12: "NRJ 12",
    14: "France 4",
    16: "CNews",
    17: "CStar",
    18: "Gulli",
    19: "France Ô",
    20: "TF1 Séries Films",
    21: "L'Equipe",
    22: "6ter",
    23: "Numéro 23",
    24: "RMC Découverte",
    25: "Chérie 25",
    28: "Paris Première",
    29: "RTL9",
    31: "beIN SPORTS 1",
    32: "beIN SPORTS 2",
    33: "beIN SPORTS 3",
    34: "Eurosport 1",
    35: "Eurosport 2",
    37: "Game One",
    38: "TEVA",
    39: "AB 1",
    48: "Disney Channel",
    49: "Disney Channel +1",
    60: "National Geographic Channel",
    61: "Nat geo wild",
    71: "TV Breizh",
    80: "Comedie+",
    81: "Polar+",
    82: "Warner TV",
    83: "Série Club",
    90: "Mangas"
}

//-------------------------------------------

module.exports = config;