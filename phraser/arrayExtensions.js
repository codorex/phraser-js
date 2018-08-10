module.exports.defaultVal = function (type) {
    if (typeof type !== 'string') throw new TypeError('Type must be a string.');

    // Handle simple types (primitives and plain function/object)
    switch (type) {
        case 'boolean'   : return false;
        case 'function'  : return function () {};
        case 'null'      : return null;
        case 'number'    : return 0;
        case 'object'    : return {};
        case 'string'    : return "";
        case 'symbol'    : return Symbol();
        case 'undefined' : return void 0;
    }

    try {
        // Look for constructor in this or current scope
        var ctor = typeof this[type] === 'function'
                   ? this[type]
                   : eval(type);

        return new ctor;

    // Constructor not found, return new object
    } catch (e) { return {}; }
}

Array.prototype.where = function(predicate){
    let array = this;
    let result = [];
    for(let i = 0; i < array.length; i++){
        if(predicate(array[i]) === true){
            result.push(array[i]);
        }
    }

    return result;
}

Array.prototype.firstOrDefault = function(predicate) {
    let array = this;
    for(let i = 0; i < array.length; i++){
        if(predicate(array[i]) === true){
            return array[i];
        }
    }

    return defaultVal(typeof array[0]);
}

Array.prototype.any = function(predicate) {
    let array = this;
    for (let i = 0; i < array.length; i++) {
        if(predicate(array[i]) === true)
            return true;
    }

    return false;
}

Array.prototype.max = function(comparer){
    let array = this;
    let comparerType = typeof comparer(array[0]);
    let result = defaultVal(comparerType);

    for (let i = 0; i < array.length; i++) {
        const current = comparer(array[i]);

        if(current > result){
            result = current;
        }
    }

    return result;
}

Array.prototype.remove = function(predicate){
    let array = this;
    let targetIndex = null;

    for (let i = 0; i < array.length; i++) {
        if(predicate(array[i])){
           targetIndex = i;
        }
    }

    if(targetIndex != null && targetIndex != undefined)
        array.splice(targetIndex, 1)

    return array;
}