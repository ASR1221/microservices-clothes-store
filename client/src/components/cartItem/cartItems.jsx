/* eslint-disable react/prop-types */
import CartItem from "./components/cartItem/cartItem";

import "./cartItems.css";

function CartItems({ isEditable, cartItems, setCartItems }) {
   
   function itemFunction(cartItem, i) {
      return <CartItem
         cartItem={cartItem}
         index={i}
         isEditable={isEditable}
         setCartItems={setCartItems}
      />;
   }

   return (
      <div className="cartItems-container">
         {
            cartItems && cartItems.length > 0 ? (
               cartItems.map(itemFunction)
            ) : (
               <p>No Cart Items</p>
            )
         }
      </div>
   );
}

export default CartItems;