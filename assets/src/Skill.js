cc.Class({
    extends: cc.Component,

    properties: {
    },

    // add ()
    _createSeqFun (end) {
        let self = this;
        let arr = [];
        let dataArr = [];
        let add = function (name, argArr) {
            let data = [name, argArr];
            arr.push(data);
        }
        let run = function () {
            if (!dataArr.length) {
                end();
                return;
            }
            let [name, argArr] = dataArr.pop();
            self[name](run, argArr);
        }
        let endFun = function () {
            for (let i = arr.length - 1; i >= 0; i--) {
                dataArr.push(arr[i]);
            }
            run();
            return;
        }
        let seq = {
            add: add,
            run: run,
            end: endFun 
        }
        return seq;
    },

    _getHurtOne (end, argArr) {
        cc.log("_getHurtOne", argArr);
        let [atkRole, atkPos, getHurtRole, getHurtPos, hurtNum] = argArr;
        if (getHurtRole.isDie) {
            end();
            return;
        }
        if (getHurtRole.getHurtSkill) {
            this[getHurtRole.getHurtSkill](end, atkRole, atkPos, getHurtRole, getHurtPos, hurtNum);
        }
        else {
            cc.log("_getHurtOne");
            hjm._hurt.add(cc.v2(getHurtRole), -hurtNum);
            getHurtRole.hp -= hurtNum;
            // hjm._hurt.add(cc.v2(atkRole), -hurtNum);
            end();
        }
    },

    // 将 p 位置的角色从地图上删除
    _removePos (p) {
        let {map} = ai;
        let role = map.get(p);
        tz(role).fadeOut()([role, 0])();
        role.isDie = true;
        map.set(p, null);
    },

    _getHurt (end, atkRole, atkPos, getHurtRoleArr, getHurtPosArr, hurtNumArr) {
        cc.log("_getHurt", atkRole, atkPos, getHurtRoleArr, getHurtPosArr, hurtNumArr);
        let seq = this._createSeqFun(end);
        for (let i = 0; i < getHurtRoleArr.length; i++) {
            seq.add("_getHurtOne", [atkRole, atkPos, getHurtRoleArr[i], getHurtPosArr[i], hurtNumArr[i]]);
        }
        seq.end();
    },

    // 主要是敌人死亡后触发自身的技能效果
    _dieOne (end, argArr) {
        let [atkRole, atkPos, dieRole, diePos] = argArr;
        if (dieRole.isDie) {
            end(); 
            return;
        }
        if (dieRole <= 0 && dieRole.dieSkill) {
            this[dieRole.dieSkill](end, atkRole, atkPos, dieRole, diePos);
        }
        else {
            this._removePos(diePos);
            end();
        }
    },

    _die (end, atkRole, atkPos) {
        // let seq = this._createSeqFun(end);
        let {map} = ai;
        // let fun = function (diePos) { 
        //     if (map.get(diePos)) {
        //         let dieRole = map.get(diePos);
        //         if (dieRole.hp <= 0 && !dieRole.isDie) {
        //             // seq.add("_dieOne", [atkRole, atkPos, dieRole, diePos]);
        //             return this._dieOne(()=>this._die(end, atkRole, atkPos), [atkRole, atkPos, dieRole, diePos])

        //             // map.set(p, null);
        //             // role.runAction(cc.fadeOut());
        //         }
        //     }
        // }
        let {w, h}  = map;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let diePos = cc.v2(x, y);
                let dieRole = map.get(diePos);
                if (!dieRole) {
                    continue;
                }
                if (dieRole.hp <= 0 && !dieRole.isDie) {
                    // seq.add("_dieOne", [atkRole, atkPos, dieRole, diePos]);
                    this._dieOne(()=>this._die(end, atkRole, atkPos), [atkRole, atkPos, dieRole, diePos])
                    return;

                    // map.set(p, null);
                    // role.runAction(cc.fadeOut());
                }    
            }
        }
        // map.run(fun);
        // seq.end();
        end();
    },

    // 当函数return true。这就代表直接跳出
    _seq (end, ...argArr) {
        // p = cc.v2(p); // 复制一个，后面要会被修改的
        let self = this;
        let seq = function (...arr) {
            let endFun = end;
            for (let i = arr.length - 1; i >= 0; i--) { 
                // let fun = function (endFun)
                let thisEndFun = endFun;
                let name = arr[i];
                let fun = function () {
                    if (self[name](thisEndFun, ...argArr)) {
                        end();
                    }
                }
                endFun = fun;
            }
            endFun();
        }
        return seq;
    },

    _killOne (end, argArr) {
        let [atkRole, atkPos, getHurtRole, getHurtPos, hurtNum] = argArr;
        if (getHurtRole.isDie) {
            end();
        }
        if (getHurtRole.hp <= 0 && atkRole.killSkill) {
            this[atkRole.killSkill](end, atkRole, atkPos, getHurtRole, getHurtPos, hurtNum);
        }
        else {
            end();
        }
    },

    // 主要是攻击角色击杀敌人后，会触发的技能效果
    _kill (end, atkRole, atkPos, getHurtRoleArr, getHurtPosArr, hurtNumArr) {
        let seq = this._createSeqFun(end);
        for (let i = 0; i < getHurtRoleArr.length; i++) {
            seq.add("_killOne", [atkRole, atkPos, getHurtRoleArr[i], getHurtPosArr[i], hurtNumArr[i]]); 
        }
        seq.end();
    },
    // _kill (end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum) {
    //     if (getHurtRole.hp <= 0 && atkRole.killSkill) {
    //         this[atkRole.killSkill](end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum);
    //     }
    //     else {
    //         end();
    //     }
    // },

    // _getHurt (end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum) {
    //     if (getHurtRole.getHurtSkill) {
    //         this[getHurtRole.getHurtSkill](end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum);
    //     }
    //     else {
    //         hjm._hurt.add(cc.v2(getHurtRole), -hurtNum);
    //         getHurtRole.hp -= hurtNum;
    //         end();
    //     }
    // },

    // _attack (end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum) {
    //     let seq = this._seq(end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum);
    //     // hjm._hurt.add(cc.v2(getHurtRole), -hurtNum);
    //     // getHurtRole.hp -= hurtNum;
    //     seq("_getHurt", "_die", "_kill", "_checkDie");
    // },

    _attack (end, atkRole, atkPos, getHurtRoleArr, getHurtPosArr, hurtNumArr) {
        let seq = this._seq(end, atkRole, atkPos, getHurtRoleArr, getHurtPosArr, hurtNumArr);
        // hjm._hurt.add(cc.v2(getHurtRole), -hurtNum);
        // getHurtRole.hp -= hurtNum;
        seq("_getHurt", "_kill", "_die");
    },

    _move (end, role, p, dir) {
        // cc.log("_move", p, dir);
        let roleBg = (role.type === 1) ? hjm._meBg : hjm._enBg;
        roleBg.setPosition(role);
        roleBg.active = true;
        let np = p.add(cc.v2(dir));
        let {map, posMap} = ai;
        if (map.get(np) === null) {
            roleBg.active = true;
            map.set(np, p);
            p.x = np.x;
            p.y = np.y;
            tz(role).to(0.1, posMap.get(np))(()=>{
                roleBg.active = false;
                end();
            })();
        }
        else {
            end();
        }
    },

    // 查看周围四个方向是否有敌人，如果没有，那就不执行end了,return true 直接跳出
    _check4DirEn (end, role, p, dir) {
        let {map} = ai;
        let dirArr = dyl.addDirArr(p);
        for (let i = 0; i < 4; i++) {
            if (map.get(dirArr[i], "type") === -role.type) {
                end();
                return;
            }
        }
        return true;
    },

/////////////// 具体的移动攻击技能函数
///////////// skill (end, role, p, dir)
    aoe (end, role, p, dir) {
        let seq = this._seq(end, role, p, dir);
        seq("_move", "_check4DirEn", "aoeAtk");
    },

    aoeAtk (end, role, p, dir) {
        let count = dyl.counter(end);
        count(1);

        let dirArr = dyl.addDirArr(); 
        let enDirArr = [];
        let enArr = [];
        for (let i = 0; i < 4; i++) {
            let dir = dirArr[i];
            let next = dir.add(p);
            if (ai.map.get(next, "type") === -role.type) {
                enDirArr.push(dir);
                enArr.push(ai.map.get(next));
            }
        }
        let atk = role.atk;
        // for (let i = 0; i < enArr.length; i++) {
        //     // enArr[i].hp -= atk;
        //     count(1);
        //     this._attack(count, role, p, enArr[i], enDirArr[i].add(p), atk);
        // }
        count(1);
        let enPosArr = [];
        let atkNumArr = [];
        for (let i = 0; i < enArr.length; i++) {
            // enArr[i].hp -= atk;
            enPosArr.push(enDirArr[i].add(p));
            atkNumArr.push(atk);
        }
        this._attack(count, role, p, enArr, enPosArr, atkNumArr);

        tz(role)._by(0.4, [360], [1.1, 1.1])
                ._by(enArr, 0.2, cc.v2(0, 0), function(id, role) {
                    // cc.log("by enArrrrrrrrrrrrrr");
                    return enDirArr[id].mul(20);
                })
                ._to(0.1, [1, 1])
                ._to(enArr, 0.1, cc.v2(0, 0), function(id, role) {
                    return ai.posMap.get(p.add(enDirArr[id]));
                })(count)();
    },

    bullet (end, role, p, dir) {
        let seq = this._seq(end, role, p, dir);
        seq("_move", "_check4DirEn", "bulletAtk");
    },

    bulletAtk (end, role, p, dir) {
        let self = this;
        let dirArr = dyl.addDirArr(); 
        let {map} = ai;
        for (let i = 0; i < 4; i++) {
            let tmpDir = dirArr[i];
            if (map.get(tmpDir.add(p), "type") === -role.type) {
                let bullet = hjm._bulletPool.add();
                if (tmpDir.y) {
                    bullet.rotation = 90;
                }
                else {
                    bullet.rotation = 0;
                }
                bullet.setPosition(cc.v2(role));
                let np = tmpDir.add(p);
                let en = ai.map.get(np);
                tz().by(bullet, 0.2, tmpDir.mul(ai.posMap.d))(function (){
                    bullet.del();
                    self._attack(end, role, p, [en], [np], [role.atk]);
                })();
                return;
            }
        }
        end();
    },


    // 冲击，前面如果是空一格，可以快速移动，并且找出1.5倍的伤害。 如果前面直接是敌人，那就只是找出1倍伤害
    hit (end, role, p, dir) {
        let np = p.add(dir);
        let {map, posMap} = ai;
        let nextType = map.get(np, "type");
        if (nextType === false) { // 撞墙了
            end();
            return;
        }
        else if (nextType) { //前面有人
            let nextRole = map.get(np);
            if (nextType === -role.type) { // 敌人
                tz(role).by(0.05, [1.2, 1.2], dir.mul(-10))
                        .by(0.1, dir.mul(40))
                        (()=>this._attack(end, role, p, [nextRole], [np], [role.atk]))
                        ._by(0.1, dir.mul(-35))
                        ._by(nextRole, 0.1, dir.mul(20))
                        .to(0.05, [1, 1], posMap.get(p))
                        .to(nextRole, 0.05, posMap.get(np))();
                return;
            }
            else if (nextType === role.type) {
                end(); //什么操作也不做，直接跳过
                return;
            }
            else { // 这是非角色的情况，暂时不考虑
                return;
            }
        }

        let nnextType = map.get(np.add(dir), "type");
        if (nnextType === -role.type) {// 终于可以暴击了
            let roleBg = (role.type === 1) ? hjm._meBg : hjm._enBg;
            roleBg.setPosition(role);
            roleBg.active = true;

            let nnp = np.add(dir);
            let en = map.get(nnp);
            tz(role).by(0, dir.mul(-15))
                    .to(0.1, posMap.get(np).add(dir.mul(8)))
                    (()=>{
                        roleBg.active = false;
                        map.set(p, np);
                        this._attack(end, role, np, [en], [nnp], [Math.floor(role.atk * 1.5)]);
                    })
                    ._by(0.05, dir.mul(-20))
                    ._by(en, 0.05, dir.mul(40))
                    ._to(0.05, posMap.get(np))
                    ._to(en, 0.05, posMap.get(nnp))
                    ();
        } 
        else {
            this._move(end, role, p, dir);
        }
    },
///////////// skill (end, role, p, dir)


////////// 下面是死亡函数，就是死后触发的
///////// dieSkill (end, atkRole, atkPos, dieRole, diePos)
///////// dieSkill (end, atkRole, atkPos, dieRole, diePos)


///////// 下面是消灭敌人后触发的函数
///////// killSkill (end, atkRole, atkPos, getHurtRole, getHurtPos, hurtNum);

    // 打爆，就是消灭敌人时，会让敌人周围的敌人都受到同样的伤害
    dabao (end, atkRole, atkPos, getHurtRole, getHurtPos, hurtNum) {
        let {map, posMap} = ai;
        let posArr = dyl.addDirArr(getHurtPos);
        let count = dyl.counter(end);
        count(1);
        for (let i = 0; i < 4; i++) {
            let type = map.get(posArr[i], "type");
            if (type === -atkRole.type) {
                // let dir = posArr[i].sub(getHurtPos);
                count(1);
                this._getHurt (count, null, getHurtPos, [map.get(posArr[i])], posArr[i], [hurtNum]);
            }
        }
        count();
    },
///////// killSkill (end, atkRole, atkPos, getHurtRole, getHurtPos, hurtNum);

////////// 受伤触发的函数，例如反伤之类的
////////// getHurtSkill (end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum)
////////// getHurtSkill (end, atkRole, getHurtRole, atkPos, getHurtPos, hurtNum)


});
