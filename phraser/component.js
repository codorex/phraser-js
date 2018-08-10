let PhraserContainer = require('./phraserContainer.js').PhraserContainer

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