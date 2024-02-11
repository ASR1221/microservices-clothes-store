/* eslint-disable react/prop-types */
import "./filterBtn.css";

function FilterBtn({ text, array, setArray, isSingle = false }) {
   
   function handleClick() {
      
      if (isSingle) {
         setArray([text]);
      } else {
         if (array.includes(text)) {
            setArray((p) => p.filter((a) => a !== text));
         } else {
            setArray((p) => [...p, text]);
         }
      }
   }

   return (  
      <button
         onClick={handleClick}
         className="filterBtn"
         style={{
            backgroundColor: array.includes(text) ? "black" : "white",
            color: array.includes(text) ? "white" : "black"
         }}
      >
         {text}
      </button>
   );
}

export default FilterBtn;