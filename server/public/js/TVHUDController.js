var socket = io();

var WindowCard = React.createClass({
   render: function() {
        return  (
            <div className="mdl-card windowCard mdl-shadow--4dp">
              <div className="mdl-card__title">
                 <h2 className="mdl-card__title-text">
                    {this.props.window.title}
                </h2>
              </div>
              <div className="mdl-card__media">
              </div>
              <div className="mdl-card__supporting-text">
                <p>url: {this.props.window.url}</p>
                <p>id: {this.props.window.id}</p>
                <div><span>x: {this.props.window.position.x} </span>
                <span>y: {this.props.window.position.y}</span></div>
                <div><span>width: {this.props.window.width} </span>
                <span>height: {this.props.window.height}</span></div>
              </div>
              <div className="mdl-card__actions">
                <a onClick={this.setupEditor} className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                    Update 
                </a>
                <a onClick={this.sendCloseCmd} className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                    Close
                </a>
              </div>
            </div>
        );
    },
    sendCloseCmd: function() {
        var data = this.props.window;
        data.event = "closeWindow";
        var msg = {
            event: "clientCmd",
            data: data
        };
        socket.emit("forwardToClient", JSON.stringify(msg));
        this.hideWindowEditor();
   },
   setupEditor: function() {
        React.render(<WindowEditor initWindow={this.props.window} key={this.props.window.id} initEvent="updateWindow" />, 
                document.getElementById("windowEditor"));
   }
});

var WindowList = React.createClass({
    render: function() {
        var createCard = function(windowItem, index) {
            return <WindowCard window={windowItem} key={index}/>
        };
        return (
            <div className="windowList" >
                {this.props.windows.map(createCard)}
            </div>
        );
    }
});

var WindowEditor = React.createClass({
    render: function() {
        if (!this.props.hide) {
            return (
                <div className="WindowEditor">
                    <div><label>URL: </label> <input type="text" onChange={this.saveWindowState} ref="url" defaultValue={this.props.initWindow.url}/></div>
                    <div><label>x: </label> <input type="text" onChange={this.saveWindowState} ref="x" defaultValue={this.props.initWindow.position.x}/>
                    <label> y: </label> <input type="text" onChange={this.saveWindowState} ref="y" defaultValue={this.props.initWindow.position.y}/></div>
                    <div><label>width: </label> <input type="text" onChange={this.saveWindowState} ref="width" defaultValue={this.props.initWindow.width}/>
                    <label> height: </label> <input type="text" onChange={this.saveWindowState} ref="height" defaultValue={this.props.initWindow.height}/></div>
                    <button onClick={this.submitWindow}>Submit</button>
                </div>
            );
        } else {
            return (
                <div></div>
            );
        }
    },
    submitWindow: function() {
        var data = this.state.window;
        data.event = this.state.event;
        var msg = {
            event: "clientCmd",
            data: data
        };
        socket.emit("forwardToClient", JSON.stringify(msg));

        if (this.state.event === "updateWindow" && this.state.window.url !== this.props.initWindow) {
            data.event = "updateUrl";
            msg.data = data;
            socket.emit("forwardToClient", JSON.stringify(msg));
        }

        this.hideWindowEditor();
    },
    hideWindowEditor: function() {
        React.render(<WindowEditor hide={true} key={-1}/>, document.getElementById("windowEditor"));
    },
    saveWindowState: function(event) {
        this.setState({window: this.constructWindowState()});
    },
    getInitialState: function() {
        console.log(this);
        return {window: this.props.initWindow, event: this.props.initEvent};
    },
    constructWindowState: function() {
        console.log(this);
        var state = {
            id: this.state.window.id,
            url: this.getValue(this.refs.url),
            position: {
                x: this.getValue(this.refs.x, true),
                y: this.getValue(this.refs.y, true)
            },
            width: this.getValue(this.refs.width, true),
            height: this.getValue(this.refs.height, true),
            event: this.state.event
        };
        return state;
    },
    getValue: function(ref, isNumber) {
        var value = ref.getDOMNode().value;
        return (isNumber ? parseInt(value) || 0 : value);
    }
});

function updateWindows(windows) {
    React.render(<WindowList windows={windows} />,
        document.getElementById("activeWindows"));
}

var windowTemplate = 
      { "event": "newWindow",
          "id": 7,
          "position": {
            "x": 0,
            "y": 0
          },
          "width": 200,
          "height": 200,
          "url": "https://yahoo.com"
      };

document.getElementById("createWindow").onclick = function() {
    React.render(<WindowEditor initWindow={windowTemplate} key={-2} initEvent={"newWindow"}/>, document.getElementById("windowEditor"));
}

socket.on('clientResponse', function(msg) {
    console.log(msg);
    var msg = JSON.parse(msg);
    switch(msg.event) {
        case "requestActiveWindows-reply":
            updateWindows(msg.data);
            break;
    }
});

socket.emit("forwardToClient", JSON.stringify({event: "requestActiveWindows"}));

