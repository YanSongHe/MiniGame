cc.Class({
    extends: cc.Component,

    properties :
    {
        anim : cc.Animation
    },

    onLoad : function()
    {
        this.imgStageClearBG = this.node.getChildByName("imgStageClearBG");
        this.imgStageClear = this.node.getChildByName("imgStageClear");
    },

    playEffect : function(pos, cb)
    {
       this.node.active = true;

        this.pos = pos;
        this.setPlayEndCallback(cb);

        this.imgStageClearBG.active = true;

        this.imgStageClear.stopAllActions();
        this.imgStageClear.setPosition(0, 0);

        this.anim.stop();
        this.anim.play("stageClear");
    },

    flyWord : function()
    {
        this.imgStageClearBG.active = false;

        var al = [];
        al.push(cc.moveTo(0.2, this.pos.x, this.pos.y));
        al.push(cc.callFunc(this.playEnd.bind(this)));
        this.imgStageClear.runAction(cc.sequence(al));
    },

    playSound : function()
    {

    },

    setPlayEndCallback : function(cb)
    {
        this.endCB = cb;
    },

    playEnd : function()
    {
        this.imgStageClear.stopAllActions();
        this.imgStageClear.setPosition(0, 0);

        this.anim.stop();
        this.node.active = false;

        var cb = this.endCB;
        this.endCB = null;

        if(cb != null)
            cb();
    }
});