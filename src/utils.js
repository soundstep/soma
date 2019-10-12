const utils = {};

utils.is = {
    object: (value) => typeof value === 'object' && value !== null,
    array: Array.isArray || ((value) => Object.prototype.toString.call(value) === '[object Array]'),
    func: (value) => typeof value === 'function'
};

utils.applyProperties = (target, extension, bindToExtension, list) => {
    if (Object.prototype.toString.apply(list) === '[object Array]') {
        for (const i = 0, l = list.length; i < l; i++) {
            if (target[list[i]] === undefined || target[list[i]] === null) {
                if (bindToExtension && typeof extension[list[i]] === 'function') {
                    target[list[i]] = extension[list[i]].bind(extension);
                }
                else {
                    target[list[i]] = extension[list[i]];
                }
            }
        }
    }
    else {
        for (const prop in extension) {
            if (bindToExtension && typeof extension[prop] === 'function') {
                target[prop] = extension[prop].bind(extension);
            }
            else {
                target[prop] = extension[prop];
            }
        }
    }
};

utils.augment = (target, extension, list) => {
    if (!extension.prototype || !target.prototype) {
        return;
    }
    if (Object.prototype.toString.apply(list) === '[object Array]') {
        for (const i = 0, l = list.length; i < l; i++) {
            if (!target.prototype[list[i]]) {
                target.prototype[list[i]] = extension.prototype[list[i]];
            }
        }
    }
    else {
        for (const prop in extension.prototype) {
            if (!target.prototype[prop]) {
                target.prototype[prop] = extension.prototype[prop];
            }
        }
    }
};

utils.inherit = (parent, obj) => {
    let Parent;
    if (obj && obj.hasOwnProperty('constructor')) {
        // use constructor if defined
        Parent = obj.constructor;
    } else {
        // call the super constructor
        Parent = function () {
            return parent.apply(this, arguments);
        };
    }
    // set the prototype chain to inherit from the parent without calling parent's constructor
    const Chain = function(){};
    Chain.prototype = parent.prototype;
    Parent.prototype = new Chain();
    // add obj properties
    if (obj) {
        utils.applyProperties(Parent.prototype, obj);
    }
    // point constructor to the Parent
    Parent.prototype.constructor = Parent;
    // set super class reference
    Parent.parent = parent.prototype;
    // add extend shortcut
    Parent.extend = function (obj) {
        return utils.inherit(Parent, obj);
    };
    return Parent;
};

utils.extend = obj => utils.inherit(function() {}, obj);

module.exports = utils;
