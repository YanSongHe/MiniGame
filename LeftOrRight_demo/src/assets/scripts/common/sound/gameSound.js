var AgAudio = require("AGAudio");

var GameSound = cc.Class
({
    extends: AgAudio,

    bgmNormal : function()
    {
        this.playMusic("sound/bgm_normal.mp3", true);
    },

    bgmPower : function()
    {
        this.playMusic("sound/bgm_power.mp3", true);
    },

    gameOver : function()
    {
        var path = "sound/gameOver.mp3";
        this.playEffect(path);
    },

    fail : function()
    {
        var path = "sound/fail.mp3";
        this.playEffect(path);
    },

    succNormal : function()
    {
        var path = "sound/succ_normal.mp3";
        this.playEffect(path);
    },

    succPower : function()
    {
        var path = "sound/succ_power.mp3";
        this.playEffect(path);
    },

    ready : function()
    {
        var path = "sound/ready.mp3";
        this.playEffect(path);
    }
});

var gameSound = new GameSound();
module.exports = gameSound;
