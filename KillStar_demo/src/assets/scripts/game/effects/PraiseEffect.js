var res = require("res");
var uiTools = require("UiTools");

cc.Class({
    extends: cc.Component,

    properties :
    {
        anim : cc.Animation
    },

    playEffect : function(type)
    {
        this.node.active = true;

        var frameName = "effect_praise_" + type;
        var imgPraise = this.node.getChildByName("imePraise").getComponent(cc.Sprite);
        imgPraise.spriteFrame = uiTools.getSpriteFrame(frameName, res.effect_atlas);

        this.anim.stop();
        this.anim.play("praise");
    },

    playSound : function()
    {

    },

    setPlayEndCallback : function(cb)
    {
        this.endCB = cb;
    },

    playEnd : function()
    {
        this.anim.stop();
        this.node.active = false;

        var cb = this.endCB;
        this.endCB = null;

        if(cb != null)
            cb();
    }
});