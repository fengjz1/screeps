module.exports =
{
	addToQue: function(creep, unshift)
	{
		var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
		if(unshift != undefined && unshift === true)
			curRoom.memory.spawnQue.unshift(creep);
		else
			curRoom.memory.spawnQue.push(creep);
	},

	spawnNextInQue: function()
	{
		var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
		if (!curRoom.memory.spawnQue.length)
			return;

		var spawns = Game.spawns.Spawn1.room.find(FIND_MY_SPAWNS, {
			filter: function(spawn)
			{
				return spawn.spawning === undefined || spawn.spawning === null;
			}
		});

		if(!spawns.length) 
			return;

		var role = curRoom.memory.spawnQue[0];

		if(typeof role == "string")
		{
			role = { type: role, memory: { } };
		}

		var me = this;
		var toSpawnAt = spawns.filter(function(spawn)
		{
			return me.canSpawn(spawn, role.type);
		});

		if(! toSpawnAt.length) 
			return;

		toSpawnAt = toSpawnAt[0];

		if (this.spawn(role.type, role.memory, toSpawnAt)) {
			curRoom.memory.spawnQue.shift();
		}
	},

	/*
	 returns: name of spawned creep, or null
	 */
	spawn: function(role, memory, spawnPoint)
	{
		if(!spawnPoint)
			spawnPoint = Game.spawns.Spawn1;

		var manager = require('roleManager');

		if(!manager.roleExists(role))
		{
			return;
		}

		if(memory == undefined)
			memory = { };

		memory['role'] = role;

		var nameCount = 0;
		var name = null;
		while(name == null)
		{
			nameCount++;
			var tryName = role + nameCount;
			if(Game.creeps[tryName] == undefined)
				name = tryName;
		}

		var bodyParts = manager.getRoleBodyParts(role);
		if (bodyParts) {
			console.log("spawning creep:" + role + ", name:" + name + ", body:" + bodyParts);
			return spawnPoint.createCreep(bodyParts, name, memory);
		}
		return null;
	},

	canSpawn: function(spawnPoint, role)
	{
		return spawnPoint.spawning == null
			|| spawnPoint.spawning == undefined;
	},

	killAll: function(role)
	{
		for(var i in Game.creeps) {
			if(role == undefined || Game.creeps[i].memory.role == role)
				Game.creeps[i].suicide();
		}
	}
}