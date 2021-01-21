import { VNodeFlags, ChildrenFlags } from "./flags.js";

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

function mountPortal(vnode, container) {}

function mountFragment(vnode, container) {}

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

function mountFunctionalComponent(vnode, container) {}

// mount函数最终会收敛到mountElement
function mountElement(vnode, container, isSVG) {
	const { tag, children, data } = vnode;
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
				break;
		}
	}

	if (children !== null) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			// 挂载child
			mount(child, el, isSVG);
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
