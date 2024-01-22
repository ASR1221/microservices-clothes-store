export default async function (path, method, auth, body) {
   const options = {
      method,
      headers: {
         "Content-Type": "application/json",
      },
   }
   
   if (body) options.body = JSON.stringify(body);
   if (auth) options.headers.Authorization = `Bearer ${auth}`;

   const res = await fetch(`/api${path}`, options);

   if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message);
   }
   return res.json(); 
}