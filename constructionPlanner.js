module.exports = {
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