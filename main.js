/**
 * Created by jingzhe.feng on 2015-08-17.
 */
if(Game.time%100 === 0) {
    console.log(Game.time);
}

var init = require("init");
//var spawnMaintain = require("spawnMaintain");
//var roleAct = require("roleAct");
//var util = require("util");
//
init();
//
//spawnMaintain();
//
//roleAct.run();

if(Game.time%100 === 0) {
    console.log("Gabage collection...");
    util.gabageCollect();
}