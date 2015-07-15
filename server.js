#!/usr/bin/env node
'use strict';


var express = require('express');
var morgan = require('morgan');


module.exports = (function () {
    var port = 3000;
    console.log('starting express on port', port);
    var app = express();
    app.use(morgan('combined'));
    app.use(express.static('.'));
    app.listen(port);
})();
