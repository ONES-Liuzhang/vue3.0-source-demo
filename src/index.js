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

let vnode = h(
	"div",
	{
		style: { background: "red" },
		class: "cls",
	},
	[h("span", null, "我是span1"), h("span", null, "我是span2"), "文本"]
);
render(vnode, document.getElementById("app"));
