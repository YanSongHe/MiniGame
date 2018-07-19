var res = require("res");
var uiTools = require("UiTools");

var BubblePool = cc.Class
({
    init : function()
    {
        this.pool = new cc.NodePool();
    },

    getBubble : function()
    {
        var nodeBubble = null;
        if(this.pool.size() > 0)
            nodeBubble = this.pool.get();
        else
            nodeBubble = uiTools.createPrefab(res.nodeBubble_Pre);

        return nodeBubble
    },

    putBubble : function(nodeBubble)
    {
        this.pool.put(nodeBubble);
    }
});

var bubblePool = new BubblePool();
bubblePool.init();

module.exports = bubblePool;