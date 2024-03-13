import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;
import {player} from './player';

@ccclass('prelude')
export class prelude extends Component {
	private _btn: Node|null = null;
	private _label: Label|null = null;
	private _playerCtrl: player|null = null;

    start() {
		this._playerCtrl = cc.find("Canvas/hero1").getComponent(player);
		this._label.string = this._playerCtrl._score;
    }

	onLoad() {
		this._btn = cc.find("prelude/Button");
		this._label = cc.find("prelude/scorePanel").getComponent(Label);
		this._btn.on(Node.EventType.TOUCH_END, this.onStartButton, this);
	}

    update(deltaTime: number) {
        
    }

	onStartButton() {
		//隐藏该canvas，开始游戏
		this.node.active = false;
		if (this._playerCtrl._isPlaying == 0) {
			cc.game.resume();
		} else if (this._playerCtrl._isPlaying == -1) {
			//cc.director.loadScene("mainScene");
			this._playerCtrl._bulletFreq = 0.5;
			this._playerCtrl._enemyFrequency = 1;
			this._playerCtrl._score = 0;
			cc.find("Canvas/score").getComponent(Label).string = this._playerCtrl._score;
			this._playerCtrl.start();
			this._playerCtrl.node.active = true;
		}
		this._playerCtrl._isPlaying = 1;
	}
}


