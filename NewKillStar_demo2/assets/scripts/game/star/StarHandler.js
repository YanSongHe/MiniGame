var starPool = require("StarPool");
var gameConfig = require("gameConfig");

cc.Class
({
    extends: cc.Component,

    properties :
    {

    },

    onLoad : function()
    {
        //计算保留横坐标的初始位置
        this.firstX = (this.node.width - gameConfig.rowNum * gameConfig.stepNum) / 2;
    },

    setKillCallback : function(cb)
    {
        this.killCB = cb;
    },


    setSupplementCallback : function(cb)
    {
        this.supplementCB = cb;
    },

    startGame : function()
    {
        this.reset();

        var typeListString = cc.sys.localStorage.getItem(gameConfig.account + "GAME_STAR_DATA");
        if(typeListString != null)
        {
            this.typeList = utils.getTDArrayFromString(typeListString, ",", ";");
        }
        else
        {
            this.typeList = this.createTypeList();

            typeListString = utils.getStringFromTDArray(this.typeList, ",", ";");
            cc.sys.localStorage.setItem(gameConfig.account + "GAME_STAR_DATA", typeListString);
        }

        this.updateLayer();
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
        var posY = gameConfig.stepNum / 2 - this.node.height / 2;

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

    onBtnKill : function(columnNum, type)
    {
        var isKill= false;
        for(var n = 0; n < gameConfig.rowNum; n ++)
        {
            var nodeStar = this.starList[columnNum][n];

            if(nodeStar != null)
            {
                var star = nodeStar.getComponent("star");
                if (star.type == type)
                {
                    isKill= true;
                    this.touchStars(columnNum, n);
                }
            }
        }

        return isKill;
    },

    //选中连在一起的星星
    touchStars : function(touchColumnNum, touchRowNum)
    {
        var nodeStar = this.starList[touchColumnNum][touchRowNum];
        var star = nodeStar.getComponent("star");

        this.selectStar(star.type, nodeStar, touchColumnNum, touchRowNum);
        setTimeout(this.killStars.bind(this), 200);
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

    killStars :function()
    {
        var killNum = this.selectedStarList.length;
        if(killNum == 0)
            return;

        var addScore = gameConfig.algorithm.getKillScore(killNum);
        this.killCB(killNum, addScore);

        cc.each(this.selectedStarList, function(node)
        {
            node.getComponent("star").onKill();
        }, this);
        this.selectedStarList = [];

        cc.each(this.selectedPosList, function(pos)
        {
            this.typeList[pos.x][pos.y] = null;
            this.starList[pos.x][pos.y] = null;
        }, this);
        this.selectedPosList = [];

        this.checkColumn();
    },

    //消除后移动星星，先检测列,后补充
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

        if(isMove)
            setTimeout(this.supplementStar.bind(this), 200);
        else
            this.supplementStar();
    },

    //消除后补充星星
    supplementStar : function()
    {
        var firstPosX = this.firstX + gameConfig.stepNum / 2 - this.node.width / 2;
        var firstPosY = gameConfig.stepNum / 2 - this.node.height / 2;

        for(var n = 0; n < gameConfig.rowNum; n ++)
        {
            for(var m = 0; m < gameConfig.columnNum; m ++)
            {
                var nodeStar = this.starList[m][n];

                var supplementColumnNum = 0;
                if(nodeStar == null)
                {
                    supplementColumnNum ++;

                    var x = firstPosX + gameConfig.stepNum * n;
                    var y = firstPosY + gameConfig.stepNum * m;
                    var pos1 = cc.p(x, (this.node.height + gameConfig.stepNum * supplementColumnNum));
                    var pos2 = cc.p(x, y);

                    var addStarType = utils.randomInt(0, gameConfig.maxTypeNum);
                    var addNodeStar = this.addStar(addStarType, pos1);

                    addNodeStar.runAction(cc.moveTo(0.2, pos2));

                    this.typeList[m][n] = addStarType;
                    this.starList[m][n] = addNodeStar;
                }
            }
        }

        setTimeout(this.supplementCB.bind(this), 200);

        var typeListString = utils.getStringFromTDArray(this.typeList, ",", ";");
        cc.sys.localStorage.setItem(gameConfig.account + "GAME_STAR_DATA", typeListString);
    },

    reset : function()
    {
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
    }
});