/* 数学宇宙 sw.js（build_math.py 产·P16 件二）：壳与数据各自按内容哈希独立缓存
   —— 改壳不重下数据、改数据不重下壳。cache-first + 后台更新 + 导航兜底 index.html。 */
var V="m-shell-c30eae5c", DATA="m-data-b7f352a5";
var PRE=["./", "./index.html", "./sync_cfg.js", "./manifest.json", "./icon-512.png", "./icon-192.png", "./icon-180.png"], PRED=["./math_data.js"];
self.addEventListener("install",function(e){
  e.waitUntil(Promise.all([
    caches.open(V).then(function(c){return c.addAll(PRE);}),
    caches.open(DATA).then(function(c){return c.addAll(PRED);})
  ]).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==V&&k!==DATA;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  var u; try{u=new URL(e.request.url);}catch(err){return;}
  if(u.origin!==location.origin)return;              /* 跨域（云档 API 等）直通不拦 */
  if(e.request.method!=="GET")return;
  var cn=/math_data\.js$/.test(u.pathname)?DATA:V;
  e.respondWith(caches.open(cn).then(function(c){
    return c.match(e.request,{ignoreSearch:true}).then(function(hit){
      var net=fetch(e.request).then(function(r){
        if(r&&r.ok){try{c.put(e.request,r.clone());}catch(x){}}
        return r;
      }).catch(function(err){if(hit)return hit;throw err;});
      return hit||net;                                /* cache-first；命中后后台自更新 */
    });
  }).catch(function(err){
    if(e.request.mode==="navigate")return caches.open(V).then(function(c){return c.match("./index.html");});
    return Promise.reject(err);
  }));
});
