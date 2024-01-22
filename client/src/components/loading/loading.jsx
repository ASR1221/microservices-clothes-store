import "./loading.css";

function Loading({ width = "50px" }) {
   return <div className="flex loading-container">
      <img
         src="/icons/asr-logo.svg"
         alt="ASR logo"
         className="loading"
         style={{width}}
      />
      <p>Loading</p>
   </div>;
}

export default Loading;