import { VNodeFlags, ChildrenFlags } from "./flags.js";
import { createTextVNode } from "./h.js";
const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;
export function render(vnode, container) {
	let preVnode = container.vnode;
	if (preVnode == null) {
		mount(vnode, container);
		container.vnode = vnode;
	}
}

function mount(vnode, container, isSVG) {
	const { flags } = vnode;
	if (flags & VNodeFlags.ELEMENT) {
		mountElement(vnode, container, isSVG);
	} else if (flags & VNodeFlags.FRAGMENT) {
		mountFragment(vnode, container);
	} else if (flags & VNodeFlags.PORTAL) {
		mountPortal(vnode, container);
	} else if (flags & VNodeFlags.COMPONENT) {
		mountComponent(vnode, container);
	} else {
		mountText(vnode, container);
	}
}

// portal会将其children挂载到vnode.tag指向的元素
function mountPortal(vnode, container) {
	const { tag, children, childrenFlags } = vnode;
	const target = typeof tag === "string" ? document.querySelector(tag) : tag;

	if (target == null) {
		console.warn("页面上找不到元素, ", target);
		return;
	}

	switch (childrenFlags) {
		case ChildrenFlags.SINGLE_VNODE:
			mount(children, target);
			break;
		case ChildrenFlags.NO_CHILDREN:
			const placeholder = createTextVNode("");
			mountText(placeholder, target);
			break;
		default:
			for (let i = 0; i < children.length; i++) {
				mount(children[i], target);
			}
			break;
	}

	// TODO 搞清楚为什么要挂载一个占位节点到container
	const placeholder = createTextVNode("");
	mount(placeholder, container);
	vnode.el = placeholder;
}

// fragment的el指向第一个元素
function mountFragment(vnode, container) {
	const { children, childrenFlags } = vnode;
	switch (childrenFlags) {
		case ChildrenFlags.SINGLE_VNODE:
			mount(children, container);
			vnode.el = children.el;
			break;
		case ChildrenFlags.NO_CHILDREN:
			const placeholder = createTextVNode("");
			mountText(placeholder, container);
			vnode.el = placeholder.el;
			break;
		default:
			for (let i = 0; i < children.length; i++) {
				mount(children[i], container);
			}
			vnode.el = children[0].el;
			break;
	}
}

function mountComponent(vnode, container) {
	const { flags } = vnode;
	if (flags & VNodeFlags.COMPONENT_STATEFUL) {
		mountStatefulComponent(vnode, container);
	} else {
		mountFunctionalComponent(vnode, container);
	}
}

function mountStatefulComponent(vnode, container) {
	const instance = new vnode.tag();
	instance.$vnode = instance.render();
	mount(instance.$vnode, container);
	instance.$el = vnode.el = instance.$vnode.el;
}

function mountFunctionalComponent(vnode, container) {
	const $vnode = vnode.tag();
	mount($vnode, container);
	vnode.el = $vnode.el;
}

// mount函数最终会收敛到mountElement
function mountElement(vnode, container, isSVG) {
	const { tag, children, data, childrenFlags } = vnode;
	isSVG = isSVG || tag === "svg";
	let el = isSVG ? document.createElementNS(tag) : document.createElement(tag);

	for (let key in data) {
		switch (key) {
			case "style":
				for (let k in data.style) {
					el.style[k] = data.style[k];
				}
				break;
			case "class":
				let cls = data.class;
				addClass(el, cls);
				break;
			default:
				if (key[0] === "o" && key[1] === "n") {
					// 原生事件监听
					const event = key.substring(2);
					el.addEventListener(event, data[key]);
				} else if (domPropsRE.test(key)) {
					el[key] = data[key];
				} else {
					el.setAttribute(key, data[key]);
				}
				break;
		}
	}

	if (childrenFlags !== ChildrenFlags.NO_CHILDREN) {
		if (childrenFlags & ChildrenFlags.SINGLE_VNODE) {
			mount(children, el, isSVG);
		} else if (childrenFlags & ChildrenFlags.MULTI_VNODES) {
			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				mount(child, el, isSVG);
			}
		}
	}

	vnode.el = el;
	container.appendChild(el);
}

function mountText(vnode, container) {
	const el = document.createTextNode(vnode.children);
	container.appendChild(el);
}

function addClass(el, cls) {
	const { classList } = el;
	if (Array.isArray(cls)) {
		for (let i = 0; i < cls.length; i++) {
			classList.add(cls[i]);
		}
	} else if (typeof cls === "string") {
		classList.add(cls);
	} else if (typeof cls === "object") {
		for (let k in cls) {
			if (cls[k]) {
				classList.add(k);
			}
		}
	}
}
