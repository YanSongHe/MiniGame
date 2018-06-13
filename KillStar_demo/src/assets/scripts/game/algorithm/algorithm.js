var AlgorithmUtils = cc.Class
({
    getAimScoreIncrement : function(roundNum)
    {
        var addScore = 1500;

        var baseScore = 2000;
        var baseAddScore = 20;

        if(roundNum > 1)
            addScore = baseScore + baseAddScore * (roundNum - 2);

        return addScore;
    },

    getKillScore : function(num)
    {
        var baseScore = 5;
        var score = 0;

        for(var i = 0; i < num; i ++)
        {
            score += (2 * i + 1) * baseScore;
        }

        return score;
    },

    getSurplusAddScore : function(num, maxNum)
    {
        var baseScore = (num <= maxNum ? 1000 : 0);
        return (baseScore + this.getKillScore(maxNum - num));
    },

    getSurplusList : function(list)
    {
        var surplusList = [];

        var columnNum = list.length;
        var rowNum = list[0].length;

        for(var n = 0; n < rowNum; n ++)
        {
            for (var m = 0; m < columnNum; m++)
            {
                var node = list[m][n];

                if(node != null)
                    surplusList.push(node);
            }
        }

        return surplusList;

    },

    checkAdjacent : function(list)
    {
        var hintPosList = [];
        var columnNum = list.length;
        var rowNum = list[0].length;

        for(var n = 0; n < rowNum; n ++)
        {
            for (var m = 0; m < columnNum; m++)
            {
                var type0 = list[m][n];

                if(type0 == null)
                    continue;

                var type1 = ((m + 1) == columnNum ? null : list[m + 1][n]);
                var type2 = ((n + 1) == rowNum ? null : list[m][n + 1]);

                if(type0 == type1 || type0 == type2)
                    hintPosList.push(cc.p(m, n));
            }
        }

        return hintPosList;
    }
});

module.exports = AlgorithmUtils;