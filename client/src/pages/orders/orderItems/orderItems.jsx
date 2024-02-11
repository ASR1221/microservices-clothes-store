import { forwardRef, useState } from "react";
import { useQuery } from "react-query";

import fetchFn from "../../../utils/fetchFn";

import CartItems from "../../../components/cartItem/cartItems";
import Loading from "../../../components/loading/loading";
import Button from "../../../components/button/button";

// eslint-disable-next-line react/display-name, react/prop-types
const OrderItems = forwardRef(({ id }, ref) => {

   const [orderItems, setOrderItems] = useState([]);

   const { isLoading, error } = useQuery(
      ["order", id],
      () => fetchFn(`/order/details/${id}`, "GET", localStorage.getItem("ssID")),
      {
         onSuccess: (data) => {
            console.log(data[0].item_count)
            data.forEach(d => 
               setOrderItems(p => ([...p, {
                  id: d.id,
                  item_count: d.item_count,
                  itemDetailsId: d.itemsDetailsId,
                  size: d.size,
                  color: d.color,
                  name: d.name,
                  price: d.price,
                  itemId: d.itemId,
                  img: d.img,
               }]))
            )
         },
      }
   )

   return <dialog className="editDialog-container" ref={ref}>
      <div className="editDialog-details-container">
         <h2>Order Items</h2>
         {
            isLoading ? <Loading />
            : error ? <p>{error.message}</p>
            : orderItems && orderItems.length > 0 && <CartItems
               isEditable={false}
               cartItems={orderItems}
            />
         }
      </div>
      <div className="editDialog-actions-container flex">
         <Button
            text={"close"}
            fn={() => ref.current.close()}
         />
      </div>
   </dialog>;
});

export default OrderItems;