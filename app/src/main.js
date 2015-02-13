/*globals define*/
define(function(require, exports, module) {
    // import dependencies
    var Engine = require('famous/core/Engine');
    var mainContext = Engine.createContext();
    mainContext.setPerspective(2000);

    var Stock = require('stock/stock');

    var stock = new Stock();

    mainContext.add(Stock);

});
