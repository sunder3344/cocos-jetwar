import { _decorator, Component, Node, Vec3, resources, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('enemy')
export class enemy extends Component {
	private _isDie: boolean = false;
	private _enemyPos: Vec3 = new Vec3();

    start() {

    }

	onLoad() {
		
	}

    update(deltaTime: number) {
		this.node.getPosition(this._enemyPos);
        if (!this._isDie) {
			this._enemyPos.y -= 300 * deltaTime;
			//console.log(this._enemyPos);
			this.node.setPosition(this._enemyPos);
		}
		if (this._enemyPos.y < -400) {
			this.node.destroy();
		}
    }

	die() {
		this._isDie = true;
		/*cc.loader.loadRes("enemy0_die", cc.SpriteFrame, (err, res) => {
			this.node.getComponent(cc.Sprite).spriteFrame = res;
		});*/
		resources.load("enemy0_die", ImageAsset, (err, bundle) => {
			//console.log(err);
			//console.log(bundle);
			this.node.getComponent(cc.Sprite).spriteFrame = cc.SpriteFrame.createWithImage(bundle);
		});
		this.schedule(function() {
			this.node.destroy();
		}, 0.3);

	}
}

