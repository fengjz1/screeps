/**
 * @type {{parts: *[], action: action}}
 */
var builder = {
    parts: [
        [WORK, WORK, CARRY, MOVE],
        [WORK, WORK, WORK, CARRY, MOVE],
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