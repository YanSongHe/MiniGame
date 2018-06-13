var fishPool = require("FishPool");

var shoalTypeList = [0, 0, 0, 0, 0, 1, 1, 2];
var shoalPosYList = [750, 700, 620, 520, 380, 450, 300, 150];

cc.Class
({
    extends: cc.Component,

    properties :
    {

    },

    onLoad : function()
    {

    },

    startFishing : function()
    {
        this.nodeFishList = [];

        this.addShoal();
        //this.addShoal2IntervalId = setTimeout(this.addShoal.bind(this), 4000);
    },

    //鱼群入场
    addShoal : function()
    {
        var fishNum = 8;
        for(var i = 0; i < fishNum; i ++)
        {
            var fishType = shoalTypeList[i];
            var posY = shoalPosYList[i];

            var nodeFish = this.addOneFish(fishType, posY);
            this.fishMove(nodeFish);

            this.nodeFishList.push(nodeFish);
        }
    },

    addOneFish : function(fishType, posY)
    {
        var nodeFish = fishPool.getFish();
        nodeFish.parent = this.node;
        nodeFish.x = -1600;
        nodeFish.y = posY;

        var fish = nodeFish.getComponent("FishBase");
        fish.initFish(fishType);
        fish.swim();
        fish.setMoveOverCallback(this.oneMoveOver.bind(this));

        return nodeFish;
    },

    fishMove : function(nodeFish)
    {
        var moveTypeList = nodeFish.getComponent("FishBase").getMoveTypeList();
        var moveType = moveTypeList[utils.randomInt(0, (moveTypeList.length - 1))];
        var isContrary = (utils.random(-1, 1) >= 0);

        var al = [];
        al.push(cc.delayTime(utils.random(0, 2)));
        al.push(cc.callFunc(function()
        {
            nodeFish.getComponent("FishBase").move(moveType, isContrary);
        }, this));
        nodeFish.runAction(cc.sequence(al));
    },

    oneMoveOver : function(nodeFish)
    {
        this.fishMove(nodeFish);
    },

    setSelectFishList : function(list)
    {
        this.selectFishList = list;
    },

    setSelectFishCallback : function(cb)
    {
        this.selectFishCB = cb;
    },

    update : function(dt)
    {
        this.selectCoolingT -= dt;
        if(this.selectFishList.length != 0 && this.selectCoolingT <= 0)
        {
            for(var i = 0; i < this.nodeFishList.length; i ++)
            {
                var node = this.nodeFishList[i];
                if(node)
                {
                    var fishType = node.getComponent("FishBase").fishData.finsNum;
                    if(this.selectFishList.indexOf(fishType) != -1)
                    {
                        var isInLeftRange = (node.scaleX == 1 && utils.isNumInRange(node.x, -100, -200));
                        var isInRightRange = (node.scaleX == -1 && utils.isNumInRange(node.x, 200, 100));
                        if(isInLeftRange || isInRightRange)
                        {
                            this.selectFish(node, fishType);

                            this.selectCoolingT = 1.5;
                            break;
                        }
                    }
                }
            }
        }
    },

    selectFish : function(node, type)
    {
        this.selectFishList.removeElement(type);

        var pos = node.convertToWorldSpace(cc.p(0,0));
        if(this.selectFishCB != null)
            this.selectFishCB(type, pos);

        node.getComponent("FishBase").stopMove();
        node.x = -1600;
        this.newMoveIntervalId = setTimeout(this.fishMove.bind(this, node), 1500);
    },

    reset : function()
    {
        clearTimeout(this.newMoveIntervalId);
        //clearTimeout(this.addShoal2IntervalId);

        this.selectCoolingT = 0;
        this.selectFishList = [];

        cc.each(this.nodeFishList, function(node)
        {
            if(node)
            {
                node.stopAllActions();
                node.removeFromParent();
                node.getComponent("FishBase").reset();

                fishPool.putFish(node);
            }
        }, this);
        this.nodeFishList = [];
    }
});
