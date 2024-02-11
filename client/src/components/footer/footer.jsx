import "./footer.css"

function Footer() {
   return (  
      <footer className="flex">
         <img src="/icons/asr-logo.svg" alt="ASR logo" className="footer-img"/>
         <div className="footer-text">
            <p>This website is by Abdullah Salah using react</p>
            <p>Contact Info:</p>
            <p>Phone number: +964 771 382 1672</p>
            <p>Email: <a href="mailto:asr12211@outlook.com">asr12211@outlook.com</a></p>
         </div>
      </footer>
   );
}

export default Footer;