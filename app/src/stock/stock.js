define(function(require, exports, module) {

    var Engine = require('famous/core/Engine');
    var View = require('famous/core/View');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var ImageSurface = require('famous/surfaces/ImageSurface');

    function Stock(){

        View.call(this);
        _init.call(this);

    }

    Stock.prototype = Object.create(View.prototype);
    Stock.prototype.constructor = Stock;

    function _init(){
        //this.QuoteService('CSCO');
        this.QuoteServiceDetail('CSCO');
    }

    /**
     * Define the QuoteService.
     * First argument is symbol (string) for the quote. Examples: AAPL, MSFT, JNJ, GOOG.
     * Second argument is fCallback, a callback function executed onSuccess of API.
     */
    Stock.prototype.QuoteService = function(sSymbol) {
        this.symbol = sSymbol;

        this.DATA_SRC = "http://dev.markitondemand.com/Api/v2/Quote/jsonp";
        this.makeRequest();
    };

    Stock.prototype.QuoteServiceDetail = function(sSymbol) {
        this.symbol = {parameters: JSON.stringify({
            Normalized: false,
            StartDate: '2014-01-01T00:00:00-00',
            EndDate: '2015-02-11T00:00:00-00',
            //NumberOfDays: 1,
            //LabelPeriod: 'Week',
            LabelInterval: 1,
            DataPeriod: "Week",
            Elements: [
                {
                    Symbol: sSymbol,
                    Type: "price",
                    Params: ["ohlc"] //ohlc, c = close only
                },
                {
                    Symbol: sSymbol,
                    Type: "volume"
                }
            ]
        })};
        this.DATA_SRC = "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp";
        this.makeRequest();
    };

    /**
     * Ajax success callback. fCallback is the 2nd argument in the QuoteService constructor.
     */
    Stock.prototype.handleSuccess = function(jsonResult) {
        console.log(jsonResult);
    };

    /**
     * Ajax error callback
     */
    Stock.prototype.handleError = function(jsonResult) {
        console.log(jsonResult);
    };

    /**
     * Starts a new ajax request to the Quote API
     */
    Stock.prototype.makeRequest = function() {
        //Abort any open requests
        if (this.xhr) { this.xhr.abort(); }
        //Start a new request
        this.xhr = $.ajax({
            data: this.symbol,
            url: this.DATA_SRC,
            dataType: "jsonp",
            success: this.handleSuccess,
            error: this.handleError,
            context: this
        });
    };

    Stock.prototype._fixDate = function(dateIn) {
        var dat = new Date(dateIn);
        return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
    };

    Stock.prototype._getOHLC = function(json) {
        var dates = json.Dates || [];
        var elements = json.Elements || [];
        var chartSeries = [];

        if (elements[0]){

            for (var i = 0, datLen = dates.length; i < datLen; i++) {
                var dat = this._fixDate( dates[i] );
                var pointData = [
                    dat,
                    elements[0].DataSeries['open'].values[i],
                    elements[0].DataSeries['high'].values[i],
                    elements[0].DataSeries['low'].values[i],
                    elements[0].DataSeries['close'].values[i]
                ];
                chartSeries.push( pointData );
            }
        }
        return chartSeries;
    };

    Stock.prototype._getVolume = function(json) {
        var dates = json.Dates || [];
        var elements = json.Elements || [];
        var chartSeries = [];

        if (elements[1]){

            for (var i = 0, datLen = dates.length; i < datLen; i++) {
                var dat = this._fixDate( dates[i] );
                var pointData = [
                    dat,
                    elements[1].DataSeries['volume'].values[i]
                ];
                chartSeries.push( pointData );
            }
        }
        return chartSeries;
    };

    Stock.prototype.render = function(data) {
        //console.log(data)
        // split the data set into ohlc and volume
        var ohlc = this._getOHLC(data),
            volume = this._getVolume(data);

        // set the allowed units for data grouping
        var groupingUnits = [[
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]];

        // create the chart
        $('#chartDemoContainer').highcharts('StockChart', {

            rangeSelector: {
                selected: 1
                //enabled: false
            },

            title: {
                text: this.symbol + ' Historical Price'
            },

            yAxis: [{
                title: {
                    text: 'OHLC'
                },
                height: 200,
                lineWidth: 2
            }, {
                title: {
                    text: 'Volume'
                },
                top: 300,
                height: 100,
                offset: 0,
                lineWidth: 2
            }],

            series: [{
                type: 'candlestick',
                name: this.symbol,
                data: ohlc,
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                }
            }],
            credits: {
                enabled:false
            }
        });
    };

    module.exports = Stock;

});
