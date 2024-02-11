import "./itemDetails.css";

import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "react-query";
import { useState, useContext, useMemo } from "react";

import fetchFn from "../../utils/fetchFn";
import { dialogContext } from "../../context/dialogContext.js";

import Items from "../../components/items/items";
import Button from "../../components/button/button";
import ItemDetailsComp from "../../components/itemDetailsComp/itemDetailsComp";

function ItemDetails() {
   const { id } = useParams();

   const { mutate } = useMutation({
      mutationFn: ({ body }) =>
         fetchFn("/cart/add", "POST", localStorage.getItem("ssID"), body),
      onSuccess: (data) => {
         localStorage.setItem("ssID", data.sessionToken);
      },
      onError: (e) => showDialog(e.message),
   });

   const { isLoading, data } = useQuery(
      ["item", id],
      () => fetchFn(`/items/details/${id}`, "GET"),
      {
         onError: (e) => showDialog(e.message),
      }
   );

   const [selectedColor, setSelectedColor] = useState("");
   const [selectedSizes, setSelectedSizes] = useState([]);
   const [selectedCount, setSelectedCount] = useState(1);

   const showDialog = useContext(dialogContext);

   function handleAddToCart() {
      const cartItemsBody = [];
      const cartItems = data?.itemDetails.flatMap((detail) => {
         if (detail.color === selectedColor) {
            if (selectedSizes.includes(detail.size)) {
               detail.stock -= selectedCount;
               cartItemsBody.push({
                  item_details_id: detail.id,
                  item_count: selectedCount,
               });
               return {
                  itemId: id,
                  itemDetailsId: detail.id,
                  item_count: selectedCount,
                  color: detail.color,
                  size: detail.size,
                  name: data.item.name,
                  price: data.item.price,
                  img: data.images[0],
               };
            }
         }
         return [];
      });

      if (localStorage.getItem("ssID") && localStorage.getItem("user")) {
         mutate({ body: cartItemsBody });
      }

      const previous = JSON.parse(localStorage.getItem("cartItems"));
      if (previous) {
         cartItems.push(...previous);
      }
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      showDialog("Cart Item Added");
   }

   const isCountError = useMemo(() => {
      let changed = 0;
      data?.itemDetails.forEach((detail) => {
         if (detail.color === selectedColor) {
            if (selectedSizes.includes(detail.size)) {
               if (selectedCount > detail.stock) {
                  changed = detail.stock;
               }
            }
         }
      });

      if (changed) showDialog(`Sorry, we only have ${changed} of one of your selected sizes`);
      return changed;

   }, [data, selectedCount, selectedColor, selectedSizes]);

   return (
      <div className="itemDetails-container">
         <div className="logo-container">
            <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
         </div>
         <ItemDetailsComp
            data={data}
            isLoading={isLoading}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedCount={selectedCount}
            setSelectedCount={setSelectedCount}
         />
         <div className="itemDetails-addToCart-btn responsive-margin">
            <Button
               text={"Add to cart"}
               fn={handleAddToCart}
               disabled={
                  selectedCount < 1 || !selectedSizes.length || isCountError
               }
            />
         </div>
         <section className="responsive-margin">
            <h2>
               More {data?.item.section} {data?.item.type}
            </h2>
            <div>
               { data && <Items
                  endpoint={`/items/list?section=${data?.item.section}&type=${data?.item.type}&page=`}
                  queryId={[data?.item.section, data?.item.type]}
                  rootRef={{ current: null }}
               />}
            </div>
         </section>
      </div>
   );
}

export default ItemDetails;
