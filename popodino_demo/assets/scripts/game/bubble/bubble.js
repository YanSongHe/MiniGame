var res = require("res");
var uiTools = require("UiTools");
var bubblePool = require("BubblePool");
var gameConfig = require("gameConfig");

cc.Class
({
    extends: cc.Component,

    properties :
    {

    },

    onLoad : function()
    {
        this.imgBubble = this.node.getComponent(cc.Sprite);
    },

    setBubbleType : function(type)
    {
        this.type = type;
        this.index = null;

        var frameName = "bubble_img_" + type;
        this.imgBubble.spriteFrame = uiTools.getSpriteFrame(frameName, res.bubble_atlas);

        this.setCircleColliderEnabled(true);
    },

    setListIndex : function(index)
    {
        this.index = index;
    },

    setCircleColliderEnabled : function(bool)
    {
        var rigidBody = this.node.getComponent(cc.RigidBody);
        if(rigidBody)
        {
            this.node.getComponent(cc.PhysicsCircleCollider).enabled = bool;
            rigidBody.enabled = bool;
        }
    },

    clearBubble : function()
    {
        this.setCircleColliderEnabled(false);

        var al = [];
        al.push(cc.fadeOut(0.2));
        al.push(cc.callFunc(this.removeBubble.bind(this)));
        this.node.runAction(cc.sequence(al));
    },

    fallBubble : function()
    {
        this.setCircleColliderEnabled(false);

        var al = [];
        al.push(cc.moveBy(0.4, 0, 10));
        al.push(cc.spawn(cc.moveBy(0.6, 0, -110), cc.fadeOut(0.6)));
        al.push(cc.callFunc(this.removeBubble.bind(this)));
        this.node.runAction(cc.sequence(al));
    },

    removeBubble : function()
    {
        this.node.opacity = 255;
        this.node.removeFromParent();

        bubblePool.putBubble(this.node);
    }
});
