var musicVolume = 1;
var effectVolume = 1;

var Audio = cc.Class
({
    ctor:function()
    {
        this._isStop = false;
        this.audio = null;

        this.musicId = null;
        this.effectId = null;

        //ios在未触发点击事件的时候，播放特效都无效
        if(cc.sys.__audioSupport && cc.sys.__audioSupport.context)
        {
            this._context = cc.sys.__audioSupport.context;
            if("createBufferSource" in this._context)
                this.audio = this._context["createBufferSource"]();
        }

        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
    },

    onGameHide:function ()
    {
        this._isStop = true;
    },

    onGameShow:function ()
    {
        this._isStop = false;
    },
    
    playMusic:function(path, loop)
    {
        this.stopMusic();
        path = cc.url.raw("resources/" + path);
        this.musicId = cc.audioEngine.play(path, loop, musicVolume);
        return this.musicId;
    },
    
    playEffect:function(path)
    {
        if (this.audio && (!this.audio.context.state || this.audio.context.state === "suspended") && this._context.currentTime === 0)
            return;

        this.audio = null;

        if(this._isStop)
            return;

        path = cc.url.raw("resources/" + path);
        this.effectId = cc.audioEngine.play(path, false, effectVolume);
        return this.effectId;
    },
    
    setMusicVolume:function(v)
    {
        musicVolume = v;
        if(this.musicId != null)
            cc.audioEngine.setVolume(this.musicId, v);
    },

    getMusicVolum:function ()
    {
      return musicVolume;
    },
    
    setEffectsVolume:function(v)
    {
        effectVolume = v;
        if(this.effectId != null)
            cc.audioEngine.setVolume(this.effectId, v);
    },

    getEffectsVolum:function ()
    {
      return effectVolume;
    },
    
    stopMusic:function()
    {
        if(this.musicId != null)
            cc.audioEngine.stop(this.musicId);
        this.musicId = null;
    },

    reset:function ()
    {
        this.stopMusic();
    }
});

module.exports = Audio;