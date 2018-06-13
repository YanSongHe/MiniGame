var AgAudio = require("AGAudio");

var GameSound = cc.Class
({
    extends: AgAudio,

    bgm : function()
    {
        this.playMusic("sound/bgm.mp3", true);
    },

    applause : function()
    {
        var path = "sound/applause.mp3";
        this.playEffect(path);
    },

    gameOver : function()
    {
        var path = "sound/gameover.mp3";
        this.playEffect(path);
    },

    selectStar : function()
    {
        var path = "sound/select.mp3";
        this.playEffect(path);
    },

    killStar : function()
    {
        var path = "sound/clear.mp3";
        this.playEffect(path);
    },

    clickButton : function()
    {
        var path = "sound/button.mp3";
        this.playEffect(path);
    }
});

var gameSound = new GameSound();
module.exports = gameSound;
