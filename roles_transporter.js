var transporter = {
	parts: [
        [CARRY, CARRY, MOVE, MOVE],
        [CARRY, CARRY, MOVE, MOVE, CARRY, CARRY, MOVE, MOVE],
	],

    generateTaskQueue: function () {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
        var taskQueue = [];
        var idx;

        //Fill extension
        var extensionsNeedFill = curRoom.find(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_EXTENSION &&
                    structure.energy < structure.energyCapacity;
            }
        });
        for (idx in extensionsNeedFill) {
            var obj = extensionsNeedFill[idx];
            taskQueue.push({target: obj.id, canSeize: false, unseizable: false, priority: 30});
        }

        //Transfer to builder
        var builderToHelp = curRoom.find(FIND_MY_CREEPS, {
            filter: function (builder) {
                return builder.memory.role == "builder"
                    && builder.carry.energy / builder.carryCapacity < 0.5;
            }
        });
        for (idx in builderToHelp) {
            var obj = builderToHelp[idx];
            taskQueue.push({target: obj.id, canSeize: false, unseizable: false, priority: 20});
        }

        //Transfer to controller builder
        var builderToHelp = curRoom.find(FIND_MY_CREEPS, {
            filter: function (builder) {
                return builder.memory.role == "ctl_builder"
                    && builder.carry.energy < ( builder.carryCapacity - 10);
            }
        });
        for (idx in builderToHelp) {
            var obj = builderToHelp[idx];
            taskQueue.push({target: obj.id, canSeize: false, unseizable: false, priority: 10});
        }

        return taskQueue;
    },

    processTaskQueue: function (taskQueue) {
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
        var _ = require("lodash");

        //find transporters available
        var transporters = curRoom.find(FIND_MY_CREEPS, {
            filter: function (creeps) {
                return creeps.memory.role == "transporter";
            }
        });

        //do task, update current transporter status.
        //if transporter energy empty. if target energy full(task completed). if target invalid.
        transporters.forEach(function (creep) {
            if (creep.carry.energy == 0) {
                creep.memory.task = null;
                this.refill(creep);
            } else if (creep.memory.task) {
                var target = Game.getObjectById(creep.memory.task.target);
                if (target) {
                    if (target.structureType) { //is structure
                        if (target.energy >= target.energyCapacity) {
                            creep.memory.task = null;
                        } else {
                            creep.moveTo(target);
                            creep.transferEnergy(target);
                        }
                    } else { //is creep
                        if (target.carry.energy >= target.carryCapacity) {
                            creep.memory.task = null;
                        } else {
                            creep.moveTo(target);
                            creep.transferEnergy(target);
                        }
                    }
                } else {
                    creep.memory.task = null;
                }
            }
        }, this);

        //assign task to transporters
        for (var idx in taskQueue) {
            var task = taskQueue[idx];
            var workingOnTaskTrans = _.filter(transporters, function (creep) {
                if (!creep.memory.task) return false;
                if (creep.memory.task.target == task.target) return true;
                return false;
            });
            if (workingOnTaskTrans.length) continue; //task currently be working on. do not need to assign

            var freeTrans = _.filter(transporters, function (creep) {
                return !creep.memory.task;
            });
            if (freeTrans.length) {
                //determine which transporter should be used. 1.transporter near target //TODO 2.transporter with more energy left
                var target = Game.getObjectById(task.target);
                var trans = target.pos.findClosestByRange(freeTrans);
                if (trans) { //assign task
                    trans.memory.task = task;
                    continue;
                }
            }

            //no free trans available, check task can seize
            if (task.canSeize) {
                var transSeizable = _.filter(transporters, function (creep) {
                    return !creep.memory.task.unseizable;
                });
                //find lowest priority
                if (transSeizable.length > 1) {
                    transSeizable.sort(function (a, b) {
                        return a.priority - b.priority;
                    });
                }
                if (transSeizable.length) {
                    transSeizable[0].memory.task = task;
                    continue;
                }
            }
        }
    },

    refill: function (creep) {
        var closestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);

        //pickup dropped energy near spawn
        if (closestSpawn) {
            var drops = closestSpawn.pos.findInRange(FIND_DROPPED_ENERGY, 1);
            if (drops.length > 0) {
                creep.moveTo(drops[0]);
                creep.pickup(drops[0]);
            } else if (closestSpawn.energy > creep.carryCapacity) {
                creep.moveTo(closestSpawn);
                closestSpawn.transferEnergy(creep);
            }
        }
    },

	action: function()
	{
		var creep = this.creep;
        var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

		//@TODO: Balance Spawns here

		if (creep.carry.energy == 0)
		{
            var closestSpawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);

			//pickup dropped energy near spawn
			if (closestSpawn) {
				var drops = closestSpawn.pos.findInRange(FIND_DROPPED_ENERGY, 1);
				if (drops.length > 0) {
					creep.moveTo(drops[0]);
					creep.pickup(drops[0]);
                } else if (closestSpawn.energy > creep.carryCapacity) {
					creep.moveTo(closestSpawn);
					closestSpawn.transferEnergy(creep);
				}
			}

			return;
		}

		var target = null;

		if (!target) {
            var extension = creep.room.find(FIND_MY_STRUCTURES, {
				filter: function (structure) {
					return structure.structureType == STRUCTURE_EXTENSION &&
						structure.energy < structure.energyCapacity;
				}
			});

            if (extension && extension.length > 0)
                target = extension[0];
		}

		//Transfer to builder
		if (!target) {
            var builderToHelp = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
				filter: function (builder) {
					return builder.memory.role == "builder"
                        && builder.carry.energy / builder.carryCapacity < 0.5;
				}
			});

			if (builderToHelp)
				target = builderToHelp;
		}
		if (!target) {
            var builderToHelp = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
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
            if (target.structureType) {	//is structure
                if (target.energy < target.energyCapacity) {
                    creep.transferEnergy(target);
                }
            } else if (target.carry.energy < target.carryCapacity) {
				creep.transferEnergy(target);
			}
		}
		else {
			creep.moveTo(target);
		}
	}
};

module.exports = transporter;