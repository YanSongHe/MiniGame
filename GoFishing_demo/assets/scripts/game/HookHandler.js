var fishPool = require("FishPool");

var Hook_State =
{
    normal : 0,
    putDown : 1,
    takeBack : 2
};

var HookMinLength = 78;
var HookMaxLength = 367;

cc.Class
({
    extends: cc.Component,

    properties :
    {
        imgGameHook : cc.Node
    },

    onLoad : function()
    {
        this.hookedFishList = [];
    },

    setPutCallBack : function(cb)
    {
        this.pushCB = cb;
    },

    setBackCallback : function(cb)
    {
        this.backCB = cb;
    },

    update : function()
    {
        if(this.hookState != Hook_State.normal)
        {
            var step = 5;
            if(this.hookState == Hook_State.putDown)
            {
                this.imgGameHook.height += step;
                if(this.imgGameHook.height > HookMaxLength)
                {
                    this.imgGameHook.height = HookMaxLength;
                    this.putDownOver();
                }
            }

            if(this.hookState == Hook_State.takeBack)
            {
                this.imgGameHook.height -= step;
                if(this.imgGameHook.height < HookMinLength)
                {
                    this.imgGameHook.height = HookMinLength;
                    this.takeBackOver();
                }

                //鱼跟着上去
                cc.each(this.hookedFishList, function(node)
                {
                    if(node)
                    {
                        node.y += step * this.imgGameHook.scale;
                    }
                }, this);
            }
        }
    },

    putDownHook : function()
    {
        this.imgGameHook.active = true;
        this.imgGameHook.height = HookMinLength;
        this.hookState = Hook_State.putDown;
    },

    putDownOver : function()
    {
        this.hookState = Hook_State.normal;

        if(this.pushCB != null)
            this.pushCB();
    },

    takeBackHook : function()
    {
        this.hookState = Hook_State.takeBack;
    },

    takeBackOver : function()
    {
        this.hookState = Hook_State.normal;

        if(this.backCB != null)
            this.backCB();
    },

    getFish : function(fishType, pos)
    {
        pos.x -= this.node.width / 2;
        pos.y -= this.node.height / 2;
        var nodeFish = this.addOneFish(fishType, pos);
        nodeFish.scaleX = (pos.x > 0 ? -1 : 1);
        this.hookedFishList.push(nodeFish);

        this.fishMoveToHook(nodeFish);
    },

    fishMoveToHook : function(nodeFish)
    {
        var fishData = nodeFish.getComponent("FishBase").fishData;
        var hookOffset = (nodeFish.scaleX > 0 ? fishData.hookOffset0 : fishData.hookOffset1);
        var aimPosX = this.imgGameHook.x + hookOffset.x;
        var aimPosY = this.imgGameHook.y - HookMaxLength * this.imgGameHook.scale + hookOffset.y - this.hookSpaces;
        var rotateDirection = nodeFish.scaleX;

        var al = [];
        al.push(cc.delayTime(0.3));
        al.push(cc.rotateBy(0.2, (-30 * rotateDirection)));
        al.push(cc.spawn(cc.rotateTo(0.5, (-75 * rotateDirection)), cc.moveTo(0.5, aimPosX, aimPosY)));
        nodeFish.runAction(cc.sequence(al));

        this.hookSpaces += fishData.hookSpace;
    },

    addOneFish : function(fishType, pos)
    {
        var nodeFish = fishPool.getFish();
        nodeFish.parent = this.node;
        nodeFish.x = pos.x;
        nodeFish.y = pos.y;

        var fish = nodeFish.getComponent("FishBase");
        fish.initFish(fishType);
        fish.swim();

        return nodeFish;
    },

    removeHookedFishes : function()
    {
        this.hookSpaces = 0;
        cc.each(this.hookedFishList, function(node)
        {
            if(node)
            {
                node.stopAllActions();
                node.removeFromParent();
                node.getComponent("FishBase").reset();

                fishPool.putFish(node);
            }
        }, this);
        this.hookedFishList = [];
    },

    reset : function()
    {
        this.hookState = Hook_State.normal;
        this.imgGameHook.active = false;

        this.removeHookedFishes();
    }
});
