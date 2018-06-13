var i18n = require("i18n");
var gameConfig = require("gameConfig");

var TipStrip = require("TipStrip");

var btnColorList = [cc.color(15, 255, 255), cc.color(255, 0, 0)];
var bgColorList = [cc.color(165, 255, 255), cc.color(255, 165, 165)];

cc.Class
({
    extends: cc.Component,

    properties :
    {
        tipStrip : {
            default : null,
            type : TipStrip
        },

        tfRule : cc.RichText,
        tfTime : cc.Label,
        tfScore : cc.Label,

        imgColorBG : cc.Node,
        btnGames : [cc.Node],
        tfBtnNums : [cc.Label],
        tfCompareNum : cc.Label,

        btnRestart : cc.Node
    },

    onLoad : function()
    {
        this.reset();

        this.startGame();
    },

    startGame : function()
    {
        this.nextRound();

        this.updateScore(0);

        this.timeNum = gameConfig.gameTime;
        this.updateTfTime(this.timeNum);
        this.intervalTime = setInterval(this.intervalTimeFun.bind(this), 1000);
    },

    intervalTimeFun : function()
    {
        this.timeNum --;

        if(this.timeNum >= 0)
            this.updateTfTime(this.timeNum);
        else
            this.gameOver();
    },

    updateTfTime : function(t)
    {
        var num1 = Math.floor(t / 60);
        num1 = (num1 > 9 ? num1 : ("0" + num1));

        var num2 = t % 60;
        num2 = (num2 > 9 ? num2 : ("0" + num2));

        this.tfTime.string = num1 + " : " + num2;
    },

    updateScore : function(num)
    {
        this.scoreNum = num;
        this.tfScore.string = i18n.getTxt("game_score_txt") + num;
    },

    nextRound : function()
    {
        this.isRed = !this.isRed;

        var colorNum = (this.isRed ? 1 : 0);
        this.tfRule.string = i18n.getTxt("game_rule_tips" + colorNum);

        this.imgColorBG.color = bgColorList[colorNum];
        this.compareNum = utils.randomInt(gameConfig.minCompareNum, gameConfig.maxCompareNum);
        this.tfCompareNum.string = this.compareNum;

        var plusMinus = (utils.random(-100, 100) >= 0 ? 1 : -1);
        this.updateBtnGame(0, plusMinus);
        this.updateBtnGame(1, -plusMinus);
    },

    updateBtnGame : function(num, plusMinus)
    {
        var colorNum = (this.isRed ? 1 : 0);

        this.btnGames[num].active = true;
        this.btnGames[num].color = btnColorList[colorNum];

        var differNum = plusMinus * utils.randomInt(1, gameConfig.maxDifferNum);
        this.tfBtnNums[num].string = this.compareNum + differNum;
    },

    onBtnGame : function(event, key)
    {
        var selectNum = parseInt(key);
        var selectScore = parseInt(this.tfBtnNums[selectNum].string);

        if((this.isRed && this.compareNum > selectScore) || (!this.isRed && this.compareNum < selectScore))
        {
            this.updateScore(this.scoreNum + 1);
            this.nextRound();
        }
        else
        {
            this.gameOver();
        }
    },

    gameOver : function()
    {
        clearInterval(this.intervalTime);

        this.btnGames[0].active = false;
        this.btnGames[1].active = false;

        this.compareNum = null;
        this.tfCompareNum.string = "";

        this.btnRestart.active = true;
    },

    restart : function()
    {
        this.reset();
        this.startGame();
    },

    reset : function()
    {
        clearInterval(this.intervalTime);

        this.isRed = true;

        this.tfRule.string = "";
        this.tfTime.string = "";

        this.scoreNum = 0;
        this.tfScore.string = "";

        this.imgColorBG.color = bgColorList[0];
        this.btnGames[0].active = false;
        this.btnGames[1].active = false;

        this.compareNum = null;
        this.tfCompareNum.string = "";

        this.btnRestart.active = false;
    }
});