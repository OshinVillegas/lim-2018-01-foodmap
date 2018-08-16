const selectCategories = $('#category');

let map;

let lstCategories = [];
let lstRestaurants = [];

$(document).ready(function () {

  $.LoadingOverlay("show", {
    image: "",
    background: "rgb(255,255,255)",
    text: "Cargando Food Map..."
  });

  let getUrl = window.location;
  let baseUrl = getUrl.protocol + "//" + getUrl.host;

  let sourceCategories = baseUrl + 'https://oshinvillegas.github.io/lim-2018-01-foodmap/data/categorias.json';
  let sourceRestaurants = baseUrl + 'https://oshinvillegas.github.io/lim-2018-01-foodmap/data/restaurantes.json';

  $.get(sourceCategories, function (data) {
    lstCategories = data;
  }).done(function () {
    selectCategories.empty();
    selectCategories.append('<option value="0">Tipo De Comida</option>');
    $.each(lstCategories, function (key, value) {
      selectCategories.append('<option value="' + value.codigo + '">' + value.nombre + '</option>');
    });
    selectCategories.prop('selectedIndex', 0);
  });

  $.get(sourceRestaurants, function (data) {
    lstRestaurants = data;
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

  let lstRestaurantsByCategory = $.map(lstRestaurants, function (obj, index) {
    return (index > 0 && obj.categoriaId === categoryId) ? obj : null;
  });

  loadMap(lstRestaurantsByCategory);
});

function loadMap(data) {

  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  $.each(data, function (indice, obj) {
    let title = obj.nombre;
    let latitude = obj.latitude;
    let longitude = obj.longitude;

    let myLatLng = [latitude, longitude];

  
    let myOption = {
     
      zIndexOffset: indice,
    };

    let message = '<table>';
    message += '<tr align="center"><td><h4>' + obj.nombre + '</h4></td></tr>'
    message += '<tr><td><b>Categoria : </b>' + obj.categoriaNombre + '</td></tr>';
    message += '<tr><td><b>Direccion : </b>' + obj.ubicacion + '</td></tr>';
    message += '<tr><td><b>Telefonos : </b>' + obj.telefono + '</td></tr>';
    message += '</table>';

    L.marker(myLatLng, myOption)
      .bindTooltip(title)
      .bindPopup(message)
      .addTo(map);
  });

}