cc.Class({
    extends: cc.Component,

    properties :
    {
        anim : cc.Animation
    },

    playEffect : function()
    {
        this.node.active = true;

        this.anim.stop();
        this.anim.play("ComboEffect");
    },

    playSound : function()
    {

    },

    playEnd : function()
    {
        this.anim.stop();
        this.node.active = false;
    }
});
