var resTypes = [
    cc.SpriteFrame,
    cc.SpriteAtlas,
    cc.Prefab,
    cc.LabelAtlas,
    cc.TextAsset,
    cc.AudioClip,
    cc.AnimationClip,
    cc.Font
];
var overTime = 2 * 60000;

var ResManager = cc.Class
({
    load:function(resources, progressListener, completedListener, timeOutListener)
    {
        var loadResTimeout = setTimeout(function()
        {
            if(timeOutListener)
                timeOutListener();

        }, overTime);

        var r = this._addRes(resources);
        var loadedCount = 0;
        var totalCount = r.length;

        r.forEach(function(data)
        {
            var path = data[0];
            var type = data[1];

            cc.loader.loadRes(path, type, function(err, asset)
            {
                if(err != null)
                {
                    console.log("load asset error:" + path + "msg:" + err);
                }

                ++loadedCount;
                var percent = loadedCount / totalCount;
                if(progressListener)
                    progressListener(percent);

                if(loadedCount === totalCount)
                {
                    if(completedListener)
                        completedListener();

                    clearTimeout(loadResTimeout);
                }
            }.bind(this));
        }.bind(this));
    },

    _addRes : function (resLists) {
        var r = [];
        resLists.forEach(function(list, i){
            var type = resTypes[i];
            list.forEach(function(path){
                r.push([path, type]);
            });
        });

        return r;
    }
});

var resMgr = new ResManager();
module.exports = resMgr;