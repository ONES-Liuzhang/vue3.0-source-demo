import { render } from "../render.js";
import { h } from "../h.js";

const container = document.getElementById("container-props");

class ChildComponent {
	render() {
		return h("p", null, this.$props.text);
	}
}

// <div>
//      <ChildComponent :text="localText"></ChildComponent>
// </div>
class FatherComponent {
	localText = "props text";
	mounted() {
		setTimeout(() => {
			this.localText = "update text";
			this._update();
		}, 2000);
	}
	render() {
		return h(ChildComponent, {
			text: this.localText,
		});
	}
}

render(h(FatherComponent), container);
