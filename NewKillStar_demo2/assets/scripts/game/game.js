var i18n = require("i18n");
var Algorithm = require("algorithm");
var gameConfig = require("gameConfig");

var TipStrip = require("TipStrip");
var StarHandler = require("StarHandler");
var KillBtnsHandler = require("KillBtnsHandler");

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

        killBtnsHandler : {
            default : null,
            type : KillBtnsHandler
        },

        tfAimScore : cc.Label,
        tfRoundNum : cc.Label,
        tfScore : cc.Label,
        tfAddScore : cc.Label,
        tfTouchNum : cc.Label,
        tfMaxScore : cc.Label,

        tipsGameStar : cc.Node,
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

        this.showStartView();

        //设置手机的home和back退出游戏
        this.setExitGameListener();
    },

    showStartView : function()
    {
        var touchNum = cc.sys.localStorage.getItem(gameConfig.account + "GAME_TOUCH_NUM");

        if(touchNum != null && parseInt(touchNum) != 0)
        {
            this.tipsGameStar.active = true;
        }
        else
        {
            setTimeout(this.newGame.bind(this), 100);
        }
    },

    newGame : function()
    {
        this.tipsGameStar.active = false;

        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_STAR_DATA");
        this.startGame(gameConfig.firstAimScore, 1);
    },

    continueGame : function()
    {
        this.tipsGameStar.active = false;

        var roundNum = parseInt(cc.sys.localStorage.getItem(gameConfig.account + "GAME_ROUND"));
        var aimScore = parseInt(cc.sys.localStorage.getItem(gameConfig.account + "GAME_AIM_SCORE"));
        var touchNum = parseInt(cc.sys.localStorage.getItem(gameConfig.account + "GAME_TOUCH_NUM"));
        this.startGame(aimScore, roundNum, touchNum);

        var score = cc.sys.localStorage.getItem(gameConfig.account + "GAME_SCORE");
        if(score != null)
        {
            this.scoreNum = parseInt(score);
            this.tfScore.string = parseInt(score);
        }
    },

    startGame : function(aimScore, roundNum, touchNum)
    {
        var maxScore = cc.sys.localStorage.getItem(gameConfig.account + "GAME_MAX_SCORE");
        this.tfMaxScore.string = (maxScore == null ? "" : (i18n.getTxt("MsxScore_txt") + maxScore));

        this.updateAimScore(aimScore);
        this.updateRoundNum(roundNum);
        this.updateTouchNum(touchNum || (gameConfig.touchNum + roundNum - 1));

        var tipStr = i18n.getTxt("StarGame_Tips").format(roundNum, aimScore);
        this.tipStrip.showTips(tipStr, this.tipStripPos, this.readyTouch.bind(this));
    },

    readyTouch : function()
    {
        this.starHandler.startGame();
        this.killBtnsHandler.startGame();

        setTimeout(this.readyOver.bind(this), 500);
    },

    readyOver : function()
    {
        this.canKill = true;
    },

    startRound : function()
    {
        this.roundReset();

        var newAimScore = this.aimScoreNum + this.algorithm.getAimScoreIncrement(this.roundNum);
        this.startGame(newAimScore, this.roundNum + 1);
    },

    restart : function()
    {
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_ROUND");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_AIM_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_TOUCH_NUM");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_STAR_DATA");

        this.reset();
        this.startGame(gameConfig.firstAimScore, 1);
    },

    reset : function()
    {
        this.isAchieve = false;
        this.canKill = false;

        this.aimScoreNum = 0;
        this.tfAimScore.string = "";

        this.roundNum = 0;
        this.tfRoundNum.string = "";

        this.scoreNum = 0;
        this.tfScore.string = "";

        this.touchNum = 0;
        this.tfTouchNum.string = "";

        this.tfAddScore.string = "";
        this.tfMaxScore.string = "";

        this.tipsGameStar.active = false;
        this.tipsGameOver.active = false;

        this.tipStrip.hideTips();
        this.starHandler.reset();
        this.killBtnsHandler.reset();
    },

    roundReset : function()
    {
        this.isAchieve = false;

        this.tfAddScore.string = "";

        this.touchNum = 0;
        this.tfTouchNum.string = "";

        this.tipStrip.hideTips();
        this.starHandler.reset();
        this.killBtnsHandler.reset();

        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_STAR_DATA");
    },

    updateAimScore : function(score)
    {
        this.aimScoreNum = score;
        this.tfAimScore.string = i18n.getTxt("AimScore_txt") + score;

        cc.sys.localStorage.setItem(gameConfig.account + "GAME_AIM_SCORE", score);
    },

    updateRoundNum : function(num)
    {
        this.roundNum = num;
        this.tfRoundNum.string = i18n.getTxt("RoundNum_txt").format(num);

        cc.sys.localStorage.setItem(gameConfig.account + "GAME_ROUND", num);
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

        cc.sys.localStorage.setItem(gameConfig.account + "GAME_SCORE", score);
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

        cc.sys.localStorage.setItem(gameConfig.account + "GAME_TOUCH_NUM", this.touchNum);
    },

    //点击消除按钮响应
    onBtnKill : function(event, num)
    {
        if(!this.canKill)
            return;

        var columnNum = parseInt(num);
        var type = this.killBtnsHandler.selectedType;

        var isKill = this.starHandler.onBtnKill(columnNum, type);
        if(isKill)
        {
            this.canKill = false;
            this.updateTouchNum(this.touchNum - 1);
        }
    },

    continueMove : function()
    {
        if(this.touchNum == 0)
        {
            this.roundOver();

            return;
        }

        this.canKill = true;
    },

    roundOver : function()
    {
        this.canKill = false;

        if(this.scoreNum >= this.aimScoreNum)
        {
            var tipStr = i18n.getTxt("RoundOver_Tips");
            this.tipStrip.showTips(tipStr, this.tipStripPos, this.startRound.bind(this));
        }
        else
        {
            var maxScoreStr = cc.sys.localStorage.getItem(gameConfig.account + "GAME_MAX_SCORE");
            if(maxScoreStr == null || (this.scoreNum > parseInt(maxScoreStr)))
                cc.sys.localStorage.setItem(gameConfig.account + "GAME_MAX_SCORE", this.scoreNum);

            this.gameOver();
        }
    },

    gameOver : function()
    {
        this.tipsGameOver.active = true;

        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_ROUND");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_AIM_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_TOUCH_NUM");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_STAR_DATA");
    },

    setExitGameListener : function setViwShowControl()
    {
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,

            onKeyPressed: function onKeyPressed(keyCode, event) {},

            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.home:
                        utils.exitGame();
                        break;

                    case cc.KEY.back:
                        utils.exitGame();
                        break;
                }
            }
        }, this.node);
    }
});