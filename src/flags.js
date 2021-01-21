const VNodeFlags = {
	// 普通标签
	ELEMENT_HTML: 1,
	// svg
	ELEMENT_SVG: 1 << 1,

	// 普通有状态组件
	COMPONENT_STATEFUL_NORMAL: 1 << 2,
	// 需要被keep alive的组件
	COMPONENT_STATEFUL_SHOLD_KEEP_ALIVE: 1 << 3,
	// 已经被keep alive的组件
	COMPONENT_STATEFUL_KEEP_ALIVE: 1 << 4,
	// 函数式组件
	COMPONENT_FUNCTIONAL: 1 << 5,

	// 纯文本
	TEXT: 1 << 6,
	// Portal
	PORTAL: 1 << 7,
	// Fragment
	FRAGMENT: 1 << 8,
};

// 标签元素
VNodeFlags.ELEMENT = VNodeFlags.ELEMENT_HTML | VNodeFlags.ELEMENT_SVG;

// 有状态组件
VNodeFlags.COMPONENT_STATEFUL =
	VNodeFlags.COMPONENT_STATEFUL_NORMAL |
	VNodeFlags.COMPONENT_STATEFUL_SHOLD_KEEP_ALIVE |
	VNodeFlags.COMPONENT_STATEFUL_KEEP_ALIVE;
// 组件
VNodeFlags.COMPONENT =
	VNodeFlags.COMPONENT_FUNCTIONAL | VNodeFlags.COMPONENT_STATEFUL;

const ChildrenFlags = {
	// 未知的children
	UNKNOWN_CHILDREN: 0,
	// 没有children
	NO_CHILDREN: 1,
	// 单个VNode
	SINGLE_VNODE: 1 << 2,
	// 有key的VNode
	KEYED_VNODES: 1 << 3,
	// 没有key的VNode
	NONE_KEYED_VNODES: 1 << 4,
};

ChildrenFlags.MULTI_VNODES =
	ChildrenFlags.KEYED_VNODES | ChildrenFlags.NONE_KEYED_VNODES;

export { VNodeFlags, ChildrenFlags };
