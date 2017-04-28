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
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { type: "separator" },
                { role: "selectall" },
            ],
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Reload", accelerator: "Command+R", click: function () {
                        mainWindow.webContents.send("reload-flag", "reload");
                    }
                },
                { label: "Close", accelerator: "Command+W", click: function () { mainWindow.hide(); } },
                { type: "separator" },
                { role: "zoomin" },
                { role: "zoomout" },
                { role: "resetzoom" }
            ],
        },
        {
            label: "Dev",
            submenu: [
                { label: "Oepn DevTools", accelerator: "Ctrl+Shift+i", click: function () { mainWindow.webContents.openDevTools(); } },
                { label: "Delete Config", click: function () { config.clear() } },
                { label: "Delete Cache", click: function () { electron.session.defaultSession.clearCache(() => { }); } },
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
        electron.session.defaultSession.clearCache(() => { });
        forceQuit = true;
    });

    app.on("activate", function () {
        mainWindow.show();
    });

    ipc.on("instance-url", (ev, url) => {
        config.set("url", url);
        mainWindow.webContents.send("instance-url", url);
    });

    var url = config.get("url");
    if (url == void 0) {
        showChangeInstanceWindow();
    } else {
        mainWindow.webContents.on("did-finish-load", function () {
            mainWindow.webContents.send("instance-url", url);
        });
    }
});

ipc.on("open-select-instance",function(e,arg){
    showChangeInstanceWindow();
});

function showChangeInstanceWindow() {
    const selectionPagePath = join("file://" + __dirname + "/selection.html");
    const selectionWindow = new BrowserWindow({
        width: 300,
        height: 250,
        parent:mainWindow,
        modal:true,
    });
    selectionWindow.loadURL(selectionPagePath);
    selectionWindow.show();
}