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

export { updateCurrentGeometry, updateCurrentMaterial };
