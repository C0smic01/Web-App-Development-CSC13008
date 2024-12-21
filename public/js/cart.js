import Cart from '/cart/models/Cart.js'
const cart = new Cart()
function renderCart() {
  const cartItems = cart.loadCart();
  const tbody = document.querySelector("section#cart tbody");
  tbody.innerHTML = ""; 

  cartItems.items.forEach((item, index) => {
    const cartItem = item.cartItem 
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="#" class="remove-item" data-index="${index}"><i class="fa-regular fa-circle-xmark"></i></a>
      </td>
      <td><img src="${cartItem.image}" alt="${item.name}" /></td>
      <td>${cartItem.name}</td>
      <td>$${cartItem.price}</td>
      <td><input type="number" class="quantity" data-index="${index}" value="${cartItem.quantity}" min="1" /></td>
      <td>$${(cartItem.price * cartItem.quantity).toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  updateCartTotals(cartItems.totalQuantity, cartItems.totalPrice);

  attachEventListeners();
}


function attachEventListeners() {
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", event => {
      event.preventDefault();
      const index = event.target.closest("a").dataset.index;
      cart.removeItem(index);
      renderCart();
    });
  });

  const quantityInputs = document.querySelectorAll(".quantity");
  quantityInputs.forEach(input => {
    input.addEventListener("input", handleQuantityChange);
  });
}

function handleQuantityChange(event) {
  const index = event.target.dataset.index; 
  const newQuantity = parseInt(event.target.value);
  
  if (newQuantity <= 0) {
    return;
  }

  const cartItems = cart.loadCart();
  
  const cartItem = cartItems.items[index].cartItem;
  cartItem.quantity = newQuantity;

  cartItems.totalQuantity = cartItems.items.reduce((sum, item) => sum + item.cartItem.quantity, 0);
  cartItems.totalPrice = cartItems.items.reduce((sum, item) => sum + (item.cartItem.price * item.cartItem.quantity), 0);

  cart.cart = cartItems;

  cart.saveCart();

  renderCart();
}


function updateCartTotals(totalQuantity, totalPrice) {

  const cartSubtotal = totalPrice.toFixed(2);

  const total = totalPrice;
  
  // Cập nhật vào giao diện Checkout Details
  document.querySelector(".card-subtotal").textContent =  cartSubtotal + ' ₫';
  document.querySelector(".card-total").textContent =  total.toFixed(2) + '₫';
}


// Checkout to order
document.getElementById("checkoutBtn").addEventListener("click", function() {
  const cartItems = cart.loadCart();
  const userFullName = document.querySelector('[name="userFullName"]').value;
  const shippingAddress = document.querySelector('[name="shippingAddress"]').value;
  const userPhoneNumber = document.querySelector('[name="userPhoneNumber"]').value;
  const paymentMethod = document.querySelector('[name="paymentMethod"]').value;

  if (!userFullName || !shippingAddress || !userPhoneNumber || !paymentMethod) {
    alert("Please fill all fields!");
    return;
}
  if(cartItems.items.length <=0) return ;
  fetch('/order', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart: cartItems,
        orderBody: {
            userFullName: userFullName,
            shippingAddress: shippingAddress,
            userPhoneNumber: userPhoneNumber,
            paymentMethod: paymentMethod
        }
        }),
  })
  .then(response => response.json())
  .then(data=>{
      console.log(data)
      cart.clearCart()
      renderCart();
  })
  .then(data => {
     window.location.href = '/order';
  })
  .catch(error => {
      console.error('Error:', error);
  });
});

// Tải trang lần đầu
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});