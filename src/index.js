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

// render(main, document.getElementById("app"));

// 旧的 VNode
const prevVNode = h(
	Portal,
	{
		target: "#app",
	},
	[h("p", null, "旧片段子节点 1"), h("p", null, "旧片段子节点 2")]
);

// 新的 VNode
const nextVNode = h(
	Portal,
	{
		target: "#app",
	},
	[h("p", null, "新片段子节点 1"), h("p", null, "新片段子节点 2")]
);

render(prevVNode, document.getElementById("app"));

// 2秒后更新
setTimeout(() => {
	render(nextVNode, document.getElementById("app"));
}, 2000);
