if (Game.time % 100 == 0) {
    console.log(Game.time);
}

var performRoles = require('performRoles');
var spawner = require('spawner');
var roomManager = require('roomManager');
var factory = require('factory');

Memory.CURRENT_ROOM_NAME = Game.spawns.Spawn1.room.name;

factory.init();
factory.run();

roomManager.run();

spawner.spawnNextInQue();

//factory.buildArmyWhileIdle();

performRoles(Game.creeps);
