/* eslint-disable react/prop-types */
import { useRef } from "react";
import { Link } from "react-router-dom";

import "./cover.css";

function Cover({navigatorRef, isAllowedRef, imgsLoad, setSection}) {
   const DEVICEWIDTH = document.documentElement.clientWidth;

   const carouselRef = useRef();

   function scrollLeft() {
      carouselRef.current.scrollLeft -= DEVICEWIDTH;
   }

   function scrollRight() {
      carouselRef.current.scrollLeft += DEVICEWIDTH;
   }

   function handleCarouselScroll() {
      const screenWidth = DEVICEWIDTH;
      const scrollPrecentage = carouselRef.current.scrollLeft / (3 * screenWidth);

      navigatorRef.current.style.transform = `translateX(${scrollPrecentage * 300}%)`;

      let isChanged = false;
      if (
         Math.round(carouselRef.current.scrollLeft) >= 0 &&
         Math.round(carouselRef.current.scrollLeft) < 2
      ) {
         setSection("women");
         isChanged = true;
      } else if (
         Math.round(carouselRef.current.scrollLeft) >= screenWidth - 2 &&
         Math.round(carouselRef.current.scrollLeft) < screenWidth + 2
      ) {
         setSection("men");
         isChanged = true;
      } else if (
         Math.round(carouselRef.current.scrollLeft) >= 2 * screenWidth - 2 &&
         Math.round(carouselRef.current.scrollLeft) < 2 * screenWidth + 2
      ) {
         setSection("kids");
         isChanged = true;
      }

      if (isChanged && isAllowedRef.current) {
         imgsLoad.current = {
            cat: false,
            item1: false,
            item2: false,
            item3: false,
         };
      }
   }


   return <>
      <button type="button" onClick={scrollLeft} className="leftScrollBtn">
            <img
               src="/icons/carousel-arrow.png"
               alt="left scroll"
               className="scrollBtnImg"
            />
         </button>
         <button type="button" onClick={scrollRight} className="rightScrollBtn">
            <img
               src="/icons/carousel-arrow.png"
               alt="right scroll"
               className="scrollBtnImg"
            />
         </button>
         <section
            onScroll={handleCarouselScroll}
            className="home-carousel grid transition-05"
            ref={carouselRef}
         >
            <div className="home-carousel-placeholder">
               <Link to="/trends/women?type=shirts">
                  <picture>
                     <source media="(min-width:550px)" srcSet="/images/home/women-cover1.png" />
                     <img
                           src="/images/home/women-cover2.png"
                           alt="Home image"
                           className="img home-carousel-img women"
                     />
                  </picture>
               </Link>
            </div>
            <div className="home-carousel-placeholder">
               <Link to="/trends/men?type=jeans">
                  <img
                     src="/images/home/men-cover2.png"
                     alt="Home image"
                     className="img home-carousel-img men"
                  />
               </Link>
            </div>
            <div className="home-carousel-placeholder">
               <Link to="/trends/kids?type=dresses">
                  <img
                     src="/images/home/kids-cover2.png"
                     alt="Home image"
                     className="img home-carousel-img kids"
                  />
               </Link>
            </div>
         </section>
         <div className="home-carousel-navigator transition-05">
            <div ref={navigatorRef}></div>
         </div>
   </>;
}

export default Cover;