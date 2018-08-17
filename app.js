require('./phraser/arrayExtensions')
let TimerComponent = require('./components/timerComponent').TimerComponent;
let ComponentHandler = require('./phraser/component').ComponentHandler;

window.onload = function(){
    let handler = new ComponentHandler([
        { type: TimerComponent, selector: 'app-timer', ref: 'timerComponent' }
    ])

    handler.initialize();
}