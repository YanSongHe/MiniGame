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
            score += (i + 1) * baseScore;
        }

        return score;
    }
});

module.exports = AlgorithmUtils;