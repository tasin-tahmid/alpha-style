(function () {
	// Function to get all the next siblings of an element
	const nextSiblings = (currentElement) => {
		let next_siblings = [];
		let sibling = currentElement.nextElementSibling;

		while (sibling) {
			next_siblings.push(sibling);
			sibling = sibling.nextElementSibling;
		}

		return next_siblings;
	};

	const footer = () => {
		const caculateNewsletterMargin = () => {
			let timeout =
				document?.querySelector(".home_page_slider") !== null ? 1500 : 0;

			setTimeout(() => {
				const footerNewsletter = document.querySelector(
					".footer--newsletter__form--center"
				);

				// Only proceed if the newsletter form exists
				if (footerNewsletter) {
					let footerParent = footerNewsletter.parentNode;
					let footerStyles = window.getComputedStyle(footerParent);

					// Calculate the total height of next siblings
					//let paddingTop =
					//	nextSiblings(footerNewsletter).reduce((totalHeight, sibling) => {
					//		const siblingHeight = sibling.offsetHeight || 0; // Handle hidden elements
					//		return totalHeight + siblingHeight;
					//	}, 0) - parseInt(footerStyles.getPropertyValue("padding-top"), 10);

					//let enoughSpace =
					//	window.outerHeight -
					//		paddingTop * 2 -
					//		footerNewsletter.offsetHeight -
					//		document?.querySelector(".countdown-timer-bar")?.offsetHeight ||
					//	0 -
					//		document?.querySelector(".section-announcement")?.offsetHeight ||
					//	0 > 0;

					//paddingTop = paddingTop > 0 && enoughSpace ? paddingTop : 0;

					//// Apply the calculated margin to the newsletter
					//footerNewsletter.style.paddingTop = `${paddingTop}px`;

					// Calculate the total height of next siblings
					let siblingsTotalHeight =
						nextSiblings(footerNewsletter).reduce((totalHeight, sibling) => {
							const siblingHeight = sibling.offsetHeight || 0; // Handle hidden elements
							return totalHeight + siblingHeight;
						}, 0) - parseInt(footerStyles.getPropertyValue("padding-top"), 10);

					let windowHeight = window.outerHeight;
					let newsletterHeight = footerNewsletter.offsetHeight;
					let spaceLeft =
						(windowHeight - siblingsTotalHeight - newsletterHeight) / 2;

					paddingTop = spaceLeft > 0 ? spaceLeft : 0;

					// Apply the calculated margin to the newsletter
					footerNewsletter.style.paddingTop = `${paddingTop}px`;
				}
			}, timeout);
		};

		caculateNewsletterMargin();
		window.addEventListener("resize", () =>
			setTimeout(() => caculateNewsletterMargin(), 1500)
		);
	};

	// Reapply the footer logic when the section is reloaded
	document.addEventListener("shopify:section:load", footer);
	footer();
})();
