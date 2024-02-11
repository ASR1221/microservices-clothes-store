/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import Cover from "./components/cover/cover";
import Trends from "./components/trends/trends";
import Items from "../../components/items/items";
import FilterBtn from "../../components/filterBtn/filterBtn";

import fetchFn from "../../utils/fetchFn";
import { dialogContext } from "../../context/dialogContext";

import "./home.css";

function Home({ animate }) {

   const showDialog = useContext(dialogContext);

   // payment complete
   const [searchParams,] = useSearchParams();
   useQuery(
      ["userInfo"],
      () => fetchFn(`/order/payment/complete?token=${searchParams.get("token")}`, "GET", localStorage.getItem("ssID")),
      {
         enabled: !!searchParams.get("token"),
         onSuccess: () => {
            localStorage.removeItem("cartItems");
            setTimeout(() => showDialog("Order made. You can see your order in your profile page."), 2000);
         },
         onError: () => {
            setTimeout(() => showDialog("Error: Order was not complete. Please try again."), 2000);
         }
      });

   // constants
   const DEVICEWIDTH = document.documentElement.clientWidth;
   const TYPES = ["jeans", "shirts", "coats", "dresses", "skirts"];

   // types to filter items
   const [types, setTypes] = useState([]);

   // query requirement
   const [section, setSection] = useState("women");

   // images and text for trends
   const [trendImgs, setTrendImgs] = useState({
      cat: "/images/home/women-trend.png",
      item1: "/images/items/1705770553120-6876-Cotton shirt-1.jpg",
      item2: "/images/items/1705770756049-5241-Oxford shirt-1.jpg",
      item3: "/images/items/1705771695879-5344-Waxed tie-belt coat-1.jpg",
   });
   const [trendText, setTrendText] = useState("Discover the Elegance Collection: Your perfect dress awaits. Be unforgettable.");

   //! #######  Main Slide Animation  ########
   const mainSlideRef = useRef();
   const [mouseIsDown, setMouseIsDown] = useState(false);
   const touchYRef = useRef({});
   const previousPosRef = useRef();

   useEffect(() => {

      previousPosRef.current = parseInt(window.getComputedStyle(mainSlideRef.current).top, 10);

      if (DEVICEWIDTH < 550) {
         document.body.style.overflow = "hidden";
         document.body.style.overscrollBehaviorY = "contain";
      }

      return () => {
         document.body.style.overflow = "scroll";
         document.body.style.overscrollBehaviorY = "auto";
      };
   }, []);

   function handleMainSlideDown(e, isIndecator) {
      if (DEVICEWIDTH >= 550) {
         return;
      }

      touchYRef.current.first = e.touches[0].clientY;
      if (
         mainSlideRef.current.scrollTop <= 0 ||
         (isIndecator && parseInt(window.getComputedStyle(mainSlideRef.current).top, 10) === 0)
      ) {
         setMouseIsDown(true);
      }
   }

   useEffect(() => {
      function handleMainSlideUp() {
         if (!mouseIsDown) {
            return;
         }

         const offset =
            previousPosRef.current - parseInt(touchYRef.current.last);

         if (offset > 50) {
            mainSlideRef.current.style.top = "0";
            mainSlideRef.current.style.borderRadius = "0";
            mainSlideRef.current.style.overflow = "scroll";
            mainSlideRef.current.scrollTop = 2;
         } else {
            navigatorRef.current.parentElement.style.top = "79%";
            mainSlideRef.current.style.top = "83%";
            mainSlideRef.current.style.borderRadius = "18px";
            mainSlideRef.current.style.overflow = "hidden";
            setTimeout(() => (mainSlideRef.current.scrollTop = 0), 500);
         }

         setTimeout(
            () =>
               (previousPosRef.current = parseInt(window.getComputedStyle(mainSlideRef.current).top, 10)),
            1000);
         setMouseIsDown(false);
      }

      function handleMainSlideMove(e) {
         if (mouseIsDown) {
            if (
               parseInt(window.getComputedStyle(mainSlideRef.current).top, 10) === 0 &&
               e.touches[0].clientY < touchYRef.current.first
            ) {
               setMouseIsDown(false);
               return;
            }

            if (
               e.touches[0].clientY >= 0 &&
               e.touches[0].clientY < document.documentElement.clientHeight * 0.84
            ) {
               mainSlideRef.current.style.top = e.touches[0].clientY + "px";
               touchYRef.current.last = e.touches[0].clientY;
            }
         }
      }

      document.body.addEventListener("touchmove", handleMainSlideMove, { passive: false });
      document.body.addEventListener("touchend", handleMainSlideUp, { passive: false });

      return () => {
         document.body.removeEventListener("touchmove", handleMainSlideMove);
         document.body.removeEventListener("touchend", handleMainSlideUp);
      };
   }, [mouseIsDown]);
   //! #######  Main Slide Animation End  ########


   //! #######  Carousel Animation and Images and Text Change   ########
   const navigatorRef = useRef();
   const isAllowedRef = useRef(true);
   const imgsLoad = useRef({
      cat: false,
      item1: false,
      item2: false,
      item3: false,
   });

   function handleImgsLoad(obj) {
      isAllowedRef.current = false;
      imgsLoad.current = obj;
      if (
         imgsLoad.current.cat &&
         imgsLoad.current.item1 &&
         imgsLoad.current.item2 &&
         imgsLoad.current.item3
      ) {
         mainSlideRef.current.style.top = "83%";
         navigatorRef.current.parentElement.style.top = "79%";
         setTimeout(() => (isAllowedRef.current = true), 500);
      }
   }

   useEffect(() => {

      if (section === "women") {
         setTrendImgs({
            cat: "/images/home/women-trend.png",
            item1: "/images/items/1705770553120-6876-Cotton shirt-1.jpg",
            item2: "/images/items/1705770756049-5241-Oxford shirt-1.jpg",
            item3: "/images/items/1705771695879-5344-Waxed tie-belt coat-1.jpg",
         });
         setTrendText("Discover the Elegance Collection: Your perfect dress awaits. Be unforgettable.");
      } else if (section === "men") {
         setTrendImgs({
            cat: "/images/home/men-trend.png",
            item1: "/images/items/1705772376447-4820-Regular Fit Oxford shirt-1.jpg",
            item2: "/images/items/1705772271468-4126-Felted wool-blend car coat-1.jpg",
            item3: "/images/items/1705772590439-4531-Slim Jeans-1.jpg",
         });
         setTrendText("Elevate your style with our Classic Gentlemen's Coat. Timeless elegance, impeccable craftsmanship.");
      } else if (section === "kids") {
         setTrendImgs({
            cat: "/images/home/kids-trend.png",
            item1: "/images/items/1705772074908-3882-Pleated tulle dress-1.jpg",
            item2: "/images/items/1705772137544-1427-Printed sweatshirt-1.jpg",
            item3: "/images/items/1705772193941-5684-Superstretch Slim Fit Jeans-1.jpg",
         });
         setTrendText("Style your little one in our charming Little Gentleman Shirts. Sharp style for young icons. Make a statement");
      }

      mainSlideRef.current.style.top = "91%";
      navigatorRef.current.parentElement.style.top = "87%";
   }, [section]);
   //! #######  Carousel Animation and Images and Text Change End  ########

   //! #### login logic ####

   const navigate = useNavigate();

   const { mutate: addCartMutate } = useMutation({
      mutationFn: ({ path, body, sessionToken }) => fetchFn(path, "POST", sessionToken, body),
      onSuccess: () => navigate('/'),
      onError: (e) => showDialog(e.message),
   });

   const { mutate: logInMutate } = useMutation({
      mutationFn: ({ path, body }) => fetchFn(path, "POST", null, body),
      onSuccess: (data) => {
         localStorage.setItem("ssID", data.sessionToken);
         localStorage.setItem("user", JSON.stringify(data));
         
         if (localStorage.getItem("cartItems")) {
            const cart = JSON.parse(localStorage.getItem("cartItems"));
            const bodyCart = cart.map(item => ({
               item_details_id: item.itemDetailsId,
               item_count: item.item_count,
            }));
            addCartMutate({
               path: "/cart/add",
               sessionToken: data.sessionToken,
               body: bodyCart,
            });
         } else {
            navigate('/');
         }
      },
      onError: (e) => showDialog(e.message),
   });

   useEffect(() => {
      const access_token = location.hash?.split("#access_token=")[1]?.split("&")[0];
      if (!access_token) return;
      const path = location.hash.includes("google") ? "google" : "facebook";

      logInMutate({
         path: `/user/auth/${path}`,
         body: { access_token }
      });

   }, []);

   return (
      <div className="home">
         <Cover
            imgsLoad={imgsLoad}
            isAllowedRef={isAllowedRef}
            navigatorRef={navigatorRef}
            setSection={setSection}
         />
         <section
            onTouchStart={(e) => handleMainSlideDown(e, false)}
            className="home-main responsive-margin transition-05"
            ref={mainSlideRef}
         >
            <div
               onTouchStart={(e) => handleMainSlideDown(e, true)}
               className="home-main-slideIndecator-div transition-05"
            >
               <p className="home-main-slideIndecator-p"></p>
            </div>
            <div>
               <Trends
                  imgsLoad={imgsLoad}
                  handleImgsLoad={handleImgsLoad}
                  trendImgs={trendImgs}
                  trendText={trendText}
                  section={section}
               />
               <h2>All</h2>
               <div className="flex home-main-types">
                  {TYPES.map((type) => {
                     if (
                        section === "men" &&
                        (type === "skirts" || type === "dresses")
                     )
                        return;

                     return (
                        <FilterBtn
                           text={type}
                           array={types}
                           setArray={setTypes}
                           key={type}
                        />
                     );
                  })}
               </div>
               <Items
                  endpoint={`/items/list?section=${section}&page=`}
                  queryId={section}
                  rootRef={mainSlideRef}
                  types={types}
               />
            </div>
         </section>
         {animate.current && <div className="intro absolute flex" onAnimationEnd={() => animate.current = false}>
            <div className="intro-inner">
               <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
               <p>ASR Store</p>
               <p>Dress Elegance</p>
            </div>
         </div>}
      </div>
   );
}

export default Home;