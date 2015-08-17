/**
 * Created by jingzhe.feng on 2015-08-17.
 */
module.exports = {

    isEnergyFull : function(obj) {
        if(obj.energy == obj.energyCapacity)
            return true;

        return false;
    },

    isCarryEnergyFull : function(obj) {
        if(obj.carry.energy == obj.carryCapacity)
            return true;

        return false;
    },

    needRepair : function(obj) {
        if(obj.hits/obj.hitsMax>0.8)
            return false;

        return true;
    },

    gabageCollect : function () {
        var creepsPrefix = ["harvester", "builder", "guard", "controllerbuilder", "exttrans", "digger"];
        var idx, prefixIdx;
        for (idx in Memory.creeps) {
            var obj = Memory.creeps[idx];
            for(prefixIdx in creepsPrefix) {
                if(idx.startsWith(creepsPrefix[prefixIdx]) && typeof Game.creeps[idx] == "undefined") {
                    console.log("remove creep from memory:"+idx);
                    delete Memory.creeps[idx];
                }
            }

        }
    },
};