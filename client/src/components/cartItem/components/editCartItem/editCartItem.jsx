/* eslint-disable react/prop-types */
import { forwardRef, useContext, useMemo, useState } from "react";
import { useQuery, useMutation } from "react-query";

import fetchFn from "../../../../utils/fetchFn";
import { dialogContext } from "../../../../context/dialogContext";

import Button from "../../../button/button";
import ItemDetailsComp from "../../../itemDetailsComp/itemDetailsComp";

import "./editCartItem.css";

// eslint-disable-next-line react/display-name
const EditCartItem = forwardRef(({ index, setCartItems }, ref) => {

   const cartItems = JSON.parse(localStorage.getItem("cartItems"));
   const [selectedColor, setSelectedColor] = useState(cartItems[index].color);
   const [selectedSizes, setSelectedSizes] = useState([cartItems[index].size]);
   const [selectedCount, setSelectedCount] = useState(cartItems[index].item_count);

   const hasChanged = useMemo(() => {
      return selectedColor !== cartItems[index]?.color
         || !selectedSizes.includes(cartItems[index]?.size)
         || parseInt(selectedCount) !== cartItems[index]?.item_count;
   }, [cartItems, index, selectedColor, selectedCount, selectedSizes]);

   const showDialog = useContext(dialogContext);

   const { isLoading, error, data } = useQuery(
      ["itemDetails", cartItems[index]?.itemId],
      () => fetchFn(`/items/details/${cartItems[index]?.itemId}`, "GET")
   );

   const { isLoading: isMutLoading, mutate } = useMutation({
      mutationFn: ({ route, method, auth, body }) => fetchFn(`/cart/${route}`, method, auth, body),
      onError: () => showDialog("Error performing update. Please try again.")
   });

   function updateAction() {
      cartItems[index] = {
         ...cartItems[index],
         color: selectedColor,
         size: selectedSizes[0],
         item_count: selectedCount,
      };
      setCartItems(cartItems);
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
   }

   function removeAction() {
      cartItems.splice(index, 1);
      setCartItems(cartItems);
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
   }

   function handleSaveClick() {
      if (localStorage.getItem("ssID")) {
         mutate({
            route: "update",
            method: "PUT",
            auth: localStorage.getItem("ssID"),
            body: {
               id: cartItems[index]?.id,
               item_details_id: cartItems[index]?.itemDetailsId,
               item_count: cartItems[index]?.item_count,
            }
         }, {
            onSuccess: updateAction
         });
      } else {
         updateAction();
      }
      ref.current.close();
   }

   function handleRemoveClick() {
      if (localStorage.getItem("ssID")) {
         mutate({
            route: `remove/${cartItems[index].id}`,
            method: "DELETE",
            auth: localStorage.getItem("ssID"),
            body: null,
         }, {
            onSuccess: removeAction
         });
      } else {
         removeAction();
      }
      ref.current.close();
   }

   return (
      <dialog ref={ref} className="editDialog-container">
         <div className="editDialog-details-container">
            {
               error ? <p>{error}</p>
               : <ItemDetailsComp
                  data={data}
                  isLoading={isLoading}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  selectedSizes={selectedSizes}
                  setSelectedSizes={setSelectedSizes}
                  selectedCount={selectedCount}
                  setSelectedCount={setSelectedCount}
                  isSingle={true}
               />
            }
         </div>
         <div className="editDialog-actions-container flex">
            <Button
               text={"Save"}
               fn={handleSaveClick}
               disabled={isMutLoading || !hasChanged || selectedSizes.length < 1 || !selectedCount || selectedCount < 1}
            />
            <Button
               text={"Remove"}
               fn={handleRemoveClick}
               disabled={isMutLoading}
            />
            <Button
               text={"Cancel"}
               fn={() => ref.current.close()}
               disabled={isMutLoading}
            />
         </div>
      </dialog>
   );
});

export default EditCartItem;