import { h, Portal, Fragment } from "./h.js";
import { render } from "./render.js";

class MyComponent {
	render() {
		return h(
			"div",
			{
				class: "box",
				style: { background: "green" },
				prop1: "a",
				value: 2,
			},
			fragmentVNode,
			"我是box"
		);
	}
}

let portalVNode = h(
	Portal,
	{
		target: "#portal-box",
	},
	[h("span", null, "portal1"), h("span", null, "portal2"), "portal3"]
);

let fragmentVNode = h(Fragment, null, [
	h("span", null, "fragment1"),
	h("span", null, "fragment2"),
]);

let main = h(
	"div",
	{
		style: { background: "red" },
		class: "cls",
		onclick: (e) => {
			if (main.el) {
				main.el.style.background = "blue";
			}
		},
	},
	[
		h("span", null, "我是span1"),
		h("span", null, "我是span2"),
		"文本",
		portalVNode,
	]
);

render(main, document.getElementById("app"));

render(h(MyComponent), document.getElementById("component-app"));
