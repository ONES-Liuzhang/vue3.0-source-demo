import { VNodeFlags, ChildrenFlags } from "./flags.js";

export const Portal = Symbol();
export const Fragment = Symbol();
export function h(tag, data = null, children = null) {
	let flags = null;
	if (tag === Portal) {
		flags = VNodeFlags.PORTAL;
		// portal的tag指向的是挂载的容器 对其他标签来说是container
		tag = data && data.target;
	} else if (tag === Fragment) {
		flags = VNodeFlags.FRAGMENT;
	} else if (typeof tag === "string") {
		flags = tag === "svg" ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
	} else {
		// 兼容vue2对象式组件 typeof null == 'object'
		if (tag !== null && typeof tag === "object") {
			flags = tag.functional
				? VNodeFlags.COMPONENT_FUNCTIONAL // 函数式组件
				: VNodeFlags.COMPONENT_STATEFUL_NORMAL; // 有状态组件
		} else if (typeof tag === "function") {
			// vue3 类组件
			flags =
				tag.prototype && tag.prototype.render
					? VNodeFlags.COMPONENT_STATEFUL_NORMAL // 有状态组件
					: VNodeFlags.COMPONENT_FUNCTIONAL; // 函数式组件
		}
	}

	// children类型参数
	let childrenFlags = null;
	if (Array.isArray(children)) {
		const { length } = children;
		if (length === 0) {
			childrenFlags = ChildrenFlags.NO_CHILDREN;
		} else if (length === 1) {
			children = children[0];
			childrenFlags = ChildrenFlags.SINGLE_VNODE;
		} else {
			childrenFlags = ChildrenFlags.KEYED_VNODES;
			children = normalizedChildren(children);
		}
	} else if (children === null) {
		childrenFlags = ChildrenFlags.NO_CHILDREN;
	} else if (children._isVNode) {
		childrenFlags = ChildrenFlags.SINGLE_VNODE;
	} else {
		children = createTextVNode(children + "");
		childrenFlags = ChildrenFlags.SINGLE_VNODE;
	}

	return {
		tag,
		_isVNode: true,
		flags,
		childrenFlags,
		children,
		data,
		el: null,
	};
}

export function createTextVNode(text) {
	return {
		_isVNode: true,
		tag: null,
		flags: VNodeFlags.TEXT,
		// 纯文本的VNode，children就是其对应的字符串
		children: text,
		childrenFlags: VNodeFlags.NO_CHILDREN,
		data: null,
		el: null,
	};
}

// TODO child为数组的情况，要打散数组； 当出现连续两项均为text时，要进行合并处理
function normalizedChildren(children) {
	let newChildren = [];
	for (let i = 0; i < children.length; i++) {
		let child = children[i];
		if (child._isVNode) {
			if (child.key === null) {
				child.key = "|" + i;
			}
		} else {
			child = createTextVNode(child);
			child.key = "|" + i;
		}

		newChildren.push(child);
	}
	return newChildren;
}
