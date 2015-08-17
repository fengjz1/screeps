var performRoles = require('performRoles');
var spawner = require('spawner');
var countType = require('countType');
var factory = require('factory');

Memory.CURRENT_ROOM_NAME = Game.spawns.Spawn1.room.name;

factory.init();
factory.run();

spawner.spawnNextInQue();

factory.buildArmyWhileIdle();

performRoles(Game.creeps);