var bubblePool = require("BubblePool");
var gameConfig = require("gameConfig");

cc.Class
({
    extends: cc.Component,

    properties :
    {

    },

    onLoad : function()
    {
        this.moveSpeed = 3000;

        //计算保留横坐标的初始位置
        this.firstX = -gameConfig.maxColumn * gameConfig.stepNumX / 2 + gameConfig.stepNumX / 4;
        this.firstY = this.node.height / 2 - 40;
    },

    setClearCallback : function(cb)
    {
        this.clearCB = cb;
    },

    setGameOverCallback : function(cb)
    {
        this.gameOverCB = cb;
    },

    startGame : function()
    {
        this.typeList = this.getRandomTypeList(5);
        this.updateBubbles();
    },

    addBubble : function(type, pos)
    {
        var nodeBubble = bubblePool.getBubble();
        nodeBubble.parent = this.node;
        nodeBubble.setPosition(pos);
        nodeBubble.getComponent("bubble").setBubbleType(type);

        return nodeBubble;
    },

    launchBubble : function(type, oldPos, posList, index)
    {
        var nodeBubble = this.addBubble(type, oldPos);

        var al = [];
        al.push(cc.delayTime(0.02));

        var prePos = oldPos;
        for(var i = 0; i < posList.length; i ++)
        {
            var movePos = this.node.convertToNodeSpaceAR(posList[i]);
            var moveT = movePos.sub(prePos).mag() / this.moveSpeed;
            al.push(cc.moveTo(moveT, movePos));

            prePos = movePos;
        }
        al.push(cc.callFunc(this.moveStopCB.bind(this, nodeBubble, index)));
        nodeBubble.runAction(cc.sequence(al));
        this.moveBubble = nodeBubble;
    },

    moveStopCB : function(nodeBubble, index)
    {
        var k1 = index.x;
        var k2 = index.y;

        this.moveBubble = null;
        if(k1 < gameConfig.maxRow)
        {
            this.typeList[k1][k2] = nodeBubble.getComponent("bubble").type;
            this.bubbleList[k1][k2] = nodeBubble;
            nodeBubble.getComponent("bubble").setListIndex(cc.p(k1, k2));

            this.checkClear(cc.p(k1, k2));
        }
        else
        {
            this.gameOverBubble = nodeBubble;

            if(this.gameOverCB != null)
                this.gameOverCB();
        }
    },

    getRandomTypeList : function(rowNum)
    {
        var list = [];
        for(var i = 0; i < gameConfig.maxRow; i ++)
        {
            var rowList = [];
            for(var j = 0; j < gameConfig.maxColumn; j ++)
            {
                var type = (i >= rowNum ? null : utils.randomInt(0, gameConfig.maxTypeNum));
                rowList.push(type);
            }

            list.push(rowList);
        }

        return list;
    },

    updateBubbles : function()
    {
        this.bubbleList = [];
        for(var i = 0; i < gameConfig.maxRow; i ++)
        {
            var rowList = [];
            for(var j = 0; j < gameConfig.maxColumn; j ++)
            {
                var type = this.typeList[i][j];
                if(type != null)
                {
                    var nodeBubble = this.addBubble(type, this.getPosByKey(i, j));
                    rowList.push(nodeBubble);

                    nodeBubble.getComponent("bubble").setListIndex(cc.p(i, j));
                }
                else
                {
                    rowList.push(null);
                }
            }
            this.bubbleList.push(rowList);
        }
    },

    getPosByKey : function(k1, k2)
    {
        var pos = cc.p(0, 0);
        pos.x = this.firstX + k2 * gameConfig.stepNumX;
        if(k1 % 2 == 1)
            pos.x += gameConfig.stepNumX / 2;
        pos.y = this.firstY - k1 * gameConfig.stepNumY;

        return pos;
    },

    checkClear : function(index)
    {
        this.clearList = [];
        this.addClearBubbleIndexInList(index);

        console.log(this.clearList);
        if (this.clearList.length >= 3)
        {
            this.clearBubbles();
            this.checkFallIntervalId = setTimeout(this.checkFall.bind(this), 20);
        }
    },

    clearBubbles : function()
    {
        for(var i = 0; i < this.clearList.length; i ++)
        {
            var saveIndex = this.clearList[i];
            var index1 = Math.floor(saveIndex / 100);
            var index2 = saveIndex % 100;

            var bubble = this.bubbleList[index1][index2].getComponent("bubble");
            bubble.clearBubble();

            this.bubbleList[index1][index2] = null;
            this.typeList[index1][index2] = null;

            if(this.clearCB != null)
                this.clearCB(1);
        }

        this.clearList = [];
    },

    addClearBubbleIndexInList : function(index)
    {
        var sameType = this.typeList[index.x][index.y];

        var newIndex = null;
        //六个方向校验是否同一颜色
        if(index.y > 0)
        {
            newIndex = cc.p(index.x, index.y - 1);
            this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);
        }

        if(index.y < (gameConfig.maxColumn - 1))
        {
            newIndex = cc.p(index.x, index.y + 1);
            this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);
        }

        if(index.x > 0)
        {
            newIndex = cc.p(index.x - 1, index.y);
            this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);

            if(index.x % 2 == 0)
            {
                newIndex = cc.p(index.x - 1, index.y - 1);
                this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);
            }
            else
            {
                newIndex = cc.p(index.x - 1, index.y + 1);
                this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);
            }
        }

        if(index.x < (gameConfig.maxRow - 1))
        {
            newIndex = cc.p(index.x + 1, index.y);
            this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);

            if(index.x % 2 == 0)
            {
                newIndex = cc.p(index.x + 1, index.y - 1);
                this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);
            }
            else
            {
                newIndex = cc.p(index.x + 1, index.y + 1);
                this.checkSameType(sameType, this.typeList[newIndex.x][newIndex.y], newIndex);
            }
        }
    },

    checkSameType : function(sameType, checkType, index)
    {
        if(sameType == checkType)
        {
            var saveIndex = index.x * 100 + index.y;
            if(this.clearList.indexOf(saveIndex) == -1)
            {
                this.clearList.push(saveIndex);
                this.addClearBubbleIndexInList(index);
            }
        }
    },

    checkFall : function()
    {
        this.hangList = [];
        for(var j = 0; j < gameConfig.maxColumn; j ++)
        {
            this.checkAdjacent(cc.p(0, j));
            this.addHangBubblesInList(cc.p(0, j));
        }

        for(var n = 0; n < gameConfig.maxRow; n ++)
        {
            for(var m = 0; m < gameConfig.maxColumn; m ++)
            {
                var type = this.typeList[n][m];
                if(type != null)
                {
                    var hangIndex = n * 100 + m;
                    if(this.hangList.indexOf(hangIndex) == -1)
                    {
                        var bubble = this.bubbleList[n][m].getComponent("bubble");
                        bubble.fallBubble();

                        this.bubbleList[n][m] = null;
                        this.typeList[n][m] = null;

                        if(this.clearCB != null)
                            this.clearCB(1);
                    }
                }
            }
        }
    },

    addHangBubblesInList : function(index)
    {
        if(this.typeList[index.x][index.y] == null)
            return;

        //六个方向校验是否有球
        var newIndex = null;
        if(index.y > 0)
        {
            newIndex = cc.p(index.x, index.y - 1);
            this.checkAdjacent(newIndex);
        }

        if(index.y < (gameConfig.maxColumn - 1))
        {
            newIndex = cc.p(index.x, index.y + 1);
            this.checkAdjacent(newIndex);
        }

        if(index.x > 0)
        {
            newIndex = cc.p(index.x - 1, index.y);
            this.checkAdjacent(newIndex);

            if(index.x % 2 == 0)
            {
                newIndex = cc.p(index.x - 1, index.y - 1);
                this.checkAdjacent(newIndex);
            }
            else
            {
                newIndex = cc.p(index.x - 1, index.y + 1);
                this.checkAdjacent(newIndex);
            }
        }

        if(index.x < (gameConfig.maxRow - 1))
        {
            newIndex = cc.p(index.x + 1, index.y);
            this.checkAdjacent(newIndex);

            if(index.x % 2 == 0)
            {
                newIndex = cc.p(index.x + 1, index.y - 1);
                this.checkAdjacent(newIndex);
            }
            else
            {
                newIndex = cc.p(index.x + 1, index.y + 1);
                this.checkAdjacent(newIndex);
            }
        }
    },

    checkAdjacent : function(index)
    {
        if(this.typeList[index.x][index.y] == null)
            return;

        var saveIndex = index.x * 100 + index.y;
        if(this.hangList.indexOf(saveIndex) == -1)
        {
            this.hangList.push(saveIndex);
            this.addHangBubblesInList(index);
        }
    },

    reset : function()
    {
        clearTimeout(this.checkFallIntervalId);

        this.clearList = [];
        this.hangList = [];


        if(this.moveBubble != null)
        {
            this.moveBubble.getComponent("bubble").removeBubble();
            this.moveBubble = null;
        }

        if(this.gameOverBubble != null)
        {
            this.gameOverBubble.getComponent("bubble").removeBubble();
            this.gameOverBubble = null;
        }

        this.typeList = [];
        for(var i = 0; i < gameConfig.maxRow; i ++)
        {
            var rowList = [];
            for(var j = 0; j < gameConfig.maxColumn; j ++)
            {
                rowList.push(null);

                if(this.bubbleList && this.bubbleList[i] && this.bubbleList[i][j])
                {
                    var nodeBubble = this.bubbleList[i][j];
                    nodeBubble.getComponent("bubble").removeBubble();

                    this.bubbleList[i][j] = null;
                }
            }
            this.typeList.push(rowList);
        }
    }
});
