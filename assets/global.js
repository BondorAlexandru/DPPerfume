const sliderInit = (isUpdate) => {
	if (
		document.querySelectorAll(".js-media-list") &&
		document.querySelectorAll(".js-media-list").length > 0
	) {
		document.querySelectorAll(".js-media-list").forEach((elem, index) => {
			const direction = elem.dataset.direction;
			const galleryType = elem.dataset.galleryType;

			let mousewheel = true;
			if (direction == "horizontal") {
				mousewheel = false;
			}

			const directionDesc = elem.dataset.direction_desc;
			const sliderType = elem.dataset.sliderType;

			let mousewheel_desc = true;
			if (directionDesc == "horizontal") {
				mousewheel_desc = false;
			}

			let defaultConfigs = {
				slidesPerView: 1,
				spaceBetween: 0,
			}
			if (galleryType == 'full_horizontal_slider') {
				defaultConfigs = {
					slidesPerView: window.innerWidth < 750 ? 1 : 1.1,
					spaceBetween: 10,
				}
			}

			let slider = new Swiper(elem, {
				...defaultConfigs,
				autoHeight: true,
				mousewheel: {
					enabled: mousewheel,
				},
				direction: direction,
				speed: 500,
				//loop: false,
				//observeParents: true,
				//freeMode: {
				//	enabled: !!elem
				//		.closest(".product__outer")
				//		.classList.contains("product__outer--multiple-top"),
				//	sticky: true,
				//},
				breakpoints: {
					750: {
						mousewheel: {
							enabled: mousewheel_desc,
						},
						direction: directionDesc,
					},
				},
				navigation: {
					nextEl: ".product .product__slider-nav .swiper-button-next",
					prevEl: ".product .product__slider-nav .swiper-button-prev",
				},
				pagination: {
					el: ".product .product__pagination",
					type: "bullets",
					clickable: true,
				},
				thumbs: {
					swiper: elem.nextElementSibling.querySelector(".js-media-sublist")
						? elem.nextElementSibling.querySelector(".js-media-sublist").swiper
						: "",
				},
				on: {
					//afterInit: function (swiper) {
					//	if (document.querySelector(".product__outer--multiple-top")) {
					//		document
					//			.querySelectorAll(".product__media-toggle")
					//			.forEach((elem, index) => {
					//				elem.addEventListener("click", (e) => {
					//					var target = e.currentTarget;

					//					if (
					//						document.querySelector(".js-popup-slider") &&
					//						document.querySelector(".js-popup-slider").swiper
					//					) {
					//						document
					//							.querySelector(".js-popup-slider")
					//							.swiper.slideTo(index);
					//					}
					//				});
					//			});
					//	}
					//},
					slideChangeTransitionStart: function () {
						if (document.querySelector(".js-media-sublist")) {
							document
								.querySelector(".js-media-sublist")
								.swiper.slideTo(
									document.querySelector(".js-media-list").swiper.activeIndex
								);
						}
					},
					slideChange: function () {
						window.pauseAllMedia();
						this.params.noSwiping = false;

						//if (
						//	document.querySelector(".js-popup-slider") &&
						//	document.querySelector(".js-popup-slider").swiper &&
						//	!document.querySelector(".product__outer--multiple-top")
						//) {
						//	document
						//		.querySelector(".js-popup-slider")
						//		.swiper.slideTo(this.activeIndex);
						//}
					},
					slideChangeTransitionEnd: function () {
						if (this.slides[this.activeIndex].querySelector("model-viewer")) {
							this.slides[this.activeIndex]
								.querySelector(".shopify-model-viewer-ui__button--poster")
								.removeAttribute("hidden");
						}
					},
					touchStart: function () {
						if (this.slides[this.activeIndex].querySelector("model-viewer")) {
							if (
								!this.slides[this.activeIndex]
									.querySelector("model-viewer")
									.classList.contains("shopify-model-viewer-ui__disabled")
							) {
								this.params.noSwiping = true;
								this.params.noSwipingClass = "swiper-slide";
							} else {
								this.params.noSwiping = false;
							}
						}
					},
				},
			});

			//if (sliderType === "main-product") {
			//	optimizingVisibleSliderElements(
			//		elem,
			//		".product__media-item.swiper-slide"
			//	);
			//}

			if (isUpdate) {
				setTimeout(function () {
					slider.update();
				}, 400);
			}
		});
	}
};

const sliderDestroy = (section) => {
	if (
		document.querySelectorAll('.js-media-list') &&
		document.querySelectorAll('.js-media-list').length > 0
	) {
		document.querySelectorAll('.js-media-list').forEach((elem) => {
			const swiperWrapper = elem.querySelector('.js-media-wrapper')
			const swiperSlides = elem.querySelectorAll('.js-media-item')

			if (!swiperWrapper || !swiperSlides) return
			if (!elem?.swiper) return

			elem.swiper.destroy(true, true)

			swiperWrapper.classList.remove('swiper')
			swiperWrapper.classList.remove('swiper-wrapper')

			swiperSlides.forEach((slide) => {
				slide.removeAttribute('style')
				slide.classList.remove('swiper-slide')
			})
		})
	}
}

//function forceUpdateSwiperHeight(slider) {
//	const activeSlide = slider.slides[slider.activeIndex];
//	if (activeSlide) {
//		const height = activeSlide.querySelector(".product__media").offsetHeight;

//		slider.el.style.height = height + "px";
//		slider.wrapperEl.style.height = height + "px";
//	}
//}

function forceUpdateSwiperHeight() {
	const sliders = document.querySelectorAll(".js-media-list");
	sliders.forEach((sliderEl) => {
		const swiperInstance = sliderEl.swiper;

		if (swiperInstance && swiperInstance.slides) {
			const activeSlide = swiperInstance.slides[swiperInstance.activeIndex];
			if (activeSlide) {
				const media = activeSlide.querySelector(".product__media");

				if (media) {
					const height = media.offsetHeight;
					swiperInstance.wrapperEl.style.height = height + "px";
				}
			}
		}
	});
}

window.addEventListener("resize", () => {
	setTimeout(function () {
		forceUpdateSwiperHeight();
	}, 100);
});

const subSliderInit = (isUpdate) => {
	if (
		document.querySelectorAll(".js-media-sublist") &&
		document.querySelectorAll(".js-media-sublist").length > 0
	) {
		document.querySelectorAll(".js-media-sublist").forEach((elem, index) => {
			if (index >= 1) return;

			const direction = elem.dataset.direction;
			const sliderType = elem.dataset.sliderType;

			let subSlider = new Swiper(elem, {
				slidesPerView: "auto",
				direction: direction,
				freeMode: false,
				watchSlidesProgress: true,
				watchSlidesVisibility: true,
				autoHeight: true,
				//loop: false,
				//observeParents: true,
				on: {
					afterInit: function () {
						//this.params.slidesPerView = this.slides.length === 2 ? 2 : 3;
					},
					touchEnd: function (s, e) {
						let range = 5;
						let diff = (s.touches.diff = s.isHorizontal()
							? s.touches.currentX - s.touches.startX
							: s.touches.currentY - s.touches.startY);
						if (diff < range || diff > -range) s.allowClick = true;
					},
				},
				//transitionStart: function () {
				//	document
				//		.querySelector(".js-media-list")
				//		.swiper.slideTo(
				//			document.querySelector(".js-media-sublist").swiper.activeIndex,
				//		);
				//},
				//breakpoints: {
				//	576: {
				//		direction: "vertical",
				//		slidesPerView: "auto",
				//	},
				//},
			});

			const sliderResizeObserve = new ResizeObserver((entries) => {
				const [entry] = entries;
				setTimeout(() => {
					const sliders = document.querySelectorAll(".js-media-list");
					const thumbs = document.querySelectorAll(".product__media-sublist");
					if (sliders.length > 0 && thumbs.length > 0) {
						if (index >= 0 && index < sliders.length) {
							const sliderHeight =
								sliders[index].getBoundingClientRect().height;
							thumbs[index].style.height = `${sliderHeight - 1}px`;
						}
					}
				}, 400);
			});

			if (document.querySelector(".product-section"))
				sliderResizeObserve.observe(document.querySelector(".product-section"));

			//if (sliderType === "sub-product") {
			//	optimizingVisibleSliderElements(
			//		elem,
			//		".product__media-subitem.swiper-slide"
			//	);
			//}

			if (isUpdate) {
				setTimeout(function () {
					subSlider.update();
				}, 800);
			}
		});
	}
};

const subSliderDestroy = () => {
	if (
		document.querySelectorAll('.js-media-sublist') &&
		document.querySelectorAll('.js-media-sublist').length > 0
	) {
		document.querySelectorAll('.js-media-sublist').forEach((elem) => {
			if (!elem?.swiper) return;

			const direction = elem.dataset.direction;
			const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
			if (isIOS && direction === "vertical" && window.innerWidth < 750) {
				return;
			}

			elem.swiper.destroy(true, true);
		});
	}
}

function optimizingVisibleSliderElements(sliderElement, sliderItemClass) {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.style.visibility = "visible";
				} else {
					entry.target.style.visibility = "hidden";
				}
			});
		},
		{
			root: null,
			rootMargin: "0px",
			threshold: 0.5,
		}
	);

	sliderElement.querySelectorAll(sliderItemClass).forEach((slide) => {
		observer.observe(slide);
	});
}

const quickAddsliderInit = (isUpdate) => {
	if (
		document.querySelectorAll(".js-media-list") &&
		document.querySelectorAll(".js-media-list").length > 0
	) {
		document.querySelectorAll(".js-media-list").forEach((elem, index) => {
			let slider = new Swiper(elem, {
				slidesPerView: 1,
				spaceBetween: 0,
				autoHeight: true,
				speed: 500,
				direction: "horizontal",
				navigation: {
					nextEl: ".product .product__slider-nav .swiper-button-next",
					prevEl: ".product .product__slider-nav .swiper-button-prev",
				},
				pagination: {
					el: ".product .product__pagination",
					type: "bullets",
					clickable: true,
				},
				on: {
					// afterInit: function (swiper) {
					// 	if (document.querySelector(".product__outer--multiple-top")) {
					// 		document
					// 			.querySelectorAll(".product__media-toggle")
					// 			.forEach((elem, index) => {
					// 				elem.addEventListener("click", (e) => {
					// 					var target = e.currentTarget;

					// 					if (
					// 						document.querySelector(".js-popup-slider") &&
					// 						document.querySelector(".js-popup-slider").swiper
					// 					) {
					// 						document
					// 							.querySelector(".js-popup-slider")
					// 							.swiper.slideTo(index);
					// 					}
					// 				});
					// 			});
					// 	}
					// },
					// slideChangeTransitionStart: function () {
					// 	if (document.querySelector(".js-media-sublist")) {
					// 		document
					// 			.querySelector(".js-media-sublist")
					// 			.swiper.slideTo(
					// 				document.querySelector(".js-media-list").swiper.activeIndex,
					// 			);
					// 	}
					// },
					slideChange: function () {
						window.pauseAllMedia();
						this.params.noSwiping = false;

						// if (
						// 	document.querySelector(".js-popup-slider") &&
						// 	document.querySelector(".js-popup-slider").swiper &&
						// 	!document.querySelector(".product__outer--multiple-top")
						// ) {
						// 	document
						// 		.querySelector(".js-popup-slider")
						// 		.swiper.slideTo(this.activeIndex);
						// }
					},
					slideChangeTransitionEnd: function () {
						if (this.slides[this.activeIndex].querySelector("model-viewer")) {
							this.slides[this.activeIndex]
								.querySelector(".shopify-model-viewer-ui__button--poster")
								.removeAttribute("hidden");
						}
					},
					touchStart: function () {
						if (this.slides[this.activeIndex].querySelector("model-viewer")) {
							if (
								!this.slides[this.activeIndex]
									.querySelector("model-viewer")
									.classList.contains("shopify-model-viewer-ui__disabled")
							) {
								this.params.noSwiping = true;
								this.params.noSwipingClass = "swiper-slide";
							} else {
								this.params.noSwiping = false;
							}
						}
					},
				},
			});

			if (isUpdate) {
				setTimeout(function () {
					slider.update();
				}, 800);
			}
		});
	}
};

const popupSliderInit = (isUpdate) => {
	if (document.querySelector(".js-popup-slider")) {
		//let popupSlider = new Swiper(document.querySelector(".js-popup-slider"), {
		//	slidesPerView: 1,
		//	//navigation: {
		//	//	nextEl: ".product-media-modal .product__slider-nav .swiper-button-next",
		//	//	prevEl: ".product-media-modal .product__slider-nav .swiper-button-prev",
		//	//},
		//	//pagination: {
		//	//	el: ".product-media-modal .product__pagination",
		//	//	type: "bullets",
		//	//	clickable: true,
		//	//},
		//	on: {
		//		afterInit: function () {
		//			if (
		//				document.querySelector(
		//					".product__outer--static-multicolumns-aside"
		//				) ||
		//				document.querySelector(".product__outer--static-column-aside")
		//			) {
		//				document
		//					.querySelectorAll(".product__media-list .product__media-toggle")
		//					.forEach((elem, index) => {
		//						elem.addEventListener("click", (e) => {
		//							if (
		//								document.querySelector(".js-popup-slider") &&
		//								document.querySelector(".js-popup-slider").swiper
		//							) {
		//								document
		//									.querySelector(".js-popup-slider")
		//									.swiper.slideTo(index);
		//							}
		//						});
		//					});
		//			}
		//		},
		//		slideChange: function () {
		//			window.pauseAllMedia();
		//			this.params.noSwiping = false;
		//			document
		//				.querySelector(".product-media-modal__content")
		//				.classList.remove("zoom");
		//		},
		//		touchMove: function () {
		//			document
		//				.querySelector(".product-media-modal__content")
		//				.classList.remove("zoom");
		//		},
		//		slideChangeTransitionEnd: function () {
		//			if (this.slides[this.activeIndex].querySelector("model-viewer")) {
		//				this.slides[this.activeIndex]
		//					.querySelector(".shopify-model-viewer-ui__button--poster")
		//					.removeAttribute("hidden");
		//			}
		//		},
		//		touchStart: function () {
		//			if (this.slides[this.activeIndex].querySelector("model-viewer")) {
		//				if (
		//					!this.slides[this.activeIndex]
		//						.querySelector("model-viewer")
		//						.classList.contains("shopify-model-viewer-ui__disabled")
		//				) {
		//					this.params.noSwiping = true;
		//					this.params.noSwipingClass = "swiper-slide";
		//				} else {
		//					this.params.noSwiping = false;
		//				}
		//			}
		//		},
		//	},
		//});

		if (isUpdate) {
			setTimeout(function () {
				//popupSlider.update();
			}, 800);
		}
	}
};

(function () {
	const sidebar = () => {
		let pageNav = $(".product__media-sublist__sidebar-nav");

		if (pageNav.length > 0) {
			let pageNavList = pageNav.find("a");
			let adminBarHeight = 0;

			let headings = [];
			for (let i = 0; i < pageNavList.length; i++) {
				headings[i] = $($(pageNavList[i]).attr("href"));
			}

			$(pageNavList[0]).parent().addClass("active");

			pageNavList.on("click", function (e) {
				e.preventDefault();

				const targetId = $(this).attr("href");
				const targetElement = $(targetId);

				if (targetElement.length) {
					$(".product-media-modal__dialog").animate(
						{
							scrollTop:
								targetElement.position().top +
								$(".product-media-modal__dialog").scrollTop(),
						},
						100
					);
				}
			});

			$(".product-media-modal__dialog").on("scroll", function () {
				for (let i = headings.length - 1; i >= 0; i--) {
					if ($(headings[i]).length > 0) {
						if (
							$(headings[i]).offset().top - 50 <=
							$(window).scrollTop() + adminBarHeight
						) {
							if (!$(pageNavList[i]).parent().hasClass("active")) {
								let hasActiveItem = false;
								for (let j = i; j < headings.length; j++) {
									if ($(pageNavList[j]).parent().hasClass("active")) {
										hasActiveItem = true;
									}
								}

								if (!hasActiveItem) {
									$(pageNavList[i]).parent().addClass("active");
								}
							} else {
								for (let j = 0; j < i; j++) {
									$(pageNavList[j]).parent().removeClass("active");
								}
							}
						} else {
							if (i !== 0) {
								$(pageNavList[i]).parent().removeClass("active");
							}
						}
					}
				}
			});
		}
	};

	document.addEventListener("DOMContentLoaded", function () {
		sidebar();
		document.addEventListener("shopify:section:load", function () {
			sidebar();
		});
	});
})();

if (navigator.userAgent.indexOf("iPhone") > -1) {
	document
		.querySelector("[name=viewport]")
		.setAttribute(
			"content",
			"width=device-width, initial-scale=1, maximum-scale=1"
		);
}

function getFocusableElements(container) {
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
		)
	);
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
	summary.setAttribute("role", "button");
	summary.setAttribute("aria-expanded", "false");

	if (summary.nextElementSibling.getAttribute("id")) {
		summary.setAttribute("aria-controls", summary.nextElementSibling.id);
	}

	summary.addEventListener("click", (event) => {
		event.currentTarget.setAttribute(
			"aria-expanded",
			!event.currentTarget.closest("details").hasAttribute("open")
		);
	});

	if (summary.closest("header-drawer")) return;
	summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

function onKeyUpEscape(event) {
	if (event.code.toUpperCase() !== "ESCAPE") return;

	const openDetailsElement = event.target.closest("details[open]");
	if (!openDetailsElement) return;

	const summaryElement = openDetailsElement.querySelector("summary");
	openDetailsElement.removeAttribute("open");
	summaryElement.setAttribute("aria-expanded", false);
	summaryElement.focus();
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
	var elements = getFocusableElements(container);
	var first = elements[0];
	var last = elements[elements.length - 1];

	removeTrapFocus();

	trapFocusHandlers.focusin = (event) => {
		if (
			event.target !== container &&
			event.target !== last &&
			event.target !== first
		)
			return;

		document.addEventListener("keydown", trapFocusHandlers.keydown);
	};

	trapFocusHandlers.focusout = function () {
		document.removeEventListener("keydown", trapFocusHandlers.keydown);
	};

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault();
			first.focus();
		}

		//  On the first focusable element and tab backward, focus the last element.
		if (
			(event.target === container || event.target === first) &&
			event.shiftKey
		) {
			event.preventDefault();
			last.focus();
		}
	};

	document.addEventListener("focusout", trapFocusHandlers.focusout);
	document.addEventListener("focusin", trapFocusHandlers.focusin);

	elementToFocus && elementToFocus.focus();
}

function pauseAllMedia() {
	document
		.querySelectorAll(".product__media-list .js-youtube")
		.forEach((video) => {
			video.contentWindow.postMessage(
				'{"event":"command","func":"' + "pauseVideo" + '","args":""}',
				"*"
			);
		});
	document
		.querySelectorAll(".product__media-list .js-vimeo")
		.forEach((video) => {
			video.contentWindow.postMessage('{"method":"pause"}', "*");
		});
	document
		.querySelectorAll(".product__media-list video")
		.forEach((video) => video.pause());
	document
		.querySelectorAll(".product__media-list product-model")
		.forEach((model) => {
			if (model.modelViewerUI) model.modelViewerUI.pause();
		});
}

function removeTrapFocus(elementToFocus = null) {
	document.removeEventListener("focusin", trapFocusHandlers.focusin);
	document.removeEventListener("focusout", trapFocusHandlers.focusout);
	document.removeEventListener("keydown", trapFocusHandlers.keydown);

	if (elementToFocus && !elementToFocus.classList.contains("card-focused"))
		elementToFocus.focus();
}

class QuantityInput extends HTMLElement {
	constructor() {
		super();
		this.input = this.querySelector("input");
		this.changeEvent = new Event("change", { bubbles: true });

		this.querySelectorAll("button").forEach((button) => {
			this.setMinimumDisable();

			button.addEventListener("click", this.onButtonClick.bind(this));
		});

		var eventList = ["paste", "input"];

		for (event of eventList) {
			this.input.addEventListener(event, function (e) {
				const numberRegex = /^0*?[1-9]\d*$/;

				if (
					numberRegex.test(e.currentTarget.value) ||
					e.currentTarget.value === ""
				) {
					e.currentTarget.value;
				} else {
					e.currentTarget.value = 1;
				}

				if (e.currentTarget.value === 1 || e.currentTarget.value === "") {
					this.previousElementSibling.classList.add("disabled");
				} else {
					this.previousElementSibling.classList.remove("disabled");
				}
			});
		}

		this.input.addEventListener("focusout", function (e) {
			if (e.currentTarget.value === "") {
				e.currentTarget.value = 1;
			}
		});
	}

	setMinimumDisable() {
		if (this.input.value == 1) {
			this.querySelector('button[name="minus"]').classList.add("disabled");
		} else {
			this.querySelector('button[name="minus"]').classList.remove("disabled");
		}
	}

	onButtonClick(event) {
		event.preventDefault();
		const previousValue = this.input.value;

		event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
		if (previousValue !== this.input.value)
			this.input.dispatchEvent(this.changeEvent);

		this.setMinimumDisable();
	}
}

customElements.define("quantity-input", QuantityInput);

function debounce(fn, wait) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(this, args), wait);
	};
}

function throttle(func, delay) {
	let lastTime = 0;

	return function (...args) {
		const now = Date.now();

		if (now - lastTime >= delay) {
			func.apply(this, args);
			lastTime = now;
		}
	};
}

const serializeForm = (form) => {
	const obj = {};
	const formData = new FormData(form);
	for (const key of formData.keys()) {
		obj[key] = formData.get(key);
	}
	return JSON.stringify(obj);
};

function fetchConfig(type = "json") {
	return {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: `application/${type}`,
		},
	};
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
	window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
	return function () {
		return fn.apply(scope, arguments);
	};
};

Shopify.setSelectorByValue = function (selector, value) {
	for (var i = 0, count = selector.options.length; i < count; i++) {
		var option = selector.options[i];
		if (value == option.value || value == option.innerHTML) {
			selector.selectedIndex = i;
			return i;
		}
	}
};

Shopify.addListener = function (target, eventName, callback) {
	target.addEventListener
		? target.addEventListener(eventName, callback, false)
		: target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
	options = options || {};
	var method = options["method"] || "post";
	var params = options["parameters"] || {};

	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);

	for (var key in params) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
	country_domid,
	province_domid,
	options
) {
	this.countryEl = document.getElementById(country_domid);
	this.provinceEl = document.getElementById(province_domid);
	this.provinceContainer = document.getElementById(
		options["hideElement"] || province_domid
	);

	Shopify.addListener(
		this.countryEl,
		"change",
		Shopify.bind(this.countryHandler, this)
	);

	this.initCountry();
	this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
	initCountry: function () {
		var value = this.countryEl.getAttribute("data-default");
		Shopify.setSelectorByValue(this.countryEl, value);
		this.countryHandler();
	},

	initProvince: function () {
		var value = this.provinceEl.getAttribute("data-default");
		if (value && this.provinceEl.options.length > 0) {
			Shopify.setSelectorByValue(this.provinceEl, value);
		}
	},

	countryHandler: function (e) {
		var opt = this.countryEl.options[this.countryEl.selectedIndex];
		var raw = opt?.getAttribute("data-provinces");
		var provinces = JSON.parse(raw || "{}");

		this.clearOptions(this.provinceEl);
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = "none";
		} else {
			for (var i = 0; i < provinces.length; i++) {
				var opt = document.createElement("option");
				opt.value = provinces[i][0];
				opt.innerHTML = provinces[i][1];
				this.provinceEl.appendChild(opt);
			}

			this.provinceContainer.style.display = "";
		}
	},

	clearOptions: function (selector) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild);
		}
	},

	setOptions: function (selector, values) {
		for (var i = 0, count = values.length; i < values.length; i++) {
			var opt = document.createElement("option");
			opt.value = values[i];
			opt.innerHTML = values[i];
			selector.appendChild(opt);
		}
	},
};

class MenuDrawer extends HTMLElement {
	constructor() {
		super();

		this.mainDetailsToggle = this.querySelector("details");
		const summaryElements = this.querySelectorAll("summary");
		this.addAccessibilityAttributes(summaryElements);

		if (navigator.platform === "iPhone")
			document.documentElement.style.setProperty(
				"--viewport-height",
				`${window.innerHeight}px`
			);

		this.addEventListener("keyup", this.onKeyUp.bind(this));
		this.addEventListener("focusout", this.onFocusOut.bind(this));
		this.bindEvents();
	}

	bindEvents() {
		this.querySelectorAll("summary").forEach((summary) =>
			summary.addEventListener("click", this.onSummaryClick.bind(this))
		);
		this.querySelectorAll("button").forEach((button) => {
			if (this.querySelector(".toggle-scheme-button") === button) return;
			if (this.querySelector(".header__localization-button") === button) return;
			if (this.querySelector("button.header__localization-button") === button)
				return;
			if (
				this.querySelector("button.header__localization-lang-button") === button
			)
				return;
			button.addEventListener("click", this.onCloseButtonClick.bind(this));
		});
	}

	addAccessibilityAttributes(summaryElements) {
		summaryElements.forEach((element) => {
			element.setAttribute("role", "button");
			element.setAttribute("aria-expanded", false);
			element.setAttribute("aria-controls", element.nextElementSibling.id);
		});
	}

	onKeyUp(event) {
		if (event.code.toUpperCase() !== "ESCAPE") return;

		const openDetailsElement = event.target.closest("details[open]");
		if (!openDetailsElement) return;

		openDetailsElement === this.mainDetailsToggle
			? this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary"))
			: this.closeSubmenu(openDetailsElement);
	}

	onSummaryClick(event) {
		const summaryElement = event.currentTarget;
		const detailsElement = summaryElement.parentNode;
		const isOpen = detailsElement.hasAttribute("open");

		if (detailsElement === this.mainDetailsToggle) {
			if (isOpen) event.preventDefault();
			isOpen
				? this.closeMenuDrawer(summaryElement)
				: this.openMenuDrawer(summaryElement);
		} else {
			trapFocus(
				summaryElement.nextElementSibling,
				detailsElement.querySelector("button")
			);

			setTimeout(() => {
				detailsElement.classList.add("menu-opening");
			});
		}
	}

	openMenuDrawer(summaryElement) {
		setTimeout(() => {
			this.mainDetailsToggle.classList.add("menu-opening");
		});
		summaryElement.setAttribute("aria-expanded", true);
		trapFocus(this.mainDetailsToggle, summaryElement);
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
	}

	closeMenuDrawer(event, elementToFocus = false) {
		if (event !== undefined) {
			this.mainDetailsToggle.classList.remove("menu-opening");
			this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
				details.removeAttribute("open");
				details.classList.remove("menu-opening");
			});
			this.mainDetailsToggle
				.querySelector("summary")
				.setAttribute("aria-expanded", false);
			document.body.classList.remove(
				`overflow-hidden-${this.dataset.breakpoint}`
			);
			removeTrapFocus(elementToFocus);
			this.closeAnimation(this.mainDetailsToggle);
			this.header =
				this.header || document.querySelector(".shopify-section-header");
			const main = document.querySelector("main");
			if (
				main
					.querySelectorAll(".shopify-section")[0]
					?.classList.contains("section--has-overlay") &&
				!this.header.classList.contains("animate")
			) {
				this.header.classList.add("color-background-1", "color-background-2");
			}
			if (
				this.header.classList.contains("color-background-1") &&
				!this.header.classList.contains("shopify-section-header-sticky")
			) {
				this.header.classList.add("color-background-2");
			}
		}
	}

	onFocusOut(event) {
		setTimeout(() => {
			if (
				this.mainDetailsToggle.hasAttribute("open") &&
				!this.mainDetailsToggle.contains(document.activeElement)
			)
				//if (this.classList.contains("mobile-facets__wrapper"))
				//	this.closeMenuDrawer();
				//else this.closeMenuDrawer(event);
				this.closeMenuDrawer();
		});
	}

	onCloseButtonClick(event) {
		const detailsElement = event.currentTarget.closest("details");
		this.closeSubmenu(detailsElement);
	}

	closeSubmenu(detailsElement) {
		detailsElement.classList.remove("menu-opening");
		removeTrapFocus();
		this.closeAnimation(detailsElement);
	}

	closeAnimation(detailsElement) {
		let animationStart;

		const handleAnimation = (time) => {
			if (animationStart === undefined) {
				animationStart = time;
			}

			const elapsedTime = time - animationStart;

			if (elapsedTime < 400) {
				window.requestAnimationFrame(handleAnimation);
			} else {
				detailsElement.removeAttribute("open");
				if (detailsElement.closest("details[open]")) {
					trapFocus(
						detailsElement.closest("details[open]"),
						detailsElement.querySelector("summary")
					);
				}
			}
		};

		window.requestAnimationFrame(handleAnimation);
	}
}

customElements.define("menu-drawer", MenuDrawer);

class HeaderDrawer extends MenuDrawer {
	constructor() {
		super();
	}

	openMenuDrawer(summaryElement) {
		this.header =
			this.header || document.querySelector(".shopify-section-header");
		this.borderOffset =
			this.borderOffset ||
			this.closest(".header-wrapper").classList.contains(
				"header-wrapper--border-bottom"
			)
				? 1
				: 0;
		document.documentElement.style.setProperty(
			"--header-bottom-position",
			`${parseInt(
				this.header.getBoundingClientRect().bottom - this.borderOffset
			)}px`
		);

		if (
			this.header.classList.contains("color-background-2") &&
			!this.header.classList.contains("shopify-section-header-sticky")
		) {
			this.header.classList.remove("color-background-2");
		}

		const main = document.querySelector("main");
		if (
			main
				.querySelectorAll(".shopify-section")[0]
				?.classList.contains("section--has-overlay")
		) {
			this.header.classList.remove("color-background-2");
		}

		setTimeout(() => {
			this.mainDetailsToggle.classList.add("menu-opening");
		});

		summaryElement.setAttribute("aria-expanded", true);
		trapFocus(this.mainDetailsToggle, summaryElement);
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
	}
}

customElements.define("header-drawer", HeaderDrawer);

class SearchModal extends HTMLElement {
	constructor() {
		super();

		this.addEventListener(
			"keyup",
			(evt) => evt.code === "Escape" && this.close()
		);
		this.querySelector("#SearchModal-Overlay").addEventListener(
			"click",
			this.close.bind(this)
		);

		this.querySelector("#search-modal-close").addEventListener(
			"click",
			this.close.bind(this)
		);
		this.setHeaderCartIconAccessibility();
	}

	setHeaderCartIconAccessibility() {
		if (document.querySelector("#search-icon-open") != null) {
			const cartLink = document.querySelector("#search-icon-open");
			if (!cartLink) return;

			cartLink.setAttribute("role", "button");
			cartLink.setAttribute("aria-haspopup", "dialog");
			cartLink.addEventListener("click", (event) => {
				event.preventDefault();
				this.open(cartLink);
			});
			cartLink.addEventListener("keydown", (event) => {
				if (event.code.toUpperCase() === "SPACE") {
					event.preventDefault();
					this.open(cartLink);
				}
			});
		}
	}

	open(triggeredBy) {
		if (triggeredBy) this.setActiveElement(triggeredBy);
		setTimeout(() => {
			this.classList.add("animate", "active");
		});

		this.addEventListener(
			"transitionend",
			() => {
				const containerToTrapFocusOn = document.getElementById("search-modal");
				const focusElement =
					this.querySelector('.header__search input:not([type="hidden"])') ||
					this.querySelector(".search__main") ||
					this.querySelector(".search__close");
				trapFocus(containerToTrapFocusOn, focusElement);
			},
			{ once: true }
		);

		if (!isSafari()) {
			document.body.classList.add("overflow-hidden");
		} else {
			document.body.classList.add("overflow-clip");
		}
	}

	close() {
		this.classList.remove("active");
		removeTrapFocus(this.activeElement);
		if (!isSafari()) {
			document.body.classList.remove("overflow-hidden");
		} else {
			document.body.classList.remove("overflow-clip");
		}

		this.classList.add("hiding");

		setTimeout(() => this.classList.remove("hiding"), 700);
	}

	setActiveElement(element) {
		this.activeElement = element;
	}
}

customElements.define("search-modal", SearchModal);

class accountModal extends HTMLElement {
	constructor() {
		super();

		this.addEventListener(
			"keyup",
			(evt) => evt.code === "Escape" && this.close()
		);
		this.querySelector("#accountModal-Overlay").addEventListener(
			"click",
			this.close.bind(this)
		);

		this.querySelector("#account-modal-close").addEventListener(
			"click",
			this.close.bind(this)
		);
		this.setHeaderCartIconAccessibility();
	}

	setHeaderCartIconAccessibility() {
		const cartLink = document.querySelector("#account-icon-open");
		if (!cartLink) return;

		cartLink.setAttribute("role", "button");
		cartLink.setAttribute("aria-haspopup", "dialog");
		cartLink.addEventListener("click", (event) => {
			event.preventDefault();
			this.open(cartLink);
		});
		cartLink.addEventListener("keydown", (event) => {
			if (event.code.toUpperCase() === "SPACE") {
				event.preventDefault();
				this.open(cartLink);
			}
		});
	}

	open(triggeredBy) {
		if (triggeredBy) this.setActiveElement(triggeredBy);
		setTimeout(() => {
			this.classList.add("animate", "active");
		});

		this.addEventListener(
			"transitionend",
			() => {
				const containerToTrapFocusOn = document.getElementById("account-modal");
				const focusElement =
					this.querySelector(".account__main") ||
					this.querySelector(".account__close");
				trapFocus(containerToTrapFocusOn, focusElement);
			},
			{ once: true }
		);

		document.body.classList.add("overflow-hidden");
	}

	close() {
		this.classList.remove("active");
		removeTrapFocus(this.activeElement);
		document.body.classList.remove("overflow-hidden");

		this.classList.add("hiding");

		setTimeout(() => this.classList.remove("hiding"), 700);
	}

	setActiveElement(element) {
		this.activeElement = element;
	}
}

customElements.define("account-modal", accountModal);

class ModalDialog extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[id^="ModalClose-"]').addEventListener(
			"click",
			this.hide.bind(this, false)
		);

		const modalApplyClose = this.querySelector('#ModalApplyClose');
		if (modalApplyClose) {
			modalApplyClose.addEventListener('click', this.hide.bind(this, false));
		}
		
		this.addEventListener("keyup", (event) => {
			if (event.code.toUpperCase() === "ESCAPE") this.hide();
		});
		if (this.classList.contains("media-modal")) {
			this.addEventListener("pointerup", (event) => {
				if (
					event.pointerType === "mouse" &&
					!event.target.closest("deferred-media, product-model")
				)
					this.hide();
			});
		} else {
			this.addEventListener("click", (event) => {
				if (event.target === this) this.hide();
			});
		}
	}

	connectedCallback() {
		if (this.moved) return;
		this.moved = true;
		document.body.appendChild(this);
	}

	show(opener) {
		this.openedBy = opener;
		const popup = this.querySelector(".template-popup");
		document.body.classList.add("overflow-hidden");
		this.setAttribute("open", "");
		if (popup) popup.loadContent();
		trapFocus(this, this.querySelector('[role="dialog"]'));
		//window.pauseAllMedia();
	}

	hide(isProductPage = false) {
		let isOpen = false;

		this.removeAttribute("open");
		this.classList.add("hiding");

		if (!isProductPage) {
			removeTrapFocus(this.openedBy);
		}

		//window.pauseAllMedia();

		document.querySelectorAll("body > quick-add-modal").forEach((el) => {
			if (el.hasAttribute("open")) {
				isOpen = true;
			}
		});

		let CartDrawerNote = document.getElementById("CartDrawer-Note");
		let CartDrawerNoteAppla = document.getElementById("CartDrawer-Note-Applay");

		if (!isOpen) {
			document.body.classList.remove("overflow-hidden");
			document.body.dispatchEvent(new CustomEvent("modalClosed"));

			if (CartDrawerNote) {
				if (CartDrawerNote.value.trim() !== "") {
					CartDrawerNoteAppla.classList.add("show");
				} else {
					CartDrawerNoteAppla.classList.remove("show");
				}
			}
		}

		const images = document.querySelector(".product-media-modal__content");

		if (images) {
			images.classList.remove("zoom");
		}

		setTimeout(() => this.classList.remove("hiding"), 700);
	}
}

customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
	constructor() {
		super();

		const button = this.querySelector("button");

		if (!button) return;
		button.addEventListener("click", () => {
			const modal = document.querySelector(this.getAttribute("data-modal"));
			if (modal) modal.show(button);
		});

		if (this.closest(".product-popup") != null) {
			this.addEventListener("click", () => {
				const modal = document.querySelector(this.getAttribute("data-modal"));
				if (modal) modal.show(button);
			});
		}
	}
}

customElements.define("modal-opener", ModalOpener);

class DeferredMedia extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[id^="Deferred-Poster-"]')?.addEventListener(
			"click",
			this.loadContent.bind(this)
		);
	}

	loadContent() {
		if (!this.getAttribute("loaded")) {
			const content = document.createElement("div");
			content.appendChild(
				this.querySelector("template").content.firstElementChild.cloneNode(true)
			);

			this.setAttribute("loaded", true);
			window.pauseAllMedia();
			this.appendChild(
				content.querySelector("video, model-viewer, iframe")
			).focus();

			if (
				this.closest(".swiper")?.swiper.slides[
					this.closest(".swiper").swiper.activeIndex
				].querySelector("model-viewer")
			) {
				if (
					!this.closest(".swiper")
						.swiper.slides[
							this.closest(".swiper").swiper.activeIndex
						].querySelector("model-viewer")
						.classList.contains("shopify-model-viewer-ui__disabled")
				) {
					this.closest(".swiper").swiper.params.noSwiping = true;
					this.closest(".swiper").swiper.params.noSwipingClass = "swiper-slide";
				}
			}
		}
	}
}

customElements.define("deferred-media", DeferredMedia);

class VariantSelects extends HTMLElement {
	constructor() {
		super();
		this.addEventListener("change", this.onVariantChange);
	}

	onVariantChange() {
		this.updateOptions();
		this.updateMasterId();
		this.toggleAddButton(true, "", false);
		this.updatePickupAvailability();
		this.updateVariantStatuses();

		if (!this.currentVariant) {
			this.toggleAddButton(true, "", true);
			this.setUnavailable();
		} else {
			if (!this.closest("floated-form") ||
				(this.currentVariant?.featured_media &&
				this.dataset?.variantMediaDisplay === 'show_all')
			) {
				// If variant display != "show_all", the media gallery element is fully replaced inside updateElementsAfterFetch
				this.updateMedia();
			}
			this.updateURL();
			this.updateVariantInput();
			this.renderProductInfo();
		}

		if (this.currentVariant) {
			// dispatch variant:change
			document.dispatchEvent(
				new CustomEvent('variant:change', {
					detail: {
						variant: this.currentVariant,
						previousVariant: this.previousVariant || null,
						formElement: document.querySelector(
							`#${this.getAttribute('id')}`
						),
						sectionId: this.dataset.section,
					},
				})
			);
			// dispatch variant:change

			// Save the previous version
			this.previousVariant = this.currentVariant
		}
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll(".js-radio-colors"));

		this.options = Array.from(
			this.querySelectorAll("select"),
			(select) => select.value
		).concat(
			fieldsets.map((fieldset) => {
				return Array.from(fieldset.querySelectorAll("input")).find(
					(radio) => radio.checked
				).value;
			})
		);
	}

	updateMasterId() {
		if (this.variantData || this.querySelector('[type="application/json"]')) {
			this.currentVariant = this.getVariantData().find((variant) => {
				//this.options.sort();
				//variant.options.sort();

				return !variant.options
					.map((option, index) => {
						return this.options[index] === option;
					})
					.includes(false);
			});
		}
	}

	isHidden(elem) {
		const styles = window.getComputedStyle(elem);
		return styles.display === "none" || styles.visibility === "hidden";
	}

	updateMedia() {
		if (!this.currentVariant || !this.currentVariant?.featured_media) return;

		const newMedia = document.querySelector(
			`[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
		);

		if (!newMedia) return;

		const swiperWrappers = document.querySelectorAll(".product__media-wrapper");

		swiperWrappers.forEach((elem) => {
			if (!this.isHidden(elem)) {
				const newMedia = elem.querySelector(
					`[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
				);
				const parent = newMedia.parentElement;

				if (elem.querySelector(".js-media-list")) {
					elem
						.querySelector(".js-media-list")
						.swiper.slideTo(
							elem
								.querySelector(".js-media-list")
								.swiper.slides.indexOf(newMedia)
						);
				} else {
					newMedia && parent.prepend(newMedia);

					if (window.innerWidth < 750){
						newMedia.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}

					window.setTimeout(() => {
						parent.scroll(0, 0);
					});
				}
			}
		});
	}

	updateURL() {
		if (!this.classList.contains("featured-product-radios")) {
			if (!this.currentVariant || this.dataset.updateUrl === "false") return;
			window.history.replaceState(
				{},
				"",
				`${this.dataset.url}?variant=${this.currentVariant.id}`
			);
		}
	}

	updateVariantInput() {
		const productForms = document.querySelectorAll(
			`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
		);
		productForms.forEach((productForm) => {
			const input = productForm.querySelector('input[name="id"]');
			input.value = this.currentVariant.id;
			input.dispatchEvent(new Event("change", { bubbles: true }));
		});
	}

	updateVariantStatuses() {
		const selectedOptionOneVariants = this.variantData?.filter(
			(variant) => this.querySelector(":checked").value === variant.option1
		);
		const inputWrappers = [...this.querySelectorAll(".product-form__controls")];
		inputWrappers.forEach((option, index) => {
			if (index === 0) return;
			const optionInputs = [
				...option.querySelectorAll('input[type="radio"], option'),
			];
			const previousOptionSelected =
				inputWrappers[index - 1].querySelector(":checked").value;
			const availableOptionInputsValue = selectedOptionOneVariants
				?.filter(
					(variant) =>
						variant.available &&
						variant[`option${index}`] === previousOptionSelected
				)
				.map((variantOption) => variantOption[`option${index + 1}`]);
			this.setInputAvailability(optionInputs, availableOptionInputsValue);
		});
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
				if (input.tagName === "OPTION") {
					input.innerText = input.getAttribute("value");
				} else if (input.tagName === "INPUT") {
					input.classList.remove("disabled");
				}
			} else {
				if (input.tagName === "OPTION") {
					input.innerText =
						window.variantStrings.unavailable_with_option.replace(
							"[value]",
							input.getAttribute("value")
						);
				} else if (input.tagName === "INPUT") {
					input.classList.add("disabled");
				}
			}
		});
	}

	updatePickupAvailability() {
		const pickUpAvailability = document.querySelector("pickup-availability");
		if (!pickUpAvailability) return;

		if (this.currentVariant && this.currentVariant.available) {
			pickUpAvailability.fetchAvailability(this.currentVariant.id);
		} else {
			pickUpAvailability.removeAttribute("available");
			pickUpAvailability.innerHTML = "";
		}
	}

	renderProductInfo() {
		const requestedVariantId = this.currentVariant.id;
		const sectionId = this.dataset.originalSection
			? this.dataset.originalSection
			: this.dataset.section;

		fetch(
			`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${
				this.dataset.originalSection
					? this.dataset.originalSection
					: this.dataset.section
			}`
		)
			.then((response) => response.text())
			.then((responseText) => {
				// prevent unnecessary ui changes from abandoned selections
				if (this.currentVariant.id !== requestedVariantId) return;

				const html = new DOMParser().parseFromString(responseText, "text/html");
				const destination = document.getElementById(
					`price-${this.dataset.section}`
				);
				const source = html.getElementById(
					`price-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				);
				const skuSource = html.getElementById(
					`Sku-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				);
				const skuDestination = document.getElementById(
					`Sku-${this.dataset.section}`
				);
				const inventorySource = html.getElementById(
					`Inventory-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				);
				const inventoryDestination = document.getElementById(
					`Inventory-${this.dataset.section}`
				);
				const colorNameSource = html.getElementById(
					`ColorName-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				);
				const colorNameDestination = document.getElementById(
					`ColorName-${this.dataset.section}`
				);

				if (source && destination) destination.innerHTML = source.innerHTML;
				if (inventorySource && inventoryDestination)
					inventoryDestination.innerHTML = inventorySource.innerHTML;
				if (skuSource && skuDestination) {
					skuDestination.innerHTML = skuSource.innerHTML;
					skuDestination.classList.toggle(
						"visibility-hidden",
						skuSource.classList.contains("visibility-hidden")
					);
				}
				if (colorNameSource && colorNameDestination)
					colorNameDestination.innerHTML = colorNameSource.innerHTML;

				const price = document.getElementById(`price-${this.dataset.section}`);

				if (price) price.classList.remove("visibility-hidden");

				if (inventoryDestination)
					inventoryDestination.classList.toggle(
						"visibility-hidden",
						inventorySource.innerText === ""
					);

				this.toggleAddButton(
					!this.currentVariant.available,
					window.variantStrings.soldOut
				);

				const currentSectionId = this.dataset.originalSection
					? this.dataset.originalSection
					: this.dataset.section;
				const productUrl = this.dataset.url || null;

				this.updateFloatedProductImage(currentSectionId, productUrl, this.currentVariant.id);

				// product media
				if (this.dataset?.variantMediaDisplay !== 'show_all') {
					const sourceSectionId = this.dataset.originalSection
						? this.dataset.originalSection
						: this.dataset.section;
					const currentSectionId = this.dataset.section;

					const mediaSources = html.querySelectorAll(
						`[data-section="product-media-${sourceSectionId}"]`
					);
					const mediaDestinations = document.querySelectorAll(
						`[data-section="product-media-${currentSectionId}"]`
					);

					if (mediaDestinations[0] && mediaSources[0]) {
						mediaDestinations[0].innerHTML = mediaSources[0].innerHTML;

						if (mediaDestinations[1] && mediaSources[1]) {
							mediaDestinations[1].innerHTML = mediaSources[1].innerHTML;
						}

						const parentQuickView = this.closest('quick-view-modal');
						if (parentQuickView) {
							if (typeof parentQuickView.removeDOMElements === 'function') {
								parentQuickView.removeDOMElements(mediaDestination);
							}
							if (typeof parentQuickView.initSlider === 'function') {
								parentQuickView.initSlider();
							}
						} else {
							const section = document.getElementById(
								`shopify-section-${currentSectionId}`
							);

							if (section && typeof initProductPage === 'function') {
								initProductPage(section);
							}
						}
						if (document.querySelector('.js-media-list')) {
							if (currentSectionId.includes('quickadd')) {
								quickAddsliderInit(true);
							} else {
								subSliderInit(true);
								sliderInit(true);
							}
						}
					}
				}

			});
	}

	toggleAddButton(disable = true, text, modifyClass = true) {
		const productForm = document.getElementById(
			`product-form-${this.dataset.section}`
		);
		if (!productForm) return;
		const addButton = productForm.querySelector('[name="add"]');
		const addButtonText = productForm.querySelector('[name="add"] > span');
		const notifyButton = document.getElementById(
			`notify-button-${this.dataset.section}`
		);

		if (!addButton) return;

		if (disable) {
			addButton.setAttribute("disabled", "disabled");

			if (text) addButtonText.textContent = text;
			if (text) notifyButton?.setAttribute("disabled", "disabled");
		} else {
			addButton.removeAttribute("disabled");
			notifyButton?.removeAttribute("disabled");
			addButtonText.textContent = window.variantStrings.addToCart;
		}

		if (!modifyClass) return;
	}

	setUnavailable() {
		const button = document.getElementById(
			`product-form-${this.dataset.section}`
		);
		const addButton = button.querySelector('[name="add"]');
		const price = document.getElementById(`price-${this.dataset.section}`);
		const inventory = document.getElementById(
			`Inventory-${this.dataset.section}`
		);
		const sku = document.getElementById(`Sku-${this.dataset.section}`);

		if (!addButton) return;
		this.toggleAddButton(true, window.variantStrings.unavailable);
		if (price) price.classList.add("visibility-hidden");
		if (inventory) inventory.classList.add("visibility-hidden");
		if (sku) sku.classList.add("visibility-hidden");
	}

	getVariantData() {
		this.variantData =
			this.variantData ||
			JSON.parse(this.querySelector('[type="application/json"]').textContent);
		return this.variantData;
	}

	updateFloatedProductImage(sectionId, productUrl, variantId) {
		const floatedProductInfoImg = document.querySelector(
			`#FloatedProductInfo-${sectionId} .product_info img`
		);

		const floatedProductInfoNoImg = document.querySelector(
			`#FloatedProductInfo-${sectionId} .product_info .no-image`
		);

		fetch(`${productUrl}.js`)
			.then(r => r.json())
			.then(product => {
				const variant = product.variants.find(v => v.id === +variantId);
				if (variant?.id) {
					const imageSrc = variant?.featured_image?.src
						? variant?.featured_image?.src
						: variant?.featured_media?.preview_image?.src
						? variant.featured_media.preview_image.src
						: '';
					if (floatedProductInfoImg) {
						if (imageSrc) {
							floatedProductInfoImg.src = imageSrc;
							floatedProductInfoImg.srcset = imageSrc;
							if (floatedProductInfoNoImg) {
								floatedProductInfoNoImg.style.display = "none";
							}
						} else {
							if (floatedProductInfoNoImg) {
								floatedProductInfoNoImg.style.display = "block";
							}
						}
					}
					
				}
			});
	}
}

customElements.define("variant-selects", VariantSelects);

class VariantRadios extends VariantSelects {
	constructor() {
		super();
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
				input.classList.remove("disabled");
			} else {
				input.classList.add("disabled");
			}
		});
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll("fieldset"));
		this.options = fieldsets.map((fieldset) => {
			return Array.from(fieldset.querySelectorAll("input")).find(
				(radio) => radio.checked
			).value;
		});
	}
}

customElements.define("variant-radios", VariantRadios);

class PasswordViewer {
	constructor() {
		const passwordField = document.querySelectorAll(".field--pass");

		passwordField.forEach((el) => {
			const input = el.querySelector("input");
			const btnWrapper = el.querySelector(".button-pass-visibility");
			const btnOpen =
				el.querySelector(".icon-eye-close") !== null
					? el.querySelector(".icon-eye-close")
					: el.querySelector(".pass-hide");
			const btnClose =
				el.querySelector(".icon-eye") !== null
					? el.querySelector(".icon-eye")
					: el.querySelector(".pass-show");

			input.addEventListener("input", () => {
				input.value !== ""
					? (btnWrapper.style.display = "block")
					: (btnWrapper.style.display = "none");
			});

			btnOpen.addEventListener("click", () => {
				input.type = "text";
				btnOpen.style.display = "none";
				btnClose.style.display = "block";
			});

			btnClose.addEventListener("click", () => {
				input.type = "password";
				btnOpen.style.display = "block";
				btnClose.style.display = "none";
			});
		});
	}
}

class ProductRecommendations extends HTMLElement {
	constructor() {
		super();

		const handleIntersection = (entries, observer) => {
			if (!entries[0].isIntersecting) return;
			observer.unobserve(this);

			fetch(this.dataset.url)
				.then((response) => response.text())
				.then((text) => {
					const html = document.createElement("div");
					html.innerHTML = text;
					const recommendations = html.querySelector("product-recommendations");
					if (recommendations && recommendations.innerHTML.trim().length) {
						this.innerHTML = recommendations.innerHTML;
					}

					/* Color swatches */
					const generateSrcset = (image, widths = []) => {
						const imageUrl = new URL(image["src"]);
						return widths
							.filter((width) => width <= image["width"])
							.map((width) => {
								imageUrl.searchParams.set("width", width.toString());
								return `${imageUrl.href} ${width}w`;
							})
							.join(", ");
					};

					const createImageElement = (image, classes, sizes, productTitle) => {
						const previewImage = image["preview_image"];
						const newImage = new Image(
							previewImage["width"],
							previewImage["height"]
						);
						newImage.className = classes;
						newImage.alt = image["alt"] || productTitle;
						newImage.sizes = sizes;
						newImage.src = previewImage["src"];
						newImage.srcset = generateSrcset(
							previewImage,
							[165, 360, 533, 720, 940, 1066]
						);
						newImage.loading = "lazy";
						return newImage;
					};

					const checkSwatches = () => {
						document
							.querySelectorAll(".js-color-swatches-wrapper")
							.forEach((wrapper) => {
								wrapper
									.querySelectorAll(".js-color-swatches input")
									.forEach((input) => {
										input.addEventListener("click", (event) => {
											const primaryImage =
												wrapper.querySelector(".media--first");
											const secondaryImage =
												wrapper.querySelector(".media--second");
											const handleProduct = wrapper.dataset.product;

											if (event.currentTarget.checked && primaryImage) {
												wrapper
													.querySelector(".js-color-swatches-link")
													.setAttribute(
														"href",
														event.currentTarget.dataset.variantLink
													);
												if (
													wrapper.querySelector(
														'.card__add-to-cart button[name="add"]'
													)
												) {
													wrapper
														.querySelector(
															'.card__add-to-cart button[name="add"]'
														)
														.setAttribute("aria-disabled", false);
													if (
														wrapper.querySelector(
															'.card__add-to-cart button[name="add"] > span'
														)
													) {
														wrapper
															.querySelector(
																'.card__add-to-cart button[name="add"] > span'
															)
															.classList.remove("hidden");
														wrapper
															.querySelector(
																'.card__add-to-cart button[name="add"] .sold-out-message'
															)
															.classList.add("hidden");
													}
													wrapper.querySelector(
														'.card__add-to-cart input[name="id"]'
													).value = event.currentTarget.dataset.variantId;
												}
												const currentColor = event.currentTarget.value;

												jQuery.getJSON(
													window.Shopify.routes.root +
														`products/${handleProduct}.js`,
													function (product) {
														const variant = product.variants.filter(
															(item) =>
																item.featured_media != null &&
																item.options.includes(currentColor)
														)[0];

														if (variant) {
															const newPrimaryImage = createImageElement(
																variant["featured_media"],
																primaryImage.className,
																primaryImage.sizes,
																product.title
															);

															if (newPrimaryImage.src !== primaryImage.src) {
																let flag = false;
																if (secondaryImage) {
																	const secondaryImagePathname = new URL(
																		secondaryImage.src
																	).pathname;
																	const newPrimaryImagePathname = new URL(
																		newPrimaryImage.src
																	).pathname;

																	if (
																		secondaryImagePathname ==
																		newPrimaryImagePathname
																	) {
																		primaryImage.remove();
																		secondaryImage.classList.remove(
																			"media--second"
																		);
																		secondaryImage.classList.add(
																			"media--first"
																		);
																		flag = true;
																	}
																}
																if (flag == false) {
																	primaryImage.animate(
																		{ opacity: [1, 0] },
																		{
																			duration: 200,
																			easing: "ease-in",
																			fill: "forwards",
																		}
																	).finished;
																	setTimeout(function () {
																		primaryImage.replaceWith(newPrimaryImage);
																		newPrimaryImage.animate(
																			{ opacity: [0, 1] },
																			{ duration: 200, easing: "ease-in" }
																		);
																		if (secondaryImage) {
																			secondaryImage.remove();
																		}
																	}, 200);
																}
															}
														}
													}
												);
											}
										});
									});
							});
					};

					checkSwatches();

					const calcTop = (section) => {
						const imageWrapper = section.querySelectorAll(".card__inner");
						let top = 0;

						if (imageWrapper) {
							top = imageWrapper[0]?.offsetHeight / 2;
						} else {
							top = 50;
						}

						return top;
					};

					const initSlider = () => {
						document
							.querySelectorAll(".js-recommendation-swiper")
							.forEach((elem, index) => {
								let mobileLayout = 1;
								if (elem.dataset.mobileLayout) {
									mobileLayout = elem.dataset.mobileLayout;
								}
								let slider = new Swiper(elem, {
									slidesPerView: mobileLayout,
									spaceBetween: 8,
									speed: 600,
									navigation: {
										nextEl: elem.querySelector(
											".product-recommendations__slider-nav .swiper-button-next"
										),
										prevEl: elem.querySelector(
											".product-recommendations__slider-nav .swiper-button-prev"
										),
									},
									breakpoints: {
										576: {
											slidesPerView: 2,
										},
									},
								});
							});
					};

					const initSection = () => {
						const section = this;

						const sectionResizeObserver = new ResizeObserver((entries) => {
							const [entry] = entries;
							let top = calcTop(section);
							if (section.querySelector(".product-recommendations__slider-nav"))
								section.querySelector(
									".product-recommendations__slider-nav"
								).style.top = top + "px";
						});

						sectionResizeObserver.observe(section);

						initSlider();
					};

					const initProductSlider = () => {
						const sliders = document.querySelectorAll(".product-card-js");

						sliders.forEach((slider, index) => {
							const productSlider = new Swiper(slider, {
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

					initProductSlider();

					initSection();
				})
				.catch((e) => {
					console.error(e);
				});
		};

		new IntersectionObserver(handleIntersection.bind(this), {
			rootMargin: "0px 0px 200px 0px",
		}).observe(this);
	}
}

customElements.define("product-recommendations", ProductRecommendations);

(function () {
	const initHeaderOverlay = () => {
		const main = document.getElementById("MainContent");
		const sections = main.querySelectorAll(".shopify-section");
		if (sections.length > 0) {
			const sectionFirstChild = sections[0].querySelector(
				".section--has-overlay"
			);
			const headerGroupSections = document.querySelectorAll(
				".shopify-section-group-header-group"
			);
			const header = document.querySelector(".shopify-section-header");

			if (sectionFirstChild && header) {
				if (sectionFirstChild.classList.contains("section--has-overlay")) {
					if (headerGroupSections[headerGroupSections.length - 1] === header) {
						sections[0].classList.remove("not-margin");
						header.classList.add("color-background-1", "color-background-2");
					} else {
						sections[0].classList.add("not-margin");
						header.classList.remove("color-background-1", "color-background-2");
					}
				} else {
					sections[0].classList.remove("not-margin");
					header.classList.remove("color-background-1", "color-background-2");
				}
			}
		}
	};

	initHeaderOverlay();

	document.addEventListener("shopify:section:load", function () {
		initHeaderOverlay();
	});

	document.addEventListener("shopify:section:unload", function () {
		initHeaderOverlay();
	});

	document.addEventListener("shopify:section:reorder", function () {
		initHeaderOverlay();
	});
})();

function formatMoney(cents, format = "") {
	if (typeof cents === "string") {
		cents = cents.replace(".", "");
	}

	cents = parseInt(cents, 10);
	let value = "";
	const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
	const formatString = format || theme.moneyFormat;

	function formatWithDelimiters(
		number,
		precision = 2,
		thousands = ",",
		decimal = "."
	) {
		if (isNaN(number) || number == null) {
			return "0";
		}

		number = (number / 100.0).toFixed(precision);

		const parts = number.split(".");
		const dollarsAmount = parts[0].replace(
			/(\d)(?=(\d{3})+(?!\d))/g,
			`$1${thousands}`
		);
		const centsAmount = precision > 0 ? decimal + parts[1] : "";

		return dollarsAmount + centsAmount;
	}

	const match = formatString.match(placeholderRegex);
	const formatType = match ? match[1] : "amount";

	switch (formatType) {
		case "amount":
			value = formatWithDelimiters(cents, 2, ",", ".");
			break;
		case "amount_no_decimals":
			value = formatWithDelimiters(cents, 0, ",", ".");
			break;
		case "amount_with_comma_separator":
			value = formatWithDelimiters(cents, 2, ".", ",");
			break;
		case "amount_no_decimals_with_comma_separator":
			value = formatWithDelimiters(cents, 0, ".", ",");
			break;
		case "amount_with_apostrophe_separator":
			value = formatWithDelimiters(cents, 2, "'", ".");
			break;
		case "amount_no_decimals_with_space_separator":
			value = formatWithDelimiters(cents, 0, " ", ".");
			break;
		case "amount_with_space_separator":
			value = formatWithDelimiters(cents, 2, " ", ",");
			break;
		case "amount_with_period_and_space_separator":
			value = formatWithDelimiters(cents, 2, " ", ".");
			break;
		default:
			value = formatWithDelimiters(cents, 2, ",", ".");
	}

	return formatString.replace(placeholderRegex, value);
}

class LocalizationForm extends HTMLElement {
	constructor() {
		super();
		this.elements = {
			input: this.querySelector(
				'input[name="locale_code"], input[name="country_code"]'
			),
			button: this.querySelector(".disclosure__button-modal"),
			panel: this.querySelector("ul"),
			buttonSave: this.querySelector(".button-save"),
			buttonSpan: this.querySelector(".disclosure__button-modal span"),
		};

		// Example usage:
		const targetElement = this.elements.button;
		const excludeElement = this.elements.panel;

		this.elements.button?.addEventListener(
			"click",
			this.openSelector.bind(this)
		);
		this.addEventListener("keyup", this.onContainerKeyUp.bind(this));

		this.querySelectorAll("a").forEach((item) =>
			item.addEventListener("click", this.onItemClick.bind(this))
		);

		this.elements.buttonSave?.addEventListener(
			"click",
			this.onClickSave.bind(this)
		);

		this.handleClickOutside(targetElement, excludeElement);
	}

	hidePanel() {
		this.elements.button.setAttribute("aria-expanded", "false");
		this.elements.panel.setAttribute("hidden", true);
	}

	handleClickOutside(target, exclude) {
		document.addEventListener("click", (event) => {
			if (
				!target.contains(event.target) &&
				(!exclude || !exclude.contains(event.target))
			) {
				this.hidePanel();
			}
		});
	}

	onContainerKeyUp(event) {
		if (event.code.toUpperCase() !== "ESCAPE") return;

		this.hidePanel();
		this.elements.button.focus();
	}

	onItemClick(event) {
		event.preventDefault();
		this.elements.input.value = event.currentTarget.dataset.value;
		if (
			document.querySelectorAll(".region_language_dropdown_type").length > 0
		) {
			this.querySelector("form")?.submit();
		} else {
			let itemValue = event.currentTarget.dataset.valuesave;
			this.elements.buttonSpan.textContent = event.currentTarget.textContent;
			this.elements.button.setAttribute("data-value", itemValue);
			this.hidePanel();
		}
	}

	onClickSave() {
		this.querySelector("form")?.submit();
	}

	openSelector() {
		this.elements.button.focus();
		this.elements.panel.toggleAttribute("hidden");
		this.elements.button.setAttribute(
			"aria-expanded",
			(
				this.elements.button.getAttribute("aria-expanded") === "false"
			).toString()
		);
		document.body.classList.add("region-open");
	}

	closeSelector(event) {
		if (!this.contains(event.relatedTarget)) {
			this.hidePanel();
		}
	}
}

customElements.define("localization-form", LocalizationForm);

(function () {
	const imagesnumber = () => {
		$(document).scroll(scrolled);
		$(document).ready(scrolled);

		const scroll_line = 32;

		function scrolled() {
			const images = $(".img-responsive");
			for (var i = 2; i < images.length; i++) {
				let pos = images.eq(i).offset().top - $(document).scrollTop();
				if (pos > scroll_line) {
					break;
				}
			}
			let current_image = i;

			$("#image_number .first_number").html(
				current_image > 10 ? current_image : "0" + current_image
			);
		}
	};
	document.addEventListener("DOMContentLoaded", function () {
		imagesnumber();
		document.addEventListener("shopify:section:load", function () {
			imagesnumber();
		});
	});
})();

(function () {
	const selectDropDown = () => {
		$(".product-form__controls--dropdown").each(function () {
			const elListItem = $(this).find(".dropdown-select ul li");
			const elItem = $(this).find(".dropdown-select ul");
			const selectedText = $(this).find(".dropdown-select .select-label");

			selectedText.on("click", function (e) {
				elItem.toggleClass("active");
				if (elItem.hasClass("active")) {
					e.stopPropagation();
					$(document).click(function () {
						elItem.removeClass("active");
					});
				}
			});

			elListItem.on("click", function () {
				if ($(this).find("input").hasClass("disabled") == false) {
					selectedText
						.find("span")
						.text($(this).text())
						.attr("title", $(this).text());
				}

				elItem.removeClass("active");
				document.activeElement.blur();
			});
		});
	};
	document.addEventListener("DOMContentLoaded", function () {
		selectDropDown();
		document.addEventListener("shopify:section:load", function () {
			selectDropDown();
		});
	});
})();

function isSafari() {
  const userAgent = navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/Edge/.test(userAgent);
}

// CART REFRESH EVENT
// -----------------------------------------------------------------------------

document.documentElement.addEventListener("cart:refresh", () => {
	const sectionsToUpdate = [
		{ id: "cart-count-bubble", selector: "#cart-icon-bubble" },
		{ id: "cart-drawer", selector: "#CartDrawer" },
		{ id: "main-cart-items", selector: ".cart-items-wrapper" },
		{ id: "main-cart-footer", selector: ".cart__footer" },
		{ id: "main-cart-shipping", selector: ".cart-shipping" }
	];

	sectionsToUpdate.forEach((section) => {
		fetch(`${routes.cart_url}?section_id=${section.id}`)
			.then((response) => response.text())
			.then((html) => {
				const parsedHTML = new DOMParser().parseFromString(html, "text/html");
				const sourceSection = parsedHTML.querySelector(section.selector);
				const destinationSection = document.querySelector(section.selector);
				if (sourceSection && destinationSection) {
					destinationSection.innerHTML = sourceSection.innerHTML;
				}
			})
			.catch((e) => console.error(`Error updating ${section.id}:`, e));
	});
});

// CART REFRESH EVENT END
// -----------------------------------------------------------------------------
