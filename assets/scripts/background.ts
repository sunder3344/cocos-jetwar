import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const height: number = 850;

@ccclass('background')
export class background extends Component {
	private _pos: Vec3 = new Vec3();
    start() {

    }

    update(deltaTime: number) {
        for (let bgnode of this.node.children) {
			bgnode.getPosition(this._pos);
			this._pos.y -= deltaTime * 80;
			if (this._pos.y < -height) {
				this._pos.y += height*2;
			}
			bgnode.setPosition(this._pos);
		}
    }
}

