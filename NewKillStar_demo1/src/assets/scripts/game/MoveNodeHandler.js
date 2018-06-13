var starPool = require("StarPool");
var gameConfig = require("gameConfig");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        imgNextNodeBG : cc.Node,
        maskMoveNode : cc.Node
    },

    onLoad : function()
    {
        //Ìí¼ÓNextNode
        this.nextType = 0;
        this.nextNode = this.addNode(this.imgNextNodeBG, 0, cc.p(0, 0));

        //Ìí¼ÓMoveNode
        this.moveType = null;
        this.moveNode = this.addNode(this.maskMoveNode, 0, cc.p(0, 0));
        this.setMoveNodeVisible(false);
    },

    startGame : function()
    {
        this.imgNextNodeBG.active = true;
        this.maskMoveNode.active = true;

        this.setNextNode();
    },

    onChangeNextType : function()
    {
        if(this.moveNode == null || this.moveNode.active == false)
            return;

        var moveDistance = this.maskMoveNode.height / 2 - gameConfig.stepNum;
        var isMove = (this.moveNode.y <= moveDistance) && (this.moveNode.y >= -moveDistance);
        if(isMove)
        {
            var changeType = this.nextType + 1;
            changeType = (changeType > gameConfig.maxTypeNum ? 0 : changeType);

            this.setNextNode(changeType);
        }
    },

    setNextNode : function(type)
    {
        if(type == null)
            this.nextType = utils.randomInt(0, gameConfig.maxTypeNum);
        else
            this.nextType = type;

        this.nextNode.getComponent("star").initStar(this.nextType);
    },

    move : function()
    {
        this.setMoveNodeVisible(true);

        this.moveType = this.nextType;
        this.moveNode.getComponent("star").initStar(this.moveType);

        var moveDistance = this.maskMoveNode.height + gameConfig.stepNum;
        this.moveNode.y = moveDistance / 2;

        var al = [];
        al.push(cc.moveBy(3, 0, -moveDistance));
        al.push(cc.callFunc(this.move.bind(this)));
        this.moveNode.runAction(cc.sequence(al));

        this.setNextNode();
    },

    stopMove : function()
    {
        if(this.moveNode == null)
            return;

        this.moveType = null;
        this.moveNode.stopAllActions();
    },

    setMoveNodeVisible : function(bool)
    {
        this.moveNode.active = bool;
    },

    getMoveNodeY : function()
    {
        return this.moveNode.y;
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

    reset : function()
    {
        this.stopMove();

        this.imgNextNodeBG.active = false;
        this.maskMoveNode.active = false;
    }
});