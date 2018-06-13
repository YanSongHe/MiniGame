var gameConfig = require("gameConfig");
var RingsHandler = require("RingsHandler");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        ringsHandler : {
            default : null,
            type : RingsHandler
        },

        tfScore : cc.Label,
        tfMaxScore : cc.Label,
        tfMultiple : cc.Label,
        tfChangeNum : cc.Label,

        stopLayer : cc.Node,
        overLayer : cc.Node
    },

    onLoad : function()
    {
        this.reset();
        setTimeout(this.startGame.bind(this), 0.1);

        var maxScore = cc.sys.localStorage.getItem(gameConfig.account + "GAME_MAX_SCORE");
        if(maxScore)
            this.tfMaxScore.string = maxScore;
        else
            this.tfMaxScore.string = 0;

        this.ringsHandler.setGameOverCallback(this.gameOver.bind(this));
    },

    startGame : function()
    {
        this.isGame = true;

        //开始的时候只有四种颜色
        gameConfig.useColorNum = 4;

        //读档
        var scoreStr = cc.sys.localStorage.getItem(gameConfig.account + "GAME_SCORE");
        if(scoreStr != null)
        {
            var scoreNum = parseInt(scoreStr);
            var multipleNum = parseInt(cc.sys.localStorage.getItem(gameConfig.account + "GAME_MULTIPLE"));
            var changeNum = parseInt(cc.sys.localStorage.getItem(gameConfig.account + "GAME_CHANGE_NUM"));

            this.updateScore(scoreNum);
            this.updateMultiple(multipleNum);
            this.updateChangeNum(changeNum);

            //还原环s
            var nodesData = cc.sys.localStorage.getItem(gameConfig.account + "GAME_NODES_DATA");
            this.ringsHandler.ringsDataMatrix = utils.getTDArrayFromString(nodesData, ",", ";");
            this.ringsHandler.updateRingsMatrix(false);

            var addNodeData = cc.sys.localStorage.getItem(gameConfig.account + "GAME_ADD_NODE_DATA").split(",");
            this.ringsHandler.showNewAddNode(addNodeData);

            this.showStopLayer();
        }
        else
        {
            this.ringsHandler.startGame();
            this.updateChangeNum(gameConfig.changeNum);
        }

        this.openTouch();
    },

    updateScore : function(num)
    {
        this.scoreNum = num;
        this.tfScore.string = num;

        var maxScore = cc.sys.localStorage.getItem(gameConfig.account + "GAME_MAX_SCORE");
        if(maxScore == null || parseInt(maxScore) < num)
        {
            this.tfMaxScore.string = num;

            cc.sys.localStorage.setItem(gameConfig.account + "GAME_MAX_SCORE", num);
        }

        //颜色随着分值增多
        var addColorNum = Math.floor(num / 200);
        addColorNum = (addColorNum > 8 ? 8 : addColorNum);
        gameConfig.useColorNum = 4 + addColorNum;

        if(this.isGame)
            cc.sys.localStorage.setItem(gameConfig.account + "GAME_SCORE", num);
    },

    updateMultiple : function(num)
    {
        this.multipleNum = num;
        this.tfMultiple.string = "×" + num;
        this.tfMultiple.node.active = (num > 1);

        if(this.isGame)
            cc.sys.localStorage.setItem(gameConfig.account + "GAME_MULTIPLE", num);
    },

    updateChangeNum : function(num)
    {
        this.changeNum = num;
        this.tfChangeNum.string = num;
        this.tfChangeNum.node.active = (num > 0);

        if(this.isGame)
            cc.sys.localStorage.setItem(gameConfig.account + "GAME_CHANGE_NUM", num);
    },

    onChangeAddNode : function()
    {
        if(this.changeNum > 0)
        {
            var isChange = this.ringsHandler.changeAddNode();
            if(isChange)
                this.updateChangeNum(this.changeNum - 1);
        }
    },

    clearRingsCB : function(clearRingsNum, multiple)
    {
        if(clearRingsNum == 0)
            this.updateMultiple(0);
        else
            this.updateMultiple(this.multipleNum + multiple);

        this.updateScore(this.scoreNum + clearRingsNum * this.multipleNum);

        //震动效果
        if(this.multipleNum > 1)
            this.shockScreen();
    },

    //因为不是很多，暂时放在主逻辑类里
    //++++++++++++++++++++操作（触摸移动）相关++++++++++++++++++++
    openTouch : function()
    {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
    },

    closeTouch : function()
    {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this);
    },

    checkHitNode : function(node, pt)
    {
        var size = node.getContentSize();
        var bb = cc.rect(0,0, size.width, size.height);
        return cc.rectContainsPoint(bb, node.convertToNodeSpace(pt));
    },

    checkHitMatrix : function(pt)
    {
        var nodeList = this.ringsHandler.nodeRingsMatrix;
        for(var i = 0; i < nodeList.length; i ++)
        {
            if(this.checkHitNode(nodeList[i], pt))
                return i;
        }

        return -1;
    },

    onTouchBegan : function(touch, event)
    {
        if(!this.hitNode)
        {
            var node = this.ringsHandler.nodeAddRing;
            this.hitNode = this.checkHitNode(node, touch.getLocation());
        }

        return true;
    },

    onTouchMoved : function(touch, event)
    {
        if(this.hitNode)
        {
            var node = this.ringsHandler.nodeAddRing;
            node.setPosition((touch.getLocation().x - this.node.width / 2), (touch.getLocation().y - this.node.height / 2));
        }

        return true;
    },

    onTouchEnded : function(touch, event)
    {
        if(this.hitNode)
        {
            this.hitNode = false;
            var hitMatrixIndex = this.checkHitMatrix(touch.getLocation());
            var isCanAdd = this.ringsHandler.addRingsToMatrix(hitMatrixIndex);

            var node = this.ringsHandler.nodeAddRing;
            var pos = this.ringsHandler.oldAddRingPos;
            if(isCanAdd)
            {
                node.setPosition(pos);
                node.active = false;

                this.ringsHandler.updateRingsMatrix(false);
                this.clearIntervalId = setTimeout(this.ringsHandler.clearRings.bind(this.ringsHandler, this.clearRingsCB.bind(this)), 200);
                this.nextIntervalId = setTimeout(this.ringsHandler.showNewAddNode.bind(this.ringsHandler, null), 200);
            }
            else
            {
                node.runAction(cc.moveTo(0.2, pos.x, pos.y));
            }
        }

        return true;
    },
    //++++++++++++++++++++操作（触摸移动）相关++++++++++++++++++++

    shockScreen : function()
    {
        var range = 20;
        var al = [];
        al.push(cc.moveBy(0.02, range, range));
        al.push(cc.moveTo(0.02, 0, 0));
        al.push(cc.moveBy(0.02, -range, -range));
        al.push(cc.moveTo(0.02, 0, 0));
        this.node.runAction(cc.repeat(cc.sequence(al), 5));
    },
       
    gameOver : function()
    {
        this.isGame = false;
        this.overLayer.active = true;

        this.closeTouch();
        this.clearLocalStorage();
    },

    restart : function()
    {
        this.reset();
        this.clearLocalStorage();
        this.startGame();
    },

    showStopLayer : function()
    {
        this.stopLayer.active = true;
    },

    hideStopLayer : function()
    {
        this.stopLayer.active = false;
    },

    clearLocalStorage : function()
    {
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_SCORE");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_MULTIPLE");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_CHANGE_NUM");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_NODES_DATA");
        cc.sys.localStorage.removeItem(gameConfig.account + "GAME_ADD_NODE_DATA");
    },

    reset : function()
    {
        this.isGame = false;
        this.hitNode = false;

        this.overLayer.active = false;

        this.closeTouch();
        this.updateScore(0);
        this.updateMultiple(0);
        this.updateChangeNum(0);
        this.hideStopLayer();

        clearTimeout(this.clearIntervalId);
        clearTimeout(this.nextIntervalId);

        this.ringsHandler.reset();
    },

    onDestroy : function()
    {
        this.closeTouch();
    }
});