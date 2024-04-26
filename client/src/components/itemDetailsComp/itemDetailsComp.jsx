/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

import Loading from "../loading/loading";
import ColorFilter from "../colorFilter/colorFilter";
import FilterBtn from "../filterBtn/filterBtn";

import "./itemDetailsComp.css";

function ItemDetailsComp({
   data,
   isLoading,
   selectedColor,
   setSelectedColor,
   selectedSizes,
   setSelectedSizes,
   selectedCount,
   setSelectedCount,
   isSingle
}) {

   const colorSize = useRef({});
   const [selectedImg, setSelectedImg] = useState("");

   useEffect(() => {

      if (Object.keys(colorSize.current).length > 0) {
         return;
      }

      setSelectedImg(data?.images[0]);

      data?.itemDetails.forEach(detail => {

         if (!Object.keys(colorSize.current).includes(detail.color)) {
            colorSize.current[detail.color] = [detail.size];
         } else {
            colorSize.current[detail.color] = [...colorSize.current[detail.color], detail.size];
         }
      });
      if (!isSingle) setSelectedColor(Object.keys(colorSize.current)[0])

      return () => 
         colorSize.current = {};

   }, [data]);

   function handleImgClick(e) {
      const containers = document.querySelectorAll(".itemDetails-smallImg-container");
      for (let i = 0; i < containers.length; i++) {
         containers[i].classList.remove("selected");
      }
      e.target.parentElement.classList.add("selected"); // the event is for the child for some reason. /:
      setSelectedImg(e.target.src);
   }

   return <>
      {isLoading ? <Loading /> : 
         <>
            <section className="grid itemDetails-imgs-container responsive-margin">
               <div className="itemDetails-mainImg-container">
                  <img
                     className="img"
                     src={selectedImg}
                     alt="selected item image"
                     crossOrigin="anonymous"
                  />
               </div>
               <div className="grid itemDetails-smallImgs-container">
                  {
                     data?.images.map((img, i) => <div
                        key={i}
                        onClick={handleImgClick}
                        className={`itemDetails-smallImg-container ${selectedImg === img ? "selected" : ""}`}
                     >
                        <img className="img" src={img} alt="item image" crossOrigin="anonymous"/>
                     </div>)
                  }
               </div>
            </section>
            <section className="itemDetails-text-container responsive-margin relative">
               <h1 className="itemDetails-h1">{data?.item.name}<p className="itemDetails-price absolute">{data?.item.price} IQD</p></h1>
               <div>
                  <p>Select color:</p>
                  <div className="flex itemDetails-color-container">
                     {
                        Object.keys(colorSize.current)?.map((color, i) =>
                           <ColorFilter
                              key={i}
                              currentColor={color}
                              selectedColor={selectedColor}
                              setSelectedColor={setSelectedColor}
                              setSelectedSizes={setSelectedSizes}
                           />
                        )
                     }
                  </div>
               </div>
               <div>
                  <p>Select size:</p>
                  <div className="flex itemDetails-color-container">
                     {
                        colorSize.current[selectedColor]?.map((size, i) =>
                           <FilterBtn
                              key={i}
                              text={size}
                              array={selectedSizes}
                              setArray={setSelectedSizes}
                              isSingle={isSingle}
                           />
                        )
                     }
                  </div>
               </div>
               <div className="itemDetails-number-container">
                  <label htmlFor="itemCount">
                     How many would you like:
                     <input
                        type="number"
                        name="itemCount"
                        disabled={selectedSizes.length < 1}
                        value={selectedCount}
                        onChange={e => setSelectedCount(e.target.value)}
                        className="itemDetails-number-input"
                     />
                  </label>
                  <p>Total price: {data && (data.item.price * selectedCount * selectedSizes.length)} IQD</p>
               </div>
            </section>
         </>
      }
   </>;
}

export default ItemDetailsComp;