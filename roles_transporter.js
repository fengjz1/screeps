var transporter = {
	parts: [
		[CARRY, CARRY, MOVE, MOVE]
	],

	action: function()
	{
		var creep = this.creep;

		//@TODO: Balance Spawns here

		if (creep.carry.energy == 0)
		{
			var closestSpawn = creep.pos.findClosest(FIND_MY_SPAWNS, {
				filter: function(spawn)
				{
					return spawn.energy > creep.carryCapacity;
				}
			});

			//pickup dropped energy near spawn
			if (closestSpawn) {
				var drops = closestSpawn.pos.findInRange(FIND_DROPPED_ENERGY, 1);
				if (drops.length > 0) {
					creep.moveTo(drops[0]);
					creep.pickup(drops[0]);
				} else {
					creep.moveTo(closestSpawn);
					closestSpawn.transferEnergy(creep);
				}
			}

			return;
		}

		var target = null;

		if (!target) {
			var extension = creep.pos.findClosest(FIND_MY_STRUCTURES, {
				filter: function (structure) {
					return structure.structureType == STRUCTURE_EXTENSION &&
						structure.energy < structure.energyCapacity;
				}
			});

			if (extension)
				target = extension;
		}

		//Transfer to builder
		if (!target) {
			var builderToHelp = creep.pos.findClosest(FIND_MY_CREEPS, {
				filter: function (builder) {
					return builder.memory.role == "builder"
						&& builder.carry.energy < ( builder.carryCapacity - 10);
				}
			});

			if (builderToHelp)
				target = builderToHelp;
		}
		if (!target) {
			var builderToHelp = creep.pos.findClosest(FIND_MY_CREEPS, {
				filter: function (builder) {
					return builder.memory.role == "ctl_builder"
						&& builder.carry.energy < ( builder.carryCapacity - 10);
				}
			});

			if (builderToHelp)
				target = builderToHelp;
		}

		//Go to target and give it energy
		if (creep.pos.isNearTo(target)) {
			if (target.carry.energy < target.carryCapacity) {
				creep.transferEnergy(target);
			}
		}
		else {
			creep.moveTo(target);
		}
	}
};

module.exports = transporter;