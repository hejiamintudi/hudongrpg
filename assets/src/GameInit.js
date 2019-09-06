cc.Class({
    extends: cc.Component,
    properties: {
    },
    onLoad () {
        cc.view.enableAntiAlias(false);
    	let arr = ["initAi", "initHero", "initEn", "gotoMap", "startGame"];
    	dyl.process(this, arr);
    },

    initAi (end) {
    	ai.seed = 131;
    	dyl.setRand(ai.seed);

    	ai.map = dyl.addMap(5, 5, ()=>null);
    	ai.posMap = dyl.addMapLayer(5, 5, 100);
    	ai.heroNameArr = ["diechong", "jiandun", "lanya", "nuqiu", "zuantou"];
    	ai.enNameArr = ["feishou", "sanjiao", "tanglang", "xianji", "youling"];
    	ai.heroArr = hjm._heroPool.pool;
    	ai.enArr = hjm._enPool.pool;
    	end();
    },

    initHero (end) {
    	for (let i = 0; i < ai.heroNameArr.length; i++) {
    		let name = ai.heroNameArr[i];
    		let hero = hjm._heroPool.add(name);
    		hero.type = 1;
    		dyl.data("hero." + name, hero);
    		// hero.hp = function (newValue, oldValue) {
    		// 	let hp = newValue - oldValue;
    		// 	hjm._hurt.add(cc.v2(hero), hp);
    		// }
    		hero.oriParent = hero.parent;
    		hjm[name] = hero.hero;
    	}
    	end();
    },

    initEn (end) {
    	for (let i = 0; i < ai.enNameArr.length; i++) {
    		let name = ai.enNameArr[i];
    		let en = hjm._enPool.add(name);
    		en.type = -1;
    		dyl.data("en." + name, en);
    		// en.hp = function (newValue, oldValue) {
    		// 	let hp = newValue - oldValue;
    		// 	hjm._hurt.add(cc.v2(en), hp);
    		// }
    		en.oriParent = en.parent;
    		hjm[name] = en.en;
    	}
    	end();
    },

    gotoMap (end) {
    	let roleArr = [...ai.heroArr, ...ai.enArr];
    	roleArr.sort(()=>(dyl.rand() - 0.5));
		
		let posArr = [];
		ai.posArr = posArr;
		let maxNum = ai.map.w * ai.map.h;
		let hasNum = roleArr.length;
		for (let y = 0; y < ai.map.h; y++) {
			for (let x = 0; x < ai.map.w; x++) {
				if (dyl.rand() <= hasNum / maxNum) {
					ai.map.set(cc.v2(x, y), roleArr[posArr.length]);
					posArr.push(cc.v2(x, y));
					hasNum--;
				}
				maxNum--;
			}
		}
		let count = dyl.counter(end);
		count(roleArr.length);
		let d = 140;
		let scaleY1 = 2.5;
		let scaleY2 = 0.5;
		for (let i = 0; i < roleArr.length; i++) {
			let pos = ai.posMap.get(posArr[i]);
			let role = [roleArr[i]];
			tz().to(role, 0, [1 / scaleY1, scaleY1], pos.add(cc.v2(0, 2000)))
				 (i * 0.1)
					   .by(role, 0.1, cc.v2(0, scaleY1 * d * 0.5 - 0.5 * d -2000))
					   ._to(role, 0.1, [1 / scaleY2, scaleY2])
					   ._by(role, 0.1, cc.v2(0, (scaleY2 - scaleY1) * d * 0.5))
					   ._to(role, 0.2, [1, 1])
					   ._by(role, 0.2, cc.v2(0, (1 - scaleY2) * d * 0.5))
					   (()=>count())
					   ();
		}
    },

    startGame (end) {
    	this.node.getComponent("GameMain").startGame();
    }
});
