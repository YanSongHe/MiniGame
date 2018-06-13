var res = require("res");
var uiTools = require("UiTools");
var gameConfig = require("gameConfig");

cc.Class
({
    extends : cc.Component,

    properties :
    {
        ringsParticleLayer : cc.Node,
        imgLaserList : [cc.Node]
    },

    onLoad : function()
    {
        this.ringsParticleList = [];
        this.ringsParticlePool = new cc.NodePool();
    },

    addRingsParticle : function(type, pos)
    {
        var nodeRingsParticle = null;
        if(this.ringsParticlePool.size() > 0)
            nodeRingsParticle = this.ringsParticlePool.get();
        else
            nodeRingsParticle = uiTools.createPrefab(res.RingsParticleSystem_Pre);

        nodeRingsParticle.parent = this.ringsParticleLayer;
        nodeRingsParticle.setPosition(pos);
        this.ringsParticleList.push(nodeRingsParticle);

        var ringsParticle = nodeRingsParticle.getComponent(cc.ParticleSystem);
        ringsParticle.startColor = gameConfig.ringsColorList[type];
        //ringsParticle.startColorVar = cc.color(0, 0, 0);
        ringsParticle.endColor = gameConfig.ringsColorList[type];
        //ringsParticle.endColorVar = cc.color(0, 0, 0);
        ringsParticle.resetSystem();

        setTimeout(this.removeRingsParticle.bind(this, nodeRingsParticle), 1000);
    },

    removeRingsParticle : function(nodeRingsParticle)
    {
        nodeRingsParticle.removeFromParent();

        var ringsParticle = nodeRingsParticle.getComponent(cc.ParticleSystem);
        ringsParticle.stopSystem();

        this.ringsParticlePool.put(nodeRingsParticle);
        this.ringsParticleList.removeElement(nodeRingsParticle);
    },

    showLaser : function(laserNum, type)
    {
        var imgLaser = this.imgLaserList[laserNum];
        imgLaser.scaleX = 1;
        imgLaser.color = gameConfig.ringsColorList[type];
        imgLaser.active = true;

        var al = [];
        al.push(cc.delayTime(0.1));
        al.push(cc.scaleTo(0.1, 0.2, 1));
        al.push(cc.delayTime(0.2));
        al.push(cc.callFunc(function()
        {
            imgLaser.scaleX = 1;
            imgLaser.active = false;
        }, this));
        imgLaser.stopAllActions();
        imgLaser.runAction(cc.sequence(al));
    },

    reset : function()
    {
        var resetRingsParticleList = this.ringsParticleList.concat();
        cc.each(resetRingsParticleList, function(node)
        {
            if(node)
                this.removeRingsParticle(node);
        }, this);
        this.ringsParticleList = [];

        cc.each(this.imgLaserList, function(node)
        {
            if(node)
            {
                node.stopAllActions();
                node.active = false;
            }
        }, this);
    }
});
