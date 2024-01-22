import "./button.css"

// eslint-disable-next-line react/prop-types
function Button({text, fn, disabled}) {
   return (  
      <button className="btn" onClick={fn} disabled={disabled}>
         {text}
      </button>
   );
}

export default Button;