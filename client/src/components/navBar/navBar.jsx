import { Link, Outlet, useLocation } from "react-router-dom";

import "./navBar.css";

function NavBar() {

   const { pathname } = useLocation();

   return <>
      <nav  className="grid navBar">
         <Link className={pathname === "/" ? "active" : ""} to="/">
            <img  className="img" src="/icons/icons8-clothes-100.png" alt="home icon" />
         </Link>
         <Link className={pathname === "/search" ? "active" : ""} to="/search">
            <img className="img" src="/icons/icons8-search.svg" alt="search icon" />
         </Link>
         <Link className={pathname === "/cart" ? "active" : ""} to="/cart">
            <img className="img" src="/icons/icons8-shopping-cart-100.png" alt="cart icon" />
         </Link>
         <Link className={pathname === "/user" ? "active" : ""} to="/user">
            <img className="img" src="/icons/icons8-order-100.png" alt="user icon" />
         </Link>
      </nav>
      <Outlet />
   </>;
}

export default NavBar;