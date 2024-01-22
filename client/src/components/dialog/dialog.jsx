import { forwardRef } from "react";
import "./dialog.css";

const Dialog = forwardRef(({ text }, ref) => {
   return <dialog className="dialog transition-1" ref={ref}>
      <p>{text}</p>
   </dialog>
});

export default Dialog;