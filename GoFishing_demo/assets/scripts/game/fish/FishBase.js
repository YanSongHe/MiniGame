var res = require("res");
var uiTools = require("UiTools");

var FishConfig = require("FishConfig");

cc.Class({
    extends: cc.Component,

    properties :
    {
        anim : cc.Animation,
        imgFish : cc.Sprite
    },

    onLoad : function()
    {

    },

    initFish : function(type)
    {
        this.reset();
        this.fishData = FishConfig[type];
    },

    getMoveTypeList : function()
    {
        return this.fishData.moveTypeList;
    },

    swim : function()
    {
        var maxIndex = this.fishData.maxFrameIndex;
        var spriteFrameList = [];
        for(var i = 0; i <= maxIndex; i ++)
        {
            var frameName = this.fishData.frameName.format(i);
            spriteFrameList.push(uiTools.getSpriteFrame(frameName, res.fish_atlas));
        }

        this.imgFish.spriteFrame = spriteFrameList[0];
        this.intervalSwim = utils.runSequenceFrame(this.imgFish, spriteFrameList, maxIndex, 1000);
    },

    stopSwim : function()
    {
        clearInterval(this.intervalSwim);
    },

    move : function(key, isContrary)
    {
        var animName = (isContrary ? "ContraryFishMove" : "FishMove");
        this.node.scaleX = (isContrary ? -1 : 1);

        this.anim.stop();
        this.anim.play(animName + key);
    },

    setMoveOverCallback : function(cb)
    {
        this.moveOverCB = cb;
    },

    playEnd : function()
    {
        this.stopMove();

        if(this.moveOverCB != null)
            this.moveOverCB(this.node);
    },

    stopMove : function()
    {
        this.anim.stop();
    },

    reset : function()
    {
        this.node.scale = 1;
        this.node.rotation = 0;

        this.stopSwim();
        this.stopMove();

        this.moveOverCB = null;
    }
});