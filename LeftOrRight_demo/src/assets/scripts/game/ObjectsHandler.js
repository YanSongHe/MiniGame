var res = require("res");
var uiTools = require("UiTools");

var typeList = [
    ["monkeyRed", "checkGreen", "tofu"],
    ["monkeyBlack", "checkWhite", "bean"]
];

cc.Class({
    extends: cc.Component,

    properties :
    {
        imgLeftList : [cc.Sprite],
        imgRightList : [cc.Sprite],
        imgQueueList : [cc.Sprite]
    },

    onLoad : function()
    {

    },

    start : function()
    {
        this.showMoreObject(1);

        //生成列表
        this.queueTypeList = [];
        cc.each(this.imgQueueList, function(object)
        {
            object.node.active = true;

            var type = this.getNewObjectType();
            this.queueTypeList.push(type);

            var frameName = "objects_{0}_normal";
            object.spriteFrame = uiTools.getSpriteFrame(frameName.format(type), res.objects_atlas);
        }, this);
    },

    getNewObjectType : function()
    {
        return typeList[utils.randomInt(0, 1)][utils.randomInt(0, (this.moreObjectNum - 1))];
    },

    showMoreObject : function(num)
    {
        if(this.moreObjectNum >= num)
            return;

        this.moreObjectNum = num;
        var frameName = "objects_{0}_normal";
        this.imgLeftList[num - 1].node.active = true;
        this.imgLeftList[num - 1].spriteFrame = uiTools.getSpriteFrame(frameName.format(typeList[0][num - 1]), res.objects_atlas);
        this.imgRightList[num - 1].node.active = true;
        this.imgRightList[num - 1].spriteFrame = uiTools.getSpriteFrame(frameName.format(typeList[1][num - 1]), res.objects_atlas);
    },

    getNowSide : function()
    {
        var side = 0;
        if(typeList[1].indexOf(this.queueTypeList[0]) != -1)
            side = 1;

        return side;
    },

    distinguishObjectCorrect : function()
    {
        var frameName = "objects_{0}_succ";
        this.imgQueueList[0].spriteFrame = uiTools.getSpriteFrame(frameName.format(this.queueTypeList[0]), res.objects_atlas);

        setTimeout(this.addObjectToQueue.bind(this), 100);
    },

    distinguishObjectError : function()
    {
        var frameName = "objects_{0}_fail";
        this.imgQueueList[0].spriteFrame = uiTools.getSpriteFrame(frameName.format(this.queueTypeList[0]), res.objects_atlas);

        //还原
        var reductionFun = function()
        {
            var frameName = "objects_{0}_normal";
            this.imgQueueList[0].spriteFrame = uiTools.getSpriteFrame(frameName.format(this.queueTypeList[0]), res.objects_atlas);
        }.bind(this);
        setTimeout(reductionFun, 200);
    },

    addObjectToQueue : function()
    {
        this.queueTypeList.shift();
        this.queueTypeList.push(this.getNewObjectType());

        for(var n = 0; n < 6; n ++)
        {
            var img = this.imgQueueList[n];
            var node = img.node;
            var imgNext = this.imgQueueList[n + 1];
            var nodeNext = imgNext.node;

            var frameName = "objects_{0}_normal";
            img.spriteFrame = uiTools.getSpriteFrame(frameName.format(this.queueTypeList[n]), res.objects_atlas);


            var oldScale = node.scale;
            var oldPos = node.position;

            node.scale = nodeNext.scale;
            node.position = nodeNext.position;
            node.runAction(cc.spawn(cc.scaleTo(0.1, oldScale), cc.moveTo(0.1, oldPos.x, oldPos.y)));
        }

        //最后一位添加
        var addFun = function()
        {
            this.imgQueueList[6].node.active = true;

            var frameName = "objects_{0}_normal";
            this.imgQueueList[6].spriteFrame = uiTools.getSpriteFrame(frameName.format(this.queueTypeList[6]), res.objects_atlas);
        }.bind(this);

        this.imgQueueList[6].node.active = false;
        setTimeout(addFun, 100);
    },

    over : function()
    {
        this.reset();
    },

    reset : function()
    {
        this.moreObjectNum = 0;

        cc.each(this.imgLeftList, function(object)
        {
            object.node.active = false;
        }, this);

        cc.each(this.imgRightList, function(object)
        {
            object.node.active = false;
        }, this);

        this.queueTypeList = [];
        cc.each(this.imgQueueList, function(object)
        {
            object.node.active = false;
        }, this);
    }
});
