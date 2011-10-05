({
  appDir: "../dev/", 
  baseUrl: "js", 
  dir: "../deploy/",
  
  optimize: "closure",
  wrap: true,
  
  modules: [
    {
      name: "main",
      optimize: "none"
    }
  ]
})
