import './user.css';

import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

import Footer from "../../components/footer/footer"
import { useQuery } from 'react-query';
import fetchFn from '../../utils/fetchFn';

function User() {

   const [isLogedIn, setIsLogedIn] = useState(localStorage.getItem("user") && localStorage.getItem("ssID"));

   const user = useMemo(() => {
      if (isLogedIn) {
         return JSON.parse(localStorage.getItem("user"));
      }
   }, [isLogedIn]);

   const { data } = useQuery(
      ["admin_check"],
      () => fetchFn("/user/auth/role", "GET", localStorage.getItem("ssID")),
      {
         onSuccess: (data) => localStorage.setItem("ssID", data.sessionToken)
      }
   );

   function handleLogOut() {
      setIsLogedIn(false);
      localStorage.removeItem("user");
      localStorage.removeItem("ssID");
      localStorage.removeItem("cartItems");
   }

   return (
      <div className='user-body relative'>
         <div className="cart-container">
            <div className="logo-container">
               <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
            </div>
            {isLogedIn ? (
               <div className="user-inner-container">
                  <div className="user-info-container">
                     <div className="user-info-name-container">
                        <h1>{user.name}</h1>
                        <p>{user.email}</p>
                     </div>
                     <div className="user-info-actions-container">
                        <Link to="/user/orders">Orders</Link>
                        <p onClick={handleLogOut} className="user-hover">Log out</p>
                     </div>
                  </div>
                  {
                     data && data.roles && <div className="user-admin-container">
                        <Link to="/admin">Admin dashboard</Link>
                     </div>
                  }
                  <div className="user-report-container">
                     <a href="mailto:asr12211@outlook.com">Report a problem</a>
                  </div>
               </div>
            ) : (
               <div className="flex user-notLogged">
                  <h1>You are not loged in</h1>
                  <Link to="/login" className="btn">Log in or Sign up</Link>
               </div>
            )}
         </div>
         <Footer />
      </div>
   );
}

export default User;