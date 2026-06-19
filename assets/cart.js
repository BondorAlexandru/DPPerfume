class CartRemoveButton extends HTMLElement {
	constructor() {
		super();

		this.addEventListener("click", (event) => {
			event.preventDefault();
			const cartItems =
				this.closest("cart-items") || this.closest("cart-drawer-items");
			cartItems.updateQuantity(this.dataset.index, 0);
		});
	}
}

customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
	constructor() {
		super();
		this.lineItemStatusElement =
			document.getElementById("shopping-cart-line-item-status") ||
			document.getElementById("CartDrawer-LineItemStatus");

		if (document.querySelector(".cart-shipping")) {
			this.cartShipping();
		}

		const debouncedOnChange = debounce((event) => {
			this.onChange(event);
		}, ON_CHANGE_DEBOUNCE_TIMER);

		this.addEventListener("change", debouncedOnChange.bind(this));
	}

	cartUpdateUnsubscriber = undefined;

	cartShipping() {
		const wrapper = document.querySelector(".cart-shipping");
		if (!wrapper) return;
		const fill = wrapper.querySelector(".cart-shipping__progress-current");
		const messageEl = wrapper.querySelector(".cart-shipping__message");

		// Animate the fill from its previous width (set before each re-render).
		const progressPrev = getComputedStyle(fill).getPropertyValue("width");
		document.documentElement.style.setProperty("--progress-prev", progressPrev);

		// All amounts in cents. data-* thresholds are store-currency; convert.
		const rate = (window.Shopify && Shopify.currency && Shopify.currency.rate) || 1;
		const total = parseFloat(wrapper.dataset.total) || 0;
		const shippingThreshold = Math.round(parseFloat(wrapper.dataset.minSpend) * rate);
		const giveawayThreshold = Math.round(parseFloat(wrapper.dataset.giveawaySpend) * rate);

		const shippingUnlocked = total >= shippingThreshold;
		const giveawayUnlocked = total >= giveawayThreshold;

		// Segmented bar: each tier owns an equal visual half of the track.
		//   0 .. tier1  -> 0% .. 50%      tier1 .. tier2 -> 50% .. 100%
		let progress;
		if (giveawayUnlocked) {
			progress = 100;
		} else if (shippingUnlocked) {
			const span = giveawayThreshold - shippingThreshold;
			progress = 50 + (span > 0 ? ((total - shippingThreshold) / span) * 50 : 50);
		} else {
			progress = shippingThreshold > 0 ? (total / shippingThreshold) * 50 : 0;
		}
		if (progress > 100) progress = 100;

		// Message reflects the next reward the customer can still unlock.
		let message;
		if (!shippingUnlocked) {
			message = wrapper.dataset.message.replace(
				"||amount||",
				formatMoney(shippingThreshold - total)
			);
		} else if (!giveawayUnlocked) {
			message = wrapper.dataset.messageGiveaway.replace(
				"||amount||",
				formatMoney(giveawayThreshold - total)
			);
		} else {
			message = wrapper.dataset.messageComplete;
		}
		if (messageEl) messageEl.innerHTML = message;

		wrapper.classList.toggle("reward-shipping-unlocked", shippingUnlocked);
		wrapper.classList.toggle("reward-giveaway-unlocked", giveawayUnlocked);

		fill.style.width = progress + "%";
	}

	connectedCallback() {
		this.cartUpdateUnsubscriber = subscribe(
			PUB_SUB_EVENTS.cartUpdate,
			(event) => {
				if (event.source === "cart-items") {
					return;
				}
				this.onCartUpdate();
			}
		);
	}

	disconnectedCallback() {
		if (this.cartUpdateUnsubscriber) {
			this.cartUpdateUnsubscriber();
		}
	}

	onChange(event) {
		this.updateQuantity(
			event.target.dataset.index,
			event.target.value,
			document.activeElement.getAttribute("name")
		);
	}

	onCartUpdate() {
		fetch(`${routes.cart_url}?section_id=main-cart-items`)
			.then((response) => response.text())
			.then((responseText) => {
				const html = new DOMParser().parseFromString(responseText, "text/html");
				const sourceQty = html.querySelector("cart-items");
				this.innerHTML = sourceQty.innerHTML;
				// Re-rendered markup ships with an empty rewards bar; recompute it.
				if (document.querySelector(".cart-shipping")) this.cartShipping();
			})
			.catch((e) => {
				console.error(e);
			});
	}

	getSectionsToRender() {
		return [
			{
				id: "main-cart-items",
				section: document.getElementById("main-cart-items").dataset.id,
				selector: ".js-contents",
			},
			{
				id: "cart-icon-bubble",
				section: "cart-icon-bubble",
				selector: ".shopify-section",
			},
			{
				id: "cart-live-region-text",
				section: "cart-live-region-text",
				selector: ".shopify-section",
			},
			{
				id: "main-cart-footer",
				section: document.getElementById("main-cart-footer").dataset.id,
				selector: ".js-contents-totals",
			},
			{
				id: "main-cart-shipping",
				section:
					document.getElementById("main-cart-shipping").dataset.id || null,
				selector: ".js-contents-shipping",
			},
		];
	}

	updateQuantity(line, quantity, name) {
		this.enableLoading(line);
		this.querySelectorAll(".quantity__button").forEach((button) =>
			button.classList.add("disabled")
		);

		if (
			document.querySelectorAll(
				'.card--product card__add-to-cart button[name="add"]'
			)
		) {
			document
				.querySelectorAll(
					'.card--product .card__add-to-cart button[name="add"]'
				)
				.forEach((button) => {
					button.setAttribute("aria-disabled", false);
					if (button.querySelector("span")) {
						button.querySelector("span").classList.remove("hidden");
						button.querySelector(".sold-out-message").classList.add("hidden");
					}
				});
		}

		if (document.querySelector(".cart-shipping")) {
			let progressPrev = getComputedStyle(
				document.querySelector(".cart-shipping__progress-current")
			).getPropertyValue("width");
			document.documentElement.style.setProperty(
				"--progress-prev",
				progressPrev
			);
		}

		const body = JSON.stringify({
			line,
			quantity,
			sections: this.getSectionsToRender().map((section) => section.section),
			sections_url: window.location.pathname,
		});

		fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
			.then((response) => {
				return response.text();
			})
			.then((state) => {
				const parsedState = JSON.parse(state);
				const quantityElement =
					document.getElementById(`Quantity-${line}`) ||
					document.getElementById(`Drawer-quantity-${line}`);
				const items = document.querySelectorAll(".cart-item");
				if (parsedState.errors) {
					quantityElement.value = quantityElement.getAttribute("value");
					this.updateLiveRegions(line, parsedState.errors);

					// dispatch cart:error
					document.dispatchEvent(
						new CustomEvent('cart:error', {
							detail: {
								source: this.dataset.source,
								productVariantId: items[line - 1].dataset.variantId || line,
								errors: parsedState.errors,
								message: parsedState.errors,
							},
						})
					)
					// dispatch cart:error
					return;
				}

				// dispatch line-item:change for the modified element
				document.dispatchEvent(
					new CustomEvent('line-item:change', {
						detail: {
							lineItem: parsedState.items[line - 1] || null,
							cart: parsedState,
							sectionId: this.dataset.source
						},
					})
				);
				// dispatch line-item:change for the modified element

				this.classList.toggle("is-empty", parsedState.item_count === 0);

				// dispatch cart:change for the entire basket
				document.dispatchEvent(
					new CustomEvent('cart:change', {
						detail: {
							cart: parsedState,
							sectionId: this.dataset.source
						},
					})
				);
				// dispatch cart:change for the entire basket

				const cartDrawerWrapper = document.querySelector("cart-drawer");
				const cartFooter = document.getElementById("main-cart-footer");

				if (cartFooter)
					cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
				if (cartDrawerWrapper)
					cartDrawerWrapper.classList.toggle(
						"is-empty",
						parsedState.item_count === 0
					);

				this.getSectionsToRender().forEach((section) => {
					const elementToReplace =
						document
							.getElementById(section.id)
							.querySelector(section.selector) ||
						document.getElementById(section.id);
					elementToReplace.innerHTML = this.getSectionInnerHTML(
						parsedState.sections[section.section],
						section.selector
					);
				});
				const updatedValue = parsedState.items[line - 1]
					? parsedState.items[line - 1].quantity
					: undefined;
				let message = "";
				if (
					items.length === parsedState.items.length &&
					updatedValue !== parseInt(quantityElement.value)
				) {
					if (typeof updatedValue === "undefined") {
						message = window.cartStrings.error;
					} else {
						message = window.cartStrings.quantityError.replace(
							"[quantity]",
							updatedValue
						);
					}
				}
				this.updateLiveRegions(line, message);

				const lineItem =
					document.getElementById(`CartItem-${line}`) ||
					document.getElementById(`CartDrawer-Item-${line}`);
				if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
					cartDrawerWrapper
						? trapFocus(
								cartDrawerWrapper,
								lineItem.querySelector(`[name="${name}"]`)
						  )
						: lineItem.querySelector(`[name="${name}"]`).focus();
				} else if (parsedState.item_count === 0 && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper.querySelector(".drawer__inner-empty"),
						cartDrawerWrapper.querySelector("a")
					);
				} else if (document.querySelector(".cart-item") && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper,
						document.querySelector(".cart-item__name")
					);
				}
				publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items" });
				const baselineSig = this.cartSignature(parsedState);
				if (parseInt(quantity) === 0) {
					this.reloadWhenCartChanges(baselineSig);
				} else {
					this.refreshSectionsWhenCartChanges(baselineSig);
				}
			})
			.catch(() => {
				this.querySelectorAll(".loading-overlay").forEach((overlay) =>
					overlay.classList.add("hidden")
				);
				this.querySelectorAll(".quantity__button").forEach((button) =>
					button.classList.remove("disabled")
				);
				const errors =
					document.getElementById("cart-errors") ||
					document.getElementById("CartDrawer-CartErrors");
				errors.textContent = window.cartStrings.error;

				// dispatch cart:error when fetch fail
				document.dispatchEvent(
					new CustomEvent('cart:error', {
						detail: {
							source: this.dataset.source,
							productVariantId: items[line - 1].dataset.variantId || line,
							errors: window.cartStrings.error,
							message: window.cartStrings.error
						}
					})
				);
				// dispatch cart:error when fetch fail
			})
			.finally(() => {
				this.querySelectorAll(".quantity__button").forEach((button) =>
					button.classList.remove("disabled")
				);
				if (document.querySelector(".cart-shipping")) {
					this.cartShipping();
				}
				this.disableLoading(line);
			});
	}

	updateLiveRegions(line, message) {
		const lineItemError =
			document.getElementById(`Line-item-error-${line}`) ||
			document.getElementById(`CartDrawer-LineItemError-${line}`);
		if (lineItemError)
			lineItemError.querySelector(".cart-item__error-text").innerHTML = message;

		this.lineItemStatusElement.setAttribute("aria-hidden", true);

		const cartStatus =
			document.getElementById("cart-live-region-text") ||
			document.getElementById("CartDrawer-LiveRegionText");
		cartStatus.setAttribute("aria-hidden", false);

		setTimeout(() => {
			cartStatus.setAttribute("aria-hidden", true);
		}, 1000);
	}

	getSectionInnerHTML(html, selector) {
		return new DOMParser()
			.parseFromString(html, "text/html")
			.querySelector(selector).innerHTML;
	}

	cartSignature(cart) {
		return JSON.stringify({
			tp: cart.total_price,
			td: cart.total_discount,
			items: (cart.items || []).map(
				(it) => `${it.key}:${it.quantity}:${it.final_line_price}`
			),
		});
	}

	reloadWhenCartChanges(baselineSig) {
		const intervalMs = 300;
		const maxAttempts = 17;
		let attempts = 0;
		const probe = () => {
			attempts += 1;
			fetch(`${routes.cart_url}.js`)
				.then((r) => r.json())
				.then((cart) => {
					const sig = this.cartSignature(cart);
					if (sig !== baselineSig) {
						window.location.reload();
						return;
					}
					if (attempts < maxAttempts) {
						setTimeout(probe, intervalMs);
					} else {
						window.location.reload();
					}
				})
				.catch(() => window.location.reload());
		};
		probe();
	}
	refreshCartSections() {
		const sections = this.getSectionsToRender();
		const sectionParam = sections.map((s) => s.section).join(",");
		return fetch(`${routes.cart_url}?sections=${sectionParam}`)
			.then((response) => response.json())
			.then((data) => {
				sections.forEach((section) => {
					const html = data[section.section];
					if (!html) return;
					const target = document.getElementById(section.id);
					if (!target) return;
					const elementToReplace =
						target.querySelector(section.selector) || target;
					try {
						elementToReplace.innerHTML = this.getSectionInnerHTML(
							html,
							section.selector
						);
					} catch (e) {}
				});
				// Re-rendered markup ships with an empty rewards bar; recompute it.
				if (document.querySelector(".cart-shipping")) this.cartShipping();
			})
			.catch((e) => console.error("refreshCartSections", e));
	}

	refreshSectionsWhenCartChanges(baselineSig) {
		const intervalMs = 300;
		const maxAttempts = 17;
		let attempts = 0;
		const probe = () => {
			attempts += 1;
			fetch(`${routes.cart_url}.js`)
				.then((r) => r.json())
				.then((cart) => {
					const sig = this.cartSignature(cart);
					if (sig !== baselineSig) {
						this.refreshCartSections();
						return;
					}
					if (attempts < maxAttempts) {
						setTimeout(probe, intervalMs);
					}
				})
				.catch(() => {});
		};
		probe();
	}

	enableLoading(line) {
		const mainCartItems =
			document.getElementById("main-cart-items") ||
			document.getElementById("CartDrawer-CartItems");
		mainCartItems.classList.add("cart__items--disabled");

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		);
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		);

		[...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
			overlay.classList.remove("hidden")
		);

		document.activeElement.blur();
		this.lineItemStatusElement.setAttribute("aria-hidden", false);
	}

	disableLoading(line) {
		const mainCartItems =
			document.getElementById("main-cart-items") ||
			document.getElementById("CartDrawer-CartItems");
		mainCartItems.classList.remove("cart__items--disabled");

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		);
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		);

		cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
		cartDrawerItemElements.forEach((overlay) =>
			overlay.classList.add("hidden")
		);
	}
}

customElements.define("cart-items", CartItems);

if (!customElements.get("cart-note")) {
	customElements.define(
		"cart-note",
		class CartNote extends HTMLElement {
			constructor() {
				super();

				this.addEventListener(
					"input",
					debounce((event) => {
						const body = JSON.stringify({ note: event.target.value });
						fetch(`${routes.cart_update_url}`, {
							...fetchConfig(),
							...{ body },
						});
					}, ON_CHANGE_DEBOUNCE_TIMER)
				);
			}
		}
	);
}
