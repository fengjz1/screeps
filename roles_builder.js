/**
 * @TODO: Make it more carry heavy, make it have helpers
 * @type {{parts: *[], action: action}}
 */
var builder = {
	parts: [
        [WORK, WORK, CARRY, MOVE], //300
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE], //400
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], //600
        [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], //800
	],

//	getParts: function()
//	{
//		var _= require('lodash');
//
//		var partsAllowed = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
//			filter: function(structure)
//			{
//				return (structure.structureType == STRUCTURE_EXTENSION && structure.energy >= 200);
//			}
//		}).length;
//
//		var parts = [ WORK, WORK, WORK, CARRY, MOVE ];
//		var modulo = partsAllowed % 2;
//		partsAllowed -= modulo;
//		partsAllowed /= 2;
//
//		if(partsAllowed > 5)
//			partsAllowed = 5;
//
//		for(var i = 0; i < partsAllowed; i++)
//			parts.push(MOVE, CARRY);
//
//		return parts;
//
//		return this.prototype.getParts.call(this);
//	},

	action: function()
	{
		var creep = this.creep;

		//If out of energy, go to spawn and recharge
		if (creep.carry.energy == 0) {
			var closestSpawn = creep.pos.findClosest(FIND_MY_SPAWNS, {
				filter: function(spawn)
				{
					return spawn.energy > 0 && creep.pos.inRangeTo(spawn, 3);
				}
			});

			if(closestSpawn) {
				creep.moveTo(closestSpawn);
				closestSpawn.transferEnergy(creep);
			}
		}
		else {
            //extensions/walls build first
            var target = creep.pos.findClosest(FIND_CONSTRUCTION_SITES, {
                filter: {structureType: STRUCTURE_EXTENSION}
            });
            if (!target) {
                target = creep.pos.findClosest(FIND_CONSTRUCTION_SITES, {
                    filter: {structureType: STRUCTURE_WALL}
                });
            }
            if (target) {
                if (!creep.pos.isNearTo(target))
                    creep.moveTo(target);

                if (creep.pos.inRangeTo(target, 0)) {
                    console.log("builder suicide:" + JSON.stringify(creep.memory));
                    creep.suicide();
                }

                creep.build(target);
                return;
            }

			//First, we're going to check for damaged ramparts. We're using ramparts as the first line of defense
			//and we want them nicely maintained. This is especially important when under attack. The builder will
			//repair the most damaged ramparts first
            var ramparts = creep.room.find(FIND_STRUCTURES, {
                filter: {structureType: STRUCTURE_RAMPART, needRepair: true}
            });

            ramparts.sort(function (a, b) {
                return a.hitsBuildTarget - b.hitsBuildTarget;
            });

            if (ramparts.length)
			{
                if (!creep.pos.isNearTo(ramparts[0]))
                    creep.moveTo(ramparts[0]);
                creep.repair(ramparts[0]);
				return;
			}

            //when no ramparts to repair, try build new ramparts
            var target = creep.pos.findClosest(FIND_CONSTRUCTION_SITES, {
                filter: {structureType: STRUCTURE_RAMPART}
            });
            if (target) {
                if (!creep.pos.isNearTo(target))
                    creep.moveTo(target);

                if (creep.pos.inRangeTo(target, 0)) {
                    console.log("builder suicide:" + JSON.stringify(creep.memory));
                    creep.suicide();
                }

                creep.build(target);
                return;
            }

            //try repair walls
            var ramparts = creep.room.find(FIND_STRUCTURES, {
                filter: {structureType: STRUCTURE_WALL, needRepair: true}
            });

            ramparts.sort(function (a, b) {
                return a.hitsBuildTarget - b.hitsBuildTarget;
            });

            if (ramparts.length) {
                creep.moveTo(ramparts[0]);
                creep.repair(ramparts[0]);

                return;
            }

			//Next we're going to look for general buildings that have less than 50% health, and we'll go to repair those.
			//We set it at 50%, because we don't want builders abandoning their duty every time a road gets walked on
            var halfBroken = creep.room.find(FIND_STRUCTURES);
			var toRepair = [ ];
			for(var index in halfBroken)
				if((halfBroken[index].hits / halfBroken[index].hitsMax) < 0.5)
					toRepair.push(halfBroken[index]);

			if(toRepair.length)
			{
				var structure = toRepair[0];
				creep.moveTo(structure);
				creep.repair(structure);

				return;
			}

			//If no repairs are needed, we're just going to go find some structures to build
			var targets = creep.pos.findClosest(FIND_CONSTRUCTION_SITES);
			if(targets) {
				if(!creep.pos.isNearTo(targets))
					creep.moveTo(targets);

                if (creep.pos.inRangeTo(targets, 0)) {
                    console.log("builder suicide:" + JSON.stringify(creep.memory));
					creep.suicide();
                }

				creep.build(targets);
				return;
			}

			var target = this.rangedAttack();
			if(target)
			{
				this.kite(target);
			}

			this.rest(true);
		}
	}
}

module.exports = builder;