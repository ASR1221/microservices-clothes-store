import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import fetchFn from "../../utils/fetchFn";

import Loading from "../../components/loading/loading";

function Admin() {

   const { isLoading, error, data } = useQuery(
      ["admin_check"],
      () => fetchFn("/user/auth/role", "GET", localStorage.getItem("ssID")),
      {
         onSuccess: (data) => localStorage.setItem("ssID", data.sessionToken)
      }
   );

   return <div className="cart-container">
      <div className="logo-container">
         <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
      </div>
      <h1>Choose Admin Page</h1>
      {
         isLoading ? <Loading /> 
         : error ? <p>{error.message}</p>
         : data && data.roles.length > 0 ? data.roles.map(d => <div key={d} className="orders-order-container">
            <Link to={`/admin/${d}`}>{d}</Link>
         </div>)
         : <p>You are not an admin</p>
      }
   </div>;
}

export default Admin;