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
        var countType = require('countType');

		var gatheredScreeps = { };
		for(var index in requiredScreeps)
		{
			var type = requiredScreeps[index];
			if(gatheredScreeps[type] == undefined)
				gatheredScreeps[type] = 0;

			var neededToSkip = gatheredScreeps[type] + 1;

			var found = countType(type, true);
            if (neededToSkip > found)
			{
                curRoom.memory.spawnQue.push(type);
			}

			gatheredScreeps[type]++;
		}
	},

    buildWhileIdle: function () {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
        var taskQueueRoles = ["transporter", "builder"];
        var countType = require('countType');

        var spawning = curRoom.find(FIND_MY_SPAWNS, {
            filter: function (obj) {
                if (obj.spawning) return true;
                return false;
            }
        });
        for (var idx in taskQueueRoles) {
            if (spawning.length <= 0 && curRoom.energyCapacityAvailable && curRoom.energyAvailable / curRoom.energyCapacityAvailable > 0.8 && curRoom.memory.spawnQue.length <= 0) {
                var roleName = taskQueueRoles[idx];
                var lenHis = curRoom.memory["taskQueueLengthHistory_" + roleName];
                if (lenHis) {
                    if (lenHis.length > 50) {
                        var past50 = lenHis.slice(-50);
                        var total = 0;
                        for (var i in past50) {
                            total += past50[i];
                        }
                        var avgQueueLen = total / 50;
                        var count = countType(roleName);
                        //console.log("buildWhileIdle debug. roleName=" + roleName + ", avg queue len=" + avgQueueLen + ", typeCount=" + count);
                        if (countType < 10 && total && avgQueueLen - count > 1) { //when averagely more than one task waiting
                            console.log("buildWhileIdle building " + roleName + ", avg queue len=" + avgQueueLen + ", typeCount=" + count);
                            curRoom.memory.spawnQue.push(roleName);
                        }
                    }
                }
            }
        }
    },

    //buildArmyWhileIdle: function()
    //{
    //   var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
    //	for(var i in Game.spawns)
    //	{
    //		var spawn = Game.spawns[i];
    //       if (!spawn.spawning && curRoom.memory.spawnQue.length == 0 && spawn.energy / spawn.energyCapacity >= .6) {
    //			var archers = countType('archer', true);
    //			var healers = countType('healer', true);
    //
    //			if(healers / archers < .25)
    //				require('spawner').spawn('healer', { }, spawn);
    //			else
    //				require('spawner').spawn('archer', { }, spawn);
    //		}
    //	}
    //}
};