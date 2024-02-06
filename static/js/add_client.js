function enviarFormulario(e) {
  e.preventDefault(); 

  // obtener los inputs
  const id = document.getElementById('id').value;
  const name = document.getElementById('name').value;
  
  // peticion POST mediante axios
  axios.post('/add_client', {
      id: id,
      name: name
  })
  .then(function (_response) {
      alert('Cliente agregado exitosamente');
      window.location.href = '/view_status'; // redireccionar a '/view_status'
  })
  .catch(function (error) {
      // en caso de error, mostrarlo en consola y en un alert
      console.log(error);
      alert('Error al agregar el cliente');
  });
}