import { useQuery } from "react-query";
import { useRef, useState } from "react";

import fetchFn from "../../utils/fetchFn";

import Loading from "../../components/loading/loading";
import OrderItems from "./orderItems/orderItems";

import "./orders.css";

function Orders() {

   const orderItemsRef = useRef();
   const [id, setId] = useState("");
   const { isLoading, error, data } = useQuery(
      ["orders_list"],
      () => fetchFn("/order/list", "GET", localStorage.getItem("ssID"))
   );

   function handleOrderClick(id) {
      setId(id);
      orderItemsRef.current.showModal();
   }

   return <div className="cart-container">
      <div className="logo-container">
         <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
      </div>
      <h1 className="cart-h1">Orders</h1>
      <div className="orders-orders-container">
         {
            isLoading ? <Loading /> 
            : error ? <p>{error.message}</p>
            : data && data.length > 0 ? data.map(d => <div key={d.id} className="orders-order-container" onClick={() => handleOrderClick(d.id)}>
               <div className="grid order-time-container">
                  <p><strong>{d.served ? "Served" : "Pending..."}</strong></p>
                  <p>{new Date(d.order_date).toLocaleString()}</p>
               </div>
               <p>Total price: <b>{d.order_price}$</b></p>
               <p>Payment method: {d.payment_method}</p>
               
            </div>
            )
            : <p>No Orders yet.</p>
         }
         {data && data.length > 0 && <OrderItems
            id={id}
            ref={orderItemsRef}
         />}
      </div>
   </div>;
}

export default Orders;