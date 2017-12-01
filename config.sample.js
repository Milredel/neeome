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

module.exports = config;