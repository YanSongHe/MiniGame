var uiTools = require("UiTools");
var res = require("res");

var type_color =
{
    "0" : cc.color(255, 0, 255),
    "1" : cc.color(255, 0, 0),
    "2" : cc.color(235, 255, 0),
    "3" : cc.color(0, 191, 255),
    "4" : cc.color(0, 255, 0)
};

var ParticleStarPool = cc.Class
({
    init : function()
    {
        this.pool = new cc.NodePool();
    },

    getParticleStar : function(type)
    {
        var nodeParticleStar = null;
        if(this.pool.size() > 0)
            nodeParticleStar = this.pool.get();
        else
            nodeParticleStar = uiTools.createPrefab(res.nodeParticleStar_Pre);

        var particleStar = nodeParticleStar.getChildByName("particleStar").getComponent(cc.ParticleSystem);
        particleStar.resetSystem();

        particleStar.startColor = type_color[type];
        //particleStar.startColorVar = type_color[type];
        particleStar.endColor = type_color[type];
        //particleStar.endColorVar = type_color[type];

        return nodeParticleStar;
    },

    putParticleStar : function(nodeParticleStar)
    {
        var particleStar = nodeParticleStar.getChildByName("particleStar");
        particleStar.getComponent(cc.ParticleSystem).stopSystem();

        this.pool.put(nodeParticleStar);
    }
});

var particleStarPool = new ParticleStarPool();
particleStarPool.init();

module.exports = particleStarPool;