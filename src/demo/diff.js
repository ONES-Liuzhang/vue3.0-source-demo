import { h } from "../h.js";
import { render } from "../render.js";

const container = document.getElementById("diff");

const prev = h(
	"ul",
	{
		class: "apple",
	},
	[h("li", { key: 0 }, 0), h("li", { key: 1 }, 1), h("li", { key: 2 }, 2)]
);

const next = h(
	"ul",
	{
		class: "orange",
	},
	[
		h("li", null, "新增的3"),
		h("li", null, "新增的4"),
		h("li", null, "新增的2"),
		h("li", { key: 2 }, 2),
		h("li", { key: 0 }, 0),
		h("li", null, "新增的"),
	]
);

render(prev, container);
setTimeout(() => {
	render(next, container);
}, 2000);
