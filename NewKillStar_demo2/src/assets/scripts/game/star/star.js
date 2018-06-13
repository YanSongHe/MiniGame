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

        this.isSelected = isSelect;
    },

    onKill : function()
    {
        this.removeStar();
    },

    removeStar : function()
    {
        this.node.removeFromParent();

        StarPool.putStar(this.node);
    }
});
