/**
 * These are simple creatures, they just find an active source and harvest it
 * @param creep
 */
var harvester = {
	parts: [
		[MOVE, CARRY, WORK, WORK]
	],

	action: function () {
		var creep = this.creep;

		if (creep.carry.energy < creep.carryCapacity) {
			var sources = creep.pos.findClosest(FIND_SOURCES);
			creep.moveTo(sources);
			creep.harvest(sources);
		}
		else {
			var target = creep.pos.findClosest(FIND_MY_SPAWNS);

			creep.moveTo(target);
			creep.transferEnergy(target);
		}
	}
};

module.exports = harvester;