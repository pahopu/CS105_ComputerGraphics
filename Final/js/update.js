import * as THREE from "three";

function updateCurrentGeometry(meshObject) {
	const geometry_option = document.getElementsByClassName("geometry-option")[0];
	if (meshObject.length > 0 && geometry_option.className.includes(" active")) {
		let currentSelect;
		if (meshObject.length === 1) currentSelect = meshObject[0];
		else
			currentSelect = meshObject.find(
				(obj) => obj.userData.isSelected === true
			);
		const list_icon = document.getElementsByClassName("sub-icon");
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
		const list_icon = document.getElementsByClassName("sub-icon");
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

	slider.className = slider.className.replace(" active", "");

	const setting_light = ["Intensity", "Color Light", "Translate Light"];

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
	const camera_option_active = document.querySelector(
		".sub-icon.camera.active"
	);
	if (camera_option_active) {
		const min_value = { "Field of view": 0, Near: 0, Far: 1000 };
		const max_value = { "Field of view": 175, Near: 50, Far: 5000 };
		const current_value = {
			"Field of view": window.fov,
			Near: window.near,
			Far: window.far,
		};
		const wrapper = document.querySelector(".wrapper.camera");
		const slider = document.querySelector(".wrapper.camera input");

		wrapper.className = wrapper.className.replace(" active", "");
		wrapper.className += " active";

		slider.min = min_value[camera_option_active.alt];
		slider.max = max_value[camera_option_active.alt];
		slider.value = current_value[camera_option_active.alt];
	}
}

export {
	updateCurrentGeometry,
	updateCurrentMaterial,
	updateLight,
	updateCamera,
};
