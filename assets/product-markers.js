(function () {
	const productMarkers = (section) => {
		let parent = document.currentScript
			? document.currentScript.parentElement
			: section;

		let productsSelector = "";
		let markersSelector = ".js-product-markers__item";
		if (window.innerWidth >= 990) {
			productsSelector = ".product-markers__markers .product-markers__item-inner";
		} else {
			productsSelector = ".product-markers-for-mobile .product-markers__item-inner";
		}

		var products = parent?.querySelectorAll(productsSelector);
		var markers = parent?.querySelectorAll(markersSelector);

		if (parent) {
			markers.forEach((item) => {
				item.addEventListener("click", (event) => {
					event.stopPropagation();
					const index = item.dataset.index;
					item.classList.toggle("active");

					let otherMarkers = [...markers].filter(marker => marker !== item);
					let product = parent?.querySelector(
						`${productsSelector}[data-index="${index}"]`
					);
					let otherProducts = parent?.querySelectorAll(
						`${productsSelector}:not([data-index="${index}"])`
					);

					product.classList.toggle("active");
					otherProducts.forEach(elem => elem.classList.remove("active"));
					otherMarkers.forEach(marker => marker.classList.remove("active"));
					
					if (window.innerWidth >= 990) {
						parent
						.querySelector(".product-markers__markers")
						.classList.add("active");
					} else {
						parent
						.querySelector(".product-markers-for-mobile")
						.classList.add("active");
					}
				});
			});

			parent.querySelector(markersSelector).click();
		}

		document.addEventListener("click", (e) => {
			const parentClicked = e.target.closest(markersSelector);
			markers?.forEach((marker) => {
				if (parentClicked !== marker && !e.target.closest(productsSelector)) {
					marker.classList.remove("active");
					products?.forEach(product => product.classList.remove("active"));
				}
			});
		});
	};

	productMarkers();

	document.addEventListener("DOMContentLoaded", function () {
		productMarkers();

		document.addEventListener("shopify:section:load", function (section) {
			productMarkers(section.target);
		});
	});
})();
