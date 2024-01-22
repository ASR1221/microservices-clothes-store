import React from "react";
import ReactDOM from "react-dom/client";
import App from "./router/appRouter";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import "./main.css";

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,
      }
   }
});

ReactDOM.createRoot(document.getElementById("root")).render(
   <React.StrictMode>
      <QueryClientProvider client={queryClient} >
         <BrowserRouter>
            <App />
         </BrowserRouter>
      </QueryClientProvider>
   </React.StrictMode>
);

// TODO: create a branch a make the front end in it
