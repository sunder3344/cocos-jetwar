import { _decorator, Component, Node, Vec3, resources, Prefab, instantiate, ImageAsset, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('middle_jet')
export class middle_jet extends Component {
	private _isDie: boolean = false;
	private _life: number = 3;			//中型飞机3颗子弹才能击落
	private _hitNum: number = 0;		//被击中次数
	private _score: number = 3;			//击落一架得几分
	private _totalRes: number = 1;		//总共的资源数
	private _loadRes: number = 0;
	private _middlePos: Vec3 = new Vec3();
	private _bulletPos: Vec3 = new Vec3();
	private _bullet: Prefab|null = null;
	private _bulletSpeed: number = 200;
	
    start() {
		if (this._loadRes == this._totalRes) {
			this.schedule(this.shot, 2);		//每两秒发射一颗子弹
		}
    }
	
	onLoad() {
		//加载Prefab
		resources.load("enemy_bullet", Prefab, (err, prefab) => {
			if (err) {
				console.log("load prefab error!");
				return;
			}
			this._bullet = prefab;
			this._loadRes++;
			this.start();
		});
	}
	
	shot() {
		if (!this._isDie) {
			// 随机生成一个 -30 到 30 度的角度
			const randomAngle = math.toRadian(math.randomRange(-30, 30));
			// 计算方向向量（单位向量）
			const direction = new Vec3(Math.sin(randomAngle), -Math.cos(randomAngle), 0);
			// 创建子弹实例
			let bullet = instantiate(this._bullet);
			// 设置子弹的位置
			this.node.getPosition(this._bulletPos);
			bullet.setPosition(this._bulletPos.x, this._bulletPos.y - 75, 0);
			// 设置子弹的旋转角度（绕Z轴旋转）
			bullet.setRotationFromEuler(0, 0, math.toDegree(randomAngle));
			// 将子弹添加到场景
			cc.find("Canvas").addChild(bullet);
			// 子弹移动函数
			bullet.getComponent('enemy_bullet').fire(direction, this._bulletSpeed);
		}
	}

    update(deltaTime: number) {
        this.node.getPosition(this._middlePos);
        if (!this._isDie) {
			this._middlePos.y -= 100 * deltaTime;
			//console.log(this._middlePos);
			this.node.setPosition(this._middlePos);
		}
		if (this._middlePos.y < -400) {
			this.node.destroy();
		}
    }
	
	//播放击中动画
	hit() {
		this._hitNum += 1;
		resources.load("middle1_suffer", ImageAsset, (err, bundle) => {
			if (this.node == null) {
				console.log("middle jet hit this.node is null");
				return;
			}
			if (this.node.getComponent(cc.Sprite) == null) {
				console.log("middle jet hit his.node.getComponent is null");
				return;
			}
			this.node.getComponent(cc.Sprite).spriteFrame = cc.SpriteFrame.createWithImage(bundle);
		});
	}
	
	die() {
		this._isDie = true;
		/*cc.loader.loadRes("enemy0_die", cc.SpriteFrame, (err, res) => {
			this.node.getComponent(cc.Sprite).spriteFrame = res;
		});*/
		resources.load("middle1_die", ImageAsset, (err, bundle) => {
			//console.log(err);
			//console.log(bundle);
			if (this.node == null) {
				console.log("middle jet this.node is null");
				return;
			}
			if (this.node.getComponent(cc.Sprite) == null) {
				console.log("middle jet this.node.getComponent is null");
				return;
			}
			this.node.getComponent(cc.Sprite).spriteFrame = cc.SpriteFrame.createWithImage(bundle);
		});
		this.schedule(function() {
			this.node.destroy();
		}, 0.3);

	}
}

