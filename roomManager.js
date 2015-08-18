/**
 * Created by jingzhe.feng on 2015-08-18.
 */
module.exports = {

    run: function () {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

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

        //try construction every 100 ticks
        if (Game.time % 100 == 0) {
            var constructionPlanner = require('constructionPlanner');
            constructionPlanner.buildExtentions();
            constructionPlanner.buildWalls();
        }
    },


};