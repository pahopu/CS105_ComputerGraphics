import invert from "invert-color";

function updateCurrentGeometry(meshObject) {
	const geometry_option = document.getElementsByClassName("geometry-option")[0];
	if (meshObject.length > 0 && geometry_option.className.includes(" active")) {
		let currentSelect;
		if (meshObject.length === 1) currentSelect = meshObject[0];
		else
			currentSelect = meshObject.find(
				(obj) => obj.userData.isSelected === true
			);
		const list_icon = document.getElementsByClassName("sub-icon geometry");
		for (let icon of list_icon) {
			icon.className = icon.className.replace(" active", "");
			if (icon.alt === currentSelect.userData.type) {
				icon.className += " active";
			}
		}
	}
}

function updateCurrentMaterial(meshObject) {
	const material_option = document.getElementsByClassName("material-option")[0];
	if (meshObject.length > 0 && material_option.className.includes(" active")) {
		let currentSelect;
		if (meshObject.length === 1) currentSelect = meshObject[0];
		else
			currentSelect = meshObject.find(
				(obj) => obj.userData.isSelected === true
			);
		const list_icon = document.getElementsByClassName("sub-icon material");
		for (let icon of list_icon) {
			icon.className = icon.className.replace(" active", "");
			if (icon.alt === currentSelect.userData.typeMaterial) {
				icon.className += " active";
			}
		}
	}
}

function updateLight(active_transform = false) {
	const light_option = document.querySelectorAll(".sub-icon.light");
	const slider = document.querySelector(".wrapper.intensity");
	const slider_input = document.querySelector(".wrapper.intensity input");
	const slider_content = document.querySelector(
		".wrapper.intensity .slide-value"
	);

	slider.className = slider.className.replace(" active", "");

	const setting_light = ["Intensity", "Distance Light", "Translate Light"];

	if (active_transform) {
		light_option[light_option.length - 1].className = light_option[
			light_option.length - 1
		].className.replace(" active", "");
	} else {
		for (let light of light_option) {
			if (setting_light.some((el) => light.alt.includes(el))) {
				if (!window.hasLight) {
					light.className = light.className.replace(" active", "");
					light.className = light.className.replace(" not-active", "");
					light.className += " not-active";
				} else {
					light.className = light.className.replace(" not-active", "");
					if (
						light.alt === "Intensity" &&
						light.className.includes(" active")
					) {
						slider.className += " active";
						slider_content.innerHTML = slider_input.value / 10;
					}
				}
			} else {
				if (window.scene.getObjectByName(light.alt)) {
					if (!light.className.includes(" active")) {
						light.className += " active";
					}
				} else {
					light.className = light.className.replace(" active", "");
				}
			}
		}
	}
}

function updateCamera() {
	const camera_tool = document.querySelector(".camera-option.active");
	const camera_option_active = document.querySelector(
		".sub-icon.camera.active"
	);

	const wrapper = document.querySelector(".wrapper.camera");
	const slider = document.querySelector(".wrapper.camera input");
	const slider_content = document.querySelector(".wrapper.camera .slide-value");

	wrapper.className = wrapper.className.replace(" active", "");
	slider.className = slider.className.replace(" active", "");
	slider_content.className = slider_content.className.replace(" active", "");
	if (camera_tool && camera_option_active) {
		const min_value = { "Field of view": 0, Near: 0, Far: 1000 };
		const max_value = { "Field of view": 175, Near: 50, Far: 5000 };
		const current_value = {
			"Field of view": window.fov,
			Near: window.near,
			Far: window.far,
		};

		wrapper.className += " active";
		slider.className += " active";
		slider_content.className += " active";

		slider.min = min_value[camera_option_active.alt];
		slider.max = max_value[camera_option_active.alt];
		slider.value = current_value[camera_option_active.alt];

		slider_content.innerHTML = slider.value;
	}
}

function updateAnimation() {
	if (window.meshObject.length > 0) {
		const current_active = document.querySelector(
			".subtool.animation-option .option.active"
		);

		const ani_option = document.querySelectorAll(
			".subtool.animation-option .option"
		);

		if (current_active)
			current_active.className = current_active.className.replace(
				" active",
				""
			);

		let currentSelect = window.meshObject.find(
			(obj) => obj.userData.isSelected === true
		);

		if (currentSelect.userData.typeAni !== 0)
			ani_option[currentSelect.userData.typeAni - 1].className += " active";
	}
}

function updateColor() {
	const is_color_tool_active = document.querySelector(".icon-tool.cl.active");

	if (is_color_tool_active) {
		let light_color = document.querySelectorAll(".sub-icon.color")[1];
		light_color.className = light_color.className.replace(" not-active", "");

		if (!window.hasLight) {
			light_color.className = light_color.className.replace(" active", "");
			light_color.className += " not-active";
		}
	}

	const color_option_active = document.querySelector(".sub-icon.color.active");

	const all_color_picker = document.querySelectorAll(".color-picker");
	all_color_picker.forEach(
		(color_picker) =>
			(color_picker.className = color_picker.className.replace(" active", ""))
	);

	if (is_color_tool_active && color_option_active) {
		let class_picker = color_option_active.alt.includes("Object")
			? "object"
			: "light";

		const color_picker = document.querySelector(
			`.color-picker.${class_picker}`
		);
		color_picker.className += " active";
		const color_input = color_picker.querySelector("input[type=color]");
		const color_value = color_picker.querySelector(".color-value");

		let currentSelect = window.meshObject.find(
			(obj) => obj.userData.isSelected === true
		);

		// Set value and color of color picker relevant to selected
		let hex_value;
		if (class_picker === "object")
			hex_value = "#" + currentSelect.material.color.getHexString();
		else {
			hex_value = "#" + window.currentLight.color.getHexString();
		}
		color_input.value = hex_value;
		color_value.innerHTML = hex_value;
		color_value.style.color = invert(hex_value, true);
	}
}

export {
	updateCurrentGeometry,
	updateCurrentMaterial,
	updateLight,
	updateCamera,
	updateAnimation,
	updateColor,
};
