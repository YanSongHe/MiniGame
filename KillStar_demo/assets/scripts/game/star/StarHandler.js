var starPool = require("StarPool");
var particleStarPool = require("ParticleStarPool");

var gameConfig = require("gameConfig");
var gameSound = require("gameSound");
var addScoreEffect = require("AddScoreEffect");

var hintDT = 5;

cc.Class
({
    extends: cc.Component,

    properties :
    {

    },

    onLoad : function()
    {
        this.hintT = hintDT;
        this.hintPos = null;

        //计算保留横坐标的初始位置
        this.firstX = (this.node.width - gameConfig.rowNum * gameConfig.stepNum) / 2;
        this.firstY = 100;
    },

    setKillCallback : function(cb)
    {
        this.killCB = cb;
    },

    setGameOverCallback : function(cb)
    {
        this.gameOverCB = cb;
    },

    startGame : function()
    {
        this.reset();

        var typeListString = cc.sys.localStorage.getItem(gameConfig.gameName + "GAME_STAR_DATA");
        if(typeListString != null)
        {
            this.typeList = utils.getTDArrayFromString(typeListString, ",", ";");
        }
        else
        {
            this.typeList = this.createTypeList();

            typeListString = utils.getStringFromTDArray(this.typeList, ",", ";");
            cc.sys.localStorage.setItem(gameConfig.gameName + "GAME_STAR_DATA", typeListString);
        }

        this.updateLayer();
        this.startAction(this.startActionCB.bind(this));
    },

    startAction : function(cb)
    {
        var delayT = 0;
        for(var n = 0; n < gameConfig.rowNum; n ++)
        {
            delayT = 0.1 * n;
            for(var m = 0; m < gameConfig.columnNum; m ++)
            {
                var nodeStar = this.starList[m][n];

                if(nodeStar != null)
                {
                    nodeStar.y += this.node.height;
                    nodeStar.runAction(cc.sequence(cc.delayTime(delayT), cc.moveBy(0.2, 0, -this.node.height)))
                }

                delayT += 0.1;
            }
        }

        setTimeout(cb, 2000);
    },

    startActionCB : function()
    {
        this.openTouch();
        this.checkContinue();
    },

    openTouch : function()
    {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    },

    closeTouch : function()
    {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);
    },

    //生成星星类型列表
    createTypeList : function()
    {
        var list = [];
        for(var i = 0; i < gameConfig.columnNum; i ++)
        {
            var rowList = [];
            for(var j = 0; j < gameConfig.rowNum; j ++)
            {
                rowList.push(utils.randomInt(0, gameConfig.maxTypeNum));
            }

            list.push(rowList);
        }

        return list;
    },

    updateLayer : function()
    {
        var posX = this.firstX + gameConfig.stepNum / 2 - this.node.width / 2;
        var posY = this.firstY + gameConfig.stepNum / 2 - this.node.height / 2;

        for(var i = 0; i < gameConfig.columnNum; i ++)
        {
            var rowX = posX;
            var rowList = [];
            for(var j = 0; j < gameConfig.rowNum; j ++)
            {
                rowList.push(this.addStar(this.typeList[i][j], cc.p(rowX, posY)));

                rowX += gameConfig.stepNum;
            }

            posY += gameConfig.stepNum;
            this.starList.push(rowList);
        }
    },

    addStar : function(type, pos)
    {
        if(type == null)
            return;

        var nodeStar = starPool.getStar();
        this.node.addChild(nodeStar);

        nodeStar.setPosition(pos);
        nodeStar.getComponent("star").initStar(type);

        return nodeStar;
    },

    addParticleStar : function(type, pos)
    {
        var particleStar = particleStarPool.getParticleStar(type);
        this.node.addChild(particleStar);
        particleStar.setPosition(pos);

        return particleStar;
    },

    removeParticleStar : function(particleStar)
    {
        particleStar.removeFromParent();
        particleStarPool.putParticleStar(particleStar);
    },

    //点击相应
    onTouchBegan : function(touch, event)
    {
        var touchPos = touch.getLocation();
        var layerPos = this.node.convertToNodeSpace(touchPos);

        var touchRowNum = Math.floor((layerPos.x - this.firstX) / gameConfig.stepNum);
        var touchColumnNum = Math.floor((layerPos.y - this.firstY) / gameConfig.stepNum);

        var inInRow = (touchRowNum >= 0) && (touchRowNum < gameConfig.rowNum);
        var inInColumn = (touchColumnNum >= 0) && (touchColumnNum < gameConfig.columnNum);
        if(inInRow && inInColumn)
        {
            this.touchStars(touchColumnNum, touchRowNum);
        }
        else
        {
            this.recoverStars();
        }
    },

    //选中连在一起的星星
    touchStars : function(touchColumnNum, touchRowNum)
    {
        var nodeStar = this.starList[touchColumnNum][touchRowNum];

        if(this.selectedStarList.indexOf(nodeStar) == -1)
        {
            this.recoverStars();

            if(nodeStar != null)
            {
                gameSound.selectStar();

                var star = nodeStar.getComponent("star");
                this.selectSameTypeStars(star.type, touchColumnNum, touchRowNum);

                this.stopHintStars();
            }
        }
        else
        {
            this.killStars(nodeStar);
        }
    },

    recoverStars : function()
    {
        cc.each(this.selectedStarList, function(node)
        {
            node.getComponent("star").onSelect(false);
        }, this);

        this.selectedStarList = [];
        this.selectedPosList = [];
    },

    killStars :function(nodeStar)
    {
        var addScorePos = nodeStar.getPosition();
        var killNum = this.selectedStarList.length;
        var addScore = gameConfig.algorithm.getKillScore(killNum);
        if(this.killCB != null)
            this.killCB(killNum, addScore);

        cc.each(this.selectedStarList, function(node)
        {
            gameSound.killStar();

            var star = node.getComponent("star");
            star.onKill();

            //碎星星效果
            var particleStar = this.addParticleStar(star.type, node.getPosition());
            setTimeout(this.removeParticleStar.bind(this, particleStar), 3000);
        }, this);
        this.selectedStarList = [];

        cc.each(this.selectedPosList, function(pos)
        {
            this.typeList[pos.x][pos.y] = null;
            this.starList[pos.x][pos.y] = null;
        }, this);
        this.selectedPosList = [];

        //消除获得的分数
        addScoreEffect.showEffect(this.node, addScorePos, addScore);

        this.checkColumn();
    },

    //判断相连的星星是否同类型
    selectSameTypeStars : function(type, touchColumnNum, touchRowNum)
    {
        var nodeStar = null;

        //左边
        if(touchColumnNum - 1 >= 0)
        {
            nodeStar = this.starList[touchColumnNum - 1][touchRowNum];
            this.selectStar(type, nodeStar, touchColumnNum - 1, touchRowNum);
        }

        //右边
        if(touchColumnNum + 1 < gameConfig.columnNum)
        {
            nodeStar = this.starList[touchColumnNum + 1][touchRowNum];
            this.selectStar(type, nodeStar, touchColumnNum + 1, touchRowNum);
        }

        //下边
        if(touchRowNum - 1 >= 0)
        {
            nodeStar = this.starList[touchColumnNum][touchRowNum - 1];
            this.selectStar(type, nodeStar, touchColumnNum, touchRowNum - 1);
        }

        //上边
        if(touchRowNum + 1 < gameConfig.rowNum)
        {
            nodeStar = this.starList[touchColumnNum][touchRowNum + 1];
            this.selectStar(type, nodeStar, touchColumnNum, touchRowNum + 1);
        }
    },

    //这颗星星是否被选中
    selectStar : function(type, nodeStar, touchColumnNum, touchRowNum)
    {
        if(nodeStar == null)
            return;

        var star = nodeStar.getComponent("star");
        if(type == star.type && !star.isSelected)
        {
            star.onSelect(true);
            this.selectedStarList.push(nodeStar);
            this.selectedPosList.push(cc.p(touchColumnNum, touchRowNum));

            //传递下去
            this.selectSameTypeStars(type, touchColumnNum, touchRowNum);
        }
    },

    //消除后移动星星，先检测列
    checkColumn : function()
    {
        var isMove = false;

        for(var n = 0; n < gameConfig.rowNum; n ++)
        {
            var emptyNum = 0;
            for(var m = 0; m < gameConfig.columnNum; m ++)
            {
                var type = this.typeList[m][n];
                var nodeStar = this.starList[m][n];

                if(nodeStar == null)
                {
                    emptyNum ++;
                }
                else if(emptyNum != 0)
                {
                    isMove = true;
                    nodeStar.runAction(cc.moveBy(0.1, 0, -(emptyNum * gameConfig.stepNum)));

                    this.typeList[m - emptyNum][n] = type;
                    this.typeList[m][n] = null;
                    this.starList[m - emptyNum][n] = nodeStar;
                    this.starList[m][n] = null;
                }
            }
        }

        //先关闭一会点击
        this.closeTouch();
        if(isMove)
            setTimeout(this.checkRow.bind(this), 200);
        else
            this.checkRow();
    },

    checkRow : function()
    {
        var isMove = false;
        var emptyNum = 0;

        for(var n = 0; n < gameConfig.rowNum; n ++)
        {
            var type = this.typeList[0][n];
            var nodeStar = this.starList[0][n];

            if(nodeStar == null)
            {
                emptyNum ++;
            }
            else if(emptyNum != 0)
            {
                for(var m = 0; m < gameConfig.columnNum; m ++)
                {
                    type = this.typeList[m][n];
                    nodeStar = this.starList[m][n];

                    isMove = true;
                    if(nodeStar != null)
                        nodeStar.runAction(cc.moveBy(0.1, -(emptyNum * gameConfig.stepNum), 0));

                    this.typeList[m][n - emptyNum] = type;
                    this.typeList[m][n] = null;
                    this.starList[m][n - emptyNum] = nodeStar;
                    this.starList[m][n] = null;
                }
            }
        }

        if(isMove)
            setTimeout(this.openTouch.bind(this), 200);
        else
            this.openTouch();

        //用算法校验是否还可以消除
        this.checkContinue();

        var typeListString = utils.getStringFromTDArray(this.typeList, ",", ";");
        cc.sys.localStorage.setItem(gameConfig.gameName + "GAME_STAR_DATA", typeListString);
    },

    checkContinue : function()
    {
        var hintPosList = gameConfig.algorithm.checkAdjacent(this.typeList);
        if(hintPosList.length == 0)
            this.gameOver();
        else
            this.setHintStar(hintPosList);
    },

    setHintStar : function(hintPosList)
    {
        this.hintT = hintDT;
        this.hintPos = hintPosList[utils.randomInt(0, (hintPosList.length - 1))];

        var nodeStar = this.starList[this.hintPos.x][this.hintPos.y];
        if(nodeStar != null)
        {
            var star = nodeStar.getComponent("star");
            this.selectSameTypeStars(star.type, this.hintPos.x, this.hintPos.y);

            this.hintStarList = this.selectedStarList;
            this.recoverStars();
        }
    },

    update : function(dt)
    {
        if(this.selectedStarList.length == 0)
            this.hintT -= dt;
        else
            this.hintT = hintDT;

        if(this.hintStarList.length != 0 && this.hintT < 0 )
        {
            this.hintT = hintDT;

            this.hintStars();
        }
    },

    hintStars : function()
    {
        cc.each(this.hintStarList, function(node)
        {
            if(node)
                node.getComponent("star").onHint();
        }, this);
    },

    stopHintStars : function()
    {
        cc.each(this.hintStarList, function(node)
        {
            if(node)
                node.getComponent("star").stopHint();
        }, this);

        this.hintStarList = [];
    },

    gameOver : function()
    {
        this.surplusList = gameConfig.algorithm.getSurplusList(this.starList);

        if(this.gameOverCB != null)
            this.gameOverCB(this.surplusList.length);
    },

    removeSurplusStar : function()
    {
        cc.each(this.surplusList, function(node)
        {
            if(node)
            {
                var star = node.getComponent("star");
                star.removeStar();

                //碎星星效果
                var particleStar = this.addParticleStar(star.type, node.getPosition());
                setTimeout(this.removeParticleStar.bind(this, particleStar), 3000);
            }
        }, this);

        this.surplusList = [];
    },

    reset : function()
    {
        this.hintT = hintDT;
        this.hintPos = null;

        cc.each(this.starList, function(list)
        {
            if(list)
            {
                cc.each(list, function(node)
                {
                    if(node)
                        node.getComponent("star").removeStar();
                }, this);
            }
        }, this);

        this.typeList = [];
        this.starList = [];
        this.selectedStarList = [];
        this.selectedPosList = [];

        this.stopHintStars();
        this.removeSurplusStar();
        this.closeTouch();

        addScoreEffect.stopAllEffect();
    },

    onDestroy : function()
    {
        this.closeTouch();
    }
});