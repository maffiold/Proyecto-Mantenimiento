// Configuración de Supabase
const SUPABASE_URL = 'https://jseocskipyhkmzatdplx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DbyAT_qBKj3hDVuBk0zUoQ_sWVAxmXz';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarDesplegables();
  cargarMantenimientos();
});

// Cargar desplegables de Equipos y Técnicos desde Supabase
async function cargarDesplegables() {
  // Cargar Equipos
  const { data: equipos, error: errorEquipos } = await supabaseClient
    .from('equipos')
    .select('id, nombre');

  if (errorEquipos) console.error("Error al cargar equipos:", errorEquipos);

  const selectEquipo = document.getElementById('selectEquipo');
  if (selectEquipo && equipos) {
    selectEquipo.innerHTML = '<option value="">-- Seleccione un equipo --</option>';
    equipos.forEach(e => {
      selectEquipo.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
    });
  }

  // Cargar Técnicos
  const { data: tecnicos, error: errorTecnicos } = await supabaseClient
    .from('tecnicos')
    .select('id, nombre');

  if (errorTecnicos) console.error("Error al cargar técnicos:", errorTecnicos);

  const selectTecnico = document.getElementById('selectTecnico');
  if (selectTecnico && tecnicos) {
    selectTecnico.innerHTML = '<option value="">-- Seleccione un técnico --</option>';
    tecnicos.forEach(t => {
      selectTecnico.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
    });
  }
}

// Cargar lista de mantenimientos en la tabla
async function cargarMantenimientos() {
  const { data, error } = await supabaseClient
    .from('mantenimientos')
    .select(`
      id, equipo_id, tecnico_id, tipo_mantenimiento, jornada, fecha, hora,
      equipos ( nombre, codigo ), tecnicos ( nombre )
    `)
    .order('fecha', { ascending: true });

  if (error) return console.error('Error al cargar mantenimientos:', error);

  const tablaBody = document.getElementById('cuerpoTabla');
  if (!tablaBody) return;
  tablaBody.innerHTML = '';

  data.forEach(m => {
    tablaBody.innerHTML += `
      <tr>
        <td>${m.equipos?.nombre || 'N/A'} (${m.equipos?.codigo || ''})</td>
        <td>${m.tipo_mantenimiento}</td>
        <td>${m.jornada}</td>
        <td>${m.fecha}</td>
        <td>${m.hora}</td>
        <td>${m.tecnicos?.nombre || 'Sin asignar'}</td>
      </tr>
    `;
  });

  filtrarMantenimientos();
}

// Filtrado de la tabla en tiempo real
function filtrarMantenimientos() {
  const tipoSeleccionado = document.getElementById('filtroTipo')?.value.toLowerCase() || '';
  const textoEquipo = document.getElementById('buscarEquipo')?.value.toLowerCase() || '';

  const filas = document.querySelectorAll('#cuerpoTabla tr');
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

  const totalElem = document.getElementById('totalRegistros');
  if (totalElem) totalElem.innerText = contadorVisibles;
}