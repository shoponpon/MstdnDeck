const electron = require("electron");
const Config = require("electron-config");
const openAboutWindow = require("electron-about-window").default;
const join = require("path").join;
const app = electron.app;
const ipc = electron.ipcMain;
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

app.on("window-all-closed", function () {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", function () {
    const { width, height, x, y } = config.get('bounds');
    mainWindow = new BrowserWindow({
        title: "MstdnDeck",
        width,
        height,
        x,
        y
    });
    mainWindow.loadURL("file://" + __dirname + "/index.html");

    var menu = Menu.buildFromTemplate([
        {
            label: "MstdnDeck",
            submenu: [
                {
                    label: "About MstdnDeck", click: function () {
                        openAboutWindow({
                            icon_path: join(__dirname, "img/icon.png"),
                            copyright: "Copyright (c) 2017 Shoponpon",
                            bug_report_url: "https://pawoo.net/@shopon",
                            adjust_window_size: false,
                        });
                    }
                },
                {
                    label: "Change Instance...", click: function () {
                        showChangeInstanceWindow();
                    }
                },
                { label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } },
            ],
        },
        {
            label: "View",
            submenu: [
                { label: "Reload", accelerator: "Command+R", click: function () { 
                    mainWindow.webContents.send("reload-flag", "reload");
                } },
                { label: "Close", accelerator: "Command+W", click: function () { mainWindow.hide(); } },
            ],
        }
    ]);
    Menu.setApplicationMenu(menu);

    mainWindow.on("close", function (e) {
        if (!forceQuit) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    app.on("before-quit", function (e) {
        config.set("bounds", mainWindow.getBounds());
        forceQuit = true;
    });

    app.on("activate", function () {
        mainWindow.show();
    });

    ipc.on("instance-url", (ev, url) => {
        config.set("url",url);
        mainWindow.webContents.send("instance-url", url);
    });
    
    var url = config.get("url");
    if(url == void 0){
        showChangeInstanceWindow();
    }else{
        mainWindow.webContents.on("did-finish-load",function(){
            mainWindow.webContents.send("instance-url",url);
        });
    }
});

function showChangeInstanceWindow() {
    const selectionPagePath = join("file://" + __dirname + "/selection.html");
    const selectionWindow = new BrowserWindow({
        width: 300,
        height: 250,
    });
    selectionWindow.loadURL(selectionPagePath);
    selectionWindow.show();
}