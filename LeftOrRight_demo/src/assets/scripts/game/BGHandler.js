var res = require("res");
var uiTools = require("UiTools");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        imgGirl : cc.Sprite,
        imgMonkeys : [cc.Sprite]
    },

    onLoad : function()
    {

    },

    distinguishCorrect : function()
    {
        this.imgGirl.spriteFrame = uiTools.getSpriteFrame("game_img_girl_succ", res.ui_atlas);
        this.imgMonkeys[0].spriteFrame = uiTools.getSpriteFrame("game_img_monkey2", res.ui_atlas);
        this.imgMonkeys[1].spriteFrame = uiTools.getSpriteFrame("game_img_monkey2", res.ui_atlas);
        this.imgMonkeys[2].spriteFrame = uiTools.getSpriteFrame("game_img_monkey1", res.ui_atlas);
        this.imgMonkeys[3].spriteFrame = uiTools.getSpriteFrame("game_img_monkey1", res.ui_atlas);

        setTimeout(this.reset.bind(this), 200);
    },

    distinguishError : function()
    {
        this.imgGirl.spriteFrame = uiTools.getSpriteFrame("game_img_girl_fail", res.ui_atlas);

        setTimeout(this.reset.bind(this), 200);
    },

    reset : function()
    {
        this.imgGirl.spriteFrame = uiTools.getSpriteFrame("game_img_girl_normal", res.ui_atlas);

        cc.each(this.imgMonkeys, function(monkey)
        {
            monkey.spriteFrame = uiTools.getSpriteFrame("game_img_monkey0", res.ui_atlas);
        }, this);
    }
});