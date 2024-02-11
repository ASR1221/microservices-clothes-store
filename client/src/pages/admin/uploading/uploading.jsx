import { useContext, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";

import fetchFn from "../../../utils/fetchFn";
import { dialogContext } from "../../../context/dialogContext";

import Loading from "../../../components/loading/loading";

import "./uploading.css";
import Button from "../../../components/button/button";

function Uploading() {

   const [isUpload, setIsUpload] = useState(true);
   const showDialog = useContext(dialogContext);

   const { isLoading, mutate } = useMutation({
      mutationFn: async (body) => {
         if (isUpload) {
            const res = await fetch("/api/admin/item/add", {
               method: "POST",
               headers: {
                  "Authorization": `Bearer ${localStorage.getItem("ssID")}`,
               },
               body
            });
            if (!res.ok) {
               const body = await res.json();
               throw new Error(body.message);
            }
            return res.json();
         }

         return fetchFn("/admin/item/update", "PUT", localStorage.getItem("ssID"), body);
      },
      onError: (error) => showDialog(`${error}. Please try again.`),
      onSuccess: (data) => {
         localStorage.setItem("ssID", data.sessionToken);
         showDialog("Item added");
         setFormData({
            name: "",
            price: "",
            section: "men",
            type: "jeans",
            details: [],
         });
         setFiles([]);
         setItemId(0);
         setAddedColors([{
            color: "red",
            sizes: [
               { size: "XS", stock: 0 },
            ],
         }]);
      },
   });

   const navigate = useNavigate();

   useQuery(
      ["admin_check"],
      () => fetchFn("/user/auth/role", "GET", localStorage.getItem("ssID")),
      {
         onSuccess: (data) => {
            if (!data.roles.includes("uploading")) {
               navigate("/");
               return;
            }
            localStorage.setItem("ssID", data.sessionToken);
         },
         onError: () =>  navigate("/"),
      }
   );

   const [addedColors, setAddedColors] = useState([{
      color: "red",
      sizes: [
         { size: "XS", stock: 0 },
      ],
   }]);
   
   const [itemId, setItemId] = useState(0);
   const [formData, setFormData] = useState({
      name: "",
      price: "",
      section: "men",
      type: "jeans",
      details: [],
   });
   const [files, setFiles] = useState([]);

   function handleTextChange(e) {
      let { name, value } = e.target;
      setFormData(p => ({ ...p, [name]: value }));
   }

   function handleColorChange(e, i) {
      const colors = [...addedColors];
      colors[i].color = e.target.value;
      setAddedColors(colors);
   } 
   
   function handleSizeAndStockChange(e, colorI, sizeI) {
      const updatedColors = [...addedColors];

      const sizes = [...updatedColors[colorI].sizes];
      sizes[sizeI][e.target.name] = e.target.value;

      updatedColors[colorI].sizes = sizes;

      setAddedColors(updatedColors);
   }
   
   function handleFileChange(e) {
      setFiles(e.target.files);
   }

   //! ******** ADD and REMOVE COLORS or SIZE ********
   
   function handleAddColor(e) {
      e.preventDefault();
      setAddedColors(p => ([
         ...p, {
         color: "red",
         sizes: [
            { size: "XS", stock: 0 },
         ],
      }]));
   }
   
   function handleRemoveColor(e) {
      e.preventDefault();
      const color = [...addedColors];
      color.pop();
      setAddedColors(color);
   }

   function handleAddSize(e, i) {
      e.preventDefault();
      const updatedColors = [...addedColors];

      const sizes = [...updatedColors[i].sizes];
      sizes.push({ size: 'XS', stock: 0 });

      updatedColors[i].sizes = sizes;

      setAddedColors(updatedColors);
   }

   function handleRemoveSize(e, i) {
      e.preventDefault();
      const updatedColors = [...addedColors];
    
      const sizes = [...updatedColors[i].sizes];
      sizes.pop();

      updatedColors[i].sizes = sizes;

      setAddedColors(updatedColors);
   }

   //! ********* END ADD and REMOVE COLORS or SIZE **********


   //! ******** SEND TO SERVER ***********
   function handleSubmit(e) {
      e.preventDefault();
      if (isUpload) {
         const bodyData = new FormData();
         for (let i = 0; i < files.length; i++) {
            bodyData.append("images", files[i]);
         }
         const newFormData = { ...formData, details: addedColors }
         bodyData.append("json", JSON.stringify(newFormData));
   
         mutate(bodyData);
      } else {
         const bodyData = { id: itemId, details: [...addedColors] };
         mutate(bodyData);
      }
   }
   //! ********** END SEND TO SERVER **************


   return <div className="cart-container">
      <div className="logo-container">
         <img className="img" src="/icons/asr-logo.svg" alt="ASR Logo" />
      </div>
      <h1>Upload</h1>
      <div>
         <form onSubmit={handleSubmit} >
            <div>
               <select
                  name="select"
                  value={isUpload ? "uploade" : "update"}
                  onChange={(e) => e.target.value === "upload" ? setIsUpload(true) : setIsUpload(false)}
                  required
               >
                     <option value="upload">upload</option>
                     <option value="update">update</option>
               </select>
            </div>
            <div className="grid uploading-name-container">
               {
                  isUpload ? <>
                     <label htmlFor="name">Name: </label>
                     <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleTextChange}
                        required
                     />
                     <label htmlFor="price">Price: </label>
                     <input
                        type="text"
                        name="price"
                        pattern="^\d+$"
                        value={formData.price}
                        onChange={handleTextChange}
                        required
                     />
                     <label htmlFor="section">Section: </label>
                     <select name="section" value={formData.section} onChange={handleTextChange} required>
                        <option value="men">men</option>
                        <option value="women">women</option>
                        <option value="kids">kids</option>
                     </select>
                     <label htmlFor="type">Type: </label>
                     <select name="type" value={formData.type} onChange={handleTextChange} required>
                        <option value="jeans">jeans</option>
                        <option value="shirts">shirts</option>
                        <option value="coats">coats</option>
                        {
                           formData.section !== "men" && <>
                              <option value="dresses">dresses</option>
                              <option value="skirts">skirts</option>
                           </>
                        }
                     </select>
                  </>
                  : <>
                     <label htmlFor="id">Item id: </label>
                     <input
                        type="number"
                        name="id"
                        value={itemId}
                        onChange={e => setItemId(e.target.value)}
                     />
                  </>
               }
            </div>
            <div>
               {
                  addedColors.map( (obj, i) => <div key={i} className="uploading-color-container">
                     <label htmlFor="color">Color: </label>
                     <select
                        name="color"
                        onChange={(e) => handleColorChange(e, i)}
                        required
                        className="uploading-color-select"
                     >
                        <option value="red">red</option>
                        <option value="blue">blue</option>
                        <option value="yellow">yellow</option>
                        <option value="green">green</option>
                        <option value="black">black</option>
                        <option value="white">white</option>
                     </select>
                     {
                        addedColors[i].sizes.map((sizeObj, sizeI) => <div key={sizeI}>
                           <label htmlFor="size">Size: </label>
                           <select
                              name="size"
                              onChange={(e) => handleSizeAndStockChange(e, i, sizeI)}
                              required
                              className="uploading-color-select"
                           >
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                              <option value="XXXL">XXXL</option>
                           </select>
                           <label htmlFor="stock">Stock for this size: </label>
                           <input
                              type="number"
                              name="stock"
                              value={addedColors[i].sizes[sizeI].stock}
                              onChange={(e) => handleSizeAndStockChange(e, i, sizeI)}
                              required
                           />
                        </div>)
                     }
                     <Button text={"Add Size"} fn={(e) => handleAddSize(e, i)}/>
                     <Button text={"Remove Size"} fn={(e) => handleRemoveSize(e, i)}/>
                  </div>)
               }
            </div>
            <div className="uploading-file-container">
               <Button text={"Add Color"} fn={handleAddColor}/>
               <Button text={"Remove Color"} fn={handleRemoveColor} />
               {isUpload && <input
                  type="file"
                  name="images"
                  accept="image/png, image/jpeg"
                  multiple
                  required
                  onChange={handleFileChange}
               />}
               <button type="submit" className="btn">Submit</button>
            </div>
         </form>
      </div>
      {isLoading && <Loading />}
   </div>;
}

export default Uploading;