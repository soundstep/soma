/*
    sweep.js | ITV | 2018

    Romuald Quantin | romu@soundstep.com

    v___VERSION___

    Dependencies:
        - https://github.com/soundstep/infuse.js
        - http://millermedeiros.github.io/js-signals/

*/

(function (global, create) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        // register for AMD module
        define('sweep', ['signals', 'infuse'], function(signals, infuse) {
            global.sweep = create(global, {}, signals, infuse);
            return global.sweep;
        });
    }
    else if (typeof exports !== 'undefined') {
        // register for node.js or common.js
        var signals = require('signals');
        var infuse = require('infuse.js');
        create(global, exports, signals, infuse);
    }
    else {
        // register for browser
        global.sweep = create(global, {}, global.signals.Signal, global.infuse);
    }

})(this, function(global, sweep, Signal, infuse) {

    'use strict';
