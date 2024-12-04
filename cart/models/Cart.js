const CART_KEY =  'cart'
export class Cart {
    constructor(){
        this.cart = this.loadCart();
    }
    loadCart()
    {
        const cart = localStorage.getItem(CART_KEY)
        return cart ? JSON.parse(cart) : {items :[], totalQuantity: 0, totalPrice: 0}
    }
    saveCart()
    {
        localStorage.setItem(CART_KEY,JSON.stringify(this.cart))
    }
    addItem(cartItem) {
        const existingItem = this.cart.items.find(item => item.cartItem.productId === cartItem.productId);
        if (existingItem) {
          existingItem.cartItem.quantity += cartItem.quantity;
        } else {
          this.cart.items.push({ cartItem });
        }
        this.cart.totalQuantity += cartItem.quantity;
        this.cart.totalPrice += cartItem.price * cartItem.quantity;
        this.saveCart();
      }
    
    removeItem(index) {
        if (index !== -1) {
          const item = this.cart.items[index];
          this.cart.totalQuantity -= item.cartItem.quantity;
          this.cart.totalPrice -= item.cartItem.price * item.cartItem.quantity;
          this.cart.items.splice(index, 1);
          this.saveCart();
        }
      }
    
    clearCart() {
        this.cart = { items: [], totalQuantity: 0, totalPrice: 0 };
        this.saveCart();
      }
}

