const productCards = [...document.querySelectorAll(".product-card")];
const filterButtons = [...document.querySelectorAll(".category-pill")];
const searchPanel = document.querySelector(".search-panel");
const searchInput = document.querySelector("#site-search");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const cartDrawer = document.querySelector(".cart-drawer");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItemsContainer = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const drawerFooter = document.querySelector(".drawer-footer");
const toast = document.querySelector(".toast");

let activeFilter = "All gifts";
let cart = [];
let toastTimeout;

function updateProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  productCards.forEach((card) => {
    const matchesFilter = activeFilter === "All gifts"
      || (activeFilter === "Under $50" && Number(card.querySelector(".quick-add").dataset.price) < 50)
      || card.dataset.category === activeFilter;
    const matchesQuery = !query || `${card.dataset.name} ${card.dataset.category}`.toLowerCase().includes(query);
    card.hidden = !(matchesFilter && matchesQuery);
    if (!card.hidden) visibleCount += 1;
  });
  document.querySelector(".no-results").hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    updateProducts();
  });
});

document.querySelectorAll("[data-filter-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const button = filterButtons.find((item) => item.dataset.filter === link.dataset.filterLink);
    button?.click();
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelector(".cart-count").textContent = count;
  document.querySelector(".drawer-count").textContent = `(${count})`;
  cartItemsContainer.replaceChildren();

  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-item";
    const image = document.createElement("img");
    image.className = "cart-item-image";
    image.src = item.image;
    image.alt = "";
    const details = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = item.name;
    const quantity = document.createElement("p");
    quantity.textContent = `Quantity: ${item.quantity}`;
    const remove = document.createElement("button");
    remove.className = "remove-item";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      cart = cart.filter((entry) => entry.name !== item.name);
      renderCart();
    });
    details.append(name, quantity, remove);
    const price = document.createElement("strong");
    price.className = "cart-item-price";
    price.textContent = `$${item.price * item.quantity}`;
    row.append(image, details, price);
    cartItemsContainer.append(row);
  });

  cartEmpty.hidden = count > 0;
  drawerFooter.hidden = count === 0;
  document.querySelector(".cart-subtotal").textContent =
    `$${cart.reduce((total, item) => total + item.price * item.quantity, 0)}`;
}

document.querySelectorAll(".quick-add").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    const name = button.dataset.product;
    const existing = cart.find((item) => item.name === name);
    if (existing) existing.quantity += 1;
    else {
      cart.push({
        name,
        price: Number(button.dataset.price),
        quantity: 1,
        image: card.querySelector("img").src,
      });
    }
    renderCart();
    showToast(`${name} added to your bag`);
  });
});

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("is-open", isOpen);
  cartOverlay.classList.toggle("is-open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  cartOverlay.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("drawer-open", isOpen);
}

document.querySelector(".cart-toggle").addEventListener("click", () => setCartOpen(true));
document.querySelector(".drawer-close").addEventListener("click", () => setCartOpen(false));
cartOverlay.addEventListener("click", () => setCartOpen(false));
document.querySelector(".continue-shopping").addEventListener("click", () => setCartOpen(false));
document.querySelector(".checkout-button").addEventListener("click", () => {
  showToast("Your good things are nearly on their way. Checkout coming soon!");
});

function setSearchOpen(isOpen) {
  searchPanel.classList.toggle("is-open", isOpen);
  searchPanel.setAttribute("aria-hidden", String(!isOpen));
  if (isOpen) searchInput.focus();
  else {
    searchInput.value = "";
    updateProducts();
  }
}

document.querySelector(".search-toggle").addEventListener("click", () => {
  setSearchOpen(!searchPanel.classList.contains("is-open"));
});
document.querySelector(".search-close").addEventListener("click", () => setSearchOpen(false));
searchInput.addEventListener("input", updateProducts);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    setSearchOpen(false);
    document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
  }
});

menuToggle.addEventListener("click", () => {
  const isOpen = !mainNav.classList.contains("is-open");
  mainNav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setCartOpen(false);
    setSearchOpen(false);
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = new FormData(form).get("email");
  const message = document.querySelector(".form-message");
  message.textContent = `You're on the list. Watch your inbox, ${email}!`;
  form.reset();
});
