import { h } from "../h.js";
import { render } from "../render.js";

const container = document.getElementById("container-functional");

function FunctionalComp(props) {
	return h("div", null, props.text);
}

class MyComponent {
	text = "你好";
	mounted() {
		setTimeout(() => {
			this.text = "再见";
			this._update();
		}, 2000);
	}

	render() {
		return h(FunctionalComp, {
			text: this.text,
		});
	}
}

render(h(MyComponent), container);
