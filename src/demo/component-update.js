import { h } from "../h.js";
import { render } from "../render.js";

const container = document.getElementById("container-update");

class MyComponent {
	localState = "one";

	mounted() {
		setTimeout(() => {
			this.localState = "two";
			// 主动更新
			this._update();
		}, 2000);
	}

	render() {
		return h("div", null, this.localState);
	}
}

render(h(MyComponent), container);
