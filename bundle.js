(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
require('./phraser/arrayExtensions')
let TimerComponent = require('./components/timerComponent').TimerComponent;
let ComponentHandler = require('./phraser/component').ComponentHandler;

window.onload = function(){
    let handler = new ComponentHandler([
        { type: TimerComponent, selector: 'app-timer', ref: 'timerComponent' }
    ])

    handler.initialize();
}
},{"./components/timerComponent":2,"./phraser/arrayExtensions":3,"./phraser/component":4}],2:[function(require,module,exports){

let componentNamespace = require('../phraser/component');
let Component = componentNamespace.Component;
let extend = componentNamespace.extend;
let View = require('../phraser/phraser').View;

// the following is an example component, that showcases the minimum required 
// to get a component working, as well as some certain scenarious.

module.exports.TimerComponent = function(selector, reference){
    let self = extend(this, Component);
    Component.call(this, selector, reference);

    // notice the last parameter in View's constructor.
    // it accepts an object, which will act as the context and scope
    // of the View's compiled code.

    this.view = new View(
        this.selector,
        this.reference,
        `
        <h3>#this.timer#</h3>
        <button onclick="${self.reference}.addSeconds(5)"> +5 </button>
        <br>
        #for(number of this.exampleArray){#
            <i>Iteration example - #number#<i/>
            <br>
        #}#
        `,
        self);

    // tagEvent="${self.reference}.someMethod(args)" allows for binding 
    // component functions to events by component reference.

    this.timer = 0;

    this.exampleArray = [1, 2, 3, 4, 5];

    this.addSeconds = function(seconds){
        if(typeof(seconds) == 'number'){
            self.timer += seconds
            self.exampleArray.push(self.timer);
            self.update();
        }
    }

    // onInit should be called at the end of the Component
    // to initialize the component in the DOM
    // Users can attach a callback to be executed just before 
    // the View is parsed and rendered (e.g to get additional data from a service)
    this.onInit(function(){
        setInterval(function(){
            self.timer++;
            self.update();
        }, 1000)
    })
}
},{"../phraser/component":4,"../phraser/phraser":5}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
let PhraserContainer = require('./phraserContainer').PhraserContainer

module.exports.extend = function(child, parent){
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    return child;
}

module.exports.Component = function(selector, reference){
    let self = this;

    this.reference = reference;
    this.selector = selector;
    this.view = {};
    this.viewData = {};

    this.update = function(){
        self.view.setData(self);
    }

    this.onInit = function (callback){
        if(callback)
            callback();
        this.view.render();
    }
}

module.exports.ComponentHandler = function(bindings){
    let _componentBindings = bindings;
    let _componentInstances = [];

    let createInstance = function (binding, reference) {
        window[reference] =  PhraserContainer.resolveFor(binding.type, [binding.selector, reference]);
    };

    this.initialize = function(){
        _componentBindings.forEach(function (binding) {
            let componentPlaceholders = document.getElementsByTagName(binding.selector);
            for (let i = 0; i < componentPlaceholders.length; i++) {
                const componentPlaceholder = componentPlaceholders[i]
                let reference = binding.ref + i;
                componentPlaceholder.setAttribute('reference', reference)
                createInstance(binding, reference);
            }
        })
    }
}
},{"./phraserContainer":6}],5:[function(require,module,exports){
module.exports.View = function (selector, reference, template, data) {
    let _template = template ? template : '';
    let _rawTemplate = _template;
    let _data = data;
    let _componentContext;
    let self = this;

    // if (!selector || !document.getElementsByTagName(selector)) {
    //     throw new Error('Name cannot be null!');
    // }

    this.reference = reference;
    this.getContext = function() { return _componentContext; }
    _data.context = this.getContext();

    this.getData = function () { return _data; }
    this.setData = function (value) {
        // copy current _data value into prevState
        let prevState = {};

        if(!_data){
            _data = value;
        }
        Object.assign(prevState, _data)

        if(!value){
            _data = null;
        } else {
            // update changed properties only
            Object.keys(_data).forEach(function(key){
                if(value[key]){
                    _data[key] = value[key];
                }
            })
        }
        
        this._stateChanged(prevState);
    }

    this.selector = selector;
    this.getTemplate = function () { return _template; }

    this.setTemplate = function (value) {
        _template = value;
        _rawTemplate = value;
    }

    // use onStateChanged to subscribe to state changes for this View
    // event contains the previous and current state of the view.
    this.onStateChanged = function (e) { }

    this._stateChanged = function (prevState) {
        let newState = this.getData();
        this.render(newState);

        this.onStateChanged({
            prevState: prevState,
            newState: newState
        });
    }

    this.getInstance = function () {
        let elements = [].slice.call(document.getElementsByTagName(selector));
        let instance = elements.firstOrDefault( function(el) { return el.getAttribute('reference') === self.reference } )

        return instance;
    }

    this.bindToComponent = function(context){
        _componentContext = context;
    }

    this.render = function (data) {
        if (data && data !== this.getData()) {
            this.setData(data)
        }

        let instance = this.getInstance();

        let parsedTemplate = parseTemplate(this.getData())

        if(instance){
            instance.innerHTML = parsedTemplate;
        }

        return instance;
    }

    let parseTemplate = function (data) {
        let filter = new RegExp(/#(.*?)#/g),
            blockFilter = new RegExp(/for\(.*?\){|if.?\(.*?\).?{|}|var .*;|.?else.?{/g),
            match, block, cursor = 0,
            code = "var lines = [];\n";

        let addLine = function (line, isJs) {
            code += isJs ? "lines.push(" + line + ");\n" :
                "lines.push(`" + line.trim() + "`);\n";
        }

        // check whether template is raw HTML or contains code
        let hasCode = new RegExp(filter.source).test(_rawTemplate);

        if (hasCode) {
            while ((match = filter.exec(_rawTemplate)) !== null) {
                let isBlock = false;

                addLine(_rawTemplate.slice(cursor, match.index));

                while ((block = blockFilter.exec(match[1])) !== null) {
                    code += block[0].trim() + '\n';
                    isBlock = true;
                }

                if (!isBlock) {
                    addLine(match[1], true);
                }

                cursor = match.index + match[0].length;
            }

            // has read all lines that contain code, now push the remaining html
            addLine(_rawTemplate.substr(cursor, _rawTemplate.length), false)
            code += "lines = lines.join('').trim('');\nreturn lines;";

            try {
                _template = new Function(code).apply(data);
            } catch (error) {
                _template = _rawTemplate;
                console.error(error)
            }
            return _template;
        }

        return _rawTemplate;
    }
}
},{}],6:[function(require,module,exports){
module.exports.PhraserContainer = {
    dependencies: {},

    // registers a dependency.
    // qualifier -> param name to be injected
    // obj -> param type, whose ctor will be called
    register: function(qualifier, obj){
        this.dependencies[qualifier] = obj;
    },

    // accepts a type, which will have it's dependencies injected
    // args (optional) := additional arguments, required for the construction of the function
    // returns := an instance of the type, requesting injection
    resolveFor: function(type, args){
        let dependencies = this.resolveDependencies(type);

        if(args){
            for (let i = 0; i < args.length; i++) {
                if(args[i]){
                    dependencies.push(args[i])
                }
            }
        }
        
        let instanceWrapper = function(f, args){
            return function(){
                f.apply(this, args)
            }
        }

        let instance = new (instanceWrapper(type, dependencies));
        return instance;
    },

    // type := The type, which will be analyzed for dependencies.
    // gathers the registered dependencies the type requests and returns them.
    // returns := an array of dependencies, resolved for the given type
    resolveDependencies: function(type){
        let dependencies = [];
        let params = this._getParameters(type);

        for (let i = 0; i < params.length; i++) {
            let dependency = this.dependencies[params[i]];

            if(dependency){
                dependencies.push(dependency)
            }
        }

        return dependencies;
    },

    // func: the function, whose param list will be parsed and returned.
    // returns := an array of function arguments
    _getParameters: function(func){
        let funcParams = /function.?\((.*?)\)/g;
        let args = [];
        let match;

        while((match = funcParams.exec(func.toString())) != null){
            let paramArgs = match[1].split(',');
            for (let i = 0; i < paramArgs.length; i++) {
                args.push(paramArgs[i])
            }
        }

        return args;
    }
}
},{}]},{},[1]);
