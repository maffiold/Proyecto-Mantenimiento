const SUPABASE_URL = 'https://jseocskipyhkmzatdplx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DbyAT_qBKj3hDVuBk0zUoQ_sWVAx';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  cargarDesplegables();
  cargarMantenimientos();
});

async function cargarDesplegables() {
  const { data: equipos } = await supabaseClient.from('equipos').select('id, nombre, codigo');
  const selectEquipo = document.getElementById('selectEquipo');
  equipos?.forEach(e => {
    selectEquipo.innerHTML += `<option value="${e.id}">${e.nombre} (${e.codigo})</option>`;
  });

  const { data: tecnicos } = await supabaseClient.from('tecnicos').select('id, nombre');
  const selectTecnico = document.getElementById('selectTecnico');
  tecnicos?.forEach(t => {
    selectTecnico.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
  });
}

async function cargarMantenimientos() {
  const { data, error } = await supabaseClient
    .from('mantenimientos')
    .select(`
      id, equipo_id, tecnico_id, tipo_mantenimiento, jornada, fecha, hora,
      equipos ( nombre, codigo ), tecnicos ( nombre )
    `)
    .order('fecha', { ascending: true });

  if (error) return console.error('Error al cargar datos:', error);

  const tablaBody = document.getElementById('cuerpoTabla');
  tablaBody.innerHTML = '';

  data.forEach(m => {
    tablaBody.innerHTML += `
      <tr>
        <td>${m.equipos?.nombre || 'N/A'} (${m.equipos?.codigo || ''})</td>
        <td>${m.tipo_mantenimiento}</td>
        <td>${m.jornada}</td>
        <td>${m.fecha} ${m.hora}</td>
        <td>${m.tecnicos?.nombre || 'Sin asignar'}</td>
        <td>
          <button onclick="prepararEdicion(${m.id}, ${m.equipo_id}, '${m.tipo_mantenimiento}', '${m.jornada}', '${m.fecha}', '${m.hora}', ${m.tecnico_id})">Editar</button>
          <button class="btn-eliminar" onclick="eliminarMantenimiento(${m.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
  filtrarMantenimientos();
}

function validarFormulario(payload) {
  if (!payload.equipo_id || !payload.tipo_mantenimiento || !payload.jornada || !payload.fecha || !payload.hora || !payload.tecnico_id) {
    alert("Por favor complete todos los campos del formulario.");
    return false;
  }
  return true;
}

document.getElementById('formularioMantenimiento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('mantenimientoId').value;
  const payload = {
    equipo_id: document.getElementById('selectEquipo').value,
    tipo_mantenimiento: document.getElementById('selectTipo').value,
    jornada: document.getElementById('selectJornada').value,
    fecha: document.getElementById('inputFecha').value,
    hora: document.getElementById('inputHora').value,
    tecnico_id: document.getElementById('selectTecnico').value
  };

  if (!validarFormulario(payload)) return;

  if (id) {
    const { error } = await supabaseClient.from('mantenimientos').update(payload).eq('id', id);
    if (error) alert("Error al actualizar: " + error.message);
    else alert("Registro actualizado correctamente.");
  } else {
    const { error } = await supabaseClient.from('mantenimientos').insert([payload]);
    if (error) alert("Error al guardar: " + error.message);
    else alert("Mantenimiento programado con éxito.");
  }

  limpiarFormulario();
  cargarMantenimientos();
});

function prepararEdicion(id, equipo_id, tipo, jornada, fecha, hora, tecnico_id) {
  document.getElementById('mantenimientoId').value = id;
  document.getElementById('selectEquipo').value = equipo_id;
  document.getElementById('selectTipo').value = tipo;
  document.getElementById('selectJornada').value = jornada;
  document.getElementById('inputFecha').value = fecha;
  document.getElementById('inputHora').value = hora;
  document.getElementById('selectTecnico').value = tecnico_id;

  document.getElementById('tituloFormulario').innerText = "Editar Mantenimiento";
  document.getElementById('btnGuardar').innerText = "Actualizar Cambios";
  document.getElementById('btnCancelar').style.display = "inline-block";
}

function limpiarFormulario() {
  document.getElementById('mantenimientoId').value = '';
  document.getElementById('formularioMantenimiento').reset();
  document.getElementById('tituloFormulario').innerText = "Programar Nuevo Mantenimiento";
  document.getElementById('btnGuardar').innerText = "Guardar Programación";
  document.getElementById('btnCancelar').style.display = "none";
}

async function eliminarMantenimiento(id) {
  if (confirm("¿Está seguro de que desea eliminar este mantenimiento?")) {
    const { error } = await supabaseClient.from('mantenimientos').delete().eq('id', id);
    if (error) alert("Error al eliminar: " + error.message);
    else {
      alert("Registro eliminado exitosamente.");
      cargarMantenimientos();
    }
  }
}// Función para filtrar los mantenimientos en tiempo real
function filtrarMantenimientos() {
  const tipoSeleccionado = document.getElementById('filtroTipo').value.toLowerCase();
  const textoEquipo = document.getElementById('buscarEquipo').value.toLowerCase();
  
  const filas = document.querySelectorAll('#tablaMantenimientos tbody tr');
  let contadorVisibles = 0;

  filas.forEach(fila => {
    const equipo = fila.children[0]?.innerText.toLowerCase() || '';
    const tipo = fila.children[1]?.innerText.toLowerCase() || '';

    const coincideTipo = !tipoSeleccionado || tipo.includes(tipoSeleccionado);
    const coincideEquipo = !textoEquipo || equipo.includes(textoEquipo);

    if (coincideTipo && coincideEquipo) {
      fila.style.display = '';
      contadorVisibles++;
    } else {
      fila.style.display = 'none';
    }
  });

  document.getElementById('totalRegistros').innerText = contadorVisibles;
}