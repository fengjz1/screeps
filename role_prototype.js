var proto = {
	/**
	 * The creep for this role
	 *
	 * @type creep
	 */
	creep: null,

	/**
	 * Set the creep for this role
	 *
	 * @param {Creep} creep
	 */
	setCreep: function(creep)
	{
		this.creep = creep;
		return this;
	},

	run: function()
	{
		if(this.creep.memory.onSpawned == undefined) {
			this.onSpawn();
			this.creep.memory.onSpawned = true;
		}

		this.action(this.creep);

		if(this.creep.ticksToLive == 1)
			this.beforeAge();
	},

	handleEvents: function()
	{
		if(this.creep.memory.onSpawned == undefined) {
			this.onSpawnStart();
			this.onSpawn();
			this.creep.memory.onSpawned = true;
		}

		if(this.creep.memory.onSpawnEnd == undefined && !this.creep.spawning) {
			this.onSpawnEnd();
			this.creep.memory.onSpawnEnd = true;
		}
	},

	getParts: function() {
		var _ = require('lodash');
		var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
		var energyAvailable = curRoom.energyAvailable;

		var parts = _.cloneDeep(this.parts);
		if(typeof parts[0] != "object")
			return this.parts;

		parts.reverse();

		for(var i in parts)
		{
			if (this.spawnCost(parts[i]) <= energyAvailable) {
				return parts[i];
			}
		}
		return null;
	},

	action: function() { },

	onSpawn: function() { },

	onSpawnStart: function() { },

	onSpawnEnd: function() { },

	beforeAge: function() { },

	/**
	 * All credit goes to Djinni
	 * @url https://bitbucket.org/Djinni/screeps/
	 */
	rest: function ()
	{
		var creep = this.creep;
		var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

		var onRestPoint = false;
		creep.pos.lookFor("flag").forEach(function (obj) {
			if (obj.color == COLOR_YELLOW) onRestPoint = true;
		});
		if (onRestPoint) return;

		var restPoints = curRoom.find(FIND_FLAGS, {
			filter: function (obj) {
				if (obj.color == COLOR_YELLOW && !obj.pos.lookFor("creep").length) {
					return true;
				}
				return false;
			}
		});

		if (restPoints.length) {
			var restTarget = restPoints[0];
			creep.moveTo(restTarget);
		}
	},

	/**
	 * All credit goes to Djinni
	 * @url https://bitbucket.org/Djinni/screeps/
	 */
	rangedAttack: function(target) {
		var creep = this.creep;

		if(!target)
			target = creep.pos.findClosest(FIND_HOSTILE_CREEPS);

		if(target) {
			if (target.pos.inRangeTo(creep.pos, 3) ) {
				creep.rangedAttack(target);
				return target;
			}
		}
		return null;
	},

	keepAwayFromEnemies: function()
	{
		var creep = this.creep;

		var target = creep.pos.findClosest(FIND_HOSTILE_CREEPS);
		if(target !== null && target.pos.inRangeTo(creep.pos, 3))
			creep.moveTo(creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y );
	},

	/**
	 * All credit goes to Djinni
	 * @url https://bitbucket.org/Djinni/screeps/
	 */
	kite: function(target) {
		var creep = this.creep;

		if (target.pos.inRangeTo(creep.pos, 2)) {
			creep.moveTo(creep.pos.x + creep.pos.x - target.pos.x, creep.pos.y + creep.pos.y - target.pos.y );
			return true;
		} else if (target.pos.inRangeTo(creep.pos, 3)) {
			return true;
		}
		else {
			creep.moveTo(target);
			return true;
		}

		return false;
	},

	getRangedTarget: function()
	{
		var creep = this.creep;

		var closeArchers = creep.pos.findClosest(FIND_HOSTILE_CREEPS, {
			filter: function(enemy)
			{
				if (enemy.owner.username != 'Source Keeper') {
					return false;
				}
				return enemy.getActiveBodyparts(RANGED_ATTACK) > 0
					&& creep.pos.inRangeTo(enemy, 3);
			}
		});

		if(closeArchers != null)
			return closeArchers;

		var closeMobileMelee = creep.pos.findClosest(FIND_HOSTILE_CREEPS, {
			filter: function(enemy)
			{
				return enemy.getActiveBodyparts(ATTACK) > 0
					&& enemy.getActiveBodyparts(MOVE) > 0
					&& creep.pos.inRangeTo(enemy, 3);
			}
		});

		if(closeMobileMelee != null)
			return closeMobileMelee;

		var closeHealer = creep.pos.findClosest(FIND_HOSTILE_CREEPS, {
			filter: function(enemy)
			{
				return enemy.getActiveBodyparts(HEAL) > 0
					&& enemy.getActiveBodyparts(MOVE) > 0
					&& creep.pos.inRangeTo(enemy, 3);
			}
		});

		if(closeHealer != null)
			return closeHealer;

		return creep.pos.findClosest(FIND_HOSTILE_CREEPS);
	},

	spawnCost: function (bodyParts) {
		var parts = bodyParts;

		var total = 0;
		for (var index in parts) {
			var part = parts[index];
			switch (part) {
				case MOVE:
					total += 50;
					break;

				case WORK:
					total += 100;
					break;

				case CARRY:
					total += 50;
					break;

				case ATTACK:
					total += 80;
					break;

				case RANGED_ATTACK:
					total += 150;
					break;

				case HEAL:
					total += 250;
					break;

				case TOUGH:
					total += 10;
					break;
			}
		}

		return total;
	},
};

module.exports = proto;