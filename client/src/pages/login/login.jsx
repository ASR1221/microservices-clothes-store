import "./login.css";

const googleURL = "https://accounts.google.com/o/oauth2/v2/auth?";
const googleOptions = {
   client_id: "450145178762-ve8m4krlq5cc02rp54ipkmtktlg58p11.apps.googleusercontent.com",
   redirect_uri: "http://localhost:3006",
   response_type: "token",
   scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
};

const facebookURL = "https://www.facebook.com/v16.0/dialog/oauth?";
const facebookOptions = {
   client_id: "1409874359834789",
   redirect_uri: "http://localhost:3006",
   response_type: "token",
   scope: "email",
};

function Login() {

   return <div className="login-container">
      <img src="/icons/asr-logo.svg" alt="ASR logo" />
      <h1>Sign Up or Log In</h1>
      <p>No need for another password.<br />You can sign in using your accounts.</p>
      <a href={googleURL + new URLSearchParams(googleOptions).toString()} className="btn login-btn google relative">
         <img src="/icons/icons8-google.svg" alt="google logo" className="login-btn-img absolute" />
         with Google
      </a>
      <a href={facebookURL + new URLSearchParams(facebookOptions).toString()} className="btn login-btn facebook relative">
         <img src="/icons/facebook-logo.svg" alt="facebook logo" className="login-btn-img absolute" />
         with facebook
      </a>
   </div>;
}

export default Login;