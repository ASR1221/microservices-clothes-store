import "./colorFilter.css"

function ColorFilter({ currentColor, selectedColor, setSelectedColor, setSelectedSizes }) {

   function handleColorClick(e) {
      const containers = document.querySelectorAll(".colorFilter-border");
      for (let i = 0; i < containers.length; i++) {
         containers[i].classList.remove("selected");
      }
      e.target.parentElement.classList.add("selected"); // the event is for the child for some reason. /:
      setSelectedColor(e.target.style.backgroundColor);
      setSelectedSizes([]);
   }

   return <div className={`colorFilter-border ${selectedColor === currentColor ? "selected" : ""}`}>
            <div
               onClick={handleColorClick}
               style={{ backgroundColor: currentColor }}
               className="colorFilter"
            ></div>
         </div>;
}

export default ColorFilter;