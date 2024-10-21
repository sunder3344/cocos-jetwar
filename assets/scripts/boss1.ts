import { _decorator, Component, Node, Vec3, resources, Prefab, instantiate, ImageAsset, math, UITransform, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('boss1')
export class boss1 extends Component {
	private _isDie: boolean = false;
	private _life: number = 150;			//该boss需150颗子弹才能击落
	private _hitNum: number = 0;			//被击中次数
	private _score: number = 150;			//击落一架得几分
	private _totalRes: number = 1;			//总共的资源数
	private _loadRes: number = 0;
	private _isShow: number = 0;			//是否出现过，出现过就不出线了
	private _bossPos: Vec3 = new Vec3();
	private _bulletPos: Vec3 = new Vec3();
	private _bullet: Prefab|null = null;
	private _bulletSpeed1: number = 200;	//子弹1的速度
	private _bulletSpeed2: number = 200;	//子弹2的速度
	private _movementSpeed: number = 50;	// Boss左右移动速度
	private _moveDirection: number = 1;		// 移动方向: 1表示向右, -1表示向左
	private _moveRange: number = 400;		// 左右移动范围
	private _startPos: Vec3 = new Vec3();   // 初始位置
	private _isEntering: boolean = true;    // 标记是否正在进入屏幕
    private _enterSpeed: number = 100;       // 进入屏幕的速度
	private _initialized: boolean = false;
	
    start() {
		if (this._loadRes == this._totalRes) {
			const canvas = cc.find("Canvas");
			const canvasTransform = canvas.getComponent(UITransform);
			const canvasWidth = canvasTransform.width;
			const canvasHeight = canvasTransform.height;
			
			let centerPosition = new Vec3(canvasWidth / 2, canvasHeight / 2 + 300, 0);
			this._bossPos.x = canvasWidth / 2;
			this._bossPos.y = canvasHeight / 2 + 300;
			this.node.setPosition(canvasTransform.convertToNodeSpaceAR(centerPosition));
			
			this._initialized = true;  			//初始化完成
			this.schedule(this.shot, 2);		//每2秒发射一次子弹
			this.schedule(this.shot2, 6);		//每6秒发射一次子弹
		}
    }
	
	onLoad() {
		//加载Prefab(子弹类型1)
		resources.load("enemy_bullet", Prefab, (err, prefab) => {
			if (err) {
				console.log("load prefab error!");
				return;
			}
			this._bullet = prefab;
			this._loadRes++;
			this.start();
		});
		//加载Prefab(子弹类型2)
		
	}
	
	//boss子弹发射类型1
	shot() {
		if (!this._isDie) {
			const bulletCount = 6; // 一波发射6颗子弹
			const angleRange = 120; // 扇形的角度范围（120度）
			const startAngle = -angleRange / 2; // 扇形起始角度
			const angleStep = angleRange / (bulletCount - 1); // 每个子弹之间的角度差
			
			// 获取 Boss 的当前世界坐标
			const bossWorldPos = this.node.getWorldPosition();
			const bulletStartPos = new Vec3(bossWorldPos.x, bossWorldPos.y - 75, 0); // 子弹开始发射的位置，稍微往下偏移
			//console.log("Bullet start position:", bulletStartPos); // 打印子弹起始位置

			for (let i = 0; i < bulletCount; i++) {
				const angle = startAngle + i * angleStep;
				const radian = math.toRadian(angle);
				const direction = new Vec3(Math.sin(radian), -Math.cos(radian), 0); // 子弹的方向向量
				// 创建子弹实例
				let bullet = instantiate(this._bullet);
				// 设置子弹的初始位置为 Boss 的世界坐标
				bullet.setPosition(cc.find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(bulletStartPos.x, bulletStartPos.y, 0)));
				// 设置子弹的旋转角度（绕Z轴旋转）
				bullet.setRotationFromEuler(0, 0, angle);
				// 将子弹添加到场景中
				cc.find("Canvas").addChild(bullet);
				// 子弹移动函数，根据方向和速度移动
				bullet.getComponent('enemy_bullet').fire(direction, this._bulletSpeed1);
				//console.log("Bullet fired:", bullet);
			}
		}
	}
	
	shot2() {
		if (!this._isDie) {
			const bulletCount = 18; // 一波发射18颗子弹;
			//获取 Boss 的当前世界坐标
			const bossWorldPos = this.node.getWorldPosition();
			const bulletStartPos = new Vec3(bossWorldPos.x, bossWorldPos.y - 75, 0); // 子弹开始发射的位置，稍微往下偏移

			for (let i = 0; i < bulletCount; i++) {
				const randomAngle = Math.random() * 360; // 随机角度
				const radian = math.toRadian(randomAngle);
				const direction = new Vec3(Math.sin(radian), -Math.cos(radian), 0);
				
				// 创建子弹实例
				let bullet = instantiate(this._bullet);
				bullet.setPosition(cc.find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(bulletStartPos.x, bulletStartPos.y, 0)));
				bullet.setRotationFromEuler(0, 0, randomAngle);
				cc.find("Canvas").addChild(bullet);
				bullet.getComponent('enemy_bullet').fire(direction, this._bulletSpeed1);
			}
		}
	}

    update(deltaTime: number) {
		if (!this._initialized) return;  	//如果未初始化完成，不进行更新逻辑
        if (!this._isDie) {
			const canvas = cc.find("Canvas").getComponent(UITransform);
			
            // 处理从屏幕外进入
            if (this._isEntering) {
				this._bossPos.y = this._bossPos.y - this._enterSpeed * deltaTime;
				this.node.setPosition(cc.find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(new Vec3(this._bossPos.x, this._bossPos.y, 0)));
                if (this._bossPos.y <= canvas.height / 2 + 200 ) {  // 判断是否进入可视区域
                    this._isEntering = false;
                }
                return;
            }

            // 左右移动逻辑
            this.node.position.x += this._moveDirection * this._movementSpeed * deltaTime;
            // 限制Boss左右移动的范围
            const minX = -canvas.width / 2 + 50;  // 设置一个最小范围，避免飘出屏幕
            const maxX = canvas.width / 2 - 50;   // 设置一个最大范围，避免飘出屏幕

            if (this.node.position.x > maxX || this.node.position.x < minX) {
                this._moveDirection *= -1; // 反转移动方向
            }

            this.node.setPosition(new Vec3(this.node.position.x, this.node.position.y, 0));
		}
    }
	
	//播放击中动画
	hit() {
		this._hitNum += 1;
		resources.load("boss1_suffer", ImageAsset, (err, bundle) => {
			if (this.node == null) {
				console.log("boss1 jet hit this.node is null");
				return;
			}
			if (this.node.getComponent(cc.Sprite) == null) {
				console.log("boss1 jet hit his.node.getComponent is null");
				return;
			}
			this.node.getComponent(cc.Sprite).spriteFrame = cc.SpriteFrame.createWithImage(bundle);
		});
	}
	
	die() {
		this._isDie = true;
		let anim = this.node.getComponent(Animation);
		if (anim) {
			//播放 'boss1_die' 动画
			anim.play('boss1_die');
		}
		/*anim.on(Animation.EventType.FINISHED, () => {
            // 动画播放完毕后销毁节点
            this.node.destroy();
        }, this);*/
		
		this.schedule(function() {
			this.node.destroy();
		}, 0.8);		//动画长度1.2秒，所以就1.2秒后移除
	}
}

