# phraser-js
A minimalist Component rendering library, that features a fully fledged template interpolation engine, dependency injection, live component state updates.

## Introduction
- ### Goal
  The goal of the library is to provide data management functionalities on the front-end, 
  while aiming to maintain minimal dependencies.
- ### Execution
  The goal is achieved by the implementation of Components, which extend a
  base Component class. Components all have their own state and views*, making them completely decoupled from one another.
  
  Component instances are managed by a ComponentHandler, in which they must be registered (as show in the example component called 
  'TimerComponent').
  
  Since they require a selector to be defined at construction, an instance of each component is created when the DOM 
  receives a tag equal to the component's selector. Each selector in the DOM is bound to it's respective Component by a reference.
  This ensures that multiple selectors will not point to the same Component instance, but rather to a Component instance of their own.
