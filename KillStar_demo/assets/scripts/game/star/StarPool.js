var uiTools = require("UiTools");
var res = require("res");

var StarPool = cc.Class
({
    init : function()
    {
        this.pool = new cc.NodePool();
    },

    getStar : function()
    {
        var nodeStar = null;
        if(this.pool.size() > 0)
            nodeStar = this.pool.get();
        else
            nodeStar = uiTools.createPrefab(res.star_Pre);

        return nodeStar
    },

    putStar : function(nodeStar)
    {
        this.pool.put(nodeStar);
    }
});

var starPool = new StarPool();
starPool.init();

module.exports = starPool;