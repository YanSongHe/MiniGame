var res = require("res");
var uiTools = require("UiTools");

var AddScoreEffect = cc.Class
({
    init : function()
    {
        this.showingEffectList = [];
        this.pool = new cc.NodePool();
    },

    getNode : function()
    {
        var node = null;
        if(this.pool.size() > 0)
            node = this.pool.get();
        else
            node = uiTools.createPrefab(res.nodeAddScore_Pre);

        return node
    },

    putNode : function(node)
    {
        if(node.parent == null)
            return;

        node.removeFromParent();
        node.getComponent(cc.Animation).stop();

        this.pool.put(node);
        this.showingEffectList.removeElement(node);
    },

    showEffect : function(parent, pos, num)
    {
        var node = this.getNode();
        node.parent = parent;
        node.x = pos.x;
        node.y = pos.y;
        node.scale = 2;

        var tfNode = node.getChildByName("tfAddScore");
        tfNode.getComponent(cc.Label).string = num;
        if((Math.abs(pos.x) + tfNode.width) > parent.width / 2)
        {
            if(pos.x > 0)
                node.x = parent.width / 2 - tfNode.width;
            else
                node.x = -(parent.width / 2 - tfNode.width);
        }

        var anim = node.getComponent(cc.Animation);
        anim.stop();
        anim.play("addScore");

        this.showingEffectList.push(node);
        setTimeout(this.putNode.bind(this, node), 1000);
    },

    stopAllEffect : function()
    {
        cc.each(this.showingEffectList, function(node)
        {
            if(node)
                this.putNode(node);
        }, this);
        this.showingEffectList = [];
    }
});

var addScoreEffect = new AddScoreEffect();
addScoreEffect.init();

module.exports = addScoreEffect;