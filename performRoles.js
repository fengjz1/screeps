module.exports = function(creeps)
{
	var beginTime = Game.getUsedCpu();
    var roleManager = require('roleManager');
    var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

	//For each creep, check if they have a role. If they do, load and run it
	for (var idx in creeps)
	{
		var begin = Game.getUsedCpu();
		var creep = creeps[idx];
		if(creep.spawning || creep.memory.role == undefined || (creep.memory.active !== undefined && !creep.memory.active))
			continue;

		var role = creep.memory.role;
        //temporary skip
        if (role == "transporter" || role == "builder") {
            creep.usedTime = 0;
            creep.createCostTime = 0;
            creep.runTime = 0;
            continue;
        }

		if(roleManager.roleExists(role))
			role = roleManager.getRole(role);

		var role = Object.create(role);
		role.setCreep(creep);
		var end1 = Game.getUsedCpu();

		try { role.run(); } catch(e) { };
		var end2 = Game.getUsedCpu();
		creep.usedTime = end2 - begin;
		creep.createCostTime = end1 - begin;
		creep.runTime = end2 - end1;
	}

    //task queue roles
    var taskQueueRoles = ["transporter", "builder"];
    for (var idx in taskQueueRoles) {
        var role;
        var roleName = taskQueueRoles[idx];
        if (roleManager.roleExists(roleName))
            role = roleManager.getRole(roleName);
        role = Object.create(role);
        var taskQueue = role.generateTaskQueue();
        curRoom.memory["taskQueue_" + roleName] = taskQueue;
        //record queue length history
        if (!curRoom.memory["taskQueueLengthHistory_" + roleName]) curRoom.memory["taskQueueLengthHistory_" + roleName] = [];
        var lenHis = curRoom.memory["taskQueueLengthHistory_" + roleName];
        lenHis.push(taskQueue.length);
        if (lenHis.length > 200) curRoom.memory["taskQueueLengthHistory_" + roleName] = lenHis.slice(-100);
        role.processTaskQueue(taskQueue);
    }


	var maxTime = 0, maxName;
	for (var idx in creeps) {
		var creep = creeps[idx];
		if (creep.usedTime > maxTime) {
			maxTime = creep.usedTime;
			maxName = creep.name;
		}
	}
	var costTime = Game.getUsedCpu() - beginTime;
	if (costTime > 30) {
		var timeList = {}, totalCreateCostTime = 0, totalRunTime = 0;
		for (var i in creeps) {
			if (creeps[i].spawning) continue;
			timeList[creeps[i].name] = [creeps[i].usedTime, creeps[i].createCostTime, creeps[i].runTime];
			totalCreateCostTime = totalCreateCostTime + creeps[i].createCostTime;
			totalRunTime = totalRunTime + creeps[i].runTime;
		}
		console.log(Game.time + " costTime=" + costTime + ", maxTime=" + maxTime + ", maxName=" + maxName
			+ ", totalCreateCostTime=" + totalCreateCostTime + ", totalRunTime=" + totalRunTime);
		//console.log(JSON.stringify(timeList));
	}
};