import { _decorator, Component, Node, Prefab, Vec3, UITransform, resources, instantiate, director, Contact2DType, PolygonCollider2D, Canvas, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {
	private _bullet: Prefab|null = null;
	private _totalRes: number = 2;
	private _loadRes: number = 0;
	private _bulletPos: Vec3 = new Vec3();
	private _enemyJet: Prefab|null = null;
	private _enemyFrequency: number = 1;		//每1秒产生一架敌机
	private _playCollide: PolygonCollider2D = null;
	private _score: number = 0;
	private _freqChange: number = 0;
	private _bulletFreq: number = 0.5;
	private _isPlaying: number = 0;			//0：第一次进入游戏；1：正在开始；-1：死亡

    start() {
		if (this._loadRes == this._totalRes) {
			this.schedule(this.shot, this._bulletFreq);
			this.schedule(this.spawnEnemyJet, this._enemyFrequency);
			if (this._isPlaying == 0) {
				cc.game.pause();
			}
		}
    }

	onLoad() {
		this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
		this._playCollide = this.getComponent(PolygonCollider2D);
		if (this._playCollide) {
			this._playCollide.on(Contact2DType.BEGIN_CONTACT, this.onPlayerCollisionBegin, this);
		}
		//加载Prefab
		resources.load("bullet1", Prefab, (err, prefab) => {
			if (err) {
				console.log("load prefab error!");
				return;
			}
			this._bullet = prefab;
			this._loadRes++;
			this.start();
		});
		resources.load("enemy0", Prefab, (err, prefab) => {
			if (err) {
				console.log("load prefab error!");
				return;
			}
			this._enemyJet = prefab;
			this._loadRes++;
			this.start();
		});
	}

    update(deltaTime: number) {
        
    }

	touchMove(event: EventTouch) {
		//console.log(event.getLocation());
		//console.log(event.target.parent.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getLocationX(), event.getLocationY(), 0)));
		//this.node.setPosition(event.target.parent.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getLocationX(), event.getLocationY(), 0)));
		this.node.setPosition(event.target.parent.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y, 0)));
	}

	shot() {
		let bullet = instantiate(this._bullet);
		//let scene = director.getScene();
		//bullet.parent = scene;
		this.node.getPosition(this._bulletPos);
		bullet.setPosition(this._bulletPos.x, this._bulletPos.y + 75, 0);
		cc.find("Canvas").addChild(bullet);
	}

	spawnEnemyJet() {
		let enemy = instantiate(this._enemyJet);
		enemy.setPosition(cc.find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(Math.random()*450, 800, 0)));
		cc.find("Canvas").addChild(enemy);
	}

	onPlayerCollisionBegin(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
		if (otherCollider.tag == 1) {		//被敌机撞到
			/*resources.load("hero1_die", cc.ImageAsset, (err, bundle) => {
				this.node.getComponent(cc.Sprite).spriteFrame = cc.SpriteFrame.createWithImage(bundle);
			});*/
			//游戏结束
			//cc.game.pause();
			//场景重载
			//cc.director.loadScene("mainScene");
			this._isPlaying = -1;
			cc.find("prelude/scorePanel").getComponent(Label).string = this._score;
			cc.find("prelude").active = true;
			this.unschedule(this.shot);
			this.unschedule(this.spawnEnemyJet);
			this.node.active = false;
		}
	}
}


