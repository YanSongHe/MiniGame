var i18n = require("i18n");
var Algorithm = require("algorithm");
var gameConfig = require("gameConfig");
var gameSound = require("gameSound");

var TipStrip = require("TipStrip");
var StarHandler = require("StarHandler");
var PraiseEffect = require("PraiseEffect");
var StageClearEffect = require("StageClearEffect");

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

        praiseEffect : {
            default : null,
            type : PraiseEffect
        },

        stageClearEffect : {
            default : null,
            type : StageClearEffect
        },

        imgTxtAimScore : cc.Node,
        imgTxtRound : cc.Node,
        imgTxtMaxScore : cc.Node,

        tfAimScore : cc.Label,
        tfRoundNum : cc.Label,
        tfScore : cc.Label,
        tfAddScore : cc.Label,
        tfMaxScore : cc.Label,

        tipsGameStar : cc.Node,
        tipsGameOver : cc.Node,

        imgStageClear : cc.Node
    },

    onLoad : function()
    {
        gameSound.bgm();

        this.isAchieve = false;
        this.tipStripPos = cc.p(0, 100);

        this.reset();

        //添加算法
        this.algorithm = new Algorithm();
        gameConfig.algorithm = this.algorithm;

        //设置StarHandler的回调
        this.starHandler.setKillCallback(this.updateAddScore.bind(this));
        this.starHandler.setGameOverCallback(this.roundOver.bind(this));

        this.showStartView();
    },

    showStartView : function()
    {
        var roundNum = cc.sys.localStorage.getItem(gameConfig.gameName + "GAME_ROUND");

        if(roundNum != null)
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
        gameSound.clickButton();
        this.tipsGameStar.active = false;

        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_STAR_DATA");
        this.startGame(gameConfig.firstAimScore, 1);
    },

    continueGame : function()
    {
        gameSound.clickButton();
        this.tipsGameStar.active = false;

        var roundNum = parseInt(cc.sys.localStorage.getItem(gameConfig.gameName + "GAME_ROUND"));
        var aimScore = parseInt(cc.sys.localStorage.getItem(gameConfig.gameName + "GAME_AIM_SCORE"));
        this.startGame(aimScore, roundNum);

        var score = cc.sys.localStorage.getItem(gameConfig.gameName + "GAME_SCORE");
        if(score != null)
            this.updateScore(parseInt(score), false);
    },

    startGame : function(aimScore, roundNum)
    {
        var maxScore = cc.sys.localStorage.getItem(gameConfig.gameName + "GAME_MAX_SCORE");
        if(maxScore)
        {
            this.imgTxtMaxScore.active = true;
            this.tfMaxScore.string = maxScore;
        }

        this.updateAimScore(aimScore);
        this.updateRoundNum(roundNum);

        var tipStr = i18n.getTxt("StarGame_Tips").format(roundNum, aimScore);
        this.tipStrip.showTips(tipStr, this.tipStripPos, this.starHandler.startGame.bind(this.starHandler));
    },

    startRound : function()
    {
        this.roundReset();

        var newAimScore = this.aimScoreNum + this.algorithm.getAimScoreIncrement(this.roundNum);
        setTimeout(this.startGame.bind(this, newAimScore, this.roundNum + 1), 500);
    },

    restart : function()
    {
        gameSound.clickButton();

        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_ROUND");
        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_AIM_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_STAR_DATA");

        this.reset();
        this.startGame(gameConfig.firstAimScore, 1);
    },

    reset : function()
    {
        this.isAchieve = false;

        this.aimScoreNum = 0;
        this.imgTxtAimScore.active = false;
        this.tfAimScore.string = "";

        this.roundNum = 0;
        this.imgTxtRound.active = false;
        this.tfRoundNum.string = "";

        this.scoreNum = 0;
        this.tfScore.string = "";

        this.tfAddScore.string = "";

        this.imgTxtMaxScore.active = false;
        this.tfMaxScore.string = "";

        this.tipsGameStar.active = false;
        this.tipsGameOver.active = false;
        this.praiseEffect.node.active = false;

        this.imgStageClear.active = false;
        this.stageClearEffect.node.active = false;

        this.tipStrip.hideTips();
        this.starHandler.reset();
    },

    roundReset : function()
    {
        this.isAchieve = false;

        this.tfAddScore.string = "";

        this.tipsGameOver.active = false;
        this.praiseEffect.node.active = false;

        this.imgStageClear.active = false;
        this.stageClearEffect.node.active = false;

        //去掉剩余星星，清除保存数据
        this.starHandler.removeSurplusStar();
        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_STAR_DATA");
    },

    updateAimScore : function(score)
    {
        this.aimScoreNum = score;
        this.tfAimScore.string = score;
        this.imgTxtAimScore.active = true;

        cc.sys.localStorage.setItem(gameConfig.gameName + "GAME_AIM_SCORE", score);
    },

    updateRoundNum : function(num)
    {
        this.roundNum = num;
        this.tfRoundNum.string = num;
        this.imgTxtRound.active = true;

        cc.sys.localStorage.setItem(gameConfig.gameName + "GAME_ROUND", num);
    },

    updateScore : function(score, isShowEffect)
    {
        this.scoreNum = score;
        this.tfScore.string = score;


        //检测是否达到目标分数
        if(this.scoreNum >= this.aimScoreNum && !this.isAchieve)
        {
            this.isAchieve = true;

            if(isShowEffect)
            {
                gameSound.applause();
                this.stageClearEffect.playEffect(this.imgStageClear.getPosition(), this.showStageClear.bind(this));
            }
            else
                this.showStageClear();
        }

        cc.sys.localStorage.setItem(gameConfig.gameName + "GAME_SCORE", score);
    },

    showStageClear : function()
    {
        this.imgStageClear.active = true;
    },

    updateAddScore : function(num, score)
    {
        this.tfAddScore.string = i18n.getTxt("AddScore_txt").format(num, score);

        this.updateScore(this.scoreNum + score, true);

        //播放文字特效
        if(num >= 5)
        {
            //var effectType = 5;
            //if(num >= 8)
            //    effectType = 8;
            //else if(num >= 10)
            //    effectType = 10;
            //else if(num >= 12)
            //    effectType = 12;
            //else if(num >= 18)
            //    effectType = 18;
            //else if(num >= 25)
            //    effectType = 25;
            var effectType = 0;
            if(num >= 8)
                effectType = 1;
            this.praiseEffect.playEffect(effectType);
        }
    },

    roundOver : function(surplusNum)
    {
        var surplusAddScore = this.algorithm.getSurplusAddScore(surplusNum, gameConfig.maxSurplusNum);
        this.updateScore(this.scoreNum + surplusAddScore, true);

        if(this.scoreNum >= this.aimScoreNum)
        {
            var tipStr = i18n.getTxt("RoundOver_Tips").format(surplusNum, surplusAddScore);
            this.tipStrip.showTips(tipStr, this.tipStripPos, this.startRound.bind(this));
        }
        else
        {
            var maxScoreStr = cc.sys.localStorage.getItem(gameConfig.gameName + "GAME_MAX_SCORE");
            if(maxScoreStr == null || (this.scoreNum > parseInt(maxScoreStr)))
                cc.sys.localStorage.setItem(gameConfig.gameName + "GAME_MAX_SCORE", this.scoreNum);

            this.gameOver();
        }
    },

    gameOver : function()
    {
        gameSound.gameOver();
        this.tipsGameOver.active = true;

        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_ROUND");
        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_AIM_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.gameName + "GAME_STAR_DATA");
    }
});