/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import { useParams } from "react-router-dom";

import fetchFn from "../../utils/fetchFn";

import ItemCard from "../card/card";
import Loading from "../loading/loading";

import "./items.css";

function Items({ endpoint, queryId, rootRef, types }) {

   // constants
   const DEVICEWIDTH = document.documentElement.clientWidth;

   const { id } = useParams();

   //! ############# Items Query ###############
   function InfinitFetch({ pageParam = 1 }) {
      return fetchFn(`${endpoint}${pageParam}`, "GET");
   }

   const {
      data: items,
      error,
      fetchNextPage,
      hasNextPage,
      isLoading,
      isFetchingNextPage,
      isSuccess,
   } = useInfiniteQuery(["items", queryId], InfinitFetch, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
   });
   //! ############# Items Query End ###############

   //! ###########  Infinte Scroll Observer ##############
   const containerRef = useRef(null);
   const observerRef = useRef(null);
   useEffect(() => {
      observerRef.current = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
               fetchNextPage();
            }
         },
         { root: rootRef.current, threshold: 0.1, rootMargin: "650px" }
      );

      if (containerRef.current) {
         observerRef.current.observe(containerRef.current);
      }

      return () => {
         if (containerRef.current) {
            observerRef.current.unobserve(containerRef.current);
         }
      };
   }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
   //! ###########  Infinte Scroll Observer End ##############
   
   return (
      <>
         <div className="grid home-main-items">
            {error
               ? <div>{"Error: " + error.message}</div>
               : isSuccess
                  && (items.pages[0].items.length ? items.pages.map((page) => <>
                     {page.items?.map((item) => {
                        
                        if (types && types.length > 0 && !types.includes(item.type)) return;
                        if (id && parseInt(id) === item.id) return;
                        return (
                           <ItemCard
                              key={item.id}
                              id={item.id}
                              name={item.name}
                              price={item.price}
                              img={item.image_path}
                           />
                        );
                     })}
                     {!error && <>
                        <div ref={containerRef}></div>
                        <div></div>
                        {DEVICEWIDTH >= 450 && <div></div>}
                     </>}
                  </>) : <div>Nothing to show.</div>)}
         </div>
         {(isFetchingNextPage || isLoading) && <Loading /> }
      </>
   );
}

export default Items;
