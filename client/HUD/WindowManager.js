var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipcMain = require('electron').ipcMain;

function WindowManager() {

    var sender = undefined;
    var windows = {};

    function addWindow(newWindow, url) {
        windows[newWindow.id] = { window: newWindow, url: url, id: newWindow.id};
    }

    function initIpc() {
        ipcMain.on('clientCmd', function(event, msg) {
            sender = event.sender;
            console.log(msg);
            msg = JSON.parse(msg);
            win = msg.data;
            switch(win.event){
                case "newWindow":
                    addWindow(newWindow(win), win.url);
                    sendActiveWindows();
                    break;
                case "updateWindow":
                    updateWindow(win);
                    sendActiveWindows();
                    break;
                case "updateUrl":
                    updateWindowUrl(win);
                    sendActiveWindows();
                    break
                case "closeWindow":
                    removeWindow(win.id);
                    sendActiveWindows();
                    break;
            }
        });

        ipcMain.on('requestActiveWindows', function(event, msg) {
            sender = event.sender;
            console.log("requestActiveWindows");
            var reply = { event: "requestActiveWindows-reply"};
            reply.data = getActiveWindows();
            event.sender.send('clientResponse', JSON.stringify(reply));
        });
    }

    function updateWindow(newWin) {
        var oldWin = windows[newWin.id];
        console.log(windows);
        console.log(newWin);
        oldWin.window.setBounds({x:newWin.position.x, y:newWin.position.y, width:newWin.width, height:newWin.height});
    }

    function updateWindowUrl(newWin) {
        var oldWin = windows[newWin.id];
        oldWin.window.loadURL(newWin.url);
    }

    function removeWindow(id) {
        var win = windows[id].window;
        delete windows[id];
        win.close();
    }

    function getActiveWindows() {
        var activeWindows = [];
        for (win in windows) {
            var curWin = windows[win];
            var curUrl = curWin.window.webContents.getURL();
            windows[win].url = curUrl
            var position = curWin.window.getPosition();
            curWin.position = {
                x: position[0],
                y: position[1]
            };
            var size = curWin.window.getSize();
            curWin.width = size[0];
            curWin.height = size[1];
            curWin.title = curWin.window.getTitle();
            curWin.url = curUrl;
            activeWindows.push(curWin);
        }
        return activeWindows;
    }

    function newWindow(win) {
        subWindow = new BrowserWindow({
                width: win.width,
                height: win.height,
                x: win.position.x,
                y: win.position.y
            });
        subWindow.loadURL(win.url);
        subWindow.on('moved', sendActiveWindows);
        subWindow.on('resize', sendActiveWindows);
        subWindow.on('close', function() {
            delete windows[subWindow.id];
            sendActiveWindows();
        });
        return subWindow;
    }

    function sendActiveWindows() {
        var reply = { event: "requestActiveWindows-reply"};
        reply.data = getActiveWindows();
        sender.send('clientResponse', JSON.stringify(reply));
    }

    this.initIpc = initIpc;
}



module.exports = WindowManager;
