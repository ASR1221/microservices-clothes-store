import { useEffect, useState } from "react";
import "./search.css";
import Items from "../../components/items/items";

function Search() {

   const [searchTerm, setSearchTerm] = useState("");
   const [searchFeild, setSearchFeild] = useState(""); 

   function handleFocus() {
      const DEVICEWIDTH = document.documentElement.clientWidth;
      document.querySelector(".search-background").style.opacity = 0;
      document.querySelector(".search-img-container").style.top = DEVICEWIDTH >= 550 ? "8vh" : "3vh";
      document.querySelector(".search-img-container").style.padding = "20px";
      document.querySelector(".search-input-container").style.top = DEVICEWIDTH >= 550 ? "25vh" : "19vh";
      if (!searchTerm) {
         setTimeout(() =>
            document.querySelector(".search-phrases").style.display = "block"
            , 500);
      }
   }

   function handleClick(e) {
      setSearchFeild(e.target.innerText)
      setSearchTerm(e.target.innerText);
   }

   useEffect(() => {
      if (searchFeild) {
         document.querySelector(".search-phrases").style.display = "none";
      } else if (document.querySelector(".search-background").style.opacity === "0") {
         setSearchTerm("");
         document.querySelector(".search-phrases").style.display = "block";
      }
   }, [searchFeild]);

   return <div className="search-container relative">
      <img src="images/home/black.png" alt="search background" className="search-background img transition-05 absolute"/>
      <div className="search-img-container absolute transition-05">
         <img src="/icons/asr-logo.svg" alt="ASR Logo" className="img"/>
      </div>
      <div className="search-input-container absolute transition-05">
         <input
            type="search"
            placeholder="search..."
            className="search-input"
            value={searchFeild}
            onChange={e => setSearchFeild(e.target.value)}
            onKeyDown={e => {
               if (e.key === "Enter")
                  setSearchTerm(e.target.value);
            }}
            onFocus={handleFocus}
         />
      </div>
      <section className="search-items-container">
         <div className="search-phrases">
            <p onClick={handleClick}>Search for:</p>
            <div className="search-phrases-section">
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Women dresses</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Women shirts</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Women jeans</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Women skirts</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Women coats</p>
            </div>
            <div className="search-phrases-section">
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Men shirts</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Men jeans</p>
               <p onClick={handleClick}>Men coats</p>
            </div>
            <div className="search-phrases-section">
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Kids dresses</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Kids shirts</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Kids jeans</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Kids skirts</p>
               <p role="button" className="search-phrases-pBtn" onClick={handleClick}>Kids coats</p>
            </div>
         </div>
         {(searchTerm && searchFeild) && <Items
            endpoint={`/items/search?term=${searchTerm}&page=`}
            queryId={searchTerm}
            rootRef={{current: null}}
         />}
      </section>
   </div>;
}

export default Search;