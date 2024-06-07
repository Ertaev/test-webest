document.addEventListener("DOMContentLoaded", () => {
    const cartCount = document.querySelector(".cart-count");
    const productCardButtons = document.querySelectorAll(".product-card__add-to-cart");
    const popup = document.querySelector(".popup-wrapper");
    const popupContent = popup.querySelector(".popup");

    // Обновление значений из localStorage
    function refreshDataFromLocalStorage() {
        const productItems = getDataFromLocalStorage();
        Object.keys(productItems).forEach((key) => {
            const productItem = document.getElementById(key);
            if (productItem) {
                productItem.querySelector(".counter__input").value = productItems[key];
            }
        });

        cartCount.textContent = JSON.parse(localStorage.getItem("cart")) || null;
    }

    // Добавление значений в localStorage
    function addToLocalStorage(item, value) {
        const data = getDataFromLocalStorage();
        data[item] = value;
        localStorage.setItem("data", JSON.stringify(data));
    }

    // Чтение данных из localStorage
    function getDataFromLocalStorage() {
        return JSON.parse(localStorage.getItem("data")) || {};
    }

    // Обновление количества товаров в корзине
    function addToCart(value) {
        const currentCartValue = JSON.parse(localStorage.getItem("cart")) || 0;
        const updatedCartValue = +value + currentCartValue;

        cartCount.textContent = updatedCartValue;
        localStorage.setItem("cart", JSON.stringify(updatedCartValue));
    }

    // Получение HTML-страницы
    async function fetchHtml() {
        const response = await fetch(window.location.href);
        return response.text();
    }

    // Показ модального окна с информацией о товаре
    async function showPopup(e) {
        e.preventDefault();
        const htmlContent = await fetchHtml();
        const htmlWrapper = document.createElement("div");
        htmlWrapper.innerHTML = htmlContent;
        const articleList = htmlWrapper.querySelectorAll(".product-card")

        const selectedProductCard = Array.from(articleList).find((card) => card.id === e.target.closest(".product-card").id);

        if (selectedProductCard) {
            selectedProductCard.querySelector(".product-card__description").removeAttribute("hidden");
            popupContent.append(selectedProductCard);
            const counterInputValue = popupContent.querySelector(".counter__input");
            counterInputValue.value = getDataFromLocalStorage()[selectedProductCard.id] || 1;

            const popupProductButton = popupContent.querySelector(".product-card__add-to-cart");
            popupProductButton.textContent = "Добавить в корзину";
            popupProductButton.addEventListener("click", () => {
                addToCart(counterInputValue.value);
            });

            popup.classList.add("popup-wrapper--active");
        }
    }

    // Закрытие модального окна
    function closePopup() {
        popup.classList.remove("popup-wrapper--active");
        const article =  popupContent.querySelector("article")
        popupContent.removeChild(article)
    }

    // Обработка кликов по счетчикам увеличения/уменьшения
    function handleCounterClick(e) {
        const eventTarget = e.target
        const incrementButton = eventTarget.classList.contains("counter__increase");
        const decrementButton = eventTarget.classList.contains("counter__decrease");

        if (incrementButton || decrementButton) {
            const input = incrementButton ? eventTarget.previousElementSibling.querySelector(".counter__input") : eventTarget.nextElementSibling.querySelector(".counter__input");

            if (incrementButton) {
              input.value++
            } else {
              input.value = +input.value > 1 ? +input.value - 1 : 1;
            }

            const productId = eventTarget.closest(".product-card").id;
            addToLocalStorage(productId, input.value);
            refreshDataFromLocalStorage();
        }
    }

    // Инициализация значений при загрузке страницы
    refreshDataFromLocalStorage();

    // Добавление обработчиков событий для кнопок просмотра товаров
    productCardButtons.forEach((button) => {
        button.addEventListener("click", showPopup);
    });

    // Добавление обработчика события для закрытия модального окна
    window.onclick = (e) => {
        if ( e.target.matches(".popup-wrapper--active, .close") ) {
            closePopup();
        }
    };

    // Добавление обработчика события для изменения счетчиков
    document.addEventListener("click", handleCounterClick);
});
