var i18n = require("i18n");
var Algorithm = require("algorithm");
var gameConfig = require("gameConfig");

var TipStrip = require("TipStrip");
var StarHandler = require("StarHandler");
var MoveNodeHandler = require("MoveNodeHandler");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        tipStrip : {
            default : null,
            type : TipStrip
        },

        starHandler : {
            default : null,
            type : StarHandler
        },

        moveNodeHandler : {
            default : null,
            type : MoveNodeHandler
        },

        tfAimScore : cc.Label,
        tfRoundNum : cc.Label,
        tfScore : cc.Label,
        tfAddScore : cc.Label,
        tfTouchNum : cc.Label,

        tipsGameOver : cc.Node
    },

    onLoad : function()
    {
        this.isAchieve = false;
        this.tipStripPos = cc.p(0, 100);

        this.reset();

        //添加算法
        this.algorithm = new Algorithm();
        gameConfig.algorithm = this.algorithm;

        //设置StarHandler的回调
        this.starHandler.setKillCallback(this.updateAddScore.bind(this));
        this.starHandler.setSupplementCallback(this.continueMove.bind(this));

        setTimeout(this.startGame.bind(this, gameConfig.firstAimScore, 1), 100);
    },

    openTouch : function()
    {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    },

    closeTouch : function()
    {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    },

    startGame : function(aimScore, roundNum)
    {
        this.updateAimScore(aimScore);
        this.updateRoundNum(roundNum);
        this.updateTouchNum(gameConfig.touchNum + roundNum - 1);

        var tipStr = i18n.getTxt("StarGame_Tips").format(roundNum, aimScore);
        this.tipStrip.showTips(tipStr, this.tipStripPos, this.readyTouch.bind(this));
    },

    readyTouch : function()
    {
        this.starHandler.startGame();
        this.moveNodeHandler.startGame();

        setTimeout(this.readyOver.bind(this), 500);
    },

    readyOver : function()
    {
        this.openTouch();

        this.moveNodeHandler.move();
    },

    startRound : function()
    {
        this.roundReset();

        var newAimScore = this.aimScoreNum + this.algorithm.getAimScoreIncrement(this.roundNum);
        this.startGame(newAimScore, this.roundNum + 1);
    },

    restart : function()
    {
        this.reset();
        this.startGame(gameConfig.firstAimScore, 1);
    },

    reset : function()
    {
        this.isAchieve = false;

        this.aimScoreNum = 0;
        this.tfAimScore.string = "";

        this.roundNum = 0;
        this.tfRoundNum.string = "";

        this.scoreNum = 0;
        this.tfScore.string = "";

        this.tfAddScore.string = "";

        this.touchNum = 0;
        this.tfTouchNum.string = "";

        this.tipsGameOver.active = false;

        this.tipStrip.hideTips();
        this.starHandler.reset();
        this.moveNodeHandler.reset();

        this.closeTouch();
    },

    roundReset : function()
    {
        this.isAchieve = false;

        this.tfAddScore.string = "";

        this.touchNum = 0;
        this.tfTouchNum.string = "";

        this.tipsGameOver.active = false;

        this.tipStrip.hideTips();
        this.starHandler.reset();
        this.moveNodeHandler.reset();
    },

    updateAimScore : function(score)
    {
        this.aimScoreNum = score;
        this.tfAimScore.string = i18n.getTxt("AimScore_txt") + score;
    },

    updateRoundNum : function(num)
    {
        this.roundNum = num;
        this.tfRoundNum.string = i18n.getTxt("RoundNum_txt").format(num);
    },

    updateScore : function(score)
    {
        this.scoreNum = score;
        this.tfScore.string = score;

        //检测是否达到目标分数
        if(this.scoreNum >= this.aimScoreNum && !this.isAchieve)
        {
            this.isAchieve = true;

            var tipStr = i18n.getTxt("AchieveAimScore_Tips");
            this.tipStrip.showTips(tipStr, this.tipStripPos, null);
        }
    },

    updateAddScore : function(num, score)
    {
        this.tfAddScore.string = i18n.getTxt("AddScore_txt").format(num, score);

        this.updateScore(this.scoreNum + score);
    },

    updateTouchNum : function(num)
    {
        this.touchNum = num;
        this.tfTouchNum.string = i18n.getTxt("TouchNum_txt").format(num);
    },

    //点击相应
    onTouchBegan : function(touch, event)
    {
        var posY = this.moveNodeHandler.getMoveNodeY();
        var type = this.moveNodeHandler.moveType;

        if(type != null)
        {
            var isKill = this.starHandler.onTouchBegan(posY, type);
            if(isKill)
            {
                this.moveNodeHandler.stopMove();

                this.updateTouchNum(this.touchNum - 1);
            }
        }
    },

    continueMove : function()
    {
        if(this.touchNum == 0)
        {
            this.moveNodeHandler.setMoveNodeVisible(false);

            this.roundOver();

            return;
        }

        if(this.moveNodeHandler.moveType == null)
            this.moveNodeHandler.move();
    },

    roundOver : function()
    {
        this.closeTouch();
        this.moveNodeHandler.stopMove();

        if(this.scoreNum >= this.aimScoreNum)
        {
            var tipStr = i18n.getTxt("RoundOver_Tips");
            this.tipStrip.showTips(tipStr, this.tipStripPos, this.startRound.bind(this));
        }
        else
            this.gameOver();
    },

    gameOver : function()
    {
        this.tipsGameOver.active = true;
    },

    onDestroy : function()
    {
        this.closeTouch();
    }
});