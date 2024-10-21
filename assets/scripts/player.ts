import { _decorator, Component, Node, Prefab, Vec3, UITransform, resources, instantiate, director, Contact2DType, PolygonCollider2D, Canvas, Label, Tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {
	private _bullet: Prefab|null = null;
	private _totalRes: number = 4;				//总共的资源数
	private _loadRes: number = 0;
	private _bulletPos: Vec3 = new Vec3();
	private _enemyJet: Prefab|null = null;		//小型敌机prefab对象
	private _enemyFrequency: number = 1;		//每1秒产生一架敌机
	private _middleJet: Prefab|null = null;		//中型敌机prefab对象
	private _middleFrequency: number = 5;		//每5秒产生一架中型飞机
	private _boss1Jet: Prefab|null = null;		//boss敌机prefab对象
	private _boss1Frequency: number = 50;		//分数大于50分出现boss1
	private _playCollide: PolygonCollider2D = null;	//飞机碰撞检测
	private _score: number = 0;					//得分
	private _heroLife: number = 100;			//有几条命（按需设置）
	private _freqChange: number = 0;			//小飞机频率
	private _bulletFreq: number = 0.5;			//子弹频率
	private _isPlaying: number = 0;				//0：第一次进入游戏；1：正在开始；-1：死亡
	private _bossNum: number = 0;				//目前为止出现过几个boss了，用于判断出现过的不再出现
	
	//deprecated
	player_init() {
		this._enemyFrequency = 1;
		this._middleFrequency = 5;
		this._score = 0;
		this._heroLife = 1;
		this._freqChange = 0;
		this._bulletFreq = 0.5;
		this._bossNum = 0;
	}

    start() {
		if (this._loadRes == this._totalRes) {
			this.schedule(this.shot, this._bulletFreq);
			this.schedule(this.spawnEnemyJet, this._enemyFrequency);
			this.schedule(this.spawnMiddleJet, this._middleFrequency);
			if (this._isPlaying == 0) {
				cc.game.pause();
			}
		}
    }

	onLoad() {
		cc.find("Canvas/life").getComponent(Label).string = this._heroLife;
		
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
		//加载小敌机
		resources.load("enemy0", Prefab, (err, prefab) => {
			if (err) {
				console.log("load enemy0 error!");
				return;
			}
			this._enemyJet = prefab;
			this._loadRes++;
			this.start();
		});
		//加载中型号敌机
		resources.load("middle_jet", Prefab, (err, prefab) => {
			if (err) {
				console.log("load middle_jet error!");
				return;
			}
			this._middleJet = prefab;
			this._loadRes++;
			this.start();
		});
		//加载boss1
		resources.load("boss1", Prefab, (err, prefab) => {
			if (err) {
				console.log("load boss1_jet error!");
				return;
			}
			this._boss1Jet = prefab;
			this._loadRes++;
			this.start();
		});
	}

    update(deltaTime: number) {
        if (this._score >= 75) {		//分数大于75出现boss1
			this.spawnBoss1Jet();
		}
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

	//上半图随机位置生成小飞机
	spawnEnemyJet() {
		let enemy = instantiate(this._enemyJet);
		enemy.setPosition(cc.find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(Math.random()*450, 800, 0)));
		cc.find("Canvas").addChild(enemy);
	}
	
	//上半图随机位置生成中型飞机
	spawnMiddleJet() {
		let middle = instantiate(this._middleJet);
		middle.setPosition(cc.find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(Math.random()*450, 800, 0)));
		cc.find("Canvas").addChild(middle);
	}
	
	//上半图中心位置生成boss
	spawnBoss1Jet() {
		if (this._bossNum == 0) {			//没出现过boss就出现
			let boss1 = instantiate(this._boss1Jet);
			// 获取 Canvas 的 UITransform 组件
			const canvas = cc.find("Canvas");
			const canvasTransform = canvas.getComponent(UITransform);
			const canvasWidth = canvasTransform.width;
			const canvasHeight = canvasTransform.height;
			// 设置 Boss 在屏幕顶部居中位置（Y 轴位于屏幕顶部上方 100 像素）
			/*let centerPosition = new Vec3(canvasWidth / 2, canvasHeight / 2 + 150, 0);
			boss1.setPosition(centerPosition);*/
			canvas.addChild(boss1);
			this._bossNum = 1;
		}
	}
	
	checkGameOver() {
		if (this._heroLife <= 0) {			
			this._isPlaying = -1;
			cc.find("prelude/scorePanel").getComponent(Label).string = this._score;
			cc.find("prelude").active = true;
			this.unschedule(this.shot);
			this.unschedule(this.spawnEnemyJet);
			this.unschedule(this.spawnMiddleJet);
			this.node.active = false;
		}
	}
	
	isHited() {
		this._heroLife -= 1;
		// 设置闪烁效果（颜色变为白色并恢复原色）
		// 获取或添加 UIOpacity 组件
        let opacityComponent = this.node.getComponent(UIOpacity);
        if (!opacityComponent) {
            opacityComponent = this.node.addComponent(UIOpacity);
        }

        // 开始闪烁，闪烁 3 次
        Tween.stopAllByTarget(opacityComponent);  // 确保没有其他闪烁效果在进行
        let blinkTimes = 3;  // 闪烁次数
        let blinkInterval = 0.1;  // 每次闪烁持续时间

        let tween = new Tween(opacityComponent)
            .to(blinkInterval, { opacity: 50 })   // 变透明
            .to(blinkInterval, { opacity: 255 })  // 恢复原本透明度
            .union()                               // 合并为一个步骤
            .repeat(blinkTimes);                   // 重复闪烁

        // 开始执行
        tween.start();
	}

	onPlayerCollisionBegin(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
		if (otherCollider.tag == 1 || otherCollider.tag == 3 || otherCollider.tag == 4) {		//被敌机撞到
			/*resources.load("hero1_die", cc.ImageAsset, (err, bundle) => {
				this.node.getComponent(cc.Sprite).spriteFrame = cc.SpriteFrame.createWithImage(bundle);
			});*/
			//游戏结束
			//cc.game.pause();
			//场景重载
			//cc.director.loadScene("mainScene");
			this.isHited();
			cc.find("Canvas/life").getComponent(Label).string = this._heroLife;
			this.checkGameOver();
		}
	}
}


