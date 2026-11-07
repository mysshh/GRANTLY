/* GRANTLY frontend entry point. Feature modules load in dependency order. */
(function(){
  const modules=[
    "/js/site.js",
    "/js/catalogue.js",
    "/js/smartmatch.js",
    "/js/tracker.js",
    "/js/student-hub.js",
    "/js/account.js"
  ];
  let chain=Promise.resolve();
  modules.forEach(src=>{
    chain=chain.then(()=>new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src=src;
      script.onload=resolve;
      script.onerror=()=>reject(new Error("Could not load "+src));
      document.head.appendChild(script);
    }));
  });
  chain.catch(error=>console.error("GRANTLY feature loading error:",error));
})();