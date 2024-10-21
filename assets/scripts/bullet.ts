import { _decorator, Component, Node, Vec3, Contact2DType, PolygonCollider2D, Label } from 'cc';
const { ccclass, property } = _decorator;
import {enemy} from './enemy';
import {middle_jet} from './middle_jet'
import {player} from './player';
import {boss1} from './boss1';

@ccclass('bullet')
export class bullet extends Component {
	private _speed: number = 900;
	private _bulletPos: Vec3 = new Vec3();
	private _collider: PolygonCollider2D = null;
	private _enemyCtrl: enemy|null = null;
	private _middleCtrl: middle_jet|null = null;
	private _playerCtrl: player|null = null;
	private _boss1Ctrl: boss1|null = null;

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
		this.node.getPosition(this._bulletPos);
		this._bulletPos.y += deltaTime * this._speed;
		if (this._bulletPos.y > 810) {
			this.node.destroy();
		} else {
			this.node.setPosition(this._bulletPos);
		}
    }

	onCollisionBegin(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
		if (otherCollider.tag != 5) {
			this.node.destroy();			//只要击中敌机子弹就要消失，子弹碰子弹不能消失
		}
		if (otherCollider.tag == 1) {		//打到小飞机
			//销毁敌机
			this._enemyCtrl = otherCollider.getComponent(enemy);
			this._enemyCtrl.die();
			this.addScore(this._enemyCtrl._score);
		} else if (otherCollider.tag == 3) {			//打到中型飞机
			this._middleCtrl = otherCollider.getComponent(middle_jet);
			//击中就播放一次击中动画
			this._middleCtrl.hit();
			//判断打到几次
			//console.log("hit_num", this._middleCtrl._hitNum);
			if (this._middleCtrl._hitNum >= this._middleCtrl._life) {		//如果中型飞机生命为0了，直接销毁
				this._middleCtrl.die();
				
				this.addScore(this._middleCtrl._score);			//一次性加生命值的分数
			}
		} else if (otherCollider.tag == 4) {			//打到boss
			//需要判断当前是第几个boss
			if (this._playerCtrl._bossNum == 1) {		//第一个boss
				this._boss1Ctrl = otherCollider.getComponent(boss1);
				//击中
				this._boss1Ctrl.hit();
				//判断打到几次
				if (this._boss1Ctrl._hitNum >= this._boss1Ctrl._life) {		//如果中型飞机生命为0了，直接销毁
					this._boss1Ctrl.die();
					
					this.addScore(this._boss1Ctrl._score);			//一次性加生命值的分数
				}
			}
		}
		//判断分数，如果大于10分，增加频率
		if (this._playerCtrl._score >= 200) {							//得到200分，子弹射速不变，变两排
			this._playerCtrl._freqChange = 3;
			this._playerCtrl._bulletFreq = 0.1;
		} else if (this._playerCtrl._score >= 50){						//得到50分，直接打boss，子弹射速也增加
			//this._playerCtrl._enemyFrequency = 0.1;					//得到50分，直接地狱级，子弹射速也增加
			this._playerCtrl._freqChange = 2;
			this._playerCtrl._bulletFreq = 0.2;
		} else if (this._playerCtrl._score >= 40) {
			this._playerCtrl._enemyFrequency = 0.2;
			this._playerCtrl._freqChange = 1;
		} else if (this._playerCtrl._score >= 30) {
			this._playerCtrl._enemyFrequency = 0.4;
			this._playerCtrl._freqChange = 1;
		} else if (this._playerCtrl._score >= 20) {
			this._playerCtrl._enemyFrequency = 0.6;
			this._playerCtrl._freqChange = 1;
		} else if (this._playerCtrl._score >= 10) {
			this._playerCtrl._enemyFrequency = 0.8;
			this._playerCtrl._freqChange = 1;
		} else {
			this._playerCtrl._freqChange = 0;
		}
		//console.log(this._playerCtrl._freqChange);
		//console.log(this._playerCtrl._enemyFrequeny);
		if (this._playerCtrl._freqChange == 1) {
			this._playerCtrl.unschedule(this._playerCtrl.spawnEnemyJet);
			this._playerCtrl.schedule(this._playerCtrl.spawnEnemyJet, this._playerCtrl._enemyFrequency);
		} else if (this._playerCtrl._freqChange == 2) {		//子弹射速增加一倍
			this._playerCtrl.unschedule(this._playerCtrl.shot, this._playerCtrl._bulletFreq);
			this._playerCtrl.schedule(this._playerCtrl.shot, this._playerCtrl._bulletFreq);
		} else if (this._playerCtrl._freqChange == 3) {		//两排子弹
			this._playerCtrl.unschedule(this._playerCtrl.shot, this._playerCtrl._bulletFreq);
			this._playerCtrl.schedule(this._playerCtrl.shot, this._playerCtrl._bulletFreq);
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


