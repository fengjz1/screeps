var countType = require('countType');

module.exports ={
	init: function()
	{
		this.memory();
	},

	run: function()
	{
		this.spawnRequiredScreeps();
	},

	memory: function() {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

        if (curRoom.memory.spawnQue == undefined)
            curRoom.memory.spawnQue = [];

        if (curRoom.memory.sources == undefined)
            curRoom.memory.sources = {};

        if (Game.time % 10 == 0)
		{
            curRoom.memory.requiredScreeps = [
				'harvester',
				'guard', //1
				'miner', //1
				'miner', //2
				'guard', //2
				'healer', //1
				'guard', //3
				'builder',
                'ctl_builder',
				'transporter',
				'transporter',
				'guard', //4
				'healer', //2
				'builder',
				'transporter',
				'transporter',
			];
		}
	},

	spawnRequiredScreeps: function()
	{
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
        var requiredScreeps = curRoom.memory.requiredScreeps;

		var gatheredScreeps = { };
		for(var index in requiredScreeps)
		{
			var type = requiredScreeps[index];
			if(gatheredScreeps[type] == undefined)
				gatheredScreeps[type] = 0;

			var neededToSkip = gatheredScreeps[type] + 1;

			var found = countType(type, true);
			if(neededToSkip > countType(type, true))
			{
                curRoom.memory.spawnQue.push(type);
			}

			gatheredScreeps[type]++;
		}
	},

	buildArmyWhileIdle: function()
	{
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
		for(var i in Game.spawns)
		{
			var spawn = Game.spawns[i];
            if (!spawn.spawning && curRoom.memory.spawnQue.length == 0 && spawn.energy / spawn.energyCapacity >= .6) {
				var archers = countType('archer', true);
				var healers = countType('healer', true);

				if(healers / archers < .25)
					require('spawner').spawn('healer', { }, spawn);
				else
					require('spawner').spawn('archer', { }, spawn);
			}
		}
	}
};