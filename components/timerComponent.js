
let componentNamespace = require('../phraser/component.js');
let Component = componentNamespace.Component;
let extend = componentNamespace.extend;
let View = require('../phraser/phraser.js').View;

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
    // component functions to tag events by component reference.

    this.timer = 0;

    this.exampleArray = [1, 2, 3, 4, 5];

    this.addSeconds = function(seconds){
        if(typeof(seconds) == 'number'){
            self.timer += seconds
            self.exampleArray.push(self.timer);
            self.update();
        }
    }

    this.onInit(function(){
        setInterval(function(){
            self.timer++;
            self.update();
        }, 1000)
    })
}