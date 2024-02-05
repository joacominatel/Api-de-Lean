document.addEventListener("DOMContentLoaded", () => {
  const darkModeSwitch = document.getElementById("dark-mode-switch");
  const nav = document.querySelector("nav");
  const liElements = nav.getElementsByTagName("li");

  function toggleDarkMode() {
    document.body.classList.toggle("dark");
    nav.classList.toggle("dark");
    Array.from(liElements).forEach((li) => li.classList.toggle("dark"));

    localStorage.setItem(
      "dark-mode",
      document.body.classList.contains("dark").toString()
    );
  }

  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
    nav.classList.add("dark");
    Array.from(liElements).forEach((li) => li.classList.add("dark"));
  }

  darkModeSwitch.addEventListener("click", toggleDarkMode);

  const idFilterSelect = document.getElementById("id_filter");
  const timestampInput = document.getElementById("timestamp_from");

  let currentPage = 1; // define la pagina default

  function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage < 1) return; // no permite ir a paginas negativas

    currentPage = newPage; // actualiza la pagina actual

    // obtiene los parametros actuales y los actualiza con la nueva pagina
    const params = {
      page: currentPage,
      timestamp_from: document.getElementById("timestamp_from").value, // asume el input del timestamp
      id_filter: document.getElementById("id_filter").value, // asume el input del id_filter
    };

    fetchData(params); // obtiene los datos
  }

  window.changePage = changePage; // lo agrega al scope global

  function fetchData(params) {
    axios
      .get("/api/view_status", { params })
      .then((response) => {
        updateTable(response.data.items); // actualiza la tabla
        updatePagination(
          currentPage,
          response.data.hasPrevious,
          response.data.hasNext
        );
      })
      .catch((error) => console.error("Error al cargar los datos:", error));
  }

  function updateTable(data) {
    const tbody = document.getElementById("statusData");
    tbody.innerHTML = ""; // limpia la tabla
    data.forEach((item) => {
      // formatea las horas del ts1 y ts2
      const formattedTs1 = formatDate(item.ts1);
      const formattedTs2 = formatDate(item.ts2);

      // si la fecha de ts1,ts2 es hoy , agrega la clase "bg-success"
      const today = formatDate(new Date());
      const bgClass = today === formattedTs1 || today === formattedTs2 ? "bg-success" : "";

      // si el item.mins es mayor a 25, agrega la clase "bg-warning"
      const bgClassWarn = item.mins > 25 ? "bg-warning" : "";

      // construye la tabla con los datos actualizados
      const row = `<tr class="${bgClass}">
        <td>${item.cliente_id}</td>
        <td>${item.cliente_nombre}</td>
        <td>${item.task}</td>
        <td>${formattedTs1}</td>
        <td>${formattedTs2}</td>
        <td class="${bgClassWarn}">${item.mins}</td>
        <td>${item.data}</td>
        <td>${item.ipaddr}</td>
      </tr>`;
      tbody.innerHTML += row;
    });
  }

  function formatDate(dateString) {
    if (!dateString) return ""; // si la fecha es null, retorna un string vacio

    const date = new Date(dateString);
    const day = padTo2Digits(date.getDate());
    const month = padTo2Digits(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function padTo2Digits(num) {
    // no se lo hizo gpt esto, creo que verifica la cantidad de digitos
    return num.toString().padStart(2, "0");
  }

  function updatePagination(page, hasPrevious, hasNext) {
    document.getElementById("currentPage").textContent = page; // cambia el numero de la pagina
    // actualiza las clases de los botones de paginacion
    document.getElementById("prevPage").className = hasPrevious
      ? "page-link"
      : "page-link disabled";
    document.getElementById("nextPage").className = hasNext
      ? "page-link"
      : "page-link disabled";
    // igual no anda no se porque
  }

  idFilterSelect.addEventListener("change", () => {
    const selectedId = idFilterSelect.value;
    const timestampFrom = timestampInput.value;
    fetchData({ id_filter: selectedId, timestamp_from: timestampFrom });
  });

  timestampInput.addEventListener("change", () => {
    const selectedId = idFilterSelect.value;
    const timestampFrom = timestampInput.value;
    fetchData({ id_filter: selectedId, timestamp_from: timestampFrom });
  });

  loadIdOptions();
  presetDate("timestamp_from", -1);
});

function loadIdOptions() {
  axios
    .get("/get_id_options")
    .then((response) => {
      const data = response.data;
      const selectElement = document.getElementById("id_filter");
      selectElement.innerHTML =
        '<option value="">ID</option>' +
        data
          .map(
            (option) => `<option value="${option.id}">${option.name}</option>`
          )
          .join("");
      selectElement.innerHTML += '<option value="0">Todos</option>';
    })
    .catch((error) =>
      console.error("Hubo un error cargando las opciones de ID", error)
    );
}

function presetDate(inputId, dayOffset) {
  const input = document.getElementById(inputId);
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);
  input.valueAsDate = today;
}
