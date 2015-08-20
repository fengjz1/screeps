/**
 * Created by jingzhe.feng on 2015-08-18.
 */
module.exports = {
    init: function () {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

        //update wall/rampart hitsBuildTarget
        var BUILD_UNIT = 50000; //buildUnit = 50k
        var structures = curRoom.find(FIND_STRUCTURES);
        if (!curRoom.memory.structures) curRoom.memory.structures = {};
        structures.forEach(function (structure) {
            if (structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL) {
                if (!curRoom.memory.structures[structure.id]) curRoom.memory.structures[structure.id] = {};
                if (structure.hitsMax < 10) return;  //deal with exceptional ramparts data 20150820
                var mem = curRoom.memory.structures[structure.id];
                if (typeof mem.needRepair == "undefined") {
                    if (structure.hits / structure.hitsMax < 0.5) {
                        mem.needRepair = true;
                        mem.hitsBuildTarget = (Math.floor(structure.hits / BUILD_UNIT) + 2) * BUILD_UNIT;
                    } else {
                        mem.needRepair = false;
                        mem.hitsBuildTarget = structure.hitsMax;
                    }
                    //if(mem.hitsBuildTarget == 1){
                    //    console.log(JSON.stringify(structure));
                    //    Game.notify(JSON.stringify(structure));
                    //}
                }
                //update
                if (structure.hits > mem.hitsBuildTarget) {
                    if (structure.hits / structure.hitsMax < 0.5) {
                        mem.needRepair = true;
                        mem.hitsBuildTarget = (Math.floor(structure.hits / BUILD_UNIT) + 2) * BUILD_UNIT;
                    } else {
                        mem.needRepair = false;
                        mem.hitsBuildTarget = structure.hitsMax;
                    }
                } else if (structure.hits / structure.hitsMax < 0.5) {
                    var newBuildTarget = (Math.floor(structure.hits / BUILD_UNIT) + 2) * BUILD_UNIT;
                    if (newBuildTarget < mem.hitsBuildTarget) {
                        mem.needRepair = true;
                        mem.hitsBuildTarget = newBuildTarget;
                    }
                }

                structure.needRepair = mem.needRepair;
                structure.hitsBuildTarget = mem.hitsBuildTarget;
                //console.log(JSON.stringify(curRoom.memory.structures[structure.id]));
            }
        });


    },

    run: function () {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

        //room object status init/update
        this.init();

        //build rest flag
        if (!curRoom.memory.restFlagSet) {
            //clear
            var oldFlags = curRoom.find(FIND_FLAGS, {
                filter: {color: COLOR_YELLOW}
            });
            oldFlags.forEach(function (obj) {
                obj.remove();
            });
            if (oldFlags.length == 0) {    //create after delete, avoid detecting deleted flags
                //add
                var exits = curRoom.find(FIND_EXIT);
                for (var idx in exits) {
                    var pos;
                    var distance = 3;
                    if (exits[idx].x == 0) {
                        pos = curRoom.getPositionAt(exits[idx].x + distance, exits[idx].y);
                    }
                    if (exits[idx].y == 0) {
                        pos = curRoom.getPositionAt(exits[idx].x, exits[idx].y + distance);
                    }
                    if (exits[idx].x == 49) {
                        pos = curRoom.getPositionAt(exits[idx].x - distance, exits[idx].y);
                    }
                    if (exits[idx].y == 49) {
                        pos = curRoom.getPositionAt(exits[idx].x, exits[idx].y - distance);
                    }
                    var look = curRoom.lookAt(pos);
                    var canRestFlag = true;
                    look.forEach(function (lookObject) {
                        if (lookObject.type == 'flag' && lookObject.flag.color == COLOR_YELLOW) {
                            canRestFlag = false;
                        }
                        if (lookObject.type == "terrain" && lookObject.terrain != "plain") {
                            canRestFlag = false;
                        }
                        if (lookObject.type == "constructionSite") {
                            canRestFlag = false;
                        }
                    });
                    //detect if too close to wall, do not flag, avoid blocking paths
                    if (canRestFlag) {
                        var areaObjs = curRoom.lookForAtArea("terrain", pos.y - 2, pos.x - 2, pos.y + 2, pos.x + 2);
                        for (var i in areaObjs) {
                            for (var j in areaObjs[i]) {
                                if (areaObjs[i][j]) {
                                    areaObjs[i][j].forEach(function (tmpObj) {
                                        if (tmpObj == "wall") canRestFlag = false;
                                    });
                                }
                                if (!canRestFlag) break;
                            }
                            if (!canRestFlag) break;
                        }
                    }

                    if (canRestFlag)
                        curRoom.createFlag(pos, null, COLOR_YELLOW);
                }
                curRoom.memory.restFlagSet = true;
            }
        }

        //construction
        var constructionPlanner = require('constructionPlanner');
        constructionPlanner.buildWallAndRampart();
        if (Game.time % 100 == 0) {
            constructionPlanner.buildExtentions();
        }
    },


};