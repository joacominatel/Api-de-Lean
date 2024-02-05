// alert('Holis!');
document
  .getElementById("dark-mode-switch")
  .addEventListener("click", function () {
    let nav = document.getElementsByTagName("nav")[0];
    let li = nav.getElementsByTagName("li");

    document.body.classList.toggle("dark");
    nav.classList.toggle("dark");

    for (let i = 0; i < li.length; i++) {
      li[i].classList.toggle("dark");
    }

    // console.log('click')
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("dark-mode", "true");
    } else {
      localStorage.setItem("dark-mode", "false");
    }
  });

if (localStorage.getItem("dark-mode") === "true") {
  document.body.classList.add("dark");
  document.getElementsByTagName("nav")[0].classList.add("dark");
  let li = document.getElementsByTagName("nav")[0].getElementsByTagName("li");
  for (let i = 0; i < li.length; i++) {
    li[i].classList.add("dark");
  }
}

function onIdFilterChange() {
  document.getElementById("status-filter-form").submit();
}

function loadIdOptions() {
  // realiza una solicitud AJAX para obtener las opciones de ID desde flask
  fetch("/get_id_options")
    .then((response) => response.json())
    .then((data) => {
      // Llena las opciones de la lista
      const selectElement = document.getElementById("id_filter");
      selectElement.innerHTML = '<option value="">ID</option>';
      data.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.id;
        optionElement.textContent = option.name;
        selectElement.appendChild(optionElement);
      });
      // agregar una opcion para mostrar todos los registros con valor 0
      const optionElement = document.createElement("option");
      optionElement.value = "0";
      optionElement.textContent = "Todos";
      selectElement.appendChild(optionElement);

      // establece el valor seleccionado
      const selectedId = document.getElementById("selected_id").value;
      selectElement.value = selectedId;
    });
}

// Manejo del datetime
function onTimestampFromChange() {
  document.getElementById("timestamp-filter-form").submit(); // envia el formulario al cambiar el valor
}

// carga las opciones de id
window.onload = function () {
  loadIdOptions();

  // Coloca automaticamente el dia de ayer como fecha inicial
  const timestampFrom = document.getElementById("timestamp_from");
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);
  timestampFrom.valueAsDate = yesterday;
};

// si la fecha del td es hoy o ayer, se agrega la clase .bg-success
const tds = document.querySelectorAll("td");
const today = new Date();

tds.forEach((td) => {
  const date = new Date(td.textContent);
  if (date.toDateString() === today.toDateString()) {
    td.parentElement.classList.add("bg-success");
  }
});