function lala(layer) {
  if(layer.hasOwnProperty('Layer')) {
    lala(layer.Layer);
  } else {
    add(layer);
  }
}
