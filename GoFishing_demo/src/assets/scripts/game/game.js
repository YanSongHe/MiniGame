var i18n = require("i18n");
var FishConfig = require("FishConfig");
var FishHandler = require("FishHandler");
var HookHandler = require("HookHandler");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        tfScore : cc.Label,

        fishHandler : {
            default : null,
            type : FishHandler
        },

        hookHandler : {
            default : null,
            type : HookHandler
        }
    },

    onLoad : function()
    {
        this.reset();
        this.startGame();

        this.fishHandler.setSelectFishCallback(this.fishHooked.bind(this));

        this.hookHandler.setPutCallBack(this.hookPutOver.bind(this));
        this.hookHandler.setBackCallback(this.hookBack.bind(this));
    },

    openTouch : function()
    {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
    },

    closeTouch : function()
    {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouch, this);
    },

    startGame : function()
    {
        this.openTouch();

        this.fishHandler.startFishing();
    },

    onTouch : function()
    {
        this.closeTouch();

        this.hookHandler.putDownHook();

        //先固定钓鱼结果
        this.hookedFishTypeList = this.getHookedFishTypeList();
        for(var i = 0; i < this.hookedFishTypeList.length; i ++)
        {
            this.scoreNum += FishConfig[this.hookedFishTypeList[i]].score;
        }
    },

    //客户端生成钓到的鱼的列表
    getHookedFishTypeList : function()
    {
        var list = [];

        var maxType = null;
        for(var i = 0; i < 12; i ++)
        {
            var addProbability = 0.02;
            if(maxType == null)
                addProbability = 0.7;
            else if(maxType == 0)
            {
                if(list.length < 4)
                    addProbability = 0.5;
                else
                    addProbability = 0.1;
            }

            if(utils.random(0, 1) < addProbability)
            {
                var addType = 2;
                var randomNum = utils.random(0, 1);
                if(randomNum < 0.8)
                    addType = 0;
                else if(randomNum < 0.95)
                    addType = 1;

                list.push(addType);
                maxType = (maxType == null ? addType : Math.max(addType, maxType));
            }
            else
                break;
        }

        return list;
    },

    hookPutOver : function()
    {
        if(this.hookedFishTypeList.length == 0)
        {
            this.hookBackIntervalId = setTimeout(this.hookHandler.takeBackHook.bind(this.hookHandler), 3000);

            return;
        }

        this.fishHandler.setSelectFishList(this.hookedFishTypeList);
    },

    fishHooked : function(type, pos)
    {
        this.hookHandler.getFish(type, pos);

        if(this.hookedFishTypeList.length == 0)
            this.hookBackIntervalId = setTimeout(this.hookHandler.takeBackHook.bind(this.hookHandler), 1500);
    },

    hookBack : function()
    {
        this.hookHandler.removeHookedFishes();

        this.updateScore(this.scoreNum);
        this.openTouch();
    },

    updateScore : function(num)
    {
        this.scoreNum = num;
        this.tfScore.string = i18n.getTxt("game_score_txt") + num;
    },
       
    gameOver : function()
    {
        this.closeTouch();
    },

    restart : function()
    {
        this.reset();
        this.startGame();
    },

    reset : function()
    {
        clearTimeout(this.hookBackIntervalId);

        this.closeTouch();
        this.updateScore(0);

        this.fishHandler.reset();
        this.hookHandler.reset();

        this.hookedFishTypeList = [];
    }
});