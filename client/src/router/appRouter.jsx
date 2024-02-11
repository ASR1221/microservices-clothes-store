import { Route, Routes } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import fetchFn from "../utils/fetchFn";
import { dialogContext } from "../context/dialogContext.js";

import NavBar from "../components/navBar/navBar";
import Home from "../pages/home/home";
import Search from "../pages/search/search";
import ItemDetails from "../pages/itemDetails/itemDetails";
import Dialog from "../components/dialog/dialog";
import Login from "../pages/login/login";
import User from "../pages/user/user";
import Cart from "../pages/cart/cart";
import Orders from "../pages/orders/orders";
import Admin from "../pages/admin/admin";
import Uploading from "../pages/admin/uploading/uploading";
import Trends from "../pages/trends/trends";
import Finance from "../pages/admin/finance/finance.jsx";
import AdminOrders from "../pages/admin/adminOrders/adminOrders.jsx";

function App() {

   const animationIntroRef = useRef(true);

   const [dialogTxt, setDialogTxt] = useState();
   const dialogRef = useRef();

   function showDialog(text) {
      setDialogTxt(text);
      dialogRef.current.show();
      setTimeout(() => {
         dialogRef.current.close();
      }, 3000);
   }

   const [checked, setChecked] = useState(false);

   useEffect(() => {
      const ssID = localStorage.getItem("ssID");
      if (ssID && !checked) {
         fetchFn("/user/info/get", "GET", ssID)
         .catch(() => {
               localStorage.removeItem("user");
               localStorage.removeItem("ssID");
               localStorage.removeItem("cartItems");
            });
         
         setChecked(true);
      }
   }, []);

   return <>
      <dialogContext.Provider value={showDialog} >
         <Routes>
            <Route
               path="/"
               element={<>
                  <NavBar />
                  <Dialog text={dialogTxt} ref={dialogRef} />
               </>}>
               <Route index element={<Home animate={animationIntroRef}/>} />
               <Route path="search" element={<Search />} />
               <Route path="item/:id" element={<ItemDetails />} />
               <Route path="trends/:section" element={<Trends />} />
               <Route path="login" element={<Login />} /> {/* This should be the redirect url for logins */}
               <Route path="cart" element={<Cart />} />
               <Route path="user">
                  <Route index element={<User />} />
                  <Route path="orders" element={<Orders />} />
               </Route>
               <Route path="admin">
                  <Route index element={<Admin />} />
                  <Route path="finance" element={<Finance />} />
                  <Route path="uploading" element={<Uploading />} />
                  <Route path="orders" element={<AdminOrders />} />
               </Route>
            </Route>
         </Routes>
      </dialogContext.Provider>
   </>
}

export default App;