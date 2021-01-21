import { VNodeFlags, ChildrenFlags } from "./flags.js";

export function render(vnode, container) {
	let preVnode = container.vnode;
	let el = null;
	if (preVnode === null) {
		el = mount(vnode, container);
		vnode.el = container.el = el;
	}
}

function mount(vnode, container) {
	const { flags } = vnode;
	let el = null;
	if (flags & VNodeFLags.ELEMENT) {
		el = mountElement(vnode, container);
	} else if (flags & VNodeFlags.FRAGMENT) {
		el = mountFragment(vnode, container);
	} else if (flags & VNodeFlags.PORTAL) {
		el = mountPortal(vnode, container);
	} else if (flags & VNodeFlags.COMPONENT) {
		el = mountComponent(vnode, container);
	} else {
		el = mountText(vnode, container);
	}
	return el;
}

function mountElement(vnode, container) {
	const { tag, children } = vnode;
	let el = document.createElement(tag);
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		mount(child, el);
	}
	container.appendChildren(el);
}
