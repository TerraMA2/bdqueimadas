({
  baseUrl: ".",
  name: "Startup",
  out: "bdqueimadas.min.js",
  paths: {
    TerraMA2WC: '../externals/TerraMA2WebComponents/javascripts'
  },
  exclude: [
    'TerraMA2WC/TerraMA2WebComponents',
    'TerraMA2WC/components/LayerExplorer.TerraMA2WebComponents',
    'TerraMA2WC/components/MapDisplay.TerraMA2WebComponents'
  ]
})
