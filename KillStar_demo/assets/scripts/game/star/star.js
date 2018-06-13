var res = require("res");
var uiTools = require("UiTools");

var StarPool = require("StarPool");

cc.Class({
    extends: cc.Component,

    properties :
    {
        imgStar : cc.Sprite
    },

    onLoad : function()
    {
        this.isSelected = false;
    },

    initStar : function(type)
    {
        this.isSelected = false;

        this.type = type;
        this.setStarSpriteFrame(type, false);


    },

    setStarSpriteFrame : function(type, isSelect)
    {
        var frameName = (isSelect ? "star_select_" : "star_");
        frameName += type;

        this.imgStar.spriteFrame = uiTools.getSpriteFrame(frameName, res.star_atlas);
    },

    onSelect : function(isSelect)
    {
        this.setStarSpriteFrame(this.type, isSelect);

        this.stopHint();
        if(isSelect)
            this.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(0.1), cc.scaleTo(0.5, 0.8), cc.scaleTo(0.5, 1), cc.delayTime(0.1))));

        this.isSelected = isSelect;
    },

    onHint : function()
    {
        this.stopHint();
        this.node.runAction(cc.repeat(cc.sequence(cc.delayTime(0.1), cc.scaleTo(0.5, 0.8), cc.scaleTo(0.5, 1), cc.delayTime(0.1)), 3));
    },

    stopHint : function()
    {
        this.node.stopAllActions();
        this.node.scale = 1;
    },

    onKill : function()
    {
        this.removeStar();
    },

    removeStar : function()
    {
        this.stopHint();
        this.node.removeFromParent();

        StarPool.putStar(this.node);
    }
});
