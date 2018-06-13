cc.Class
({
    extends: cc.Component,

    properties :
    {
        imgBG : cc.Node,
        tfTips : cc.Label
    },

    onLoad : function()
    {

    },

    showTips : function(tips, pos, cb)
    {
        this.imgBG.active = true;
        this.tfTips.string = tips;

        var step = this.node.width + this.imgBG.width;
        this.imgBG.y = pos.y;

        var al = [];
        al.push(cc.moveTo(0.5, 0, 0));
        al.push(cc.delayTime(1.5));
        al.push(cc.moveBy(0.5, step, 0));
        al.push(cc.callFunc(this.hideTips.bind(this, cb)));

        this.tfTips.node.stopAllActions();
        this.tfTips.node.x = -step;
        this.tfTips.node.runAction(cc.sequence(al));
    },

    hideTips : function(cb)
    {
        this.tfTips.node.stopAllActions();
        this.imgBG.active = false;

        if(cb != null)
            cb();
    }
});