class BurgerMenu extends HTMLElement {
	constructor() {
		super();
		this.header = document.querySelector(".header-wrapper");
		this.burgerMenu = this.querySelector(".burger-menu");
		this.openButton = this.querySelector(".burger-menu__toggle--open-btn");
		this.openhoverButton = this.querySelector(".burger-menu__hover--open-btn");
		this.closeButton = this.querySelectorAll(".burger-menu__toggle--close-btn");
		this.overlay = this.querySelector(".burger-menu__overlay");

		if (this.header) this.header.preventHide = false;

		this.setListeners();
	}

	open(event) {
		event.preventDefault();
		if (this.header) this.header.preventHide = true;

		const otherMenu = document.querySelector(".burger-menu--open");
		if(otherMenu){
			this.close(event);
			otherMenu.classList.remove("burger-menu--open");
			otherMenu.querySelector(".burger-menu__overlay")?.classList?.remove("burger-menu__overlay--active");
			setTimeout(function(){
				this.burgerMenu.classList.add("burger-menu--open");
				this.overlay.classList.add("burger-menu__overlay--active");
				document.body.classList.add("overflow-hidden-drawer");
				this.setDropdownWrapperPosition(this);
			}.bind(this), 1000);
		}

		this.burgerMenu.classList.add("burger-menu--open");
		this.overlay.classList.add("burger-menu__overlay--active");
		document.body.classList.add("overflow-hidden-drawer");
		this.setDropdownWrapperPosition(this);
	}

	close(event) {
		event.preventDefault();
		this.burgerMenu.classList.remove("burger-menu--open");
		this.overlay.classList.remove("burger-menu__overlay--active");
		document.body.classList.remove("overflow-hidden-drawer");

		if (this.header) this.header.preventHide = false;

		this.burgerMenu.classList.add("hiding");

		if (this.dataset.openOnHover === 'true') {
			this.burgerMenu.classList.remove("hiding");
		} else {
			setTimeout(() => this.burgerMenu.classList.remove("hiding"), 700);
		}

		this.clearDropdownWrapperPosition();
	}

	setListeners() {
		if (this.dataset.openOnHover === 'true') {
			this.openhoverButton?.addEventListener("mouseenter", (event) => this.open(event));
			this?.addEventListener("mouseleave", (event) => this.close(event));
		}

		this.openButton?.addEventListener("click", (event) => this.open(event));
		this.closeButton?.forEach((item) =>
			item.addEventListener("click", (event) => this.close(event))
		);
		this.overlay?.addEventListener("click", (event) => this.close(event));
		this.burgerMenu?.addEventListener(
			"keyup",
			(event) => event.code === "Escape" && this.close(event)
		);
	}

	setDropdownWrapperPosition(el) {
		const dropdownWrapper = el.querySelector('.burger-menu__dropdown-wrapper');
		if (!dropdownWrapper) return;

		const header = document.querySelector(".shopify-section-header");
		const burgerMenu = el.querySelector(".burger-menu");
		const burgerMenuOverlay = el.querySelector(".burger-menu__overlay");
		const calcTranslatePosition = `${this.getElementHeight(header)}px`;

		if (this.dataset.openOnHover === 'true') {
			dropdownWrapper.style.opacity = 1;
		}

		dropdownWrapper.style.transform = `translateY(0)`;
		burgerMenu.style.top = calcTranslatePosition;
		burgerMenuOverlay.style.top = calcTranslatePosition;
	}

	clearDropdownWrapperPosition() {
		const dropdownWrappers = document.querySelectorAll('.burger-menu__dropdown-wrapper');
		dropdownWrappers?.forEach((el) => {
			const header = document.querySelector(".shopify-section-header");
			const announcement = document.querySelector(".section-announcement");
			const countdownTimerBar = document.querySelector(".section-countdown-timer-bar");
			
			const calcTranslatePosition = this.getElementHeight(header) + this.getElementHeight(announcement) + this.getElementHeight(countdownTimerBar);
			el.style.transform = `translateY(calc(-100% - ${calcTranslatePosition}px))`;

			if (el.classList.contains('burger-menu__on-hover')) {
				el.style.opacity = 0;
			}

			const burgerMenu = el.closest(".burger-menu");
			const burgerMenuOverlay = el.previousElementSibling;
			if(burgerMenu) {
				burgerMenu.style.top = 0;
			}
			if (burgerMenuOverlay) {
				burgerMenuOverlay.style.top = 0;
			}
		});
	}

	getElementHeight(el) {
		if (!el) return 0;

		if (this.isElementInViewport(el)) {
			return el?.getBoundingClientRect()?.height || 0;
		}
		return 0;
	}

	isElementInViewport(el) {
		const rect = el.getBoundingClientRect();
		return (
			rect.top < window.innerHeight &&
			rect.bottom > 0 &&
			rect.left < window.innerWidth &&
			rect.right > 0
		);
	}
}

if (!customElements.get("burger-menu")) {
	customElements.define("burger-menu", BurgerMenu);
}
