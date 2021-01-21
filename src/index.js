import { h } from "./h.js";
import { render } from "./render.js";

class MyComponent {
	render() {
		return h(
			"div",
			{
				class: "box",
				style: { background: "red" },
			},
			"我是box"
		);
	}
}

let vnode = h(MyComponent);
render(vnode, document.getElementById("app"));
