// Limites géographiques d'Haïti (coordonnées extrêmes)
export const haitiBounds = [
    [17.0, -75.0], // Sud-ouest (coin inférieur gauche)
    [20.2, -71.0]  // Nord-est (coin supérieur droit)
  ]
  
  // Centre par défaut (Port-au-Prince)
  export const defaultCenter = [18.594, -72.307]
  
  // Zoom minimum et maximum
  export const minZoom = 9   // Vue générale d'Haïti - min zoom out for haiti
  export const maxZoom = 16  // Vue très détaillée
  export const defaultZoom = 11
  
  // Limites pour Port-au-Prince et ses communes
  export const portAuPrinceBounds = [
    [18.45, -72.45], // Sud-ouest
    [18.65, -72.15]  // Nord-est
  ]