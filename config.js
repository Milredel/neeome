//-------------------------------------------
// Config initialization
//-------------------------------------------
let config = {};
config.neeo = {};
config.home = {};

//-------------------------------------------
// NEEO Settings
//-------------------------------------------

//your public ip or DNS
config.home.public_dns = 'mypublicdns';

//a private token to "authenticate" from IFTT
config.home.private_token = 'myprivatetoken';

//-------------------------------------------
// NEEO Settings
//-------------------------------------------

//neeo brain ip
config.neeo.brain_ip = '192.168.0.41';

//neeo api version
config.neeo.api_version = 'v1';

//-------------------------------------------

module.exports = config;