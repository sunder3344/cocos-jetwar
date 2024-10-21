import { _decorator, Component, Node, Vec3, Contact2DType, PolygonCollider2D } from 'cc';
const { ccclass, property } = _decorator;
import {player} from './player';

@ccclass('enemy_bullet')
export class enemy_bullet extends Component {
	private _direction: Vec3 = new Vec3();
	private _speed: number = 0;
	private _playerCtrl: player|null = null;
	
	fire(direction: Vec3, speed: number) {
		this._direction = direction;
		this._speed = speed;
	}
	
    start() {

    }
	
	onLoad() {
		this._collider = this.getComponent(PolygonCollider2D);
		//console.log(this._collider);
		if (this._collider) {
			this._collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionBegin, this);
		}
		this._playerCtrl = cc.find("Canvas/hero1").getComponent(player);
	}

    update(deltaTime: number) {
        // 计算移动的距离
		const moveDistance = this._speed * deltaTime;

		// 按方向移动子弹
		const movement = this._direction.clone().multiplyScalar(moveDistance);
		this.node.setPosition(this.node.position.add(movement));

		// 如果子弹超出屏幕，销毁
		if (this.node.position.y < -800 || this.node.position.y > 800) {
			this.node.destroy();
		}
    }
	
	onCollisionBegin(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
		/*if (otherCollider.tag != 0) {
			this.node.destroy();			//只要击中就消失，子弹碰子弹不能消失
		}*/
		if (otherCollider.tag == 2) {		//击中英雄了
			//销毁敌机
			this.node.destroy();
			this._playerCtrl.isHited();
			this._playerCtrl.checkGameOver();
		}
	}
}

