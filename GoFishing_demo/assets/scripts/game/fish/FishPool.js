var uiTools = require("UiTools");
var res = require("res");

var FishPool = cc.Class
({
    init : function()
    {
        this.pool = new cc.NodePool();
    },

    getFish : function()
    {
        var nodeFish = null;
        if(this.pool.size() > 0)
            nodeFish = this.pool.get();
        else
            nodeFish = uiTools.createPrefab(res.nodeFish_Pre);

        return nodeFish
    },

    putFish : function(nodeFish)
    {
        this.pool.put(nodeFish);
    }
});

var fishPool = new FishPool();
fishPool.init();

module.exports = fishPool;