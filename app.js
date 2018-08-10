require('./phraser/arrayExtensions.js')
let TimerComponent = require('./components/timerComponent.js').TimerComponent;
let ComponentHandler = require('./phraser/component.js').ComponentHandler;

window.onload = function(){
    let handler = new ComponentHandler([
        { type: TimerComponent, selector: 'app-timer', ref: 'timerComponent' }
    ])

    handler.initialize();
}