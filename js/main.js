const selectCategories = $('#category');

let map; 

//Inicializar arreglos
let lstCategories = [];
let lstRestaurants = [];

$(document).ready(function () {

  $.LoadingOverlay("show", {
    image: "",
    background: "rgb(255,255,255)",
    text: "Cargando Food Map..."
  });

  // Obteniendos tipos de restaurantes del api de datos abiertos de miraflores
  let keyApi = '221963a66d7626ddce1417c481c60b142e19ee65';
  let sourceCategories = 'http://miraflores.cloudapi.junar.com/api/v2/datastreams/TIPO-DE-RESTA/data.pjson/?auth_key=' + keyApi;

  $.get(sourceCategories, function (data) {
    console.log(data);
    let lastPos = data.result.length - 1;
    console.log(data.result);
    lstCategories = $.map(data.result, function (fila, indice) {
      return (indice > 0 && indice < lastPos) ? fila : null;
    });
    console.log(lstCategories);
  }).done(function () {
    // Cargar datos en el select
    selectCategories.empty();
    selectCategories.append('<option value="0">Tipo de Comida</option>');
    $.each(lstCategories, function (key, value) {
      selectCategories.append('<option value="' + value['CODIGO-TIPO'] + '">' + value['TIPO-RESTAURANT'] + '</option>');
    });
    selectCategories.prop('selectedIndex', 0);
  });

  // Obteniendo coordenadas usando https://www.gps-coordinates.net/
  let getUrl = window.location;
  let baseUrl = getUrl.protocol + "//" + getUrl.host;

  let sourceRestaurants =  'https://oshinvillegas.github.io/lim-2018-01-foodmap/data/restaurantes.json';

  $.get(sourceRestaurants, function (data) {
    lstRestaurants = data;
    console.log(lstRestaurants);
  });


  map = L.map('map').setView([-12.121719, -77.02925], 14);

  let osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  let osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

  L.tileLayer(osmUrl, {
    attribution: osmAttrib,
  }).addTo(map);


  setTimeout(function () {
    $.LoadingOverlay("hide");
  }, 2000);

});

selectCategories.on('change', function () {
  let categoryId = parseInt($(this).val());
  console.log(categoryId);
  let lstRestaurantsByCategory = $.map(lstRestaurants, function (obj, index) {
    return (index > 0 && obj.categoriaId === categoryId) ? obj : null;
  });
  console.log(lstRestaurantsByCategory);

  //Pintar datos en mapa
  //funcion para limpiar mapa
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  $.each(lstRestaurantsByCategory, function (indice, obj) {
    let title = obj.nombre;
    let latitude = obj.latitude;
    let longitude = obj.longitude;

    let coordinates = [latitude, longitude];

    

    let option = {
      zIndexOffset: indice,
    };

    let message = '<table>';
    message += '<tr align="center"><td><h4>' + obj.nombre + '</h4></td></tr>'
    message += '<tr><td><b>Categoria : </b>' + obj.categoriaNombre + '</td></tr>';
    message += '<tr><td><b>Direccion : </b>' + obj.ubicacion + '</td></tr>';
    message += '<tr><td><b>Telefonos : </b>' + obj.telefono + '</td></tr>';
    message += '</table>';

    L.marker(coordinates, option)
      .bindTooltip(title)
      .bindPopup(message)
      .addTo(map);
  });
});
