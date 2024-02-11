import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import fetchFn from "../../utils/fetchFn";

import CartItems from "../../components/cartItem/cartItems";
import Loading from "../../components/loading/loading";
import Button from "../../components/button/button";

import "./cart.css";
import UserDetails from "./components/userDetails/userDetails";

function Cart() {

   const isSignedIn = localStorage.getItem("ssID") ? true : false;

   const [cartItems, setCartItems] = useState([]);

   useEffect(() => {
      if (localStorage.getItem("cartItems"))
         setCartItems(JSON.parse(localStorage.getItem("cartItems")));
   }, []);


   const { isLoading, error, data } = useQuery(
      ["cartItems"],
      () => fetchFn("/cart/list", "GET", localStorage.getItem("ssID")),
      {
         onSuccess: (data) => {
            localStorage.setItem("cartItems",
               JSON.stringify(data.map(item => {
                  return {
                     id: item.id,
                     item_count: item.item_count,
                     itemDetailsId: item.itemDetailsId,
                     size: item.size,
                     color: item.color,
                     name: item.name,
                     price: item.total_price,
                     itemId: item.itemId,
                     img: item.img,
                  };
               }))
            );
         },
      }
   );

   const totalCheck = useMemo(() => {
      const items = JSON.parse(localStorage.getItem("cartItems"));
      if (!items) return 0;
      let final = 0;
      items.forEach(item => {
         final += item.item_count * item.price;
      });

      return final;
   }, [data]);

   const navigate = useNavigate();
   const userDetailsRef = useRef();

   function handleMakeOrderClick() {
      if (!isSignedIn) {
         navigate("/login");
         return;
      } else {
         userDetailsRef.current.showModal();
      }

   }

   return <div className="cart-container">
      <div className="cart logo-container">
         <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
      </div>
      <h1 className="cart-h1">Cart</h1>
      {
         isLoading && isSignedIn ? (
            <Loading />
         ) : error && isSignedIn ? (
            <div>
               <h2>Error</h2>
               <p>{error.message}</p>
            </div>
         ) : < CartItems isEditable={true} cartItems={cartItems} setCartItems={setCartItems}/>
      }
      <div className="cart-check-container flex">
         <p>Total Check: {totalCheck} IQD</p>
         <Button
            disabled={cartItems.length < 1}
            text={"Make Order"}
            fn={handleMakeOrderClick}
         />
      </div>
      <UserDetails ref={userDetailsRef} setCartItems={setCartItems} />
   </div>;
}

export default Cart;