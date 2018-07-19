var BubbleHandler = require("BubbleHandler");
var LaunchBubblePad = require("LaunchBubblePad");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        tfScore : cc.Label,
        gameLayer : cc.Node,

        bubbleHandler : BubbleHandler,
        launchBubblePad : LaunchBubblePad
    },

    onLoad : function()
    {
        this.bubbleHandler.setClearCallback(this.addScore.bind(this));
        this.bubbleHandler.setGameOverCallback(this.gameOver.bind(this));

        this.reset();
        setTimeout(this.startGame.bind(this), 200);
    },

    startGame : function()
    {
        this.bubbleHandler.startGame();
        this.launchBubblePad.startGame();
    },

    addScore : function(num)
    {
        this.scoreNum += num;
        this.tfScore.string = this.scoreNum;
    },
       
    gameOver : function()
    {
        this.launchBubblePad.gameOver();

        this.gameLayer.active = true;
    },

    restart : function()
    {
        this.reset();
        this.startGame();
    },

    reset : function()
    {
        this.gameLayer.active = false;

        this.scoreNum = 0;
        this.tfScore.string = 0;

        this.bubbleHandler.reset();
        this.launchBubblePad.reset();
    }
});