/**
 * Created by jingzhe.feng on 2015-08-18.
 */
module.exports = {

    run: function () {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

        //build rest flag
        if (!curRoom.memory.restFlagSet) {
            var exits = curRoom.find(FIND_EXIT);
            for (var idx in exits) {
                var pos;
                if (exits[idx].x == 0) {
                    pos = curRoom.getPositionAt(exits[idx].x + 2, exits[idx].y);
                }
                if (exits[idx].y == 0) {
                    pos = curRoom.getPositionAt(exits[idx].x, exits[idx].y + 2);
                }
                if (exits[idx].x == 49) {
                    pos = curRoom.getPositionAt(exits[idx].x - 2, exits[idx].y);
                }
                if (exits[idx].y == 49) {
                    pos = curRoom.getPositionAt(exits[idx].x, exits[idx].y - 2);
                }
                var look = curRoom.lookAt(pos);
                var hasRestFlag = false;
                look.forEach(function (lookObject) {
                    if (lookObject.type == 'flag' && lookObject.flag.color == COLOR_YELLOW) {
                        hasRestFlag = true;
                    }
                });
                if (!hasRestFlag)
                    curRoom.createFlag(pos, null, COLOR_YELLOW);
            }
            curRoom.memory.restFlagSet = true;
        }

        //try build extensions every 100 ticks
        if (Game.time % 100 == 0) {
            var constructionPlanner = require('constructionPlanner');
            constructionPlanner.buildExtentions();
        }
    },


};