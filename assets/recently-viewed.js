(function () {
	const blockBreakpoints = {
		576: {
			slidesPerView: 2,
		},
		750: {
			slidesPerView: 3,
		},
		990: {
			slidesPerView: 2,
		},
		1440: {
			slidesPerView: 3,
		},
	};

	const sectionBreakpoints = {
		576: {
			slidesPerView: 2,
		},
		750: {
			slidesPerView: 3,
		},
		1200: {
			slidesPerView: 4,
		},
		1440: {
			slidesPerView: 5,
		},
		1600: {
			slidesPerView: 6,
		},
	};

	const initProductSlider = (sliders) => {
		sliders?.forEach((slider) => {
			new Swiper(slider, {
				pagination: {
					el: ".product-pagination .swiper-pagination",
					clickable: true
				},
				navigation: {
					nextEl: ".product-button-group .swiper-button-next",
					prevEl: ".product-button-group .swiper-button-prev",
				},
			});
		});
	};

	let recentlyViewedSlider = null;
	const initSlider = (container, slider) => {
		const slides = slider.querySelectorAll(".recently-viewed__item");
		const sliderWrapper = slider.querySelector(".recently-viewed__list");

		if (!sliderWrapper || !slides || !slides.length) return;

		const sliderTemplate = slider.dataset.template;
		const sliderLayout = slider.dataset.layout;
		const navigationWrapper = container.querySelector(
			'.js-recently-viewed-nav[data-nav-id="' + sliderTemplate + '"]'
		);
		const mobileColumns = Number(slider.dataset.mobileColumn || 1);

		const dir = document.querySelector('html').getAttribute("dir");

		let nextEl = navigationWrapper?.querySelector(".swiper-button-next") ?? null;
		let	prevEl = navigationWrapper?.querySelector(".swiper-button-prev") ?? null;

		if (dir === "rtl") {
			[nextEl, prevEl] = [prevEl, nextEl];
		}

		const breakpointsObj =
			sliderLayout === "block" ? blockBreakpoints : sectionBreakpoints;
		const sliderSettings = {
			slidesPerView: mobileColumns,
			spaceBetween: 8,
			speed: 800,
			allowTouchMove: true,
			mousewheel: {
				forceToAxis: true,
			},
			navigation: {
				nextEl: nextEl,
				prevEl: prevEl,
				disabledClass: "swiper-button-disabled",
			},
			breakpoints: {
				...breakpointsObj,
			},
		};

		slider.classList.add("swiper");
		sliderWrapper.classList.add("swiper-wrapper");
		slides.forEach((slide) => slide.classList.add("swiper-slide"));

		// init Product Sliders
		const productSlides = slider.querySelectorAll(".recently-viewed__item .product-card-js");
		if (productSlides?.length) {
			initProductSlider(productSlides);
		}

		recentlyViewedSlider = new Swiper(slider, sliderSettings);
	};

	const destroySlider = (slider) => {
		if (!slider) return;

		const sliderWrapper = slider.querySelector(".recently-viewed__list");
		const slides = slider.querySelectorAll(".recently-viewed__item");

		slider.classList.remove("swiper");
		if (sliderWrapper) sliderWrapper.classList.remove("swiper-wrapper");

		if (slides.length > 0) {
			slides.forEach((slide) => {
				slide.removeAttribute("style");
				slide.classList.remove("swiper-slide");
			});
		}

		slider.destroy(true, true);
	};

	const initRecentlyViewed = (section) => {
		const sliderContainer = section.querySelector(".recently-viewed");
		if (!sliderContainer) return;

		const sliders = sliderContainer.querySelectorAll(".js-recently-viewed");

		sliders.forEach((slider) => {
			if (slider?.swiper) {
				destroySlider(slider);
			}
			initSlider(sliderContainer, slider);
		});
	};

	const initSection = async (section) => {
		if (!section) {
			return;
		}

		const box = section.querySelector(".recently-viewed");
		if (!box) return;

		const STORAGE_KEY =
			window.recentlyViewed.storageKey || "__sm_theme_recently";
		const EXPIRATION_DAYS = window.recentlyViewed.expirationDays
			? Number(window.recentlyViewed.expirationDays)
			: 30;
		const dateNow = Date.now();

		const baseUrl = box.dataset.baseUrl;
		const currentProductId = box.dataset.currentProduct;

		const productsLimit = Number(box.dataset.productsLimit) || 6;
		let recentProducts = [];
		try {
			recentProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
		} catch (e) {
			console.error(`Incorrect value in local storage for "${STORAGE_KEY}"`);
		}

		if (currentProductId) {
			recentProducts = recentProducts.filter(
				(item) => item.productId !== currentProductId
			);
		}

		if (recentProducts.length === 0) {
			box.classList.remove("recently-viewed--loading");
			box.classList.add("recently-viewed--empty");
			return;
		}

		// filter by expiration time
		const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
		const validProducts = recentProducts.filter(
			(item) => dateNow - item.timestamp < expirationTime
		);

		// limit by section setting
		const limitedProducts = validProducts.slice(0, productsLimit);

		// get url with query
		const query = limitedProducts
			.filter((item) => item.productId)
			.map((item) => `id:${item.productId}`)
			.join("%20OR%20");

		const url = `${baseUrl}&q=${query}`;

		try {
			const response = await fetch(url);
			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");
			const sourceBox = doc?.querySelector(".recently-viewed");
			if (!sourceBox?.classList.contains("recently-viewed--search-perfomed")) {
				box.classList.add("recently-viewed--empty");
				return;
			}
			box.innerHTML = sourceBox.innerHTML;

			initRecentlyViewed(section);
			// animateProductCards(section);
		} catch (error) {
			console.error("Failed to fetch recently viewed products:", error);
			box.classList.add("recently-viewed--empty");
		} finally {
			box.classList.remove("recently-viewed--loading");
		}
	};

	initSection(document.currentScript.parentElement);

	document.addEventListener("shopify:section:load", function (event) {
		initSection(event.target);
	});
})();
