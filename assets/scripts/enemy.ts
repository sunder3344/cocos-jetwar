import { _decorator, Component, Node, Vec3, resources, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('enemy')
export class enemy extends Component {
	private _isDie: boolean = false;
	private _score: number = 1;			//击落一架得几分
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
	
	hit() {
		
	}

	die() {
		this._isDie = true;
		// 延迟执行
		this.scheduleOnce(() => {
			// 获取 Sprite 组件
			const sprite = this.node.getComponent(cc.Sprite);
			// 确保 Sprite 组件仍然存在
			if (!sprite) {
				console.log("Sprite component is missing or destroyed!");
				return;
			}
			// 异步加载图片资源
			resources.load("enemy0_die", ImageAsset, (err, bundle) => {
				if (err) {
					console.log("Failed to load enemy0_die image:", err);
					return;
				}
				// 再次检查 Sprite 组件是否存在
				if (this.node == null) {
					console.log("Sprite component is null!");
					return;
				}
				const spriteCheck = this.node.getComponent(cc.Sprite);
				if (!spriteCheck) {
					console.log("Sprite component is missing or destroyed after loading image!");
					return;
				}
				// 设置 spriteFrame
				spriteCheck.spriteFrame = cc.SpriteFrame.createWithImage(bundle);

				// 延迟销毁
				this.scheduleOnce(() => {
					this.node.destroy();
				}, 0.3);
			});
		}, 0.1);  // 延迟0.1秒执行
	}
}

