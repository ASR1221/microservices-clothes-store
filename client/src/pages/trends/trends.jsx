import { useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Items from "../../components/items/items";

function Trends() {

   const containerRef = useRef();
   const { section } = useParams();
   const [searchParams] = useSearchParams();
   const type = searchParams.get("type");

   return <div className="cart-container">
      <div className="cart logo-container">
         <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
      </div>
      <h1 className="cart-h1">Trends</h1>
      <div ref={containerRef}>
         <Items
            endpoint={`/items/list?section=${section}&type=${type}&page=`}
            queryId={`${section}_trends_${type}`}
            rootRef={containerRef}
         />
      </div>
   </div>;
}

export default Trends;