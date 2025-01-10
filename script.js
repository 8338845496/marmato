const apiUrl = 'https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889';
let cartData = [];
let itemToRemoveIndex = null;

function formatCurrency(value) {
    return `₹${value.toFixed(2)}`;
}

function updateCartTotals() {
    const subtotal = cartData.reduce((acc, item) => acc + item.price * item.quantity, 0);
    document.getElementById('subtotal').innerText = formatCurrency(subtotal);
    document.getElementById('total').innerText = formatCurrency(subtotal);
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing items

    cartData.forEach((item, index) => {
        // Log to check the item object and image structure
        console.log(item);

        // Ensure image exists, if not use a fallback
        const imageUrl = item.image && item.image.src ? item.image.src : "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/Asgaardsofa3.png?v=1728384481";

        const cartItemHTML = `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${imageUrl}" alt="${item.title}" class="cart-img rounded me-3" style="width: 50px; height: 50px;">
                    <span>${item.title}</span>
                </div>
            </td>
            <td>${formatCurrency(item.price)}</td>
            <td>
                <input type="number" value="${item.quantity}" class="form-control quantity-input" data-index="${index}">
            </td>
            <td>
                ${formatCurrency(item.price * item.quantity)}
                <button class="btn btn-link text-danger ms-3 remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
        
        cartItemsContainer.innerHTML += cartItemHTML;
    });

    updateCartTotals();
}

document.addEventListener('DOMContentLoaded', () => {
  
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Log the entire API response to check the structure
            console.log(data);

            cartData = data.items.map(item => ({
                title: item.title,
                price: item.presentment_price,
                quantity: item.quantity,
                image: item.image // Assuming the image data is here
            }));

            // Render the cart items (images included)
            renderCartItems();
        })
        .catch(err => console.error("Error fetching cart data:", err));

    document.getElementById('cart-items').addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item') || event.target.closest('.remove-item')) {
            const index = event.target.closest('.remove-item').dataset.index;
            itemToRemoveIndex = index;
            const itemName = cartData[index].title; 
           
            const modalBody = document.querySelector('#removeItemModal .modal-body');
            modalBody.textContent = `Are you sure you want to remove "${itemName}" from your cart?`;
            const modal = new bootstrap.Modal(document.getElementById('removeItemModal'));
            modal.show(); 
        }
    });

    // Confirming item removal
    document.getElementById('confirmRemoveItem').addEventListener('click', () => {
        if (itemToRemoveIndex !== null) {
            cartData.splice(itemToRemoveIndex, 1); 
            renderCartItems(); 
            const modal = bootstrap.Modal.getInstance(document.getElementById('removeItemModal'));
            modal.hide(); 
        }
    });

    // Updating quantity
    document.getElementById('cart-items').addEventListener('change', (event) => {
        if (event.target.classList.contains('quantity-input')) {
            const index = event.target.dataset.index;
            const newQuantity = parseInt(event.target.value, 10);
            if (!isNaN(newQuantity) && newQuantity > 0) { 
                cartData[index].quantity = newQuantity;
                renderCartItems(); 
            }
        }
    });

    document.querySelector('.btn-warning').addEventListener('click', () => {
        alert("Proceeding to checkout...");
    });
});
