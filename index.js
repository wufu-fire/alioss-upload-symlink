#!/usr/bin/env node
const argv = require('yargs').argv;

const readConfigFile = require('./index.js');


if(argv.config){
    readConfigFile(argv.config);
}
