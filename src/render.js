import { VNodeFlags, ChildrenFlags } from "./flags.js";
import { createTextVNode } from "./h.js";
import { patchData } from "./patchData.js";

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;

export function render(vnode, container) {
	let prevVNode = container.vnode;
	if (prevVNode == null) {
		if (vnode) {
			// 初始化挂载
			mount(vnode, container);
			container.vnode = vnode;
		}
	} else if (vnode == null) {
		// prevVNode存在，vnode为空，移除dom
		const prevEl = prevVNode.el;
		container.removeChild(prevEl);
		container.vnode = null;
	} else {
		if (prevVNode !== vnode) {
			patch(prevVNode, vnode, container);
			container.vnode = vnode;
		}
	}
}

function patch(prevVNode, vnode, container, refNode) {
	const prevVNodeFlags = prevVNode.flags;
	const vnodeFlags = vnode.flags;
	if (!(prevVNodeFlags & vnodeFlags)) {
		// 标签类型不同直接替换
		// 优化：如果chilren相同，可以裁枝
		replaceVNode(prevVNode, vnode, container);
	} else if (vnodeFlags & VNodeFlags.ELEMENT) {
		patchElement(prevVNode, vnode, container, refNode);
	} else if (vnodeFlags & VNodeFlags.FRAGMENT) {
		patchFragment(prevVNode, vnode, container);
	} else if (vnodeFlags & VNodeFlags.PORTAL) {
		patchPortal(prevVNode, vnode, container);
	} else if (vnodeFlags & VNodeFlags.COMPONENT) {
		patchComponent(prevVNode, vnode, container, refNode);
	} else if (vnodeFlags & VNodeFlags.TEXT) {
		patchText(prevVNode, vnode);
	}
}

function replaceVNode(prevNode, vnode, container) {
	const el =
		typeof container === "string"
			? document.querySelector(container)
			: container;
	el.removeChild(prevNode.el);
	if (prevNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
		// 注销组件
		const instance = prevVNode.children;
		instance.unmounted && instance.unmounted();
	}
	mount(vnode, container);
}

function patchElement(prevVNode, nextVNode, container, refNode) {
	if (prevVNode.tag !== nextVNode.tag) {
		replaceVNode(prevVNode, vnode, container);
		return;
	}
	const el = (nextVNode.el = prevVNode.el);
	const prevData = prevVNode.data;
	const nextData = nextVNode.data;

	// 更新VNodeData
	if (nextData) {
		// 更新nextData中有的key对应的值
		for (let key in nextData) {
			const prevValue = prevData && prevData[key];
			const nextValue = nextData[key];
			patchData(el, key, prevValue, nextValue);
		}
	}
	if (prevData) {
		for (let key in prevData) {
			const prevValue = prevData[key];
			// 删除nextData中没有的key对应的属性
			if (!nextData.hasOwnProperty(key)) {
				patchData(el, key, prevValue, null);
			}
		}
	}

	container.insertBefore(el, refNode);

	// 更新children
	const { children: prevChildren, childrenFlags: prevChildFlags } = prevVNode;
	const { children: nextChildren, childrenFlags: nextChildFlags } = nextVNode;

	patchChildren(prevChildFlags, prevChildren, nextChildFlags, nextChildren, el);
}

function patchText(prevVNode, nextVNode) {
	const el = (nextVNode.el = prevVNode.el);
	if (prevVNode.children !== nextVNode.children) {
		el.nodeValue = nextVNode.children;
	}
}

function patchFragment(prevVNode, nextVNode, container) {
	patchChildren(
		prevVNode.childrenFlags,
		prevVNode.children,
		nextVNode.childrenFlags,
		nextVNode.children,
		container
	);
	switch (nextVNode.childFlags) {
		case ChildrenFlags.SINGLE_VNODE:
			nextVNode.el = nextVNode.children.el;
			break;
		case ChildrenFlags.NO_CHILDREN:
			nextVNode.el = prevVNode.el;
			break;
		default:
			nextVNode.el = nextVNode.children[0].el;
	}
}

function patchPortal(prevVNode, nextVNode, container) {
	const prevEl = prevVNode.tag;
	const nextEl = nextVNode.tag;
	if (prevEl == nextEl) {
		patchChildren(
			prevVNode.childrenFlags,
			prevVNode.children,
			nextVNode.childrenFlags,
			nextVNode.children,
			prevEl
		);
	} else {
		const { children, childrenFlags, tag } = prevVNode;
		let target = typeof tag === "string" ? document.querySelector(tag) : tag;
		switch (childrenFlags) {
			case ChildrenFlags.NO_CHILDREN:
				break;
			case ChildrenFlags.SINGLE_VNODE:
				target.removeChild(children.el);
				break;
			default:
				for (let i = 0; i < children.length; i++) {
					target.removeChild(children[i].el);
				}
				break;
		}
		// 重新挂载
		mount(nextVNode, container);
	}
	// portal的el是一个placeholder占位符，真实的挂载点是data.target
	nextVNode.el = prevVNode.el;
}

// 同组件的更新(prevVNode.tag === nextVNode.tag)
function patchComponent(prevVNode, nextVNode, container) {
	if (prevVNode.tag !== nextVNode.tag) {
		replaceVNode(prevVNode, nextVNode, container);
	}
	// 有状态组件更新
	else if (nextVNode.flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
		const instance = (nextVNode.children = prevVNode.children);
		// 更新$props
		instance.$props = nextVNode.data;
		// 调用update方法，更新$vnode
		instance._update();
	}
	// 函数式组件更新
	else if (nextVNode.flags & VNodeFlags.COMPONENT_FUNCTIONAL) {
		const handle = (nextVNode.handle = prevVNode.handle);
		handle.prev = prevVNode;
		handle.next = nextVNode;
		handle.container = container;

		handle._update();
	}
}

function patchChildren(
	prevChildFlags,
	prevChildren,
	nextChildFlags,
	nextChildren,
	container
) {
	const el =
		typeof container === "string"
			? document.querySelector(container)
			: container;
	switch (prevChildFlags) {
		case ChildrenFlags.NO_CHILDREN:
			mountChildren(nextChildren, nextChildFlags, el);
			break;
		case ChildrenFlags.SINGLE_VNODE:
			switch (nextChildFlags) {
				case ChildrenFlags.NO_CHILDREN:
					el.removeChild(prevChildren.el);
					break;
				case ChildrenFlags.SINGLE_VNODE:
					patch(prevChildren, nextChildren, container);
					break;
				default:
					el.removeChild(prevChildren.el);
					for (let i = 0; i < nextChildren.length; i++) {
						mount(nextChildren[i], container);
					}
					break;
			}
			break;
		default:
			// TODO diff算法
			let lastIndex = -1;
			for (let i = 0; i < nextChildren.length; i++) {
				let nextVNode = nextChildren[i];
				let _isExist = false;
				for (let j = 0; j < prevChildren.length; j++) {
					let prevVNode = prevChildren[j];
					if (prevVNode.key == nextVNode.key) {
						_isExist = true;
						nextVNode.el = prevVNode.el;
						if (j < lastIndex) {
							let refNode = nextChildren[i - 1].el.nextSibling;
							// 更新VNodeData
							patch(prevVNode, nextVNode, container, refNode);
						} else {
							lastIndex = j;
						}
					}
				}
				if (!_isExist) {
					let refNode =
						i > 0 ? nextChildren[i - 1].el.nextSibling : prevChildren[0].el;
					mount(nextVNode, container, null, refNode);
				}
			}
			// 移除不存在的元素
			for (let i = 0; i < prevChildren.length; i++) {
				const prevVNode = prevChildren[i];

				const has = nextChildren.find((item) => item.key == prevVNode.key);
				if (!has) {
					container.removeChild(prevVNode.el);
				}
			}
			break;
	}
}

function mount(vnode, container, isSVG, refNode) {
	const { flags } = vnode;
	if (flags & VNodeFlags.ELEMENT) {
		mountElement(vnode, container, isSVG, refNode);
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

function mountChildren(children, childrenFlags, container) {
	switch (childrenFlags) {
		case ChildrenFlags.NO_CHILDREN:
			break;
		case ChildrenFlags.SINGLE_VNODE:
			mount(children, container);
			break;
		default:
			for (let i = 0; i < children.length; i++) {
				mount(children[i], container);
			}
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

	// Q: 为什么要挂载一个占位节点到container
	// A: 如果Portal更新的时候变成了别的节点，需要保存parentNode来挂载新的VNode
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

// 挂载有状态组件
function mountStatefulComponent(vnode, container) {
	// 组件data里的children会被当作slots
	const instance = (vnode.children = new vnode.tag());
	// TODO 处理data $props和$attrs，先简单把data赋值给instance.$props
	instance.$props = vnode.data;
	instance._vnode = vnode;

	// 定义组件实例的更新函数
	instance._update = () => {
		if (instance._mounted) {
			// 1.拿到旧的VNode
			const prevVNode = instance.$vnode;
			// 2.执行render拿到现在的VNode, 更新instance.$vnode
			const nextVNode = (instance.$vnode = instance.render());
			// 3.执行patch
			// Q: 为什么不直接使用container，而是拿pervVNode.el.parentNode
			// Q: container和prevVNode.el.parentNode相等吗？如果不相等，什么情况下会不相等？
			patch(prevVNode, nextVNode, prevVNode.el.parentNode);
		} else {
			instance.$vnode = instance.render();
			mount(instance.$vnode, container);
			instance.$el = vnode.el = instance.$vnode.el;
			// 	执行mounted
			instance.mounted && instance.mounted();
			instance._mounted = true;
		}
	};

	instance._update();
}

function mountFunctionalComponent(vnode, container) {
	vnode.handle = {
		prev: null,
		next: vnode,
		container: container,
		_update() {
			const props = this.next.data;
			if (this.prev) {
				// update
				const prevVNode = this.prev;
				const nextVNode = this.next;
				const prevTree = prevVNode.children;
				const nextTree = (nextVNode.children = nextVNode.tag(props));
				patch(prevTree, nextTree, container);
				nextTree.el = prevTree.el;
			} else {
				const $vnode = (this.next.children = this.next.tag(props));
				mount($vnode, this.container);
				this.next.el = $vnode.el;
			}
		},
	};
	vnode.handle._update();
}

// mount函数最终会收敛到mountElement
function mountElement(vnode, container, isSVG, refNode) {
	const { tag, children, data, childrenFlags } = vnode;
	isSVG = isSVG || tag === "svg";
	let el = isSVG ? document.createElementNS(tag) : document.createElement(tag);

	// 处理data
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

	// 递归遍历children
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
	container.insertBefore(el, refNode);
}

function mountText(vnode, container) {
	const el = document.createTextNode(vnode.children);
	vnode.el = el;
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
