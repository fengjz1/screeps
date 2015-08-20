var timeArray = [];
timeArray.push(Game.getUsedCpu());
if (Game.time % 100 == 0) {
    console.log(Game.time);
}

preloadAllModules();

var performRoles = require('performRoles');
var spawner = require('spawner');
var roomManager = require('roomManager');
var factory = require('factory');

Memory.CURRENT_ROOM_NAME = Game.spawns.Spawn1.room.name;
var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

timeArray.push(Game.getUsedCpu());

factory.init();
timeArray.push(Game.getUsedCpu());

factory.run();
timeArray.push(Game.getUsedCpu());

roomManager.run();
timeArray.push(Game.getUsedCpu());

spawner.spawnNextInQue();
timeArray.push(Game.getUsedCpu());

factory.buildWhileIdle();
timeArray.push(Game.getUsedCpu());

performRoles(curRoom.find(FIND_MY_CREEPS));
timeArray.push(Game.getUsedCpu());

if (Game.getUsedCpu() > 50) {
    console.log(Game.time + " cpu use too high! " + timeArray);
}

function preloadAllModules() {
    var preload_constructionPlanner = require('constructionPlanner');
    var preload_countType = require('countType');
    var preload_extend = require('extend');
    var preload_factory = require('factory');
    var preload_performRoles = require('performRoles');
    var preload_roleManager = require('roleManager');
    var preload_roles_archer = require('roles_archer');
    var preload_roles_builder = require('roles_builder');
    var preload_roles_ctl_builder = require('roles_ctl_builder');
    var preload_roles_guard = require('roles_guard');
    var preload_roles_harvester = require('roles_harvester');
    var preload_roles_healer = require('roles_healer');
    var preload_roles_miner = require('roles_miner');
    var preload_roles_miner_helper = require('roles_miner_helper');
    var preload_roles_scavenger = require('roles_scavenger');
    var preload_roles_transporter = require('roles_transporter');
    var preload_role_prototype = require('role_prototype');
    var preload_roomManager = require('roomManager');
    var preload_spawner = require('spawner');

    var _ = require("lodash");
}