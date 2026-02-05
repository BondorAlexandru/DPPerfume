(function () {
	function swiperInit() {
		subSliderInit(true);
		sliderInit(true);
		popupSliderInit(true);
	}

	document.addEventListener('shopify:section:load', function (e) {
		if (!window?.isSwiperInit) {
			swiperInit();
		}
	});

	if (!window?.isSwiperInit) {
		swiperInit()
	}

	//This file is loaded from both the main-product.liquid and featured-product.liquid files
	// and is called twice. To avoid the variable being initialized and the slider being
	// instantiated multiple times, need to implement a isSwiperInit variable to prevent double initialization
	window.isSwiperInit = true;
})();
