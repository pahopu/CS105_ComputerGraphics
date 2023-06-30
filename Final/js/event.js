import { updateCurrentGeometry, updateCurrentMaterial } from "./update";

const tools = document.querySelectorAll(".icon-tool");
const icons_geometry = document.querySelectorAll(".sub-icon");

tools.forEach((tool, index) => {
	tool.addEventListener("mouseenter", showTooltip);
	tool.addEventListener("mouseleave", hideTooltip);
	if (index < 3) tool.addEventListener("click", selectTransfrom);
	else tool.addEventListener("click", selectTool);
});

icons_geometry.forEach((icon) => {
	icon.addEventListener("mouseenter", showTooltip);
	icon.addEventListener("mouseleave", hideTooltip);
});

function selectTransfrom(event) {
	var current = document.getElementsByClassName("icon-tool transform active");
	const icon = event.target;
	let flag = false;
	if (current.length > 0) {
		if (current[0] === icon) flag = true;
		current[0].className = current[0].className.replace(" active", "");
	}
	if (!flag) {
		hideTooltip();
		icon.className += " active";
	}
}

function selectTool(event) {
	var current = document.getElementsByClassName("icon-tool normal active");
	const icon = event.target;
	let flag = false;

	const geometry_option = document.getElementsByClassName("geometry-option")[0];
	const material_option = document.getElementsByClassName("material-option")[0];
	const light_option = document.getElementsByClassName("light-option")[0];

	geometry_option.className = geometry_option.className.replace(" active", "");
	material_option.className = material_option.className.replace(" active", "");
	light_option.className = light_option.className.replace(" active", "");

	if (current.length > 0) {
		if (current[0] === icon) flag = true;
		current[0].className = current[0].className.replace(" active", "");
	}

	if (!flag) {
		hideTooltip();

		icon.className += " active";
		if (icon.alt === "Geometry") {
			geometry_option.className += " active";
			updateCurrentGeometry(window.meshObject);
		} else if (icon.alt === "Material") {
			material_option.className += " active";
			updateCurrentMaterial(window.meshObject);
		} else if (icon.alt === "Light") {
			light_option.className += " active";
		}
	}
}

function showTooltip(event) {
	const icon = event.target;

	if (
		icon.className.includes("active") &&
		!icon.className.includes(" geometry") &&
		!icon.className.includes(" material") &&
		!icon.className.includes(" light")
	)
		return;
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.innerHTML = icon.alt;

	const iconRect = icon.getBoundingClientRect();

	if (icon.className.includes(" geometry")) {
		tooltip.className += " geometry";
	} else if (icon.className.includes(" material")) {
		tooltip.className += " material";
	} else if (icon.className.includes(" light")) {
		tooltip.className += " light";
	}
	tooltip.style.top = iconRect.top + "px";
	tooltip.style.opacity = 1;
	tooltip.style.visibility = "visible";
}

function hideTooltip(event) {
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.className = tooltip.className.replace(" geometry", "");
	tooltip.className = tooltip.className.replace(" material", "");
	tooltip.className = tooltip.className.replace(" light", "");

	tooltip.style.opacity = 0;
	tooltip.style.visibility = "hidden";
}

// export { updateCurrentGeometry };
