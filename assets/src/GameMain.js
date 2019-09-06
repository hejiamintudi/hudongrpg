cc.Class({
    extends: cc.Component,

    properties: {
    },
    onLoad () {
        // ai.
        this.skill = this.node.getComponent("Skill");
    },
    
    startGame () {
        let arr = ["startMove", "startGame"];
        dyl.process(this, arr, true);
    },

    startMove (end) {
        this.node.touch = ["move", end];
    },

    showData (role) {
        cc.log("showData");
        hjm._showLab.enBg = (role.type === -1);
        hjm._showLab.spr = (role.type === 1) ? role.hero : role.en;
        hjm._showLab.desc = role.desc;
        hjm._showLab.hp = role.hp;
        hjm._showLab.atk = role.atk;
        // hjm._showLab.desc = role.desc;

    },

    moveOn (p, end) {
        cc.log("moveOn", p);
        let role = ai.map.get(ai.posMap.find(p));
        cc.log(ai.posMap.get(p));
        cc.log(role);
        if (role) {
            this.showData(role);
            // return;
        }
        return [p, end];
    },

    moveEnd (p, oriP, end) {
        let pos = p.sub(oriP); 
        if (pos.mag() < 3) {
            // cc.log("llllllllllllllllllll");
            return [end];
        }
        this.node.touch = "stop";
        let {x, y} = pos;
        let dir = null;
        if (y >= x) {
            if (y >= -x) {
                dir = cc.v2(0, 1);
            }
            else {
                dir = cc.v2(-1, 0);
            }
        }
        else {
            if (y >= -x) {
                dir = cc.v2(1, 0);
            }
            else {
                dir = cc.v2(0, -1);
            }
        }
        return this.move(end, dir);
    },

    move (end, dir) {
        cc.log("move", dir);
        let {w, h} = ai.map;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let px = x;
                let py = y;
                if (dir.x === 1) {
                    px = w - x -1;
                }
                if (dir.y === 1) {
                    py = h - y -1;
                }
                let p = cc.v2(px, py);
                let type = ai.map.get(p, "type");
                // cc.log("hero", p, type);
                if (type === 1) { // 我方
                    end(this, "moveRole", ai.map.get(p), p, dir);
                }
            }
        }

        dir = dir.mul(-1);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let px = x;
                let py = y;
                if (dir.x === 1) {
                    px = w - x - 1;
                }
                if (dir.y === 1) {
                    py = h - y - 1;
                }
                let p = cc.v2(px, py);
                let type = ai.map.get(p, "type");
                if (type === -1) { // 我方
                    let role  = ai.map.get(p);
                    end(this, "roleToTop", role);
                    end(this, "moveRole", role, p, dir);
                    end(this, "roleOutTop", role);
                }
            }
        }
        end();
    },

    roleToTop (end, role) {
        role.parent = hjm._topRoleLayer;
        end();
    },

    roleOutTop (end, role) {
        role.parent = role.oriParent;
        end();
    },

    moveRole (end, role, p, dir) {
        // cc.log(".....moveRole", p, dir);
        if (role.isDie) {
            return end();
        }
        this.skill[role.skill](end, role, p, dir);        
    },

});
