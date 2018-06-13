var starPool = require("StarPool");
var gameConfig = require("gameConfig");

var type_color =
{
    "0" : cc.color(199, 107, 246),
    "1" : cc.color(247, 101, 129),
    "2" : cc.color(235, 203, 42),
    "3" : cc.color(43, 184, 242),
    "4" : cc.color(49, 203, 92)
};

cc.Class
({
    extends: cc.Component,

    properties :
    {
        imgSelectedTypeBG : cc.Node,

        imgBtnKillsBG : cc.Node,
        btnKillList : [cc.Node]
    },

    onLoad : function()
    {
        //Ìí¼ÓNextNode
        this.selectedType = 0;
        this.nextNode = this.addNode(this.imgSelectedTypeBG, 0, cc.p(0, 0));
    },

    addNode : function(parent, type, pos)
    {
        if(type == null)
            return;

        var node = starPool.getStar();
        parent.addChild(node);

        node.setPosition(pos);
        node.getComponent("star").initStar(type);

        return node;
    },

    startGame : function()
    {
        this.imgSelectedTypeBG.active = true;
        this.imgBtnKillsBG.active = true;

        this.setSelectedType(this.selectedType);
    },

    setSelectedType : function(type)
    {
        this.selectedType = type;
        this.nextNode.getComponent("star").initStar(this.selectedType);

        cc.each(this.btnKillList, function(btnNode)
        {
           btnNode.color = type_color[type];
        }, this);
    },

    onChangeType : function()
    {
        var changeType = this.selectedType + 1;
        changeType = (changeType > gameConfig.maxTypeNum ? 0 : changeType);

        this.setSelectedType(changeType);
    },

    reset : function()
    {
        this.imgSelectedTypeBG.active = false;
        this.imgBtnKillsBG.active = false;
    }
});