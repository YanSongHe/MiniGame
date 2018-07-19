//开启物理系统
var physicsManager = cc.director.getPhysicsManager();
physicsManager.enabled = true;

//开启碰撞检测
var collisionManager = cc.director.getCollisionManager();
collisionManager.enabled = true;

physicsManager.debugDrawFlags = 
    0;
     //cc.PhysicsManager.DrawBits.e_aabbBit |
     //cc.PhysicsManager.DrawBits.e_jointBit |
     //cc.PhysicsManager.DrawBits.e_shapeBit;
