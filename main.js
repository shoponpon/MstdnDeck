const electron = require("electron");
const Config = require("electron-config");
const openAboutWindow = require("electron-about-window").default;
const join = require("path").join;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

var forceQuit = false;

var mainWindow = null;

var config = new Config({
    defaults: {
        url: "https://pawoo.net/",
        bounds: {
            width: 600,
            height: 800,
        },
    }
});

//全てのウィンドウが閉じた
app.on("window-all-closed", function () {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", function () {
    const { width, height, x, y } = config.get('bounds');
    const url = config.get("url");
    mainWindow = new BrowserWindow({
        title: "MstdnDeck(" + url + ")",
        width,
        height,
        x,
        y
    });
    mainWindow.loadURL("file://" + __dirname + "/index.html?url=" + url);

    var menu = Menu.buildFromTemplate([
        {
            label: "MstdnDeck",
            submenu: [
                { label: "About MstdnDeck", click:function(){
                    openAboutWindow({icon_path:join(__dirname,"img/icon.png"),copyright:"Copyright (c) 2017 Shoponpon"});
                }},
            ],
        },
        {
            label: "View",
            submenu: [
                { label: "Reload", accelerator: "Command+R", click: function () { mainWindow.reload() } },
                { label: "Close", accelerator: "Command+W", click: function(){mainWindow.hide()}},
            ],
        }
    ]);
    Menu.setApplicationMenu(menu);

    //バツボタン
    mainWindow.on("close", function (e) {
        if (!forceQuit) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    //cmd+q
    app.on("before-quit", function (e) {
        //ウィンドウのサイズと位置を保存
        config.set("bounds", mainWindow.getBounds());
        forceQuit = true;
    });

    //dockのアイコンをクリック
    app.on("activate", function () {
        mainWindow.show();
    });
});