var i18n = require("i18n");
var res = require("res");
var uiTools = require("UiTools");
var gameConfig = require("gameConfig");
var gameSound = require("gameSound");

var BGHandler = require("BGHandler");
var ObjectsHandler = require("ObjectsHandler");
var FrameEffect = require("FrameEffect");
var ComboEffect = require("ComboEffect");
var TipStrip = require("TipStrip");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        tfScore : cc.Label,
        tfGameOverScore : cc.Label,
        imgOverSend : cc.Sprite,

        nodeTxt : cc.Node,
        imgTxt : cc.Sprite,

        pbTime : cc.ProgressBar,
        pbPower : cc.ProgressBar,

        gameStartLayer : cc.Node,
        gameOverLayer : cc.Node,

        bgHandler : {
            default : null,
            type : BGHandler
        },

        objectsHandler : {
            default : null,
            type : ObjectsHandler
        },

        frameEffect : {
            default : null,
            type : FrameEffect
        },

        comboEffect : {
            default : null,
            type : ComboEffect
        },

        tipStrip : {
            default : null,
            type : TipStrip
        }
    },

    onLoad : function()
    {
        gameSound.bgmNormal();

        this.reset();

        this.gameStartLayer.active = true;
    },

    showTxt : function(txt, cb)
    {
        this.nodeTxt.active = true;
        var frameName = "game_txt_" + txt;
        this.imgTxt.spriteFrame = uiTools.getSpriteFrame(frameName, res.ui_atlas);
        this.imgTxt.node.opacity = 0;

        var al = [];
        al.push(cc.fadeIn(0.2));
        al.push(cc.delayTime(0.8));
        al.push(cc.callFunc(this.hideTxt.bind(this, cb)));
        this.imgTxt.node.runAction(cc.sequence(al));
    },

    hideTxt : function(cb)
    {
        this.nodeTxt.active = false;

        if(cb != null)
            cb();
    },

    startGame : function()
    {
        gameSound.ready();

        this.gameStartLayer.active = false;

        this.updateScore(0);
        this.updateTime(gameConfig.gameTime);
        this.updatePower(0);

        this.objectsHandler.start();

        this.showTxt("ready", this.showTxt.bind(this, "start", this.readyOver.bind(this)));
    },

    readyOver : function()
    {
        this.isGaming = true;
        this.setBtnLock(true);
    },

    update : function(dt)
    {
        if(this.isGaming)
        {
            this.surplusTimeNum -= dt;
            if(this.surplusTimeNum >= 0)
                this.updateTime(this.surplusTimeNum);
            else
                this.gameOver();
        }

        if(this.powerTime > 0)
        {
            this.powerTime -= dt;
            if(this.powerTime <= 0)
            {
                gameSound.bgmNormal();

                this.powerTime = 0;
                this.updatePower(0);
                this.frameEffect.playEnd();
            }
        }
    },

    updateScore : function(num)
    {
        this.scoreNum = num;
        this.tfScore.string = num;
    },

    updateTime : function(t)
    {
        this.surplusTimeNum = t;
        this.pbTime.progress = (t / gameConfig.gameTime);

        if(this.surplusTimeNum < gameConfig.gameTime / 3 * 2)
        {
            if(this.surplusTimeNum > gameConfig.gameTime / 3)
                this.objectsHandler.showMoreObject(2);
            else
                this.objectsHandler.showMoreObject(3);
        }
    },

    updatePower : function(num)
    {
        if(num < 0 || this.powerTime > 0)
            return;

        if(num <= gameConfig.gamePowerNum)
        {
            this.powerNum = num;
            this.pbPower.progress = (num / gameConfig.gamePowerNum);

            if(this.powerNum == gameConfig.gamePowerNum)
            {
                this.powerTime = gameConfig.gamePowerTime;
                this.frameEffect.playEffect();

                gameSound.bgmPower();
            }
        }
    },

    setBtnLock : function(unLock)
    {
        this.btnUnLock = unLock;
    },

    onBtnGame : function(event, key)
    {
        if(this.btnUnLock && this.isGaming)
        {
            this.setBtnLock(false);

            var side = parseInt(key);
            if(side == this.objectsHandler.getNowSide())
            {
                if(this.powerTime > 0)
                    gameSound.succPower();
                else
                    gameSound.succNormal();

                var addScore = (this.powerTime > 0 ? gameConfig.gamePowerScore : gameConfig.gameBaseScore);
                this.updateScore(this.scoreNum + addScore);
                this.updatePower(this.powerNum + 1);

                this.bgHandler.distinguishCorrect();
                this.comboEffect.playEffect();
                this.objectsHandler.distinguishObjectCorrect();
            }
            else
            {
                gameSound.fail();

                this.updatePower(this.powerNum - 1);

                this.bgHandler.distinguishError();
                this.objectsHandler.distinguishObjectError();
            }

            setTimeout(this.setBtnLock.bind(this, true), 200);
        }
    },

    gameOver : function()
    {
        gameSound.gameOver();

        this.isGaming = false;
        this.setBtnLock(false);
        this.updateTime(0);

        this.showTxt("over", this.showOverLayer.bind(this));
    },

    showOverLayer : function()
    {
        this.gameOverLayer.active = true;
        this.tfGameOverScore.string = this.scoreNum;

        var num = 0;
        cc.each(gameConfig.gameScoreGrade, function(score)
        {
            if(this.scoreNum >= score)
                num ++;
        }, this);
        var frameName = "gameOver_txt_send" + num;
        this.imgOverSend.spriteFrame = uiTools.getSpriteFrame(frameName, res.ui_atlas);
    },

    restart : function()
    {
        this.reset();
        this.startGame();
    },

    reset : function()
    {
        this.isGaming = false;

        this.setBtnLock(false);

        this.updateScore(0);
        this.updateTime(0);

        this.powerNum = 0;
        this.powerTime = 0;
        this.updatePower(0);

        this.nodeTxt.active = false;
        this.gameStartLayer.active = false;
        this.gameOverLayer.active = false;
        this.tfGameOverScore.string = "";

        this.bgHandler.reset();
        this.objectsHandler.reset();
        this.frameEffect.playEnd();
        this.comboEffect.playEnd();
    }
});