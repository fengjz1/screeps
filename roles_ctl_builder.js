/**
 * @type {{parts: *[], action: action}}
 */
var builder = {
    parts: [
        [WORK, WORK, CARRY, MOVE], //300
        [WORK, WORK, WORK, CARRY, MOVE], //400
        [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], //600
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], //700
        [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], //800
        [WORK, WORK, CARRY, MOVE, WORK, WORK, CARRY, MOVE, WORK, WORK, CARRY, MOVE], //900
        [WORK, WORK, CARRY, MOVE, WORK, WORK, CARRY, MOVE, WORK, WORK, CARRY, MOVE, WORK, WORK, CARRY, MOVE], //1200
    ],

    action: function () {
        var creep = this.creep;

        if (creep.room.controller) {
            creep.moveTo(creep.room.controller);
            creep.upgradeController(creep.room.controller);
        }
    }
}

module.exports = builder;