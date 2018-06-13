var uiTools =
{
    getSpriteFrame:function(frameName, atlasName)
    {
        if(atlasName == null)
        {
            var spriteFrame = new cc.SpriteFrame();
            spriteFrame.setTexture(cc.loader.getRes(frameName));
            return spriteFrame;
        }

        var atlas = cc.loader.getRes(atlasName, cc.SpriteAtlas);
        return atlas.getSpriteFrame(frameName);
    },

    createSpriteNode:function(frameName, atlasName)
    {
        var node = new cc.Node();
        var sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.getSpriteFrame(frameName, atlasName);
        return node;
    },

    setSpriteFrame:function(node, frameName, atlasName)
    {
        var sprite = node.getComponent(cc.Sprite);
        var frame = this.getSpriteFrame(frameName, atlasName);
        if(frame == null)
        {
            console.log("setSpriteFrame:\"{0}\"--\"{1}\" no exist!".format(atlasName, frameName));
            return;
        }
        sprite.spriteFrame = frame;
    },

    createPrefab:function(prefabPath)
    {
        return cc.instantiate(cc.loader.getRes(prefabPath, cc.Prefab));
    },

    scaleClickRegion:function(btn, cb, rectRate)
    {
        var img = btn.node;
        btn.interactable = false;
        var trigger = cc.instantiate(img);
        trigger.setPosition(0, 0);
        trigger.scale = rectRate || 0.8;
        trigger.opacity = 1;
        trigger.parent = img;

        var zoomScale = btn.zoomScale;
        var duration = btn.duration;

        img.trigger = trigger;
        var saOverCB = function()
        {
            img.scaleState = 0;
        };

        var onTouchStart = function()
        {
            if(img.scaleState != 1 && img.scale < zoomScale)
            {
                img.stopAllActions();
                img.scaleState = 1;
                img.runAction(cc.sequence(cc.scaleTo(duration, zoomScale), cc.callFunc(saOverCB)));
            }
        };

        var onTouchEnd = function()
        {
            if(img.scaleState != -1 && img.scale > 1)
            {
                img.stopAllActions();
                img.scaleState = -1;
                img.runAction(cc.sequence(cc.scaleTo(duration, 1), cc.callFunc(saOverCB)));
            }
            if(cb != null)
                cb();
        };

        var onTouchCancel = function()
        {
            if(img.scaleState != -1 && img.scale > 1)
            {
                img.stopAllActions();
                img.scaleState = -1;
                img.runAction(cc.sequence(cc.scaleTo(duration, 1), cc.callFunc(saOverCB)));
            }
        };

        trigger.on(cc.Node.EventType.TOUCH_START, onTouchStart);
        trigger.on(cc.Node.EventType.TOUCH_END, onTouchEnd);
        trigger.on(cc.Node.EventType.TOUCH_CANCEL, onTouchCancel);
    },

    createFrameAnimationNode:function(data)
    {
        var spriteFrames = null;
        if(data.pattern)
        {
            spriteFrames = this.getSpriteFrames(data.atlas, data.pattern, data.idxStart, data.idxEnd);
        }
        else
        {
            var atlas = cc.loader.getRes(data.atlas, cc.SpriteAtlas);
            spriteFrames = atlas.getSpriteFrames();
        }

        if(data.idxFrameStart != null && data.idxFrameStart >= 0 && data.idxFrameStart < spriteFrames.length)
        {
            spriteFrames = spriteFrames.slice(data.idxFrameStart).concat(spriteFrames.slice(0, data.idxFrameStart));
        }

        var node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = spriteFrames[0];

        var animation = node.addComponent(cc.Animation);
        var clip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, data.fps);
        clip.name = data.clipName || 'anim';


        animation.addClip(clip);

        if(data.loop)
        {
            clip.wrapMode = cc.WrapMode.Loop;
            animation.play(clip.name);
        }
        else if(data.once)
        {
            animation.play(clip.name);
            var removeSelf = function()
            {
                node.parent = null;
                animation.off("finished", removeSelf);
            };
            animation.on("finished", removeSelf);
        }
        return node;
    },

    addOutline:function(node, color, width)
    {
        if(node instanceof cc.Label)
            node = node.node;

        if(node.getComponent(cc.Label) == null)
        {
            console.error("utils.ui.addOutline:is not label component");
            return;
        }

        var labelOutline = node.addComponent(cc.LabelOutline);
        labelOutline.color = color;
        labelOutline.width = width;
    }
};

module.exports = uiTools;