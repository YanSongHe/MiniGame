cc.Class
({
    extends: cc.Component,

    properties:
    {
        barLoading : cc.Node,
        imgLoadingLight : cc.Node,

        progressBar: {
            default: null,
            type: cc.ProgressBar
        }
    },

    onLoad: function ()
    {
        this.initUI();
        this.startLoadRes();
    },

    initUI:function()
    {
        this.updateProgress(0);
    },

    startLoadRes:function()
    {
        //加载资源
        var resMgr = require("resMgr");
        resMgr.load(require("resLists"), this.onResLoadProgress.bind(this), this.onCompleted.bind(this), this.onTimeOut.bind(this));
    },

    onResLoadProgress:function(percent)
    {
        this.updateProgress(percent * 0.9);
    },

    updateProgress:function(percent)
    {
        this.imgLoadingLight.x = this.barLoading.width - 5;
        this.progressBar.progress = percent;
    },
    
    onCompleted:function()
    {
        this.updateProgress(1);
        this.startGame();
    },

    onTimeOut:function ()
    {
        //utils.exitGame();
    },

    startGame:function()
    {
        cc.director.loadScene("game");
    }
});
