module.exports = function(creeps)
{
	var roleManager = require('roleManager');
	var beginTime = Game.getUsedCpu();

	//For each creep, check if they have a role. If they do, load and run it
	for (var idx in creeps)
	{
		var begin = Game.getUsedCpu();
		var creep = creeps[idx];
		if(creep.spawning || creep.memory.role == undefined || (creep.memory.active !== undefined && !creep.memory.active))
			continue;

		var role = creep.memory.role;

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