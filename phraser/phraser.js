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