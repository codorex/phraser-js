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