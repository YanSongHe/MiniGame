var BubbleHandler = require("BubbleHandler");
var gameConfig = require("gameConfig");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        nodeLaunchBubble : cc.Node,
        nodeReadyBubble : cc.Node,

        bubbleHandler : BubbleHandler
    },

    onLoad : function()
    {
        this.radius = 2500;

        this.ptStart = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        this.ptStart = this.node.parent.convertToNodeSpaceAR(this.ptStart);
    },

    startGame : function()
    {
        this.isGaming = true;

        this.node.active = true;
        this.nodeLaunchBubble.active = true;
        this.nodeReadyBubble.active = true;

        this.readyToLaunch(null);
    },

    gameOver : function()
    {
        this.isGaming = false;
    },

    setLaunchBubbleType : function(type)
    {
        this.launchType = (type == null ? utils.randomInt(0, gameConfig.maxTypeNum) : type);
        this.nodeLaunchBubble.getComponent("bubble").setBubbleType(this.launchType);
    },

    setReadBubbleType : function(type)
    {
        this.readyType = (type == null ? utils.randomInt(0, gameConfig.maxTypeNum) : type);
        this.nodeReadyBubble.getComponent("bubble").setBubbleType(this.readyType);
    },

    readyToLaunch : function(type)
    {
        this.setLaunchBubbleType(type);
        this.setReadBubbleType();

        var oldPos = this.nodeLaunchBubble.getPosition();
        this.nodeLaunchBubble.setPosition(this.nodeReadyBubble.getPosition());
        this.nodeLaunchBubble.runAction(cc.moveTo(0.1, oldPos));

        this.nodeReadyBubble.opacity = 0;
        this.nodeReadyBubble.runAction(cc.sequence(cc.delayTime(0.1), cc.fadeIn(0.1)));
    },

    getCastDirection : function(ptWorld)
    {
        var pt = this.node.parent.convertToNodeSpaceAR(ptWorld);
        return cc.pNormalize(cc.pSub(pt, this.ptStart));
    },

    turnPad : function(ptWorld)
    {
        if(!this.isGaming)
            return;

        var dir = this.getCastDirection(ptWorld);
        var angle = 90 - cc.pToAngle(dir) / Math.PI * 180;

        if(angle < 80 && angle > -80)
            this.node.rotation = angle;
    },

    launchBubble : function(ptWorld)
    {
        if(!this.isGaming || this.bubbleHandler.moveBubble != null)
            return;

        var dir = this.getCastDirection(ptWorld);
        var angle = cc.pToAngle(dir);
        var checkAngle = 90 - angle / Math.PI * 180;

        if(checkAngle < 80 && checkAngle > -80)
        {
            this.colliderIndex = null;

            var posList = [];
            var p1 = this.ptStart;
            var p2 = cc.v2(Math.cos(angle), Math.sin(angle)).mulSelf(this.radius).addSelf(this.ptStart);
            var worldP1 = this.node.parent.convertToWorldSpaceAR(p1);
            var worldP2 = this.node.parent.convertToWorldSpaceAR(p2);
            this.getMoveToPos(worldP1, worldP2, posList);

            //console.log(posList);
            //console.log(this.colliderIndex);
            this.bubbleHandler.launchBubble(this.launchType, this.ptStart, posList, this.colliderIndex);

            this.readyToLaunch(this.readyType);
        }
    },

    getMoveToPos : function(p1, p2, list)
    {
        var manager = cc.director.getPhysicsManager();
        var result = manager.rayCast(p1, p2)[0];

        if(result == null)
        {
            list.push(p2);
        }
        else
        {
            var normal = result.normal;
            var collider = result.collider;
            var colliderBubble = collider.getComponent("bubble");
            if(colliderBubble != null)
            {
                var bumpBubblePos = this.getBumpBubblePos(colliderBubble, result.point);
                list.push(this.node.parent.convertToWorldSpaceAR(bumpBubblePos));
            }
            else if(normal.x == 0)
            {
                var bumpTopWallPos = this.getBumpTopWallPos(result.point);
                list.push(this.node.parent.convertToWorldSpaceAR(bumpTopWallPos));
            }
            else
            {
                list.push(result.point);

                var inVer = cc.pNormalize(cc.pSub(p2, p1));
                var newP1 = result.point;
                var newP2 = cc.p((1 - 2 * Math.abs(normal.x)) * inVer.x, (1 - 2 * Math.abs(normal.y)) * inVer.y).mul(this.radius).add(newP1);

                this.getMoveToPos(newP1, newP2, list);
            }
        }
    },

    getBumpBubblePos : function(bubble, pos)
    {
        var bubblePos = this.node.parent.convertToWorldSpaceAR(bubble.node.getPosition());
        var dir = cc.pNormalize(cc.pSub(pos, bubblePos));
        var angle = cc.pToAngle(dir) / Math.PI * 180;

        var newIndex = cc.p(bubble.index.x, bubble.index.y);
        console.log(angle);
        console.log(newIndex);
        if(angle < 170 && angle > 90)
        {
            newIndex.x -= 1;

            if(newIndex.x % 2 == 1)
                newIndex.y -= 1;
        }
        else if(angle < 90 && angle > 10)
        {
            newIndex.x -= 1;

            if(newIndex.x % 2 == 0)
                newIndex.y += 1;
        }
        else if(angle < 10 && angle > -10)
        {
            newIndex.y += 1;
        }
        else if(angle < -10 && angle > -90)
        {
            newIndex.x += 1;

            if(newIndex.x % 2 == 0)
                newIndex.y += 1;
        }
        else if(angle < -90 && angle > -170)
        {
            newIndex.x += 1;

            if(newIndex.x % 2 == 1)
                newIndex.y -= 1;
        }
        else
        {
            newIndex.y -= 1;
        }
        console.log(newIndex);
        this.colliderIndex = newIndex;

        return (this.bubbleHandler.getPosByKey(newIndex.x, newIndex.y));
    },

    getBumpTopWallPos : function(pos)
    {
        var pt = this.node.parent.convertToNodeSpaceAR(pos);
        var firstX = -gameConfig.maxColumn * gameConfig.stepNumX / 2 + gameConfig.stepNumX / 4;
        var k1 = 0;
        var k2 = Math.round((pt.x - firstX) / gameConfig.stepNumX);
        this.colliderIndex = cc.p(k1, k2);

        console.log(cc.p(k1, k2));
        return (this.bubbleHandler.getPosByKey(k1, k2));
    },

    reset : function()
    {
        this.isGaming = false;
        this.colliderIndex = null;

        this.node.active = false;
        this.nodeLaunchBubble.active = false;
        this.nodeReadyBubble.active = false;
    }
});
