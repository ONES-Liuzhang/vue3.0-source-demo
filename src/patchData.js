export function patchData(el, key, prevValue, nextValue) {
	switch (key) {
		case "style":
			for (let k in nextValue) {
				el.style[k] = nextValue[k];
			}
			for (let k in prevValue) {
				if (!Object.prototype.hasOwnProperty.call(nextValue, k)) {
					el.style[k] = "";
				}
			}
			break;
		case "class":
			el.setAttribute("class", nextValue.class);
			break;
	}
}
