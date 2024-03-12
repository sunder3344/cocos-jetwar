import { _decorator, Component, Node, Vec3, Contact2DType, PolygonCollider2D, Label } from 'cc';
const { ccclass, property } = _decorator;
import {enemy} from './enemy';
import {player} from './player';

@ccclass('bullet')
export class bullet extends Component {
	private _speed: number = 900;
	private _bulletPos: Vec3 = new Vec3();
	private _collider: PolygonCollider2D = null;
	private _enemyCtrl: enemy|null = null;
	private _playerCtrl: player|null = null;

    start() {

    }

	onLoad() {
		this._collider = this.getComponent(PolygonCollider2D);
		//console.log(this._collider);
		if (this._collider) {
			this._collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionBegin, this);
		}
	}

    update(deltaTime: number) {
		this.node.getPosition(this._bulletPos);
        this._bulletPos.y += deltaTime * this._speed;
		if (this._bulletPos.y > 810) {
			this.node.destroy();
		} else {
			this.node.setPosition(this._bulletPos);
		}
    }

	onCollisionBegin(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
		if (otherCollider.tag == 1) {		//打到敌机
			//销毁敌机
			this._enemyCtrl = otherCollider.getComponent(enemy);
			this._enemyCtrl.die();
			this.node.destroy();
			this.addScore(1);

			//判断分数，如果大于10架，增加频率
			this._playerCtrl = cc.find("Canvas/hero1").getComponent(player);
			if (this._playerCtrl._score == 10) {
				this._playerCtrl._enemyFrequency = 0.8;
				this._playerCtrl._freqChange = 1;
			} else if (this._playerCtrl._score == 20) {
				this._playerCtrl._enemyFrequency = 0.6;
				this._playerCtrl._freqChange = 1;
			} else if (this._playerCtrl._score == 30) {
				this._playerCtrl._enemyFrequency = 0.4;
				this._playerCtrl._freqChange = 1;
			} else if (this._playerCtrl._score == 40) {
				this._playerCtrl._enemyFrequency = 0.2;
				this._playerCtrl._freqChange = 1;
			} else if (this._playerCtrl._score == 50) {		//打掉50架，直接地狱级，子弹射速也增加
				this._playerCtrl._enemyFrequency = 0.1;
				this._playerCtrl._freqChange = 2;
				this._playerCtrl._bulletFreq = 0.2;
			} else {
				this._playerCtrl._freqChange = 0;
			}
			//console.log(this._playerCtrl._freqChange);
			//console.log(this._playerCtrl._enemyFrequeny);
			if (this._playerCtrl._freqChange >= 1) {
				this._playerCtrl.unschedule(this._playerCtrl.spawnEnemyJet);
				this._playerCtrl.schedule(this._playerCtrl.spawnEnemyJet, this._playerCtrl._enemyFrequency);
			}
			if (this._playerCtrl._freqChange == 2) {		//子弹射速增加一倍
				this._playerCtrl.unschedule(this._playerCtrl.shot, this._playerCtrl._bulletFreq);
				this._playerCtrl.schedule(this._playerCtrl.shot, this._playerCtrl._bulletFreq);
			}
		}
	}

	addScore(score: number) {
		//分数加1
		this._playerCtrl = cc.find("Canvas/hero1").getComponent(player);
		this._playerCtrl._score += score;
		//console.log(this._playerCtrl._score);
		cc.find("Canvas/score").getComponent(Label).string = this._playerCtrl._score;
	}
}

