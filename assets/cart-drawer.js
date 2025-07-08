class CartDrawer extends HTMLElement {
	constructor() {
		super();

		this.addEventListener(
			"keyup",
			(evt) => evt.code === "Escape" && this.close()
		);
		this.querySelector("#CartDrawer-Overlay").addEventListener(
			"click",
			this.close.bind(this)
		);
		this.setHeaderCartIconAccessibility();
	}

	setHeaderCartIconAccessibility() {
		const cartLink = document.querySelector("#cart-icon-bubble");
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
		const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
		if (cartDrawerNote && !cartDrawerNote.hasAttribute("role"))
			this.setSummaryAccessibility(cartDrawerNote);
		// here the animation doesn't seem to always get triggered. A timeout seem to help
		setTimeout(() => {
			this.classList.add("animate", "active");
		});

		this.addEventListener(
			"transitionend",
			() => {
				const containerToTrapFocusOn = this.classList.contains("is-empty")
					? this.querySelector(".drawer__inner-empty")
					: document.getElementById("CartDrawer");
				const focusElement =
					this.querySelector(".drawer__inner") ||
					this.querySelector(".drawer__close");
				trapFocus(containerToTrapFocusOn, focusElement);
			},
			{ once: true }
		);

		document.body.classList.add("cart-overflow-hidden");
		document.body.classList.add("overflow-hidden");
	}

	close() {
		this.classList.remove("active");
		removeTrapFocus(this.activeElement);
		document.body.classList.remove("cart-overflow-hidden");
		document.body.classList.remove("overflow-hidden");

		setTimeout(() => {
			let notification = this.querySelector(".notification");

			if (notification) {
				const activeItem = this.querySelector(
					`.cart-item[data-product-id="${this.productId}"`
				);
				notification.classList.remove("notification-open");
				activeItem?.classList.remove("active");
			}
		}, 1000);
	}

	setSummaryAccessibility(cartDrawerNote) {
		cartDrawerNote.setAttribute("role", "button");
		cartDrawerNote.setAttribute("aria-expanded", "false");

		if (cartDrawerNote.nextElementSibling.getAttribute("id")) {
			cartDrawerNote.setAttribute(
				"aria-controls",
				cartDrawerNote.nextElementSibling.id
			);
		}

		cartDrawerNote.addEventListener("click", (event) => {
			event.currentTarget.setAttribute(
				"aria-expanded",
				!event.currentTarget.closest("details").hasAttribute("open")
			);
		});

		cartDrawerNote.parentElement.addEventListener("keyup", onKeyUpEscape);
	}

	renderContents(parsedState) {
		this.querySelector(".drawer__inner").classList.contains("is-empty") &&
			this.querySelector(".drawer__inner").classList.remove("is-empty");
		this.productId = parsedState.id;
		this.getSectionsToRender().forEach((section) => {
			const sectionElement = section.selector
				? document.querySelector(section.selector)
				: document.getElementById(section.id);
			sectionElement.innerHTML = this.getSectionInnerHTML(
				parsedState.sections[section.id],
				section.selector
			);
		});

		let notification = this.querySelector(".notification");

		if (notification) {
			const activeItem = this.querySelector(
				`.cart-item[data-product-id="${this.productId}"`
			);
			notification.classList.add("notification-open");
			activeItem.classList.add("active");
		}

		setTimeout(() => {
			this.querySelector("#CartDrawer-Overlay").addEventListener(
				"click",
				this.close.bind(this)
			);
			this.open();
		});
	}

	getSectionInnerHTML(html, selector = ".shopify-section") {
		return new DOMParser()
			.parseFromString(html, "text/html")
			.querySelector(selector).innerHTML;
	}

	getSectionsToRender() {
		return [
			{
				id: "cart-drawer",
				selector: "#CartDrawer",
			},
			{
				id: "cart-icon-bubble",
			},
		];
	}

	getSectionDOM(html, selector = ".shopify-section") {
		return new DOMParser()
			.parseFromString(html, "text/html")
			.querySelector(selector);
	}

	setActiveElement(element) {
		this.activeElement = element;
	}
}

customElements.define("cart-drawer", CartDrawer);

class CartDrawerItems extends CartItems {
	getSectionsToRender() {
		return [
			{
				id: "CartDrawer",
				section: "cart-drawer",
				selector: ".drawer__inner",
			},
			{
				id: "cart-icon-bubble",
				section: "cart-icon-bubble",
				selector: ".shopify-section",
			},
		];
	}
}

customElements.define("cart-drawer-items", CartDrawerItems);

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
