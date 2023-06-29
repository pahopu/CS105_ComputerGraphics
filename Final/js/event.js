import { meshObject } from "./main";
import { updateCurrentGeometry } from "./update";

const tools = document.querySelectorAll(".icon-tool");
const icons_geometry = document.querySelectorAll(".icon-geometry");

tools.forEach((tool) => {
	tool.addEventListener("mouseenter", showTooltip);
	tool.addEventListener("mouseleave", hideTooltip);
	tool.addEventListener("click", selectTool);
});

icons_geometry.forEach((icon) => {
	icon.addEventListener("mouseenter", showTooltip);
	icon.addEventListener("mouseleave", hideTooltip);
});

function selectTool(event) {
	var current = document.getElementsByClassName("icon-tool active");
	const icon = event.target;
	let flag = false;

	const geometry_option = document.getElementsByClassName("geometry-option")[0];
	geometry_option.className = geometry_option.className.replace(" active", "");

	if (current.length > 0) {
		if (current[0] === icon) flag = true;
		const excludes = ["Translate", "Rotate", "Scale"];
		const isCurrentIncludes = excludes.some((el) =>
			current[0].alt.includes(el)
		);
		const isIconIncludes = excludes.some((el) => icon.alt.includes(el));

		if (
			!(
				(isCurrentIncludes && !isIconIncludes) ||
				(!isCurrentIncludes && isIconIncludes)
			)
		) {
			current[0].className = current[0].className.replace(" active", "");
		}
	}

	if (!flag) {
		hideTooltip();

		icon.className += " active";
		if (icon.alt === "Geometry") {
			const geometry_option =
				document.getElementsByClassName("geometry-option")[0];
			geometry_option.className += " active";
			updateCurrentGeometry(meshObject);
		}
	}
}

function showTooltip(event) {
	const icon = event.target;

	if (
		icon.className.includes("active") &&
		!icon.className.includes("-geometry")
	)
		return;
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.innerHTML = icon.alt;

	const iconRect = icon.getBoundingClientRect();

	if (icon.className.includes("-geometry")) {
		tooltip.className += " geometry";
	}
	tooltip.style.top = iconRect.top + "px";
	tooltip.style.opacity = 1;
	tooltip.style.visibility = "visible";
}

function hideTooltip(event) {
	const tooltip = document.getElementsByClassName("tool-tip")[0];

	tooltip.className = tooltip.className.replace(" geometry", "");

	tooltip.style.opacity = 0;
	tooltip.style.visibility = "hidden";
}

// export { updateCurrentGeometry };
