module.exports = {
	buildExtentions: function () {
		var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];
		var RCL_EXTS = [0, 0, 5, 10, 20, 30, 40, 50, 50];	//Room Control Level[0-8] : Extensions can build

		var extensions = curRoom.find(FIND_MY_STRUCTURES, {
			filter: {structureType: STRUCTURE_EXTENSION}
		});
		var extension_sites = curRoom.find(FIND_CONSTRUCTION_SITES, {
			filter: {structureType: STRUCTURE_EXTENSION}
		});

		var existExts = extensions.length + extension_sites.length;
		if (!curRoom.controller) return;
		if (existExts >= RCL_EXTS[curRoom.controller.level]) return;

		// build extensions
		var spawns = curRoom.find(FIND_MY_SPAWNS);
		var spawn = spawns[0];
		for (var circle = 4; circle < 11; circle += 2) {
			var leftUpPos = [spawn.pos.x - circle, spawn.pos.y - circle];
			var rightUpPos = [spawn.pos.x + circle, spawn.pos.y - circle];
			var rightDownPos = [spawn.pos.x + circle, spawn.pos.y + circle];
			var leftDownPos = [spawn.pos.x - circle, spawn.pos.y + circle];
			var pos;
			for (var x = leftUpPos[0]; x <= rightUpPos[0]; x += 2) {
				pos = [x, leftUpPos[1]];
				this.innerBuildExtension(curRoom, pos);
			}
			for (var y = rightUpPos[1]; y <= rightDownPos[1]; y += 2) {
				pos = [rightUpPos[0], y];
				this.innerBuildExtension(curRoom, pos);
			}
			for (var x = rightDownPos[0]; x >= leftDownPos[0]; x -= 2) {
				pos = [x, rightDownPos[1]];
				this.innerBuildExtension(curRoom, pos);
			}
			for (var y = leftDownPos[1]; y > leftUpPos[1]; y -= 2) {
				pos = [leftDownPos[0], y];
				this.innerBuildExtension(curRoom, pos);
			}
			extension_sites = curRoom.find(FIND_CONSTRUCTION_SITES, {
				filter: {structureType: STRUCTURE_EXTENSION}
			});
			existExts = extensions.length + extension_sites.length;
			if (existExts >= RCL_EXTS[curRoom.controller.level]) return;
		}
	},

	innerBuildExtension: function (room, pos) {
		if (pos[0] >= 4 && pos[0] <= 45 && pos[1] >= 4 && pos[1] <= 45)
			room.createConstructionSite(pos[0], pos[1], STRUCTURE_EXTENSION);
	},

	buildWallAndRampart: function () {
		var curRoom = Game.rooms[Memory.CURRENT_ROOM_NAME];

		var spawns = curRoom.find(FIND_MY_SPAWNS);
		if (spawns.length == 0) return;
		if (!curRoom.controller || curRoom.controller.level < 2) return;

		var exits = curRoom.find(FIND_EXIT);
		//check one path per tick
		var exit = exits[Game.time % exits.length];
		var exitPos = curRoom.getPositionAt(exit.x, exit.y);
		var avoidArr = [];
		var constructionSites = curRoom.find(FIND_CONSTRUCTION_SITES);
		var structures = curRoom.find(FIND_STRUCTURES);
		avoidArr = avoidArr.concat(constructionSites, structures);
		var path = curRoom.findPath(spawns[0].pos, exitPos, {
			ignoreCreeps: true,
			heuristicWeight: 100,
			avoid: avoidArr,
			maxOps: 200,
		});
		for (var i in path) {
			var pos = curRoom.getPositionAt(path[i].x, path[i].y);
			if ((pos.x == 2 || pos.x == 47 || pos.y == 2 || pos.y == 47) && (pos.x >= 2 && pos.x <= 47 && pos.y >= 2 && pos.y <= 47)) {
				//If near terrain walls, build rampart. If not, build wall.
				var nearWall = false;
				var areaObjs = curRoom.lookForAtArea("terrain", pos.y - 2, pos.x - 2, pos.y + 2, pos.x + 2);
				for (var i in areaObjs) {
					for (var j in areaObjs[i]) {
						if (areaObjs[i][j]) {
							areaObjs[i][j].forEach(function (tmpObj) {
								if (tmpObj == "wall") nearWall = true;
							});
						}
						if (nearWall) break;
					}
					if (nearWall) break;
				}
				if (nearWall)
					curRoom.createConstructionSite(pos.x, pos.y, STRUCTURE_RAMPART);
				else
					curRoom.createConstructionSite(pos.x, pos.y, STRUCTURE_WALL);
			}
		}
	},

	buildRoads: function(from, to)
	{
		var path = Game.spawns.Spawn1.room.findPath(from, to, {ignoreCreeps: true});
		for(var i in path)
		{
			var result = Game.spawns.Spawn1.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
		}
	},

	buildRoadToAllSources: function()
	{
		var sources = Game.spawns.Spawn1.room.find(FIND_SOURCES);

		for(var i in sources)
		{
			this.buildRoads(Game.spawns.Spawn1.pos, sources[i].pos);
		}
	},

	expandRampartsOutwards: function()
	{
		var ramparts = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
			filter: function(struct)
			{
				return struct.structureType == STRUCTURE_RAMPART
			}
		});

		for(var i in ramparts)
		{
			var rampart = ramparts[i];

			var positions = [
				[rampart.pos.x - 1, rampart.pos.y],
				[rampart.pos.x, rampart.pos.y - 1],
				[rampart.pos.x, rampart.pos.y - 1],
				[rampart.pos.x, rampart.pos.y + 1],
				[rampart.pos.x - 1, rampart.pos.y - 1],
				[rampart.pos.x + 1, rampart.pos.y - 1],
				[rampart.pos.x - 1, rampart.pos.y + 1],
				[rampart.pos.x - 1, rampart.pos.y - 1]
			];

			for(var i in positions)
			{
				var pos = positions[i];
				var tile = Game.spawns.Spawn1.room.lookAt(pos[0], pos[1]);
				var build = true;
				for(var tilei in tile)
				{
					var thing = tile[tilei];
					if (thing.type == 'structure' && thing.structure.structureType == STRUCTURE_RAMPART)
						build = false;
					if(thing.type == 'constructionSite')
						build = false;
				}

				if(build)
					Game.spawns.Spawn1.room.createConstructionSite(pos[0], pos[1], STRUCTURE_RAMPART);
			}
		}
	}
};