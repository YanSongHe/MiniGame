var fishConfig =
[
    {
        finsNum : 0,
        score : 50,

        maxFrameIndex : 8,
        frameName : "fish01_{0}",
        moveTypeList : [0, 1, 2, 3],

        hookSpace : 50,
        hookOffset0 : cc.p(0, -25),
        hookOffset1 : cc.p(8, -25)
    },

    {
        finsNum : 1,
        score : 100,

        maxFrameIndex : 7,
        frameName : "fish02_{0}",
        moveTypeList : [0, 2, 3],

        hookSpace : 60,
        hookOffset0 : cc.p(-15, -75),
        hookOffset1 : cc.p(20, -75)
    },

    {
        finsNum : 2,
        score : 300,

        maxFrameIndex : 8,
        frameName : "fish03_{0}",
        moveTypeList : [0, 2, 3],

        hookSpace : 80,
        hookOffset0 : cc.p(-15, -60),
        hookOffset1 : cc.p(15, -60)
    }
];

module.exports = fishConfig;