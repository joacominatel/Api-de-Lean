document.addEventListener("DOMContentLoaded", function () {
  axios
    .get("/tasks/get_tasks")
    .then(function (response) {
      const tasksContainer = document.getElementById("tasksContainer");

      // se recorren las tareas y se crean los elementos
      response.data.forEach((task) => {
        // crear div con clase task-item
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-item");

        // si la tarea es importante, se marca como checked
        const checkedAttribute = task.important ? "checked" : "";

        // se crea el elemento de la tarea
        taskElement.innerHTML = `
                    <label>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" name="taskStatus" value="${task.task}" ${checkedAttribute} onchange="updateTaskStatus(this)">
                            <svg viewBox="0 0 35.6 35.6">
                            <circle class="background" cx="17.8" cy="17.8" r="17.8"></circle>
                            <circle class="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
                            <polyline class="check" points="11.78 18.12 15.55 22.23 25.17 12.87"></polyline>
                        </svg>
                        ${task.task}
                        </div>
                    </label>
                `;

        // se agrega el elemento al contenedor
        tasksContainer.appendChild(taskElement);
      });
    })
    .catch(function (error) {
      console.error("Error al cargar las tareas:", error);
    });
});

function updateTaskStatus(checkbox) {
  const taskName = checkbox.value;
  const isEnabled = checkbox.checked;
  axios
    .post("/tasks/update_task_status", {
      task: taskName,
      enabled: isEnabled,
    })
    .then(function (response) {
      console.log("Estado actualizado:", response.data);
    })
    .catch(function (error) {
      console.error("Error al actualizar el estado:", error);
    });
}
