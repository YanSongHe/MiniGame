var gameConfig = require("gameConfig");

cc.Class
({
    extends: cc.Component,

    properties :
    {
        nodeAddRing : cc.Node,
        nodeRingsMatrix : [cc.Node]
    },

    onLoad : function()
    {
        this.effects = this.node.getComponent("effects");
        this.oldAddRingPos = this.nodeAddRing.getPosition();
    },

    setGameOverCallback : function(cb)
    {
        this.gameOverCB = cb;
    },

    startGame : function()
    {
        this.showNewAddNode(null);
    },

    showNewAddNode : function(data)
    {
        this.nodeAddRing.scale = 1;
        this.nodeAddRing.opacity = 255;
        this.nodeAddRing.active = true;
        this.addData = data || this.getNewAddData();
        this.updateNodeRing(this.nodeAddRing, this.addData);

        //出来的动作
        if(data == null)
        {
            this.nodeAddRing.y = -(this.node.height + this.nodeAddRing.height) / 2;
            this.nodeAddRing.runAction(cc.moveTo(0.2, this.oldAddRingPos.x, this.oldAddRingPos.y));

            cc.sys.localStorage.setItem(gameConfig.account + "GAME_ADD_NODE_DATA", this.addData.toString());
        }
    },

    changeAddNode : function()
    {
        if(this.nodeAddRing.getNumberOfRunningActions() == 0)
        {
            var al = [];
            al.push(cc.spawn(cc.scaleTo(0.2, 0.5), cc.fadeOut(0.2)));
            al.push(cc.callFunc(this.showNewAddNode.bind(this, null)));
            this.nodeAddRing.runAction(cc.sequence(al));

            return true;
        }

        return false;
    },

    getNewAddData : function()
    {
        var maxColorIndex = gameConfig.useColorNum;
        var data = [0, 0, 0];

        var addDataTypeList = this.ringsDataMatrix.concat();
        var i = 0;
        while(i < addDataTypeList.length)
        {
            var oneData = addDataTypeList[i];
            if(oneData.getElementNum(0) == 0)
                addDataTypeList.splice(i, 1);
            else
                i ++;
        }
        if(addDataTypeList.length == 0)
        {
            if(this.gameOverCB != null)
                this.gameOverCB();

            return data;
        }

        var addRingNum = 0;
        var randomDataType = addDataTypeList[utils.randomInt(0, addDataTypeList.length - 1)];
        for(var n = 0; n < 3; n ++)
        {
            var ringColorType = randomDataType[n];
            if(ringColorType == 0)
            {
                data[n] = utils.randomInt(1, maxColorIndex);
                addRingNum ++;
            }
        }

        if(addRingNum > 1)
        {
            data[utils.randomInt(0, 2)] = 0;
            if(addRingNum > 2)
                data[utils.randomInt(0, 2)] = 0;
        }

        return data;
    },

    addRingsToMatrix : function(index)
    {
        if(index == -1)
            return false;

        var preRingsData = this.ringsDataMatrix[index].concat();
        for(var i = 0; i < preRingsData.length; i ++)
        {
            var addRingColor = this.addData[i];
            var preRingColor = preRingsData[i];

            if(addRingColor != 0 && preRingColor != 0)
            {
                return false;
            }
            else if(preRingColor == 0)
            {
                preRingsData[i] = addRingColor;
            }
        }
        this.addRingIndex = index;
        this.ringsDataMatrix[index] = preRingsData;

        return true;
    },

    updateRingsMatrix : function(isReset)
    {
        for(var n = 0; n < 9; n ++)
        {
            var nodeRing = this.nodeRingsMatrix[n];
            var ringData = this.ringsDataMatrix[n];

            this.updateNodeRing(nodeRing, ringData);
        }

        if(!isReset)
        {
            var nodesData = utils.getStringFromTDArray(this.ringsDataMatrix, ",", ";");
            cc.sys.localStorage.setItem(gameConfig.account + "GAME_NODES_DATA", nodesData);
        }
    },

    updateNodeRing : function(nodeRing, ringData)
    {
        for(var m = 0; m < 3; m ++)
        {
            var imgRing = nodeRing.getChildByName("imgRing" + m);
            var ringColorType = ringData[m];

            imgRing.scale = 1;
            imgRing.active = (ringColorType != 0);
            if(ringColorType != 0)
                imgRing.color = gameConfig.ringsColorList[ringColorType];
        }
    },

    reductionRing : function(nodeRing)
    {
        nodeRing.scale = 1;
    },

    clearRings : function(cb)
    {
        var clearRingsNum = 0;

        var clearData = this.checkClear();
        var clearList = clearData[0];
        if(clearList.length != 0)
        {
            for(var i = 0; i < clearList.length; i ++)
            {
                var pos = clearList[i].split(":");
                var oldColorType = this.ringsDataMatrix[pos[0]][pos[1]];
                if(oldColorType != 0)
                {
                    this.ringsDataMatrix[pos[0]][pos[1]] = 0;

                    var imgRing = this.nodeRingsMatrix[pos[0]].getChildByName("imgRing" + pos[1]);
                    //缩小的效果
                    imgRing.runAction(cc.sequence(cc.scaleTo(0.2, 0), cc.callFunc(this.reductionRing.bind(this, imgRing))));
                    //粒子效果
                    this.effects.addRingsParticle(oldColorType, this.nodeRingsMatrix[pos[0]].getPosition());

                    clearRingsNum ++;
                }
            }
            this.clearEffectOverIntervalId = setTimeout(this.updateRingsMatrix.bind(this, false), 250);
        }

        if(cb != null)
            cb(clearRingsNum, clearData[1]);
    },

    checkClear : function()
    {
        var clearNum = 0;
        var clearPosList = [];

        //光线效果参数
        var laserPos = null;
        var laserColorType = null;

        var index = this.addRingIndex;
        var rowIndex = Math.floor(index / 3);
        var columnIndex = index % 3;

        //要传进去校验三个的参数
        var changedRings = this.ringsDataMatrix[index];
        var indexList = [];

        //三环同点
        var sameColorType = changedRings[0];
        if(sameColorType != 0 && changedRings.getElementNum(sameColorType) == 3)
        {
            for(var i = 0; i < 3; i ++)
            {
                clearPosList.push(index + ":" + i);
            }
            clearNum ++;
        }

        //行
        indexList = [(rowIndex * 3), (rowIndex * 3 + 1), (rowIndex * 3 + 2)];
        var rowClearPosList = this.check3nodeRingsClear(changedRings, indexList);
        clearPosList = clearPosList.concat(rowClearPosList);
        if(rowClearPosList.length != 0)
        {
            laserPos = rowClearPosList[0].split(":");
            laserColorType = this.ringsDataMatrix[laserPos[0]][laserPos[1]];
            this.effects.showLaser(rowIndex, laserColorType);

            clearNum ++;
        }

        //列
        indexList = [columnIndex, (3 + columnIndex), (6 + columnIndex)];
        var columnClearPosList = this.check3nodeRingsClear(changedRings, indexList);
        clearPosList = clearPosList.concat(columnClearPosList);
        if(columnClearPosList.length != 0)
        {
            laserPos = columnClearPosList[0].split(":");
            laserColorType = this.ringsDataMatrix[laserPos[0]][laserPos[1]];
            this.effects.showLaser((columnIndex + 3), laserColorType);

            clearNum ++;
        }

        //左斜
        indexList = [0, 4, 8];
        if(indexList.indexOf(index) != -1)
        {
            var leftSkewClearPosList = this.check3nodeRingsClear(changedRings, indexList);
            clearPosList = clearPosList.concat(leftSkewClearPosList);
            if(leftSkewClearPosList.length != 0)
            {
                laserPos = leftSkewClearPosList[0].split(":");
                laserColorType = this.ringsDataMatrix[laserPos[0]][laserPos[1]];
                this.effects.showLaser(6, laserColorType);

                clearNum ++;
            }
        }

        //右斜
        indexList = [2, 4, 6];
        if(indexList.indexOf(index) != -1)
        {
            var rightSkewClearPosList = this.check3nodeRingsClear(changedRings, indexList);
            clearPosList = clearPosList.concat(rightSkewClearPosList);
            if(rightSkewClearPosList.length != 0)
            {
                laserPos = rightSkewClearPosList[0].split(":");
                laserColorType = this.ringsDataMatrix[laserPos[0]][laserPos[1]];
                this.effects.showLaser(7, laserColorType);

                clearNum ++;
            }
        }

        //if(clearPosList.length != 0)
        //    console.log(clearPosList);

        return [clearPosList, clearNum];
    },

    //检测三个是否可以消除
    check3nodeRingsClear : function(changeRings, indexList)
    {
        var ringsList = [
            this.ringsDataMatrix[indexList[0]],
            this.ringsDataMatrix[indexList[1]],
            this.ringsDataMatrix[indexList[2]]
        ];

        var clearColorTypeList = [];
        for(var i = 0; i < 3; i ++)
        {
            var colorType = changeRings[i];
            if(colorType == 0 || clearColorTypeList.indexOf(colorType) != -1)
                continue;

            var haveSameColor0 = ringsList[0].getElementNum(colorType) != 0;
            var haveSameColor1 = ringsList[1].getElementNum(colorType) != 0;
            var haveSameColor2 = ringsList[2].getElementNum(colorType) != 0;
            if(haveSameColor0 && haveSameColor1 && haveSameColor2)
                clearColorTypeList.push(colorType);
        }

        var clearPosList = [];
        for(var j = 0; j < clearColorTypeList.length; j ++)
        {
            var clearColorType = clearColorTypeList[j];
            for(var n = 0; n < 3; n ++)
            {
                var clearIndex = indexList[n];
                for(var m = 0; m < 3; m ++)
                {
                    var checkColorType = this.ringsDataMatrix[clearIndex][m];
                    if(checkColorType == clearColorType)
                        clearPosList.push(clearIndex + ":" + m);
                }
            }
        }

        //if(clearPosList.length != 0)
        //    console.log(clearPosList);

        return clearPosList;
    },

    reset : function()
    {
        clearTimeout(this.clearEffectOverIntervalId);

        this.addData = [0, 0, 0];
        this.nodeAddRing.stopAllActions();
        this.oldAddRingPos && this.nodeAddRing.setPosition(this.oldAddRingPos);
        this.nodeAddRing.active = false;

        this.ringsDataMatrix = [];
        for(var n = 0; n < 9; n ++)
        {
            this.ringsDataMatrix.push([0, 0, 0]);
            //this.ringsDataMatrix.push([utils.randomInt(0, 3), utils.randomInt(0, 3), utils.randomInt(0, 3)]);
        }
        this.updateRingsMatrix(true);

        this.effects && this.effects.reset();
    }
});
