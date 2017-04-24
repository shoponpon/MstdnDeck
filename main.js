const electron = require("electron");
const Config = require("electron-config");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var forceQuit = false;

var mainWindow = null;

var config = new Config({
    defaults:{
        url:"https://pawoo.net/",
        bounds:{
            width:600,
            height:800,
        },
    }
});

//全てのウィンドウが閉じた
app.on("window-all-closed",function(){
    if(process.platform != "darwin"){
        app.quit();
    }
});

app.on("ready",function(){
    const {width, height, x, y} = config.get('bounds');
    const url = config.get("url");
    mainWindow = new BrowserWindow({
        title:"MstdnDeck("+url+")",
        width,
        height,
        x,
        y
    });
    mainWindow.loadURL("file://"+__dirname+"/index.html?url="+url);

    //バツボタン
    mainWindow.on("close",function(e){
        if(!forceQuit){
            e.preventDefault();
            mainWindow.hide();
        }
    });

    //cmd+q
    app.on("before-quit",function(e){
        //ウィンドウのサイズと位置を保存
        config.set("bounds",mainWindow.getBounds());
        forceQuit = true;
    });

    //dockのアイコンをクリック
    app.on("activate",function(){
        mainWindow.show();
    });
});