// ../itb-motor/src/motor/condiciones.ts
function cumpleRango(valor2, rango) {
  if (rango.min !== void 0) {
    const cumple2 = rango.minExcluido ? valor2 > rango.min : valor2 >= rango.min;
    if (!cumple2) return false;
  }
  if (rango.max !== void 0) {
    const cumple2 = rango.maxExcluido ? valor2 < rango.max : valor2 <= rango.max;
    if (!cumple2) return false;
  }
  return true;
}
function coincide(valor2, esperado) {
  return Array.isArray(esperado) ? esperado.includes(valor2) : valor2 === esperado;
}
function cumpleCondiciones(embarcacion, condiciones) {
  if (condiciones.lista !== void 0 && embarcacion.lista !== condiciones.lista) {
    return false;
  }
  if (condiciones.esloraCascoM !== void 0 && !cumpleRango(embarcacion.esloraCascoM, condiciones.esloraCascoM)) {
    return false;
  }
  if (condiciones.materialCasco !== void 0 && !coincide(embarcacion.materialCasco, condiciones.materialCasco)) {
    return false;
  }
  if (condiciones.marcadoCE !== void 0 && embarcacion.marcadoCE !== condiciones.marcadoCE) {
    return false;
  }
  if (condiciones.categoriaDiseno !== void 0) {
    if (embarcacion.categoriaDiseno === void 0) return false;
    if (!coincide(embarcacion.categoriaDiseno, condiciones.categoriaDiseno)) {
      return false;
    }
  }
  return true;
}
function cumpleZona(zona2, condicion) {
  if (typeof condicion === "number") return zona2 === condicion;
  if (Array.isArray(condicion)) return condicion.includes(zona2);
  const rango = condicion;
  if (rango.min !== void 0 && zona2 < rango.min) return false;
  if (rango.max !== void 0 && zona2 > rango.max) return false;
  return true;
}
function cumpleCondicionesEquipo(embarcacion, contexto, condiciones) {
  if (!cumpleCondiciones(embarcacion, condiciones)) return false;
  if (condiciones.zona !== void 0 && !cumpleZona(contexto.zona, condiciones.zona)) {
    return false;
  }
  if (condiciones.personasABordo !== void 0 && !cumpleRango(contexto.personasABordo, condiciones.personasABordo)) {
    return false;
  }
  if (condiciones.navegacionDiurna !== void 0 && contexto.navegacionDiurna !== condiciones.navegacionDiurna) {
    return false;
  }
  const rangos = [
    [condiciones.esloraTotalM, embarcacion.esloraTotalM],
    [condiciones.potenciaKw, embarcacion.potenciaKw]
  ];
  for (const [rango, valor2] of rangos) {
    if (rango === void 0) continue;
    if (valor2 === void 0) return false;
    if (!cumpleRango(valor2, rango)) return false;
  }
  const enumeraciones = [
    [condiciones.propulsion, embarcacion.propulsion],
    [condiciones.disposicionMotor, embarcacion.disposicionMotor],
    [condiciones.combustible, embarcacion.combustible]
  ];
  for (const [esperado, valor2] of enumeraciones) {
    if (esperado === void 0) continue;
    if (valor2 === void 0) return false;
    if (!coincide(valor2, esperado)) return false;
  }
  const booleanos = [
    [condiciones.espacioHabitableGobierno, embarcacion.espacioHabitableGobierno],
    [condiciones.espacioHabitableCerrado, embarcacion.espacioHabitableCerrado],
    // La lista 6.ª equivale a fines comerciales o lucrativos: criterio del director del TFG
    // (15/09/2026). Hasta entonces eran dos datos independientes y un barco de chárter
    // con la casilla sin marcar se libraba del extintor adicional y de la revisión de balsas
    // cada 24 meses.
    [condiciones.finesComerciales, embarcacion.lista === 6 ? true : embarcacion.finesComerciales],
    [condiciones.equiposRadioelectricos, embarcacion.equiposRadioelectricos],
    [condiciones.camarasFlotabilidad, embarcacion.camarasFlotabilidad],
    [condiciones.instalacionGasCombustible, embarcacion.instalacionGasCombustible],
    [
      condiciones.compartimentoInteriorConMotorODeposito,
      embarcacion.compartimentoInteriorConMotorODeposito
    ],
    [condiciones.arranqueElectricoMotor, embarcacion.arranqueElectricoMotor],
    [
      condiciones.motorEnEncajonamientoSobreCubierta,
      embarcacion.motorEnEncajonamientoSobreCubierta
    ],
    [condiciones.inodoros, embarcacion.inodoros],
    [condiciones.depositoRetencionFijo, embarcacion.depositoRetencionFijo]
  ];
  for (const [esperado, valor2] of booleanos) {
    if (esperado === void 0) continue;
    if ((valor2 ?? false) !== esperado) return false;
  }
  return true;
}

// ../itb-motor/src/motor/vigencia.ts
function esFechaISO(valor2) {
  if (typeof valor2 !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor2)) return false;
  const fecha = /* @__PURE__ */ new Date(`${valor2}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor2;
}
function estaEnVigor(regla, fecha) {
  if (fecha < regla.vigenciaDesde) return false;
  if (regla.vigenciaHasta !== null && fecha >= regla.vigenciaHasta) return false;
  return true;
}
function reglasEnVigor(reglas, fecha) {
  return reglas.filter((regla) => estaEnVigor(regla, fecha));
}

// ../itb-motor/src/motor/expresiones.ts
var ErrorExpresion = class extends Error {
  expresion;
  constructor(mensaje, expresion) {
    super(`${mensaje} \u2014 en la expresi\xF3n \xAB${expresion}\xBB`);
    this.name = "ErrorExpresion";
    this.expresion = expresion;
  }
};
function analizarLexico(texto) {
  const fichas = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let n = "";
      while (i < texto.length && /[0-9.]/.test(texto[i])) {
        n += texto[i];
        i += 1;
      }
      const valor2 = Number(n);
      if (!Number.isFinite(valor2)) {
        throw new ErrorExpresion(`N\xFAmero mal escrito: '${n}'`, texto);
      }
      fichas.push({ tipo: "numero", valor: valor2 });
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let n = "";
      while (i < texto.length && /[A-Za-z0-9_]/.test(texto[i])) {
        n += texto[i];
        i += 1;
      }
      fichas.push({ tipo: "nombre", valor: n });
      continue;
    }
    if ("+-*/()".includes(c)) {
      fichas.push({ tipo: "signo", valor: c });
      i += 1;
      continue;
    }
    throw new ErrorExpresion(`Car\xE1cter no permitido: '${c}'`, texto);
  }
  return fichas;
}
function evaluarExpresion(texto, variables) {
  const fichas = analizarLexico(texto);
  let i = 0;
  let faltaVariable = false;
  const mirar = () => fichas[i];
  const consumir = (signo) => {
    const f = mirar();
    if (f?.tipo === "signo" && f.valor === signo) {
      i += 1;
      return true;
    }
    return false;
  };
  function primario() {
    const f = mirar();
    if (f === void 0) {
      throw new ErrorExpresion("La expresi\xF3n termina antes de tiempo", texto);
    }
    if (f.tipo === "numero") {
      i += 1;
      return f.valor;
    }
    if (f.tipo === "nombre") {
      i += 1;
      const valor2 = variables[f.valor];
      if (valor2 === void 0) {
        faltaVariable = true;
        return 0;
      }
      return valor2;
    }
    if (consumir("(")) {
      const v = expresion();
      if (!consumir(")")) {
        throw new ErrorExpresion("Falta un par\xE9ntesis de cierre", texto);
      }
      return v;
    }
    throw new ErrorExpresion(`No se esperaba '${f.valor}'`, texto);
  }
  function unario() {
    if (consumir("-")) return -unario();
    return primario();
  }
  function termino() {
    let v = unario();
    for (; ; ) {
      if (consumir("*")) v *= unario();
      else if (consumir("/")) {
        const divisor = unario();
        if (divisor === 0) throw new ErrorExpresion("Divisi\xF3n por cero", texto);
        v /= divisor;
      } else return v;
    }
  }
  function expresion() {
    let v = termino();
    for (; ; ) {
      if (consumir("+")) v += termino();
      else if (consumir("-")) v -= termino();
      else return v;
    }
  }
  const resultado = expresion();
  if (i < fichas.length) {
    throw new ErrorExpresion(
      `Sobra texto a partir de '${fichas[i]?.valor}'`,
      texto
    );
  }
  return faltaVariable ? void 0 : resultado;
}
function validarExpresion(texto, variablesPermitidas) {
  for (const ficha of analizarLexico(texto)) {
    if (ficha.tipo === "nombre" && !variablesPermitidas.includes(ficha.valor)) {
      throw new ErrorExpresion(
        `Variable desconocida: '${ficha.valor}'. Permitidas: ${variablesPermitidas.join(", ")}`,
        texto
      );
    }
  }
  const ficticias = Object.fromEntries(variablesPermitidas.map((v) => [v, 1]));
  evaluarExpresion(texto, ficticias);
}

// ../itb-motor/src/dominio/navegacion.ts
function zonaTecho(marcadoCE, categoria) {
  if (!marcadoCE || categoria === void 0) return void 0;
  const TECHO = {
    A: 1,
    // Zonas 1 a 7
    B: 2,
    // Zonas 2 a 7
    C: 4,
    // Zonas 4 a 7
    D: 7
    // Solo zona 7
  };
  return TECHO[categoria];
}
var ZONAS = [1, 2, 3, 4, 5, 6, 7];
var DESCRIPCION_ZONA = {
  1: "Navegaci\xF3n ilimitada",
  2: "Hasta 60 millas n\xE1uticas de la costa",
  3: "Hasta 25 millas n\xE1uticas de la costa",
  4: "Hasta 12 millas n\xE1uticas de la costa",
  5: "Hasta 5 millas de un abrigo o playa accesible",
  6: "Hasta 2 millas de un abrigo o playa accesible",
  7: "Aguas costeras protegidas, puertos, radas, r\xEDas y bah\xEDas abrigadas"
};

// ../itb-motor/src/motor/equipo.ts
var VARIABLES_EQUIPO = [
  "personasABordo",
  "esloraCascoM",
  "esloraTotalM",
  "potenciaKw",
  "zona"
];
function variablesDe(embarcacion, contexto) {
  return {
    personasABordo: contexto.personasABordo,
    esloraCascoM: embarcacion.esloraCascoM,
    esloraTotalM: embarcacion.esloraTotalM,
    potenciaKw: embarcacion.potenciaKw,
    zona: contexto.zona
  };
}
function aExigencia(regla, variables) {
  const c = regla.entonces;
  let cantidad;
  let faltaDato;
  if (typeof c.cantidad === "number") {
    cantidad = c.cantidad;
  } else if (c.cantidad !== void 0 && "expresion" in c.cantidad) {
    const valor2 = evaluarExpresion(c.cantidad.expresion, variables);
    if (valor2 === void 0) {
      faltaDato = c.cantidad.expresion;
    } else {
      cantidad = c.redondear === false ? valor2 : Math.ceil(valor2);
    }
  }
  return {
    equipo: c.equipo,
    nombre: c.nombre,
    ...cantidad !== void 0 ? { cantidad } : {},
    ...c.unidad !== void 0 ? { unidad: c.unidad } : {},
    minimoPorUnidad: c.minimoPorUnidad === true,
    requisitos: c.requisitos ?? [],
    ...c.remitidoA !== void 0 ? { remitidoA: c.remitidoA } : {},
    exento: c.exento === true,
    fundamento: {
      reglaId: regla.id,
      cita: regla.cita,
      explicacion: regla.explicacion,
      ...regla.advertencia !== void 0 ? { advertencia: regla.advertencia } : {}
    },
    desplaza: [],
    ...faltaDato !== void 0 ? { faltaDato } : {}
  };
}
function resolverGrupos(candidatas) {
  const porGrupo = /* @__PURE__ */ new Map();
  const sueltas = [];
  for (const candidata of candidatas) {
    const grupo = candidata.regla.grupo;
    if (grupo === void 0) {
      sueltas.push(candidata.exigencia);
      continue;
    }
    const lista2 = porGrupo.get(grupo);
    if (lista2) lista2.push(candidata);
    else porGrupo.set(grupo, [candidata]);
  }
  const resueltas = [...sueltas];
  for (const grupo of porGrupo.values()) {
    const maxima = Math.max(...grupo.map((c) => c.regla.precedencia ?? 0));
    const ganadoras = grupo.filter((c) => (c.regla.precedencia ?? 0) === maxima);
    const desplazadas = grupo.filter((c) => (c.regla.precedencia ?? 0) < maxima).map((c) => ({ reglaId: c.regla.id, cita: c.regla.cita }));
    for (const ganadora of ganadoras) {
      resueltas.push({ ...ganadora.exigencia, desplaza: desplazadas });
    }
  }
  return resueltas;
}
function equipoExigible(embarcacion, contexto, catalogos, fecha) {
  const variables = variablesDe(embarcacion, contexto);
  const candidatas = [];
  const avisos = [];
  for (const catalogo of catalogos) {
    for (const regla of catalogo.reglas) {
      if (!estaEnVigor(regla, fecha)) continue;
      if (!cumpleCondicionesEquipo(embarcacion, contexto, regla.cuando)) continue;
      candidatas.push({ regla, exigencia: aExigencia(regla, variables) });
    }
  }
  const exigencias = resolverGrupos(candidatas).sort(
    (a, b) => a.equipo.localeCompare(b.equipo)
  );
  for (const e of exigencias) {
    if (e.faltaDato !== void 0) {
      avisos.push(
        `No se puede calcular la cantidad de \xAB${e.nombre}\xBB: falta un dato de la ficha para resolver \xAB${e.faltaDato}\xBB.`
      );
    }
  }
  return {
    zona: contexto.zona,
    exigencias,
    avisos,
    versionCatalogo: catalogos.map((c) => `${c.norma}@${c.version}`).join(" + ")
  };
}
function inventarioContable(embarcacion, personasABordo, navegacionDiurna, zonaActual2, catalogos, fecha) {
  const techo = zonaTecho(embarcacion.marcadoCE, embarcacion.categoriaDiseno);
  const zonas = ZONAS.filter((z) => techo === void 0 || z >= techo);
  const lineas = /* @__PURE__ */ new Map();
  for (const zona2 of [...zonas].reverse()) {
    const { exigencias } = equipoExigible(
      embarcacion,
      { zona: zona2, personasABordo, navegacionDiurna },
      catalogos,
      fecha
    );
    for (const e of exigencias) {
      const contable = !e.exento && e.remitidoA === void 0 && (e.cantidad !== void 0 || e.faltaDato !== void 0);
      if (!contable) continue;
      const existente = lineas.get(e.equipo);
      if (existente === void 0) {
        lineas.set(e.equipo, {
          equipo: e.equipo,
          nombre: e.nombre,
          exigidoDesdeZona: zona2,
          cantidadEn: e.cantidad,
          ...e.unidad !== void 0 ? { unidad: e.unidad } : {},
          minimoPorUnidad: e.minimoPorUnidad,
          cita: e.fundamento.cita
        });
      }
      if (zona2 === zonaActual2) {
        const base = lineas.get(e.equipo);
        if (base !== void 0) lineas.set(e.equipo, { ...base, enZonaActual: e });
      }
    }
  }
  return [...lineas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
function dependeDePersonas(equipo, embarcacion, contexto, catalogos, fecha) {
  const cantidad = (personas) => equipoExigible(embarcacion, { ...contexto, personasABordo: personas }, catalogos, fecha).exigencias.find((e) => e.equipo === equipo)?.cantidad;
  return cantidad(contexto.personasABordo) !== cantidad(contexto.personasABordo + 1);
}
function carenciasEn(embarcacion, contexto, catalogos, fecha, inventario) {
  const { exigencias } = equipoExigible(embarcacion, contexto, catalogos, fecha);
  const carencias = [];
  for (const e of exigencias) {
    if (e.exento) continue;
    if (e.remitidoA !== void 0) continue;
    if (e.cantidad === void 0 && e.faltaDato === void 0) continue;
    const anotado = inventario[e.equipo];
    const comun = {
      equipo: e.equipo,
      nombre: e.nombre,
      ...e.unidad !== void 0 ? { unidad: e.unidad } : {},
      minimoPorUnidad: e.minimoPorUnidad,
      cita: e.fundamento.cita
    };
    if (e.minimoPorUnidad && anotado === void 0) {
      carencias.push({
        ...comun,
        ...e.cantidad !== void 0 ? { exigido: e.cantidad } : {}
      });
      continue;
    }
    const aBordo = anotado ?? 0;
    if (e.cantidad === void 0) {
      carencias.push({ ...comun, aBordo });
      continue;
    }
    if (aBordo < e.cantidad) {
      carencias.push({ ...comun, exigido: e.cantidad, aBordo });
    }
  }
  return carencias;
}
function calcularZona(embarcacion, personasABordo, navegacionDiurna, inventario, catalogos, fecha) {
  const avisos = [];
  const techo = zonaTecho(embarcacion.marcadoCE, embarcacion.categoriaDiseno);
  if (techo === void 0) {
    avisos.push(
      "La embarcaci\xF3n no tiene marcado CE o no consta su categor\xEDa de dise\xF1o. El art. 3.4 del RD 339/2021 remite a la zona asignada en su certificado de navegabilidad, que el sistema no puede deducir: el techo debe tomarse de ah\xED."
    );
  }
  const candidatas = ZONAS.filter((z) => techo === void 0 || z >= techo);
  let alcanzada;
  let carenciasAlcanzada = [];
  let personasAptas;
  let limitanPersonas = [];
  const carenciasPorZona = /* @__PURE__ */ new Map();
  for (const zona2 of candidatas) {
    const contexto = { zona: zona2, personasABordo, navegacionDiurna };
    const carencias = carenciasEn(embarcacion, contexto, catalogos, fecha, inventario);
    if (carencias.length === 0) {
      carenciasPorZona.set(zona2, carencias);
      alcanzada = zona2;
      carenciasAlcanzada = [];
      break;
    }
    const porPersonas = carencias.filter(
      (c) => dependeDePersonas(c.equipo, embarcacion, contexto, catalogos, fecha)
    );
    const resto = carencias.filter((c) => !porPersonas.includes(c));
    carenciasPorZona.set(zona2, carencias);
    if (resto.length > 0) continue;
    for (let n = personasABordo - 1; n >= 1; n--) {
      const conN = carenciasEn(embarcacion, { ...contexto, personasABordo: n }, catalogos, fecha, inventario);
      if (conN.length === 0) {
        personasAptas = n;
        break;
      }
    }
    if (personasAptas === void 0) continue;
    alcanzada = zona2;
    limitanPersonas = porPersonas;
    break;
  }
  if (alcanzada === void 0) {
    const ultima = candidatas.at(-1);
    carenciasAlcanzada = ultima !== void 0 ? carenciasPorZona.get(ultima) ?? [] : [];
    avisos.push(
      "El equipo verificado a bordo no alcanza ninguna zona de navegaci\xF3n, ni siquiera aguas protegidas. Rev\xEDsense las carencias antes de autorizar la navegaci\xF3n."
    );
  }
  const siguiente = alcanzada !== void 0 && alcanzada > 1 && (techo === void 0 || alcanzada - 1 >= techo) ? alcanzada - 1 : void 0;
  return {
    ...alcanzada !== void 0 ? { zona: alcanzada } : {},
    ...techo !== void 0 ? { techo } : {},
    enElTecho: alcanzada !== void 0 && alcanzada === techo,
    ...siguiente !== void 0 ? { siguienteZona: siguiente } : {},
    faltaParaSubir: siguiente !== void 0 ? carenciasPorZona.get(siguiente) ?? [] : [],
    carenciasEnZonaAlcanzada: carenciasAlcanzada,
    ...personasAptas !== void 0 ? { personasAptas } : {},
    limitanPersonas,
    avisos
  };
}
function cantidadConUnidad(cantidad, unidad) {
  const numero = String(cantidad).replace(".", ",");
  return unidad !== void 0 ? `${numero} ${unidad}` : numero;
}
function describirCarencia(carencia) {
  const { exigido, aBordo, unidad } = carencia;
  if (exigido === void 0) return "no se ha podido calcular la cantidad exigida";
  if (carencia.minimoPorUnidad) {
    const minimo = `m\xEDnimo ${cantidadConUnidad(exigido, unidad)} por unidad`;
    return aBordo === void 0 ? `${minimo}; sin comprobar (se lee en la etiqueta o en la placa)` : `${minimo}; la m\xE1s desfavorable a bordo, ${cantidadConUnidad(aBordo, unidad)}`;
  }
  return `exige ${cantidadConUnidad(exigido, unidad)}, a bordo ${cantidadConUnidad(aBordo ?? 0, unidad)}`;
}

// ../itb-motor/src/motor/validador.ts
var ErrorCatalogo = class extends Error {
  /** Fichero de catálogo en el que está el fallo. */
  origen;
  // El campo se declara y se asigna a mano, en vez de usar la forma abreviada de
  // TypeScript (`constructor(public readonly origen: string)`), porque Node ejecuta
  // TypeScript borrando los tipos sin transformar el código, y esa forma abreviada
  // necesitaría una transformación. Renunciar a ella es lo que permite que el
  // proyecto no tenga cadena de compilación (ver ADR-004).
  constructor(mensaje, origen) {
    super(`[${origen}] ${mensaje}`);
    this.name = "ErrorCatalogo";
    this.origen = origen;
  }
};
var TIPOS_RECONOCIMIENTO = /* @__PURE__ */ new Set([
  "inicial",
  "periodico",
  "intermedio",
  "adicional",
  "extraordinario"
]);
function validarRegla(regla, origen, indice) {
  const donde = `regla #${indice + 1}`;
  if (typeof regla !== "object" || regla === null) {
    throw new ErrorCatalogo(`${donde}: no es un objeto`, origen);
  }
  const r = regla;
  if (typeof r["id"] !== "string" || r["id"].length === 0) {
    throw new ErrorCatalogo(`${donde}: falta 'id'`, origen);
  }
  const id = r["id"];
  if (typeof r["cita"] !== "string" || r["cita"].length === 0) {
    throw new ErrorCatalogo(`${id}: falta 'cita' (obligatoria, RF-15)`, origen);
  }
  if (typeof r["explicacion"] !== "string" || r["explicacion"].length === 0) {
    throw new ErrorCatalogo(`${id}: falta 'explicacion'`, origen);
  }
  if (!esFechaISO(r["vigenciaDesde"])) {
    throw new ErrorCatalogo(
      `${id}: 'vigenciaDesde' debe ser una fecha AAAA-MM-DD`,
      origen
    );
  }
  if (r["vigenciaHasta"] !== null && !esFechaISO(r["vigenciaHasta"])) {
    throw new ErrorCatalogo(
      `${id}: 'vigenciaHasta' debe ser una fecha AAAA-MM-DD o null`,
      origen
    );
  }
  if (r["vigenciaHasta"] !== null && r["vigenciaHasta"] <= r["vigenciaDesde"]) {
    throw new ErrorCatalogo(
      `${id}: la vigencia termina antes de empezar`,
      origen
    );
  }
  if (typeof r["cuando"] !== "object" || r["cuando"] === null) {
    throw new ErrorCatalogo(`${id}: falta 'cuando'`, origen);
  }
  if (typeof r["entonces"] !== "object" || r["entonces"] === null) {
    throw new ErrorCatalogo(`${id}: falta 'entonces'`, origen);
  }
  const consecuencia2 = r["entonces"];
  const tipo = consecuencia2["reconocimiento"];
  if (typeof tipo !== "string" || !TIPOS_RECONOCIMIENTO.has(tipo)) {
    throw new ErrorCatalogo(
      `${id}: 'reconocimiento' debe ser uno de ${[...TIPOS_RECONOCIMIENTO].join(", ")}`,
      origen
    );
  }
  return r;
}
function validarCatalogo(datos, origen) {
  if (typeof datos !== "object" || datos === null) {
    throw new ErrorCatalogo("el fichero no contiene un cat\xE1logo", origen);
  }
  const c = datos;
  for (const campo2 of ["norma", "identificadorBoe", "version"]) {
    if (typeof c[campo2] !== "string" || c[campo2].length === 0) {
      throw new ErrorCatalogo(`falta el campo '${campo2}'`, origen);
    }
  }
  if (!Array.isArray(c["reglas"])) {
    throw new ErrorCatalogo("falta la lista 'reglas'", origen);
  }
  const reglas = c["reglas"].map(
    (regla, i) => validarRegla(regla, origen, i)
  );
  const vistos = /* @__PURE__ */ new Set();
  for (const regla of reglas) {
    if (vistos.has(regla.id)) {
      throw new ErrorCatalogo(`identificador repetido: ${regla.id}`, origen);
    }
    vistos.add(regla.id);
  }
  return { ...c, reglas };
}
function validarReglaEquipo(regla, origen, indice) {
  const donde = `regla de equipo #${indice + 1}`;
  if (typeof regla !== "object" || regla === null) {
    throw new ErrorCatalogo(`${donde}: no es un objeto`, origen);
  }
  const r = regla;
  if (typeof r["id"] !== "string" || r["id"].length === 0) {
    throw new ErrorCatalogo(`${donde}: falta 'id'`, origen);
  }
  const id = r["id"];
  if (typeof r["cita"] !== "string" || r["cita"].length === 0) {
    throw new ErrorCatalogo(`${id}: falta 'cita' (obligatoria, RF-15)`, origen);
  }
  if (typeof r["explicacion"] !== "string" || r["explicacion"].length === 0) {
    throw new ErrorCatalogo(`${id}: falta 'explicacion'`, origen);
  }
  if (!esFechaISO(r["vigenciaDesde"])) {
    throw new ErrorCatalogo(`${id}: 'vigenciaDesde' debe ser AAAA-MM-DD`, origen);
  }
  if (r["vigenciaHasta"] !== null && !esFechaISO(r["vigenciaHasta"])) {
    throw new ErrorCatalogo(`${id}: 'vigenciaHasta' debe ser AAAA-MM-DD o null`, origen);
  }
  if (typeof r["cuando"] !== "object" || r["cuando"] === null) {
    throw new ErrorCatalogo(`${id}: falta 'cuando'`, origen);
  }
  if (typeof r["entonces"] !== "object" || r["entonces"] === null) {
    throw new ErrorCatalogo(`${id}: falta 'entonces'`, origen);
  }
  const c = r["entonces"];
  if (typeof c["equipo"] !== "string" || c["equipo"].length === 0) {
    throw new ErrorCatalogo(`${id}: falta 'equipo' en la consecuencia`, origen);
  }
  if (typeof c["nombre"] !== "string" || c["nombre"].length === 0) {
    throw new ErrorCatalogo(`${id}: falta 'nombre' en la consecuencia`, origen);
  }
  const exime = c["exento"] === true;
  const tieneAlgo = c["cantidad"] !== void 0 || c["remitidoA"] !== void 0 || Array.isArray(c["requisitos"]) && c["requisitos"].length > 0;
  if (!exime && !tieneAlgo) {
    throw new ErrorCatalogo(
      `${id}: la regla no exime y no concluye nada (ni cantidad, ni requisitos, ni remisi\xF3n)`,
      origen
    );
  }
  if (c["minimoPorUnidad"] !== void 0) {
    if (typeof c["minimoPorUnidad"] !== "boolean") {
      throw new ErrorCatalogo(`${id}: 'minimoPorUnidad' debe ser true o false`, origen);
    }
    if (c["minimoPorUnidad"] && (c["cantidad"] === void 0 || typeof c["unidad"] !== "string")) {
      throw new ErrorCatalogo(
        `${id}: un m\xEDnimo por unidad necesita 'cantidad' y 'unidad' (p. ej. 150 N)`,
        origen
      );
    }
  }
  const cantidad = c["cantidad"];
  if (cantidad !== void 0) {
    if (typeof cantidad === "number") {
      if (!Number.isFinite(cantidad) || cantidad < 0) {
        throw new ErrorCatalogo(`${id}: cantidad inv\xE1lida`, origen);
      }
    } else if (typeof cantidad === "object" && cantidad !== null && typeof cantidad["expresion"] === "string") {
      try {
        validarExpresion(
          cantidad["expresion"],
          VARIABLES_EQUIPO
        );
      } catch (error) {
        throw new ErrorCatalogo(`${id}: ${error.message}`, origen);
      }
    } else {
      throw new ErrorCatalogo(
        `${id}: 'cantidad' debe ser un n\xFAmero o { expresion: "..." }`,
        origen
      );
    }
  }
  if (r["precedencia"] !== void 0 && typeof r["precedencia"] !== "number") {
    throw new ErrorCatalogo(`${id}: 'precedencia' debe ser un n\xFAmero`, origen);
  }
  if (r["precedencia"] !== void 0 && r["grupo"] === void 0) {
    throw new ErrorCatalogo(
      `${id}: tiene 'precedencia' pero no 'grupo'. La precedencia solo significa algo dentro de un grupo`,
      origen
    );
  }
  return r;
}
function validarCatalogoEquipo(datos, origen) {
  if (typeof datos !== "object" || datos === null) {
    throw new ErrorCatalogo("el fichero no contiene un cat\xE1logo", origen);
  }
  const c = datos;
  for (const campo2 of ["norma", "identificadorBoe", "version"]) {
    if (typeof c[campo2] !== "string" || c[campo2].length === 0) {
      throw new ErrorCatalogo(`falta el campo '${campo2}'`, origen);
    }
  }
  if (!Array.isArray(c["reglas"])) {
    throw new ErrorCatalogo("falta la lista 'reglas'", origen);
  }
  const reglas = c["reglas"].map(
    (regla, i) => validarReglaEquipo(regla, origen, i)
  );
  const vistos = /* @__PURE__ */ new Set();
  for (const regla of reglas) {
    if (vistos.has(regla.id)) {
      throw new ErrorCatalogo(`identificador repetido: ${regla.id}`, origen);
    }
    vistos.add(regla.id);
  }
  const porGrupo = /* @__PURE__ */ new Map();
  for (const regla of reglas) {
    if (regla.grupo === void 0) continue;
    const lista2 = porGrupo.get(regla.grupo);
    if (lista2) lista2.push(regla);
    else porGrupo.set(regla.grupo, [regla]);
  }
  return { ...c, reglas };
}
function validarCatalogoSucesos(datos, origen) {
  if (typeof datos !== "object" || datos === null) {
    throw new ErrorCatalogo("el fichero no contiene un cat\xE1logo", origen);
  }
  const c = datos;
  for (const campo2 of ["norma", "identificadorBoe", "version"]) {
    if (typeof c[campo2] !== "string" || c[campo2].length === 0) {
      throw new ErrorCatalogo(`falta el campo '${campo2}'`, origen);
    }
  }
  if (!Array.isArray(c["reglas"])) {
    throw new ErrorCatalogo("falta la lista 'reglas'", origen);
  }
  const vistos = /* @__PURE__ */ new Set();
  const reglas = c["reglas"].map((regla, i) => {
    const donde = `regla de suceso #${i + 1}`;
    if (typeof regla !== "object" || regla === null) {
      throw new ErrorCatalogo(`${donde}: no es un objeto`, origen);
    }
    const r = regla;
    if (typeof r["id"] !== "string" || r["id"].length === 0) {
      throw new ErrorCatalogo(`${donde}: falta 'id'`, origen);
    }
    const id = r["id"];
    if (vistos.has(id)) {
      throw new ErrorCatalogo(`identificador repetido: ${id}`, origen);
    }
    vistos.add(id);
    if (typeof r["cita"] !== "string" || r["cita"].length === 0) {
      throw new ErrorCatalogo(`${id}: falta 'cita' (obligatoria, RF-15)`, origen);
    }
    if (typeof r["explicacion"] !== "string" || r["explicacion"].length === 0) {
      throw new ErrorCatalogo(`${id}: falta 'explicacion'`, origen);
    }
    if (!esFechaISO(r["vigenciaDesde"])) {
      throw new ErrorCatalogo(`${id}: 'vigenciaDesde' debe ser AAAA-MM-DD`, origen);
    }
    if (r["vigenciaHasta"] !== null && !esFechaISO(r["vigenciaHasta"])) {
      throw new ErrorCatalogo(`${id}: 'vigenciaHasta' debe ser AAAA-MM-DD o null`, origen);
    }
    const cuando = r["cuando"];
    if (typeof cuando !== "object" || cuando === null) {
      throw new ErrorCatalogo(`${id}: falta 'cuando'`, origen);
    }
    if (cuando["tipoSuceso"] === void 0) {
      throw new ErrorCatalogo(
        `${id}: falta 'tipoSuceso' en 'cuando'; sin \xE9l la regla se aplicar\xEDa a cualquier suceso`,
        origen
      );
    }
    const entonces = r["entonces"];
    if (typeof entonces !== "object" || entonces === null) {
      throw new ErrorCatalogo(`${id}: falta 'entonces'`, origen);
    }
    const tipo = entonces["reconocimiento"];
    if (tipo !== "adicional" && tipo !== "extraordinario") {
      throw new ErrorCatalogo(
        `${id}: un suceso solo puede disparar un reconocimiento 'adicional' o 'extraordinario'`,
        origen
      );
    }
    return r;
  });
  return { ...c, reglas };
}

// ../itb-motor/src/motor/sucesos.ts
function cumple(suceso, condiciones) {
  if (condiciones.tipoSuceso !== void 0) {
    const esperado = condiciones.tipoSuceso;
    const coincide2 = Array.isArray(esperado) ? esperado.includes(suceso.tipo) : suceso.tipo === esperado;
    if (!coincide2) return false;
  }
  if (condiciones.listaDestino !== void 0 && suceso.listaDestino !== condiciones.listaDestino) {
    return false;
  }
  if (condiciones.afectaSeguridad !== void 0) {
    if (suceso.afectaSeguridad !== condiciones.afectaSeguridad) return false;
  }
  return true;
}
var REQUIEREN_VALORACION = ["averia_maquinaria"];
function evaluarSucesos(sucesos, catalogos, fecha) {
  const obligaciones = [];
  const avisos = [];
  for (const suceso of sucesos) {
    let alguna = false;
    for (const catalogo of catalogos) {
      for (const regla of catalogo.reglas) {
        if (!estaEnVigor(regla, fecha)) continue;
        if (!cumple(suceso, regla.cuando)) continue;
        alguna = true;
        obligaciones.push({
          suceso,
          tipo: regla.entonces.reconocimiento,
          consecuencia: regla.entonces,
          fundamento: {
            reglaId: regla.id,
            cita: regla.cita,
            explicacion: regla.explicacion,
            ...regla.advertencia !== void 0 ? { advertencia: regla.advertencia } : {}
          },
          atendida: false
        });
      }
    }
    if (!alguna && REQUIEREN_VALORACION.includes(suceso.tipo)) {
      avisos.push(
        `El suceso de ${suceso.fecha} (\xAB${suceso.descripcion}\xBB) es una aver\xEDa de maquinaria sin valorar si pudo afectar a las condiciones de seguridad de la navegaci\xF3n. Si pudo afectarlas, obliga a reconocimiento adicional (art. 3.D.c del RD 1434/1999). Esa valoraci\xF3n es un juicio t\xE9cnico y el sistema no la puede hacer.`
      );
    }
  }
  return {
    obligaciones,
    avisos,
    versionCatalogo: catalogos.map((c) => `${c.norma}@${c.version}`).join(" + ")
  };
}
function cruzarConHistorico(obligaciones, realizados) {
  const ordenados = [...realizados].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return obligaciones.map((obligacion) => {
    const cierre = ordenados.find(
      (r) => r.tipo === obligacion.tipo && r.favorable && r.fecha >= obligacion.suceso.fecha
    );
    return cierre === void 0 ? obligacion : { ...obligacion, atendida: true, atendidaPor: cierre.id };
  });
}
function pendientes(obligaciones) {
  return obligaciones.filter((o) => !o.atendida).sort((a, b) => a.suceso.fecha.localeCompare(b.suceso.fecha));
}

// ../itb-motor/src/dominio/suceso.ts
var NOMBRE_SUCESO = {
  reparacion: "Reparaci\xF3n de casco, maquinaria o equipo",
  modificacion: "Modificaci\xF3n o alteraci\xF3n",
  cambio_lista: "Cambio de lista de registro",
  varada: "Varada",
  abordaje: "Abordaje",
  averia_temporal: "Aver\xEDa seria por temporal u otro motivo",
  averia_maquinaria: "Aver\xEDa en maquinaria o componentes",
  requerimiento_judicial: "Requerimiento de un \xF3rgano judicial",
  resolucion_dgmm: "Resoluci\xF3n motivada de la DGMM"
};

// ../itb-motor/src/motor/plazos.ts
function aUTC(fecha) {
  if (!esFechaISO(fecha)) {
    throw new TypeError(`Fecha inv\xE1lida: '${fecha}'. Se espera AAAA-MM-DD.`);
  }
  return /* @__PURE__ */ new Date(`${fecha}T00:00:00Z`);
}
var aISO = (d) => d.toISOString().slice(0, 10);
function sumarMeses(fecha, meses2) {
  const d = aUTC(fecha);
  const diaOriginal = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + meses2);
  const ultimoDia = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)
  ).getUTCDate();
  d.setUTCDate(Math.min(diaOriginal, ultimoDia));
  return aISO(d);
}
function sumarAnios(fecha, anios) {
  return sumarMeses(fecha, anios * 12);
}
function sumarDias(fecha, dias) {
  const d = aUTC(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return aISO(d);
}
function diasEntre(desde, hasta) {
  const MS_POR_DIA = 864e5;
  return Math.round((aUTC(hasta).getTime() - aUTC(desde).getTime()) / MS_POR_DIA);
}
function caducidadCertificado(fechaCertificado, periodicidadAnios) {
  return sumarAnios(fechaCertificado, periodicidadAnios);
}
function limiteSolicitud(caducidad) {
  return sumarDias(caducidad, -15);
}
function limiteSubsanacion(fechaInspeccion) {
  return sumarMeses(fechaInspeccion, 2);
}
function estadoPlazo(limite, hoy2, avisoDias = 30) {
  const restantes = diasEntre(hoy2, limite);
  if (restantes < 0) return "vencido";
  return restantes <= avisoDias ? "proximo" : "vigente";
}

// ../itb-motor/src/motor/calendario.ts
var LETRA_ANEXO_III = {
  salvamento: {
    letra: "h",
    supuesto: "Equipos de salvamento incompleto o con fecha de caducidad vencida"
  },
  contraincendios: {
    letra: "m",
    supuesto: "Equipo de contraincendios con deficiencias importantes como falta de extintores o con fecha de caducidad vencida"
  }
};
function indiceEquipo(catalogos) {
  const indice = /* @__PURE__ */ new Map();
  for (const catalogo of catalogos) {
    for (const regla of catalogo.reglas) {
      const { equipo, nombre, familia } = regla.entonces;
      const existente = indice.get(equipo);
      if (existente === void 0) {
        indice.set(equipo, {
          nombre,
          ...familia !== void 0 ? { familia } : {},
          cita: regla.cita
        });
      } else if (existente.familia === void 0 && familia !== void 0) {
        indice.set(equipo, { ...existente, familia });
      }
    }
  }
  return indice;
}
function calendario(embarcacion, evaluacion, caducidades, catalogos, hoy2, avisoDias = 30) {
  const vencimientos = [];
  const avisos = [];
  const anadir = (clase, concepto, fecha, cita, extra = {}) => {
    vencimientos.push({
      clase,
      concepto,
      fecha,
      // Que se abriera la ventana del intermedio no es un plazo que venza: pasada la
      // fecha, la ventana está abierta. Lo que vence es su cierre, que es otra línea.
      estado: clase === "ventana" && fecha <= hoy2 ? "vigente" : estadoPlazo(fecha, hoy2, avisoDias),
      diasRestantes: diasEntre(hoy2, fecha),
      cita,
      ...extra
    });
  };
  const periodicos = conclusionesDe(evaluacion, "periodico").filter((c) => !c.exento);
  const exencionPeriodico = conclusionesDe(evaluacion, "periodico").find((c) => c.exento);
  if (embarcacion.fechaCertificado === void 0) {
    if (periodicos.length > 0) {
      avisos.push(
        "No consta la fecha de expedici\xF3n del certificado de navegabilidad. Sin ella no se pueden calcular los vencimientos: el art. 3.A) del RD 1434/1999 establece que esa fecha marca el inicio del plazo de los reconocimientos peri\xF3dicos e intermedios."
      );
    }
  } else {
    for (const periodico of periodicos) {
      const anios = periodico.consecuencia.periodicidadMaximaAnios;
      if (anios === void 0) continue;
      const caducidad = caducidadCertificado(embarcacion.fechaCertificado, anios);
      anadir(
        "certificado",
        "Caducidad del certificado de navegabilidad",
        caducidad,
        "RD 1434/1999, art. 4.1",
        {
          detalle: "La no realizaci\xF3n o superaci\xF3n de los reconocimientos en plazo supone la caducidad del certificado."
        }
      );
      anadir(
        "solicitud",
        "Fecha l\xEDmite para solicitar el reconocimiento peri\xF3dico",
        limiteSolicitud(caducidad),
        "RD 1434/1999, art. 9.1",
        {
          detalle: "Antelaci\xF3n m\xEDnima de 15 d\xEDas naturales a la caducidad. La entidad colaboradora dispone adem\xE1s de hasta 15 d\xEDas para atender la solicitud (art. 6.1.g)."
        }
      );
    }
    for (const intermedio of conclusionesDe(evaluacion, "intermedio").filter((c) => !c.exento)) {
      const ventana = intermedio.consecuencia.ventanaAnios;
      if (ventana === void 0) continue;
      anadir(
        "ventana",
        "Se abre la ventana del reconocimiento intermedio",
        sumarAnios(embarcacion.fechaCertificado, ventana.desde),
        intermedio.fundamento.cita,
        {
          detalle: "El intermedio se realiza en seco entre el segundo y el tercer a\xF1o."
        }
      );
      anadir(
        "reconocimiento",
        "Se cierra la ventana del reconocimiento intermedio",
        sumarAnios(embarcacion.fechaCertificado, ventana.hasta),
        intermedio.fundamento.cita
      );
    }
  }
  if (exencionPeriodico !== void 0 && periodicos.length === 0) {
    avisos.push(
      `La embarcaci\xF3n est\xE1 exenta de reconocimiento peri\xF3dico y su certificado se expide SIN CADUCIDAD (${exencionPeriodico.fundamento.cita}). Aun as\xED, el equipo de seguridad sigue teniendo fechas de caducidad propias.`
    );
  }
  const indice = indiceEquipo(catalogos);
  for (const [equipo, fecha] of Object.entries(caducidades)) {
    const datos = indice.get(equipo);
    if (datos === void 0) {
      avisos.push(
        `El equipo \xAB${equipo}\xBB no est\xE1 en el cat\xE1logo: su caducidad se muestra, pero no se puede decir si, vencida, constituye deficiencia grave del Anexo III.`
      );
    }
    const familia = datos?.familia;
    const tipificado = familia !== void 0 ? LETRA_ANEXO_III[familia] : void 0;
    anadir(
      "equipo",
      `Caducidad de: ${datos?.nombre ?? equipo}`,
      fecha,
      datos?.cita ?? "RD 339/2021",
      {
        ...tipificado !== void 0 ? { gravedadSiVence: tipificado } : {},
        detalle: tipificado !== void 0 ? `Vencida, constituye deficiencia grave: Anexo III, letra ${tipificado.letra}) del RD 1434/1999, lo que hace desfavorable el reconocimiento.` : "El Anexo III del RD 1434/1999 no tipifica este equipo: la calificaci\xF3n de la deficiencia queda a criterio del inspector."
      }
    );
  }
  vencimientos.sort((a, b) => a.fecha.localeCompare(b.fecha));
  return { vencimientos, avisos };
}

// ../itb-motor/src/dominio/mantenimiento.ts
var EQUIPAMIENTOS = ["trim_electrico"];
var NOMBRE_EQUIPAMIENTO = {
  trim_electrico: "trim o inclinaci\xF3n el\xE9ctrica"
};

// ../itb-motor/src/motor/mantenimiento.ts
var ACCIONES = /* @__PURE__ */ new Set(["revisar", "sustituir"]);
var TALLERES = /* @__PURE__ */ new Set(["oficial", "recomendado"]);
var TRANSMISIONES = /* @__PURE__ */ new Set(["inversor", "saildrive"]);
function validarIntervalo(valor2, donde, origen) {
  if (typeof valor2 !== "object" || valor2 === null) {
    throw new ErrorCatalogo(`${donde}: el intervalo no es un objeto`, origen);
  }
  const { horas, meses: meses2 } = valor2;
  for (const [nombre, v] of [["horas", horas], ["meses", meses2]]) {
    if (v !== void 0 && (typeof v !== "number" || !(v > 0))) {
      throw new ErrorCatalogo(`${donde}: '${nombre}' debe ser un n\xFAmero positivo`, origen);
    }
  }
  if (horas === void 0 && meses2 === void 0) {
    throw new ErrorCatalogo(`${donde}: el intervalo no tiene ni horas ni meses`, origen);
  }
  return valor2;
}
function validarCatalogoPautas(datos, origen) {
  if (typeof datos !== "object" || datos === null) {
    throw new ErrorCatalogo("el fichero no contiene un plan de mantenimiento", origen);
  }
  const c = datos;
  for (const campo2 of ["id", "fabricante", "documento", "tabla"]) {
    if (typeof c[campo2] !== "string" || c[campo2].trim() === "") {
      throw new ErrorCatalogo(`falta el campo '${campo2}'`, origen);
    }
  }
  const aplica = c["aplicaA"];
  if (typeof aplica?.["tipo"] !== "string") {
    throw new ErrorCatalogo("falta 'aplicaA.tipo': a qu\xE9 componente se aplica el plan", origen);
  }
  if (!Array.isArray(c["tareas"]) || c["tareas"].length === 0) {
    throw new ErrorCatalogo("falta la lista 'tareas'", origen);
  }
  const vistos = /* @__PURE__ */ new Set();
  for (const [i, t] of c["tareas"].entries()) {
    const donde = `tarea #${i + 1}${typeof t?.["id"] === "string" ? ` (${t["id"]})` : ""}`;
    if (typeof t !== "object" || t === null) {
      throw new ErrorCatalogo(`${donde}: no es un objeto`, origen);
    }
    for (const campo2 of ["id", "tarea", "fuente"]) {
      if (typeof t[campo2] !== "string" || t[campo2].trim() === "") {
        throw new ErrorCatalogo(`${donde}: falta '${campo2}'`, origen);
      }
    }
    if (vistos.has(t["id"])) {
      throw new ErrorCatalogo(`identificador repetido: ${t["id"]}`, origen);
    }
    vistos.add(t["id"]);
    if (t["accion"] === "taller" || t["accionPrimeraVez"] !== void 0) {
      throw new ErrorCatalogo(
        `${donde}: 'taller' ya no es una acci\xF3n ni existe 'accionPrimeraVez'. La acci\xF3n es revisar o sustituir, y qui\xE9n la hace va en 'taller' y 'tallerPrimeraVez' (ADR-012)`,
        origen
      );
    }
    if (t["accion"] === void 0) {
      throw new ErrorCatalogo(`${donde}: falta 'accion'`, origen);
    }
    if (!ACCIONES.has(t["accion"])) {
      throw new ErrorCatalogo(`${donde}: 'accion' debe ser revisar o sustituir`, origen);
    }
    if (t["taller"] !== void 0 && !TALLERES.has(t["taller"])) {
      throw new ErrorCatalogo(`${donde}: 'taller' debe ser oficial o recomendado`, origen);
    }
    const tallerRodaje = t["tallerPrimeraVez"];
    if (tallerRodaje !== void 0) {
      if (tallerRodaje !== "no" && !TALLERES.has(tallerRodaje)) {
        throw new ErrorCatalogo(`${donde}: 'tallerPrimeraVez' debe ser oficial, recomendado o no`, origen);
      }
      if (t["primeraVez"] === void 0) {
        throw new ErrorCatalogo(`${donde}: 'tallerPrimeraVez' sin 'primeraVez'`, origen);
      }
    }
    validarIntervalo(t["cada"], `${donde}, 'cada'`, origen);
    if (t["primeraVez"] !== void 0) {
      validarIntervalo(t["primeraVez"], `${donde}, 'primeraVez'`, origen);
    }
    const solo = t["soloSi"];
    if (solo?.["transmision"] !== void 0 && !TRANSMISIONES.has(solo["transmision"])) {
      throw new ErrorCatalogo(`${donde}: 'soloSi.transmision' desconocida`, origen);
    }
    if (solo?.["equipamiento"] !== void 0 && !EQUIPAMIENTOS.includes(solo["equipamiento"])) {
      throw new ErrorCatalogo(
        `${donde}: 'soloSi.equipamiento' desconocido: ${String(solo["equipamiento"])}. Se conocen: ${EQUIPAMIENTOS.join(", ")}`,
        origen
      );
    }
  }
  return c;
}
var normal = (texto) => (texto ?? "").replace(/[\s-]/g, "").toUpperCase();
function planDe(componente, catalogos) {
  if (componente.planId !== void 0) {
    return catalogos.find((c) => c.id === componente.planId);
  }
  return catalogos.find(
    (c) => c.aplicaA.tipo === componente.tipo && (c.aplicaA.marca === void 0 || normal(c.aplicaA.marca) === normal(componente.marca)) && (c.aplicaA.modelos === void 0 || c.aplicaA.modelos.some((m) => normal(m) === normal(componente.modelo)))
  );
}
function planParecido(componente, catalogos) {
  const anotado = normal(componente.modelo);
  if (anotado === "") return void 0;
  for (const c of catalogos) {
    if (c.aplicaA.tipo !== componente.tipo) continue;
    if (c.aplicaA.marca !== void 0 && normal(c.aplicaA.marca) !== normal(componente.marca)) continue;
    const modelo = (c.aplicaA.modelos ?? []).find(
      (m) => anotado.startsWith(normal(m)) && anotado !== normal(m)
    );
    if (modelo !== void 0) return { plan: c, modelo };
  }
  return void 0;
}
function deficienciasAbiertas(inspecciones, trabajos) {
  const firmadas = inspecciones.filter((i) => i.firmada).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const cerradasPorTrabajo = new Set(
    trabajos.map((t) => t.cierraDeficiencia).filter((x) => x !== void 0)
  );
  const abiertas = [];
  for (const [n, inspeccion] of firmadas.entries()) {
    for (const h2 of inspeccion.hallazgos) {
      if (h2.resultado !== "no_conforme") continue;
      const id = `${inspeccion.id}:${h2.puntoId}`;
      if (cerradasPorTrabajo.has(id)) continue;
      const vueltoAMirar = firmadas.slice(n + 1).some(
        (posterior) => posterior.fecha > inspeccion.fecha && posterior.hallazgos.some(
          (p) => p.puntoId === h2.puntoId && (p.resultado === "conforme" || p.resultado === "no_conforme")
        )
      );
      if (vueltoAMirar) continue;
      abiertas.push({
        id,
        inspeccionId: inspeccion.id,
        ...inspeccion.numeroInforme !== void 0 ? { numeroInforme: inspeccion.numeroInforme } : {},
        fecha: inspeccion.fecha,
        puntoId: h2.puntoId,
        titulo: h2.titulo,
        grave: h2.grave,
        ...h2.observacion !== void 0 && h2.observacion !== "" ? { observacion: h2.observacion } : {},
        ...h2.grave ? { limite: limiteSubsanacion(inspeccion.fecha) } : {}
      });
    }
  }
  return abiertas;
}
var URGENCIA = {
  vencido: 0,
  proximo: 1,
  pendiente: 2,
  sin_registro: 3,
  vigente: 4
};
function peor(a, b) {
  return URGENCIA[a] <= URGENCIA[b] ? a : b;
}
function lecturasDe(lecturas, componenteId, hasta) {
  return lecturas.filter((l) => l.componenteId === componenteId && l.fecha <= hasta).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horas - b.horas);
}
function ritmo(serie) {
  const primera = serie[0];
  const ultima = serie.at(-1);
  if (primera === void 0 || ultima === void 0) return void 0;
  const dias = diasEntre(primera.fecha, ultima.fecha);
  const horas = ultima.horas - primera.horas;
  return dias > 0 && horas > 0 ? horas / dias : void 0;
}
function evaluarTarea(base, componente, trabajos, lecturas, hoy2) {
  const avisos = [];
  const serie = componente !== void 0 ? lecturasDe(lecturas, componente.id, hoy2) : [];
  const horasActuales = serie.at(-1)?.horas;
  const hechos = trabajos.filter(
    (t) => t.tareaId === base.tareaId && t.componenteId === componente?.id && t.fecha <= hoy2
  ).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultimo = hechos.at(-1);
  let desde;
  let intervalo2 = base.cada;
  let taller = base.taller;
  let rodaje = false;
  if (ultimo !== void 0) {
    let horas = ultimo.horas;
    if (horas === void 0 && componente !== void 0) {
      const anterior = lecturasDe(lecturas, componente.id, ultimo.fecha).at(-1);
      if (anterior !== void 0) {
        horas = anterior.horas;
        avisos.push(
          `El \xFAltimo trabajo no anot\xF3 las horas: se toman las de la lectura del ${anterior.fecha}.`
        );
      }
    }
    desde = { fecha: ultimo.fecha, ...horas !== void 0 ? { horas } : {} };
  } else if (componente?.alta.nuevo === true) {
    desde = { fecha: componente.alta.fecha, horas: componente.alta.horas ?? 0 };
    if (base.primeraVez !== void 0) {
      intervalo2 = base.primeraVez;
      taller = base.tallerPrimeraVez ?? base.taller;
      rodaje = true;
    }
  }
  const comun = {
    origen: base.origen,
    tarea: base.tarea,
    tareaId: base.tareaId,
    ...base.planId !== void 0 ? { planId: base.planId } : {},
    ...componente !== void 0 ? { componenteId: componente.id, componente: componente.nombre } : {},
    ...base.sistema !== void 0 ? { sistema: base.sistema } : {},
    ...base.accion !== void 0 ? { accion: base.accion } : {},
    ...taller !== void 0 && taller !== "no" ? { taller } : {},
    ...rodaje ? { rodaje } : {},
    intervalo: intervalo2,
    fuente: base.fuente,
    ...base.notas !== void 0 ? { notas: base.notas } : {},
    ...horasActuales !== void 0 ? { horasActuales } : {}
  };
  if (desde === void 0) {
    return {
      ...comun,
      estado: "sin_registro",
      proxima: {},
      avisos: [
        "No hay registro de cu\xE1ndo se hizo por \xFAltima vez. El sistema no lo supone: anote el \xFAltimo trabajo, o h\xE1galo y reg\xEDstrelo."
      ]
    };
  }
  let estadoHoras;
  let proximaHoras;
  let fechaEstimada;
  if (intervalo2.horas !== void 0) {
    if (desde.horas === void 0) {
      avisos.push("No se conocen las horas del \xFAltimo trabajo: el l\xEDmite por horas no se eval\xFAa.");
    } else {
      proximaHoras = desde.horas + intervalo2.horas;
      if (horasActuales === void 0) {
        avisos.push("Falta la lectura del hor\xF3metro: el l\xEDmite por horas no se eval\xFAa.");
      } else {
        const restantes = proximaHoras - horasActuales;
        const margen = Math.max(1, intervalo2.horas * 0.1);
        estadoHoras = restantes <= 0 ? "vencido" : restantes <= margen ? "proximo" : "vigente";
        const porDia = ritmo(serie);
        const ultimaLectura = serie.at(-1);
        if (restantes > 0 && porDia !== void 0 && ultimaLectura !== void 0) {
          fechaEstimada = sumarDias(ultimaLectura.fecha, Math.ceil(restantes / porDia));
        }
      }
    }
  }
  let estadoTiempo;
  let proximaFecha;
  if (intervalo2.meses !== void 0) {
    proximaFecha = sumarMeses(desde.fecha, intervalo2.meses);
    const avisoDias = Math.min(30, Math.max(1, Math.round(intervalo2.meses * 30 * 0.1)));
    estadoTiempo = estadoPlazo(proximaFecha, hoy2, avisoDias);
  }
  if (fechaEstimada !== void 0 && proximaFecha !== void 0 && fechaEstimada >= proximaFecha) {
    fechaEstimada = void 0;
  }
  let estado2;
  let manda;
  if (estadoHoras !== void 0 && estadoTiempo !== void 0) {
    estado2 = peor(estadoHoras, estadoTiempo);
    manda = URGENCIA[estadoHoras] <= URGENCIA[estadoTiempo] ? "horas" : "tiempo";
  } else if (estadoHoras !== void 0) {
    estado2 = estadoHoras;
    manda = "horas";
  } else if (estadoTiempo !== void 0) {
    estado2 = estadoTiempo;
    manda = "tiempo";
  } else {
    estado2 = "sin_registro";
  }
  return {
    ...comun,
    estado: estado2,
    ultimaVez: desde,
    proxima: {
      ...proximaFecha !== void 0 ? { fecha: proximaFecha } : {},
      ...proximaHoras !== void 0 ? { horas: proximaHoras } : {},
      ...fechaEstimada !== void 0 ? { fechaEstimada } : {}
    },
    ...manda !== void 0 ? { manda } : {},
    avisos
  };
}
function fechaDeOrden(l) {
  const candidatas = [l.proxima.fecha, l.proxima.fechaEstimada].filter(
    (f) => f !== void 0
  );
  return candidatas.sort()[0] ?? "9999-12-31";
}
function planMantenimiento(entrada, hoy2) {
  if (!esFechaISO(hoy2)) {
    throw new TypeError(`Fecha inv\xE1lida: '${hoy2}'. Se espera AAAA-MM-DD.`);
  }
  const lineas = [];
  const avisos = [];
  for (const componente of entrada.componentes) {
    if (componente.baja !== void 0 && componente.baja <= hoy2) continue;
    const serie = lecturasDe(entrada.lecturas, componente.id, hoy2);
    for (let i = 1; i < serie.length; i += 1) {
      const antes = serie[i - 1];
      const ahora = serie[i];
      if (ahora.horas < antes.horas) {
        avisos.push(
          `${componente.nombre}: la lectura del ${ahora.fecha} (${ahora.horas} h) es menor que la del ${antes.fecha} (${antes.horas} h). \xBFError de anotaci\xF3n o hor\xF3metro cambiado?`
        );
      }
    }
    const plan = planDe(componente, entrada.catalogos);
    const propias = (entrada.tareasPropias ?? []).filter((t) => t.componenteId === componente.id);
    if (plan === void 0 && propias.length === 0) {
      const parecido = planParecido(componente, entrada.catalogos);
      avisos.push(
        `${componente.nombre}: no hay plan del fabricante en el cat\xE1logo para ${[componente.marca, componente.modelo].filter(Boolean).join(" ") || "este componente"}. ` + (parecido !== void 0 ? `El cat\xE1logo tiene el de \xAB${parecido.plan.documento}\xBB para el ${parecido.modelo}: si \xAB${componente.modelo}\xBB es ese modelo con su c\xF3digo de tipo, anote solo ${parecido.modelo} o as\xEDgnele el plan a mano; si es otro modelo, tiene su propio manual.` : "Pueden anotarse sus tareas a mano, con la fuente de la que salen.")
      );
    }
    if (plan !== void 0) {
      if (componente.planId !== void 0 && plan.aplicaA.modelos !== void 0 && !plan.aplicaA.modelos.some((m) => normal(m) === normal(componente.modelo))) {
        avisos.push(
          `${componente.nombre}: se le ha asignado el plan \xAB${plan.documento}\xBB, que el manual declara para ${plan.aplicaA.modelos.join(", ")}, no para ${componente.modelo ?? "este modelo"}.`
        );
      }
      let faltaTransmision = false;
      const faltaEquipamiento = /* @__PURE__ */ new Set();
      for (const tarea of plan.tareas) {
        const exige = tarea.soloSi?.transmision;
        if (exige !== void 0) {
          if (componente.transmision === void 0) {
            faltaTransmision = true;
            continue;
          }
          if (componente.transmision !== exige) continue;
        }
        const equipo = tarea.soloSi?.equipamiento;
        if (equipo !== void 0) {
          const tiene = componente.equipamiento?.[equipo];
          if (tiene === void 0) {
            faltaEquipamiento.add(equipo);
            continue;
          }
          if (!tiene) continue;
        }
        lineas.push(
          evaluarTarea(
            {
              origen: "fabricante",
              tareaId: tarea.id,
              planId: plan.id,
              tarea: tarea.tarea,
              accion: tarea.accion,
              ...tarea.taller !== void 0 ? { taller: tarea.taller } : {},
              ...tarea.tallerPrimeraVez !== void 0 ? { tallerPrimeraVez: tarea.tallerPrimeraVez } : {},
              ...tarea.sistema !== void 0 ? { sistema: tarea.sistema } : {},
              cada: tarea.cada,
              ...tarea.primeraVez !== void 0 ? { primeraVez: tarea.primeraVez } : {},
              fuente: `${plan.documento}, ${tarea.fuente}`,
              ...tarea.notas !== void 0 ? { notas: tarea.notas } : {}
            },
            componente,
            entrada.trabajos,
            entrada.lecturas,
            hoy2
          )
        );
      }
      if (faltaTransmision) {
        avisos.push(
          `${componente.nombre}: no consta si la transmisi\xF3n es inversor o saildrive, as\xED que las tareas que dependen de ello no se incluyen.`
        );
      }
      for (const equipo of faltaEquipamiento) {
        avisos.push(
          `${componente.nombre}: no consta si tiene ${NOMBRE_EQUIPAMIENTO[equipo]}, as\xED que las tareas que dependen de ello no se incluyen.`
        );
      }
      if (plan.advertencia !== void 0) avisos.push(`${componente.nombre}: ${plan.advertencia}`);
    }
    for (const propia of propias) {
      lineas.push(
        evaluarTarea(
          {
            origen: "propia",
            tareaId: propia.id,
            tarea: propia.tarea,
            ...propia.accion !== void 0 ? { accion: propia.accion } : {},
            cada: propia.cada,
            fuente: propia.fuente
          },
          componente,
          entrada.trabajos,
          entrada.lecturas,
          hoy2
        )
      );
    }
  }
  for (const propia of (entrada.tareasPropias ?? []).filter((t) => t.componenteId === void 0)) {
    lineas.push(
      evaluarTarea(
        {
          origen: "propia",
          tareaId: propia.id,
          tarea: propia.tarea,
          ...propia.accion !== void 0 ? { accion: propia.accion } : {},
          cada: propia.cada,
          fuente: propia.fuente
        },
        void 0,
        entrada.trabajos,
        entrada.lecturas,
        hoy2
      )
    );
  }
  for (const t of entrada.tareasAnalisis ?? []) {
    const componente = t.componenteId !== void 0 ? entrada.componentes.find((c) => c.id === t.componenteId && (c.baja === void 0 || c.baja > hoy2)) : void 0;
    if (t.componenteId !== void 0 && componente === void 0) continue;
    lineas.push(
      evaluarTarea(
        {
          origen: "analisis",
          tareaId: t.id,
          tarea: t.tarea,
          ...t.accion !== void 0 ? { accion: t.accion } : {},
          cada: t.cada,
          fuente: t.fuente
        },
        componente,
        entrada.trabajos,
        entrada.lecturas,
        hoy2
      )
    );
  }
  for (const v of entrada.vencimientos ?? []) {
    if (v.clase === "ventana" && v.fecha <= hoy2) continue;
    lineas.push({
      origen: "norma",
      tarea: v.concepto,
      estado: v.estado,
      proxima: { fecha: v.fecha },
      manda: "tiempo",
      fuente: v.cita,
      // Cuando el equipo vencido es grave, eso ya lo dice el aviso: el detalle del
      // calendario lo repetiría con otras palabras.
      ...v.detalle !== void 0 && v.gravedadSiVence === void 0 ? { notas: v.detalle } : {},
      avisos: v.gravedadSiVence !== void 0 ? [
        `${v.estado === "vencido" ? "Vencido, es" : "Si vence, ser\xE1"} deficiencia grave: Anexo III, letra ${v.gravedadSiVence.letra}) \u2014 ` + v.gravedadSiVence.supuesto
      ] : []
    });
  }
  for (const d of entrada.deficiencias ?? []) {
    const informe = d.numeroInforme !== void 0 && d.numeroInforme !== "" ? `informe ${d.numeroInforme}, ` : "";
    lineas.push({
      origen: "inspeccion",
      tarea: `Corregir: ${d.titulo}${d.observacion !== void 0 ? ` \u2014 ${d.observacion}` : ""}`,
      // Una grave tiene plazo legal: vencido si ha pasado, próximo mientras corre. Una
      // leve no tiene plazo, pero está abierta: pendiente.
      estado: d.limite !== void 0 ? d.limite < hoy2 ? "vencido" : "proximo" : "pendiente",
      deficienciaId: d.id,
      proxima: d.limite !== void 0 ? { fecha: d.limite } : {},
      ...d.limite !== void 0 ? { manda: "tiempo" } : {},
      ultimaVez: { fecha: d.fecha },
      fuente: d.grave ? `Deficiencia grave de la inspecci\xF3n del ${d.fecha} (${informe}punto ${d.puntoId}); plazo de subsanaci\xF3n de dos meses, RD 1434/1999, art. 10.2.\xBA` : `Deficiencia leve de la inspecci\xF3n del ${d.fecha} (${informe}punto ${d.puntoId})`,
      avisos: []
    });
  }
  lineas.sort(
    (a, b) => URGENCIA[a.estado] - URGENCIA[b.estado] || fechaDeOrden(a).localeCompare(fechaDeOrden(b)) || a.tarea.localeCompare(b.tarea, "es")
  );
  return { lineas, avisos };
}

// ../itb-motor/src/motor/analisis.ts
var TIPOS_TAREA = /* @__PURE__ */ new Set(["condicion", "sustitucion", "busqueda", "rediseno", "correctivo"]);
var escala = (v) => Number.isInteger(v) && v >= 1 && v <= 5;
function validarCatalogoAnalisis(datos, origen) {
  if (typeof datos !== "object" || datos === null) {
    throw new ErrorCatalogo("el fichero no contiene un an\xE1lisis de fallos", origen);
  }
  const c = datos;
  for (const campo2 of ["id", "titulo", "embarcacion"]) {
    if (typeof c[campo2] !== "string" || c[campo2].trim() === "") {
      throw new ErrorCatalogo(`falta el campo '${campo2}'`, origen);
    }
  }
  if (typeof c["aplicaA"]?.["tipoComponente"] !== "string") {
    throw new ErrorCatalogo("falta 'aplicaA.tipoComponente'", origen);
  }
  const fuentes = c["fuentes"];
  if (!Array.isArray(fuentes)) throw new ErrorCatalogo("falta la lista 'fuentes'", origen);
  const claves = /* @__PURE__ */ new Set();
  for (const f of fuentes) {
    if (typeof f["clave"] !== "string" || typeof f["referencia"] !== "string") {
      throw new ErrorCatalogo("una fuente sin 'clave' o sin 'referencia'", origen);
    }
    claves.add(f["clave"]);
  }
  if (!Array.isArray(c["modos"]) || c["modos"].length === 0) {
    throw new ErrorCatalogo("falta la lista 'modos'", origen);
  }
  const vistos = /* @__PURE__ */ new Set();
  for (const [i, m] of c["modos"].entries()) {
    const donde = `modo #${i + 1}${typeof m["id"] === "string" ? ` (${m["id"]})` : ""}`;
    for (const campo2 of ["id", "sistema", "subsistema", "elemento", "funcion", "modo", "causa", "efecto", "anclaSeveridad"]) {
      if (typeof m[campo2] !== "string" || m[campo2].trim() === "") {
        throw new ErrorCatalogo(`${donde}: falta '${campo2}'`, origen);
      }
    }
    if (vistos.has(m["id"])) throw new ErrorCatalogo(`modo repetido: ${m["id"]}`, origen);
    vistos.add(m["id"]);
    if (!escala(m["severidad"])) throw new ErrorCatalogo(`${donde}: 'severidad' debe ser un entero de 1 a 5`, origen);
    if (!escala(m["ocurrencia"])) throw new ErrorCatalogo(`${donde}: 'ocurrencia' debe ser un entero de 1 a 5`, origen);
    if (m["deteccion"] !== "evidente" && m["deteccion"] !== "oculto") {
      throw new ErrorCatalogo(`${donde}: 'deteccion' debe ser evidente u oculto`, origen);
    }
    const citadas = m["fuentesOcurrencia"] ?? [];
    const juicio = m["juicioOcurrencia"];
    if (citadas.length === 0 && (typeof juicio !== "string" || juicio.trim() === "")) {
      throw new ErrorCatalogo(
        `${donde}: la ocurrencia no tiene fuente ni est\xE1 declarada como juicio del autor`,
        origen
      );
    }
    for (const f of citadas) {
      if (!claves.has(f)) throw new ErrorCatalogo(`${donde}: fuente desconocida '${String(f)}'`, origen);
    }
    const tarea = m["tarea"];
    if (tarea === void 0 || !TIPOS_TAREA.has(tarea["tipo"])) {
      throw new ErrorCatalogo(`${donde}: 'tarea.tipo' debe ser condicion, sustitucion, busqueda, rediseno o correctivo`, origen);
    }
    for (const campo2 of ["descripcion", "justificacion"]) {
      if (typeof tarea[campo2] !== "string" || tarea[campo2].trim() === "") {
        throw new ErrorCatalogo(`${donde}: falta 'tarea.${campo2}'`, origen);
      }
    }
    const periodica = tarea["tipo"] === "condicion" || tarea["tipo"] === "sustitucion" || tarea["tipo"] === "busqueda";
    const cada = tarea["cada"];
    if (periodica && (cada === void 0 || cada["meses"] === void 0 && cada["horas"] === void 0)) {
      throw new ErrorCatalogo(`${donde}: una tarea peri\xF3dica necesita 'tarea.cada'`, origen);
    }
    const criticidad = criticidadDe(m);
    if (tarea["tipo"] === "correctivo" && criticidad !== "C") {
      throw new ErrorCatalogo(
        `${donde}: un modo de criticidad ${criticidad} no puede dejarse hasta el fallo`,
        origen
      );
    }
  }
  return c;
}
var MATRIZ = {
  5: ["B", "A", "A", "A", "A"],
  4: ["C", "B", "A", "A", "A"],
  3: ["C", "C", "B", "B", "A"],
  2: ["C", "C", "C", "B", "B"],
  1: ["C", "C", "C", "C", "C"]
};
function criticidadDe(m) {
  if (m.deteccion === "oculto" && m.severidad >= 4) return "A";
  return MATRIZ[m.severidad][m.ocurrencia - 1];
}
function enMeses(intervalo2, horasAlAnio) {
  if (intervalo2 === void 0) return void 0;
  const candidatos = [];
  if (intervalo2.meses !== void 0) candidatos.push(intervalo2.meses);
  if (intervalo2.horas !== void 0) candidatos.push(intervalo2.horas / horasAlAnio * 12);
  return candidatos.length > 0 ? Math.min(...candidatos) : void 0;
}
function coberturaDelAnalisis(catalogo, opciones) {
  const intervaloDeTarea = /* @__PURE__ */ new Map();
  for (const plan of opciones.pautas) for (const t of plan.tareas) intervaloDeTarea.set(t.id, t.cada);
  return catalogo.modos.filter((m) => m.soloSi?.transmision === void 0 || m.soloSi.transmision === opciones.transmision).map((modo) => {
    const criticidad = criticidadDe(modo);
    const necesarioMeses = enMeses(modo.tarea.cada, opciones.horasAlAnio);
    const cumple2 = (meses2) => meses2 !== void 0 && (necesarioMeses === void 0 || meses2 <= necesarioMeses);
    let fabricante;
    const tareas = modo.cubiertoPor?.fabricante ?? [];
    if (tareas.length > 0) {
      const meses2 = tareas.map((id) => enMeses(intervaloDeTarea.get(id), opciones.horasAlAnio)).filter((x) => x !== void 0).sort((a, b) => a - b)[0];
      fabricante = { tareas, ...meses2 !== void 0 ? { meses: meses2 } : {}, suficiente: cumple2(meses2) };
    }
    let norma;
    const puntos = modo.cubiertoPor?.anexoII ?? [];
    if (puntos.length > 0) {
      norma = { puntos, meses: opciones.mesesEntreReconocimientos, suficiente: cumple2(opciones.mesesEntreReconocimientos) };
    }
    const cubierto = fabricante?.suficiente === true || norma?.suficiente === true;
    return {
      modo,
      criticidad,
      ...necesarioMeses !== void 0 ? { necesarioMeses } : {},
      ...fabricante !== void 0 ? { fabricante } : {},
      ...norma !== void 0 ? { norma } : {},
      hueco: criticidad !== "C" && modo.tarea.tipo !== "correctivo" && !cubierto
    };
  });
}
function resumirCobertura(cobertura) {
  const relevantes = cobertura.filter((c) => c.criticidad !== "C");
  return {
    total: cobertura.length,
    porCriticidad: {
      A: cobertura.filter((c) => c.criticidad === "A").length,
      B: cobertura.filter((c) => c.criticidad === "B").length,
      C: cobertura.filter((c) => c.criticidad === "C").length
    },
    relevantes: relevantes.length,
    cubiertosPorFabricante: relevantes.filter((c) => c.fabricante?.suficiente === true).length,
    cubiertosPorNorma: relevantes.filter((c) => c.norma?.suficiente === true).length,
    huecos: relevantes.filter((c) => c.hueco).length,
    ocultos: cobertura.filter((c) => c.modo.deteccion === "oculto").length,
    ocurrenciasPorJuicio: cobertura.filter((c) => (c.modo.fuentesOcurrencia ?? []).length === 0).length
  };
}
function tareasDelAnalisis(cobertura, motorId) {
  return cobertura.filter((c) => c.hueco && c.modo.tarea.cada !== void 0).map(({ modo, criticidad }) => {
    const cada = modo.tarea.cada;
    const conHoras = cada.horas !== void 0 && motorId !== void 0;
    return {
      id: `analisis:${modo.id}`,
      ...conHoras ? { componenteId: motorId } : {},
      tarea: modo.tarea.descripcion,
      accion: modo.tarea.tipo === "sustitucion" ? "sustituir" : "revisar",
      // Sin motor al que atarlas, las horas no se pueden contar: queda solo el tiempo.
      cada: conHoras || cada.meses === void 0 ? cada : { meses: cada.meses },
      fuente: `An\xE1lisis de fallos \u2014 ${modo.elemento}: ${modo.modo.charAt(0).toLowerCase()}${modo.modo.slice(1)} (S${modo.severidad}\xB7O${modo.ocurrencia}${modo.deteccion === "oculto" ? ", oculto" : ""}, criticidad ${criticidad}). ${modo.tarea.justificacion}`
    };
  });
}

// ../itb-motor/src/motor/index.ts
function aConclusion(regla) {
  return {
    tipo: regla.entonces.reconocimiento,
    exento: regla.entonces.exento === true,
    consecuencia: regla.entonces,
    fundamento: {
      reglaId: regla.id,
      cita: regla.cita,
      explicacion: regla.explicacion,
      ...regla.advertencia !== void 0 ? { advertencia: regla.advertencia } : {}
    }
  };
}
function resolverConcurrencia(candidatas, avisos) {
  const porTipo = /* @__PURE__ */ new Map();
  for (const c of candidatas) {
    const lista2 = porTipo.get(c.tipo);
    if (lista2) lista2.push(c);
    else porTipo.set(c.tipo, [c]);
  }
  const resueltas = [];
  for (const [tipo, grupo] of porTipo) {
    const obligan = grupo.filter((c) => !c.exento);
    const eximen = grupo.filter((c) => c.exento);
    if (obligan.length > 0 && eximen.length > 0) {
      avisos.push(
        `Conflicto en el cat\xE1logo para el reconocimiento '${tipo}': ${eximen.map((c) => c.fundamento.reglaId).join(", ")} eximen mientras ${obligan.map((c) => c.fundamento.reglaId).join(", ")} obligan. Se aplica la obligaci\xF3n por prudencia. Revisar el cat\xE1logo.`
      );
    }
    resueltas.push(...obligan.length > 0 ? obligan : eximen);
  }
  return resueltas;
}
function evaluar(embarcacion, catalogos, fecha) {
  if (!esFechaISO(fecha)) {
    throw new TypeError(
      `Fecha de evaluaci\xF3n inv\xE1lida: '${fecha}'. Se espera AAAA-MM-DD.`
    );
  }
  const avisos = [];
  const candidatas = [];
  for (const catalogo of catalogos) {
    for (const regla of reglasEnVigor(catalogo.reglas, fecha)) {
      if (cumpleCondiciones(embarcacion, regla.cuando)) {
        candidatas.push(aConclusion(regla));
      }
    }
  }
  const conclusiones = resolverConcurrencia(candidatas, avisos);
  if (conclusiones.length === 0) {
    avisos.push(
      "Ninguna regla en vigor se aplica a esta embarcaci\xF3n. O los datos est\xE1n incompletos, o el cat\xE1logo tiene un hueco."
    );
  }
  return {
    embarcacionId: embarcacion.id,
    fechaEvaluacion: fecha,
    versionCatalogo: catalogos.map((c) => `${c.norma}@${c.version}`).join(" + "),
    conclusiones,
    avisos
  };
}
function conclusionesDe(evaluacion, tipo) {
  return evaluacion.conclusiones.filter((c) => c.tipo === tipo);
}

// src/datos/reglas-rd1434.json
var reglas_rd1434_default = {
  norma: "RD 1434/1999",
  identificadorBoe: "BOE-A-1999-18663",
  version: "2011-01-01",
  descripcion: "Reconocimientos obligatorios a los que est\xE1n sujetas las embarcaciones de recreo, y periodicidad de cada uno.",
  reglas: [
    {
      id: "RD1434-A3A-inicial-general",
      cita: "RD 1434/1999, art. 3.A)",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false
      },
      entonces: {
        reconocimiento: "inicial",
        loRealiza: "administracion_maritima",
        enSeco: false
      },
      explicacion: "Todas las embarcaciones de recreo deben realizar un reconocimiento inicial, llevado a cabo por la Administraci\xF3n mar\xEDtima, consistente en el examen de planos y documentaci\xF3n t\xE9cnica y en la inspecci\xF3n de la estructura, las m\xE1quinas y el equipo. Superado el reconocimiento se expide el certificado de navegabilidad."
    },
    {
      id: "RD1434-A3A-inicial-exencion-marcado-ce",
      cita: "RD 1434/1999, art. 3.A), p\xE1rrafos cuarto y quinto",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: true
      },
      entonces: {
        reconocimiento: "inicial",
        exento: true
      },
      explicacion: "Las embarcaciones que llevan incorporado el marcado \xABCE\xBB de conformidad no precisan reconocimiento inicial: el certificado de navegabilidad les es expedido de forma autom\xE1tica por la Administraci\xF3n mar\xEDtima. Siguen sujetas a los reconocimientos peri\xF3dicos, intermedios, adicionales y extraordinarios que procedan. El texto consolidado remite al RD 2127/2004, derogado; la remisi\xF3n se aplica hoy con el RD 98/2016."
    },
    {
      id: "RD1434-A3B-periodico-lista7",
      cita: "RD 1434/1999, art. 3.B), p\xE1rrafo primero",
      vigenciaDesde: "2011-01-01",
      vigenciaHasta: null,
      cuando: {
        lista: 7,
        esloraCascoM: {
          min: 6,
          max: 24,
          maxExcluido: true
        }
      },
      entonces: {
        reconocimiento: "periodico",
        loRealiza: "entidad_colaboradora",
        enSeco: true,
        periodicidadMaximaAnios: 5
      },
      explicacion: "Las embarcaciones de eslora mayor o igual a 6 metros y menor de 24 metros, registradas en la lista 7.\xAA, est\xE1n sujetas a reconocimientos peri\xF3dicos cada cinco a\xF1os como m\xE1ximo. El reconocimiento consiste en una inspecci\xF3n del casco en seco y del equipo, acompa\xF1ada de pruebas cuando sea necesario, y en una inspecci\xF3n minuciosa de los elementos de salvamento y seguridad, material n\xE1utico y resto del equipo."
    },
    {
      id: "RD1434-A3B-periodico-lista6",
      cita: "RD 1434/1999, art. 3.B), p\xE1rrafo segundo",
      vigenciaDesde: "2011-01-01",
      vigenciaHasta: null,
      cuando: {
        lista: 6
      },
      entonces: {
        reconocimiento: "periodico",
        loRealiza: "entidad_colaboradora",
        enSeco: true,
        periodicidadMaximaAnios: 5
      },
      explicacion: "Las embarcaciones registradas en la lista 6.\xAA est\xE1n sujetas a la realizaci\xF3n de los reconocimientos peri\xF3dicos en el plazo de cinco a\xF1os como m\xE1ximo, cualquiera que sea su eslora."
    },
    {
      id: "RD1434-A3B-exencion-lista7-menor-6m",
      cita: "RD 1434/1999, art. 3.B), p\xE1rrafo cuarto",
      vigenciaDesde: "2011-01-01",
      vigenciaHasta: null,
      cuando: {
        lista: 7,
        esloraCascoM: {
          max: 6,
          maxExcluido: true
        }
      },
      entonces: {
        reconocimiento: "periodico",
        exento: true,
        certificadoSinCaducidad: true
      },
      explicacion: "Las embarcaciones de eslora inferior a 6 metros registradas en la lista 7.\xAA est\xE1n exentas de reconocimientos peri\xF3dicos. En el certificado de navegabilidad deber\xE1 constar la frase \xABSIN CADUCIDAD\xBB."
    },
    {
      id: "RD1434-A3C-intermedio-lista6",
      cita: "RD 1434/1999, art. 3.C), p\xE1rrafo primero",
      vigenciaDesde: "2011-01-01",
      vigenciaHasta: null,
      cuando: {
        lista: 6,
        esloraCascoM: {
          min: 6
        }
      },
      entonces: {
        reconocimiento: "intermedio",
        loRealiza: "entidad_colaboradora",
        enSeco: true,
        ventanaAnios: {
          desde: 2,
          hasta: 3
        }
      },
      explicacion: "Las embarcaciones registradas en la lista 6.\xAA de eslora mayor o igual a 6 metros est\xE1n obligadas a realizar un reconocimiento intermedio en seco entre el segundo y el tercer a\xF1o del per\xEDodo establecido, para comprobar el estado de mantenimiento del equipo y del casco."
    },
    {
      id: "RD1434-A3C-intermedio-lista7-15m",
      cita: "RD 1434/1999, art. 3.C), p\xE1rrafo primero",
      vigenciaDesde: "2011-01-01",
      vigenciaHasta: null,
      cuando: {
        lista: 7,
        esloraCascoM: {
          min: 15
        }
      },
      entonces: {
        reconocimiento: "intermedio",
        loRealiza: "entidad_colaboradora",
        enSeco: true,
        ventanaAnios: {
          desde: 2,
          hasta: 3
        }
      },
      explicacion: "Las embarcaciones registradas en la lista 7.\xAA de eslora mayor o igual a 15 metros est\xE1n obligadas a realizar un reconocimiento intermedio en seco entre el segundo y el tercer a\xF1o del per\xEDodo establecido."
    },
    {
      id: "RD1434-A3C-intermedio-lista7-madera",
      cita: "RD 1434/1999, art. 3.C), p\xE1rrafo segundo",
      vigenciaDesde: "2011-01-01",
      vigenciaHasta: null,
      cuando: {
        lista: 7,
        esloraCascoM: {
          min: 6
        },
        materialCasco: "madera"
      },
      entonces: {
        reconocimiento: "intermedio",
        loRealiza: "entidad_colaboradora",
        enSeco: true,
        ventanaAnios: {
          desde: 2,
          hasta: 3
        }
      },
      explicacion: "Est\xE1n tambi\xE9n obligadas a la realizaci\xF3n de reconocimientos intermedios las embarcaciones inscritas en la lista 7.\xAA de eslora mayor o igual a 6 metros, siempre que el casco sea de madera."
    }
  ]
};

// src/datos/equipo-rd339.json
var equipo_rd339_default = {
  norma: "RD 339/2021",
  identificadorBoe: "BOE-A-2021-8268",
  version: "2022-07-21",
  descripcion: "Equipo de seguridad, salvamento, contraincendios, navegaci\xF3n y prevenci\xF3n de la contaminaci\xF3n exigible a las embarcaciones de recreo, en funci\xF3n de la zona de navegaci\xF3n y de las caracter\xEDsticas de la embarcaci\xF3n.",
  reglas: [
    {
      id: "RD339-A6-balsas-zonas123",
      cita: "RD 339/2021, art. 6.1",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 3
        }
      },
      entonces: {
        equipo: "balsa_salvavidas",
        nombre: "Balsa salvavidas",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: {
          expresion: "personasABordo"
        },
        unidad: "plazas",
        requisitos: [
          "Conforme a la norma ISO 9650 u otra equivalente, homologada por la DGMM",
          "Revisada seg\xFAn las instrucciones del fabricante, en estaci\xF3n de servicio autorizada"
        ]
      },
      explicacion: "Las embarcaciones de recreo que naveguen en zonas 1, 2 o 3 deber\xE1n llevar una o varias balsas salvavidas con capacidad para el total de las personas a bordo."
    },
    {
      id: "RD339-A6-balsas-revision-comercial",
      cita: "RD 339/2021, art. 6.3.a)",
      vigenciaDesde: "2022-07-21",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 3
        },
        finesComerciales: true
      },
      entonces: {
        equipo: "balsa_salvavidas",
        nombre: "Balsa salvavidas",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: {
          expresion: "personasABordo"
        },
        unidad: "plazas",
        requisitos: [
          "Intervalo de revisi\xF3n no superior a 24 meses (actividad comercial o lucrativa)",
          "Revisi\xF3n en estaci\xF3n de servicio autorizada"
        ]
      },
      grupo: "balsa_salvavidas",
      precedencia: 10,
      explicacion: "Los intervalos de revisi\xF3n de las balsas instaladas en embarcaciones de recreo que desarrollen una actividad con fines comerciales o lucrativos no podr\xE1n ser superiores a los 24 meses."
    },
    {
      id: "RD339-A7-chalecos-general",
      cita: "RD 339/2021, art. 7.1",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "chaleco_salvavidas",
        nombre: "Chaleco salvavidas",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: {
          expresion: "personasABordo"
        },
        requisitos: [
          "Uno por persona a bordo, completado con luz para chaleco",
          "Chalecos adecuados al peso y tama\xF1o de ni\xF1os y beb\xE9s a bordo"
        ]
      },
      grupo: "chaleco_salvavidas",
      precedencia: 0,
      explicacion: "Las embarcaciones de recreo deber\xE1n llevar como m\xEDnimo un chaleco salvavidas por persona a bordo, los cuales se completar\xE1n con una luz para chaleco salvavidas. Se proveer\xE1n chalecos para todos los ni\xF1os y beb\xE9s a bordo, adecuados a su peso y tama\xF1o."
    },
    {
      id: "RD339-A7-chalecos-zona1-adicional",
      cita: "RD 339/2021, art. 7.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "chaleco_salvavidas",
        nombre: "Chaleco salvavidas",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: {
          expresion: "personasABordo + 1"
        },
        requisitos: [
          "Uno por persona a bordo m\xE1s uno adicional (zona 1)",
          "Flotabilidad m\xEDnima 275 N"
        ]
      },
      grupo: "chaleco_salvavidas",
      precedencia: 20,
      explicacion: "Las embarcaciones de recreo que naveguen en zona 1 deber\xE1n llevar un chaleco salvavidas adicional. La flotabilidad m\xEDnima de los chalecos en zona 1 es de 275 N."
    },
    {
      id: "RD339-A7-chalecos-sin-luz-diurna",
      cita: "RD 339/2021, art. 7.1, segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 4,
          max: 7
        },
        navegacionDiurna: true
      },
      entonces: {
        equipo: "chaleco_salvavidas",
        nombre: "Chaleco salvavidas",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: {
          expresion: "personasABordo"
        },
        requisitos: [
          "Uno por persona a bordo; se puede prescindir de la luz (navegaci\xF3n diurna en zonas 4 a 7)"
        ]
      },
      grupo: "chaleco_salvavidas",
      precedencia: 10,
      explicacion: "En las embarcaciones de recreo que naveguen en zonas 4, 5, 6 o 7 y que realicen exclusivamente navegaciones diurnas, se podr\xE1 prescindir de la luz del chaleco."
    },
    {
      id: "RD339-A7-chalecos-flotabilidad-234",
      cita: "RD 339/2021, art. 7.5, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 2,
          max: 4
        }
      },
      entonces: {
        equipo: "chaleco_flotabilidad",
        nombre: "Flotabilidad m\xEDnima del chaleco",
        cantidad: 150,
        unidad: "N",
        redondear: false,
        minimoPorUnidad: true
      },
      explicacion: "Los chalecos salvavidas certificados conforme al Reglamento (UE) 2016/425 deber\xE1n tener, en zonas 2, 3 y 4, una flotabilidad m\xEDnima de 150 N."
    },
    {
      id: "RD339-A7-chalecos-flotabilidad-567",
      cita: "RD 339/2021, art. 7.5, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 5,
          max: 7
        }
      },
      entonces: {
        equipo: "chaleco_flotabilidad",
        nombre: "Flotabilidad m\xEDnima del chaleco",
        cantidad: 100,
        unidad: "N",
        redondear: false,
        minimoPorUnidad: true
      },
      explicacion: "Los chalecos salvavidas certificados conforme al Reglamento (UE) 2016/425 deber\xE1n tener, en zonas 5, 6 y 7, una flotabilidad m\xEDnima de 100 N."
    },
    {
      id: "RD339-A7-chalecos-flotabilidad-zona1",
      cita: "RD 339/2021, art. 7.5, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "chaleco_flotabilidad",
        nombre: "Flotabilidad m\xEDnima del chaleco",
        cantidad: 275,
        unidad: "N",
        redondear: false,
        minimoPorUnidad: true
      },
      explicacion: "Los chalecos salvavidas certificados conforme al Reglamento (UE) 2016/425 deber\xE1n tener, en zona 1, una flotabilidad m\xEDnima de 275 N."
    },
    {
      id: "RD339-A8-aros-zonas1234",
      cita: "RD 339/2021, art. 8",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 4
        }
      },
      entonces: {
        equipo: "aro_salvavidas",
        nombre: "Aro salvavidas",
        familia: "salvamento",
        cantidad: 1,
        requisitos: [
          "Con luz y rabiza"
        ]
      },
      grupo: "aro_salvavidas",
      precedencia: 0,
      explicacion: "Las embarcaciones de recreo que naveguen en zonas 1, 2, 3 o 4 deber\xE1n llevar un aro salvavidas con luz y rabiza."
    },
    {
      id: "RD339-A8-aros-zona1",
      cita: "RD 339/2021, art. 8, segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "aro_salvavidas",
        nombre: "Aro salvavidas",
        familia: "salvamento",
        cantidad: 2,
        requisitos: [
          "Uno con luz y rabiza",
          "Uno adicional, que no necesita luz ni rabiza"
        ]
      },
      grupo: "aro_salvavidas",
      precedencia: 10,
      explicacion: "Adem\xE1s, en zona 1 se deber\xE1 llevar un aro salvavidas adicional, que no necesitar\xE1 ni luz ni rabiza."
    },
    {
      id: "RD339-A9-bengalas-zonas123",
      cita: "RD 339/2021, art. 9, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 3
        }
      },
      entonces: {
        equipo: "bengala_mano",
        nombre: "Bengalas de mano",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 6
      },
      explicacion: "En zonas 1, 2 y 3 se deber\xE1n llevar seis bengalas de mano."
    },
    {
      id: "RD339-A9-bengalas-zonas456",
      cita: "RD 339/2021, art. 9, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 4,
          max: 6
        }
      },
      entonces: {
        equipo: "bengala_mano",
        nombre: "Bengalas de mano",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 3
      },
      explicacion: "En zonas 4, 5 y 6 se deber\xE1n llevar tres bengalas de mano."
    },
    {
      id: "RD339-A9-cohetes-zonas123",
      cita: "RD 339/2021, art. 9, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 3
        }
      },
      entonces: {
        equipo: "cohete_paracaidas",
        nombre: "Cohetes con luz roja y paraca\xEDdas",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 6
      },
      explicacion: "En zonas 1, 2 y 3 se deber\xE1n llevar seis cohetes con luz roja y paraca\xEDdas."
    },
    {
      id: "RD339-A9-cohetes-zona4",
      cita: "RD 339/2021, art. 9, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 4
      },
      entonces: {
        equipo: "cohete_paracaidas",
        nombre: "Cohetes con luz roja y paraca\xEDdas",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 3
      },
      explicacion: "En zona 4 se deber\xE1n llevar tres cohetes con luz roja y paraca\xEDdas."
    },
    {
      id: "RD339-A9-fumigenas-zona1",
      cita: "RD 339/2021, art. 9, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "senal_fumigena",
        nombre: "Se\xF1ales fum\xEDgenas flotantes",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 2
      },
      explicacion: "En zona 1 se deber\xE1n llevar dos se\xF1ales fum\xEDgenas flotantes."
    },
    {
      id: "RD339-A9-fumigenas-zonas23",
      cita: "RD 339/2021, art. 9, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 2,
          max: 3
        }
      },
      entonces: {
        equipo: "senal_fumigena",
        nombre: "Se\xF1ales fum\xEDgenas flotantes",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 1
      },
      explicacion: "En zonas 2 y 3 se deber\xE1 llevar una se\xF1al fum\xEDgena flotante."
    },
    {
      id: "RD339-A10-luces-navegacion",
      cita: "RD 339/2021, art. 10.1 y 10.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "luces_navegacion",
        nombre: "Luces de navegaci\xF3n",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Exigidas por las partes C y D del Reglamento internacional para prevenir los abordajes (COLREG 1972)",
          "Certificadas conforme al RD 701/2016 o aprobadas por un Estado miembro de la UE"
        ]
      },
      grupo: "luces_navegacion",
      precedencia: 0,
      explicacion: "Las embarcaciones de recreo ir\xE1n provistas de las luces, marcas y el equipo para se\xF1ales ac\xFAsticas exigidos por las partes C y D del Convenio sobre el Reglamento internacional para prevenir los abordajes, 1972, enmendado."
    },
    {
      id: "RD339-A10-luces-diurna-menor12m",
      cita: "RD 339/2021, art. 10.3, primer inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 4,
          max: 7
        },
        navegacionDiurna: true,
        esloraTotalM: {
          max: 12,
          maxExcluido: true
        }
      },
      entonces: {
        equipo: "luces_navegacion",
        nombre: "Luces de navegaci\xF3n",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Pueden no estar certificadas ni homologadas, con visibilidad m\xEDnima de 1 milla n\xE1utica"
        ]
      },
      grupo: "luces_navegacion",
      precedencia: 10,
      explicacion: "Las embarcaciones que naveguen en zonas 4 a 7 exclusivamente de d\xEDa podr\xE1n llevar, si su eslora total es menor de 12 metros, luces no certificadas u homologadas, siempre que tengan una visibilidad m\xEDnima de 1 milla n\xE1utica."
    },
    {
      id: "RD339-A10-luces-diurna-menor7m",
      cita: "RD 339/2021, art. 10.3, segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 4,
          max: 7
        },
        navegacionDiurna: true,
        esloraTotalM: {
          max: 7,
          maxExcluido: true
        }
      },
      entonces: {
        equipo: "luces_navegacion",
        nombre: "Luces de navegaci\xF3n",
        exento: true,
        requisitos: [
          "En su defecto, una linterna el\xE9ctrica de luz blanca"
        ]
      },
      grupo: "luces_navegacion",
      precedencia: 20,
      explicacion: "Si la eslora total es menor de 7 metros y se navega exclusivamente de d\xEDa en zonas 4 a 7, se podr\xE1 prescindir de las luces de navegaci\xF3n, llevando en su defecto una linterna el\xE9ctrica de luz blanca."
    },
    {
      id: "RD339-A10-bocina",
      cita: "RD 339/2021, art. 10.4",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "bocina_niebla",
        nombre: "Bocina de niebla",
        cantidad: 1,
        requisitos: [
          "A presi\xF3n manual o accionada por gas en recipiente a presi\xF3n",
          "Si es de gas: una membrana y un recipiente de gas como respetos"
        ]
      },
      explicacion: "Las embarcaciones de recreo ir\xE1n dotadas con una bocina de niebla a presi\xF3n manual o accionada por gas en recipiente a presi\xF3n. En este \xFAltimo caso se dispondr\xE1 de una membrana y un recipiente de gas como respetos."
    },
    {
      id: "RD339-A10-campana-20m",
      cita: "RD 339/2021, art. 10.4, segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraTotalM: {
          min: 20
        }
      },
      entonces: {
        equipo: "campana",
        nombre: "Campana",
        cantidad: 1,
        requisitos: [
          "Di\xE1metro m\xEDnimo de 200 mm"
        ]
      },
      explicacion: "Las embarcaciones de recreo de eslora total igual o superior a 20 metros ir\xE1n dotadas adicionalmente con una campana de al menos 200 mm de di\xE1metro."
    },
    {
      id: "RD339-A11-linea-fondeo",
      cita: "RD 339/2021, art. 11.1 y 11.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "linea_fondeo",
        nombre: "L\xEDnea de fondeo",
        cantidad: {
          expresion: "esloraCascoM * 5"
        },
        unidad: "m",
        requisitos: [
          "Tramo de cadena de longitud m\xEDnima igual a la eslora de la embarcaci\xF3n"
        ]
      },
      grupo: "linea_fondeo",
      precedencia: 0,
      explicacion: "Las embarcaciones de recreo deber\xE1n disponer de una l\xEDnea de fondeo cuya longitud no podr\xE1 ser inferior a cinco veces la eslora de la embarcaci\xF3n. La longitud del tramo de cadena ser\xE1 como m\xEDnimo igual a la eslora de la embarcaci\xF3n.",
      advertencia: "El art\xEDculo dice \xABcinco veces la eslora\xBB sin precisar si es la de casco o la total. El sistema aplica la de casco, que es la que define el RD 1434/1999. Pendiente de confirmar con la entidad colaboradora."
    },
    {
      id: "RD339-A11-linea-fondeo-menor6m",
      cita: "RD 339/2021, art. 11.2, inciso final",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          max: 6
        }
      },
      entonces: {
        equipo: "linea_fondeo",
        nombre: "L\xEDnea de fondeo",
        cantidad: {
          expresion: "esloraCascoM * 5"
        },
        unidad: "m",
        requisitos: [
          "Puede estar constituida enteramente por estacha, sin tramo de cadena"
        ]
      },
      grupo: "linea_fondeo",
      precedencia: 10,
      explicacion: "En las embarcaciones de recreo menores o iguales de 6 metros de eslora, la l\xEDnea de fondeo puede estar constituida enteramente por estacha."
    },
    {
      id: "RD339-A12-compas",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.a)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 4
        }
      },
      entonces: {
        equipo: "compas",
        nombre: "Comp\xE1s",
        cantidad: 1,
        requisitos: [
          "Certificado conforme al RD 701/2016"
        ]
      },
      grupo: "compas",
      precedencia: 0,
      explicacion: "Las embarcaciones que naveguen en zonas 1 a 4 deber\xE1n disponer de un comp\xE1s, certificado de acuerdo con el RD 701/2016."
    },
    {
      id: "RD339-A12-compas-zonas12",
      cita: "RD 339/2021, art. 12.2.a), segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 2
        }
      },
      entonces: {
        equipo: "compas",
        nombre: "Comp\xE1s",
        cantidad: 1,
        requisitos: [
          "Certificado conforme al RD 701/2016",
          "Con iluminaci\xF3n y comp\xE1s de marcaciones",
          "Tablilla de desv\xEDos a bordo, revisada cada cinco a\xF1os"
        ]
      },
      grupo: "compas",
      precedencia: 10,
      explicacion: "En zonas 1 o 2 se deber\xE1 llevar iluminaci\xF3n y un comp\xE1s de marcaciones, exigi\xE9ndose adem\xE1s que exista a bordo una tablilla de desv\xEDos que deber\xE1 revisarse cada cinco a\xF1os."
    },
    {
      id: "RD339-A12-nota-espacio-gobierno-compas",
      cita: "RD 339/2021, art. 12.1, nota (*) de la tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 5,
          max: 7
        },
        categoriaDiseno: [
          "A",
          "B"
        ],
        espacioHabitableGobierno: true
      },
      entonces: {
        equipo: "compas",
        nombre: "Comp\xE1s",
        cantidad: 1,
        requisitos: [
          "Exigible aun navegando solo en zonas 5, 6 o 7 (nota de la tabla)"
        ]
      },
      grupo: "compas",
      precedencia: 30,
      explicacion: "Las embarcaciones de recreo con un espacio habitable cerrado destinado al gobierno o a la navegaci\xF3n, y con categor\xEDa de dise\xF1o A o B, deber\xE1n disponer de comp\xE1s, cartas n\xE1uticas, publicaciones n\xE1uticas y prism\xE1ticos, incluso cuando naveguen exclusivamente en las zonas 5, 6 o 7."
    },
    {
      id: "RD339-A12-cartas",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.c)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 4
        }
      },
      entonces: {
        equipo: "cartas_nauticas",
        nombre: "Cartas n\xE1uticas",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Actualizadas, cubriendo los mares por los que se navegue",
          "Portulanos de los puertos que se utilicen y \xFAtiles necesarios para su uso"
        ]
      },
      grupo: "cartas_nauticas",
      precedencia: 0,
      explicacion: "Las embarcaciones que naveguen en zonas 1 a 4 deber\xE1n llevar cartas n\xE1uticas actualizadas que cubran los mares por los que se navegue y los portulanos de los puertos que se utilicen, as\xED como los \xFAtiles necesarios para su uso."
    },
    {
      id: "RD339-A12-nota-espacio-gobierno-cartas",
      cita: "RD 339/2021, art. 12.1, nota (*) de la tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 5,
          max: 7
        },
        categoriaDiseno: [
          "A",
          "B"
        ],
        espacioHabitableGobierno: true
      },
      entonces: {
        equipo: "cartas_nauticas",
        nombre: "Cartas n\xE1uticas",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Exigible aun navegando solo en zonas 5, 6 o 7 (nota de la tabla)"
        ]
      },
      grupo: "cartas_nauticas",
      precedencia: 30,
      explicacion: "Las embarcaciones con espacio habitable cerrado de gobierno y categor\xEDa de dise\xF1o A o B deber\xE1n disponer de cartas n\xE1uticas incluso navegando exclusivamente en zonas 5, 6 o 7."
    },
    {
      id: "RD339-A12-publicaciones",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.d)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 4
        }
      },
      entonces: {
        equipo: "publicaciones_nauticas",
        nombre: "Publicaciones n\xE1uticas",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Derrotero y Libro de faros y se\xF1ales de niebla actualizados de la zona",
          "Anuario de Mareas del a\xF1o en curso, excepto en el Mediterr\xE1neo"
        ]
      },
      grupo: "publicaciones_nauticas",
      precedencia: 0,
      explicacion: "Son obligatorios el Derrotero y el Libro de faros y se\xF1ales de niebla, actualizados de la zona en que navegue, y el Anuario de Mareas del a\xF1o en curso, excepto en el Mediterr\xE1neo."
    },
    {
      id: "RD339-A12-publicaciones-zonas23",
      cita: "RD 339/2021, art. 12.2.d), segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 2,
          max: 3
        }
      },
      entonces: {
        equipo: "publicaciones_nauticas",
        nombre: "Publicaciones n\xE1uticas",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Derrotero, Libro de faros y se\xF1ales de niebla y Anuario de Mareas",
          "Libro de radiose\xF1ales actualizado (zonas 2 y 3)"
        ]
      },
      grupo: "publicaciones_nauticas",
      precedencia: 10,
      explicacion: "Adem\xE1s, en zonas 2 y 3 se exige el Libro de radiose\xF1ales actualizado."
    },
    {
      id: "RD339-A12-publicaciones-zona1",
      cita: "RD 339/2021, art. 12.2.d), tercer inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "publicaciones_nauticas",
        nombre: "Publicaciones n\xE1uticas",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Derrotero, Libro de faros y se\xF1ales de niebla y Anuario de Mareas",
          "Libro de radiose\xF1ales actualizado",
          "Manual para uso de los servicios m\xF3vil mar\xEDtimo y m\xF3vil mar\xEDtimo por sat\xE9lite",
          "Nomencl\xE1tor de estaciones costeras y de servicios especiales (Lista IV)",
          "C\xF3digo Internacional de Se\xF1ales, actualizado"
        ]
      },
      grupo: "publicaciones_nauticas",
      precedencia: 20,
      explicacion: "En zona 1 se exigen adem\xE1s el Manual para uso de los servicios m\xF3vil mar\xEDtimo y m\xF3vil mar\xEDtimo por sat\xE9lite, el Nomencl\xE1tor de las estaciones costeras y de las estaciones que efect\xFAan servicios especiales (Lista IV) y el C\xF3digo Internacional de Se\xF1ales, actualizados."
    },
    {
      id: "RD339-A12-nota-espacio-gobierno-publicaciones",
      cita: "RD 339/2021, art. 12.1, nota (*) de la tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 5,
          max: 7
        },
        categoriaDiseno: [
          "A",
          "B"
        ],
        espacioHabitableGobierno: true
      },
      entonces: {
        equipo: "publicaciones_nauticas",
        nombre: "Publicaciones n\xE1uticas",
        cantidad: 1,
        unidad: "juego",
        requisitos: [
          "Exigible aun navegando solo en zonas 5, 6 o 7 (nota de la tabla)"
        ]
      },
      grupo: "publicaciones_nauticas",
      precedencia: 30,
      explicacion: "Las embarcaciones con espacio habitable cerrado de gobierno y categor\xEDa de dise\xF1o A o B deber\xE1n disponer de publicaciones n\xE1uticas incluso navegando exclusivamente en zonas 5, 6 o 7."
    },
    {
      id: "RD339-A12-prismaticos",
      cita: "RD 339/2021, art. 12.1, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 4
        }
      },
      entonces: {
        equipo: "prismaticos",
        nombre: "Prism\xE1ticos",
        cantidad: 1
      },
      grupo: "prismaticos",
      precedencia: 0,
      explicacion: "Las embarcaciones que naveguen en zonas 1 a 4 deber\xE1n llevar prism\xE1ticos."
    },
    {
      id: "RD339-A12-nota-espacio-gobierno-prismaticos",
      cita: "RD 339/2021, art. 12.1, nota (*) de la tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 5,
          max: 7
        },
        categoriaDiseno: [
          "A",
          "B"
        ],
        espacioHabitableGobierno: true
      },
      entonces: {
        equipo: "prismaticos",
        nombre: "Prism\xE1ticos",
        cantidad: 1,
        requisitos: [
          "Exigible aun navegando solo en zonas 5, 6 o 7 (nota de la tabla)"
        ]
      },
      grupo: "prismaticos",
      precedencia: 30,
      explicacion: "Las embarcaciones con espacio habitable cerrado de gobierno y categor\xEDa de dise\xF1o A o B deber\xE1n disponer de prism\xE1ticos incluso navegando exclusivamente en zonas 5, 6 o 7."
    },
    {
      id: "RD339-A12-sextante",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.b)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "sextante",
        nombre: "Sextante",
        cantidad: 1,
        requisitos: [
          "Acompa\xF1ado de las tablas necesarias para la navegaci\xF3n astron\xF3mica"
        ]
      },
      explicacion: "Las embarcaciones que naveguen en zona 1 deber\xE1n llevar un sextante, acompa\xF1ado por las tablas necesarias para la navegaci\xF3n astron\xF3mica."
    },
    {
      id: "RD339-A12-cronometro",
      cita: "RD 339/2021, art. 12.1, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "cronometro",
        nombre: "Cron\xF3metro",
        cantidad: 1
      },
      explicacion: "Las embarcaciones que naveguen en zona 1 deber\xE1n llevar un cron\xF3metro."
    },
    {
      id: "RD339-A12-barometro",
      cita: "RD 339/2021, art. 12.1, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 2
        }
      },
      entonces: {
        equipo: "barometro",
        nombre: "Bar\xF3metro",
        cantidad: 1
      },
      explicacion: "Las embarcaciones que naveguen en zonas 1 o 2 deber\xE1n llevar un bar\xF3metro."
    },
    {
      id: "RD339-A12-diario",
      cita: "RD 339/2021, art. 12.1, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "diario_navegacion",
        nombre: "Diario de navegaci\xF3n",
        cantidad: 1
      },
      explicacion: "Las embarcaciones que naveguen en zona 1 deber\xE1n llevar diario de navegaci\xF3n."
    },
    {
      id: "RD339-A12-pabellon",
      cita: "RD 339/2021, art. 12.1, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "pabellon_nacional",
        nombre: "Pabell\xF3n nacional",
        cantidad: 1
      },
      explicacion: "Todas las embarcaciones de recreo deber\xE1n llevar el pabell\xF3n nacional, cualquiera que sea la zona de navegaci\xF3n."
    },
    {
      id: "RD339-A12-banderas",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.e)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 2
        }
      },
      entonces: {
        equipo: "juego_banderas",
        nombre: "Juego de banderas",
        cantidad: 1,
        requisitos: [
          "Como m\xEDnimo las banderas C y N del C\xF3digo Internacional de Se\xF1ales"
        ]
      },
      grupo: "juego_banderas",
      precedencia: 0,
      explicacion: "Las embarcaciones que naveguen en zonas 1 o 2 deber\xE1n llevar un juego de banderas, con al menos las banderas C y N del C\xF3digo Internacional de Se\xF1ales."
    },
    {
      id: "RD339-A12-banderas-zona1",
      cita: "RD 339/2021, art. 12.2.e), segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "juego_banderas",
        nombre: "Juego de banderas",
        cantidad: 1,
        requisitos: [
          "Como m\xEDnimo las banderas C y N del C\xF3digo Internacional de Se\xF1ales",
          "Dimensiones m\xEDnimas de 60 \xD7 50 cm (zona 1)"
        ]
      },
      grupo: "juego_banderas",
      precedencia: 10,
      explicacion: "Adem\xE1s, para zona 1, las dimensiones m\xEDnimas de las banderas ser\xE1n de 60 \xD7 50 cent\xEDmetros."
    },
    {
      id: "RD339-A12-linterna",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.f)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "linterna_estanca",
        nombre: "Linterna estanca",
        cantidad: 1,
        requisitos: [
          "Con un juego de bater\xEDas de respeto"
        ]
      },
      explicacion: "Todas las embarcaciones de recreo deber\xE1n llevar una linterna estanca con un juego de bater\xEDas de respeto, cualquiera que sea la zona de navegaci\xF3n. Esta linterna sirve para cumplir lo dispuesto en el art\xEDculo 10.3 si dispone de luz blanca."
    },
    {
      id: "RD339-A12-reflector-radar",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.g)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        materialCasco: [
          "madera",
          "materiales_compuestos",
          "neumatica",
          "otros"
        ]
      },
      entonces: {
        equipo: "reflector_radar",
        nombre: "Reflector de radar",
        cantidad: 1
      },
      explicacion: "El reflector de radar se colocar\xE1 en embarcaciones de recreo de casco no met\xE1lico, cualquiera que sea la zona de navegaci\xF3n."
    },
    {
      id: "RD339-A12-tabla-salvamento",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.h)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        equiposRadioelectricos: true
      },
      entonces: {
        equipo: "tabla_senales_salvamento",
        nombre: "Tabla de se\xF1ales de salvamento",
        cantidad: 1,
        requisitos: [
          "Del C\xF3digo Internacional de Se\xF1ales"
        ]
      },
      explicacion: "La tabla de se\xF1ales de salvamento del C\xF3digo Internacional de Se\xF1ales se exige si se montan equipos radioel\xE9ctricos."
    },
    {
      id: "RD339-A12-tabla-banderas",
      cita: "RD 339/2021, art. 12.1, tabla, y 12.2.i)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        equiposRadioelectricos: true
      },
      entonces: {
        equipo: "tabla_banderas_senales",
        nombre: "Tabla de banderas de se\xF1ales",
        cantidad: 1,
        requisitos: [
          "Del C\xF3digo Internacional de Se\xF1ales"
        ]
      },
      explicacion: "La tabla de banderas de se\xF1ales del C\xF3digo Internacional de Se\xF1ales se exige si se montan equipos radioel\xE9ctricos."
    },
    {
      id: "RD339-A13-estachas",
      cita: "RD 339/2021, art. 13.1.b)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "estacha_amarre",
        nombre: "Estachas de amarre",
        cantidad: 2,
        requisitos: [
          "Longitud y resistencia adecuadas a la eslora de la embarcaci\xF3n"
        ]
      },
      explicacion: "Las embarcaciones de recreo deber\xE1n llevar un m\xEDnimo de dos estachas de amarre de longitud y resistencia adecuadas a la eslora de la embarcaci\xF3n."
    },
    {
      id: "RD339-A13-bichero",
      cita: "RD 339/2021, art. 13.1.c)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "bichero",
        nombre: "Bichero",
        cantidad: 1
      },
      explicacion: "Las embarcaciones de recreo deber\xE1n llevar un bichero."
    },
    {
      id: "RD339-A13-gobierno-emergencia",
      cita: "RD 339/2021, art. 13.1.a)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        propulsion: "vela"
      },
      entonces: {
        equipo: "gobierno_emergencia",
        nombre: "Medios de emergencia para el gobierno",
        cantidad: 1
      },
      explicacion: "Se exigen medios de emergencia para el gobierno en embarcaciones de vela o de un solo motor si el gobierno es a distancia, excepto si el motor es fueraborda o de transmisi\xF3n en z.",
      advertencia: "El supuesto \xABde un solo motor si el gobierno es a distancia\xBB no se puede evaluar todav\xEDa: el modelo no recoge el n\xFAmero de motores ni si el gobierno es a distancia. Por ahora la regla solo cubre las embarcaciones de vela."
    },
    {
      id: "RD339-A13-inflador-neumatica",
      cita: "RD 339/2021, art. 13.1.d)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        materialCasco: "neumatica"
      },
      entonces: {
        equipo: "inflador_reparacion",
        nombre: "Inflador y juego de reparaci\xF3n de pinchazos",
        cantidad: 1
      },
      explicacion: "En las embarcaciones neum\xE1ticas r\xEDgidas y semirr\xEDgidas se exige un inflador y un juego de reparaci\xF3n de pinchazos."
    },
    {
      id: "RD339-A13-botiquin-zonas1234",
      cita: "RD 339/2021, art. 13.2.b) y c)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 4
        }
      },
      entonces: {
        equipo: "botiquin",
        nombre: "Botiqu\xEDn",
        familia: "otro",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Contenido id\xE9ntico al tipo \xABBalsas de Salvamento\xBB del anexo II del RD 258/1999",
          "Acompa\xF1ado de la Gu\xEDa sanitaria a bordo"
        ]
      },
      explicacion: "Las embarcaciones de recreo sin tripulaci\xF3n profesional que naveguen en zonas 1, 2, 3 o 4 deber\xE1n contar con un botiqu\xEDn cuyo contenido en medicamentos y material m\xE9dico sea id\xE9ntico al tipo Balsas de Salvamento del anexo II del RD 258/1999. Las embarcaciones que cuenten con botiqu\xEDn deber\xE1n llevar la Gu\xEDa sanitaria a bordo."
    },
    {
      id: "RD339-A15-extintores-manual-fabricante",
      cita: "RD 339/2021, art. 15.1",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: true,
        finesComerciales: false
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        familia: "contraincendios",
        controlCaducidad: true,
        remitidoA: "manual_del_fabricante",
        requisitos: [
          "Los definidos por el fabricante en el manual de instrucciones de la embarcaci\xF3n",
          "En defecto de manual, los prescritos en los apartados 3 y 4 del art. 15",
          "Al menos 2 kg de agente extintor, de f\xE1cil acceso, uno alcanzable desde el puesto de gobierno"
        ]
      },
      grupo: "extintor_portatil",
      precedencia: 100,
      explicacion: "Las embarcaciones de recreo con marcado CE deber\xE1n llevar los extintores port\xE1tiles definidos por el fabricante en el manual de instrucciones de la embarcaci\xF3n. En su defecto, llevar\xE1n los extintores prescritos en los apartados 3 y 4. El manual puede ser requerido por las autoridades competentes.",
      advertencia: "El sistema no puede calcular la cantidad exigible: hay que comprobarla contra el manual de instrucciones de la embarcaci\xF3n. Si no hay manual a bordo, se aplican las tablas del art. 15.3 y 15.4, que el sistema s\xED calcula."
    },
    {
      id: "RD339-A15-extintores-eslora-menor10",
      cita: "RD 339/2021, art. 15.3, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          max: 10,
          maxExcluido: true
        },
        espacioHabitableCerrado: true
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Tipo 34 B, con al menos 2 kg de agente extintor"
        ]
      },
      grupo: "extintor_portatil",
      precedencia: 0,
      explicacion: "Las embarcaciones de eslora menor de 10 metros con espacio habitable cerrado deber\xE1n llevar un extintor port\xE1til de eficacia m\xEDnima tipo 34 B."
    },
    {
      id: "RD339-A15-extintores-eslora-10-15",
      cita: "RD 339/2021, art. 15.3, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          min: 10,
          max: 15,
          maxExcluido: true
        }
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Tipo 34 B, con al menos 2 kg de agente extintor"
        ]
      },
      grupo: "extintor_portatil",
      precedencia: 0,
      explicacion: "Las embarcaciones de eslora igual o mayor de 10 metros y menor de 15 deber\xE1n llevar un extintor port\xE1til de eficacia m\xEDnima tipo 34 B."
    },
    {
      id: "RD339-A15-extintores-eslora-15-20",
      cita: "RD 339/2021, art. 15.3, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          min: 15,
          max: 20,
          maxExcluido: true
        }
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 2,
        requisitos: [
          "Tipo 34 B, con al menos 2 kg de agente extintor"
        ]
      },
      grupo: "extintor_portatil",
      precedencia: 0,
      explicacion: "Las embarcaciones de eslora igual o mayor de 15 metros y menor de 20 deber\xE1n llevar dos extintores port\xE1tiles de eficacia m\xEDnima tipo 34 B."
    },
    {
      id: "RD339-A15-extintores-eslora-20-24",
      cita: "RD 339/2021, art. 15.3, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          min: 20,
          max: 24
        }
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 3,
        requisitos: [
          "Tipo 34 B, con al menos 2 kg de agente extintor"
        ]
      },
      grupo: "extintor_portatil",
      precedencia: 0,
      explicacion: "Las embarcaciones de eslora igual o mayor de 20 metros y hasta 24 deber\xE1n llevar tres extintores port\xE1tiles de eficacia m\xEDnima tipo 34 B."
    },
    {
      id: "RD339-A15-extintores-potencia-25-220",
      cita: "RD 339/2021, art. 15.4, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        potenciaKw: {
          min: 25,
          minExcluido: true,
          max: 220
        }
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Tipo 34 B, con al menos 2 kg de agente extintor"
        ]
      },
      grupo: "extintor_portatil",
      precedencia: 10,
      explicacion: "Con potencia instalada mayor de 25 kW y hasta 220 kW se deber\xE1 llevar un extintor port\xE1til de eficacia m\xEDnima tipo 34 B."
    },
    {
      id: "RD339-A15-extintores-potencia-mayor-220",
      cita: "RD 339/2021, art. 15.4, tabla",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        potenciaKw: {
          min: 220,
          minExcluido: true
        }
      },
      entonces: {
        equipo: "extintor_capacidad",
        nombre: "Capacidad extintora total",
        cantidad: {
          expresion: "potenciaKw * 0.3"
        },
        unidad: "B",
        redondear: false,
        requisitos: [
          "Repartida en extintores port\xE1tiles (p. ej. 75 B = 3 extintores de tipo 34 B)"
        ]
      },
      explicacion: "Con potencia instalada superior a 220 kW se deber\xE1n llevar extintores port\xE1tiles con una capacidad total B igual a la potencia multiplicada por 0,3. Ejemplo del propio art\xEDculo: para un motor de 250 kW la capacidad requerida es de 75 B, lo que corresponde a tres extintores de tipo 34 B.",
      advertencia: "En motores interiores el art\xEDculo precisa que el c\xE1lculo se hace por cada compartimento de motores. El sistema usa la potencia total instalada: en embarcaciones con motores en compartimentos separados hay que comprobarlo a mano."
    },
    {
      id: "RD339-A15-extintores-potencia-fueraborda-menor25",
      cita: "RD 339/2021, art. 15.4, tabla, primera fila",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        potenciaKw: {
          max: 25
        },
        disposicionMotor: "fueraborda"
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        exento: true
      },
      grupo: "extintor_portatil",
      precedencia: -1,
      explicacion: "Con potencia instalada igual o inferior a 25 kW no se requiere extintor port\xE1til en motorizaci\xF3n fueraborda por raz\xF3n de la potencia. Si la eslora exige extintor, se lleva el de la eslora."
    },
    {
      id: "RD339-A15-extintores-potencia-menor25-no-fueraborda",
      cita: "RD 339/2021, art. 15.4, tabla, primera fila",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        potenciaKw: {
          max: 25
        },
        disposicionMotor: [
          "intraborda",
          "intra_fueraborda",
          "jet"
        ]
      },
      entonces: {
        equipo: "extintor_portatil",
        nombre: "Extintores port\xE1tiles",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Tipo 34 B, con al menos 2 kg de agente extintor"
        ]
      },
      grupo: "extintor_portatil",
      precedencia: 10,
      explicacion: "Con potencia instalada igual o inferior a 25 kW se deber\xE1 llevar un extintor port\xE1til de eficacia m\xEDnima tipo 34 B, salvo en motorizaci\xF3n fueraborda."
    },
    {
      id: "RD339-A15-extintores-comercial-adicional",
      cita: "RD 339/2021, art. 15.3, inciso final",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        finesComerciales: true,
        esloraCascoM: {
          min: 10
        }
      },
      entonces: {
        equipo: "extintor_portatil_adicional",
        nombre: "Extintor port\xE1til adicional (actividad comercial)",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Tipo 34 B, adicional a los exigidos por eslora y potencia"
        ]
      },
      explicacion: "En las embarcaciones de recreo con fines comerciales o lucrativos y eslora igual o mayor de 10 metros se llevar\xE1 un extintor m\xE1s de los indicados en la tabla."
    },
    {
      id: "RD339-A15-extintor-electrico",
      cita: "RD 339/2021, art. 15.6",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        combustible: "electrica"
      },
      entonces: {
        equipo: "extintor_apto_electricidad",
        nombre: "Extintor apto para fuegos con presencia de electricidad",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Puede ser uno de los ya exigidos por los apartados 3 y 4"
        ]
      },
      explicacion: "Cuando la embarcaci\xF3n disponga de una instalaci\xF3n el\xE9ctrica de m\xE1s de 50 voltios o sea de propulsi\xF3n el\xE9ctrica, al menos uno de los extintores port\xE1tiles prescritos ser\xE1 adecuado para fuegos con presencia de electricidad.",
      advertencia: "La regla solo cubre el supuesto de propulsi\xF3n el\xE9ctrica. El otro supuesto del art\xEDculo \u2014instalaci\xF3n el\xE9ctrica de m\xE1s de 50 V\u2014 no se puede evaluar: el modelo no recoge la tensi\xF3n de la instalaci\xF3n."
    },
    {
      id: "RD339-A15-extintor-glp",
      cita: "RD 339/2021, art. 15.7",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        combustible: "glp"
      },
      entonces: {
        equipo: "extintor_apto_gases",
        nombre: "Extintor apto para fuegos de gases",
        familia: "contraincendios",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "Seg\xFAn la clasificaci\xF3n del anexo I, secci\xF3n 1.\xAA, apartado 4.5, del RD 513/2017",
          "Puede ser uno de los ya exigidos por los apartados 3 y 4"
        ]
      },
      explicacion: "Cuando la embarcaci\xF3n disponga de motores que utilicen GLP como combustible, al menos uno de los extintores port\xE1tiles prescritos ser\xE1 adecuado para los fuegos de gases."
    },
    {
      id: "RD339-A20-achique-zonas123",
      cita: "RD 339/2021, art. 20.1.a)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 3
        }
      },
      entonces: {
        equipo: "bomba_achique",
        nombre: "Medios de achique",
        cantidad: 2,
        requisitos: [
          "Una bomba accionada por el motor principal u otra fuente de energ\xEDa",
          "Una bomba de accionamiento manual",
          "Dos baldes con capacidad m\xEDnima de 5 litros"
        ]
      },
      grupo: "bomba_achique",
      precedencia: 0,
      explicacion: "En zonas 1, 2 o 3: una bomba accionada por el motor principal u otra fuente de energ\xEDa, una bomba de accionamiento manual y dos baldes con capacidad m\xEDnima de 5 litros."
    },
    {
      id: "RD339-A20-achique-zonas456",
      cita: "RD 339/2021, art. 20.1.b)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 4,
          max: 6
        }
      },
      entonces: {
        equipo: "bomba_achique",
        nombre: "Medios de achique",
        cantidad: 1,
        requisitos: [
          "Una bomba manual o el\xE9ctrica",
          "Un balde con capacidad m\xEDnima de 5 litros"
        ]
      },
      grupo: "bomba_achique",
      precedencia: 0,
      explicacion: "En zonas 4, 5 o 6: una bomba manual o el\xE9ctrica y un balde con capacidad m\xEDnima de 5 litros."
    },
    {
      id: "RD339-A20-achique-zona7",
      cita: "RD 339/2021, art. 20.1.c)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 7
      },
      entonces: {
        equipo: "bomba_achique",
        nombre: "Medios de achique",
        cantidad: 1,
        requisitos: [
          "Una bomba manual o el\xE9ctrica"
        ]
      },
      grupo: "bomba_achique",
      precedencia: 0,
      explicacion: "En zona 7, aguas costeras protegidas, basta con una bomba de achique manual o el\xE9ctrica."
    },
    {
      id: "RD339-A20-achique-zona7-menor6m-flotabilidad",
      cita: "RD 339/2021, art. 20.1.c), segundo inciso",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: 7,
        esloraCascoM: {
          max: 6
        },
        camarasFlotabilidad: true
      },
      entonces: {
        equipo: "bomba_achique",
        nombre: "Medios de achique",
        cantidad: 1,
        unidad: "achicador",
        requisitos: [
          "Un achicador con capacidad m\xEDnima de 2 litros"
        ]
      },
      grupo: "bomba_achique",
      precedencia: 10,
      explicacion: "Si la embarcaci\xF3n tiene eslora igual o menor de 6 metros con c\xE1maras de flotabilidad y navega en zona 7, basta un achicador con capacidad m\xEDnima de 2 litros."
    },
    {
      id: "RD339-A20-achique-velero-bomba-fija",
      cita: "RD 339/2021, art. 20.1.d)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        zona: {
          min: 1,
          max: 6
        },
        propulsion: "vela"
      },
      entonces: {
        equipo: "bomba_achique_fija_velero",
        nombre: "Bomba de achique manual y fija (veleros)",
        requisitos: [
          "Al menos una de las bombas exigidas ser\xE1 manual y fija",
          "Operable desde la ba\xF1era con todas las escotillas y accesos al interior cerrados"
        ]
      },
      explicacion: "Los veleros que se encuentren navegando en zonas 1, 2, 3, 4, 5 o 6 deber\xE1n tener al menos una bomba manual y fija, operable desde la ba\xF1era con todas las escotillas y accesos al interior cerrados.",
      advertencia: "No es una bomba adicional: cualifica una de las ya exigidas por los apartados a) a c). Se presenta como requisito y no como unidad para no contarla dos veces."
    },
    {
      id: "RD339-A20-capacidad-bomba-menor6",
      cita: "RD 339/2021, art. 20.2.a)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          max: 6
        }
      },
      entonces: {
        equipo: "capacidad_bomba",
        nombre: "Capacidad m\xEDnima de las bombas",
        cantidad: 10,
        unidad: "L/min",
        redondear: false,
        minimoPorUnidad: true,
        requisitos: [
          "A una presi\xF3n de 10 kPa; en bombas manuales, con 45 emboladas por minuto"
        ]
      },
      explicacion: "La capacidad de las bombas no debe ser menor de 10 litros por minuto para esloras iguales o menores de 6 metros, a una presi\xF3n de 10 kPa."
    },
    {
      id: "RD339-A20-capacidad-bomba-6-12",
      cita: "RD 339/2021, art. 20.2.b)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          min: 6,
          minExcluido: true,
          max: 12,
          maxExcluido: true
        }
      },
      entonces: {
        equipo: "capacidad_bomba",
        nombre: "Capacidad m\xEDnima de las bombas",
        cantidad: 15,
        unidad: "L/min",
        redondear: false,
        minimoPorUnidad: true,
        requisitos: [
          "A una presi\xF3n de 10 kPa; en bombas manuales, con 45 emboladas por minuto"
        ]
      },
      explicacion: "La capacidad de las bombas no debe ser menor de 15 litros por minuto para esloras mayores de 6 y menores de 12 metros, a una presi\xF3n de 10 kPa."
    },
    {
      id: "RD339-A20-capacidad-bomba-mayor12",
      cita: "RD 339/2021, art. 20.2.c)",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          min: 12
        }
      },
      entonces: {
        equipo: "capacidad_bomba",
        nombre: "Capacidad m\xEDnima de las bombas",
        cantidad: 30,
        unidad: "L/min",
        redondear: false,
        minimoPorUnidad: true,
        requisitos: [
          "A una presi\xF3n de 10 kPa; en bombas manuales, con 45 emboladas por minuto"
        ]
      },
      explicacion: "La capacidad de las bombas no debe ser menor de 30 litros por minuto para esloras iguales o mayores de 12 metros, a una presi\xF3n de 10 kPa."
    },
    {
      id: "RD339-A16-sistema-fijo-manual-fabricante",
      cita: "RD 339/2021, art. 16.1",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: true,
        finesComerciales: false
      },
      entonces: {
        equipo: "sistema_fijo_extincion",
        nombre: "Sistema fijo de extinci\xF3n de incendios",
        familia: "contraincendios",
        controlCaducidad: true,
        remitidoA: "Manual de instrucciones de la embarcaci\xF3n",
        requisitos: [
          "El que defina el fabricante en el manual de instrucciones",
          "Sometido a las revisiones del art. 21 del Reglamento de instalaciones de protecci\xF3n contra incendios"
        ]
      },
      grupo: "sistema_fijo_extincion",
      precedencia: 20,
      explicacion: "Las embarcaciones de recreo con marcado CE deber\xE1n llevar el sistema fijo de extinci\xF3n de incendios definido por el fabricante en el manual de instrucciones de la embarcaci\xF3n. En su defecto, cumplir\xE1n con lo dispuesto en los apartados 2 y 3.",
      advertencia: "La norma dice \xABen su defecto\xBB, es decir: si el manual no lo define, se aplican los apartados 2 y 3. El sistema no puede saber si el manual lo define o no, as\xED que remite al manual y deja la comprobaci\xF3n al inspector. Es el mismo tratamiento que recibe el art. 15.1 (caso dif\xEDcil n\xBA 5)."
    },
    {
      id: "RD339-A16-sistema-fijo-sin-ce",
      cita: "RD 339/2021, art. 16.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: [
          "grupo_1",
          "glp"
        ],
        compartimentoInteriorConMotorODeposito: true
      },
      entonces: {
        equipo: "sistema_fijo_extincion",
        nombre: "Sistema fijo de extinci\xF3n en el compartimento del motor",
        familia: "contraincendios",
        controlCaducidad: true,
        requisitos: [
          "Evita la necesidad de abrir el compartimento en caso de incendio",
          "Conforme a la norma UNE-EN ISO 9094:2017 o la armonizada que la sustituya (art. 16.3)",
          "Sometido a las revisiones del art. 21 del Reglamento de instalaciones de protecci\xF3n contra incendios (art. 16.4)"
        ]
      },
      grupo: "sistema_fijo_extincion",
      precedencia: 30,
      explicacion: "Las embarcaciones de recreo sin marcado CE que lleven motores que utilicen combustible clasificado del grupo 1.\xBA o GLP deber\xE1n estar provistas de un sistema fijo de extinci\xF3n de incendios en el compartimento del motor, que evite la necesidad de abrir el compartimento en caso de incendio."
    },
    {
      id: "RD339-A16-sistema-fijo-comercial",
      cita: "RD 339/2021, art. 16.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        finesComerciales: true,
        combustible: [
          "grupo_1",
          "glp"
        ],
        compartimentoInteriorConMotorODeposito: true
      },
      entonces: {
        equipo: "sistema_fijo_extincion",
        nombre: "Sistema fijo de extinci\xF3n en el compartimento del motor",
        familia: "contraincendios",
        controlCaducidad: true,
        requisitos: [
          "Evita la necesidad de abrir el compartimento en caso de incendio",
          "Conforme a la norma UNE-EN ISO 9094:2017 o la armonizada que la sustituya (art. 16.3)",
          "Sometido a las revisiones del art. 21 del Reglamento de instalaciones de protecci\xF3n contra incendios (art. 16.4)"
        ]
      },
      grupo: "sistema_fijo_extincion",
      precedencia: 40,
      explicacion: "Todas las embarcaciones que desarrollen una actividad con fines comerciales o lucrativos y lleven motores que utilicen combustible del grupo 1.\xBA o GLP deber\xE1n estar provistas de un sistema fijo de extinci\xF3n de incendios en el compartimento del motor.",
      advertencia: "Es regla aparte de la anterior, y no una condici\xF3n \xABsin CE **o** comercial\xBB, porque el lenguaje no tiene disyunci\xF3n a prop\xF3sito (ADR-005): as\xED cada supuesto legal conserva su cita exacta. Adem\xE1s prevalece sobre el art. 16.1: una embarcaci\xF3n con marcado CE dedicada al ch\xE1rter no puede resolverlo remiti\xE9ndose al manual, porque el propio art. 16.1 empieza \xABsin perjuicio de lo dispuesto para embarcaciones que desarrollen una actividad con fines comerciales y lucrativos\xBB."
    },
    {
      id: "RD339-A16-alternativa-encajonamiento",
      cita: "RD 339/2021, art. 16.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: [
          "grupo_1",
          "glp"
        ],
        motorEnEncajonamientoSobreCubierta: true
      },
      entonces: {
        equipo: "sistema_fijo_extincion",
        nombre: "Extintores port\xE1tiles para aberturas de incendios (alternativa)",
        familia: "contraincendios",
        controlCaducidad: true,
        requisitos: [
          "De un tipo y tama\xF1o adecuados al volumen del encajonamiento o del espacio de m\xE1quinas"
        ]
      },
      grupo: "sistema_fijo_extincion",
      precedencia: 35,
      explicacion: "Cuando los motores est\xE9n situados en un encajonamiento por encima de la cubierta de la embarcaci\xF3n, se podr\xE1 disponer, como alternativa al sistema fijo, de extintores port\xE1tiles para aberturas de incendios, de un tipo y tama\xF1o adecuados para el volumen del encajonamiento o del espacio de m\xE1quinas.",
      advertencia: "Estos extintores son **alternativa** al sistema fijo, no equipo adicional: por eso comparten grupo con \xE9l. No deben sumarse a los extintores port\xE1tiles del art. 15, que responden a otra exigencia. A confirmar con el director."
    },
    {
      id: "RD339-A17-deteccion-gas-instalacion",
      cita: "RD 339/2021, art. 17.1",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        instalacionGasCombustible: true
      },
      entonces: {
        equipo: "detector_gases",
        nombre: "Sistema de detecci\xF3n de gases",
        familia: "contraincendios",
        requisitos: [
          "Acciona autom\xE1ticamente una alarma con se\xF1al luminosa y sonora"
        ]
      },
      explicacion: "Las embarcaciones de recreo que tengan instalaciones de gas combustible, total o parcialmente en el interior del casco, deber\xE1n llevar sistemas de detecci\xF3n de gases que accionar\xE1n autom\xE1ticamente una alarma con se\xF1al luminosa y sonora.",
      advertencia: "Este art\xEDculo **no except\xFAa a las embarcaciones con marcado CE**, a diferencia de los arts. 18 y 19. Se ha respetado esa diferencia en vez de uniformarla, porque la norma la establece expresamente art\xEDculo por art\xEDculo."
    },
    {
      id: "RD339-A17-deteccion-gas-glp",
      cita: "RD 339/2021, art. 17.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        combustible: "glp"
      },
      entonces: {
        equipo: "detector_gases_glp",
        nombre: "Detecci\xF3n de gas en compartimentos de motor y de combustible (GLP)",
        familia: "contraincendios",
        requisitos: [
          "En el compartimento interior de cada motor y de cada espacio de almacenamiento de combustible",
          "Conforme a la norma UNE-EN 15609:2012 o la armonizada que la sustituya"
        ]
      },
      explicacion: "Para embarcaciones de recreo con motores que utilicen combustible GLP, el sistema de detecci\xF3n de gas a instalar en el compartimento interior de cada motor y de cada espacio de almacenamiento de combustible cumplir\xE1 con los requisitos recogidos en la norma t\xE9cnica UNE-EN 15609:2012."
    },
    {
      id: "RD339-A18-ventilacion-grupo1",
      cita: "RD 339/2021, art. 18.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: "grupo_1",
        compartimentoInteriorConMotorODeposito: true
      },
      entonces: {
        equipo: "ventilacion_compartimento",
        nombre: "Sistema de ventilaci\xF3n del compartimento",
        requisitos: [
          "Conforme a la norma UNE-EN ISO 11105:2020 o la armonizada que la sustituya"
        ]
      },
      grupo: "ventilacion_compartimento",
      precedencia: 10,
      explicacion: "Los compartimentos interiores de las embarcaciones de recreo sin marcado CE que dispongan de motores o dep\xF3sitos de almacenamiento en que se utilicen combustibles del grupo 1.\xBA deber\xE1n disponer de un sistema de ventilaci\xF3n conforme con la norma t\xE9cnica UNE-EN ISO 11105:2020."
    },
    {
      id: "RD339-A18-ventilacion-grupo1-forzada",
      cita: "RD 339/2021, art. 18.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: "grupo_1",
        compartimentoInteriorConMotorODeposito: true,
        arranqueElectricoMotor: true
      },
      entonces: {
        equipo: "ventilacion_compartimento",
        nombre: "Sistema de ventilaci\xF3n forzada del compartimento",
        requisitos: [
          "Conforme a la norma UNE-EN ISO 11105:2020 o la armonizada que la sustituya",
          "La ventilaci\xF3n ser\xE1 forzada, por tratarse de motores con arranque el\xE9ctrico"
        ]
      },
      grupo: "ventilacion_compartimento",
      precedencia: 20,
      explicacion: "En los compartimentos de motores con arranque el\xE9ctrico, la ventilaci\xF3n ser\xE1 forzada.",
      advertencia: "Desplaza a la regla anterior en vez de sumarse a ella: es la misma obligaci\xF3n cualificada, no una ventilaci\xF3n de m\xE1s. La desplazada se informa en el resultado."
    },
    {
      id: "RD339-A18-ventilacion-glp",
      cita: "RD 339/2021, art. 18.3",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: "glp",
        compartimentoInteriorConMotorODeposito: true
      },
      entonces: {
        equipo: "ventilacion_compartimento",
        nombre: "Sistema de ventilaci\xF3n forzada del compartimento (GLP)",
        requisitos: [
          "Ventilaci\xF3n forzada conforme a la norma UNE-EN 15609:2012 o la armonizada que la sustituya"
        ]
      },
      grupo: "ventilacion_compartimento",
      precedencia: 30,
      explicacion: "Los compartimentos interiores de las embarcaciones de recreo sin marcado CE que dispongan de motores o dep\xF3sitos de almacenamiento en que se utilice combustible GLP deber\xE1n disponer de un sistema de ventilaci\xF3n forzada conforme a la norma t\xE9cnica UNE-EN 15609:2012."
    },
    {
      id: "RD339-A18-placa-ventilar",
      cita: "RD 339/2021, art. 18.4",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: [
          "grupo_1",
          "glp"
        ],
        compartimentoInteriorConMotorODeposito: true
      },
      entonces: {
        equipo: "placa_ventilar",
        nombre: "Placa de aviso \xABventilar 4 minutos\xBB",
        requisitos: [
          "Junto al dispositivo de arranque de los motores",
          "Visible y en un idioma inteligible",
          "Recuerda la necesidad de ventilar durante 4 minutos antes de arrancar"
        ]
      },
      explicacion: "En los casos descritos en los apartados anteriores, junto al dispositivo de arranque de los motores habr\xE1 una placa o etiqueta visible en un idioma inteligible que recuerde la necesidad de ventilar durante 4 minutos el compartimento interior antes de arrancar los motores.",
      advertencia: 'Es la casilla que la hoja de campos de la empresa pregunta en su punto 02.03, literalmente: \xAB\xBFExiste etiqueta o placa "ventilar durante 4 minutos"?\xBB. Sirve de comprobaci\xF3n de que la regla est\xE1 bien acotada.'
    },
    {
      id: "RD339-A18-ventilacion-baterias",
      cita: "RD 339/2021, art. 18.5",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: "electrica"
      },
      entonces: {
        equipo: "ventilacion_baterias",
        nombre: "Ventilaci\xF3n del compartimento de bater\xEDas",
        requisitos: [
          "Conforme a la norma UNE-EN ISO 16315:2016 o la armonizada que la sustituya"
        ]
      },
      explicacion: "Los compartimentos de las bater\xEDas de acumuladores de las embarcaciones de recreo que dispongan de un sistema de propulsi\xF3n el\xE9ctrica deber\xE1n estar ventilados conforme a la norma t\xE9cnica UNE-EN ISO 16315:2016."
    },
    {
      id: "RD339-A19-depositos-grupo1",
      cita: "RD 339/2021, art. 19.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        combustible: "grupo_1"
      },
      entonces: {
        equipo: "deposito_combustible",
        nombre: "Dep\xF3sitos de almacenamiento de combustible",
        requisitos: [
          "No forman parte del casco de la embarcaci\xF3n",
          "Protegidos contra el riesgo de incendio de cualquier motor o fuente de inflamaci\xF3n"
        ]
      },
      explicacion: "Los dep\xF3sitos de almacenamiento de combustibles del grupo 1.\xBA no formar\xE1n parte del casco de la embarcaci\xF3n de recreo y deber\xE1n estar protegidos contra el riesgo de incendio de cualquier motor o de cualquier otra fuente de inflamaci\xF3n."
    },
    {
      id: "RD339-A21-marpol",
      cita: "RD 339/2021, art. 21",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "cumplimiento_marpol",
        nombre: "Prevenci\xF3n de la contaminaci\xF3n (MARPOL)",
        remitidoA: "Anexos I, V y VI del Convenio MARPOL 73/78 y normativa europea y nacional concordante",
        requisitos: [
          "Anexo I \u2014 hidrocarburos",
          "Anexo V \u2014 basuras",
          "Anexo VI \u2014 contaminaci\xF3n atmosf\xE9rica"
        ]
      },
      explicacion: "Las embarcaciones de recreo cumplir\xE1n con las prescripciones de los anexos I, V y VI del Convenio MARPOL que les sean de aplicaci\xF3n, junto con las dem\xE1s normas europeas o nacionales que regulen las mismas materias.",
      advertencia: "Es una remisi\xF3n en bloque a otro convenio, no una exigencia concreta: el motor no puede derivar de ella qu\xE9 le falta al barco. Se incluye para que aparezca en el guion y el inspector la compruebe, no para calcular nada. Mismo tratamiento que el manual del fabricante del art. 15.1."
    },
    {
      id: "RD339-A22-descargas-accidentales",
      cita: "RD 339/2021, art. 22.2",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false
      },
      entonces: {
        equipo: "prevencion_aguas_sucias",
        nombre: "Prevenci\xF3n de descargas accidentales de aguas sucias",
        requisitos: [
          "Construida y dotada de modo que se eviten descargas accidentales de aguas sucias"
        ]
      },
      explicacion: "Las embarcaciones de recreo sin marcado CE estar\xE1n construidas y dotadas de modo que se eviten descargas accidentales de aguas sucias."
    },
    {
      id: "RD339-A22-instalacion-aguas-sucias",
      cita: "RD 339/2021, art. 22.3",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        inodoros: true
      },
      entonces: {
        equipo: "instalacion_aguas_sucias",
        nombre: "Instalaci\xF3n para las aguas sucias",
        requisitos: [
          "a) Sistema de retenci\xF3n con capacidad suficiente, conforme a la UNE-EN ISO 8099-1:2018",
          "b) Instalaci\xF3n de tratamiento certificada seg\xFAn el RD 701/2016, homologada por la Administraci\xF3n Mar\xEDtima espa\xF1ola o aceptada por esta",
          "c) Sistema para desmenuzar y desinfectar con almacenamiento temporal, aprobado u homologado por la Administraci\xF3n Mar\xEDtima espa\xF1ola"
        ]
      },
      explicacion: "Las embarcaciones de recreo sin marcado CE dotadas de inodoros deber\xE1n estar provistas de uno de los tres equipos que enumera el art. 22.3: sistema de retenci\xF3n, instalaci\xF3n de tratamiento o sistema de desmenuzado y desinfecci\xF3n.",
      advertencia: "Los tres van como requisitos de una sola regla, y no como tres reglas, porque son **alternativas de cumplimiento de una misma obligaci\xF3n** \u2014la norma dice \xABuno de los siguientes equipos\xBB\u2014 y no tres supuestos de hecho distintos. Escribirlas como tres reglas har\xEDa que el sistema exigiera las tres cosas a la vez."
    },
    {
      id: "RD339-A22-conexion-tierra",
      cita: "RD 339/2021, art. 22.4",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        marcadoCE: false,
        depositoRetencionFijo: true
      },
      entonces: {
        equipo: "conexion_universal_tierra",
        nombre: "Conexi\xF3n universal a tierra",
        cantidad: 1,
        requisitos: [
          "Permite acoplar el conducto de las instalaciones de recepci\xF3n con el de descarga de la embarcaci\xF3n",
          "Si hay conductos de descarga al mar que atraviesen el casco, dispondr\xE1n de v\xE1lvulas de cierre herm\xE9tico con precinto o dispositivo mec\xE1nico"
        ]
      },
      explicacion: "La embarcaci\xF3n que disponga de dep\xF3sitos de retenci\xF3n fijos estar\xE1 provista de una conexi\xF3n universal a tierra que permita acoplar el conducto de las instalaciones de recepci\xF3n con el conducto de descarga de la embarcaci\xF3n.",
      advertencia: "La segunda frase del art. 22.4 \u2014las v\xE1lvulas precintables de los pasacascos de descarga\u2014 va como requisito de esta misma regla y no como regla propia, porque el modelo no tiene todav\xEDa un campo que diga si el barco monta esos conductos. Anotado como carencia consciente, no como olvido."
    }
  ]
};

// src/datos/sucesos-rd1434.json
var sucesos_rd1434_default = {
  norma: "RD 1434/1999",
  identificadorBoe: "BOE-A-1999-18663",
  version: "2011-01-01",
  descripcion: "Supuestos en los que un suceso ocurrido a la embarcaci\xF3n obliga a un reconocimiento adicional o extraordinario.",
  reglas: [
    {
      id: "RD1434-A3D-a-reparacion",
      cita: "RD 1434/1999, art. 3.D).a)",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        tipoSuceso: [
          "reparacion",
          "modificacion"
        ]
      },
      entonces: {
        reconocimiento: "adicional",
        loRealiza: "entidad_colaboradora",
        informeACapitania: true
      },
      explicacion: "Ser\xE1 obligatoria la realizaci\xF3n de un reconocimiento adicional cuando una embarcaci\xF3n de recreo efect\xFAe reparaciones en su casco, maquinaria y equipo, o sufra modificaciones o alteraciones en los mismos."
    },
    {
      id: "RD1434-A3D-b-cambio-lista-7-a-6",
      cita: "RD 1434/1999, art. 3.D).b)",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        tipoSuceso: "cambio_lista",
        listaDestino: 6
      },
      entonces: {
        reconocimiento: "adicional",
        loRealiza: "entidad_colaboradora",
        informeACapitania: true
      },
      explicacion: "Ser\xE1 obligatoria la realizaci\xF3n de un reconocimiento adicional cuando una embarcaci\xF3n vaya a cambiar de la lista s\xE9ptima a la lista sexta.",
      advertencia: "La norma solo contempla el cambio de la lista 7.\xAA a la 6.\xAA, es decir, el paso a explotaci\xF3n comercial. El camino inverso no est\xE1 previsto y el sistema no lo supone."
    },
    {
      id: "RD1434-A3D-c-varada-abordaje",
      cita: "RD 1434/1999, art. 3.D).c)",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        tipoSuceso: [
          "varada",
          "abordaje",
          "averia_temporal"
        ]
      },
      entonces: {
        reconocimiento: "adicional",
        loRealiza: "entidad_colaboradora",
        informeACapitania: true
      },
      explicacion: "Ser\xE1 obligatoria la realizaci\xF3n de un reconocimiento adicional despu\xE9s de haber sufrido varada, abordaje o serias aver\xEDas por temporal u otro motivo.",
      advertencia: "El apartado c) termina con \xABque pueda afectar las condiciones de seguridad de navegaci\xF3n de la embarcaci\xF3n\xBB. No queda claro si esa condici\xF3n alcanza a toda la enumeraci\xF3n o solo a las aver\xEDas de maquinaria. El sistema adopta la lectura prudente: varada, abordaje y aver\xEDa por temporal obligan siempre, sin valoraci\xF3n previa. PENDIENTE DE CONFIRMAR CON EL DIRECTOR."
    },
    {
      id: "RD1434-A3D-c-averia-maquinaria",
      cita: "RD 1434/1999, art. 3.D).c), inciso final",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        tipoSuceso: "averia_maquinaria",
        afectaSeguridad: true
      },
      entonces: {
        reconocimiento: "adicional",
        loRealiza: "entidad_colaboradora",
        informeACapitania: true
      },
      explicacion: "Ser\xE1 obligatoria la realizaci\xF3n de un reconocimiento adicional tras aver\xEDas en su maquinaria y dem\xE1s elementos y componentes de la embarcaci\xF3n que puedan afectar a las condiciones de seguridad de navegaci\xF3n.",
      advertencia: "Que la aver\xEDa pueda afectar a la seguridad de la navegaci\xF3n es un juicio t\xE9cnico que corresponde a quien registra el suceso, no al sistema. Si no consta esa valoraci\xF3n, la regla no se aplica y se avisa."
    },
    {
      id: "RD1434-A3E-a-judicial",
      cita: "RD 1434/1999, art. 3.E).a)",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        tipoSuceso: "requerimiento_judicial"
      },
      entonces: {
        reconocimiento: "extraordinario",
        loRealiza: "entidad_colaboradora"
      },
      explicacion: "Los reconocimientos extraordinarios se realizar\xE1n a requerimiento de un \xF3rgano judicial."
    },
    {
      id: "RD1434-A3E-b-dgmm",
      cita: "RD 1434/1999, art. 3.E).b)",
      vigenciaDesde: "2000-03-11",
      vigenciaHasta: null,
      cuando: {
        tipoSuceso: "resolucion_dgmm"
      },
      entonces: {
        reconocimiento: "extraordinario",
        loRealiza: "entidad_colaboradora"
      },
      explicacion: "Los reconocimientos extraordinarios se realizar\xE1n por resoluci\xF3n motivada de la Direcci\xF3n General de la Marina Mercante, cuando se tenga conocimiento fundado de hechos que puedan poner en peligro la seguridad mar\xEDtima, as\xED como para prevenir la contaminaci\xF3n del medio ambiente mar\xEDtimo."
    }
  ]
};

// src/datos/anexo2-rd1434.json
var anexo2_rd1434_default = {
  norma: "RD 1434/1999",
  identificador_boe: "BOE-A-1999-18663",
  anexo: "II",
  titulo: "Ejecuci\xF3n de los reconocimientos",
  version_consultada: "consolidada, actualizaci\xF3n de 06/11/2010",
  fecha_extraccion: "2026-09-07",
  advertencia: "Los campos 'requiere_seco' y 'deficiencias_graves_aplicables' son interpretaci\xF3n del autor del TFG, no texto normativo.",
  bloques: [
    {
      codigo: "1",
      titulo: "Casco y equipo",
      requiere_seco: true,
      deficiencias_graves_aplicables: [
        "a",
        "b"
      ],
      puntos: [
        {
          codigo: "1.1",
          titulo: "Nombre y matr\xEDcula",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que las identificaciones y marcas en la embarcaci\xF3n coinciden con las reglamentarias."
            },
            {
              letra: "b",
              texto: "Comprobar que el equipo que figura en el Inventario de la embarcaci\xF3n se corresponde con el existente a bordo."
            }
          ],
          notas: [
            "El nombre y matr\xEDcula de la embarcaci\xF3n deber\xE1n corresponderse con los que consten en su documentaci\xF3n oficial."
          ]
        },
        {
          codigo: "1.2",
          titulo: "Manual del propietario",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia del manual del propietario conteniendo informaci\xF3n actualizada de los equipos instalados a bordo en aquellas embarcaciones que tengan la marca CE."
            }
          ],
          notas: []
        },
        {
          codigo: "1.3",
          titulo: "Candeleros y pasamanos",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar los anclajes en cubierta de los candeleros, verificando que sus tornillos o medios de sujeci\xF3n se encuentran convenientemente apretados y que no hay da\xF1os en cubierta en la zona de anclaje."
            },
            {
              letra: "b",
              texto: "Comprobar el estado y anclajes de los pasamanos y, si \xE9stos son de cable, el estado del mismo, as\xED como de sus terminales y bloqueos."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.4",
          titulo: "Pasacascos y pasamamparos",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no existe corrosi\xF3n local alrededor de pasacascos y pasamamparos."
            },
            {
              letra: "b",
              texto: "Comprobar que la estanqueidad de pasacascos y pasamamparos se halla intacta."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.5",
          titulo: "V\xE1lvulas de costado",
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar visualmente las tuber\xEDas de entrada/salida verificando su buen estado externo, y si fuera posible desempernado abrazaderas y comprobando el espesor de las tuber\xEDas en los alrededores de la v\xE1lvula y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "b",
              texto: "Comprobar el estado de los cables el\xE9ctricos que dan alimentaci\xF3n al motor de accionamiento de la v\xE1lvula si \xE9sta fuese telemandada."
            },
            {
              letra: "c",
              texto: "Comprobar el funcionamiento de la v\xE1lvula en sus dos modalidades: Manual y/o autom\xE1tica."
            },
            {
              letra: "d",
              texto: "Comprobar el buen asiento de la v\xE1lvula, verificando que no hay circulaci\xF3n de l\xEDquido bajo carga."
            },
            {
              letra: "e",
              texto: "comprobar la existencia de rejillas en aquellas v\xE1lvulas que as\xED lo requieran."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.6",
          titulo: "Estanqueidad en aberturas de cubierta",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto estado de conservaci\xF3n y fijaci\xF3n de las juntas de las aberturas y portillos practicables."
            },
            {
              letra: "b",
              texto: "Comprobar el estado de limpieza y correcto funcionamiento de los ra\xEDles con drenaje en accesos de tipo deslizante."
            },
            {
              letra: "c",
              texto: "Comprobar que el sellante empleado en el montaje de las aberturas o portillos fijos se halla intacto."
            },
            {
              letra: "d",
              texto: "Comprobar la estanqueidad de fogonaduras en el paso de palos a trav\xE9s de cubierta."
            },
            {
              letra: "e",
              texto: "Comprobar la integridad de la uni\xF3n de casco y cubierta, as\xED como ra\xEDles atornillados sobre la misma."
            },
            {
              letra: "f",
              texto: "Comprobar la estanqueidad en herrajes atornillados sobre cubierta."
            },
            {
              letra: "g",
              texto: "En caso de duda comprobar la estanqueidad mediante la aplicaci\xF3n de un chorro de agua con una manguera a presi\xF3n normal."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.7",
          titulo: "Uni\xF3n orza/casco",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto apriete de los pernos de la orza salvo en los casos en que exista un mecanismo de bloqueo verificable."
            },
            {
              letra: "b",
              texto: "Comprobar que no existen signos de corrosi\xF3n excesiva. En caso de existir elementos susceptibles de aumentar la corrosi\xF3n electrol\xEDtica de alguno de los pernos, \xE9se deber\xE1 ser el primero en inspeccionarse."
            },
            {
              letra: "c",
              texto: "Si las tuercas situadas en el interior del caso est\xE1n laminadas por encima descubrir, al menos, una de ellas para efectuar una comprobaci\xF3n suficiente."
            },
            {
              letra: "d",
              texto: "Comprobar la no-existencia de grietas exteriores m\xE1s all\xE1 de las razonables superficiales de pintura."
            },
            {
              letra: "e",
              texto: "Comprobar de forma especial posibles deformaciones o roturas debidas a varadas accidentales que se pueden mostrar en forma de grietas en varengas a proa o popa de la quilla y a separaci\xF3n (seg\xFAn el tipo de quilla y sujeci\xF3n) del extremo de proa de la quilla del casco."
            },
            {
              letra: "f",
              texto: "Comprobar la correcta fijaci\xF3n de lastre no integral."
            },
            {
              letra: "g",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.8",
          titulo: "Uni\xF3n arbotantes/casco",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la sujeci\xF3n de los arbotantes al casco verificando el estado del mismo en dicha zona."
            },
            {
              letra: "b",
              texto: "En cascos de materiales compuestos buscar signos de deslaminaci\xF3n local debida a fatiga provocada por las vibraciones a que se halla sometido, comprobando la estanqueidad del casco en dicha zona."
            },
            {
              letra: "c",
              texto: "Comprobar el apriete de los tornillos de fijaci\xF3n en el caso de arbotantes atornillados."
            },
            {
              letra: "d",
              texto: "Comprobar el estado de la zona del casco y/o refuerzos sobre los que se fijen los arbotantes."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.9",
          titulo: "Cadenotes",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no existen signos de desgaste excesivo por roce, deformaciones, desalineamiento o corrosi\xF3n excesiva."
            },
            {
              letra: "b",
              texto: "Comprobar la estanqueidad de la cubierta en el caso de cadenotes pasantes a trav\xE9s de la misma."
            },
            {
              letra: "c",
              texto: "Comprobar la integridad de la zona de casco o estructura donde \xE9stos se hallen fijados o de los que sean parte integral."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto apriete de los tornillos de fijaci\xF3n en el caso de cadenotes atornillados."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.10",
          titulo: "Ba\xF1eras autoachicables (desag\xFCes)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de los desag\xFCes especificados en el proyecto, verificando que se hallan libres de obst\xE1culos que impidan fluir el agua libremente."
            },
            {
              letra: "b",
              texto: "Comprobar que ning\xFAn desag\xFCe queda bloqueado por suelos desmontables existentes u otros elementos."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.11",
          titulo: "Sistema antideslizante de cubierta",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de un antideslizante eficaz de alg\xFAn tipo en las zonas de trabajo."
            },
            {
              letra: "b",
              texto: "Comprobar que no existe un grado de desgaste excesivo que le impida cumplir su cometido en condiciones normales."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.12",
          titulo: "Ventilaci\xF3n/extracci\xF3n de cocina",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de un sistema de ventilaci\xF3n en la cocina de acuerdo con lo especificado en el manual del propietario."
            },
            {
              letra: "b",
              texto: "Comprobar el correcto funcionamiento de cualquier dispositivo de extracci\xF3n existente, asegur\xE1ndose que funciona y que su capacidad no est\xE1 reducida por cualquier obstrucci\xF3n."
            },
            {
              letra: "c",
              texto: "Comprobar en el caso ventilaciones con mangerotes con cajas doradas que disponen de drenaje y que \xE9ste no est\xE1 obstruido y funciona de forma adecuada."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.13",
          titulo: "Circuitos de gas de cocina (tuber\xEDas y racores)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la correcta situaci\xF3n de la bombona de gas y existencia de las llaves de paso adecuadas."
            },
            {
              letra: "b",
              texto: "Comprobar que no existen p\xE9rdidas bajo presi\xF3n en todo el circuito."
            },
            {
              letra: "c",
              texto: "Comprobar el estado de conservaci\xF3n adecuado de las conducciones, en especial en los extremos."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto montaje y apriete de las abrazaderas de acoplamiento de los conductores."
            },
            {
              letra: "e",
              texto: "Comprobar el correcto funcionamiento de las v\xE1lvulas en los aparatos consumidores de gas de la cocina."
            },
            {
              letra: "f",
              texto: "Comprobar la correcta instalaci\xF3n y funcionamiento del detector de gases."
            },
            {
              letra: "g",
              texto: "Comprobar que las embarcaciones con marcado disponen de detector de apagado de llama en los quemadores de cocina."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.14",
          titulo: "Gobierno, tim\xF3n y mecha",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no existen desgastes en la mecha debidos a roces con los cojinetes, en especial en la parte inferior de la limera."
            },
            {
              letra: "b",
              texto: "Comprobar el correcto estado y tensi\xF3n de los guardines o ausencia de holguras de importancia en los sistemas mec\xE1nicos."
            },
            {
              letra: "c",
              texto: "Comprobar el correcto estado del sector, sujeci\xF3n del mismo a la mecha y anclajes de los guardines."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto estado de poleas de timoner\xEDa y anclaje de las mismas."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.15",
          titulo: "Protecci\xF3n cat\xF3dica",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de los elementos de protecci\xF3n cat\xF3dica indicados en los planos."
            },
            {
              letra: "b",
              texto: "Comprobar la correcta instalaci\xF3n y funcionamiento de los \xE1nodos, su correcta exposici\xF3n (comprobar que no se hallan pintados) y el grado de desgaste."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.16",
          titulo: "Estado del casco (\xF3smosis, deslaminaciones, golpes, grietas, etc.)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar visualmente el casco fuera del agua comprobando su estado e integridad."
            },
            {
              letra: "b",
              texto: "Cualquier golpe de importancia detectado en una orza, aunque este reparado deber\xE1 conllevar una inspecci\xF3n detallada de la uni\xF3n orza-casco y de la estructura de soporte de la quilla en el interior del casco."
            },
            {
              letra: "c",
              texto: "En todos los casos inspeccionar las zonas con apariencias de golpes o grietas, examin\xE1ndose estas \xFAltimas desde el interior."
            },
            {
              letra: "d",
              texto: "En cascos met\xE1licos buscar signos de corrosi\xF3n excesiva, en especial en las proximidades de herrajes o elementos fijados al mismo."
            },
            {
              letra: "e",
              texto: "En cascos de madera se hacen comprobaciones similares verificando el estado general de la madera."
            },
            {
              letra: "f",
              texto: "En cascos de materiales compuestos buscar signos de \xF3smosis en forma de burbujas o ampollas levantando, si se sospecha de su existencia, zonas de pintura hasta descubrir el gel coat, cuyo estado deber\xE1 verificarse."
            },
            {
              letra: "g",
              texto: "En casos de gel coat da\xF1ado proceder a una comprobaci\xF3n del grado de humedad del laminado mediante el uso de equipo adecuado."
            },
            {
              letra: "h",
              texto: "Comprobar la existencia de grietas para evaluar si se trata de grietas locales de pintura o gel coat o por el contrario da\xF1os del laminado. Las grietas detectadas en el exterior del casco deber\xE1n ir acompa\xF1adas de una inspecci\xF3n interior tanto del forro como de los refuerzos adyacentes."
            },
            {
              letra: "i",
              texto: "Ante cualquier sospecha de delaminaci\xF3n en forros o refuerzos de materiales compuestos comprobar golpeando con un martillo de cabeza roma u objeto similar buscando cambios de sonido en la zona que delaten delaminaciones."
            },
            {
              letra: "j",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "1.17",
          titulo: "C\xE1maras de flotabilidad",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que las c\xE1maras de flotabilidad no han sido modificadas para otro uso distinto del cometido de las mismas."
            },
            {
              letra: "b",
              texto: "Comprobar el estado del material expandible de relleno."
            },
            {
              letra: "c",
              texto: "Comprobar la estanqueidad de las c\xE1maras de flotabilidad."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        }
      ]
    },
    {
      codigo: "2",
      titulo: "Maquinaria principal y auxiliar",
      requiere_seco: true,
      deficiencias_graves_aplicables: [
        "c",
        "e",
        "f",
        "k"
      ],
      puntos: [
        {
          codigo: "2.1",
          titulo: "Bombas de achique",
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar ocularmente el/los local/es donde est\xE9n/n ubicada/s y su posici\xF3n para comprobar que no existen anomal\xEDas de mantenimiento en cuanto al entorno de la bomba, como pueden ser exceso de corrosi\xF3n, cables el\xE9ctricos en mal estado, tornillos de sujeci\xF3n deteriorados, etc."
            },
            {
              letra: "b",
              texto: "Inspeccionar su anclaje al pol\xEDn o apoyo correspondiente, comprobando que no se producen vibraciones excesivas durante su uso normal."
            },
            {
              letra: "c",
              texto: "Comprobar visualmente las tuber\xEDas de entrada/salida verificando su buen estado externo, y si fuera posible desempernado abrazaderas y comprobando el espesor de las tuber\xEDas en los alrededores de la bomba y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "d",
              texto: "Comprobar el estado de los cables el\xE9ctricos que dan alimentaci\xF3n al motor de la bomba y su estado de conservaci\xF3n."
            },
            {
              letra: "e",
              texto: "En caso de motor no el\xE9ctrico comprobar el mecanismo de accionamiento acorde a los requerimientos del tipo de accionamiento al que se encuentre sometida la bomba."
            },
            {
              letra: "f",
              texto: "Comprobar el correcto funcionamiento del equipo en sus dos modalidades: Manual y/o autom\xE1tica."
            },
            {
              letra: "g",
              texto: "Inspeccionar el circuito de achique en las inmediaciones de la bomba observando que no se produzcan p\xE9rdidas."
            },
            {
              letra: "h",
              texto: "Si fuera posible comprobar que el caudal y presi\xF3n dados por la bomba cumple los requerimientos de proyecto."
            },
            {
              letra: "i",
              texto: "Verificar que el nivel de aislamiento IP corresponde al proyectado para el equipo."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.2",
          titulo: "Tanques de combustible (aireaci\xF3n, niveles y bocas de llenado)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el estado de corrosi\xF3n y/o pintado del interior del tanque si fuera posible."
            },
            {
              letra: "b",
              texto: "Comprobar el correcto estado de todas las tuber\xEDas, manguitos y posibles abrazaderas que tengan acceso al tanque (tuber\xEDas de llenado, vaciado, aireaci\xF3n, sonda), comprobando que ninguna de ellas tiene p\xE9rdidas y su estado de conservaci\xF3n es el adecuado."
            },
            {
              letra: "c",
              texto: "Comprobar el correcto funcionamiento del sistema de aireaci\xF3n del tanque, verificando que se encuentra libre de cualquier posible obstrucci\xF3n, no da lugar a p\xE9rdidas en caso de rebose, salvo por las zonas previstas para el caso, y que su salida al exterior es la especificada en el manual de propietario."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto funcionamiento del sistema niveles, tanto del sistema de medida de nivel manual como los teleniveles si los hubiera. Se verificar\xE1 que se encuentra libre de cualquier posible obstrucci\xF3n, no dando lugar a p\xE9rdidas a lo largo de su recorrido."
            },
            {
              letra: "e",
              texto: "Comprobar las bocas de llenado verificando cumplan las normas en vigor en cuanto a dimensiones y funcionamiento y observando no se produzcan p\xE9rdidas durante la fase de llenado de tanques."
            },
            {
              letra: "f",
              texto: "Comprobar el correcto funcionamiento de todas las v\xE1lvulas del sistema de carga/descarga de combustible de los tanques, verificando su accionamiento y buen funcionamiento, acorde a los requerimientos del tipo de accionamiento al que se encuentre sometida las v\xE1lvulas (manual y/o autom\xE1tico)."
            },
            {
              letra: "g",
              texto: "Comprobar la fijaci\xF3n de los tanques no estructurales verificando que no existe un desgase excesivo en las zonas de los elementos de fijaci\xF3n."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.3",
          titulo: "Ventilaci\xF3n del local del motor propulsor",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el cumplimiento por parte de la ventilaci\xF3n de los requisitos en cuanto a instalaci\xF3n y dimensionamiento descritos en el manual del propietario."
            },
            {
              letra: "b",
              texto: "Si la ventilaci\xF3n fuese del tipo forzada. Comprobar la integridad y el buen funcionamiento de los ventiladores."
            },
            {
              letra: "c",
              texto: "Comprobar el estado de los filtros si los hubiera."
            },
            {
              letra: "d",
              texto: "Comprobar mediante el uso de humo o cualquier otro tipo de material capaz de enrarecer la atm\xF3sfera del local el buen \xABtiro\xBB de la instalaci\xF3n."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.4",
          titulo: "V\xE1lvulas de fondo",
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar todas las tomas de mar que dispongan de v\xE1lvula de fondo, comprobando que no existen anomal\xEDas de mantenimiento en cuanto a su entorno, como pueden ser exceso de corrosi\xF3n o falta de rejillas protectoras donde fuera necesario."
            },
            {
              letra: "b",
              texto: "Inspeccionar visualmente las tuber\xEDas de entrada/salida verificando su buen estado externo, y si fuera posible desempernado abrazaderas y comprobando de espesor de las tuber\xEDas en los alrededores de la v\xE1lvula y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "c",
              texto: "Comprobar el estado de los cables el\xE9ctricos que dan alimentaci\xF3n al motor de accionamiento de la v\xE1lvula si \xE9sta fuese telemandada."
            },
            {
              letra: "d",
              texto: "Comprobar el funcionamiento de la v\xE1lvula en sus dos modalidades: Manual y/o autom\xE1tica."
            },
            {
              letra: "e",
              texto: "Comprobar el buen asiento de la v\xE1lvula, verificando que no hay circulaci\xF3n de l\xEDquido bajo carga."
            },
            {
              letra: "f",
              texto: "Inspeccionar visualmente el estado de los manguitos, vigilando los posibles estrangulamientos y grietas de los mismos."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.5",
          titulo: "Circuito de refrigeraci\xF3n (manguitos y abrazaderas)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto buen funcionamiento de la bomba del circuito de refrigeraci\xF3n, verificando para ello su funcionamiento con el motor, si actuase por acci\xF3n del motor, o independientemente en caso contrario."
            },
            {
              letra: "b",
              texto: "Inspeccionar visualmente el local donde est\xE9 ubicado y de su posici\xF3n para comprobar que no existen anomal\xEDas de mantenimiento en cuanto al entorno de la bomba."
            },
            {
              letra: "c",
              texto: "Comprobar el anclaje al pol\xEDn o apoyo correspondiente, verificando que no se producen vibraciones excesivas durante su uso normal."
            },
            {
              letra: "d",
              texto: "Inspeccionar visualmente las tuber\xEDas de entrada/salida, verificando su buen estado externo y, si fuera posible, desempernado abrazaderas para comprobar el espesor de las tuber\xEDas en los alrededores de la bomba y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "e",
              texto: "Inspeccionar todas las tuber\xEDas, manguitos y abrazaderas del circuito de refrigeraci\xF3n, verificando la ausencia de fugas y/o microfugas."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.6",
          titulo: "Circuito de combustible (tuber\xEDas y racores)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar visualmente todo el sistema de tuber\xEDas y racores para comprobar que no existen anomal\xEDas de mantenimiento en cuanto al entorno que le rodea y su estado es bueno, ausencia de golpes, proximidad a focos de calor no contemplados en el manual del propietario."
            },
            {
              letra: "b",
              texto: "Comprobar que el circuito no presenta fugas en ning\xFAn punto de su recorrido, en particular en la uni\xF3n de tuber\xEDas y racores."
            },
            {
              letra: "c",
              texto: "Comprobar el correcto funcionamiento de todas las v\xE1lvulas que configuren el circuito de combustible."
            },
            {
              letra: "d",
              texto: "Comprobar el buen asiento de la v\xE1lvula, comprobando que no hay circulaci\xF3n de l\xEDquido, sometiendo el circuito a carga."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.7",
          titulo: "Escape de gases (conductos y pasantes)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que los conductos y pasantes de gases de escape se encuentran en buen estado y siguen el esquema de trazado de su dise\xF1o original, no habiendo sufrido modificaciones substanciales en cuanto a su distribuci\xF3n que puedan poner en peligro la seguridad del buque."
            },
            {
              letra: "b",
              texto: "Comprobar que tanto los conductos como los pasantes no tienen p\xE9rdidas, conduciendo los gases de escape hasta el punto de exhaustaci\xF3n."
            },
            {
              letra: "c",
              texto: "Comprobar la correcta fijaci\xF3n de todos los elementos del sistema de escape, en especial silenciosos y colectores."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto funcionamiento de las v\xE1lvulas antirretorno en las salidas a popa o costados."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.8",
          titulo: "Prensaestopa",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no se produce entrada de agua a trav\xE9s del prensaestopas."
            },
            {
              letra: "b",
              texto: "Comprobar visualmente del buen estado de mantenimiento del sistema del prensaestopas y corrosiones de las zonas colindantes."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.9",
          titulo: "Anclaje de motores",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto apriete de los tornillos de fijaci\xF3n a los soportes."
            },
            {
              letra: "b",
              texto: "Inspeccionar visualmente el buen estado de mantenimiento de los polines sobre los que se encuentra anclados el motor, comprobando la falta de corrosiones y/o deformaciones de las zonas colindantes as\xED como se\xF1ales de fatiga por vibraciones o desalineaciones. En especial se buscar\xE1n s\xEDntomas de deterioro debidos a cargas transmitidas en los apoyos del motor comprobando con especial cuidado aquellos puntos en que se den cambios acentuados de dimensiones, espesores, etc. En polines de materiales compuestos comprobar el estado de sus pegados a mamparos y fondo."
            },
            {
              letra: "c",
              texto: "Comprobar de forma similar los anclajes de transmisiones montadas de forma separada al motor (caso de algunas transmisiones en \xABV\xBB)."
            },
            {
              letra: "d",
              texto: "Si el motor va montado sobre soportes de tipo el\xE1stico comprobar que el estado de envejecimiento de los mismos es correcto."
            },
            {
              letra: "e",
              texto: "Comprobar la ausencia de vibraciones excesivas debido al mal estado o apriete de los soportes del motor durante el funcionamiento normal del mismo."
            },
            {
              letra: "f",
              texto: "En caso de motores fuera borda revisar la superficie de apriete de las fijaciones que no deber\xE1 estar da\xF1ada. Inspeccionar, asimismo, el espejo buscando grietas en las esquinas del receso en que se sit\xFAa el motor."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.10",
          titulo: "L\xEDnea de ejes y eje de cola",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el estado de toda la l\xEDnea de ejes, incluyendo el eje de cola verificando que su estado es bueno, no presentando corrosi\xF3n ni zonas de desgaste anormal."
            },
            {
              letra: "b",
              texto: "Comprobar el estado de todos los elementos que compongan la l\xEDnea de ejes, incluyendo chumaceras, acoplamientos el\xE1sticos, cierres de bocina."
            },
            {
              letra: "c",
              texto: "En los acoplamientos comprobar el correcto estado de tornillos o pasadores de fijaci\xF3n y/o bloqueo."
            },
            {
              letra: "d",
              texto: "Comprobar la alineaci\xF3n de la l\xEDnea de ejes, verificando la estanqueidad de los cierres."
            },
            {
              letra: "e",
              texto: "En caso de eje con camisa comprobar el buen estado de la misma."
            },
            {
              letra: "f",
              texto: "Comprobar la integridad y estado de corrosi\xF3n de la h\xE9lice, as\xED como de su mecanismo de acoplamiento al eje."
            },
            {
              letra: "g",
              texto: "En los casos en que haya lugar desmontar y comprobar el estado del eje de cola."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "2.11",
          titulo: "Comprobaci\xF3n del funcionamiento del equipo propulsor y auxiliares",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el buen funcionamiento del equipo propulsor."
            },
            {
              letra: "b",
              texto: "Para ello se deber\xE1 probar primeramente la fase de arranque, verific\xE1ndose que dicho arranque puede efectuarse de todos los puntos previstos al efecto: In situ o a distancia desde el puente o c\xE1mara de control de c\xE1mara de m\xE1quinas."
            },
            {
              letra: "c",
              texto: "Comprobar que los medios de arranque del motor principal cumplen con los requisitos especificados en el manual del propietario, n\xFAmero de posibles arrancadas, protecciones."
            },
            {
              letra: "d",
              texto: "Comprobar los motores auxiliares de forma similar a los principales, prestando especial atenci\xF3n a las protecciones y seguridades en la fase de salida del equipo hacia la instalaci\xF3n el\xE9ctrica del buque."
            },
            {
              letra: "e",
              texto: "Comprobar el correcto estado de las correas de transmisi\xF3n externas que existan."
            },
            {
              letra: "f",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            },
            {
              letra: "g",
              texto: "Comprobar en motores fueraborda el bloqueo del motor cuando est\xE1 embragado."
            },
            {
              letra: "h",
              texto: "Comprobar el funcionamiento del extractor de gases de compartimento de motor."
            },
            {
              letra: "i",
              texto: "Comprobar el estado de limpieza del compartimento del motor."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        }
      ]
    },
    {
      codigo: "3",
      titulo: "Palos y jarcia",
      requiere_seco: false,
      deficiencias_graves_aplicables: [],
      puntos: [
        {
          codigo: "3.1",
          titulo: "Palos y crucetas",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el estado general de los palos y crucetas verificando de forma especial los anclajes de herrajes en los mismos verificando su adecuada fijaci\xF3n."
            },
            {
              letra: "b",
              texto: "En palos de aluminio comprobar que no existen puntos de corrosi\xF3n importantes en la sujeci\xF3n de los herrajes."
            },
            {
              letra: "c",
              texto: "En palos de madera comprobar el estado del material en zonas de anclajes de importancia tales como estayes, burdas o crucetas."
            },
            {
              letra: "d",
              texto: "En palos de materiales compuestos, en especial de fibra de carbono, comprobar que no existe un grado de corrosi\xF3n excesivo en los herrajes instalados sobre \xE9l o sus elementos de fijaci\xF3n."
            },
            {
              letra: "e",
              texto: "Comprobar que en los pasos por fogonaduras no existen desgastes localizados que pudieran poner en peligro la integridad de los palos."
            },
            {
              letra: "f",
              texto: "Comprobar con especial cuidado los anclajes de la jarcia en los extremos de las crucetas."
            },
            {
              letra: "g",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "3.2",
          titulo: "Pasadores de los tensores",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de pasadores en todos los tensores y anclajes de elementos de la jarcia, asegur\xE1ndose de que \xE9stos se hallan bloqueados de forma adecuada."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "3.3",
          titulo: "Apretado de grilletes",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que los grilletes tienen un apriete adecuado, verific\xE1ndose que no existen deformaciones en los mismos debidos a \xE1ngulos o cargas de trabajo inadecuados."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "3.4",
          titulo: "Jarcia fija y de labor",
          comprobaciones: [
            {
              letra: "a",
              texto: "En jarcias de cable comprobar que no hay ning\xFAn hilo cortado."
            },
            {
              letra: "b",
              texto: "En jarcias de varilla comprobar que los terminales no fuerzan flexi\xF3n en los extremos de la misma, as\xED como que no existen entallas."
            },
            {
              letra: "c",
              texto: "En todos los casos comprobar su acoplamiento con los tensores o terminales."
            },
            {
              letra: "d",
              texto: "En los elementos textiles de la jarcia comprobar que no existe un desgaste local excesivo, as\xED como el correcto estado de costuras en los mismos. Asimismo, comprobar el estado de conservaci\xF3n general del material."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "3.5",
          titulo: "Anclajes diversos",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar en general todos los anclajes verific\xE1ndose el correcto funcionamiento de sus dispositivos de cierre y bloqueo."
            },
            {
              letra: "b",
              texto: "Comprobar del mismo modo que la posici\xF3n de trabajo es adecuada al dise\xF1o del anclaje."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        }
      ]
    },
    {
      codigo: "4",
      titulo: "Instalaci\xF3n el\xE9ctrica",
      requiere_seco: false,
      deficiencias_graves_aplicables: [
        "j"
      ],
      puntos: [
        {
          codigo: "4.1",
          titulo: "Bater\xEDas (caja estanca, aireaci\xF3n y desconector)",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar visualmente el buen estado de las bater\xEDas, verificando que no presenten p\xE9rdidas de l\xEDquido ni sulfuraciones abundantes."
            },
            {
              letra: "b",
              texto: "Comprobar que todas las conexiones de las bater\xEDas se encuentran en buen estado."
            },
            {
              letra: "c",
              texto: "Comprobar bajo carga que las bater\xEDas dan su tensi\xF3n nominal."
            },
            {
              letra: "d",
              texto: "Comprobar la estanqueidad de la caja o local donde se encuentren las bater\xEDas, verific\xE1ndose la correcta sujeci\xF3n de las mismas."
            },
            {
              letra: "e",
              texto: "Comprobar que el sistema de aireaci\xF3n de la caja o local donde se encuentren las bater\xEDas es suficiente y adecuado atendiendo al n\xFAmero de bater\xEDas alojadas, y que la salida de dicha aireaci\xF3n se produce a una zona donde no se puedan producir acumulaci\xF3n de gases."
            },
            {
              letra: "f",
              texto: "Comprobar que las protecciones y seguridades en la fase de salida de las bater\xEDas hacia la instalaci\xF3n el\xE9ctrica del buque es la adecuada."
            },
            {
              letra: "g",
              texto: "Comprobar la existencia de un desconector del sistema as\xED como su buen funcionamiento."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "4.2",
          titulo: "Cableado, fusibles y empalmes",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar visualmente el buen estado del cableado el\xE9ctrico del buque, observando si en alg\xFAn punto existen cables pelados, zonas de recalentamiento de cables, rigidizaciones por exceso de corriente, o cualquier otro defecto que haga prever posibles riesgos de cortocircuito o fallo de corriente el\xE9ctrica."
            },
            {
              letra: "b",
              texto: "Si fuera conveniente, y en los casos que se considere necesario, comprobar la continuidad de los cables y su posible derivaci\xF3n a tierra si no debiera de estar conectado a ella."
            },
            {
              letra: "c",
              texto: "Comprobar que ning\xFAn cable o paso de cables de tensi\xF3n se encuentren en zonas donde est\xE9 previsto el almacenaje o paso sin las debidas protecciones de material inflamable o explosivo."
            },
            {
              letra: "d",
              texto: "Comprobar el estado y que las caracter\xEDsticas coincidan con las del proyecto de todos los fusibles que se consideren indispensables para el sistema de emergencia de la embarcaci\xF3n, as\xED como todos aquellos que se requieran para el uso normal de la embarcaci\xF3n."
            },
            {
              letra: "e",
              texto: "Comprobar los empalmes de cables, debiendo verificar que el tratamiento de dichos empalmes debe cumplir con los expuestos para cable completo, es decir, ning\xFAn empalme puede constituir discontinuidad o derivaci\xF3n del cable al que se encuentre asignado."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "4.3",
          titulo: "Enchufes estancos en cubierta",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar visualmente el buen estado de los enchufes estancos en cubierta."
            },
            {
              letra: "b",
              texto: "Comprobar la estanqueidad de dichos enchufes."
            },
            {
              letra: "c",
              texto: "Comprobar que todos ellos disponen de las protecciones y seguridades acorde a las funciones a desempe\xF1ar y a sus especificaciones de funcionamiento, en particular en lo referente al consumo de dise\xF1o."
            },
            {
              letra: "d",
              texto: "Comprobar en ellos la llegada de la tensi\xF3n nominal requerida para su servicio."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "4.4",
          titulo: "Puesta a tierra de aparatos",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que todos los aparatos que dispongan de alimentaci\xF3n el\xE9ctrica se encuentran conectados a tierra, encontr\xE1ndose dicha conexi\xF3n en buen estado."
            },
            {
              letra: "b",
              texto: "En concreto comprobar la puesta a tierra de electrov\xE1lvulas, ventiladores, bombas, electrodom\xE9sticos, calentadores, etc."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        },
        {
          codigo: "4.5",
          titulo: "Protecci\xF3n antipar\xE1sita de aparatos radioel\xE9ctricos",
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que todos los aparatos radioel\xE9ctricos de a bordo se encuentran debidamente protegidos antiparasitariamente, para ello se ver\xE1 que no sufren interferencias entre ellos al estar conectados y en funcionamiento a la vez, ni con un consumo de corriente el\xE9ctrica nominal del buque por la proximidad de cables."
            },
            {
              letra: "b",
              texto: "Comprobar que se han cumplido las recomendaciones del fabricante en este sentido."
            }
          ],
          notas: [
            "Siempre que haya lugar:"
          ]
        }
      ]
    },
    {
      codigo: "5",
      titulo: "Equipo de radiocomunicaciones",
      requiere_seco: false,
      deficiencias_graves_aplicables: [
        "g"
      ],
      puntos: []
    },
    {
      codigo: "6",
      titulo: "Equipo de salvamento",
      requiere_seco: false,
      deficiencias_graves_aplicables: [
        "h"
      ],
      puntos: []
    },
    {
      codigo: "7",
      titulo: "Equipo de contraincendios",
      requiere_seco: false,
      deficiencias_graves_aplicables: [
        "m"
      ],
      puntos: []
    },
    {
      codigo: "8",
      titulo: "Material n\xE1utico",
      requiere_seco: false,
      deficiencias_graves_aplicables: [
        "l"
      ],
      puntos: []
    },
    {
      codigo: "9",
      titulo: "Luces de navegaci\xF3n",
      requiere_seco: false,
      deficiencias_graves_aplicables: [
        "i"
      ],
      puntos: []
    },
    {
      codigo: "10",
      titulo: "Equipo de fondeo",
      requiere_seco: false,
      deficiencias_graves_aplicables: [],
      puntos: []
    }
  ]
};

// src/datos/formulario.json
var formulario_default = {
  documento: "RD 1434/1999, Anexo II \u2014 ejecuci\xF3n del reconocimiento",
  organizacion: "RD 1434/1999 (BOE)",
  version_formulario: "consolidada, actualizaci\xF3n de 06/11/2010",
  prefijo_informe: "",
  publica: true,
  bloques: [
    {
      codigo: "01",
      titulo: "Casco y equipo",
      norma_citada: null,
      puntos: [
        {
          codigo: "01.01",
          titulo: "Nombre y matr\xEDcula",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que las identificaciones y marcas en la embarcaci\xF3n coinciden con las reglamentarias."
            },
            {
              letra: "b",
              texto: "Comprobar que el equipo que figura en el Inventario de la embarcaci\xF3n se corresponde con el existente a bordo."
            }
          ]
        },
        {
          codigo: "01.02",
          titulo: "Manual del propietario",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia del manual del propietario conteniendo informaci\xF3n actualizada de los equipos instalados a bordo en aquellas embarcaciones que tengan la marca CE."
            }
          ]
        },
        {
          codigo: "01.03",
          titulo: "Candeleros y pasamanos",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar los anclajes en cubierta de los candeleros, verificando que sus tornillos o medios de sujeci\xF3n se encuentran convenientemente apretados y que no hay da\xF1os en cubierta en la zona de anclaje."
            },
            {
              letra: "b",
              texto: "Comprobar el estado y anclajes de los pasamanos y, si \xE9stos son de cable, el estado del mismo, as\xED como de sus terminales y bloqueos."
            }
          ]
        },
        {
          codigo: "01.04",
          titulo: "Pasacascos y pasamamparos",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no existe corrosi\xF3n local alrededor de pasacascos y pasamamparos."
            },
            {
              letra: "b",
              texto: "Comprobar que la estanqueidad de pasacascos y pasamamparos se halla intacta."
            }
          ]
        },
        {
          codigo: "01.05",
          titulo: "V\xE1lvulas de costado",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar visualmente las tuber\xEDas de entrada/salida verificando su buen estado externo, y si fuera posible desempernado abrazaderas y comprobando el espesor de las tuber\xEDas en los alrededores de la v\xE1lvula y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "b",
              texto: "Comprobar el estado de los cables el\xE9ctricos que dan alimentaci\xF3n al motor de accionamiento de la v\xE1lvula si \xE9sta fuese telemandada."
            },
            {
              letra: "c",
              texto: "Comprobar el funcionamiento de la v\xE1lvula en sus dos modalidades: Manual y/o autom\xE1tica."
            },
            {
              letra: "d",
              texto: "Comprobar el buen asiento de la v\xE1lvula, verificando que no hay circulaci\xF3n de l\xEDquido bajo carga."
            },
            {
              letra: "e",
              texto: "comprobar la existencia de rejillas en aquellas v\xE1lvulas que as\xED lo requieran."
            }
          ]
        },
        {
          codigo: "01.06",
          titulo: "Estanqueidad en aberturas de cubierta",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto estado de conservaci\xF3n y fijaci\xF3n de las juntas de las aberturas y portillos practicables."
            },
            {
              letra: "b",
              texto: "Comprobar el estado de limpieza y correcto funcionamiento de los ra\xEDles con drenaje en accesos de tipo deslizante."
            },
            {
              letra: "c",
              texto: "Comprobar que el sellante empleado en el montaje de las aberturas o portillos fijos se halla intacto."
            },
            {
              letra: "d",
              texto: "Comprobar la estanqueidad de fogonaduras en el paso de palos a trav\xE9s de cubierta."
            },
            {
              letra: "e",
              texto: "Comprobar la integridad de la uni\xF3n de casco y cubierta, as\xED como ra\xEDles atornillados sobre la misma."
            },
            {
              letra: "f",
              texto: "Comprobar la estanqueidad en herrajes atornillados sobre cubierta."
            },
            {
              letra: "g",
              texto: "En caso de duda comprobar la estanqueidad mediante la aplicaci\xF3n de un chorro de agua con una manguera a presi\xF3n normal."
            }
          ]
        },
        {
          codigo: "01.07",
          titulo: "Uni\xF3n orza/casco",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto apriete de los pernos de la orza salvo en los casos en que exista un mecanismo de bloqueo verificable."
            },
            {
              letra: "b",
              texto: "Comprobar que no existen signos de corrosi\xF3n excesiva. En caso de existir elementos susceptibles de aumentar la corrosi\xF3n electrol\xEDtica de alguno de los pernos, \xE9se deber\xE1 ser el primero en inspeccionarse."
            },
            {
              letra: "c",
              texto: "Si las tuercas situadas en el interior del caso est\xE1n laminadas por encima descubrir, al menos, una de ellas para efectuar una comprobaci\xF3n suficiente."
            },
            {
              letra: "d",
              texto: "Comprobar la no-existencia de grietas exteriores m\xE1s all\xE1 de las razonables superficiales de pintura."
            },
            {
              letra: "e",
              texto: "Comprobar de forma especial posibles deformaciones o roturas debidas a varadas accidentales que se pueden mostrar en forma de grietas en varengas a proa o popa de la quilla y a separaci\xF3n (seg\xFAn el tipo de quilla y sujeci\xF3n) del extremo de proa de la quilla del casco."
            },
            {
              letra: "f",
              texto: "Comprobar la correcta fijaci\xF3n de lastre no integral."
            },
            {
              letra: "g",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            }
          ]
        },
        {
          codigo: "01.08",
          titulo: "Uni\xF3n arbotantes/casco",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la sujeci\xF3n de los arbotantes al casco verificando el estado del mismo en dicha zona."
            },
            {
              letra: "b",
              texto: "En cascos de materiales compuestos buscar signos de deslaminaci\xF3n local debida a fatiga provocada por las vibraciones a que se halla sometido, comprobando la estanqueidad del casco en dicha zona."
            },
            {
              letra: "c",
              texto: "Comprobar el apriete de los tornillos de fijaci\xF3n en el caso de arbotantes atornillados."
            },
            {
              letra: "d",
              texto: "Comprobar el estado de la zona del casco y/o refuerzos sobre los que se fijen los arbotantes."
            }
          ]
        },
        {
          codigo: "01.09",
          titulo: "Cadenotes",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no existen signos de desgaste excesivo por roce, deformaciones, desalineamiento o corrosi\xF3n excesiva."
            },
            {
              letra: "b",
              texto: "Comprobar la estanqueidad de la cubierta en el caso de cadenotes pasantes a trav\xE9s de la misma."
            },
            {
              letra: "c",
              texto: "Comprobar la integridad de la zona de casco o estructura donde \xE9stos se hallen fijados o de los que sean parte integral."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto apriete de los tornillos de fijaci\xF3n en el caso de cadenotes atornillados."
            }
          ]
        },
        {
          codigo: "01.10",
          titulo: "Ba\xF1eras autoachicables (desag\xFCes)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de los desag\xFCes especificados en el proyecto, verificando que se hallan libres de obst\xE1culos que impidan fluir el agua libremente."
            },
            {
              letra: "b",
              texto: "Comprobar que ning\xFAn desag\xFCe queda bloqueado por suelos desmontables existentes u otros elementos."
            }
          ]
        },
        {
          codigo: "01.11",
          titulo: "Sistema antideslizante de cubierta",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de un antideslizante eficaz de alg\xFAn tipo en las zonas de trabajo."
            },
            {
              letra: "b",
              texto: "Comprobar que no existe un grado de desgaste excesivo que le impida cumplir su cometido en condiciones normales."
            }
          ]
        },
        {
          codigo: "01.12",
          titulo: "Ventilaci\xF3n/extracci\xF3n de cocina",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de un sistema de ventilaci\xF3n en la cocina de acuerdo con lo especificado en el manual del propietario."
            },
            {
              letra: "b",
              texto: "Comprobar el correcto funcionamiento de cualquier dispositivo de extracci\xF3n existente, asegur\xE1ndose que funciona y que su capacidad no est\xE1 reducida por cualquier obstrucci\xF3n."
            },
            {
              letra: "c",
              texto: "Comprobar en el caso ventilaciones con mangerotes con cajas doradas que disponen de drenaje y que \xE9ste no est\xE1 obstruido y funciona de forma adecuada."
            }
          ]
        },
        {
          codigo: "01.13",
          titulo: "Circuitos de gas de cocina (tuber\xEDas y racores)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la correcta situaci\xF3n de la bombona de gas y existencia de las llaves de paso adecuadas."
            },
            {
              letra: "b",
              texto: "Comprobar que no existen p\xE9rdidas bajo presi\xF3n en todo el circuito."
            },
            {
              letra: "c",
              texto: "Comprobar el estado de conservaci\xF3n adecuado de las conducciones, en especial en los extremos."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto montaje y apriete de las abrazaderas de acoplamiento de los conductores."
            },
            {
              letra: "e",
              texto: "Comprobar el correcto funcionamiento de las v\xE1lvulas en los aparatos consumidores de gas de la cocina."
            },
            {
              letra: "f",
              texto: "Comprobar la correcta instalaci\xF3n y funcionamiento del detector de gases."
            },
            {
              letra: "g",
              texto: "Comprobar que las embarcaciones con marcado disponen de detector de apagado de llama en los quemadores de cocina."
            }
          ]
        },
        {
          codigo: "01.14",
          titulo: "Gobierno, tim\xF3n y mecha",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no existen desgastes en la mecha debidos a roces con los cojinetes, en especial en la parte inferior de la limera."
            },
            {
              letra: "b",
              texto: "Comprobar el correcto estado y tensi\xF3n de los guardines o ausencia de holguras de importancia en los sistemas mec\xE1nicos."
            },
            {
              letra: "c",
              texto: "Comprobar el correcto estado del sector, sujeci\xF3n del mismo a la mecha y anclajes de los guardines."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto estado de poleas de timoner\xEDa y anclaje de las mismas."
            }
          ]
        },
        {
          codigo: "01.15",
          titulo: "Protecci\xF3n cat\xF3dica",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de los elementos de protecci\xF3n cat\xF3dica indicados en los planos."
            },
            {
              letra: "b",
              texto: "Comprobar la correcta instalaci\xF3n y funcionamiento de los \xE1nodos, su correcta exposici\xF3n (comprobar que no se hallan pintados) y el grado de desgaste."
            }
          ]
        },
        {
          codigo: "01.16",
          titulo: "Estado del casco (\xF3smosis, deslaminaciones, golpes, grietas, etc.)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar visualmente el casco fuera del agua comprobando su estado e integridad."
            },
            {
              letra: "b",
              texto: "Cualquier golpe de importancia detectado en una orza, aunque este reparado deber\xE1 conllevar una inspecci\xF3n detallada de la uni\xF3n orza-casco y de la estructura de soporte de la quilla en el interior del casco."
            },
            {
              letra: "c",
              texto: "En todos los casos inspeccionar las zonas con apariencias de golpes o grietas, examin\xE1ndose estas \xFAltimas desde el interior."
            },
            {
              letra: "d",
              texto: "En cascos met\xE1licos buscar signos de corrosi\xF3n excesiva, en especial en las proximidades de herrajes o elementos fijados al mismo."
            },
            {
              letra: "e",
              texto: "En cascos de madera se hacen comprobaciones similares verificando el estado general de la madera."
            },
            {
              letra: "f",
              texto: "En cascos de materiales compuestos buscar signos de \xF3smosis en forma de burbujas o ampollas levantando, si se sospecha de su existencia, zonas de pintura hasta descubrir el gel coat, cuyo estado deber\xE1 verificarse."
            },
            {
              letra: "g",
              texto: "En casos de gel coat da\xF1ado proceder a una comprobaci\xF3n del grado de humedad del laminado mediante el uso de equipo adecuado."
            },
            {
              letra: "h",
              texto: "Comprobar la existencia de grietas para evaluar si se trata de grietas locales de pintura o gel coat o por el contrario da\xF1os del laminado. Las grietas detectadas en el exterior del casco deber\xE1n ir acompa\xF1adas de una inspecci\xF3n interior tanto del forro como de los refuerzos adyacentes."
            },
            {
              letra: "i",
              texto: "Ante cualquier sospecha de delaminaci\xF3n en forros o refuerzos de materiales compuestos comprobar golpeando con un martillo de cabeza roma u objeto similar buscando cambios de sonido en la zona que delaten delaminaciones."
            },
            {
              letra: "j",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            }
          ]
        },
        {
          codigo: "01.17",
          titulo: "C\xE1maras de flotabilidad",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que las c\xE1maras de flotabilidad no han sido modificadas para otro uso distinto del cometido de las mismas."
            },
            {
              letra: "b",
              texto: "Comprobar el estado del material expandible de relleno."
            },
            {
              letra: "c",
              texto: "Comprobar la estanqueidad de las c\xE1maras de flotabilidad."
            }
          ]
        }
      ]
    },
    {
      codigo: "02",
      titulo: "Maquinaria principal y auxiliar",
      norma_citada: null,
      puntos: [
        {
          codigo: "02.01",
          titulo: "Bombas de achique",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar ocularmente el/los local/es donde est\xE9n/n ubicada/s y su posici\xF3n para comprobar que no existen anomal\xEDas de mantenimiento en cuanto al entorno de la bomba, como pueden ser exceso de corrosi\xF3n, cables el\xE9ctricos en mal estado, tornillos de sujeci\xF3n deteriorados, etc."
            },
            {
              letra: "b",
              texto: "Inspeccionar su anclaje al pol\xEDn o apoyo correspondiente, comprobando que no se producen vibraciones excesivas durante su uso normal."
            },
            {
              letra: "c",
              texto: "Comprobar visualmente las tuber\xEDas de entrada/salida verificando su buen estado externo, y si fuera posible desempernado abrazaderas y comprobando el espesor de las tuber\xEDas en los alrededores de la bomba y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "d",
              texto: "Comprobar el estado de los cables el\xE9ctricos que dan alimentaci\xF3n al motor de la bomba y su estado de conservaci\xF3n."
            },
            {
              letra: "e",
              texto: "En caso de motor no el\xE9ctrico comprobar el mecanismo de accionamiento acorde a los requerimientos del tipo de accionamiento al que se encuentre sometida la bomba."
            },
            {
              letra: "f",
              texto: "Comprobar el correcto funcionamiento del equipo en sus dos modalidades: Manual y/o autom\xE1tica."
            },
            {
              letra: "g",
              texto: "Inspeccionar el circuito de achique en las inmediaciones de la bomba observando que no se produzcan p\xE9rdidas."
            },
            {
              letra: "h",
              texto: "Si fuera posible comprobar que el caudal y presi\xF3n dados por la bomba cumple los requerimientos de proyecto."
            },
            {
              letra: "i",
              texto: "Verificar que el nivel de aislamiento IP corresponde al proyectado para el equipo."
            }
          ]
        },
        {
          codigo: "02.02",
          titulo: "Tanques de combustible (aireaci\xF3n, niveles y bocas de llenado)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el estado de corrosi\xF3n y/o pintado del interior del tanque si fuera posible."
            },
            {
              letra: "b",
              texto: "Comprobar el correcto estado de todas las tuber\xEDas, manguitos y posibles abrazaderas que tengan acceso al tanque (tuber\xEDas de llenado, vaciado, aireaci\xF3n, sonda), comprobando que ninguna de ellas tiene p\xE9rdidas y su estado de conservaci\xF3n es el adecuado."
            },
            {
              letra: "c",
              texto: "Comprobar el correcto funcionamiento del sistema de aireaci\xF3n del tanque, verificando que se encuentra libre de cualquier posible obstrucci\xF3n, no da lugar a p\xE9rdidas en caso de rebose, salvo por las zonas previstas para el caso, y que su salida al exterior es la especificada en el manual de propietario."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto funcionamiento del sistema niveles, tanto del sistema de medida de nivel manual como los teleniveles si los hubiera. Se verificar\xE1 que se encuentra libre de cualquier posible obstrucci\xF3n, no dando lugar a p\xE9rdidas a lo largo de su recorrido."
            },
            {
              letra: "e",
              texto: "Comprobar las bocas de llenado verificando cumplan las normas en vigor en cuanto a dimensiones y funcionamiento y observando no se produzcan p\xE9rdidas durante la fase de llenado de tanques."
            },
            {
              letra: "f",
              texto: "Comprobar el correcto funcionamiento de todas las v\xE1lvulas del sistema de carga/descarga de combustible de los tanques, verificando su accionamiento y buen funcionamiento, acorde a los requerimientos del tipo de accionamiento al que se encuentre sometida las v\xE1lvulas (manual y/o autom\xE1tico)."
            },
            {
              letra: "g",
              texto: "Comprobar la fijaci\xF3n de los tanques no estructurales verificando que no existe un desgase excesivo en las zonas de los elementos de fijaci\xF3n."
            }
          ]
        },
        {
          codigo: "02.03",
          titulo: "Ventilaci\xF3n del local del motor propulsor",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el cumplimiento por parte de la ventilaci\xF3n de los requisitos en cuanto a instalaci\xF3n y dimensionamiento descritos en el manual del propietario."
            },
            {
              letra: "b",
              texto: "Si la ventilaci\xF3n fuese del tipo forzada. Comprobar la integridad y el buen funcionamiento de los ventiladores."
            },
            {
              letra: "c",
              texto: "Comprobar el estado de los filtros si los hubiera."
            },
            {
              letra: "d",
              texto: "Comprobar mediante el uso de humo o cualquier otro tipo de material capaz de enrarecer la atm\xF3sfera del local el buen \xABtiro\xBB de la instalaci\xF3n."
            }
          ]
        },
        {
          codigo: "02.04",
          titulo: "V\xE1lvulas de fondo",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar todas las tomas de mar que dispongan de v\xE1lvula de fondo, comprobando que no existen anomal\xEDas de mantenimiento en cuanto a su entorno, como pueden ser exceso de corrosi\xF3n o falta de rejillas protectoras donde fuera necesario."
            },
            {
              letra: "b",
              texto: "Inspeccionar visualmente las tuber\xEDas de entrada/salida verificando su buen estado externo, y si fuera posible desempernado abrazaderas y comprobando de espesor de las tuber\xEDas en los alrededores de la v\xE1lvula y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "c",
              texto: "Comprobar el estado de los cables el\xE9ctricos que dan alimentaci\xF3n al motor de accionamiento de la v\xE1lvula si \xE9sta fuese telemandada."
            },
            {
              letra: "d",
              texto: "Comprobar el funcionamiento de la v\xE1lvula en sus dos modalidades: Manual y/o autom\xE1tica."
            },
            {
              letra: "e",
              texto: "Comprobar el buen asiento de la v\xE1lvula, verificando que no hay circulaci\xF3n de l\xEDquido bajo carga."
            },
            {
              letra: "f",
              texto: "Inspeccionar visualmente el estado de los manguitos, vigilando los posibles estrangulamientos y grietas de los mismos."
            }
          ]
        },
        {
          codigo: "02.05",
          titulo: "Circuito de refrigeraci\xF3n (manguitos y abrazaderas)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto buen funcionamiento de la bomba del circuito de refrigeraci\xF3n, verificando para ello su funcionamiento con el motor, si actuase por acci\xF3n del motor, o independientemente en caso contrario."
            },
            {
              letra: "b",
              texto: "Inspeccionar visualmente el local donde est\xE9 ubicado y de su posici\xF3n para comprobar que no existen anomal\xEDas de mantenimiento en cuanto al entorno de la bomba."
            },
            {
              letra: "c",
              texto: "Comprobar el anclaje al pol\xEDn o apoyo correspondiente, verificando que no se producen vibraciones excesivas durante su uso normal."
            },
            {
              letra: "d",
              texto: "Inspeccionar visualmente las tuber\xEDas de entrada/salida, verificando su buen estado externo y, si fuera posible, desempernado abrazaderas para comprobar el espesor de las tuber\xEDas en los alrededores de la bomba y su estado debido a posible corrosi\xF3n."
            },
            {
              letra: "e",
              texto: "Inspeccionar todas las tuber\xEDas, manguitos y abrazaderas del circuito de refrigeraci\xF3n, verificando la ausencia de fugas y/o microfugas."
            }
          ]
        },
        {
          codigo: "02.06",
          titulo: "Circuito de combustible (tuber\xEDas y racores)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Inspeccionar visualmente todo el sistema de tuber\xEDas y racores para comprobar que no existen anomal\xEDas de mantenimiento en cuanto al entorno que le rodea y su estado es bueno, ausencia de golpes, proximidad a focos de calor no contemplados en el manual del propietario."
            },
            {
              letra: "b",
              texto: "Comprobar que el circuito no presenta fugas en ning\xFAn punto de su recorrido, en particular en la uni\xF3n de tuber\xEDas y racores."
            },
            {
              letra: "c",
              texto: "Comprobar el correcto funcionamiento de todas las v\xE1lvulas que configuren el circuito de combustible."
            },
            {
              letra: "d",
              texto: "Comprobar el buen asiento de la v\xE1lvula, comprobando que no hay circulaci\xF3n de l\xEDquido, sometiendo el circuito a carga."
            }
          ]
        },
        {
          codigo: "02.07",
          titulo: "Escape de gases (conductos y pasantes)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que los conductos y pasantes de gases de escape se encuentran en buen estado y siguen el esquema de trazado de su dise\xF1o original, no habiendo sufrido modificaciones substanciales en cuanto a su distribuci\xF3n que puedan poner en peligro la seguridad del buque."
            },
            {
              letra: "b",
              texto: "Comprobar que tanto los conductos como los pasantes no tienen p\xE9rdidas, conduciendo los gases de escape hasta el punto de exhaustaci\xF3n."
            },
            {
              letra: "c",
              texto: "Comprobar la correcta fijaci\xF3n de todos los elementos del sistema de escape, en especial silenciosos y colectores."
            },
            {
              letra: "d",
              texto: "Comprobar el correcto funcionamiento de las v\xE1lvulas antirretorno en las salidas a popa o costados."
            }
          ]
        },
        {
          codigo: "02.08",
          titulo: "Prensaestopa",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que no se produce entrada de agua a trav\xE9s del prensaestopas."
            },
            {
              letra: "b",
              texto: "Comprobar visualmente del buen estado de mantenimiento del sistema del prensaestopas y corrosiones de las zonas colindantes."
            }
          ]
        },
        {
          codigo: "02.09",
          titulo: "Anclaje de motores",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el correcto apriete de los tornillos de fijaci\xF3n a los soportes."
            },
            {
              letra: "b",
              texto: "Inspeccionar visualmente el buen estado de mantenimiento de los polines sobre los que se encuentra anclados el motor, comprobando la falta de corrosiones y/o deformaciones de las zonas colindantes as\xED como se\xF1ales de fatiga por vibraciones o desalineaciones. En especial se buscar\xE1n s\xEDntomas de deterioro debidos a cargas transmitidas en los apoyos del motor comprobando con especial cuidado aquellos puntos en que se den cambios acentuados de dimensiones, espesores, etc. En polines de materiales compuestos comprobar el estado de sus pegados a mamparos y fondo."
            },
            {
              letra: "c",
              texto: "Comprobar de forma similar los anclajes de transmisiones montadas de forma separada al motor (caso de algunas transmisiones en \xABV\xBB)."
            },
            {
              letra: "d",
              texto: "Si el motor va montado sobre soportes de tipo el\xE1stico comprobar que el estado de envejecimiento de los mismos es correcto."
            },
            {
              letra: "e",
              texto: "Comprobar la ausencia de vibraciones excesivas debido al mal estado o apriete de los soportes del motor durante el funcionamiento normal del mismo."
            },
            {
              letra: "f",
              texto: "En caso de motores fuera borda revisar la superficie de apriete de las fijaciones que no deber\xE1 estar da\xF1ada. Inspeccionar, asimismo, el espejo buscando grietas en las esquinas del receso en que se sit\xFAa el motor."
            }
          ]
        },
        {
          codigo: "02.10",
          titulo: "L\xEDnea de ejes y eje de cola",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el estado de toda la l\xEDnea de ejes, incluyendo el eje de cola verificando que su estado es bueno, no presentando corrosi\xF3n ni zonas de desgaste anormal."
            },
            {
              letra: "b",
              texto: "Comprobar el estado de todos los elementos que compongan la l\xEDnea de ejes, incluyendo chumaceras, acoplamientos el\xE1sticos, cierres de bocina."
            },
            {
              letra: "c",
              texto: "En los acoplamientos comprobar el correcto estado de tornillos o pasadores de fijaci\xF3n y/o bloqueo."
            },
            {
              letra: "d",
              texto: "Comprobar la alineaci\xF3n de la l\xEDnea de ejes, verificando la estanqueidad de los cierres."
            },
            {
              letra: "e",
              texto: "En caso de eje con camisa comprobar el buen estado de la misma."
            },
            {
              letra: "f",
              texto: "Comprobar la integridad y estado de corrosi\xF3n de la h\xE9lice, as\xED como de su mecanismo de acoplamiento al eje."
            },
            {
              letra: "g",
              texto: "En los casos en que haya lugar desmontar y comprobar el estado del eje de cola."
            }
          ]
        },
        {
          codigo: "02.11",
          titulo: "Comprobaci\xF3n del funcionamiento del equipo propulsor y auxiliares",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el buen funcionamiento del equipo propulsor."
            },
            {
              letra: "b",
              texto: "Para ello se deber\xE1 probar primeramente la fase de arranque, verific\xE1ndose que dicho arranque puede efectuarse de todos los puntos previstos al efecto: In situ o a distancia desde el puente o c\xE1mara de control de c\xE1mara de m\xE1quinas."
            },
            {
              letra: "c",
              texto: "Comprobar que los medios de arranque del motor principal cumplen con los requisitos especificados en el manual del propietario, n\xFAmero de posibles arrancadas, protecciones."
            },
            {
              letra: "d",
              texto: "Comprobar los motores auxiliares de forma similar a los principales, prestando especial atenci\xF3n a las protecciones y seguridades en la fase de salida del equipo hacia la instalaci\xF3n el\xE9ctrica del buque."
            },
            {
              letra: "e",
              texto: "Comprobar el correcto estado de las correas de transmisi\xF3n externas que existan."
            },
            {
              letra: "f",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            },
            {
              letra: "g",
              texto: "Comprobar en motores fueraborda el bloqueo del motor cuando est\xE1 embragado."
            },
            {
              letra: "h",
              texto: "Comprobar el funcionamiento del extractor de gases de compartimento de motor."
            },
            {
              letra: "i",
              texto: "Comprobar el estado de limpieza del compartimento del motor."
            }
          ]
        }
      ]
    },
    {
      codigo: "03",
      titulo: "Palos y jarcia",
      norma_citada: null,
      puntos: [
        {
          codigo: "03.01",
          titulo: "Palos y crucetas",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar el estado general de los palos y crucetas verificando de forma especial los anclajes de herrajes en los mismos verificando su adecuada fijaci\xF3n."
            },
            {
              letra: "b",
              texto: "En palos de aluminio comprobar que no existen puntos de corrosi\xF3n importantes en la sujeci\xF3n de los herrajes."
            },
            {
              letra: "c",
              texto: "En palos de madera comprobar el estado del material en zonas de anclajes de importancia tales como estayes, burdas o crucetas."
            },
            {
              letra: "d",
              texto: "En palos de materiales compuestos, en especial de fibra de carbono, comprobar que no existe un grado de corrosi\xF3n excesivo en los herrajes instalados sobre \xE9l o sus elementos de fijaci\xF3n."
            },
            {
              letra: "e",
              texto: "Comprobar que en los pasos por fogonaduras no existen desgastes localizados que pudieran poner en peligro la integridad de los palos."
            },
            {
              letra: "f",
              texto: "Comprobar con especial cuidado los anclajes de la jarcia en los extremos de las crucetas."
            },
            {
              letra: "g",
              texto: "En el caso de que se detecten indicios que requieran una inspecci\xF3n m\xE1s profunda se proceder\xE1 a desmontar los elementos necesarios para llevar a cabo la misma."
            }
          ]
        },
        {
          codigo: "03.02",
          titulo: "Pasadores de los tensores",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar la existencia de pasadores en todos los tensores y anclajes de elementos de la jarcia, asegur\xE1ndose de que \xE9stos se hallan bloqueados de forma adecuada."
            }
          ]
        },
        {
          codigo: "03.03",
          titulo: "Apretado de grilletes",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que los grilletes tienen un apriete adecuado, verific\xE1ndose que no existen deformaciones en los mismos debidos a \xE1ngulos o cargas de trabajo inadecuados."
            }
          ]
        },
        {
          codigo: "03.04",
          titulo: "Jarcia fija y de labor",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "En jarcias de cable comprobar que no hay ning\xFAn hilo cortado."
            },
            {
              letra: "b",
              texto: "En jarcias de varilla comprobar que los terminales no fuerzan flexi\xF3n en los extremos de la misma, as\xED como que no existen entallas."
            },
            {
              letra: "c",
              texto: "En todos los casos comprobar su acoplamiento con los tensores o terminales."
            },
            {
              letra: "d",
              texto: "En los elementos textiles de la jarcia comprobar que no existe un desgaste local excesivo, as\xED como el correcto estado de costuras en los mismos. Asimismo, comprobar el estado de conservaci\xF3n general del material."
            }
          ]
        },
        {
          codigo: "03.05",
          titulo: "Anclajes diversos",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar en general todos los anclajes verific\xE1ndose el correcto funcionamiento de sus dispositivos de cierre y bloqueo."
            },
            {
              letra: "b",
              texto: "Comprobar del mismo modo que la posici\xF3n de trabajo es adecuada al dise\xF1o del anclaje."
            }
          ]
        }
      ]
    },
    {
      codigo: "04",
      titulo: "Instalaci\xF3n el\xE9ctrica",
      norma_citada: null,
      puntos: [
        {
          codigo: "04.01",
          titulo: "Bater\xEDas (caja estanca, aireaci\xF3n y desconector)",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar visualmente el buen estado de las bater\xEDas, verificando que no presenten p\xE9rdidas de l\xEDquido ni sulfuraciones abundantes."
            },
            {
              letra: "b",
              texto: "Comprobar que todas las conexiones de las bater\xEDas se encuentran en buen estado."
            },
            {
              letra: "c",
              texto: "Comprobar bajo carga que las bater\xEDas dan su tensi\xF3n nominal."
            },
            {
              letra: "d",
              texto: "Comprobar la estanqueidad de la caja o local donde se encuentren las bater\xEDas, verific\xE1ndose la correcta sujeci\xF3n de las mismas."
            },
            {
              letra: "e",
              texto: "Comprobar que el sistema de aireaci\xF3n de la caja o local donde se encuentren las bater\xEDas es suficiente y adecuado atendiendo al n\xFAmero de bater\xEDas alojadas, y que la salida de dicha aireaci\xF3n se produce a una zona donde no se puedan producir acumulaci\xF3n de gases."
            },
            {
              letra: "f",
              texto: "Comprobar que las protecciones y seguridades en la fase de salida de las bater\xEDas hacia la instalaci\xF3n el\xE9ctrica del buque es la adecuada."
            },
            {
              letra: "g",
              texto: "Comprobar la existencia de un desconector del sistema as\xED como su buen funcionamiento."
            }
          ]
        },
        {
          codigo: "04.02",
          titulo: "Cableado, fusibles y empalmes",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar visualmente el buen estado del cableado el\xE9ctrico del buque, observando si en alg\xFAn punto existen cables pelados, zonas de recalentamiento de cables, rigidizaciones por exceso de corriente, o cualquier otro defecto que haga prever posibles riesgos de cortocircuito o fallo de corriente el\xE9ctrica."
            },
            {
              letra: "b",
              texto: "Si fuera conveniente, y en los casos que se considere necesario, comprobar la continuidad de los cables y su posible derivaci\xF3n a tierra si no debiera de estar conectado a ella."
            },
            {
              letra: "c",
              texto: "Comprobar que ning\xFAn cable o paso de cables de tensi\xF3n se encuentren en zonas donde est\xE9 previsto el almacenaje o paso sin las debidas protecciones de material inflamable o explosivo."
            },
            {
              letra: "d",
              texto: "Comprobar el estado y que las caracter\xEDsticas coincidan con las del proyecto de todos los fusibles que se consideren indispensables para el sistema de emergencia de la embarcaci\xF3n, as\xED como todos aquellos que se requieran para el uso normal de la embarcaci\xF3n."
            },
            {
              letra: "e",
              texto: "Comprobar los empalmes de cables, debiendo verificar que el tratamiento de dichos empalmes debe cumplir con los expuestos para cable completo, es decir, ning\xFAn empalme puede constituir discontinuidad o derivaci\xF3n del cable al que se encuentre asignado."
            }
          ]
        },
        {
          codigo: "04.03",
          titulo: "Enchufes estancos en cubierta",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar visualmente el buen estado de los enchufes estancos en cubierta."
            },
            {
              letra: "b",
              texto: "Comprobar la estanqueidad de dichos enchufes."
            },
            {
              letra: "c",
              texto: "Comprobar que todos ellos disponen de las protecciones y seguridades acorde a las funciones a desempe\xF1ar y a sus especificaciones de funcionamiento, en particular en lo referente al consumo de dise\xF1o."
            },
            {
              letra: "d",
              texto: "Comprobar en ellos la llegada de la tensi\xF3n nominal requerida para su servicio."
            }
          ]
        },
        {
          codigo: "04.04",
          titulo: "Puesta a tierra de aparatos",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que todos los aparatos que dispongan de alimentaci\xF3n el\xE9ctrica se encuentran conectados a tierra, encontr\xE1ndose dicha conexi\xF3n en buen estado."
            },
            {
              letra: "b",
              texto: "En concreto comprobar la puesta a tierra de electrov\xE1lvulas, ventiladores, bombas, electrodom\xE9sticos, calentadores, etc."
            }
          ]
        },
        {
          codigo: "04.05",
          titulo: "Protecci\xF3n antipar\xE1sita de aparatos radioel\xE9ctricos",
          texto_residual: null,
          comprobaciones: [
            {
              letra: "a",
              texto: "Comprobar que todos los aparatos radioel\xE9ctricos de a bordo se encuentran debidamente protegidos antiparasitariamente, para ello se ver\xE1 que no sufren interferencias entre ellos al estar conectados y en funcionamiento a la vez, ni con un consumo de corriente el\xE9ctrica nominal del buque por la proximidad de cables."
            },
            {
              letra: "b",
              texto: "Comprobar que se han cumplido las recomendaciones del fabricante en este sentido."
            }
          ]
        }
      ]
    },
    {
      codigo: "05",
      titulo: "Equipo de radiocomunicaciones",
      norma_citada: null,
      puntos: [
        {
          codigo: "05.00",
          titulo: "Equipo de radiocomunicaciones",
          texto_residual: null,
          comprobaciones: []
        }
      ]
    },
    {
      codigo: "06",
      titulo: "Equipo de salvamento",
      norma_citada: null,
      puntos: [
        {
          codigo: "06.00",
          titulo: "Equipo de salvamento",
          texto_residual: null,
          comprobaciones: []
        }
      ]
    },
    {
      codigo: "07",
      titulo: "Equipo de contraincendios",
      norma_citada: null,
      puntos: [
        {
          codigo: "07.00",
          titulo: "Equipo de contraincendios",
          texto_residual: null,
          comprobaciones: []
        }
      ]
    },
    {
      codigo: "08",
      titulo: "Material n\xE1utico",
      norma_citada: null,
      puntos: [
        {
          codigo: "08.00",
          titulo: "Material n\xE1utico",
          texto_residual: null,
          comprobaciones: []
        }
      ]
    },
    {
      codigo: "09",
      titulo: "Luces de navegaci\xF3n",
      norma_citada: null,
      puntos: [
        {
          codigo: "09.00",
          titulo: "Luces de navegaci\xF3n",
          texto_residual: null,
          comprobaciones: []
        }
      ]
    },
    {
      codigo: "10",
      titulo: "Equipo de fondeo",
      norma_citada: null,
      puntos: [
        {
          codigo: "10.00",
          titulo: "Equipo de fondeo",
          texto_residual: null,
          comprobaciones: []
        }
      ]
    }
  ]
};

// src/datos/formulario-campos.json
var formulario_campos_default = {
  documento: "Versi\xF3n p\xFAblica \u2014 casillas del RD 1434/1999",
  version: "2026-09-14",
  organizacion: "RD 1434/1999 (BOE)",
  informe: {
    prefijo: "",
    campo: "numero_informe",
    etiqueta: "N\xBA de informe",
    tipo: "texto"
  },
  datos_embarcacion: [],
  tipos_reconocimiento: [
    {
      clave: "periodico",
      etiqueta: "Peri\xF3dico",
      tipo_normativo: "periodico",
      nota: "RD 1434/1999, art. 3.B)."
    },
    {
      clave: "intermedio",
      etiqueta: "Intermedio",
      tipo_normativo: "intermedio",
      nota: "RD 1434/1999, art. 3.C)."
    },
    {
      clave: "reparacion_modificacion",
      etiqueta: "Adicional \u2014 reparaci\xF3n o modificaci\xF3n",
      tipo_normativo: "adicional",
      suceso: "modificacion",
      nota: "RD 1434/1999, art. 3.D.a): reparaciones, modificaciones o alteraciones."
    },
    {
      clave: "cambio_lista",
      etiqueta: "Adicional \u2014 cambio de lista",
      tipo_normativo: "adicional",
      suceso: "cambio_lista",
      nota: "RD 1434/1999, art. 3.D.b)."
    },
    {
      clave: "adicional",
      etiqueta: "Adicional \u2014 varada, abordaje o aver\xEDa",
      tipo_normativo: "adicional",
      nota: "RD 1434/1999, art. 3.D.c). El suceso se anota en el expediente."
    },
    {
      clave: "extraordinario",
      etiqueta: "Extraordinario",
      tipo_normativo: "extraordinario",
      nota: "RD 1434/1999, art. 3.E)."
    },
    {
      clave: "renovacion",
      etiqueta: "Renovaci\xF3n del certificado",
      tipo_normativo: "periodico",
      nota: "Reconocimiento con visita que abre un nuevo per\xEDodo de vigencia."
    },
    {
      clave: "abanderamiento",
      etiqueta: "Abanderamiento",
      tipo_normativo: "adicional",
      nota: "No lo cita el RD 1434/1999; se lleva a adicional (art. 3.D). A confirmar."
    },
    {
      clave: "cambio_categoria",
      etiqueta: "Cambio de categor\xEDa",
      tipo_normativo: "adicional",
      suceso: "modificacion",
      nota: "Modificaci\xF3n de las condiciones: adicional (art. 3.D.a). A confirmar."
    },
    {
      clave: "otros",
      etiqueta: "Otros",
      tipo_normativo: null,
      tipo_libre: true
    }
  ],
  visitas: {
    columnas: [
      {
        clave: "v1",
        etiqueta: "Primera visita",
        abreviatura: "1\xAA"
      },
      {
        clave: "v2",
        etiqueta: "Segunda visita",
        abreviatura: "2\xAA"
      },
      {
        clave: "r2",
        etiqueta: "Reinspecci\xF3n (art. 10.2.\xBA)",
        abreviatura: "R"
      }
    ],
    campos: [
      {
        campo: "fecha",
        etiqueta: "Fecha",
        tipo: "fecha"
      },
      {
        campo: "lugar",
        etiqueta: "Lugar",
        tipo: "texto"
      },
      {
        campo: "condicion",
        etiqueta: "Condici\xF3n",
        tipo: "opcion",
        valores: [
          "Seco",
          "A flote"
        ]
      },
      {
        campo: "refrendo",
        etiqueta: "Firma del inspector",
        tipo: "texto"
      }
    ]
  },
  campos_por_punto: {},
  equipos_medida: [],
  cierre: []
};

// src/datos/pautas.json
var pautas_default = [
  {
    id: "honda-bf8d-bf20d",
    fabricante: "Honda",
    documento: "Honda Motor Co., Owner's Manual BF8D/BF9.9D/BF10D/BF15D/BF20D, \xA9 2020",
    tabla: "Maintenance Schedule, pp. 112-113",
    aplicaA: {
      tipo: "fueraborda",
      marca: "Honda",
      modelos: [
        "BF8D",
        "BF9.9D",
        "BF10D",
        "BF15D",
        "BF20D"
      ]
    },
    advertencia: "El manual advierte (nota 3 de la tabla, pp. 112-113) que en uso profesional o comercial se registren las horas de funcionamiento para fijar los intervalos adecuados.",
    tareas: [
      {
        id: "honda-bf-aceite-motor",
        sistema: "Lubricaci\xF3n",
        tarea: "Cambiar el aceite del motor",
        accion: "sustituir",
        primeraVez: {
          horas: 20,
          meses: 1
        },
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 112, \xABEngine oil \u2014 Change\xBB; intervalo confirmado en p. 114"
      },
      {
        id: "honda-bf-filtro-aceite",
        sistema: "Lubricaci\xF3n",
        tarea: "Sustituir el filtro de aceite del motor",
        accion: "sustituir",
        taller: "recomendado",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 112, \xABEngine oil filter \u2014 Replace\xBB (nota 2)"
      },
      {
        id: "honda-bf-aceite-cola",
        sistema: "Lubricaci\xF3n",
        tarea: "Cambiar el aceite de la cola (caja de engranajes)",
        accion: "sustituir",
        primeraVez: {
          horas: 20,
          meses: 1
        },
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 112, \xABGear case oil \u2014 Change\xBB; intervalo confirmado en p. 116"
      },
      {
        id: "honda-bf-engrase",
        sistema: "Lubricaci\xF3n",
        tarea: "Engrasar con grasa anticorrosi\xF3n marina los puntos de engrase",
        accion: "revisar",
        primeraVez: {
          horas: 20,
          meses: 1
        },
        cada: {
          horas: 100,
          meses: 6
        },
        notas: "El manual pide engrasar con m\xE1s frecuencia si se usa en agua salada (nota 1).",
        fuente: "p. 112, \xABLubrication \u2014 Grease\xBB (nota 1); puntos de engrase en p. 121"
      },
      {
        id: "honda-bf-correa-distribucion",
        sistema: "Motor",
        tarea: "Revisar la correa de distribuci\xF3n",
        accion: "revisar",
        taller: "recomendado",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 112, \xABTiming belt \u2014 Check\xBB (nota 2)"
      },
      {
        id: "honda-bf-valvulas",
        sistema: "Motor",
        tarea: "Comprobar y ajustar la holgura de v\xE1lvulas",
        accion: "revisar",
        taller: "recomendado",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 112, \xABValve clearance \u2014 Check-adjust\xBB (nota 2)"
      },
      {
        id: "honda-bf-bujias",
        sistema: "Encendido",
        tarea: "Sustituir las buj\xEDas",
        accion: "sustituir",
        cada: {
          horas: 100,
          meses: 6
        },
        notas: "La tabla dice \xABCheck-adjust/Replace\xBB; la p. 117 fija la sustituci\xF3n a este mismo intervalo.",
        fuente: "p. 112, \xABSpark plugs \u2014 Check-adjust/Replace\xBB; sustituci\xF3n en p. 117"
      },
      {
        id: "honda-bf-cuerda-arranque",
        sistema: "Motor",
        tarea: "Revisar la cuerda de arranque",
        accion: "revisar",
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 112, \xABStarter rope \u2014 Check\xBB"
      },
      {
        id: "honda-bf-varillaje-carburador",
        sistema: "Combustible",
        tarea: "Comprobar y ajustar el varillaje del carburador",
        accion: "revisar",
        taller: "recomendado",
        primeraVez: {
          horas: 20,
          meses: 1
        },
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 112, \xABCarburetor linkage \u2014 Check-adjust\xBB (nota 2)"
      },
      {
        id: "honda-bf-ralenti",
        sistema: "Combustible",
        tarea: "Comprobar y ajustar el r\xE9gimen de ralent\xED",
        accion: "revisar",
        taller: "recomendado",
        primeraVez: {
          horas: 20,
          meses: 1
        },
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 112, \xABIdling speed \u2014 Check-adjust\xBB (nota 2)"
      },
      {
        id: "honda-bf-deposito",
        sistema: "Combustible",
        tarea: "Limpiar el dep\xF3sito de combustible y su filtro",
        accion: "revisar",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 112, \xABFuel tank and tank filter \u2014 Clean\xBB; procedimiento en p. 125"
      },
      {
        id: "honda-bf-filtro-combustible-revisar",
        sistema: "Combustible",
        tarea: "Revisar el filtro de combustible",
        accion: "revisar",
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 112, \xABFuel filter \u2014 Check\xBB; intervalo confirmado en p. 122"
      },
      {
        id: "honda-bf-filtro-combustible-sustituir",
        sistema: "Combustible",
        tarea: "Sustituir el filtro de combustible",
        accion: "sustituir",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 112, \xABFuel filter \u2014 Replace\xBB; intervalo confirmado en p. 122"
      },
      {
        id: "honda-bf-tubo-combustible",
        sistema: "Combustible",
        tarea: "Sustituir el tubo de combustible si es necesario",
        accion: "sustituir",
        taller: "recomendado",
        cada: {
          meses: 24
        },
        notas: "Seg\xFAn la nota 9, se sustituye si hay fugas, grietas o da\xF1os.",
        fuente: "p. 113, \xABFuel line \u2014 Replace: Every 2 years (If necessary)\xBB (notas 2 y 9)"
      },
      {
        id: "honda-bf-termostato",
        sistema: "Refrigeraci\xF3n",
        tarea: "Revisar el termostato",
        accion: "revisar",
        taller: "recomendado",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 112, \xABThermostat \u2014 Check\xBB (nota 2)"
      },
      {
        id: "honda-bf-bomba-agua",
        sistema: "Refrigeraci\xF3n",
        tarea: "Revisar la bomba de agua",
        accion: "revisar",
        taller: "recomendado",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 113, \xABWater pump \u2014 Check\xBB (nota 2)"
      },
      {
        id: "honda-bf-anodo-interior",
        sistema: "Refrigeraci\xF3n",
        tarea: "Revisar el \xE1nodo interior del motor",
        accion: "revisar",
        taller: "recomendado",
        cada: {
          horas: 400,
          meses: 24
        },
        notas: "Seg\xFAn la nota 6, se sustituye cuando ha perdido unos dos tercios de su tama\xF1o o se desmorona.",
        fuente: "p. 112, \xABAnode (Inside engine) \u2014 Check\xBB (notas 2 y 6)"
      },
      {
        id: "honda-bf-tornilleria",
        sistema: "Otros",
        tarea: "Comprobar el apriete de tornillos y tuercas",
        accion: "revisar",
        taller: "recomendado",
        primeraVez: {
          horas: 20,
          meses: 1
        },
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 113, \xABBolts and Nuts \u2014 Check-tightness\xBB (nota 2)"
      },
      {
        id: "honda-bf-respiradero",
        sistema: "Motor",
        tarea: "Revisar el tubo del respiradero del c\xE1rter",
        accion: "revisar",
        taller: "recomendado",
        cada: {
          horas: 200,
          meses: 12
        },
        fuente: "p. 113, \xABCrankcase breather tube \u2014 Check\xBB (nota 2)"
      },
      {
        id: "honda-bf-cable-cambio",
        sistema: "Otros",
        tarea: "Comprobar y ajustar el cable del cambio",
        accion: "revisar",
        taller: "recomendado",
        cada: {
          horas: 100,
          meses: 6
        },
        notas: "Seg\xFAn la nota 7, si se cambia de marcha a menudo el manual recomienda sustituir el cable hacia los tres a\xF1os. \xABA menudo\xBB no es un intervalo y no se calcula.",
        fuente: "p. 113, \xABShift cable \u2014 Check-adjust\xBB (notas 2 y 7)"
      },
      {
        id: "honda-bf-trim",
        sistema: "Otros",
        tarea: "Revisar el trim e inclinaci\xF3n el\xE9ctricos",
        accion: "revisar",
        taller: "recomendado",
        soloSi: {
          equipamiento: "trim_electrico"
        },
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 113, \xABPower Trim/Tilt \u2014 Check\xBB (nota 2)"
      }
    ]
  },
  {
    id: "yanmar-ym",
    fabricante: "Yanmar",
    documento: "Yanmar Marine International, YM Series Operation Manual, \xA9 2009",
    tabla: "Periodic Maintenance Schedule, pp. 50-53",
    aplicaA: {
      tipo: "motor_intraborda_diesel",
      marca: "Yanmar",
      modelos: [
        "2YM15",
        "3YM20",
        "3YM30"
      ]
    },
    advertencia: "El manual advierte (p. 50) que estos intervalos var\xEDan seg\xFAn el uso del motor, las cargas, el combustible y el aceite empleados, y que deben tratarse como una gu\xEDa general sobre la que establecer el plan de cada motor.",
    tareas: [
      {
        id: "yanmar-ym-purga-deposito",
        sistema: "Combustible",
        tarea: "Purgar agua y sedimentos del dep\xF3sito de combustible",
        accion: "revisar",
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 51, Fuel System \u2014 \xABDrain water and sediment from the fuel tank\xBB"
      },
      {
        id: "yanmar-ym-separador-agua",
        sistema: "Combustible",
        tarea: "Purgar el separador de agua del combustible",
        accion: "revisar",
        cada: {
          horas: 50,
          meses: 1
        },
        fuente: "p. 51, Fuel System \u2014 \xABDrain the fuel / water separator\xBB"
      },
      {
        id: "yanmar-ym-filtro-combustible",
        sistema: "Combustible",
        tarea: "Sustituir el elemento del filtro de combustible",
        accion: "sustituir",
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 51, Fuel System \u2014 \xABReplace the fuel filter element\xBB"
      },
      {
        id: "yanmar-ym-calado-inyeccion",
        sistema: "Combustible",
        tarea: "Comprobar el calado de la inyecci\xF3n",
        accion: "revisar",
        taller: "oficial",
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 51, Fuel System \u2014 \xABCheck the fuel injection timing\xBB"
      },
      {
        id: "yanmar-ym-inyectores",
        sistema: "Combustible",
        tarea: "Comprobar el patr\xF3n de pulverizaci\xF3n de los inyectores",
        accion: "revisar",
        taller: "oficial",
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 51, Fuel System \u2014 \xABCheck the fuel injector spray pattern\xBB"
      },
      {
        id: "yanmar-ym-aceite-motor",
        sistema: "Lubricaci\xF3n",
        tarea: "Cambiar el aceite del motor",
        accion: "sustituir",
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 150,
          meses: 12
        },
        fuente: "p. 51, Lubricating System \u2014 \xABReplace the engine oil \u2014 Engine\xBB"
      },
      {
        id: "yanmar-ym-aceite-inversor",
        sistema: "Lubricaci\xF3n",
        tarea: "Cambiar el aceite del inversor",
        accion: "sustituir",
        soloSi: {
          transmision: "inversor"
        },
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 51, Lubricating System \u2014 \xABReplace the engine oil \u2014 Marine Gear\xBB"
      },
      {
        id: "yanmar-ym-aceite-saildrive",
        sistema: "Lubricaci\xF3n",
        tarea: "Cambiar el aceite de la cola saildrive",
        accion: "sustituir",
        soloSi: {
          transmision: "saildrive"
        },
        cada: {
          horas: 100,
          meses: 6
        },
        fuente: "p. 51, Lubricating System \u2014 \xABReplace the engine oil \u2014 Sail Drive\xBB"
      },
      {
        id: "yanmar-ym-filtro-aceite",
        sistema: "Lubricaci\xF3n",
        tarea: "Sustituir el filtro de aceite del motor",
        accion: "sustituir",
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 51, Lubricating System \u2014 \xABReplace the oil filter element \u2014 Engine\xBB"
      },
      {
        id: "yanmar-ym-impulsor-revisar",
        sistema: "Refrigeraci\xF3n",
        tarea: "Revisar el impulsor de la bomba de agua salada",
        accion: "revisar",
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 52, Cooling System \u2014 \xABCheck or replace the seawater pump impeller\xBB (\u25CB)"
      },
      {
        id: "yanmar-ym-impulsor-sustituir",
        sistema: "Refrigeraci\xF3n",
        tarea: "Sustituir el impulsor de la bomba de agua salada",
        accion: "sustituir",
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 52, Cooling System \u2014 \xABCheck or replace the seawater pump impeller\xBB (\u25C7)"
      },
      {
        id: "yanmar-ym-refrigerante",
        sistema: "Refrigeraci\xF3n",
        tarea: "Sustituir el refrigerante",
        accion: "sustituir",
        cada: {
          meses: 12
        },
        notas: "Con refrigerante de larga duraci\xF3n (LLC), cada dos a\xF1os seg\xFAn el mismo manual.",
        fuente: "p. 52, Cooling System \u2014 \xABReplace coolant: every year\xBB"
      },
      {
        id: "yanmar-ym-circuito-agua-salada",
        sistema: "Refrigeraci\xF3n",
        tarea: "Limpiar y revisar los conductos de agua salada",
        accion: "revisar",
        taller: "oficial",
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 52, Cooling System \u2014 \xABClean and check the seawater passages\xBB"
      },
      {
        id: "yanmar-ym-silenciador-admision",
        sistema: "Admisi\xF3n y escape",
        tarea: "Limpiar el elemento del silenciador de admisi\xF3n",
        accion: "revisar",
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 52, Air Intake and Exhaust System \u2014 \xABClean the intake silencer element\xBB"
      },
      {
        id: "yanmar-ym-codo-escape",
        sistema: "Admisi\xF3n y escape",
        tarea: "Limpiar o sustituir el codo de mezcla de escape",
        accion: "revisar",
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 52, Air Intake and Exhaust System \u2014 \xABClean or replace the exhaust / water mixing elbow\xBB"
      },
      {
        id: "yanmar-ym-respiradero",
        sistema: "Admisi\xF3n y escape",
        tarea: "Limpiar el tubo del respiradero",
        accion: "revisar",
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 52, Air Intake and Exhaust System \u2014 \xABClean the breather pipe\xBB"
      },
      {
        id: "yanmar-ym-diafragma",
        sistema: "Admisi\xF3n y escape",
        tarea: "Revisar el conjunto del diafragma",
        accion: "revisar",
        taller: "oficial",
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 52, Air Intake and Exhaust System \u2014 \xABCheck diaphragm assembly\xBB"
      },
      {
        id: "yanmar-ym-electrolito",
        sistema: "El\xE9ctrico",
        tarea: "Comprobar el nivel de electrolito de la bater\xEDa",
        accion: "revisar",
        cada: {
          horas: 50,
          meses: 1
        },
        fuente: "p. 52, Electrical System \u2014 \xABCheck the electrolyte level in the battery\xBB"
      },
      {
        id: "yanmar-ym-correa-tension",
        sistema: "El\xE9ctrico",
        tarea: "Ajustar la tensi\xF3n de la correa del alternador",
        accion: "revisar",
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 52, Electrical System \u2014 \xABAdjust the tension of the alternator V-belt\xBB (\u25CB)"
      },
      {
        id: "yanmar-ym-correa-sustituir",
        sistema: "El\xE9ctrico",
        tarea: "Sustituir la correa del alternador",
        accion: "sustituir",
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 52, Electrical System \u2014 \xABAdjust the tension of the alternator V-belt or replace V-belt\xBB (\u25C7)"
      },
      {
        id: "yanmar-ym-conexiones",
        sistema: "El\xE9ctrico",
        tarea: "Revisar los conectores del cableado",
        accion: "revisar",
        cada: {
          horas: 250,
          meses: 12
        },
        fuente: "p. 52, Electrical System \u2014 \xABCheck the wiring connectors\xBB"
      },
      {
        id: "yanmar-ym-aprietes",
        sistema: "Culata y bloque",
        tarea: "Reapretar la torniller\xEDa principal",
        accion: "revisar",
        taller: "oficial",
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 53, Engine Cylinder Head and Block \u2014 \xABTighten all major nuts and bolts\xBB"
      },
      {
        id: "yanmar-ym-valvulas",
        sistema: "Culata y bloque",
        tarea: "Ajustar el reglaje de v\xE1lvulas de admisi\xF3n y escape",
        accion: "revisar",
        taller: "oficial",
        tallerPrimeraVez: "no",
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 53, Engine Cylinder Head and Block \u2014 \xABAdjust intake / exhaust valve clearance\xBB"
      },
      {
        id: "yanmar-ym-cables-mando",
        sistema: "Otros",
        tarea: "Revisar los cables del mando a distancia",
        accion: "revisar",
        taller: "oficial",
        tallerPrimeraVez: "no",
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 53, Miscellaneous Items \u2014 \xABCheck the remote control cables\xBB"
      },
      {
        id: "yanmar-ym-alineacion-eje",
        sistema: "Otros",
        tarea: "Ajustar la alineaci\xF3n del eje de la h\xE9lice",
        accion: "revisar",
        taller: "oficial",
        tallerPrimeraVez: "no",
        primeraVez: {
          horas: 50
        },
        cada: {
          horas: 1e3,
          meses: 48
        },
        fuente: "p. 53, Miscellaneous Items \u2014 \xABAdjust the propeller shaft alignment\xBB"
      }
    ]
  }
];

// src/datos/analisis.json
var analisis_default = [
  {
    id: "velero-intraborda",
    titulo: "AMFE de un velero de crucero con motor intraborda di\xE9sel",
    embarcacion: "Velero de crucero de 11 m de eslora, casco de PRFV, lista 7.\xAA, motor intraborda di\xE9sel Yanmar 3YM30 (22,1 kW) con eje, inversor y prensaestopas, 12 V con bater\xEDas de arranque y de servicio, cocina de gas y aparejo de balandro.",
    aplicaA: {
      tipoComponente: "motor_intraborda_diesel"
    },
    fuentes: [
      {
        clave: "yanmar-ym",
        referencia: "YANMAR MARINE INTERNATIONAL, 2009. YM Series Operation Manual (2YM15, 3YM20, 3YM30). P/N 0AYMM-G00200. Periodic Maintenance Schedule, pp. 50-53."
      },
      {
        clave: "boatus-2014",
        referencia: "LEONARD, Beth, 2014. Keeping Your Boat Afloat. BoatUS Magazine / Seaworthy [en l\xEDnea]. Abril 2014. Alexandria (VA): Boat Owners Association of The United States. [Consulta: 2026-09-14].",
        url: "https://www.boatus.com/expert-advice/expert-advice-archive/2014/april/keeping-your-boat-afloat"
      },
      {
        clave: "boatus-mantenimiento",
        referencia: "BOATUS FOUNDATION FOR BOATING SAFETY AND CLEAN WATER, [s. f.]. Preventative Maintenance. En: Online Boating Safety Course \u2013 Study Guide [en l\xEDnea]. Annapolis (MD): BoatUS Foundation. [Consulta: 2026-09-14].",
        url: "https://www.boatus.org/study-guide/boat/maintenance/"
      },
      {
        clave: "boatus-incendios-2021",
        referencia: "CORKE, Mark, 2021. Analyzing Onboard Fire Claims. BoatUS Magazine [en l\xEDnea]. Febrero 2021. Alexandria (VA): Boat Owners Association of The United States. [Consulta: 2026-09-14].",
        url: "https://www.boatus.com/expert-advice/expert-advice-archive/2021/february/analyzing-onboard-fire-claims"
      },
      {
        clave: "boatus-remolques-2019",
        referencia: "FORT, Charles, 2019. Boat Towing Claims Analysis. BoatUS Magazine [en l\xEDnea]. Febrero 2019. Alexandria (VA): Boat Owners Association of The United States. [Consulta: 2026-09-14]. Cifras le\xEDdas del gr\xE1fico, \xB11 punto.",
        url: "https://www.boatus.com/expert-advice/expert-advice-archive/2019/february/boat-towing-claims-analysis"
      },
      {
        clave: "uscg-2024",
        referencia: "UNITED STATES COAST GUARD, 2025. 2024 Recreational Boating Statistics. COMDTPUB P16754.38. Washington, DC: U.S. Department of Homeland Security. Tablas 5, 6 y 16. [Consulta: 2026-09-14].",
        url: "https://www.uscgboating.org/library/accident-statistics/Recreational-Boating-Statistics-2024.pdf"
      },
      {
        clave: "sasemar-averia-motor",
        referencia: "SOCIEDAD DE SALVAMENTO Y SEGURIDAD MAR\xCDTIMA, [s. f.]. Aver\xEDa del motor. En: Mejora tu seguridad [en l\xEDnea]. Madrid: SASEMAR. [Consulta: 2026-09-14].",
        url: "https://www.salvamentomaritimo.es/mejora-tu-seguridad/actuar-en-emergencias/averia-del-motor"
      },
      {
        clave: "ciaim-2024",
        referencia: "COMISI\xD3N PERMANENTE DE INVESTIGACI\xD3N DE ACCIDENTES E INCIDENTES MAR\xCDTIMOS, 2025. Memoria anual 2024. Madrid: Ministerio de Transportes y Movilidad Sostenible. Tabla 7 (pesqueros a la deriva, 2016-2024; se usa por analog\xEDa). [Consulta: 2026-09-14].",
        url: "https://www.transportes.gob.es/recursos_mfom/comodin/recursos/ciaim_informe_anual_2024_web.pdf"
      },
      {
        clave: "seastart-2024",
        referencia: "KAVANAGH, Jake, 2024. 5 top causes of boat engine failure \u2013 and how to avoid them. Practical Boat Owner [en l\xEDnea]. 13 ago 2024, act. 25 mar 2025. Orden cualitativo del servicio de asistencia Sea Start. [Consulta: 2026-09-14].",
        url: "https://www.pbo.co.uk/expert-advice/10-top-causes-of-engine-breakdown-and-how-to-avoid-them-27876"
      }
    ],
    modos: [
      {
        id: "casco-valvula-rotura",
        sistema: "Casco y estanqueidad",
        subsistema: "Pasacascos y v\xE1lvulas de fondo",
        elemento: "V\xE1lvula de fondo y pasacasco bajo la flotaci\xF3n",
        funcion: "Dejar pasar agua de mar solo cuando se abre, sin fugas por el cuerpo ni por la uni\xF3n al casco",
        modo: "Rotura del cuerpo o del pasacasco",
        causa: "Corrosi\xF3n del lat\xF3n por descincificaci\xF3n o corrosi\xF3n galv\xE1nica; esfuerzo sobre la v\xE1lvula (se usa de apoyo)",
        efecto: "V\xEDa de agua por debajo de la flotaci\xF3n. En puerto, sin nadie a bordo, hunde el barco",
        severidad: 5,
        anclaSeveridad: "Anexo III, letra a) \u2014 estanqueidad",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "boatus-2014",
          "boatus-mantenimiento"
        ],
        notaOcurrencia: "Los accesorios bajo la flotaci\xF3n est\xE1n entre las diez causas de hundimiento por mantenimiento (BoatUS, 2014) y por ellos entra el agua en la mitad de los hundimientos en el amarre (BoatUS Foundation).",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Inspeccionar v\xE1lvulas de fondo y pasacascos en seco (material, corrosi\xF3n, color rosado del lat\xF3n, fijaci\xF3n), y sustituir las que no sean de bronce o lat\xF3n resistente a la descincificaci\xF3n",
          cada: {
            meses: 12
          },
          justificacion: "Intervalo: una varada al a\xF1o, que es cuando se puede ver el pasacasco por fuera. La norma ISO 9093 exige materiales resistentes a la corrosi\xF3n en los pasacascos; el reconocimiento los mira cada cinco a\xF1os."
        },
        cubiertoPor: {
          anexoII: [
            "1.4",
            "1.5",
            "2.4"
          ]
        }
      },
      {
        id: "casco-valvula-agarrotada",
        sistema: "Casco y estanqueidad",
        subsistema: "Pasacascos y v\xE1lvulas de fondo",
        elemento: "V\xE1lvula de fondo",
        funcion: "Poder cortar la entrada de agua cuando falla lo que hay detr\xE1s (una manguera, una bomba)",
        modo: "No cierra (agarrotada o con la maneta rota)",
        causa: "Incrustaciones y corrosi\xF3n por no accionarla nunca",
        efecto: "Si revienta una manguera, no se puede cortar la v\xEDa de agua",
        severidad: 5,
        anclaSeveridad: "Anexo III, letra a) \u2014 estanqueidad",
        ocurrencia: 3,
        fuentesOcurrencia: [
          "boatus-mantenimiento"
        ],
        notaOcurrencia: "Indirecta: en 7 de 40 hundimientos de invierno analizados, un grifo de fondo que estaba abierto contribuy\xF3 al hundimiento (BoatUS Foundation). No hay cifra del grifo que no cierra.",
        deteccion: "oculto",
        tarea: {
          tipo: "busqueda",
          descripcion: "Abrir y cerrar del todo cada v\xE1lvula de fondo",
          cada: {
            meses: 3
          },
          justificacion: "Funci\xF3n oculta: el barco funciona igual con la v\xE1lvula agarrotada hasta el d\xEDa en que hay que cerrarla. Intervalo: trimestral, juicio del autor \u2014 lo bastante frecuente para que no se agarrote entre dos pruebas y compatible con el uso de un barco de recreo."
        },
        cubiertoPor: {
          anexoII: [
            "1.5",
            "2.4"
          ]
        }
      },
      {
        id: "casco-manguera-bajo-flotacion",
        sistema: "Casco y estanqueidad",
        subsistema: "Pasacascos y v\xE1lvulas de fondo",
        elemento: "Mangueras y abrazaderas conectadas a tomas bajo la flotaci\xF3n",
        funcion: "Conducir el agua de la toma a su destino sin fugas",
        modo: "Rotura de la manguera o fallo de la abrazadera",
        causa: "Envejecimiento del caucho, abrazadera corro\xEDda, una sola abrazadera donde hacen falta dos",
        efecto: "V\xEDa de agua con la v\xE1lvula abierta; es la situaci\xF3n normal con el motor en marcha",
        severidad: 5,
        anclaSeveridad: "Anexo III, letra a) \u2014 estanqueidad",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "boatus-2014",
          "boatus-mantenimiento"
        ],
        notaOcurrencia: "Mangueras y abrazaderas figuran entre los puntos de entrada en los hundimientos en el amarre y entre las diez causas de mantenimiento (BoatUS).",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar mangueras y abrazaderas de toda toma bajo la flotaci\xF3n (grietas, rigidez, doble abrazadera de inoxidable)",
          cada: {
            meses: 12
          },
          justificacion: "Intervalo anual, juicio del autor: el caucho se degrada con los a\xF1os y la inspecci\xF3n visual detecta grietas y endurecimiento con margen."
        },
        cubiertoPor: {
          anexoII: [
            "1.4",
            "2.5"
          ]
        }
      },
      {
        id: "casco-desague-banera",
        sistema: "Casco y estanqueidad",
        subsistema: "Desag\xFCes de ba\xF1era",
        elemento: "Imbornales y mangueras de desag\xFCe de la ba\xF1era",
        funcion: "Evacuar al mar el agua que embarca la ba\xF1era",
        modo: "Desag\xFCe obstruido o manguera de desag\xFCe rota",
        causa: "Hojas y suciedad; manguera envejecida",
        efecto: "La ba\xF1era se llena; con la manguera rota, el agua pasa al interior del casco",
        severidad: 5,
        anclaSeveridad: "Anexo III, letra a) \u2014 estanqueidad",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "boatus-2014",
          "boatus-mantenimiento"
        ],
        notaOcurrencia: "Los desag\xFCes de ba\xF1era est\xE1n entre las diez causas de hundimiento por mantenimiento; la lluvia o la nieve en ba\xF1eras autoachicables supone el 32 % de las reclamaciones de hundimiento en EE. UU. (BoatUS). Se baja de 5 a 4 porque la nieve no aplica al Mediterr\xE1neo.",
        deteccion: "oculto",
        tarea: {
          tipo: "condicion",
          descripcion: "Comprobar que los imbornales desaguan y revisar sus mangueras",
          cada: {
            meses: 3
          },
          justificacion: "El desag\xFCe solo se pone a prueba con lluvia o mar embarcada, cuando no hay nadie mirando: funci\xF3n oculta. Intervalo trimestral, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "1.10"
          ]
        }
      },
      {
        id: "casco-laminado",
        sistema: "Casco y estanqueidad",
        subsistema: "Laminado",
        elemento: "Casco de PRFV bajo la flotaci\xF3n",
        funcion: "Mantener la resistencia y la estanqueidad del casco",
        modo: "\xD3smosis o deslaminaci\xF3n",
        causa: "Absorci\xF3n de agua por el gelcoat y el laminado con los a\xF1os",
        efecto: "P\xE9rdida progresiva de resistencia; rara vez un fallo s\xFAbito",
        severidad: 3,
        anclaSeveridad: "Deficiencia del casco (1.16), sin fallo s\xFAbito de estanqueidad",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: la \xF3smosis es un defecto frecuente en cascos viejos, pero no figura como causa de siniestro o de asistencia en ninguna de las fuentes consultadas.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Medir la humedad del laminado con higr\xF3metro en seco y buscar ampollas",
          cada: {
            meses: 24
          },
          justificacion: "Degradaci\xF3n lenta: una medida cada dos a\xF1os, en seco y tras unos d\xEDas fuera del agua, basta para ver la tendencia. Juicio del autor; el formulario de campo recoge ya el higr\xF3metro como equipo de medida."
        },
        cubiertoPor: {
          anexoII: [
            "1.16"
          ]
        }
      },
      {
        id: "prensaestopas-fuga",
        sistema: "Propulsi\xF3n",
        subsistema: "Transmisi\xF3n y l\xEDnea de ejes",
        elemento: "Prensaestopas y su manguito",
        funcion: "Dejar girar el eje sin que entre m\xE1s agua que el goteo previsto",
        modo: "Fuga excesiva o rotura del manguito del prensaestopas",
        causa: "Empaquetadura gastada o suelta; manguito de caucho envejecido; desalineaci\xF3n del eje",
        efecto: "V\xEDa de agua continua, t\xEDpica de barcos hundidos en su amarre",
        severidad: 5,
        anclaSeveridad: "Anexo III, letra a) \u2014 estanqueidad",
        ocurrencia: 5,
        fuentesOcurrencia: [
          "boatus-2014",
          "boatus-mantenimiento"
        ],
        notaOcurrencia: "Es el punto de entrada m\xE1s frecuente en los hundimientos en el amarre (BoatUS Foundation) y el segundo de las diez causas de hundimiento por mantenimiento (BoatUS, 2014).",
        deteccion: "evidente",
        soloSi: {
          transmision: "inversor"
        },
        tarea: {
          tipo: "condicion",
          descripcion: "Comprobar el goteo del prensaestopas con el eje girando y parado, y el estado del manguito y sus abrazaderas",
          cada: {
            meses: 1
          },
          justificacion: "La fuga crece de forma gradual y se ve antes de ser peligrosa, pero entre dos visitas al barco. Intervalo mensual, juicio del autor, ligado a que la sentina se revise en cada visita."
        },
        cubiertoPor: {
          anexoII: [
            "2.8"
          ]
        }
      },
      {
        id: "refrigeracion-impulsor",
        sistema: "Propulsi\xF3n",
        subsistema: "Refrigeraci\xF3n por agua de mar",
        elemento: "Impulsor de la bomba de agua de mar",
        funcion: "Hacer circular agua de mar por el intercambiador con el caudal necesario",
        modo: "Rotura o p\xE9rdida de aletas del impulsor",
        causa: "Envejecimiento del caucho; marcha en seco (toma cerrada o obstruida)",
        efecto: "Sobrecalentamiento y parada del motor; p\xE9rdida de propulsi\xF3n",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra e) \u2014 funcionamiento del motor",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "boatus-2014",
          "seastart-2024",
          "yanmar-ym"
        ],
        notaOcurrencia: "Est\xE1 entre las diez causas de hundimiento por mantenimiento (BoatUS, 2014) y el sobrecalentamiento es la segunda causa de aver\xEDa de motor que atiende Sea Start, por detr\xE1s del combustible.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar el impulsor y sustituirlo si tiene aletas agrietadas o deformadas",
          cada: {
            meses: 12,
            horas: 250
          },
          justificacion: "Intervalo del fabricante (Yanmar, p. 52)."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-impulsor-revisar",
            "yanmar-ym-impulsor-sustituir"
          ],
          anexoII: [
            "2.11"
          ]
        }
      },
      {
        id: "refrigeracion-filtro-toma",
        sistema: "Propulsi\xF3n",
        subsistema: "Refrigeraci\xF3n por agua de mar",
        elemento: "Toma y filtro de agua de mar",
        funcion: "Dejar pasar el agua de refrigeraci\xF3n limpia",
        modo: "Obstrucci\xF3n de la toma o del filtro",
        causa: "Algas, bolsas de pl\xE1stico, incrustaciones",
        efecto: "Sobrecalentamiento y parada; el impulsor trabaja en seco y se rompe",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra e) \u2014 funcionamiento del motor",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "seastart-2024",
          "sasemar-averia-motor"
        ],
        notaOcurrencia: "Sea Start sit\xFAa el filtro de agua de mar obstruido como primera causa del sobrecalentamiento, que es su segunda causa de aver\xEDa; Salvamento Mar\xEDtimo cita el sobrecalentamiento entre las causas principales de la parada de m\xE1quina.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar y limpiar el filtro de agua de mar; comprobar que sale agua por el escape al arrancar",
          cada: {
            meses: 1
          },
          justificacion: "El manual de Yanmar lo pone entre las comprobaciones diarias antes de arrancar, que el plan transcrito deja fuera por ser rutina de uso. Aqu\xED se recoge como tarea mensual m\xEDnima, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "2.11"
          ]
        }
      },
      {
        id: "refrigeracion-manguitos",
        sistema: "Propulsi\xF3n",
        subsistema: "Refrigeraci\xF3n por agua de mar",
        elemento: "Manguitos y abrazaderas del circuito de refrigeraci\xF3n",
        funcion: "Conducir el agua de refrigeraci\xF3n sin fugas",
        modo: "Rotura de un manguito o abrazadera",
        causa: "Envejecimiento t\xE9rmico del caucho, abrazaderas corro\xEDdas",
        efecto: "P\xE9rdida de refrigeraci\xF3n y parada; el manguito de aspiraci\xF3n roto es adem\xE1s una v\xEDa de agua",
        severidad: 5,
        anclaSeveridad: "Anexo III, letra a) \u2014 estanqueidad (lado de aspiraci\xF3n) y e)",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "boatus-2014"
        ],
        notaOcurrencia: "Las mangueras de agua de mar del motor son la tercera de las diez causas de hundimiento por mantenimiento (BoatUS, 2014).",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar los manguitos del circuito de refrigeraci\xF3n (grietas, endurecimiento, abrazaderas)",
          cada: {
            meses: 12
          },
          justificacion: "Anual, juicio del autor, con el mismo razonamiento que las mangueras bajo la flotaci\xF3n. El fabricante solo pide limpiar y revisar los conductos cada 1000 h o cuatro a\xF1os, por el servicio oficial."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-circuito-agua-salada"
          ],
          anexoII: [
            "2.5"
          ]
        }
      },
      {
        id: "escape-codo",
        sistema: "Propulsi\xF3n",
        subsistema: "Admisi\xF3n y escape",
        elemento: "Codo de mezcla del escape h\xFAmedo",
        funcion: "Mezclar el agua de refrigeraci\xF3n con los gases y evacuarlos",
        modo: "Obstrucci\xF3n o perforaci\xF3n por corrosi\xF3n del codo",
        causa: "Incrustaciones de sal y carbonilla; corrosi\xF3n del codo",
        efecto: "Contrapresi\xF3n y p\xE9rdida de potencia; agua que vuelve al cilindro; fuga de gases al interior",
        severidad: 4,
        anclaSeveridad: "Anexo III, letras e) y k)",
        ocurrencia: 2,
        fuentesOcurrencia: [
          "uscg-2024",
          "boatus-incendios-2021"
        ],
        notaOcurrencia: "El escape aparece en 4 de 289 incidentes por aver\xEDa de maquinaria (USCG, 2024); BoatUS atribuye los incendios de escape a la falta de agua de refrigeraci\xF3n, no al codo.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Limpiar o sustituir el codo de mezcla del escape",
          cada: {
            meses: 12,
            horas: 250
          },
          justificacion: "Intervalo del fabricante (Yanmar, p. 52)."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-codo-escape"
          ],
          anexoII: [
            "2.7"
          ]
        }
      },
      {
        id: "combustible-contaminacion",
        sistema: "Propulsi\xF3n",
        subsistema: "Combustible",
        elemento: "Dep\xF3sito, separador y filtro de combustible",
        funcion: "Suministrar gas\xF3leo limpio al sistema de inyecci\xF3n",
        modo: "Filtro colmatado por agua, lodos o crecimiento microbiano",
        causa: "Condensaci\xF3n en el dep\xF3sito, gas\xF3leo de mala calidad, dep\xF3sito que no se purga",
        efecto: "P\xE9rdida de potencia y parada del motor, a menudo con mala mar, cuando se agitan los lodos",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra e) \u2014 funcionamiento del motor",
        ocurrencia: 5,
        fuentesOcurrencia: [
          "seastart-2024",
          "sasemar-averia-motor"
        ],
        notaOcurrencia: "Es la primera causa de aver\xEDa de motor que atiende Sea Start, y Salvamento Mar\xEDtimo cita el filtro de combustible obstruido como causa principal de la parada de m\xE1quina.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Purgar el separador de agua; purgar el dep\xF3sito y sustituir el filtro de combustible seg\xFAn el fabricante",
          cada: {
            meses: 1,
            horas: 50
          },
          justificacion: "Intervalo del fabricante para el separador (Yanmar, p. 51: 50 h o un mes)."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-separador-agua",
            "yanmar-ym-filtro-combustible",
            "yanmar-ym-purga-deposito"
          ],
          anexoII: [
            "2.2",
            "2.6"
          ]
        }
      },
      {
        id: "combustible-fuga",
        sistema: "Propulsi\xF3n",
        subsistema: "Combustible",
        elemento: "Tuber\xEDas, mangueras y racores de combustible",
        funcion: "Conducir el combustible sin fugas",
        modo: "Fuga de combustible",
        causa: "Manguera envejecida, racor flojo por vibraci\xF3n, roce",
        efecto: "Riesgo de incendio en el compartimento del motor; parada por entrada de aire",
        severidad: 5,
        anclaSeveridad: "Riesgo de incendio",
        ocurrencia: 3,
        fuentesOcurrencia: [
          "boatus-incendios-2021",
          "uscg-2024"
        ],
        notaOcurrencia: "El combustible origina el 12 % de los incendios en reclamaciones de BoatUS (2015-2019); el sistema de combustible, 20 de 289 aver\xEDas de maquinaria (USCG, 2024).",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar tuber\xEDas, mangueras y racores de combustible (fugas, roces, estado del caucho)",
          cada: {
            meses: 12
          },
          justificacion: "Anual, juicio del autor. La norma ISO 10088 fija requisitos de las instalaciones de combustible de las embarcaciones peque\xF1as, no un intervalo de revisi\xF3n."
        },
        cubiertoPor: {
          anexoII: [
            "2.6"
          ]
        }
      },
      {
        id: "combustible-venteo",
        sistema: "Propulsi\xF3n",
        subsistema: "Combustible",
        elemento: "Venteo del dep\xF3sito",
        funcion: "Dejar entrar aire en el dep\xF3sito a medida que se consume combustible",
        modo: "Venteo obstruido",
        causa: "Insectos, sal, un tap\xF3n de gas\xF3leo en un tramo bajo",
        efecto: "Depresi\xF3n en el dep\xF3sito y parada del motor al cabo de un rato de marcha",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra e) \u2014 funcionamiento del motor",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura como causa en las fuentes consultadas.",
        deteccion: "oculto",
        tarea: {
          tipo: "busqueda",
          descripcion: "Comprobar que el venteo del dep\xF3sito est\xE1 libre (se oye entrar aire al abrir la boca de llenado)",
          cada: {
            meses: 12
          },
          justificacion: "El venteo obstruido no se nota hasta que el motor lleva un rato en marcha: funci\xF3n oculta. Anual, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "2.2"
          ]
        }
      },
      {
        id: "lubricacion-aceite",
        sistema: "Propulsi\xF3n",
        subsistema: "Lubricaci\xF3n",
        elemento: "Aceite del motor y filtro",
        funcion: "Lubricar el motor",
        modo: "Aceite degradado o nivel bajo",
        causa: "Cambio de aceite fuera de plazo; consumo o fuga no vigilados",
        efecto: "Desgaste acelerado; en el extremo, gripado y parada",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra e) \u2014 funcionamiento del motor",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura como causa separada en las fuentes; la categor\xEDa \xABmotor\xBB de USCG (143 de 289) no la distingue.",
        deteccion: "evidente",
        tarea: {
          tipo: "sustitucion",
          descripcion: "Cambiar el aceite y el filtro del motor",
          cada: {
            meses: 12,
            horas: 150
          },
          justificacion: "Intervalo del fabricante (Yanmar, p. 51)."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-aceite-motor",
            "yanmar-ym-filtro-aceite"
          ],
          anexoII: [
            "2.11"
          ]
        }
      },
      {
        id: "transmision-inversor",
        sistema: "Propulsi\xF3n",
        subsistema: "Transmisi\xF3n y l\xEDnea de ejes",
        elemento: "Inversor",
        funcion: "Transmitir el par al eje en avante y atr\xE1s",
        modo: "Patinaje o fallo del inversor",
        causa: "Aceite degradado o bajo; cable de mando desajustado",
        efecto: "P\xE9rdida de propulsi\xF3n o de marcha atr\xE1s en maniobra",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra e) \u2014 motor principal o sus auxiliares",
        ocurrencia: 3,
        fuentesOcurrencia: [
          "uscg-2024",
          "ciaim-2024"
        ],
        notaOcurrencia: "Cambio o inversor: 19 de 289 aver\xEDas de maquinaria (6,6 %, USCG 2024); reductora, 2,3 % de los pesqueros a la deriva (CIAIM, por analog\xEDa).",
        deteccion: "evidente",
        soloSi: {
          transmision: "inversor"
        },
        tarea: {
          tipo: "sustitucion",
          descripcion: "Cambiar el aceite del inversor y comprobar el cable del mando",
          cada: {
            meses: 12,
            horas: 250
          },
          justificacion: "Intervalo del fabricante (Yanmar, p. 51)."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-aceite-inversor"
          ],
          anexoII: [
            "2.10",
            "2.11"
          ]
        }
      },
      {
        id: "eje-alineacion-soportes",
        sistema: "Propulsi\xF3n",
        subsistema: "Transmisi\xF3n y l\xEDnea de ejes",
        elemento: "Soportes el\xE1sticos del motor y alineaci\xF3n del eje",
        funcion: "Mantener el motor fijo y el eje alineado",
        modo: "Desalineaci\xF3n por soportes degradados",
        causa: "Envejecimiento del caucho de los soportes, aprietes flojos",
        efecto: "Vibraci\xF3n, desgaste del cojinete y del prensaestopas, que empieza a gotear m\xE1s",
        severidad: 3,
        anclaSeveridad: "Degrada la l\xEDnea de ejes; efecto indirecto sobre la estanqueidad",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura como causa en las fuentes consultadas.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Comprobar la alineaci\xF3n del eje y el estado de los soportes del motor",
          cada: {
            meses: 48,
            horas: 1e3
          },
          justificacion: "Intervalo del fabricante (Yanmar, p. 53)."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-alineacion-eje",
            "yanmar-ym-aprietes"
          ],
          anexoII: [
            "2.9",
            "2.10"
          ]
        }
      },
      {
        id: "anodo-eje",
        sistema: "Propulsi\xF3n",
        subsistema: "Transmisi\xF3n y l\xEDnea de ejes",
        elemento: "\xC1nodo de sacrificio del eje",
        funcion: "Proteger eje y h\xE9lice de la corrosi\xF3n galv\xE1nica",
        modo: "\xC1nodo consumido",
        causa: "Consumo normal, m\xE1s r\xE1pido con corrientes par\xE1sitas en el puerto",
        efecto: "Corrosi\xF3n de la h\xE9lice y del eje",
        severidad: 3,
        anclaSeveridad: "Protecci\xF3n cat\xF3dica (1.15); da\xF1o material progresivo",
        ocurrencia: 3,
        fuentesOcurrencia: [
          "seastart-2024"
        ],
        notaOcurrencia: "La corrosi\xF3n es la quinta causa de aver\xEDa de motor que atiende Sea Start.",
        deteccion: "oculto",
        tarea: {
          tipo: "sustitucion",
          descripcion: "Sustituir el \xE1nodo del eje (y los del casco) en la varada",
          cada: {
            meses: 12
          },
          justificacion: "Anual, con la varada, que es cuando se puede. Si en la varada queda m\xE1s de la mitad, el intervalo se puede alargar: juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "1.15"
          ]
        }
      },
      {
        id: "arranque-bateria",
        sistema: "Instalaci\xF3n el\xE9ctrica",
        subsistema: "Bater\xEDas y carga",
        elemento: "Bater\xEDa de arranque",
        funcion: "Dar la corriente de arranque del motor",
        modo: "Bater\xEDa descargada o sulfatada",
        causa: "Descarga por consumos sin separar las bater\xEDas; envejecimiento; falta de carga en amarre",
        efecto: "El motor no arranca: sin propulsi\xF3n para entrar a puerto despu\xE9s de navegar a vela",
        severidad: 4,
        anclaSeveridad: "Anexo III, letras e) y j)",
        ocurrencia: 5,
        fuentesOcurrencia: [
          "boatus-remolques-2019",
          "seastart-2024"
        ],
        notaOcurrencia: "Bater\xEDa descargada: \u2248 8 % de los remolques, la causa concreta m\xE1s citada tras la aver\xEDa mec\xE1nica y la varada (BoatUS, 2019); tercera causa de aver\xEDa de Sea Start.",
        deteccion: "oculto",
        tarea: {
          tipo: "condicion",
          descripcion: "Medir la tensi\xF3n en reposo de las bater\xEDas y comprobar el electrolito si no son selladas",
          cada: {
            meses: 1,
            horas: 50
          },
          justificacion: "Intervalo del fabricante para el electrolito (Yanmar, p. 52: 50 h o un mes). La bater\xEDa de arranque solo se pone a prueba cuando se arranca: funci\xF3n oculta."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-electrolito"
          ],
          anexoII: [
            "4.1"
          ]
        }
      },
      {
        id: "alternador-correa",
        sistema: "Propulsi\xF3n",
        subsistema: "Arranque y carga",
        elemento: "Correa del alternador y de la bomba de agua dulce",
        funcion: "Arrastrar el alternador y la bomba del circuito cerrado",
        modo: "Rotura o patinaje de la correa",
        causa: "Desgaste, tensi\xF3n incorrecta",
        efecto: "Sin carga de bater\xEDas y, en el 3YM30, sin circulaci\xF3n del refrigerante: sobrecalentamiento",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra e) \u2014 funcionamiento del motor",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "seastart-2024"
        ],
        notaOcurrencia: "Las correas flojas son la cuarta causa de aver\xEDa de motor que atiende Sea Start.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Comprobar tensi\xF3n y estado de la correa; sustituirla seg\xFAn el fabricante",
          cada: {
            meses: 12,
            horas: 250
          },
          justificacion: "Intervalo del fabricante (Yanmar, p. 52)."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-correa-tension",
            "yanmar-ym-correa-sustituir"
          ],
          anexoII: [
            "2.11"
          ]
        }
      },
      {
        id: "achique-bomba-electrica",
        sistema: "Achique",
        subsistema: "Bombas",
        elemento: "Bomba de achique el\xE9ctrica",
        funcion: "Achicar autom\xE1ticamente el agua que entre en la sentina",
        modo: "La bomba no funciona",
        causa: "Motor quemado o gripado, conexi\xF3n corro\xEDda en la sentina, fusible fundido",
        efecto: "Una v\xEDa de agua peque\xF1a, que la bomba vencer\xEDa, hunde el barco en su amarre",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra f) \u2014 sistema de achique",
        ocurrencia: 2,
        fuentesOcurrencia: [
          "boatus-2014"
        ],
        notaOcurrencia: "BoatUS (2014) concluye que un barco bien dise\xF1ado no se hunde porque falle la bomba: el fallo de la bomba rara vez es la causa primera. Lo que la hace cr\xEDtica es que su fallo es oculto.",
        deteccion: "oculto",
        tarea: {
          tipo: "busqueda",
          descripcion: "Probar la bomba el\xE9ctrica en manual y en autom\xE1tico",
          cada: {
            meses: 1
          },
          justificacion: "Funci\xF3n oculta con severidad alta: prueba mensual, juicio del autor. La norma ISO 15083 fija los requisitos del sistema de achique, no un intervalo de prueba."
        },
        cubiertoPor: {
          anexoII: [
            "2.1"
          ]
        }
      },
      {
        id: "achique-interruptor-nivel",
        sistema: "Achique",
        subsistema: "Bombas",
        elemento: "Interruptor de nivel (flotador) de la bomba autom\xE1tica",
        funcion: "Poner en marcha la bomba cuando sube el agua",
        modo: "El flotador no act\xFAa",
        causa: "Agarrotado por suciedad o aceite de la sentina; contacto averiado",
        efecto: "La bomba nunca arranca sola; el barco se inunda con la bomba en perfecto estado",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra f) \u2014 sistema de achique",
        ocurrencia: 3,
        juicioOcurrencia: "Juicio del autor: fallo conocido en la pr\xE1ctica de mantenimiento, sin cifra en las fuentes consultadas.",
        deteccion: "oculto",
        tarea: {
          tipo: "busqueda",
          descripcion: "Levantar el flotador a mano y comprobar que arranca la bomba; limpiar su entorno",
          cada: {
            meses: 1
          },
          justificacion: "Funci\xF3n oculta: mensual, junto con la prueba de la bomba. Juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "2.1"
          ]
        }
      },
      {
        id: "achique-bomba-manual",
        sistema: "Achique",
        subsistema: "Bombas",
        elemento: "Bomba de achique manual",
        funcion: "Achicar sin corriente el\xE9ctrica",
        modo: "La bomba manual no aspira",
        causa: "Diafragma roto, v\xE1lvulas pegadas, palanca que no est\xE1 a bordo",
        efecto: "Sin medio de achique cuando fallan las bater\xEDas, que es cuando m\xE1s falta hace",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra f) \u2014 sistema de achique",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura en las fuentes consultadas.",
        deteccion: "oculto",
        tarea: {
          tipo: "busqueda",
          descripcion: "Accionar la bomba manual con agua en la sentina y comprobar que la palanca est\xE1 en su sitio",
          cada: {
            meses: 6
          },
          justificacion: "Funci\xF3n oculta, poco uso y desgaste lento: semestral, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "2.1"
          ]
        }
      },
      {
        id: "gobierno-transmision",
        sistema: "Gobierno",
        subsistema: "Transmisi\xF3n de la rueda",
        elemento: "Cables, poleas y cuadrante de la rueda",
        funcion: "Transmitir el giro de la rueda a la pala",
        modo: "Rotura o destensado del cable",
        causa: "Desgaste en las poleas, falta de tensi\xF3n, corrosi\xF3n",
        efecto: "P\xE9rdida de gobierno",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra d) \u2014 sistema de gobierno",
        ocurrencia: 3,
        fuentesOcurrencia: [
          "uscg-2024",
          "ciaim-2024"
        ],
        notaOcurrencia: "Gobierno: 30 de 289 aver\xEDas de maquinaria (10,4 %, USCG 2024) y 7,9 % de los pesqueros a la deriva (CIAIM, por analog\xEDa).",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar tensi\xF3n y desgaste de cables, poleas y cuadrante",
          cada: {
            meses: 12
          },
          justificacion: "El desgaste del cable se ve (hilos rotos) antes de la rotura. Anual, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "1.14"
          ]
        }
      },
      {
        id: "gobierno-emergencia",
        sistema: "Gobierno",
        subsistema: "Gobierno de emergencia",
        elemento: "Ca\xF1a de emergencia",
        funcion: "Gobernar cuando falla la transmisi\xF3n de la rueda",
        modo: "La ca\xF1a de emergencia no encaja o no est\xE1 a bordo",
        causa: "Nunca se ha probado; tapa de acceso bloqueada; ca\xF1a retirada",
        efecto: "Sin gobierno alternativo cuando falla el principal",
        severidad: 4,
        anclaSeveridad: "Anexo III, letra d) \u2014 sistema de gobierno",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura en las fuentes consultadas.",
        deteccion: "oculto",
        tarea: {
          tipo: "busqueda",
          descripcion: "Montar la ca\xF1a de emergencia y gobernar con ella",
          cada: {
            meses: 12
          },
          justificacion: "Funci\xF3n oculta: solo se sabe si sirve mont\xE1ndola. Anual, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "1.14"
          ]
        }
      },
      {
        id: "gobierno-mecha",
        sistema: "Gobierno",
        subsistema: "Tim\xF3n",
        elemento: "Mecha, bocina y cojinetes del tim\xF3n",
        funcion: "Sostener la pala y dejarla girar sin holgura",
        modo: "Holgura excesiva o grieta en la mecha",
        causa: "Desgaste de cojinetes, corrosi\xF3n, golpes con el fondo",
        efecto: "P\xE9rdida del tim\xF3n; entrada de agua por la bocina",
        severidad: 5,
        anclaSeveridad: "Anexo III, letras a) y d)",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: dentro de la categor\xEDa \xABgobierno\xBB de USCG y CIAIM, sin cifra propia.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Medir la holgura de la pala y revisar mecha y bocina en seco",
          cada: {
            meses: 12
          },
          justificacion: "Con la varada anual. Juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "1.14"
          ]
        }
      },
      {
        id: "electrico-conexiones",
        sistema: "Instalaci\xF3n el\xE9ctrica",
        subsistema: "Distribuci\xF3n",
        elemento: "Conexiones, terminales y cableado de 12 V",
        funcion: "Conducir la corriente sin calentarse",
        modo: "Conexi\xF3n floja o corro\xEDda que se calienta",
        causa: "Vibraci\xF3n, humedad salina, terminales mal crimpados",
        efecto: "Calentamiento y posible incendio",
        severidad: 5,
        anclaSeveridad: "Riesgo de incendio",
        ocurrencia: 4,
        fuentesOcurrencia: [
          "boatus-incendios-2021",
          "uscg-2024"
        ],
        notaOcurrencia: "La instalaci\xF3n el\xE9ctrica de corriente continua es la primera causa de incendio en las reclamaciones de BoatUS (31 %; 37 % sin or\xEDgenes externos); el sistema el\xE9ctrico, 39 de 289 aver\xEDas de maquinaria (USCG, 2024).",
        deteccion: "oculto",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar conexiones, terminales y cableado (apriete, corrosi\xF3n, se\xF1ales de calentamiento)",
          cada: {
            meses: 12
          },
          justificacion: "Anual, juicio del autor. El fabricante revisa solo el mazo del motor (Yanmar, p. 52), no la instalaci\xF3n del barco."
        },
        cubiertoPor: {
          fabricante: [
            "yanmar-ym-conexiones"
          ],
          anexoII: [
            "4.2"
          ]
        }
      },
      {
        id: "electrico-baterias-instalacion",
        sistema: "Instalaci\xF3n el\xE9ctrica",
        subsistema: "Bater\xEDas y carga",
        elemento: "Fijaci\xF3n, caja y ventilaci\xF3n de las bater\xEDas",
        funcion: "Mantener las bater\xEDas sujetas, aisladas y ventiladas",
        modo: "Bater\xEDa suelta o en caja sin ventilaci\xF3n",
        causa: "Trincas rotas, caja sustituida, ventilaci\xF3n tapada",
        efecto: "Cortocircuito con mala mar; acumulaci\xF3n de hidr\xF3geno",
        severidad: 5,
        anclaSeveridad: "Anexo III, letra j); riesgo de incendio o explosi\xF3n",
        ocurrencia: 3,
        fuentesOcurrencia: [
          "boatus-incendios-2021"
        ],
        notaOcurrencia: "Las bater\xEDas originan el 10 % de los incendios (sin or\xEDgenes externos), sobre todo por errores de conexi\xF3n (BoatUS, 2021).",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Comprobar trincado, caja estanca, ventilaci\xF3n y desconectador de las bater\xEDas",
          cada: {
            meses: 12
          },
          justificacion: "Anual, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "4.1"
          ]
        }
      },
      {
        id: "gas-tuberia",
        sistema: "Gas",
        subsistema: "Instalaci\xF3n de gas de la cocina",
        elemento: "Tubo flexible, regulador y racores",
        funcion: "Llevar el gas a la cocina sin fugas",
        modo: "Fuga de gas",
        causa: "Tubo flexible caducado o agrietado, racor flojo",
        efecto: "Acumulaci\xF3n de gas m\xE1s pesado que el aire en la sentina; explosi\xF3n",
        severidad: 5,
        anclaSeveridad: "Riesgo de explosi\xF3n",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura en las fuentes consultadas; los incendios por combustible de BoatUS no separan el gas de cocina.",
        deteccion: "oculto",
        tarea: {
          tipo: "condicion",
          descripcion: "Comprobar la fecha del tubo flexible y sustituirlo si ha caducado; buscar fugas con agua jabonosa",
          cada: {
            meses: 12
          },
          justificacion: "Anual, juicio del autor; el tubo lleva grabada su fecha de caducidad, que manda."
        },
        cubiertoPor: {
          anexoII: [
            "1.13"
          ]
        }
      },
      {
        id: "aparejo-terminales",
        sistema: "Aparejo",
        subsistema: "Jarcia fija",
        elemento: "Terminales de la jarcia fija",
        funcion: "Transmitir la carga del palo al casco",
        modo: "Grieta en un terminal prensado o rotura de hilos",
        causa: "Fatiga y corrosi\xF3n bajo tensi\xF3n",
        efecto: "Desarbolado",
        severidad: 5,
        anclaSeveridad: "P\xE9rdida del palo",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no hay estad\xEDstica de desarbolados en las fuentes; USCG 2024 registra 0 incidentes de desarbolado, pero su umbral de da\xF1os deja fuera muchos.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Inspeccionar terminales y cables de la jarcia fija (grietas, hilos rotos, \xF3xido)",
          cada: {
            meses: 12
          },
          justificacion: "Anual, juicio del autor; las grietas de los terminales aparecen antes de la rotura y se ven con una lupa."
        },
        cubiertoPor: {
          anexoII: [
            "3.4"
          ]
        }
      },
      {
        id: "aparejo-pasadores",
        sistema: "Aparejo",
        subsistema: "Jarcia fija",
        elemento: "Pasadores y chavetas de los tensores",
        funcion: "Asegurar los tensores",
        modo: "Pasador que se sale",
        causa: "Chaveta ausente o mal abierta",
        efecto: "Desarbolado",
        severidad: 5,
        anclaSeveridad: "P\xE9rdida del palo",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura en las fuentes consultadas.",
        deteccion: "evidente",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar pasadores y chavetas de todos los tensores",
          cada: {
            meses: 3
          },
          justificacion: "Comprobaci\xF3n r\xE1pida y de consecuencia m\xE1xima: trimestral, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "3.2"
          ]
        }
      },
      {
        id: "aparejo-cadenotes",
        sistema: "Aparejo",
        subsistema: "Cadenotes",
        elemento: "Cadenotes y su paso por cubierta",
        funcion: "Anclar la jarcia al casco",
        modo: "Corrosi\xF3n del cadenote bajo cubierta",
        causa: "Agua que entra por el sellado del paso y corroe el inoxidable sin ox\xEDgeno",
        efecto: "Rotura del cadenote y desarbolado",
        severidad: 5,
        anclaSeveridad: "P\xE9rdida del palo; Anexo III, letra a) si entra agua",
        ocurrencia: 2,
        juicioOcurrencia: "Juicio del autor: no figura en las fuentes consultadas.",
        deteccion: "oculto",
        tarea: {
          tipo: "condicion",
          descripcion: "Revisar el sellado de los cadenotes en cubierta y buscar \xF3xido o humedad por dentro",
          cada: {
            meses: 12
          },
          justificacion: "La corrosi\xF3n progresa escondida; la se\xF1al previa es el sellado roto y el rastro de agua. Anual, juicio del autor."
        },
        cubiertoPor: {
          anexoII: [
            "1.9"
          ]
        }
      }
    ]
  }
];

// src/modelo.ts
function nuevoId(prefijo) {
  const marca = (/* @__PURE__ */ new Date()).toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const azar = Math.random().toString(36).slice(2, 7);
  return `${prefijo}-${marca}-${azar}`;
}

// src/ejemplo.ts
var MATRICULA_EJEMPLO = "7\xAA-BA-2-1234-21";
var RESPUESTAS_EJEMPLO = {
  "01.16": {
    resultado: "conforme",
    observaciones: "Revisadas la zona del forro sustituido en 2024 y la de la varada de abril: sin da\xF1os visibles."
  },
  "01.17": { resultado: "no_aplica", observaciones: "No tiene c\xE1maras de flotabilidad." },
  "02.02": {
    resultado: "no_accesible",
    observaciones: "Dep\xF3sito tras el mamparo del camarote de popa; no se desmonta el forro."
  },
  "04.02": {
    resultado: "no_conforme",
    observaciones: "Empalme sin protecci\xF3n en la alimentaci\xF3n de la bomba de sentina."
  },
  "06.00": {
    resultado: "no_conforme",
    observaciones: "Las tres bengalas de mano caducaron el 31/03/2026."
  }
};
var PUNTO_SIN_RESPONDER_EJEMPLO = "10.00";
function responderEjemplo(inspeccion, puntos, proponer) {
  const registradoEn = (/* @__PURE__ */ new Date()).toISOString();
  for (const puntoId of puntos) {
    if (puntoId === PUNTO_SIN_RESPONDER_EJEMPLO) continue;
    const r = RESPUESTAS_EJEMPLO[puntoId];
    const resultado = r?.resultado ?? "conforme";
    const propuesta = resultado === "no_conforme" ? proponer(puntoId) : void 0;
    const hallazgo = {
      puntoId,
      visita: inspeccion.visitaActiva,
      resultado,
      fotos: [],
      registradoEn,
      ...r !== void 0 ? { observaciones: r.observaciones } : {},
      ...propuesta !== void 0 ? {
        gravedad: propuesta.grave ? "grave" : "leve",
        ...propuesta.letra !== void 0 ? { letraAnexoIII: propuesta.letra } : {}
      } : {}
    };
    inspeccion.hallazgos[puntoId] = hallazgo;
    inspeccion.registro.push({ ...hallazgo });
  }
}
function embarcacionEjemplo() {
  return {
    id: nuevoId("emb"),
    nombre: "Tramuntana (ejemplo)",
    matricula: MATRICULA_EJEMPLO,
    lista: 7,
    esloraCascoM: 11,
    esloraTotalM: 11.8,
    materialCasco: "madera",
    marcadoCE: true,
    categoriaDiseno: "A",
    propulsion: "vela",
    disposicionMotor: "intraborda",
    combustible: "grupo_2",
    // La del motor que lleva: Yanmar 3YM30, 22,1 kW de potencia máxima según la tabla de
    // especificaciones de su manual. Hasta el 13/09/2026 decía 30 kW, que no es la de
    // ningún motor de esa serie: el primer inspector que lo mirase lo habría visto.
    potenciaKw: 22.1,
    espacioHabitableGobierno: true,
    espacioHabitableCerrado: true,
    finesComerciales: false,
    equiposRadioelectricos: true,
    camarasFlotabilidad: false,
    compartimentoInteriorConMotorODeposito: true,
    arranqueElectricoMotor: true,
    inodoros: true,
    depositoRetencionFijo: true,
    // Cinco años y pico atrás: el certificado está a punto de caducar, de modo que el
    // calendario de vencimientos tiene algo que decir nada más abrir.
    fechaCertificado: "2021-06-15"
  };
}
function inspeccionEjemplo(fecha, versionCatalogo2, prefijoInforme = "") {
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: nuevoId("insp"),
    embarcacion: embarcacionEjemplo(),
    numeroInforme: `${prefijoInforme}0007`,
    identificacion: { banderaEspanola: true, win: "ES-EJE12345K021" },
    tipo: "periodico",
    motivo: "periodico",
    fecha,
    lugar: "Varadero de ejemplo",
    inspector: "",
    estado: "borrador",
    visitas: {
      v1: {
        clave: "v1",
        fecha,
        lugar: "Varadero de ejemplo",
        // En seco, que es lo que el art. 3.B) exige para el periódico. Así el guion trae
        // los bloques de casco y maquinaria, que son los que tienen más contenido.
        condicion: "seco",
        refrendo: ""
      }
    },
    visitaActiva: "v1",
    hallazgos: {},
    registro: [],
    datosPunto: {
      // Dos casillas de la hoja real rellenas, para que se vea que están y dónde.
      "01.01": { win: "ES-EJE12345K021", marcadoCE: "si" },
      "10.00": { pesoAnclaKg: "16", origenPesoAncla: "Medido", molinete: "El\xE9ctrico" }
    },
    equiposMedida: [
      { clave: "cinta_metrica", identificador: "317" },
      { clave: "higrometro", identificador: "" }
    ],
    observacionesGenerales: "",
    // Declarada más exigente de la que el equipo va a permitir, a propósito: es lo que
    // hace visible el contraste entre lo declarado y lo comprobado.
    zonaDeclarada: 2,
    // El inventario de un velero de altura razonablemente cuidado. Hasta el 13/09/2026
    // llevaba solo chalecos, un aro y dos extintores, y el caso salía «sin ninguna zona»
    // con dieciocho carencias: ningún inspector se lo habría creído, y lo que había que
    // enseñar —qué le falta para subir— quedaba enterrado.
    //
    // Llega a la zona 4. Para la 3 le faltan exactamente dos cosas: la balsa (art. 6.1)
    // y tres bengalas más (art. 9). Y declara la 2: discrepancia.
    inventario: {
      chaleco_salvavidas: 6,
      // Mínimo por unidad: la etiqueta del chaleco más flojo (ADR-010).
      chaleco_flotabilidad: 150,
      aro_salvavidas: 1,
      // Tres, y caducadas en marzo (ver `caducidades`): cuentan para la zona, pero el
      // Anexo III h) las convierte en deficiencia grave.
      bengala_mano: 3,
      cohete_paracaidas: 6,
      senal_fumigena: 1,
      botiquin: 1,
      luces_navegacion: 1,
      bocina_niebla: 1,
      reflector_radar: 1,
      pabellon_nacional: 1,
      linterna_estanca: 1,
      tabla_senales_salvamento: 1,
      tabla_banderas_senales: 1,
      compas: 1,
      cartas_nauticas: 1,
      publicaciones_nauticas: 1,
      prismaticos: 1,
      barometro: 1,
      linea_fondeo: 60,
      estacha_amarre: 4,
      bichero: 1,
      gobierno_emergencia: 1,
      bomba_achique: 2,
      // Mínimo por unidad: el caudal de la bomba más pequeña, leído en su placa.
      capacidad_bomba: 25,
      extintor_portatil: 2
    },
    personasABordo: 6,
    navegacionDiurna: false,
    versionCatalogo: versionCatalogo2,
    creadaEn: ahora,
    actualizadaEn: ahora
  };
}
function expedienteEjemplo() {
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  const sucesos = [
    {
      id: nuevoId("suc"),
      fecha: "2026-04-18",
      tipo: "varada",
      descripcion: "Varada accidental en la bocana con marea baja. Sin v\xEDa de agua aparente."
    },
    {
      id: nuevoId("suc"),
      fecha: "2024-02-02",
      tipo: "reparacion",
      descripcion: "Sustituci\xF3n de dos tablas del forro de estribor y calafateado."
    }
  ];
  const motorId = "cmp-ejemplo-motor";
  const hecho = (fecha, horas, tareas, descripcion, quien) => tareas.map((tareaId) => ({
    id: nuevoId("trb"),
    fecha,
    componenteId: motorId,
    tareaId: `yanmar-ym-${tareaId}`,
    horas,
    descripcion,
    realizadoPor: quien
  }));
  const trabajos = [
    // Revisión de rodaje a las 50 horas (p. 51-53 del manual).
    ...hecho(
      "2021-06-20",
      50,
      ["aceite-motor", "filtro-aceite", "aceite-inversor", "purga-deposito", "correa-tension", "valvulas", "cables-mando", "alineacion-eje"],
      "Revisi\xF3n de rodaje de las 50 horas",
      "Servicio oficial Yanmar"
    ),
    // Revisión de los cuatro años / 1000 horas, en el servicio oficial.
    ...hecho(
      "2025-04-22",
      590,
      ["calado-inyeccion", "inyectores", "impulsor-sustituir", "circuito-agua-salada", "diafragma", "correa-sustituir", "aprietes", "valvulas", "cables-mando", "alineacion-eje"],
      "Revisi\xF3n de los cuatro a\xF1os",
      "Servicio oficial Yanmar"
    ),
    // La anual del otoño pasado.
    ...hecho(
      "2025-10-04",
      612,
      ["aceite-motor", "filtro-aceite", "filtro-combustible", "aceite-inversor", "impulsor-revisar", "silenciador-admision", "codo-escape", "respiradero", "conexiones", "purga-deposito", "correa-tension"],
      "Revisi\xF3n anual de invernada",
      "El propietario"
    ),
    // El refrigerante se cambió en primavera de 2025: sin refrigerante de larga duración,
    // el manual pide cambiarlo cada año, así que está vencido.
    ...hecho("2025-03-15", 598, ["refrigerante"], "Cambio de refrigerante", "El propietario"),
    ...hecho("2026-08-30", 698, ["separador-agua", "electrolito"], "Purga del separador y nivel de bater\xEDa", "El propietario")
  ];
  return {
    matricula: MATRICULA_EJEMPLO,
    sucesos,
    componentes: [
      {
        id: motorId,
        nombre: "Motor principal",
        tipo: "motor_intraborda_diesel",
        marca: "Yanmar",
        modelo: "3YM30",
        numeroSerie: "EJEMPLO-00000",
        transmision: "inversor",
        alta: { fecha: "2021-04-10", horas: 0, nuevo: true }
      }
    ],
    lecturas: [
      { componenteId: motorId, fecha: "2021-06-20", horas: 50 },
      { componenteId: motorId, fecha: "2025-10-04", horas: 612 },
      { componenteId: motorId, fecha: "2026-06-01", horas: 655 },
      { componenteId: motorId, fecha: "2026-09-10", horas: 702 }
    ],
    trabajos,
    tareasPropias: [],
    caducidades: {
      // Vencidas a propósito: por la letra h) del Anexo III, una señal de socorro caducada
      // es deficiencia grave, y el sistema lo avisa antes de ir al barco.
      // Hasta el 13/09/2026 la clave era «senal_socorro», que no existe en el catálogo: el
      // calendario la enseñaba en crudo y, sin familia, SE PERDÍA el aviso de la letra h).
      // Sin balsa: el barco no la lleva (le falta para la zona 3), así que no hay qué caduque.
      bengala_mano: "2026-03-31",
      extintor_portatil: "2026-11-30"
    },
    creadoEn: ahora,
    actualizadoEn: ahora
  };
}

// src/almacen.ts
var BASE = "itb-campo";
var VERSION = 4;
var ALMACEN_INSPECCIONES = "inspecciones";
var ALMACEN_FOTOS = "fotos";
var ALMACEN_EXPEDIENTES = "expedientes";
var ALMACEN_REVISIONES = "revisiones";
var ALMACEN_CITAS = "citas";
var ALMACEN_NOTAS = "notas";
var ALMACEN_AJUSTES = "ajustes";
var conexion;
function promesa(peticion) {
  return new Promise((resolver, rechazar) => {
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
}
function abrir() {
  if (conexion !== void 0) return conexion;
  conexion = new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(BASE, VERSION);
    peticion.onupgradeneeded = () => {
      const bd = peticion.result;
      if (!bd.objectStoreNames.contains(ALMACEN_INSPECCIONES)) {
        bd.createObjectStore(ALMACEN_INSPECCIONES, { keyPath: "id" });
      }
      if (!bd.objectStoreNames.contains(ALMACEN_FOTOS)) {
        bd.createObjectStore(ALMACEN_FOTOS);
      }
      if (!bd.objectStoreNames.contains(ALMACEN_EXPEDIENTES)) {
        bd.createObjectStore(ALMACEN_EXPEDIENTES, { keyPath: "matricula" });
      }
      if (!bd.objectStoreNames.contains(ALMACEN_REVISIONES)) {
        bd.createObjectStore(ALMACEN_REVISIONES, { keyPath: "catalogo" });
      }
      for (const nombre of [ALMACEN_CITAS, ALMACEN_NOTAS]) {
        if (!bd.objectStoreNames.contains(nombre)) bd.createObjectStore(nombre, { keyPath: "id" });
      }
      if (!bd.objectStoreNames.contains(ALMACEN_AJUSTES)) {
        bd.createObjectStore(ALMACEN_AJUSTES, { keyPath: "clave" });
      }
    };
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
  return conexion;
}
async function transaccion(almacen, modo, operacion) {
  const bd = await abrir();
  return promesa(operacion(bd.transaction(almacen, modo).objectStore(almacen)));
}
async function guardarInspeccion(inspeccion) {
  const conMarca = {
    ...inspeccion,
    actualizadaEn: (/* @__PURE__ */ new Date()).toISOString()
  };
  await transaccion(ALMACEN_INSPECCIONES, "readwrite", (a) => a.put(conMarca));
}
async function leerInspeccion(id) {
  return transaccion(
    ALMACEN_INSPECCIONES,
    "readonly",
    (a) => a.get(id)
  );
}
async function listarInspecciones() {
  const todas = await transaccion(
    ALMACEN_INSPECCIONES,
    "readonly",
    (a) => a.getAll()
  );
  return todas.sort((x, y) => y.creadaEn.localeCompare(x.creadaEn));
}
async function borrarInspeccionesDeEjemplo() {
  for (const i of await listarInspecciones()) {
    if (i.embarcacion.matricula !== MATRICULA_EJEMPLO) continue;
    await transaccion(ALMACEN_INSPECCIONES, "readwrite", (a) => a.delete(i.id));
  }
}
async function leerExpediente(matricula) {
  const guardado = await transaccion(
    ALMACEN_EXPEDIENTES,
    "readonly",
    (a) => a.get(matricula)
  );
  if (guardado !== void 0) {
    const antiguo = guardado;
    return {
      ...guardado,
      componentes: antiguo.componentes ?? [],
      lecturas: antiguo.lecturas ?? [],
      trabajos: antiguo.trabajos ?? [],
      tareasPropias: antiguo.tareasPropias ?? []
    };
  }
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  return {
    matricula,
    sucesos: [],
    caducidades: {},
    componentes: [],
    lecturas: [],
    trabajos: [],
    tareasPropias: [],
    creadoEn: ahora,
    actualizadoEn: ahora
  };
}
async function guardarExpediente(expediente) {
  await transaccion(
    ALMACEN_EXPEDIENTES,
    "readwrite",
    (a) => a.put({ ...expediente, actualizadoEn: (/* @__PURE__ */ new Date()).toISOString() })
  );
}
async function listarMatriculasConExpediente() {
  const claves = await transaccion(ALMACEN_EXPEDIENTES, "readonly", (a) => a.getAllKeys());
  return claves.map(String);
}
async function listarCitas() {
  return transaccion(ALMACEN_CITAS, "readonly", (a) => a.getAll());
}
async function guardarCita(cita) {
  await transaccion(ALMACEN_CITAS, "readwrite", (a) => a.put(cita));
}
async function listarNotas() {
  return transaccion(ALMACEN_NOTAS, "readonly", (a) => a.getAll());
}
async function guardarNota(nota) {
  await transaccion(ALMACEN_NOTAS, "readwrite", (a) => a.put(nota));
}
async function leerPerfil() {
  const guardado = await transaccion(
    ALMACEN_AJUSTES,
    "readonly",
    (a) => a.get("perfil")
  );
  return guardado?.valor ?? { inspector: "", entidad: "" };
}
async function guardarPerfil(perfil) {
  await transaccion(ALMACEN_AJUSTES, "readwrite", (a) => a.put({ clave: "perfil", valor: perfil }));
}
async function leerRevision(catalogo) {
  const guardada = await transaccion(
    ALMACEN_REVISIONES,
    "readonly",
    (a) => a.get(catalogo)
  );
  if (guardada !== void 0) return guardada;
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  return { catalogo, dictamenes: {}, iniciadaEn: ahora, actualizadaEn: ahora };
}
async function guardarRevision(revision) {
  revision.actualizadaEn = (/* @__PURE__ */ new Date()).toISOString();
  await transaccion(ALMACEN_REVISIONES, "readwrite", (a) => a.put(revision));
}
async function guardarFoto(datos) {
  const clave = `foto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await transaccion(ALMACEN_FOTOS, "readwrite", (a) => a.put(datos, clave));
  return clave;
}
async function espacio() {
  if (navigator.storage?.estimate === void 0) return void 0;
  const { usage, quota } = await navigator.storage.estimate();
  if (usage === void 0 || quota === void 0) return void 0;
  return { usado: usage, total: quota };
}
async function pedirPersistencia() {
  if (navigator.storage?.persist === void 0) return false;
  return navigator.storage.persist();
}

// src/formulario.ts
function correspondenciaAnexoII(codigo) {
  const [bloque, punto] = codigo.split(".");
  if (bloque === void 0 || punto === void 0) return null;
  if (bloque === "99") return null;
  const nb = String(Number(bloque));
  return punto === "00" ? nb : `${nb}.${Number(punto)}`;
}

// src/guion.ts
var BLOQUES_SOLO_VELA = /* @__PURE__ */ new Set(["03"]);
function puedeLlevarAparejo(embarcacion) {
  return embarcacion.propulsion !== "motor";
}
function bloquesEnSeco(catalogoAnexo) {
  const seco = /* @__PURE__ */ new Set();
  for (const bloque of catalogoAnexo.bloques) {
    if (bloque.requiere_seco) seco.add(bloque.codigo);
  }
  return seco;
}
var PUNTO_EXTRACTOR = "02.11";
var EXTRACTOR = {
  letra: "h",
  texto: "Comprobar el funcionamiento del extractor de gases del compartimento del motor (Anexo II, 2.11.h). Obligatorio con gasolina."
};
var esExtractor = (c) => /extractor de gases/i.test(c.texto);
function conExtractorSegunCombustible(codigo, comprobaciones, embarcacion) {
  if (codigo !== PUNTO_EXTRACTOR) return comprobaciones;
  const sinExtractor = comprobaciones.filter((c) => !esExtractor(c));
  if (embarcacion.combustible === "grupo_1" || embarcacion.combustible === void 0) {
    return [...sinExtractor, EXTRACTOR];
  }
  return sinExtractor;
}
function generarGuion(formulario, catalogoAnexo, campos, embarcacion, evaluacion, tipo) {
  const enSeco = conclusionesDe(evaluacion, tipo).some(
    (c) => c.consecuencia.enSeco === true
  );
  const exigenSeco = bloquesEnSeco(catalogoAnexo);
  const incluidos = [];
  const omitidos = [];
  for (const bruto of formulario.bloques) {
    const requiereSeco = exigenSeco.has(String(Number(bruto.codigo)));
    const bloque = {
      codigo: bruto.codigo,
      titulo: bruto.titulo,
      requiereSeco,
      normaCitada: bruto.norma_citada,
      puntos: bruto.puntos.map((p) => ({
        codigo: p.codigo,
        titulo: p.titulo,
        notas: [],
        comprobaciones: conExtractorSegunCombustible(p.codigo, p.comprobaciones, embarcacion),
        anexoII: correspondenciaAnexoII(p.codigo),
        campos: campos[p.codigo] ?? []
      }))
    };
    if (BLOQUES_SOLO_VELA.has(bruto.codigo) && !puedeLlevarAparejo(embarcacion)) {
      omitidos.push({ ...bloque, omitidoPorque: "Embarcaci\xF3n sin aparejo" });
      continue;
    }
    if (requiereSeco && !enSeco) {
      omitidos.push({
        ...bloque,
        omitidoPorque: "Requiere varada y este reconocimiento no es en seco"
      });
      continue;
    }
    incluidos.push(bloque);
  }
  const totalComprobaciones = incluidos.reduce(
    (n, b) => n + b.puntos.reduce((m, p) => m + p.comprobaciones.length, 0),
    0
  );
  return { bloques: incluidos, omitidos, totalComprobaciones };
}
function puntosDe(guion) {
  return guion.bloques.flatMap((b) => b.puntos);
}

// src/gravedad.ts
var DEFICIENCIAS_GRAVES = {
  a: "Estanqueidad",
  b: "Deformaciones de importancia en el casco",
  c: "Ventilaci\xF3n no adecuada del local del motor propulsor",
  d: "No correcto funcionamiento del sistema de gobierno",
  e: "No correcto funcionamiento del motor principal o de sus auxiliares",
  f: "Deficiente funcionamiento del sistema de achique",
  g: "Deficiente funcionamiento de los equipos de radiocomunicaciones",
  h: "Equipos de salvamento incompleto o con fecha de caducidad vencida",
  i: "Incorrecto funcionamiento de las luces de situaci\xF3n",
  j: "Bater\xEDas deficientemente instaladas y con bajo nivel de carga",
  k: "Alto nivel de emisi\xF3n de gases y de ruido",
  l: "Funcionamiento incorrecto del equipo n\xE1utico de navegaci\xF3n",
  m: "Equipo de contraincendios con deficiencias importantes como falta de extintores o con fecha de caducidad vencida, defectuoso funcionamiento de las bombas de contraincendios"
};
var LETRA_POR_PUNTO = {
  // 1. Casco y equipo
  "1.4": "a",
  // Pasacascos y pasamamparos -> estanqueidad
  "1.5": "a",
  // Válvulas de costado -> estanqueidad
  "1.6": "a",
  // Estanqueidad en aberturas de cubierta
  "1.7": "b",
  // Unión orza/casco -> deformaciones de importancia
  "1.8": "b",
  // Unión arbotantes/casco
  "1.10": "f",
  // Bañeras autoachicables (desagües) -> achique
  "1.12": "c",
  // Ventilación/extracción de cocina
  "1.14": "d",
  // Gobierno, timón y mecha
  "1.16": "b",
  // Estado del casco (ósmosis, deslaminaciones, golpes, grietas)
  "1.17": "a",
  // Cámaras de flotabilidad
  // 2. Maquinaria principal y auxiliar
  "2.1": "f",
  // Bombas de achique
  "2.3": "c",
  // Ventilación del local del motor propulsor
  "2.4": "a",
  // Válvulas de fondo -> estanqueidad
  "2.5": "e",
  // Circuito de refrigeración -> motor
  "2.7": "k",
  // Escape de gases -> emisión de gases y ruido
  "2.8": "a",
  // Prensaestopa -> estanqueidad
  "2.10": "e",
  // Línea de ejes y eje de cola
  "2.11": "e",
  // Funcionamiento del equipo propulsor y auxiliares
  // 4. Instalación eléctrica
  "4.1": "j"
  // Baterías
};
var LETRA_POR_BLOQUE = {
  "5": "g",
  // Equipo de radiocomunicaciones
  "6": "h",
  // Equipo de salvamento
  "7": "m",
  // Equipo de contraincendios
  "8": "l",
  // Material náutico
  "9": "i"
  // Luces de navegación
};
var GRAVE_POR_CRITERIO = {
  "3": "Un defecto en palos o jarcia se califica grave (criterio del director, 15/09/2026).",
  "10": "Un defecto en el equipo de fondeo se califica grave (criterio del director, 15/09/2026)."
};
function proponerGravedad(puntoId) {
  const codigo = /^\d{2}\.\d{2}$/.test(puntoId) ? correspondenciaAnexoII(puntoId) : puntoId;
  if (codigo === null) return { grave: false };
  const bloque = codigo.split(".")[0] ?? "";
  const letra = LETRA_POR_PUNTO[codigo] ?? LETRA_POR_BLOQUE[bloque];
  if (letra !== void 0) return { grave: true, letra, supuesto: DEFICIENCIAS_GRAVES[letra] };
  const criterio = GRAVE_POR_CRITERIO[bloque];
  if (criterio !== void 0) return { grave: true, criterio };
  return { grave: false };
}
function textoPropuesta(propuesta) {
  if (!propuesta.grave) {
    return "El Anexo III no tipifica este punto. La calificaci\xF3n queda a criterio del inspector.";
  }
  return propuesta.letra !== void 0 ? `Anexo III, letra ${propuesta.letra}): ${propuesta.supuesto}` : `Grave por criterio de inspecci\xF3n, no por el Anexo III: ${propuesta.criterio}`;
}
var VIGENCIA_RD1434 = "2000-03-11";
function consecuencia(propuesta) {
  if (!propuesta.grave) return { calificacion: "no_tipificada" };
  return propuesta.letra !== void 0 ? { calificacion: "grave", letra: propuesta.letra, supuesto: propuesta.supuesto } : { calificacion: "grave", criterio: propuesta.criterio };
}
function correspondenciaRevisable(anexo) {
  const entradas = [];
  for (const bloque of anexo.bloques) {
    const citaBloque = `RD 1434/1999, Anexo II, bloque ${bloque.codigo} (${bloque.titulo})`;
    if (bloque.puntos.length === 0) {
      const propuesta = proponerGravedad(bloque.codigo);
      entradas.push({
        id: `RD1434-AIII-bloque-${bloque.codigo}`,
        cita: citaBloque,
        vigenciaDesde: VIGENCIA_RD1434,
        vigenciaHasta: null,
        cuando: { bloqueAnexoII: { codigo: bloque.codigo, titulo: bloque.titulo } },
        entonces: consecuencia(propuesta),
        explicacion: textoPropuesta(propuesta)
      });
      continue;
    }
    for (const punto of bloque.puntos) {
      const propuesta = proponerGravedad(punto.codigo);
      entradas.push({
        id: `RD1434-AIII-punto-${punto.codigo}`,
        cita: `${citaBloque}, punto ${punto.codigo}`,
        vigenciaDesde: VIGENCIA_RD1434,
        vigenciaHasta: null,
        cuando: { puntoAnexoII: { codigo: punto.codigo, titulo: punto.titulo } },
        entonces: consecuencia(propuesta),
        explicacion: textoPropuesta(propuesta)
      });
    }
  }
  return entradas;
}

// src/resultado.ts
function medirAvance(guion, hallazgos) {
  const puntos = puntosDe(guion);
  const pendientes2 = puntos.filter((p) => hallazgos[p.codigo] === void 0).map((p) => p.codigo);
  return {
    total: puntos.length,
    respondidos: puntos.length - pendientes2.length,
    pendientes: pendientes2,
    completo: pendientes2.length === 0
  };
}
function calcularResultado(hallazgos, fechaInspeccion) {
  const lista2 = Object.values(hallazgos);
  const noConformes = lista2.filter((h2) => h2.resultado === "no_conforme");
  const deficienciasGraves = noConformes.filter((h2) => h2.gravedad === "grave");
  const deficienciasLeves = noConformes.filter((h2) => h2.gravedad !== "grave");
  const noAccesibles = lista2.filter((h2) => h2.resultado === "no_accesible");
  const favorable = deficienciasGraves.length === 0;
  return {
    favorable,
    deficienciasGraves,
    deficienciasLeves,
    noAccesibles,
    ...favorable ? {} : { limiteSubsanacion: limiteSubsanacion(fechaInspeccion) }
  };
}
function veredicto(resultado, avance) {
  if (!resultado.favorable) return "desfavorable";
  return avance.completo ? "favorable" : "pendiente";
}
function textoVeredicto(v, avance) {
  if (v === "favorable") return "FAVORABLE";
  if (v === "desfavorable") return "DESFAVORABLE";
  return `PENDIENTE \u2014 faltan ${avance.pendientes.length} de ${avance.total} puntos por responder`;
}
function firmar(inspeccion, resultado) {
  return {
    ...inspeccion,
    estado: resultado.favorable ? "firmada_favorable" : "firmada_desfavorable",
    firmadaEn: (/* @__PURE__ */ new Date()).toISOString(),
    ...resultado.limiteSubsanacion !== void 0 ? { limiteSubsanacion: resultado.limiteSubsanacion } : {},
    actualizadaEn: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/vista/comun.ts
function h(etiqueta, atributos = {}, ...hijos) {
  const elemento = document.createElement(etiqueta);
  for (const [nombre, valor2] of Object.entries(atributos)) {
    if (valor2 === void 0 || valor2 === false) continue;
    if (nombre.startsWith("on") && typeof valor2 === "function") {
      elemento.addEventListener(nombre.slice(2), valor2);
    } else if (nombre === "valor") {
      elemento.value = String(valor2);
    } else if (valor2 === true) {
      elemento.setAttribute(nombre, "");
    } else {
      elemento.setAttribute(nombre, String(valor2));
    }
  }
  for (const hijo of hijos.flat(Infinity)) {
    if (hijo === false || hijo === null || hijo === void 0) continue;
    elemento.append(hijo instanceof Node ? hijo : String(hijo));
  }
  return elemento;
}
function pintar(contenedor, ...contenido) {
  contenedor.replaceChildren();
  for (const hijo of contenido) {
    if (hijo === false || hijo === null || hijo === void 0) continue;
    contenedor.append(hijo instanceof Node ? hijo : String(hijo));
  }
}
var MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];
function fechaLarga(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  if (a === void 0 || m === void 0 || d === void 0) return iso;
  return `${d} de ${MESES[m - 1]} de ${a}`;
}
function hoy() {
  const ahora = /* @__PURE__ */ new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 6e4);
  return local.toISOString().slice(0, 10);
}
function tamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} kB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
var NOMBRE_TIPO = {
  inicial: "inicial",
  periodico: "peri\xF3dico",
  intermedio: "intermedio",
  adicional: "adicional",
  extraordinario: "extraordinario"
};
function nombreTipo(tipo) {
  return NOMBRE_TIPO[tipo] ?? tipo;
}
function campo(etiqueta, control, ayuda) {
  return h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, etiqueta),
    control,
    ayuda !== void 0 && h("small", { class: "campo-ayuda" }, ayuda)
  );
}
function selector(opciones, seleccionado, alCambiar) {
  return h(
    "select",
    { onchange: (e) => alCambiar(e.target.value) },
    ...opciones.map(
      (o) => h("option", { value: o.valor, selected: o.valor === seleccionado }, o.texto)
    )
  );
}

// src/vista/ficha.ts
var MATERIALES = [
  { valor: "materiales_compuestos", texto: "Materiales compuestos (fibra)" },
  { valor: "madera", texto: "Madera" },
  { valor: "metalico", texto: "Met\xE1lico" },
  { valor: "neumatica", texto: "Neum\xE1tica" },
  { valor: "otros", texto: "Otros" }
];
var PROPULSIONES = [
  { valor: "motor", texto: "Motor" },
  { valor: "vela", texto: "Vela" },
  { valor: "mixta", texto: "Mixta" }
];
var DISPOSICIONES = [
  { valor: "intraborda", texto: "Intraborda" },
  { valor: "fueraborda", texto: "Fueraborda" },
  { valor: "intra_fueraborda", texto: "Intra-fueraborda (transmisi\xF3n en Z)" },
  { valor: "jet", texto: "Jet" },
  { valor: "ninguna", texto: "Sin motor" }
];
var COMBUSTIBLES = [
  { valor: "grupo_2", texto: "Grupo 2.\xBA \u2014 gas\xF3leo (inflamaci\xF3n \u2265 55 \xBAC)" },
  { valor: "grupo_1", texto: "Grupo 1.\xBA \u2014 gasolina (inflamaci\xF3n < 55 \xBAC)" },
  { valor: "glp", texto: "GLP" },
  { valor: "electrica", texto: "Propulsi\xF3n el\xE9ctrica" },
  { valor: "ninguno", texto: "Sin combustible" }
];
function casilla(etiqueta, marcada, alCambiar, ayuda) {
  return h(
    "div",
    { class: "campo" },
    h(
      "label",
      { class: "casilla" },
      h("input", {
        type: "checkbox",
        checked: marcada,
        onchange: (e) => alCambiar(e.target.checked)
      }),
      h("span", {}, ` ${etiqueta}`)
    ),
    ayuda !== void 0 && h("small", { class: "campo-ayuda" }, ayuda)
  );
}
function formularioEquipamiento(embarcacion, alCambiar) {
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Caracter\xEDsticas para el equipo exigible"),
    h(
      "p",
      { class: "sutil" },
      "De estos datos depende el equipo que exige el RD 339/2021 y, con \xE9l, la zona de navegaci\xF3n que la embarcaci\xF3n puede alcanzar."
    ),
    campo(
      "Eslora total (m)",
      h("input", {
        type: "number",
        step: "0.01",
        min: "0",
        valor: embarcacion.esloraTotalM ?? "",
        oninput: (e) => {
          const v = Number(e.target.value);
          alCambiar({ esloraTotalM: Number.isFinite(v) && v > 0 ? v : void 0 });
        }
      }),
      "No es la eslora de casco. El art. 10 del RD 339/2021 usa la total para los umbrales de 7, 12 y 20 m de luces y campana de niebla."
    ),
    campo(
      "Propulsi\xF3n",
      selector(
        PROPULSIONES,
        embarcacion.propulsion ?? "motor",
        (v) => alCambiar({ propulsion: v })
      ),
      "Los veleros llevan un requisito propio de bomba de achique (art. 20.1.d)."
    ),
    campo(
      "Disposici\xF3n del motor",
      selector(
        DISPOSICIONES,
        embarcacion.disposicionMotor ?? "intraborda",
        (v) => alCambiar({ disposicionMotor: v })
      ),
      "El fueraborda de hasta 25 kW no requiere extintor por potencia (art. 15.4)."
    ),
    campo(
      "Potencia instalada (kW)",
      h("input", {
        type: "number",
        step: "1",
        min: "0",
        valor: embarcacion.potenciaKw ?? "",
        oninput: (e) => {
          const v = Number(e.target.value);
          alCambiar({ potenciaKw: Number.isFinite(v) && v >= 0 ? v : void 0 });
        }
      }),
      "Por encima de 220 kW la capacidad extintora es B = P \xD7 0,3 (art. 15.4)."
    ),
    campo(
      "Combustible",
      selector(
        COMBUSTIBLES,
        embarcacion.combustible ?? "grupo_2",
        (v) => alCambiar({ combustible: v })
      ),
      "Clasificaci\xF3n del art. 14 del RD 339/2021."
    ),
    casilla(
      "Espacio habitable cerrado de gobierno o navegaci\xF3n",
      embarcacion.espacioHabitableGobierno ?? false,
      (v) => alCambiar({ espacioHabitableGobierno: v }),
      "Con categor\xEDa A o B, obliga a comp\xE1s, cartas, publicaciones y prism\xE1ticos incluso navegando solo en zonas 5, 6 o 7 (nota de la tabla del art. 12.1)."
    ),
    casilla(
      "Espacio habitable cerrado",
      embarcacion.espacioHabitableCerrado ?? false,
      (v) => alCambiar({ espacioHabitableCerrado: v }),
      "Por debajo de 10 m, condiciona el extintor por eslora (art. 15.3)."
    ),
    casilla(
      "Equipos radioel\xE9ctricos instalados",
      embarcacion.equiposRadioelectricos ?? false,
      (v) => alCambiar({ equiposRadioelectricos: v }),
      "Obligan a llevar las tablas de se\xF1ales de salvamento y de banderas (art. 12.2)."
    ),
    casilla(
      "C\xE1maras de flotabilidad",
      embarcacion.camarasFlotabilidad ?? false,
      (v) => alCambiar({ camarasFlotabilidad: v }),
      "Hasta 6 m y en zona 7, permiten sustituir la bomba por un achicador (art. 20.1.c)."
    ),
    casilla(
      "Actividad con fines comerciales o lucrativos",
      embarcacion.lista === 6 || (embarcacion.finesComerciales ?? false),
      (v) => alCambiar({ finesComerciales: v }),
      "Endurece el r\xE9gimen: revisi\xF3n de balsas cada 24 meses y extintor adicional a partir de 10 m. En lista 6.\xAA se da siempre por marcada (criterio de inspecci\xF3n)."
    ),
    // --- Características de la instalación (arts. 16 a 19 y 22) ---------------------
    // Entran con el vaciado del capítulo IV. No son equipo que se cuente: son cómo está
    // construido el barco. La hoja de campos de la empresa pregunta por casi todas, lo
    // que confirma que son datos que se toman a bordo.
    h("h3", {}, "Instalaci\xF3n (arts. 16 a 19 y 22)"),
    casilla(
      "Motores o dep\xF3sitos en compartimentos interiores",
      embarcacion.compartimentoInteriorConMotorODeposito ?? false,
      (v) => alCambiar({ compartimentoInteriorConMotorODeposito: v }),
      "Con gasolina o GLP, obliga a sistema fijo de extinci\xF3n (art. 16.2) y a ventilaci\xF3n espec\xEDfica (art. 18.2 y 18.3)."
    ),
    casilla(
      "Motores con arranque el\xE9ctrico",
      embarcacion.arranqueElectricoMotor ?? false,
      (v) => alCambiar({ arranqueElectricoMotor: v }),
      "Convierte la ventilaci\xF3n exigida en forzada (art. 18.2)."
    ),
    casilla(
      "Motores en encajonamiento sobre cubierta",
      embarcacion.motorEnEncajonamientoSobreCubierta ?? false,
      (v) => alCambiar({ motorEnEncajonamientoSobreCubierta: v }),
      "Admite extintores port\xE1tiles como alternativa al sistema fijo (art. 16.2)."
    ),
    casilla(
      "Instalaci\xF3n de gas combustible dentro del casco",
      embarcacion.instalacionGasCombustible ?? false,
      (v) => alCambiar({ instalacionGasCombustible: v }),
      "Obliga a sistema de detecci\xF3n de gases con alarma luminosa y sonora (art. 17.1). Este art\xEDculo no except\xFAa a las embarcaciones con marcado CE."
    ),
    casilla(
      "Dotada de inodoros",
      embarcacion.inodoros ?? false,
      (v) => alCambiar({ inodoros: v }),
      "Sin marcado CE, obliga a una de las tres instalaciones del art. 22.3."
    ),
    casilla(
      "Dep\xF3sito de retenci\xF3n fijo de aguas sucias",
      embarcacion.depositoRetencionFijo ?? false,
      (v) => alCambiar({ depositoRetencionFijo: v }),
      "Obliga a conexi\xF3n universal a tierra (art. 22.4)."
    )
  );
}
function formularioFicha(embarcacion, alCambiar) {
  const texto = (valor2, alEscribir, atributos = {}) => h("input", {
    type: "text",
    valor: valor2,
    ...atributos,
    oninput: (e) => alEscribir(e.target.value)
  });
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Ficha de la embarcaci\xF3n"),
    campo("Nombre", texto(embarcacion.nombre, (v) => alCambiar({ nombre: v }))),
    campo("Matr\xEDcula", texto(embarcacion.matricula, (v) => alCambiar({ matricula: v }))),
    campo(
      "Lista del registro",
      selector(
        [
          { valor: "7", texto: "7.\xAA \u2014 recreo privado" },
          { valor: "6", texto: "6.\xAA \u2014 arrendamiento (ch\xE1rter)" }
        ],
        String(embarcacion.lista),
        (v) => alCambiar({ lista: Number(v) })
      ),
      "La lista 6.\xAA obliga a reconocimiento peri\xF3dico cualquiera que sea la eslora."
    ),
    campo(
      "Eslora de casco (m)",
      h("input", {
        type: "number",
        step: "0.01",
        min: "0",
        valor: embarcacion.esloraCascoM,
        oninput: (e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) alCambiar({ esloraCascoM: v });
        }
      }),
      // La definición legal se pone delante del inspector, no en un manual. Es el
      // requisito RF-02: confundirla con la eslora total puede cambiar el régimen
      // aplicable a la embarcación.
      "Art. 2.2 RD 1434/1999: distancia entre los planos perpendiculares al de cruj\xEDa que pasan por los puntos m\xE1s salientes a proa y a popa. Incluye amuradas y uni\xF3n casco-cubierta. NO incluye baupreses, p\xFAlpitos, timones, fuerabordas con sus soportes, plataformas de ba\xF1o ni defensas."
    ),
    campo(
      "Material del casco",
      selector(
        MATERIALES,
        embarcacion.materialCasco,
        (v) => alCambiar({ materialCasco: v })
      ),
      "En lista 7.\xAA, un casco de madera obliga a intermedio ya desde los 6 m."
    ),
    campo(
      "Marcado CE",
      selector(
        [
          { valor: "si", texto: "S\xED" },
          { valor: "no", texto: "No" }
        ],
        embarcacion.marcadoCE ? "si" : "no",
        (v) => alCambiar({
          marcadoCE: v === "si",
          ...v === "si" ? {} : { categoriaDiseno: void 0 }
        })
      )
    ),
    campo(
      "Fecha de expedici\xF3n del certificado de navegabilidad",
      h("input", {
        type: "date",
        valor: embarcacion.fechaCertificado ?? "",
        oninput: (e) => {
          const v = e.target.value;
          alCambiar({ fechaCertificado: v === "" ? void 0 : v });
        }
      }),
      "Art. 3.A) del RD 1434/1999: es la fecha que marca el inicio del plazo de los reconocimientos peri\xF3dicos e intermedios. Sin ella no se pueden calcular los vencimientos."
    ),
    embarcacion.marcadoCE && campo(
      "Categor\xEDa de dise\xF1o",
      selector(
        ["A", "B", "C", "D"].map((c) => ({ valor: c, texto: c })),
        embarcacion.categoriaDiseno ?? "B",
        (v) => alCambiar({ categoriaDiseno: v })
      ),
      "Marca el techo de zona de navegaci\xF3n (art. 3.3 RD 339/2021)."
    )
  );
}
function panelConclusiones(evaluacion) {
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Qu\xE9 le corresponde a esta embarcaci\xF3n"),
    h(
      "p",
      { class: "sutil" },
      `Calculado con ${evaluacion.versionCatalogo}, normativa vigente a ${evaluacion.fechaEvaluacion}.`
    ),
    ...evaluacion.conclusiones.map(
      (c) => h(
        "div",
        { class: `conclusion ${c.exento ? "exenta" : "sujeta"}` },
        h(
          "div",
          { class: "conclusion-titulo" },
          h("strong", {}, c.exento ? "EXENTA de" : "SUJETA a"),
          " reconocimiento ",
          h("span", { class: "tipo" }, nombreTipo(c.tipo))
        ),
        h(
          "div",
          { class: "conclusion-detalles" },
          [
            c.consecuencia.periodicidadMaximaAnios !== void 0 && `cada ${c.consecuencia.periodicidadMaximaAnios} a\xF1os como m\xE1ximo`,
            c.consecuencia.ventanaAnios !== void 0 && `entre el a\xF1o ${c.consecuencia.ventanaAnios.desde} y el ${c.consecuencia.ventanaAnios.hasta} del per\xEDodo`,
            c.consecuencia.enSeco === true && "en seco (exige varada)",
            c.consecuencia.certificadoSinCaducidad === true && "certificado SIN CADUCIDAD"
          ].filter(Boolean).join(" \xB7 ")
        ),
        h("div", { class: "cita" }, c.fundamento.cita),
        h("p", { class: "explicacion" }, c.fundamento.explicacion),
        c.fundamento.advertencia !== void 0 && h("p", { class: "salvedad" }, `\u26A0 ${c.fundamento.advertencia}`)
      )
    ),
    ...evaluacion.avisos.map((a) => h("p", { class: "salvedad" }, `\u26A0 ${a}`))
  );
}

// src/vista/guion.ts
var ETIQUETA_VISITA = {
  v1: "1v",
  v2: "2v",
  r2: "2R"
};
var OPCIONES = [
  { valor: "conforme", texto: "Correcto" },
  { valor: "no_conforme", texto: "Incorrecto" },
  { valor: "no_aplica", texto: "No aplica" },
  { valor: "no_accesible", texto: "No accesible" }
];
function pintarCampo(puntoId, campo2, valor2, acciones, soloLectura) {
  const alCambiar = (e) => acciones.alAnotarDato(puntoId, campo2.campo, e.target.value);
  const control = campo2.tipo === "opcion" ? h(
    "select",
    { disabled: soloLectura, onchange: alCambiar },
    h("option", { value: "" }, "\u2014"),
    ...(campo2.valores ?? []).map(
      (v) => h("option", { value: v, selected: v === valor2 }, v)
    )
  ) : campo2.tipo === "booleano" ? h(
    "select",
    { disabled: soloLectura, onchange: alCambiar },
    h("option", { value: "" }, "\u2014"),
    h("option", { value: "si", selected: valor2 === "si" }, "S\xED"),
    h("option", { value: "no", selected: valor2 === "no" }, "No")
  ) : h("input", {
    type: campo2.tipo === "numero" ? "number" : "text",
    inputmode: campo2.tipo === "numero" ? "decimal" : void 0,
    disabled: soloLectura,
    valor: valor2,
    oninput: alCambiar
  });
  return h(
    "label",
    { class: "casilla" },
    h("span", { class: "casilla-etiqueta" }, campo2.etiqueta),
    control,
    campo2.condiciona !== void 0 && h("small", { class: "cita" }, campo2.condiciona),
    campo2.exigible_si !== void 0 && h("small", { class: "sutil" }, `Exigible si: ${campo2.exigible_si}`)
  );
}
function pintarPunto(punto, hallazgo, datos, historico, acciones, soloLectura) {
  const resultado = hallazgo?.resultado;
  const propuesta = proponerGravedad(punto.codigo);
  return h(
    "details",
    { class: `punto ${resultado ?? "sin-responder"}`, open: resultado === void 0 },
    h(
      "summary",
      {},
      h("span", { class: "punto-codigo" }, punto.codigo),
      h("span", { class: "punto-titulo" }, punto.titulo),
      h(
        "span",
        { class: "punto-marca" },
        resultado === void 0 ? "\xB7" : resultado === "conforme" ? "\u2713" : resultado === "no_conforme" ? "\u2717" : resultado === "no_aplica" ? "\u2014" : "?"
      )
    ),
    h(
      "div",
      { class: "punto-cuerpo" },
      ...punto.notas.map((n) => h("p", { class: "punto-nota" }, n)),
      // El punto del Anexo II del que deriva. El inspector trabaja con la hoja de su
      // empresa, pero el acta cita la norma, y aquí se ve el enlace entre las dos.
      punto.anexoII !== null && h("p", { class: "cita" }, `Anexo II del RD 1434/1999, punto ${punto.anexoII}`),
      // El texto literal de la norma, delante del inspector.
      punto.comprobaciones.length > 0 && h(
        "ul",
        { class: "comprobaciones" },
        ...punto.comprobaciones.map(
          (c) => h("li", {}, h("b", {}, `${c.letra}) `), c.texto)
        )
      ),
      // Las casillas de datos van delante de la botonera: se anotan mientras se mira,
      // antes de decidir si el punto es conforme.
      punto.campos.length > 0 && h(
        "div",
        { class: "casillas" },
        ...punto.campos.map(
          (c) => pintarCampo(punto.codigo, c, datos[c.campo] ?? "", acciones, soloLectura)
        )
      ),
      // Lo registrado en visitas anteriores. Es la columna «1v» de la hoja de papel:
      // sin ella no se ve que una deficiencia de la primera visita quedó subsanada.
      historico.length > 0 && h(
        "p",
        { class: "historico-punto" },
        ...historico.map(
          (r) => h(
            "span",
            { class: `marca-visita ${r.resultado}` },
            `${ETIQUETA_VISITA[r.visita]}: ${r.resultado.replace(/_/g, " ")}`
          )
        )
      ),
      h(
        "div",
        { class: "botonera" },
        ...OPCIONES.map(
          (o) => h(
            "button",
            {
              type: "button",
              class: `opcion ${o.valor} ${resultado === o.valor ? "activa" : ""}`,
              // Un acta firmada no se edita (ADR-003). Los controles se deshabilitan
              // además de ignorarse: dejarlos con aspecto de pulsables e ignorar el
              // clic haría creer al inspector que ha registrado algo que no se ha
              // registrado, que es peor que no dejarle pulsar.
              disabled: soloLectura,
              onclick: () => acciones.alResponder(punto.codigo, o.valor)
            },
            o.texto
          )
        )
      ),
      // Segundo paso, solo si es incorrecto: ¿leve o grave? Dos botones y no una casilla,
      // porque son las dos respuestas posibles y el inspector elige una. La propuesta del
      // sistema llega marcada y se dice de dónde sale; la decisión es del inspector.
      resultado === "no_conforme" && h(
        "div",
        { class: "gravedad" },
        h("span", { class: "gravedad-pregunta" }, "Disconformidad:"),
        h(
          "div",
          { class: "botonera" },
          ...["leve", "grave"].map(
            (g) => h(
              "button",
              {
                type: "button",
                class: `opcion ${g} ${(hallazgo?.gravedad ?? "leve") === g ? "activa" : ""}`,
                disabled: soloLectura,
                onclick: () => acciones.alCambiarGravedad(punto.codigo, g === "grave")
              },
              g === "leve" ? "Leve" : "Grave",
              (propuesta.grave ? "grave" : "leve") === g ? " \xB7 propuesta" : ""
            )
          )
        ),
        h("p", { class: propuesta.grave ? "cita" : "sutil" }, textoPropuesta(propuesta))
      ),
      (resultado === "no_conforme" || resultado === "no_accesible" || (hallazgo?.observaciones ?? "") !== "") && h("textarea", {
        class: "observaciones",
        rows: "2",
        disabled: soloLectura,
        placeholder: resultado === "no_accesible" ? "Motivo por el que no se ha podido acceder" : "Observaciones",
        valor: hallazgo?.observaciones ?? "",
        oninput: (e) => acciones.alObservar(punto.codigo, e.target.value)
      }),
      !soloLectura && h(
        "div",
        { class: "fotos" },
        h(
          "label",
          { class: "boton-foto" },
          "\u{1F4F7} A\xF1adir foto",
          h("input", {
            type: "file",
            accept: "image/*",
            // `capture` hace que en el móvil se abra la cámara directamente.
            capture: "environment",
            hidden: true,
            onchange: (e) => {
              const entrada = e.target;
              const fichero = entrada.files?.[0];
              if (fichero) acciones.alAnadirFoto(punto.codigo, fichero);
              entrada.value = "";
            }
          })
        ),
        (hallazgo?.fotos.length ?? 0) > 0 && h("span", { class: "sutil" }, `${hallazgo?.fotos.length} foto(s)`)
      )
    )
  );
}
function pintarGuion(guion, hallazgos, datosPunto, registro, visitaActiva, acciones, soloLectura = false) {
  return h(
    "div",
    {},
    soloLectura && h(
      "p",
      { class: "salvedad" },
      "\u{1F512} Acta firmada. El registro es inalterable: para corregir algo hay que levantar un acta nueva que haga referencia a esta."
    ),
    ...guion.bloques.map(
      (bloque) => h(
        "section",
        { class: "bloque" },
        h(
          "h2",
          {},
          `${bloque.codigo}. ${bloque.titulo}`,
          bloque.requiereSeco && h("span", { class: "etiqueta" }, "en seco"),
          // La hoja anota en la cabecera de cada bloque la norma de la que cuelga. Es
          // información de la empresa, no del BOE, y merece verse.
          bloque.normaCitada !== null && h("span", { class: "etiqueta norma" }, bloque.normaCitada)
        ),
        ...bloque.puntos.map(
          (p) => pintarPunto(
            p,
            hallazgos[p.codigo],
            datosPunto[p.codigo] ?? {},
            registro.filter((r) => r.puntoId === p.codigo && r.visita !== visitaActiva),
            acciones,
            soloLectura
          )
        )
      )
    ),
    // Los bloques excluidos se enseñan, no se esconden. Que el inspector vea qué se ha
    // dejado fuera y por qué es parte de que el guion sea auditable: si el recorte es
    // incorrecto, se detecta aquí y no cuando ya se ha firmado el acta.
    guion.omitidos.length > 0 && h(
      "section",
      { class: "bloque omitidos" },
      h("h2", {}, "Bloques no incluidos en este reconocimiento"),
      h(
        "ul",
        {},
        ...guion.omitidos.map(
          (b) => h("li", {}, h("b", {}, `${b.codigo}. ${b.titulo}`), ` \u2014 ${b.omitidoPorque}`)
        )
      )
    )
  );
}

// src/vista/mantenimiento.ts
var NOMBRE_ESTADO = {
  vencido: "Vencido",
  proximo: "Pr\xF3ximo",
  pendiente: "Pendiente",
  sin_registro: "Sin registro",
  vigente: "Al d\xEDa"
};
var NOMBRE_ACCION = { revisar: "Revisar", sustituir: "Sustituir" };
var NOMBRE_TALLER = {
  oficial: "servicio oficial",
  recomendado: "taller recomendado"
};
var NOMBRE_ORIGEN = {
  fabricante: "Fabricante",
  propia: "Propia",
  analisis: "An\xE1lisis de fallos",
  norma: "Norma",
  inspeccion: "Inspecci\xF3n"
};
var NOMBRE_TIPO2 = {
  motor_intraborda_diesel: "Motor intraborda di\xE9sel",
  motor_intraborda_gasolina: "Motor intraborda gasolina",
  fueraborda: "Motor fueraborda",
  generador: "Generador",
  otro: "Otro"
};
function textoProxima(l) {
  const { fecha, horas, fechaEstimada } = l.proxima;
  const partes = [];
  if (horas !== void 0) partes.push(`a las ${horas} h`);
  if (fecha !== void 0) partes.push(`el ${fechaLarga(fecha)}`);
  let texto = partes.length === 2 ? `${partes[0]} o ${partes[1]}, lo que llegue antes` : partes[0] ?? "";
  if (fechaEstimada !== void 0) {
    texto += ` (a este ritmo de uso, hacia el ${fechaLarga(fechaEstimada)})`;
  }
  return texto;
}
function textoUltima(l) {
  if (l.ultimaVez === void 0) return void 0;
  const base = l.origen === "inspeccion" ? "Detectada el" : "\xDAltima vez:";
  return `${base} ${fechaLarga(l.ultimaVez.fecha)}` + (l.ultimaVez.horas !== void 0 ? `, a las ${l.ultimaVez.horas} h` : "");
}
function formularioHecho(l, acciones) {
  let fecha = hoy();
  let horas = l.horasActuales !== void 0 ? String(l.horasActuales) : "";
  let quien = "";
  let descripcion = l.origen === "inspeccion" ? "" : l.tarea;
  const esDeficiencia = l.deficienciaId !== void 0;
  const conHoras = l.componenteId !== void 0;
  return h(
    "details",
    { class: "registrar-hecho" },
    h("summary", {}, esDeficiencia ? "Marcar corregida" : "Registrar hecho"),
    h(
      "div",
      { class: "formulario-corto" },
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Fecha"),
        h("input", {
          type: "date",
          valor: fecha,
          oninput: (e) => {
            fecha = e.target.value;
          }
        })
      ),
      conHoras && h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Horas del motor"),
        h("input", {
          type: "number",
          inputmode: "decimal",
          valor: horas,
          oninput: (e) => {
            horas = e.target.value;
          }
        }),
        h("small", { class: "campo-ayuda" }, "Fijan cu\xE1ndo toca la pr\xF3xima vez por horas.")
      ),
      esDeficiencia && h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Qu\xE9 se hizo"),
        h("input", {
          type: "text",
          placeholder: "Bomba sustituida, manguito cambiado\u2026",
          oninput: (e) => {
            descripcion = e.target.value;
          }
        })
      ),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Qui\xE9n lo hizo"),
        h("input", {
          type: "text",
          placeholder: "El propietario, taller, servicio oficial\u2026",
          oninput: (e) => {
            quien = e.target.value;
          }
        })
      ),
      h(
        "button",
        {
          type: "button",
          onclick: () => {
            const n = Number(horas.replace(",", "."));
            acciones.alRegistrarTrabajo({
              fecha,
              ...conHoras && horas.trim() !== "" && Number.isFinite(n) ? { horas: n } : {},
              ...l.componenteId !== void 0 ? { componenteId: l.componenteId } : {},
              ...l.tareaId !== void 0 ? { tareaId: l.tareaId } : {},
              ...l.deficienciaId !== void 0 ? { cierraDeficiencia: l.deficienciaId } : {},
              descripcion: descripcion.trim() || l.tarea,
              realizadoPor: quien.trim()
            });
          }
        },
        "Guardar"
      )
    )
  );
}
function pintarLinea(l, acciones) {
  const ultima = textoUltima(l);
  const proxima = textoProxima(l);
  return h(
    "li",
    { class: `linea-plan ${l.estado}` },
    h(
      "div",
      { class: "linea-plan-cabecera" },
      h("span", { class: `marca-estado ${l.estado}` }, NOMBRE_ESTADO[l.estado]),
      h("b", {}, l.tarea)
    ),
    h(
      "p",
      { class: "sutil" },
      [
        NOMBRE_ORIGEN[l.origen],
        l.componente,
        l.accion !== void 0 ? NOMBRE_ACCION[l.accion] : void 0,
        l.taller !== void 0 ? NOMBRE_TALLER[l.taller] : void 0,
        l.rodaje === true ? "revisi\xF3n de rodaje" : void 0
      ].filter(Boolean).join(" \xB7 ")
    ),
    proxima !== "" && h("p", {}, (l.estado === "vencido" ? "Tocaba " : "Toca ") + proxima + "."),
    l.horasActuales !== void 0 && l.proxima.horas !== void 0 && h("p", { class: "sutil" }, `El hor\xF3metro marca ${l.horasActuales} h.`),
    ultima !== void 0 && h("p", { class: "sutil" }, ultima + "."),
    l.notas !== void 0 && h("p", { class: "sutil" }, l.notas),
    ...l.avisos.map((a) => h("p", { class: "salvedad" }, `\u26A0 ${a}`)),
    h("div", { class: "cita" }, l.fuente),
    // La cita deja de ser un texto y pasa a ser algo que se comprueba: se abre el manual.
    acciones?.alVerFuente !== void 0 && l.planId !== void 0 && h(
      "button",
      { type: "button", class: "enlace", onclick: () => acciones.alVerFuente?.(l.planId, l.fuente) },
      "Ver en el manual"
    ),
    acciones !== void 0 && (l.tareaId !== void 0 || l.deficienciaId !== void 0) && formularioHecho(l, acciones)
  );
}
function panelPlan(plan, acciones) {
  const urgentes = plan.lineas.filter((l) => l.estado === "vencido" || l.estado === "proximo");
  const pendientes2 = plan.lineas.filter((l) => l.estado === "pendiente");
  const sinRegistro = plan.lineas.filter((l) => l.estado === "sin_registro");
  const alDia = plan.lineas.filter((l) => l.estado === "vigente");
  const lista2 = (lineas) => h("ul", { class: "plan" }, ...lineas.map((l) => pintarLinea(l, acciones)));
  return h(
    "div",
    { class: "tarjeta plan-mantenimiento" },
    h("h2", {}, "Plan de mantenimiento"),
    h(
      "p",
      { class: "sutil" },
      "Lo que toca hacerle al barco, de lo m\xE1s urgente a lo que est\xE1 en regla. Junta el manual del fabricante, la norma y lo que dej\xF3 abierto la \xFAltima inspecci\xF3n; cada l\xEDnea dice de d\xF3nde sale."
    ),
    ...plan.avisos.map((a) => h("p", { class: "salvedad" }, `\u26A0 ${a}`)),
    plan.lineas.length === 0 && h(
      "p",
      { class: "vacio" },
      "Todav\xEDa no hay nada que planificar: a\xF1ada los componentes del barco (el motor, por ejemplo) para que el sistema busque su plan del fabricante."
    ),
    urgentes.length > 0 && h("h3", {}, `Hay que actuar (${urgentes.length})`),
    urgentes.length > 0 && lista2(urgentes),
    pendientes2.length > 0 && h("h3", {}, `Deficiencias abiertas (${pendientes2.length})`),
    pendientes2.length > 0 && lista2(pendientes2),
    // Lo que no se sabe va plegado: es información, pero no debe tapar lo urgente.
    sinRegistro.length > 0 && h(
      "details",
      {},
      h("summary", {}, `Sin registro (${sinRegistro.length}) \u2014 no consta cu\xE1ndo se hizo`),
      lista2(sinRegistro)
    ),
    alDia.length > 0 && h("details", {}, h("summary", {}, `Al d\xEDa (${alDia.length})`), lista2(alDia))
  );
}
function panelComponentes(componentes, lecturas, pautas, acciones) {
  const activos = componentes.filter((c) => c.baja === void 0);
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Componentes y hor\xF3metros"),
    activos.length === 0 && h("p", { class: "vacio" }, "Sin componentes registrados."),
    ...activos.map((c) => {
      const plan = planDe(c, pautas);
      const parecido = plan === void 0 ? planParecido(c, pautas) : void 0;
      const porConstar = [
        ...new Set(
          (plan?.tareas ?? []).map((t) => t.soloSi?.equipamiento).filter((e) => e !== void 0 && c.equipamiento?.[e] === void 0)
        )
      ];
      const serie = lecturas.filter((l) => l.componenteId === c.id).sort((a, b) => a.fecha.localeCompare(b.fecha));
      const ultima = serie.at(-1);
      let horas = "";
      let fecha = hoy();
      return h(
        "div",
        { class: "componente" },
        h("b", {}, c.nombre),
        h(
          "p",
          { class: "sutil" },
          [
            NOMBRE_TIPO2[c.tipo],
            c.marca,
            c.modelo,
            c.transmision,
            ...Object.entries(c.equipamiento ?? {}).map(
              ([e, tiene]) => `${tiene ? "con" : "sin"} ${NOMBRE_EQUIPAMIENTO[e]}`
            ),
            c.numeroSerie && `n.\xBA ${c.numeroSerie}`
          ].filter(Boolean).join(" \xB7 ")
        ),
        h(
          "p",
          { class: plan !== void 0 ? "cita" : "salvedad" },
          plan !== void 0 ? `Plan: ${plan.documento} \u2014 ${plan.tabla}` : "\u26A0 Sin plan del fabricante en el cat\xE1logo para este modelo."
        ),
        // Sugerir no es asignar: lo decide quien tiene la placa delante (ADR-012).
        parecido !== void 0 && h(
          "div",
          { class: "salvedad accionable" },
          h(
            "p",
            {},
            `El cat\xE1logo tiene el plan del ${parecido.modelo}. Si \xAB${c.modelo}\xBB es ese modelo con su c\xF3digo de tipo, as\xEDgneselo; si es otro modelo, tiene su propio manual.`
          ),
          h(
            "button",
            { type: "button", onclick: () => acciones.alAsignarPlan(c.id, parecido.plan.id) },
            `Asignar el plan del ${parecido.modelo}`
          )
        ),
        ...porConstar.map(
          (e) => h(
            "div",
            { class: "salvedad accionable" },
            h("p", {}, `\xBFTiene ${NOMBRE_EQUIPAMIENTO[e]}? Hay tareas del manual que dependen de ello.`),
            h("button", { type: "button", onclick: () => acciones.alFijarEquipamiento(c.id, e, true) }, "S\xED"),
            " ",
            h("button", { type: "button", onclick: () => acciones.alFijarEquipamiento(c.id, e, false) }, "No")
          )
        ),
        h(
          "p",
          {},
          ultima !== void 0 ? `Hor\xF3metro: ${ultima.horas} h el ${fechaLarga(ultima.fecha)}` : "Sin lecturas del hor\xF3metro."
        ),
        h(
          "div",
          { class: "fila-lectura" },
          h("input", {
            type: "number",
            inputmode: "decimal",
            placeholder: "Horas",
            oninput: (e) => {
              horas = e.target.value;
            }
          }),
          h("input", {
            type: "date",
            valor: fecha,
            oninput: (e) => {
              fecha = e.target.value;
            }
          }),
          h(
            "button",
            {
              type: "button",
              onclick: () => {
                const n = Number(horas.replace(",", "."));
                if (horas.trim() === "" || !Number.isFinite(n)) return;
                acciones.alAnotarLectura({ componenteId: c.id, fecha, horas: n });
              }
            },
            "Anotar horas"
          )
        ),
        h(
          "button",
          { class: "enlace", onclick: () => acciones.alDarDeBaja(c.id, hoy()) },
          "Dar de baja (se conserva su historia)"
        )
      );
    }),
    formularioComponente(acciones)
  );
}
function formularioComponente(acciones) {
  const nuevo = {
    nombre: "Motor principal",
    tipo: "motor_intraborda_diesel",
    marca: "",
    modelo: "",
    numeroSerie: "",
    transmision: "",
    trim: "",
    fecha: hoy(),
    horas: "",
    esNuevo: false
  };
  const texto = (etiqueta, clave, ayuda) => h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, etiqueta),
    h("input", {
      type: "text",
      valor: nuevo[clave],
      oninput: (e) => {
        nuevo[clave] = e.target.value;
      }
    }),
    ayuda !== void 0 && h("small", { class: "campo-ayuda" }, ayuda)
  );
  return h(
    "details",
    { class: "alta-componente" },
    h("summary", {}, "+ A\xF1adir un componente"),
    h(
      "div",
      {},
      texto("Nombre", "nombre"),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Tipo"),
        selector(
          Object.entries(NOMBRE_TIPO2).map(([valor2, t]) => ({ valor: valor2, texto: t })),
          nuevo.tipo,
          (v) => {
            nuevo.tipo = v;
          }
        )
      ),
      texto("Marca", "marca"),
      texto(
        "Modelo",
        "modelo",
        "Tal como figura en la placa, sin el c\xF3digo de tipo (BF20D, no BF20D LRTU): de \xE9l depende qu\xE9 manual le corresponde."
      ),
      texto("N\xFAmero de serie", "numeroSerie"),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Transmisi\xF3n"),
        selector(
          [
            { valor: "", texto: "\u2014 no consta" },
            { valor: "inversor", texto: "Inversor y eje" },
            { valor: "saildrive", texto: "Saildrive" }
          ],
          "",
          (v) => {
            nuevo.transmision = v;
          }
        )
      ),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Trim o inclinaci\xF3n el\xE9ctrica"),
        selector(
          [
            { valor: "", texto: "\u2014 no consta" },
            { valor: "si", texto: "S\xED" },
            { valor: "no", texto: "No" }
          ],
          "",
          (v) => {
            nuevo.trim = v;
          }
        ),
        h(
          "small",
          { class: "campo-ayuda" },
          "En los Honda, la letra T del c\xF3digo de tipo. Hay tareas del manual que solo existen con \xE9l."
        )
      ),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Fecha de alta"),
        h("input", {
          type: "date",
          valor: nuevo.fecha,
          oninput: (e) => {
            nuevo.fecha = e.target.value;
          }
        })
      ),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Horas en el alta"),
        h("input", {
          type: "number",
          inputmode: "decimal",
          oninput: (e) => {
            nuevo.horas = e.target.value;
          }
        })
      ),
      h(
        "label",
        { class: "casilla" },
        h("input", {
          type: "checkbox",
          onchange: (e) => {
            nuevo.esNuevo = e.target.checked;
          }
        }),
        h("span", {}, " Es nuevo (se conoce su historia desde cero; toca la revisi\xF3n de rodaje)")
      ),
      h(
        "button",
        {
          type: "button",
          onclick: () => {
            const horas = Number(nuevo.horas.replace(",", "."));
            acciones.alAnadirComponente({
              nombre: nuevo.nombre.trim() || "Componente",
              tipo: nuevo.tipo,
              ...nuevo.marca.trim() !== "" ? { marca: nuevo.marca.trim() } : {},
              ...nuevo.modelo.trim() !== "" ? { modelo: nuevo.modelo.trim() } : {},
              ...nuevo.numeroSerie.trim() !== "" ? { numeroSerie: nuevo.numeroSerie.trim() } : {},
              ...nuevo.transmision !== "" ? { transmision: nuevo.transmision } : {},
              ...nuevo.trim !== "" ? { equipamiento: { trim_electrico: nuevo.trim === "si" } } : {},
              alta: {
                fecha: nuevo.fecha,
                ...nuevo.horas.trim() !== "" && Number.isFinite(horas) ? { horas } : {},
                nuevo: nuevo.esNuevo
              }
            });
          }
        },
        "A\xF1adir"
      )
    )
  );
}

// src/vista/propietario.ts
function linea(l) {
  const proxima = textoProxima(l);
  const ultima = textoUltima(l);
  return h(
    "li",
    { class: `linea-plan ${l.estado}` },
    h(
      "div",
      { class: "linea-plan-cabecera" },
      h("span", { class: `marca-estado ${l.estado}` }, NOMBRE_ESTADO[l.estado]),
      h("b", {}, l.componente !== void 0 ? `${l.tarea} (${l.componente.toLowerCase()})` : l.tarea)
    ),
    proxima !== "" && h("p", {}, (l.estado === "vencido" ? "Tocaba " : "Toca ") + proxima + "."),
    ultima !== void 0 && h("p", { class: "sutil" }, ultima + "."),
    ...l.avisos.filter((a) => /deficiencia grave/.test(a)).map((a) => h("p", { class: "salvedad" }, `\u26A0 ${a}`)),
    h("div", { class: "cita" }, l.fuente)
  );
}
function situacionCertificado(vencimientos) {
  const certificado = vencimientos.find((v) => v.clase === "certificado");
  const siguientes = vencimientos.filter((v) => v.clase === "solicitud" || v.clase === "reconocimiento" && v.diasRestantes >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (certificado === void 0) {
    return h(
      "p",
      { class: "sutil" },
      "No consta la fecha del certificado de navegabilidad: no se puede decir hasta cu\xE1ndo est\xE1 en vigor."
    );
  }
  return h(
    "div",
    { class: `certificado ${certificado.estado}` },
    h(
      "p",
      {},
      h("b", {}, certificado.estado === "vencido" ? "Certificado caducado" : "Certificado en vigor"),
      ` \u2014 ${certificado.estado === "vencido" ? "caduc\xF3" : "caduca"} el ${fechaLarga(certificado.fecha)}.`
    ),
    ...siguientes.map(
      (v) => h(
        "p",
        {},
        `${v.concepto}: ${fechaLarga(v.fecha)}` + (v.diasRestantes < 0 ? " (ya pasada)." : ".")
      )
    ),
    h("div", { class: "cita" }, certificado.cita)
  );
}
function pintarEstadoPropietario(e, hoy2) {
  const lineas = e.plan.lineas;
  const actuar = lineas.filter((l) => l.estado === "vencido" || l.estado === "proximo");
  const deficiencias = lineas.filter((l) => l.estado === "pendiente");
  const sinRegistro = lineas.filter((l) => l.estado === "sin_registro");
  const alDia = lineas.filter((l) => l.estado === "vigente");
  const vencidas = lineas.filter((l) => l.estado === "vencido").length;
  const barco2 = e.embarcacion;
  return h(
    "div",
    { class: "propietario" },
    h("h1", {}, barco2?.nombre ?? "Embarcaci\xF3n"),
    h(
      "p",
      { class: "sutil" },
      `Matr\xEDcula ${e.matricula}` + (barco2 !== void 0 ? ` \xB7 ${barco2.esloraCascoM} m \xB7 lista ${barco2.lista}.\xAA` : "") + ` \xB7 Estado a ${fechaLarga(hoy2)}`
    ),
    h(
      "div",
      { class: `resumen-propietario ${vencidas > 0 ? "vencido" : actuar.length > 0 ? "proximo" : "vigente"}` },
      h(
        "p",
        { class: "resumen-cifra" },
        vencidas > 0 ? `${vencidas} ${vencidas === 1 ? "cosa vencida" : "cosas vencidas"}` : actuar.length > 0 ? `${actuar.length} ${actuar.length === 1 ? "cosa toca" : "cosas tocan"} pronto` : "Todo lo registrado est\xE1 al d\xEDa"
      ),
      h(
        "p",
        {},
        `${actuar.length} para actuar \xB7 ${deficiencias.length} deficiencias abiertas \xB7 ${sinRegistro.length} sin registro \xB7 ${alDia.length} al d\xEDa`
      )
    ),
    h("h2", {}, "Certificado de navegabilidad"),
    situacionCertificado(e.vencimientos),
    h("h2", {}, "Lo que hay que hacer"),
    actuar.length === 0 ? h("p", { class: "vacio" }, "Nada vencido ni a punto de vencer.") : h("ul", { class: "plan" }, ...actuar.map(linea)),
    deficiencias.length > 0 && h("h2", {}, "Deficiencias de la \xFAltima inspecci\xF3n, sin corregir"),
    deficiencias.length > 0 && h("ul", { class: "plan" }, ...deficiencias.map(linea)),
    sinRegistro.length > 0 && h("h2", {}, "Sin registro"),
    sinRegistro.length > 0 && h(
      "p",
      { class: "sutil" },
      "De estas tareas no consta cu\xE1ndo se hicieron por \xFAltima vez. No quiere decir que est\xE9n vencidas: quiere decir que no se sabe. Anotar el \xFAltimo trabajo, o hacerlas y registrarlas, las pone al d\xEDa."
    ),
    sinRegistro.length > 0 && h("ul", { class: "lista-compacta" }, ...sinRegistro.map((l) => h("li", {}, l.tarea))),
    alDia.length > 0 && h("h2", {}, "Al d\xEDa"),
    alDia.length > 0 && h(
      "ul",
      { class: "lista-compacta" },
      ...alDia.map(
        (l) => h("li", {}, `${l.tarea} \u2014 ${textoProxima(l).replace(/^a las/, "pr\xF3xima a las").replace(/^el /, "pr\xF3xima el ")}`)
      )
    ),
    h(
      "p",
      { class: "pie-propietario sutil" },
      "Generado por la aplicaci\xF3n del TFG \xABInspecci\xF3n t\xE9cnica y gesti\xF3n del mantenimiento de embarcaciones de recreo\xBB a partir del expediente de la embarcaci\xF3n. Los plazos del fabricante son los de su manual, que advierte que deben ajustarse al uso de cada motor."
    )
  );
}

// src/vista/acta.ts
function panelResultado(resultado, avance) {
  const v = veredicto(resultado, avance);
  return h(
    "div",
    { class: `tarjeta resultado ${v}` },
    h("h2", {}, `Resultado: ${textoVeredicto(v, avance)}`),
    h(
      "p",
      { class: "avance" },
      `${avance.respondidos} de ${avance.total} puntos respondidos.`,
      !avance.completo && ` Faltan ${avance.pendientes.length}: ${avance.pendientes.slice(0, 8).join(", ")}` + (avance.pendientes.length > 8 ? "\u2026" : "")
    ),
    resultado.deficienciasGraves.length > 0 && h(
      "div",
      {},
      h("h3", {}, `Deficiencias graves (${resultado.deficienciasGraves.length})`),
      h(
        "ul",
        {},
        ...resultado.deficienciasGraves.map(
          (d) => h(
            "li",
            {},
            h("b", {}, d.puntoId),
            d.letraAnexoIII !== void 0 && ` \u2014 Anexo III ${d.letraAnexoIII})`,
            d.observaciones !== void 0 && d.observaciones !== "" ? `: ${d.observaciones}` : ""
          )
        )
      )
    ),
    resultado.deficienciasLeves.length > 0 && h("p", {}, `Deficiencias leves: ${resultado.deficienciasLeves.length}`),
    resultado.noAccesibles.length > 0 && h(
      "p",
      { class: "salvedad" },
      `\u26A0 ${resultado.noAccesibles.length} punto(s) no accesibles: ` + resultado.noAccesibles.map((n) => n.puntoId).join(", ")
    ),
    resultado.limiteSubsanacion !== void 0 && h(
      "p",
      { class: "plazo" },
      h("b", {}, "Plazo de subsanaci\xF3n: "),
      `hasta el ${fechaLarga(resultado.limiteSubsanacion)}. `,
      h(
        "span",
        { class: "sutil" },
        "Art. 10.2.\xBA del RD 1434/1999: dos meses como m\xE1ximo para subsanar. Transcurrido el plazo sin superar la inspecci\xF3n, la entidad lo comunica a la Capitan\xEDa Mar\xEDtima y el certificado caduca."
      )
    )
  );
}
function pintarActa(inspeccion, guion, resultado, avance, zona2, campos, contrastes) {
  const e = inspeccion.embarcacion;
  const v = veredicto(resultado, avance);
  const puntos = puntosDe(guion);
  const motivo = campos.tipos_reconocimiento.find((t) => t.clave === inspeccion.motivo);
  const nombreEquipo = (clave) => campos.equipos_medida.find((q) => q.clave === clave)?.etiqueta ?? clave;
  const fila = (etiqueta, valor2) => h("tr", {}, h("th", {}, etiqueta), h("td", {}, valor2));
  return h(
    "article",
    { class: "acta" },
    h("h1", {}, "Acta de reconocimiento"),
    h(
      "p",
      { class: "acta-norma" },
      "Real Decreto 1434/1999, de 10 de septiembre \xB7 Reconocimiento ",
      h("b", {}, nombreTipo(inspeccion.tipo)),
      // El motivo se escribe junto al tipo legal, no en su lugar. La hoja de campos
      // distingue diez motivos donde la norma define cinco tipos, y el acta tiene que
      // ser a la vez correcta —cita la categoría legal— y comprensible —dice por qué se
      // hizo el reconocimiento—. Siempre, también cuando coincide con el tipo: «toda
      // inspección tiene un motivo y tiene que figurar» (director, 15/09/2026).
      motivo !== void 0 && h(
        "span",
        {},
        " \xB7 Motivo: ",
        h("b", {}, motivo.tipo_libre === true ? inspeccion.motivoOtros ?? motivo.etiqueta : motivo.etiqueta)
      )
    ),
    h(
      "table",
      { class: "acta-datos" },
      fila("N\xBA de informe", inspeccion.numeroInforme),
      fila("Embarcaci\xF3n", e.nombre),
      fila("Bandera", inspeccion.identificacion.banderaEspanola ? "Espa\xF1ola" : "Otras"),
      fila(
        inspeccion.identificacion.banderaEspanola ? "Inscripci\xF3n / matr\xEDcula" : "NIB",
        e.matricula
      ),
      inspeccion.identificacion.win !== "" && fila("WIN", inspeccion.identificacion.win),
      fila("Lista", `${e.lista}.\xAA`),
      fila("Eslora de casco", `${e.esloraCascoM} m`),
      fila("Material del casco", e.materialCasco.replace(/_/g, " ")),
      fila("Marcado CE", e.marcadoCE ? `S\xED (categor\xEDa ${e.categoriaDiseno ?? "\u2014"})` : "No"),
      fila("Fecha", fechaLarga(inspeccion.fecha)),
      fila("Lugar", inspeccion.lugar),
      fila("Inspector", inspeccion.inspector),
      fila("Normativa aplicada", inspeccion.versionCatalogo)
    ),
    // --- Visitas -------------------------------------------------------------------
    // Un reconocimiento se hace en varias idas al barco, y el acta tiene que decir
    // cuándo, dónde y en qué condición se hizo cada una. Es la tabla de la hoja real.
    h("h2", {}, "Visitas realizadas"),
    h(
      "table",
      { class: "acta-puntos" },
      h(
        "thead",
        {},
        h(
          "tr",
          {},
          h("th", {}, "Visita"),
          h("th", {}, "Fecha"),
          h("th", {}, "Lugar"),
          h("th", {}, "Condici\xF3n"),
          h("th", {}, "Refrendo")
        )
      ),
      h(
        "tbody",
        {},
        ...campos.visitas.columnas.filter((c) => inspeccion.visitas[c.clave] !== void 0).map((c) => {
          const v2 = inspeccion.visitas[c.clave];
          return h(
            "tr",
            {},
            h("td", {}, c.etiqueta),
            h("td", {}, fechaLarga(v2.fecha)),
            h("td", {}, v2.lugar),
            h("td", {}, v2.condicion === "seco" ? "En seco" : "A flote"),
            h("td", {}, v2.refrendo)
          );
        })
      )
    ),
    h("p", { class: `acta-resultado ${v}` }, `RESULTADO ${textoVeredicto(v, avance)}`),
    resultado.limiteSubsanacion !== void 0 && h(
      "p",
      { class: "acta-plazo" },
      `Plazo de subsanaci\xF3n hasta el ${fechaLarga(resultado.limiteSubsanacion)} (art. 10.2.\xBA del RD 1434/1999).`
    ),
    h("h2", {}, "Zona de navegaci\xF3n"),
    h(
      "table",
      { class: "acta-datos" },
      fila(
        "Zona autorizada",
        zona2.zona !== void 0 ? `Zona ${zona2.zona} \u2014 ${DESCRIPCION_ZONA[zona2.zona]}` : "Ninguna: el equipo a bordo no alcanza la zona menos exigente"
      ),
      fila(
        "Techo por categor\xEDa de dise\xF1o",
        zona2.techo !== void 0 ? `Zona ${zona2.techo} (art. 3.3 del RD 339/2021)` : "No consta: sin marcado CE, se toma del certificado (art. 3.4)"
      ),
      fila("Personas a bordo", String(inspeccion.personasABordo)),
      zona2.personasAptas !== void 0 && fila(
        "Apta para",
        `${zona2.personasAptas} personas: el equipo que depende de las personas no cubre a las ${inspeccion.personasABordo} declaradas (${zona2.limitanPersonas.map((c) => c.nombre.toLowerCase()).join(", ")})`
      ),
      fila("Navegaci\xF3n", inspeccion.navegacionDiurna ? "Exclusivamente diurna" : "Sin restricci\xF3n horaria")
    ),
    (zona2.faltaParaSubir.length > 0 || zona2.carenciasEnZonaAlcanzada.length > 0) && h(
      "div",
      {},
      h(
        "p",
        { class: "sutil" },
        zona2.carenciasEnZonaAlcanzada.length > 0 ? "Carencias frente a la zona menos exigente:" : `Para alcanzar la zona ${zona2.siguienteZona} faltar\xEDa:`
      ),
      h(
        "ul",
        {},
        ...(zona2.carenciasEnZonaAlcanzada.length > 0 ? zona2.carenciasEnZonaAlcanzada : zona2.faltaParaSubir).map(
          (c) => h(
            "li",
            {},
            `${c.nombre}: ${describirCarencia(c)} `,
            h("i", {}, `(${c.cita})`)
          )
        )
      )
    ),
    h("h2", {}, "Puntos inspeccionados"),
    h(
      "table",
      { class: "acta-puntos" },
      h(
        "thead",
        {},
        h(
          "tr",
          {},
          h("th", {}, "Punto"),
          h("th", {}, "Anexo II"),
          h("th", {}, "Concepto"),
          h("th", {}, "Visita"),
          h("th", {}, "Resultado"),
          h("th", {}, "Observaciones")
        )
      ),
      h(
        "tbody",
        {},
        ...puntos.map((p) => {
          const hallazgo = inspeccion.hallazgos[p.codigo];
          const resultadoTexto = hallazgo === void 0 ? "sin responder" : hallazgo.resultado === "no_conforme" ? hallazgo.gravedad === "grave" ? `INCORRECTO \u2014 GRAVE${hallazgo.letraAnexoIII !== void 0 ? ` (An. III ${hallazgo.letraAnexoIII})` : ""}` : "Incorrecto \u2014 leve" : hallazgo.resultado === "conforme" ? "Correcto" : hallazgo.resultado.replace(/_/g, " ");
          return h(
            "tr",
            { class: hallazgo?.resultado ?? "sin-responder" },
            h("td", {}, p.codigo),
            // La cita normativa acompaña a cada punto: el guion sigue la hoja de la
            // empresa, pero el acta tiene que poder leerse contra el BOE.
            h("td", {}, p.anexoII ?? "\u2014"),
            h("td", {}, p.titulo),
            h("td", {}, hallazgo?.visita ?? ""),
            h("td", {}, resultadoTexto),
            h("td", {}, hallazgo?.observaciones ?? "")
          );
        })
      )
    ),
    // --- Declarado frente a comprobado ---------------------------------------------
    // Es de lo más valioso que puede llevar el acta y no lo lleva ningún formulario: la
    // diferencia entre lo que consta en los papeles de la embarcación y lo que se ha
    // verificado a bordo. Va antes de los datos porque es una conclusión, no un dato.
    contrastes.length > 0 && h(
      "div",
      {},
      h("h2", {}, "Declarado frente a comprobado"),
      h(
        "table",
        { class: "acta-puntos" },
        h(
          "thead",
          {},
          h(
            "tr",
            {},
            h("th", {}, "Concepto"),
            h("th", {}, "Declarado"),
            h("th", {}, "Comprobado"),
            h("th", {}, "Observaci\xF3n")
          )
        ),
        h(
          "tbody",
          {},
          ...contrastes.map(
            (c) => h(
              "tr",
              { class: c.nivel },
              h("td", {}, c.titulo),
              h("td", {}, c.declarado),
              h("td", {}, c.comprobado),
              h(
                "td",
                {},
                c.explicacion,
                c.cita !== void 0 && h("i", {}, ` (${c.cita})`)
              )
            )
          )
        )
      )
    ),
    // --- Datos tomados a bordo ------------------------------------------------------
    // Las casillas de la hoja: WIN, tipo de transmisión, peso del ancla y cómo se supo,
    // diámetro del eslabón... Son medidas y observaciones, no calificaciones, y el acta
    // las lleva porque son lo que permite repetir el trabajo dentro de cinco años.
    Object.keys(inspeccion.datosPunto).length > 0 && h(
      "div",
      {},
      h("h2", {}, "Datos tomados a bordo"),
      h(
        "table",
        { class: "acta-puntos" },
        h(
          "tbody",
          {},
          ...puntos.flatMap(
            (p) => p.campos.filter((c) => (inspeccion.datosPunto[p.codigo]?.[c.campo] ?? "") !== "").map(
              (c) => h(
                "tr",
                {},
                h("td", {}, p.codigo),
                h("td", {}, c.etiqueta),
                h("td", {}, inspeccion.datosPunto[p.codigo][c.campo])
              )
            )
          )
        )
      )
    ),
    // --- Equipos de medida ----------------------------------------------------------
    // Con su número de identificación. Es trazabilidad metrológica: un acta que dice que
    // el ancla pesa 12 kg sin decir con qué se pesó no es un documento técnico completo.
    inspeccion.equiposMedida.length > 0 && h(
      "div",
      {},
      h("h2", {}, "Equipos utilizados"),
      h(
        "ul",
        {},
        ...inspeccion.equiposMedida.map(
          (q) => h(
            "li",
            {},
            nombreEquipo(q.clave),
            q.identificador !== "" ? ` \u2014 identificaci\xF3n ${q.identificador}` : ""
          )
        )
      )
    ),
    inspeccion.observacionesGenerales !== "" && h(
      "div",
      {},
      h("h2", {}, "Observaciones al reconocimiento"),
      h("p", { class: "acta-observaciones" }, inspeccion.observacionesGenerales)
    ),
    guion.omitidos.length > 0 && h(
      "div",
      {},
      h("h2", {}, "Bloques no incluidos"),
      h(
        "ul",
        {},
        ...guion.omitidos.map(
          (b) => h("li", {}, `${b.codigo}. ${b.titulo} \u2014 ${b.omitidoPorque}`)
        )
      )
    ),
    h(
      "p",
      { class: "acta-pie" },
      inspeccion.firmadaEn !== void 0 ? `Acta firmada el ${new Date(inspeccion.firmadaEn).toLocaleString("es-ES")}.` : "BORRADOR \u2014 acta sin firmar.",
      " Documento generado por el sistema desarrollado como Trabajo de Fin de Grado. ",
      h(
        "b",
        {},
        "No tiene validez oficial: es un prototipo acad\xE9mico."
      )
    )
  );
}

// src/vista/equipo.ts
function panelZona(zona2) {
  const alcanzada = zona2.zona;
  return h(
    "div",
    { class: `tarjeta zona ${alcanzada === void 0 ? "ninguna" : "alcanzada"}` },
    h("h2", {}, "Zona de navegaci\xF3n"),
    alcanzada === void 0 ? h(
      "p",
      { class: "zona-numero ninguna" },
      "El equipo a bordo no alcanza ninguna zona"
    ) : h(
      "div",
      {},
      h("p", { class: "zona-numero" }, `ZONA ${alcanzada}`),
      h("p", { class: "zona-descripcion" }, DESCRIPCION_ZONA[alcanzada])
    ),
    // Lo que depende de las personas limita las personas, no la zona (criterio del
    // director, 15/09/2026): «si necesita 5 chalecos y tiene 4, es apto para 4 personas».
    zona2.personasAptas !== void 0 && h(
      "div",
      { class: "falta-subir" },
      h("h3", {}, `Apta para ${zona2.personasAptas} personas, no para las declaradas`),
      h("ul", {}, ...zona2.limitanPersonas.map(pintarCarencia)),
      h(
        "p",
        { class: "sutil" },
        "Solo cuentan los chalecos homologados con la flotabilidad exigida: el que no cumple no cuenta. O se completa el equipo, o se navega con menos personas."
      )
    ),
    zona2.techo !== void 0 && h(
      "p",
      { class: "sutil" },
      `Techo por categor\xEDa de dise\xF1o: zona ${zona2.techo}. `,
      zona2.enElTecho ? "La embarcaci\xF3n est\xE1 en el m\xE1ximo que su categor\xEDa permite." : "El equipo a bordo no llega al m\xE1ximo que su categor\xEDa permitir\xEDa.",
      " (art. 3.3 del RD 339/2021)"
    ),
    // Lo accionable: no «puedes navegar en zona 7», sino «con esto más, en la 6».
    zona2.siguienteZona !== void 0 && zona2.faltaParaSubir.length > 0 && h(
      "div",
      { class: "falta-subir" },
      h(
        "h3",
        {},
        `Para alcanzar la zona ${zona2.siguienteZona} (${DESCRIPCION_ZONA[zona2.siguienteZona]}) falta:`
      ),
      h("ul", {}, ...zona2.faltaParaSubir.map(pintarCarencia))
    ),
    zona2.carenciasEnZonaAlcanzada.length > 0 && h(
      "div",
      { class: "falta-subir" },
      h("h3", {}, "Carencias frente a la zona menos exigente:"),
      h("ul", {}, ...zona2.carenciasEnZonaAlcanzada.map(pintarCarencia))
    ),
    ...zona2.avisos.map((a) => h("p", { class: "salvedad" }, `\u26A0 ${a}`))
  );
}
function pintarCarencia(carencia) {
  return h(
    "li",
    {},
    h("b", {}, carencia.nombre),
    `: ${describirCarencia(carencia)}`,
    h("div", { class: "cita" }, carencia.cita)
  );
}
function panelNavegacion(personasABordo, navegacionDiurna, acciones, soloLectura) {
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Navegaci\xF3n prevista"),
    h(
      "p",
      { class: "sutil" },
      "Estos datos no describen el barco, sino la navegaci\xF3n: de ellos dependen las cantidades de chalecos y las plazas de balsa."
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Personas a bordo"),
      h("input", {
        type: "number",
        min: "1",
        valor: personasABordo,
        disabled: soloLectura,
        oninput: (e) => {
          const v = Number(e.target.value);
          if (Number.isInteger(v) && v > 0) acciones.alCambiarPersonas(v);
        }
      })
    ),
    h(
      "label",
      { class: "campo casilla" },
      h("input", {
        type: "checkbox",
        checked: navegacionDiurna,
        disabled: soloLectura,
        onchange: (e) => acciones.alCambiarDiurna(e.target.checked)
      }),
      h("span", {}, " Navegaci\xF3n exclusivamente diurna")
    )
  );
}
function pintarInventario(lineas, noContables, zonaActual2, versionCatalogo2, inventario, acciones, soloLectura) {
  return h(
    "div",
    {},
    h(
      "p",
      { class: "sutil" },
      `Zona evaluada: ${zonaActual2} \u2014 ${DESCRIPCION_ZONA[zonaActual2]}. Se puede anotar tambi\xE9n el equipo de zonas superiores. Calculado con ${versionCatalogo2}.`
    ),
    h("h3", {}, "Equipo a bordo"),
    ...lineas.map(
      (l) => pintarLinea2(l, inventario[l.equipo], zonaActual2, acciones, soloLectura)
    ),
    noContables.length > 0 && h(
      "div",
      {},
      h("h3", {}, "Comprobaciones que no son un recuento"),
      h(
        "p",
        { class: "sutil" },
        "Requisitos cualitativos y remisiones al manual del fabricante: se comprueban mirando el equipo, no cont\xE1ndolo."
      ),
      ...noContables.map((e) => pintarExigencia(e))
    )
  );
}
function textoExigido(cantidad, unidad, minimo) {
  if (minimo) return `m\xEDnimo ${cantidadConUnidad(cantidad, unidad)} por unidad`;
  if (unidad !== void 0) return cantidadConUnidad(cantidad, unidad);
  return cantidad === 1 ? "1 unidad" : `${cantidad} unidades`;
}
function pintarLinea2(linea2, anotado, zonaActual2, acciones, soloLectura) {
  const exigencia = linea2.enZonaActual;
  const exigido = exigencia?.cantidad;
  const minimo = linea2.minimoPorUnidad;
  const aBordo = minimo ? anotado : anotado ?? 0;
  const cubierto = exigido === void 0 || aBordo !== void 0 && aBordo >= exigido;
  const estado2 = exigencia === void 0 ? "futura" : cubierto ? "cubierta" : "carencia";
  return h(
    "div",
    { class: `exigencia ${estado2}` },
    h(
      "div",
      { class: "exigencia-cabecera" },
      h("span", { class: "exigencia-nombre" }, linea2.nombre),
      h(
        "span",
        { class: "exigencia-cantidad" },
        exigencia !== void 0 ? exigido !== void 0 ? minimo ? `\u2265 ${cantidadConUnidad(exigido, exigencia.unidad)}` : cantidadConUnidad(exigido, exigencia.unidad) : "?" : `zona ${linea2.exigidoDesdeZona}`
      )
    ),
    // Cuando el equipo aún no se exige aquí, se dice desde qué zona lo será. Es la
    // información que convierte el recuento en algo con sentido: «esto no te hace falta
    // ahora, pero si quieres llegar a la zona 6, sí».
    exigencia === void 0 && h(
      "p",
      { class: "sutil" },
      `No se exige en zona ${zonaActual2}. Exigible a partir de la zona ${linea2.exigidoDesdeZona}` + (linea2.cantidadEn !== void 0 ? `: ${textoExigido(linea2.cantidadEn, linea2.unidad, minimo)}.` : ".")
    ),
    h(
      "div",
      { class: "contador-equipo" },
      h("span", { class: "sutil" }, minimo ? "Unidad m\xE1s desfavorable:" : "A bordo:"),
      h("input", {
        type: "number",
        min: "0",
        valor: aBordo ?? "",
        placeholder: minimo ? "sin comprobar" : "",
        disabled: soloLectura,
        oninput: (e) => {
          const campo2 = e.target;
          const texto = campo2.value;
          const v = minimo && texto === "" ? void 0 : Number(texto);
          if (v !== void 0 && !(Number.isFinite(v) && v >= 0)) return;
          acciones.alContar(linea2.equipo, v);
          marcarLinea(campo2, exigencia !== void 0 ? exigido : void 0, v);
        }
      }),
      minimo && linea2.unidad !== void 0 && h("span", { class: "sutil" }, linea2.unidad),
      exigencia !== void 0 && h("span", { class: "marca-equipo" }, cubierto ? "\u2713" : "\u2717")
    ),
    (exigencia?.requisitos.length ?? 0) > 0 && h(
      "ul",
      { class: "requisitos" },
      ...(exigencia?.requisitos ?? []).map((r) => h("li", {}, r))
    ),
    h("div", { class: "cita" }, exigencia?.fundamento.cita ?? linea2.cita),
    (exigencia?.desplaza.length ?? 0) > 0 && h(
      "p",
      { class: "sutil desplaza" },
      `Desplaza a: ${(exigencia?.desplaza ?? []).map((d) => d.cita).join("; ")}`
    ),
    exigencia?.fundamento.advertencia !== void 0 && h("p", { class: "salvedad" }, `\u26A0 ${exigencia.fundamento.advertencia}`)
  );
}
function marcarLinea(campo2, exigido, valor2) {
  const linea2 = campo2.closest(".exigencia");
  const marca = linea2?.querySelector(".marca-equipo");
  if (linea2 === null || linea2 === void 0 || marca === null || marca === void 0) return;
  const cubierto = exigido === void 0 || valor2 !== void 0 && valor2 >= exigido;
  marca.textContent = cubierto ? "\u2713" : "\u2717";
  linea2.classList.toggle("cubierta", cubierto);
  linea2.classList.toggle("carencia", !cubierto);
}
function pintarExigencia(exigencia) {
  const estado2 = exigencia.exento ? "exenta" : exigencia.remitidoA !== void 0 ? "remitida" : "requisito";
  return h(
    "div",
    { class: `exigencia ${estado2}` },
    h(
      "div",
      { class: "exigencia-cabecera" },
      h("span", { class: "exigencia-nombre" }, exigencia.nombre),
      h(
        "span",
        { class: "exigencia-cantidad" },
        exigencia.exento ? "no se exige" : exigencia.remitidoA !== void 0 ? "seg\xFAn manual" : "requisito"
      )
    ),
    exigencia.requisitos.length > 0 && h("ul", { class: "requisitos" }, ...exigencia.requisitos.map((r) => h("li", {}, r))),
    h("div", { class: "cita" }, exigencia.fundamento.cita),
    // Que una regla haya desplazado a otra se enseña. Callarlo sería ocultar que había
    // otra norma en juego, y es justo lo que el sistema no debe hacer.
    exigencia.desplaza.length > 0 && h(
      "p",
      { class: "sutil desplaza" },
      `Desplaza a: ${exigencia.desplaza.map((d) => d.cita).join("; ")}`
    ),
    exigencia.fundamento.advertencia !== void 0 && h("p", { class: "salvedad" }, `\u26A0 ${exigencia.fundamento.advertencia}`)
  );
}
function panelContraste(contrastes) {
  if (contrastes.length === 0) return false;
  const hayDiscrepancia = contrastes.some((c) => c.nivel === "discrepancia");
  return h(
    "div",
    { class: `tarjeta contraste ${hayDiscrepancia ? "discrepancia" : ""}` },
    h("h2", {}, "Declarado frente a comprobado"),
    h(
      "p",
      { class: "sutil" },
      "Lo declarado sale de la documentaci\xF3n de la embarcaci\xF3n; lo comprobado, de lo verificado a bordo. Que no coincidan no es un fallo del sistema: es un hallazgo del reconocimiento."
    ),
    ...contrastes.map(
      (c) => h(
        "div",
        { class: `linea-contraste ${c.nivel}` },
        h(
          "h3",
          {},
          c.titulo,
          h(
            "span",
            { class: `marca-contraste ${c.nivel}` },
            c.nivel === "conforme" ? "coincide" : c.nivel === "aviso" ? "aviso" : "discrepa"
          )
        ),
        h("p", {}, h("b", {}, "Declarado: "), c.declarado),
        h("p", {}, h("b", {}, "Comprobado: "), c.comprobado),
        h("p", {}, c.explicacion),
        c.cita !== void 0 && h("p", { class: "cita" }, c.cita)
      )
    )
  );
}

// src/contraste.ts
function contrastarZona(declarada, zona2) {
  if (declarada === void 0) return void 0;
  const alcanzada = zona2.zona;
  const textoDeclarada = `Zona ${declarada} \u2014 ${DESCRIPCION_ZONA[declarada]}`;
  if (alcanzada === void 0) {
    return {
      clave: "zona",
      titulo: "Zona de navegaci\xF3n",
      nivel: "discrepancia",
      declarado: textoDeclarada,
      comprobado: "Ninguna: el equipo a bordo no alcanza ni la zona menos exigente",
      explicacion: "Se declara una zona de navegaci\xF3n que el equipo verificado a bordo no respalda en ning\xFAn grado. Procede revisar el inventario y, si se confirma, hacerlo constar como deficiencia.",
      cita: "RD 339/2021, art. 3.3"
    };
  }
  if (alcanzada === declarada) {
    return {
      clave: "zona",
      titulo: "Zona de navegaci\xF3n",
      nivel: "conforme",
      declarado: textoDeclarada,
      comprobado: textoDeclarada,
      explicacion: "La zona declarada coincide con la que permite el equipo verificado.",
      cita: "RD 339/2021, art. 3.3"
    };
  }
  if (declarada < alcanzada) {
    return {
      clave: "zona",
      titulo: "Zona de navegaci\xF3n",
      nivel: "discrepancia",
      declarado: textoDeclarada,
      comprobado: `Zona ${alcanzada} \u2014 ${DESCRIPCION_ZONA[alcanzada]}`,
      explicacion: `Se declara la zona ${declarada}, m\xE1s exigente que la ${alcanzada}, que es la m\xE1xima que respalda el equipo verificado a bordo. La embarcaci\xF3n estar\xEDa navegando fuera de lo que su equipo permite.`,
      cita: "RD 339/2021, art. 3.3"
    };
  }
  return {
    clave: "zona",
    titulo: "Zona de navegaci\xF3n",
    nivel: "aviso",
    declarado: textoDeclarada,
    comprobado: `Zona ${alcanzada} \u2014 ${DESCRIPCION_ZONA[alcanzada]}`,
    explicacion: `El equipo verificado a bordo alcanza la zona ${alcanzada}, m\xE1s exigente que la ${declarada} declarada. La embarcaci\xF3n podr\xEDa optar a una zona superior.`,
    cita: "RD 339/2021, art. 3.3 y disposiciones transitorias"
  };
}
function contrastarCondicion(inspeccion, exigeSeco) {
  const visitas = Object.values(inspeccion.visitas);
  if (visitas.length === 0) return void 0;
  const enSeco = visitas.filter((v) => v.condicion === "seco");
  const declarado = visitas.map((v) => `${ETIQUETA[v.clave]}: ${v.condicion === "seco" ? "en seco" : "a flote"}`).join("; ");
  if (!exigeSeco) {
    return {
      clave: "condicion",
      titulo: "Condici\xF3n del reconocimiento",
      nivel: "conforme",
      declarado,
      comprobado: "La norma no exige varada para este reconocimiento",
      explicacion: "Este tipo de reconocimiento no requiere que la embarcaci\xF3n est\xE9 en seco."
    };
  }
  if (enSeco.length > 0) {
    return {
      clave: "condicion",
      titulo: "Condici\xF3n del reconocimiento",
      nivel: "conforme",
      declarado,
      comprobado: "La norma exige varada, y consta al menos una visita en seco",
      explicacion: "El casco se ha podido inspeccionar en seco.",
      cita: "RD 1434/1999, arts. 3.B) y 3.C)"
    };
  }
  return {
    clave: "condicion",
    titulo: "Condici\xF3n del reconocimiento",
    nivel: "discrepancia",
    declarado,
    comprobado: "La norma exige varada y ninguna visita se ha hecho en seco",
    explicacion: "Este reconocimiento exige inspecci\xF3n del casco en seco y todas las visitas constan a flote. La obra viva no se ha podido inspeccionar, de modo que el reconocimiento no est\xE1 completo.",
    cita: "RD 1434/1999, arts. 3.B) y 3.C); art. 12"
  };
}
var ETIQUETA = {
  v1: "1\xAA visita",
  v2: "2\xAA visita",
  r2: "2\xBA reconocimiento"
};
function discrepancias(contrastes) {
  return contrastes.filter(
    (c) => c !== void 0 && c.nivel !== "conforme"
  );
}

// src/expediente.ts
var HORAS_AL_ANIO_SUPUESTAS = 100;
function analisisDeReferencia(catalogo, pautas) {
  const cobertura = coberturaDelAnalisis(catalogo, {
    pautas,
    mesesEntreReconocimientos: 60,
    horasAlAnio: HORAS_AL_ANIO_SUPUESTAS,
    transmision: "inversor"
  });
  return {
    catalogo,
    cobertura,
    resumen: resumirCobertura(cobertura),
    mesesEntreReconocimientos: 60,
    horasAlAnio: HORAS_AL_ANIO_SUPUESTAS,
    horasSupuestas: true
  };
}
function comoRealizado(inspeccion) {
  if (inspeccion.estado === "borrador") return void 0;
  return {
    id: inspeccion.id,
    tipo: inspeccion.tipo,
    fecha: inspeccion.fecha,
    favorable: inspeccion.estado === "firmada_favorable"
  };
}
function comoHistorial(inspeccion, tituloPunto) {
  return {
    id: inspeccion.id,
    fecha: inspeccion.fecha,
    numeroInforme: inspeccion.numeroInforme,
    firmada: inspeccion.estado !== "borrador",
    hallazgos: Object.values(inspeccion.hallazgos).map((h2) => ({
      puntoId: h2.puntoId,
      titulo: tituloPunto(h2.puntoId) ?? `Punto ${h2.puntoId}`,
      resultado: h2.resultado,
      grave: h2.gravedad === "grave",
      ...h2.observaciones !== void 0 ? { observacion: h2.observaciones } : {}
    }))
  };
}
function componerExpediente(expediente, todasLasInspecciones, catalogos, hoy2) {
  const inspecciones = todasLasInspecciones.filter((i) => i.embarcacion.matricula === expediente.matricula).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const embarcacion = inspecciones[0]?.embarcacion;
  const evaluacionSucesos = evaluarSucesos(
    expediente.sucesos,
    [catalogos.sucesos],
    hoy2
  );
  const realizados = inspecciones.map(comoRealizado).filter((r) => r !== void 0);
  const obligaciones = cruzarConHistorico(evaluacionSucesos.obligaciones, realizados);
  let vencimientos = [];
  const avisos = [...evaluacionSucesos.avisos];
  if (embarcacion !== void 0) {
    const ultimoPeriodico = realizados.filter((r) => r.tipo === "periodico" && r.favorable).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    const renovado = ultimoPeriodico !== void 0 && (embarcacion.fechaCertificado === void 0 || ultimoPeriodico.fecha > embarcacion.fechaCertificado);
    let ficha = embarcacion;
    if (renovado) {
      const caducidadAnterior = calendario(
        embarcacion,
        evaluar(embarcacion, [catalogos.reglas], hoy2),
        {},
        [catalogos.equipo],
        hoy2
      ).vencimientos.find((v) => v.clase === "certificado")?.fecha;
      const antesDeCaducar = caducidadAnterior !== void 0 && ultimoPeriodico.fecha < caducidadAnterior;
      const desde = antesDeCaducar ? caducidadAnterior : ultimoPeriodico.fecha;
      ficha = { ...embarcacion, fechaCertificado: desde };
      avisos.push(
        antesDeCaducar ? `El certificado renovado se cuenta desde la caducidad del anterior (${caducidadAnterior}): el reconocimiento peri\xF3dico favorable del ${ultimoPeriodico.fecha} se hizo antes de que caducara.` : `El certificado se cuenta desde el reconocimiento peri\xF3dico favorable del ${ultimoPeriodico.fecha}` + (caducidadAnterior !== void 0 ? `, porque el anterior ya hab\xEDa caducado (${caducidadAnterior}).` : ".")
      );
    }
    const resultado = calendario(
      ficha,
      evaluar(ficha, [catalogos.reglas], hoy2),
      expediente.caducidades,
      [catalogos.equipo],
      hoy2
    );
    const apertura = resultado.vencimientos.find((v) => v.clase === "ventana")?.fecha;
    const intermedioHecho = apertura !== void 0 && realizados.some((r) => r.tipo === "intermedio" && r.favorable && r.fecha >= apertura);
    vencimientos = intermedioHecho ? resultado.vencimientos.filter((v) => v.clase !== "ventana" && v.clase !== "reconocimiento") : resultado.vencimientos;
    avisos.push(...resultado.avisos);
  } else {
    avisos.push(
      "Todav\xEDa no hay ninguna inspecci\xF3n de esta embarcaci\xF3n, as\xED que no se conoce su ficha y no se pueden calcular los vencimientos."
    );
  }
  let analisis;
  const activos = expediente.componentes.filter((c) => c.baja === void 0 || c.baja > hoy2);
  const catalogoAnalisis = (catalogos.analisis ?? []).find(
    (a) => activos.some((c) => c.tipo === a.aplicaA.tipoComponente)
  );
  if (catalogoAnalisis !== void 0 && embarcacion !== void 0) {
    const motor = activos.find((c) => c.tipo === catalogoAnalisis.aplicaA.tipoComponente);
    const evaluacion = evaluar(embarcacion, [catalogos.reglas], hoy2);
    const periodico = conclusionesDe(evaluacion, "periodico").find((c) => !c.exento)?.consecuencia.periodicidadMaximaAnios;
    const hayIntermedio = conclusionesDe(evaluacion, "intermedio").some((c) => !c.exento);
    const mesesEntreReconocimientos = periodico === void 0 ? 1200 : periodico * 12 / (hayIntermedio ? 2 : 1);
    const serie = expediente.lecturas.filter((l) => l.componenteId === motor.id).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const primera = serie[0];
    const ultima = serie.at(-1);
    const dias = primera !== void 0 && ultima !== void 0 ? (Date.parse(ultima.fecha) - Date.parse(primera.fecha)) / 864e5 : 0;
    const horasReales = primera !== void 0 && ultima !== void 0 && dias >= 30 && ultima.horas > primera.horas ? (ultima.horas - primera.horas) / dias * 365 : void 0;
    const horasAlAnio = horasReales ?? HORAS_AL_ANIO_SUPUESTAS;
    const cobertura = coberturaDelAnalisis(catalogoAnalisis, {
      pautas: catalogos.pautas ?? [],
      mesesEntreReconocimientos,
      horasAlAnio,
      ...motor.transmision !== void 0 ? { transmision: motor.transmision } : {}
    });
    analisis = {
      catalogo: catalogoAnalisis,
      cobertura,
      resumen: resumirCobertura(cobertura),
      mesesEntreReconocimientos,
      horasAlAnio,
      horasSupuestas: horasReales === void 0
    };
  }
  const tituloPunto = catalogos.tituloPunto ?? (() => void 0);
  const deficiencias = deficienciasAbiertas(
    inspecciones.map((i) => comoHistorial(i, tituloPunto)),
    expediente.trabajos
  );
  const plan = planMantenimiento(
    {
      componentes: expediente.componentes,
      lecturas: expediente.lecturas,
      trabajos: expediente.trabajos,
      tareasPropias: expediente.tareasPropias,
      ...analisis !== void 0 ? {
        tareasAnalisis: tareasDelAnalisis(
          analisis.cobertura,
          activos.find((c) => c.tipo === analisis.catalogo.aplicaA.tipoComponente)?.id
        )
      } : {},
      catalogos: catalogos.pautas ?? [],
      vencimientos,
      deficiencias
    },
    hoy2
  );
  return {
    matricula: expediente.matricula,
    ...embarcacion !== void 0 ? { embarcacion } : {},
    inspecciones,
    obligaciones,
    obligacionesPendientes: pendientes(obligaciones),
    vencimientos,
    deficiencias,
    plan,
    ...analisis !== void 0 ? { analisis } : {},
    avisos
  };
}
function resumenInspeccion(inspeccion) {
  const resultado = calcularResultado(inspeccion.hallazgos, inspeccion.fecha);
  return {
    graves: resultado.deficienciasGraves.length,
    leves: resultado.deficienciasLeves.length,
    noAccesibles: resultado.noAccesibles.length
  };
}
function matriculasConInspecciones(inspecciones) {
  const porMatricula = /* @__PURE__ */ new Map();
  for (const inspeccion of [...inspecciones].sort(
    (a, b) => b.fecha.localeCompare(a.fecha)
  )) {
    const matricula = inspeccion.embarcacion.matricula.trim();
    if (matricula === "") continue;
    const existente = porMatricula.get(matricula);
    porMatricula.set(matricula, {
      nombre: existente?.nombre ?? inspeccion.embarcacion.nombre,
      inspecciones: (existente?.inspecciones ?? 0) + 1
    });
  }
  return [...porMatricula.entries()].map(([matricula, datos]) => ({ matricula, ...datos })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

// src/vista/expediente.ts
var TIPOS_SUCESO = [
  "varada",
  "abordaje",
  "averia_temporal",
  "averia_maquinaria",
  "reparacion",
  "modificacion",
  "cambio_lista",
  "requerimiento_judicial",
  "resolucion_dgmm"
];
function panelPendientes(pendientes2) {
  if (pendientes2.length === 0) {
    return h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Obligaciones pendientes"),
      h("p", { class: "sutil" }, "No hay reconocimientos pendientes por sucesos.")
    );
  }
  return h(
    "div",
    { class: "tarjeta pendientes" },
    h("h2", {}, `Reconocimientos pendientes (${pendientes2.length})`),
    ...pendientes2.map(
      (o) => h(
        "div",
        { class: "obligacion" },
        h(
          "div",
          { class: "obligacion-titulo" },
          h("b", {}, `Reconocimiento ${nombreTipo(o.tipo)}`),
          ` \u2014 por ${NOMBRE_SUCESO[o.suceso.tipo].toLowerCase()} de ` + fechaLarga(o.suceso.fecha)
        ),
        o.suceso.descripcion !== "" && h("p", { class: "sutil" }, o.suceso.descripcion),
        h("div", { class: "cita" }, o.fundamento.cita),
        h("p", { class: "explicacion" }, o.fundamento.explicacion),
        o.consecuencia.informeACapitania === true && h(
          "p",
          { class: "sutil" },
          "La entidad colaboradora emitir\xE1 informe y lo enviar\xE1 a la Capitan\xEDa Mar\xEDtima, que expedir\xE1 el certificado (art. 10.1.\xBA)."
        ),
        o.fundamento.advertencia !== void 0 && h("p", { class: "salvedad" }, `\u26A0 ${o.fundamento.advertencia}`)
      )
    )
  );
}
function panelCalendario(vencimientos) {
  if (vencimientos.length === 0) {
    return h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Calendario"),
      h(
        "p",
        { class: "sutil" },
        "No hay vencimientos calculables. Faltan la fecha del certificado de navegabilidad o las caducidades del equipo."
      )
    );
  }
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Calendario de vencimientos"),
    h(
      "ul",
      { class: "calendario" },
      ...vencimientos.map(
        (v) => h(
          "li",
          { class: `vencimiento ${v.estado}` },
          h(
            "div",
            { class: "vencimiento-cabecera" },
            h("span", { class: "vencimiento-fecha" }, fechaLarga(v.fecha)),
            h(
              "span",
              { class: "vencimiento-plazo" },
              v.diasRestantes < 0 && v.clase === "ventana" ? `abierta desde hace ${-v.diasRestantes} d\xEDas` : v.diasRestantes < 0 ? `vencido hace ${-v.diasRestantes} d\xEDas` : v.diasRestantes === 0 ? "vence hoy" : `en ${v.diasRestantes} d\xEDas`
            )
          ),
          h("div", { class: "vencimiento-concepto" }, v.concepto),
          // Que una caducidad convierta el reconocimiento en desfavorable es la
          // información que hay que ver antes de ir al barco, no después.
          v.gravedadSiVence !== void 0 && h(
            "p",
            { class: "salvedad" },
            `\u26A0 Vencido constituye deficiencia grave \u2014 Anexo III, letra ${v.gravedadSiVence.letra}): ${v.gravedadSiVence.supuesto}`
          ),
          v.detalle !== void 0 && v.gravedadSiVence === void 0 && h("p", { class: "sutil" }, v.detalle),
          h("div", { class: "cita" }, v.cita)
        )
      )
    )
  );
}
function panelSucesos(sucesos, obligaciones, acciones) {
  let tipo = "varada";
  let fecha = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let descripcion = "";
  let listaDestino = 6;
  let afectaSeguridad = false;
  const contenedorCondicional = h("div", {});
  const refrescarCondicional = () => {
    contenedorCondicional.replaceChildren();
    if (tipo === "cambio_lista") {
      contenedorCondicional.append(
        h(
          "label",
          { class: "campo" },
          h("span", { class: "campo-etiqueta" }, "Lista de destino"),
          selector(
            [
              { valor: "6", texto: "6.\xAA \u2014 arrendamiento (ch\xE1rter)" },
              { valor: "7", texto: "7.\xAA \u2014 recreo privado" }
            ],
            String(listaDestino),
            (v) => {
              listaDestino = Number(v);
            }
          ),
          h(
            "small",
            { class: "campo-ayuda" },
            "El art. 3.D.b) solo obliga a reconocimiento adicional en el paso de la 7.\xAA a la 6.\xAA."
          )
        )
      );
    }
    if (tipo === "averia_maquinaria") {
      contenedorCondicional.append(
        h(
          "div",
          { class: "campo" },
          h(
            "label",
            { class: "casilla" },
            h("input", {
              type: "checkbox",
              checked: afectaSeguridad,
              onchange: (e) => {
                afectaSeguridad = e.target.checked;
              }
            }),
            h("span", {}, " Pudo afectar a las condiciones de seguridad de la navegaci\xF3n")
          ),
          h(
            "small",
            { class: "campo-ayuda" },
            "Art. 3.D.c). Es un juicio t\xE9cnico: lo hace quien registra el suceso, no el sistema. Sin esta valoraci\xF3n, la aver\xEDa queda se\xF1alada como pendiente de valorar."
          )
        )
      );
    }
  };
  refrescarCondicional();
  const campoDescripcion = h("textarea", {
    rows: "2",
    placeholder: "Qu\xE9 ocurri\xF3",
    oninput: (e) => {
      descripcion = e.target.value;
    }
  });
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "L\xEDnea temporal de sucesos"),
    h(
      "p",
      { class: "sutil" },
      "Los reconocimientos adicionales y extraordinarios no los dispara el calendario, sino lo que le pasa al barco (art. 3, apartados D y E, del RD 1434/1999)."
    ),
    sucesos.length === 0 ? h("p", { class: "vacio" }, "Sin sucesos registrados.") : h(
      "ul",
      { class: "linea-temporal" },
      ...[...sucesos].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((s) => {
        const suyas = obligaciones.filter((o) => o.suceso.id === s.id);
        const pendiente = suyas.some((o) => !o.atendida);
        return h(
          "li",
          { class: `suceso ${pendiente ? "pendiente" : suyas.length > 0 ? "atendido" : ""}` },
          h(
            "div",
            { class: "suceso-cabecera" },
            h("b", {}, NOMBRE_SUCESO[s.tipo]),
            h("span", { class: "sutil" }, fechaLarga(s.fecha))
          ),
          s.descripcion !== "" && h("p", {}, s.descripcion),
          suyas.length > 0 && h(
            "p",
            { class: "sutil" },
            pendiente ? `Obliga a reconocimiento ${nombreTipo(suyas[0].tipo)} \u2014 pendiente` : `Oblig\xF3 a reconocimiento ${nombreTipo(suyas[0].tipo)} \u2014 atendido`
          ),
          h(
            "button",
            { class: "enlace", onclick: () => acciones.alBorrarSuceso(s.id) },
            "Eliminar"
          )
        );
      })
    ),
    h(
      "details",
      { class: "alta-suceso" },
      h("summary", {}, "+ Registrar un suceso"),
      h(
        "div",
        {},
        h(
          "label",
          { class: "campo" },
          h("span", { class: "campo-etiqueta" }, "Tipo"),
          selector(
            TIPOS_SUCESO.map((t) => ({ valor: t, texto: NOMBRE_SUCESO[t] })),
            tipo,
            (v) => {
              tipo = v;
              refrescarCondicional();
            }
          )
        ),
        h(
          "label",
          { class: "campo" },
          h("span", { class: "campo-etiqueta" }, "Fecha"),
          h("input", {
            type: "date",
            valor: fecha,
            oninput: (e) => {
              fecha = e.target.value;
            }
          })
        ),
        h(
          "label",
          { class: "campo" },
          h("span", { class: "campo-etiqueta" }, "Descripci\xF3n"),
          campoDescripcion
        ),
        contenedorCondicional,
        h(
          "button",
          {
            class: "principal",
            onclick: () => {
              acciones.alAnadirSuceso({
                tipo,
                fecha,
                descripcion,
                ...tipo === "cambio_lista" ? { listaDestino } : {},
                ...tipo === "averia_maquinaria" ? { afectaSeguridad } : {}
              });
            }
          },
          "Registrar suceso"
        )
      )
    )
  );
}
function panelHistorico(inspecciones, acciones) {
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, `Hist\xF3rico de inspecciones (${inspecciones.length})`),
    inspecciones.length === 0 ? h("p", { class: "vacio" }, "Sin inspecciones registradas.") : h(
      "ul",
      { class: "listado" },
      ...inspecciones.map((i) => {
        const resumen = resumenInspeccion(i);
        return h(
          "li",
          { class: i.estado, onclick: () => acciones.alAbrirInspeccion(i.id) },
          h(
            "div",
            {},
            h("b", {}, `Reconocimiento ${nombreTipo(i.tipo)}`),
            " \xB7 ",
            fechaLarga(i.fecha)
          ),
          h(
            "div",
            { class: "sutil" },
            i.estado === "borrador" ? "Borrador" : i.estado === "firmada_favorable" ? "FAVORABLE" : "DESFAVORABLE",
            resumen.graves > 0 && ` \xB7 ${resumen.graves} deficiencia(s) grave(s)`,
            resumen.leves > 0 && ` \xB7 ${resumen.leves} leve(s)`,
            resumen.noAccesibles > 0 && ` \xB7 ${resumen.noAccesibles} no accesible(s)`
          )
        );
      })
    )
  );
}
function panelCaducidades(caducidades, equipos, acciones) {
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Caducidades del equipo"),
    h(
      "p",
      { class: "sutil" },
      "An\xF3tese la fecha m\xE1s pr\xF3xima de cada tipo: si hay tres bengalas, la que antes vence es la que marca cu\xE1ndo hay que actuar. El equipo de salvamento y el de contraincendios caducados son deficiencia grave (Anexo III, letras h y m)."
    ),
    ...equipos.map(
      (e) => h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, e.nombre),
        h("input", {
          type: "date",
          valor: caducidades[e.equipo] ?? "",
          onchange: (ev) => acciones.alFijarCaducidad(e.equipo, ev.target.value)
        })
      )
    )
  );
}
function cabeceraExpediente(expediente) {
  const e = expediente.embarcacion;
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, e?.nombre ?? "(sin nombre)"),
    h("p", { class: "sutil" }, `Matr\xEDcula ${expediente.matricula}`),
    e !== void 0 && h(
      "p",
      { class: "sutil" },
      `Lista ${e.lista}.\xAA \xB7 ${e.esloraCascoM} m de eslora de casco \xB7 ${e.materialCasco.replace(/_/g, " ")}` + (e.marcadoCE ? ` \xB7 CE categor\xEDa ${e.categoriaDiseno ?? "\u2014"}` : " \xB7 sin marcado CE")
    ),
    ...expediente.avisos.map((a) => h("p", { class: "salvedad" }, `\u26A0 ${a}`))
  );
}

// src/registro.ts
function contar(valores, nombres = {}) {
  const cuenta = /* @__PURE__ */ new Map();
  for (const v of valores) cuenta.set(v, (cuenta.get(v) ?? 0) + 1);
  return [...cuenta.entries()].map(([clave, veces]) => ({ clave, etiqueta: nombres[clave] ?? clave, veces })).sort((a, b) => b.veces - a.veces || a.clave.localeCompare(b.clave));
}
function resultadoDe(inspeccion) {
  if (inspeccion.estado === "firmada_favorable") return "favorable";
  if (inspeccion.estado === "firmada_desfavorable") return "desfavorable";
  return "en ejecuci\xF3n";
}
function componerRegistro(inspecciones, anio) {
  return inspecciones.filter((i) => anio === void 0 || Number(i.fecha.slice(0, 4)) === anio).map((i) => ({
    inspeccionId: i.id,
    numeroInforme: i.numeroInforme,
    fecha: i.fecha,
    matricula: i.embarcacion.matricula,
    nombre: i.embarcacion.nombre,
    tipo: i.tipo,
    motivo: i.motivo,
    inspector: i.inspector,
    resultado: resultadoDe(i),
    visitas: Object.keys(i.visitas).length,
    ...i.tarifaEuros !== void 0 ? { tarifaEuros: i.tarifaEuros } : {},
    ...i.limiteSubsanacion !== void 0 ? { limiteSubsanacion: i.limiteSubsanacion } : {}
  })).sort((a, b) => a.fecha.localeCompare(b.fecha));
}
function aniosConActuaciones(inspecciones) {
  const anios = new Set(inspecciones.map((i) => Number(i.fecha.slice(0, 4))));
  return [...anios].sort((a, b) => b - a);
}
function componerMemoriaAnual(inspecciones, anio, hoy2) {
  const delAnio = inspecciones.filter((i) => Number(i.fecha.slice(0, 4)) === anio);
  const registro = componerRegistro(delAnio);
  const limitePresentacion = `${anio + 1}-03-31`;
  const graves = [];
  const noAccesibles = [];
  let totalGraves = 0;
  let totalLeves = 0;
  for (const inspeccion of delAnio) {
    for (const hallazgo of Object.values(inspeccion.hallazgos)) {
      if (hallazgo.resultado === "no_conforme") {
        if (hallazgo.gravedad === "grave") {
          totalGraves += 1;
          graves.push(hallazgo.letraAnexoIII ?? "sin tipificar");
        } else {
          totalLeves += 1;
        }
      } else if (hallazgo.resultado === "no_accesible") {
        noAccesibles.push(hallazgo.puntoId);
      }
    }
  }
  const conTarifa = registro.filter((l) => l.tarifaEuros !== void 0);
  const importeFacturado = conTarifa.reduce((n, l) => n + (l.tarifaEuros ?? 0), 0);
  const subsanacionesVencidas = registro.filter(
    (l) => l.limiteSubsanacion !== void 0 && l.limiteSubsanacion < hoy2 && reinspeccionFavorablePosterior(inspecciones, l.matricula, l.fecha) === void 0
  );
  const NOMBRES_LETRA = {
    ...DEFICIENCIAS_GRAVES,
    "sin tipificar": "No tipificada en el Anexo III; grave por criterio del inspector"
  };
  return {
    anio,
    limitePresentacion,
    diasParaPresentar: diasEntreISO(hoy2, limitePresentacion),
    totalActuaciones: registro.length,
    totalVisitas: registro.reduce((n, l) => n + l.visitas, 0),
    embarcacionesDistintas: new Set(registro.map((l) => l.matricula)).size,
    porTipo: contar(registro.map((l) => l.tipo)),
    porMotivo: contar(registro.map((l) => l.motivo)),
    favorables: registro.filter((l) => l.resultado === "favorable").length,
    desfavorables: registro.filter((l) => l.resultado === "desfavorable").length,
    enEjecucion: registro.filter((l) => l.resultado === "en ejecuci\xF3n").length,
    deficienciasGravesFrecuentes: contar(graves, NOMBRES_LETRA),
    totalDeficienciasGraves: totalGraves,
    totalDeficienciasLeves: totalLeves,
    puntosNoAccesibles: contar(noAccesibles),
    ...conTarifa.length > 0 ? { importeFacturado } : {},
    sinTarifa: registro.length - conTarifa.length,
    subsanacionesVencidas
  };
}
function reinspeccionFavorablePosterior(inspecciones, matricula, fecha) {
  return inspecciones.filter(
    (i) => i.estado === "firmada_favorable" && i.embarcacion.matricula === matricula && i.fecha > fecha
  ).map((i) => i.fecha).sort()[0];
}
function diasEntreISO(desde, hasta) {
  const ms = Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`);
  return Math.round(ms / 864e5);
}
var DIAS_AVISO_MEMORIA = 30;
function estadoMemoria(memoria) {
  if (memoria.diasParaPresentar < 0) return "vencido";
  if (memoria.diasParaPresentar <= DIAS_AVISO_MEMORIA) return "proximo";
  return "en_plazo";
}

// src/historico.ts
function normalizar(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/ª/g, "a").toLowerCase().trim();
}
function estadoSubsanacion(linea2, inspecciones, hoy2) {
  if (linea2.limiteSubsanacion === void 0) return void 0;
  if (reinspeccionFavorablePosterior(inspecciones, linea2.matricula, linea2.fecha) !== void 0) {
    return "subsanada";
  }
  return linea2.limiteSubsanacion < hoy2 ? "vencida" : "en_plazo";
}
function componerHistorico(inspecciones, filtro, hoy2) {
  const porId = new Map(inspecciones.map((i) => [i.id, i]));
  const texto = normalizar(filtro.texto ?? "");
  return componerRegistro(inspecciones, filtro.anio).filter((l) => filtro.resultado === void 0 || l.resultado === filtro.resultado).filter((l) => filtro.tipo === void 0 || l.tipo === filtro.tipo).filter(
    (l) => texto === "" || [l.nombre, l.matricula, l.numeroInforme, l.inspector].some(
      (campo2) => normalizar(campo2 ?? "").includes(texto)
    )
  ).map((l) => {
    const inspeccion = porId.get(l.inspeccionId);
    const resumen = inspeccion !== void 0 ? resumenInspeccion(inspeccion) : { graves: 0, leves: 0, noAccesibles: 0 };
    const subsanacion = estadoSubsanacion(l, inspecciones, hoy2);
    return { ...l, ...resumen, ...subsanacion !== void 0 ? { subsanacion } : {} };
  }).reverse();
}
function resumirHistorico(lineas) {
  return {
    total: lineas.length,
    favorables: lineas.filter((l) => l.resultado === "favorable").length,
    desfavorables: lineas.filter((l) => l.resultado === "desfavorable").length,
    enCurso: lineas.filter((l) => l.resultado === "en ejecuci\xF3n").length,
    vencidas: lineas.filter((l) => l.subsanacion === "vencida").length
  };
}
function tiposConActuaciones(inspecciones) {
  return [...new Set(inspecciones.map((i) => i.tipo))].sort();
}

// src/vista/historico.ts
var CLASE_RESULTADO = {
  favorable: "firmada_favorable",
  desfavorable: "firmada_desfavorable",
  "en ejecuci\xF3n": "borrador"
};
var TEXTO_SUBSANACION = {
  en_plazo: "subsanaci\xF3n en plazo",
  subsanada: "subsanada con reinspecci\xF3n favorable",
  vencida: "plazo vencido sin reinspecci\xF3n favorable: comunicar a Capitan\xEDa (art. 10.2.\xBA)"
};
function panelFiltros(filtro, anios, tipos, acciones) {
  return h(
    "div",
    { class: "tarjeta filtros-historico" },
    h("input", {
      type: "search",
      placeholder: "Buscar por nombre, matr\xEDcula, n\xBA de informe o inspector",
      valor: filtro.texto ?? "",
      oninput: (e) => acciones.alBuscar(e.target.value)
    }),
    h(
      "div",
      { class: "filtros-fila" },
      selector(
        [
          { valor: "", texto: "Todos los a\xF1os" },
          ...anios.map((a) => ({ valor: String(a), texto: String(a) }))
        ],
        filtro.anio !== void 0 ? String(filtro.anio) : "",
        (v) => acciones.alFiltrar({ anio: v })
      ),
      selector(
        [
          { valor: "", texto: "Cualquier resultado" },
          { valor: "favorable", texto: "Favorables" },
          { valor: "desfavorable", texto: "Desfavorables" },
          { valor: "en ejecuci\xF3n", texto: "En curso" }
        ],
        filtro.resultado ?? "",
        (v) => acciones.alFiltrar({ resultado: v })
      ),
      selector(
        [
          { valor: "", texto: "Todos los tipos" },
          ...tipos.map((t) => ({ valor: t, texto: nombreTipo(t) }))
        ],
        filtro.tipo ?? "",
        (v) => acciones.alFiltrar({ tipo: v })
      )
    )
  );
}
function pintarHistorico(lineas, resumen, acciones) {
  return h(
    "div",
    {},
    h(
      "p",
      { class: "sutil" },
      `${resumen.total} inspecci\xF3n(es) \xB7 ${resumen.favorables} favorable(s) \xB7 ${resumen.desfavorables} desfavorable(s) \xB7 ${resumen.enCurso} en curso`
    ),
    // Lo único del histórico que es una obligación con consecuencias: va arriba y en rojo.
    resumen.vencidas > 0 && h(
      "p",
      { class: "salvedad" },
      `\u26A0 ${resumen.vencidas} plazo(s) de subsanaci\xF3n vencido(s) sin reinspecci\xF3n favorable. El art. 10.2.\xBA del RD 1434/1999 obliga a comunicarlo a la Capitan\xEDa Mar\xEDtima.`
    ),
    lineas.length === 0 ? h("p", { class: "vacio" }, "Ninguna inspecci\xF3n coincide con la b\xFAsqueda.") : h("ul", { class: "listado" }, ...lineas.map((l) => pintarLinea3(l, acciones)))
  );
}
function pintarLinea3(l, acciones) {
  const resultado = l.resultado === "favorable" ? "FAVORABLE" : l.resultado === "desfavorable" ? "DESFAVORABLE" : "en curso";
  return h(
    "li",
    { class: CLASE_RESULTADO[l.resultado], onclick: () => acciones.alAbrirInspeccion(l.inspeccionId) },
    h(
      "div",
      { class: "linea-historico-cabecera" },
      h("b", {}, l.nombre || "(sin nombre)"),
      ` \xB7 ${l.matricula || "sin matr\xEDcula"}`,
      l.numeroInforme !== "" && h("span", { class: "sutil informe" }, l.numeroInforme)
    ),
    h(
      "div",
      { class: "sutil" },
      `${nombreTipo(l.tipo)} \xB7 ${fechaLarga(l.fecha)} \xB7 `,
      h("b", {}, resultado),
      l.graves > 0 && ` \xB7 ${l.graves} grave(s)`,
      l.leves > 0 && ` \xB7 ${l.leves} leve(s)`,
      l.noAccesibles > 0 && ` \xB7 ${l.noAccesibles} no accesible(s)`,
      l.inspector !== "" && ` \xB7 ${l.inspector}`
    ),
    l.subsanacion !== void 0 && h(
      "div",
      { class: `subsanacion ${l.subsanacion}` },
      l.limiteSubsanacion !== void 0 && `Hasta el ${fechaLarga(l.limiteSubsanacion)}: `,
      TEXTO_SUBSANACION[l.subsanacion]
    ),
    l.matricula !== "" && h(
      "button",
      {
        class: "enlace",
        onclick: (e) => {
          e.stopPropagation();
          acciones.alAbrirExpediente(l.matricula);
        }
      },
      "Ver expediente del barco \u2192"
    )
  );
}

// src/revision.ts
function medirRevision(total, dictamenes) {
  const lista2 = Object.values(dictamenes);
  return {
    total,
    revisadas: lista2.length,
    correctas: lista2.filter((d) => d.veredicto === "correcta").length,
    corregidas: lista2.filter((d) => d.veredicto === "corregida").length,
    dudosas: lista2.filter((d) => d.veredicto === "dudosa").length,
    pendientes: total - lista2.length
  };
}
function describirRango(etiqueta, rango, unidad = "") {
  const u = unidad === "" ? "" : ` ${unidad}`;
  const desde = rango.min === void 0 ? void 0 : `${rango.minExcluido ? "mayor de" : "igual o mayor que"} ${rango.min}${u}`;
  const hasta = rango.max === void 0 ? void 0 : `${rango.maxExcluido ? "menor de" : "igual o menor que"} ${rango.max}${u}`;
  if (desde !== void 0 && hasta !== void 0) return `${etiqueta} ${desde} y ${hasta}`;
  return `${etiqueta} ${desde ?? hasta}`;
}
function describirZona(condicion) {
  if (typeof condicion === "number") return `Navegaci\xF3n en zona ${condicion}`;
  if (Array.isArray(condicion)) return `Navegaci\xF3n en zonas ${condicion.join(", ")}`;
  const r = condicion;
  const desde = r.min ?? 1;
  const hasta = r.max ?? 7;
  const zonas = [];
  for (let z = desde; z <= hasta; z += 1) zonas.push(z);
  return `Navegaci\xF3n en zonas ${zonas.join(", ")}`;
}
var SI_NO = {
  marcadoCE: ["Con marcado CE", "Sin marcado CE"],
  finesComerciales: [
    "Con actividad comercial o lucrativa",
    "Sin actividad comercial o lucrativa"
  ],
  espacioHabitableGobierno: [
    "Con espacio habitable cerrado de gobierno o navegaci\xF3n",
    "Sin espacio habitable cerrado de gobierno o navegaci\xF3n"
  ],
  espacioHabitableCerrado: ["Con espacio habitable cerrado", "Sin espacio habitable cerrado"],
  equiposRadioelectricos: ["Con equipos radioel\xE9ctricos", "Sin equipos radioel\xE9ctricos"],
  camarasFlotabilidad: ["Con c\xE1maras de flotabilidad", "Sin c\xE1maras de flotabilidad"],
  navegacionDiurna: ["Solo navegaci\xF3n diurna", "Navegaci\xF3n no limitada al d\xEDa"],
  instalacionGasCombustible: [
    "Con instalaci\xF3n de gas combustible dentro del casco",
    "Sin instalaci\xF3n de gas combustible dentro del casco"
  ],
  compartimentoInteriorConMotorODeposito: [
    "Con motores o dep\xF3sitos en compartimentos interiores",
    "Sin motores ni dep\xF3sitos en compartimentos interiores"
  ],
  arranqueElectricoMotor: ["Con arranque el\xE9ctrico", "Sin arranque el\xE9ctrico"],
  motorEnEncajonamientoSobreCubierta: [
    "Con motores en encajonamiento sobre cubierta",
    "Sin motores en encajonamiento sobre cubierta"
  ],
  inodoros: ["Dotada de inodoros", "Sin inodoros"],
  depositoRetencionFijo: [
    "Con dep\xF3sito de retenci\xF3n fijo de aguas sucias",
    "Sin dep\xF3sito de retenci\xF3n fijo"
  ]
};
var NOMBRE_VALOR = {
  materiales_compuestos: "materiales compuestos",
  grupo_1: "grupo 1.\xBA (gasolina)",
  grupo_2: "grupo 2.\xBA (gas\xF3leo)",
  glp: "GLP",
  electrica: "el\xE9ctrica",
  intra_fueraborda: "intra-fueraborda"
};
function valor(v) {
  const texto = String(v);
  return NOMBRE_VALOR[texto] ?? texto.replace(/_/g, " ");
}
function lista(v) {
  return Array.isArray(v) ? v.map(valor).join(" o ") : valor(v);
}
function describirCondiciones(cuando) {
  const frases = [];
  for (const [clave, v] of Object.entries(cuando)) {
    if (v === void 0 || v === null) continue;
    if (clave === "zona") {
      frases.push(describirZona(v));
      continue;
    }
    if (clave === "lista") {
      frases.push(`Inscrita en la lista ${v}.\xAA del registro de matr\xEDcula`);
      continue;
    }
    if (clave === "esloraCascoM") {
      frases.push(describirRango("Eslora de casco", v, "m"));
      continue;
    }
    if (clave === "esloraTotalM") {
      frases.push(describirRango("Eslora total", v, "m"));
      continue;
    }
    if (clave === "potenciaKw") {
      frases.push(describirRango("Potencia instalada", v, "kW"));
      continue;
    }
    if (clave === "personasABordo") {
      frases.push(describirRango("Personas a bordo", v));
      continue;
    }
    if (clave === "materialCasco") {
      frases.push(`Casco de ${lista(v)}`);
      continue;
    }
    if (clave === "categoriaDiseno") {
      frases.push(`Categor\xEDa de dise\xF1o ${lista(v).toUpperCase()}`);
      continue;
    }
    if (clave === "propulsion") {
      frases.push(`Propulsi\xF3n ${lista(v)}`);
      continue;
    }
    if (clave === "disposicionMotor") {
      frases.push(`Motor ${lista(v)}`);
      continue;
    }
    if (clave === "combustible") {
      frases.push(`Combustible del ${lista(v)}`);
      continue;
    }
    if (clave === "tipoSuceso") {
      frases.push(`El suceso es ${lista(v)}`);
      continue;
    }
    if (clave === "puntoAnexoII") {
      const p = v;
      frases.push(`Defecto en el punto ${p.codigo} del Anexo II: ${p.titulo}`);
      continue;
    }
    if (clave === "bloqueAnexoII") {
      const b = v;
      frases.push(
        `Defecto en cualquier comprobaci\xF3n del bloque ${b.codigo} del Anexo II: ${b.titulo}`
      );
      continue;
    }
    if (clave in SI_NO) {
      const [si, no] = SI_NO[clave];
      frases.push(v === true ? si : no);
      continue;
    }
    frases.push(`${clave}: ${JSON.stringify(v)}`);
  }
  return frases.length > 0 ? frases : ["Sin condiciones: la regla se aplica a toda embarcaci\xF3n"];
}
var NOMBRE_VARIABLE = {
  personasABordo: "personas a bordo",
  esloraCascoM: "eslora de casco (m)",
  esloraTotalM: "eslora total (m)",
  potenciaKw: "potencia (kW)"
};
function describirExpresion(expresion) {
  return expresion.replace(/[A-Za-z]\w*/g, (nombre) => NOMBRE_VARIABLE[nombre] ?? nombre).replace(/\*/g, "\xD7").replace(/(\d)\.(\d)/g, "$1,$2");
}
function tipoReconocimiento(tipo) {
  const texto = String(tipo);
  return texto === "periodico" ? "peri\xF3dico" : texto.replace(/_/g, " ");
}
function describirConsecuencia(entonces) {
  if (entonces["calificacion"] === "grave" && entonces["letra"] === void 0) {
    return `Se propone DEFICIENCIA GRAVE por criterio de inspecci\xF3n \u2014 ${String(entonces["criterio"])}`;
  }
  if (entonces["calificacion"] === "grave") {
    return `Se propone DEFICIENCIA GRAVE \u2014 Anexo III, letra ${String(entonces["letra"])}): ` + String(entonces["supuesto"]);
  }
  if (entonces["calificacion"] === "no_tipificada") {
    return "Sin propuesta de deficiencia grave \u2014 el Anexo III no lo tipifica";
  }
  if (entonces["exento"] === true) {
    const que = entonces["reconocimiento"] !== void 0 ? `reconocimiento ${tipoReconocimiento(entonces["reconocimiento"])}` : String(entonces["nombre"] ?? "lo exigido").replace(/_/g, " ");
    return `EXENTA de ${que}`;
  }
  if (entonces["reconocimiento"] !== void 0) {
    const partes2 = [`Reconocimiento ${tipoReconocimiento(entonces["reconocimiento"])}`];
    if (entonces["enSeco"] === true) partes2.push("en seco");
    if (entonces["periodicidadMaximaAnios"] !== void 0) {
      partes2.push(`cada ${entonces["periodicidadMaximaAnios"]} a\xF1os como m\xE1ximo`);
    }
    const ventana = entonces["ventanaAnios"];
    if (ventana !== void 0) {
      partes2.push(`entre el a\xF1o ${ventana.desde} y el ${ventana.hasta} del per\xEDodo`);
    }
    if (entonces["certificadoSinCaducidad"] === true) {
      partes2.push("certificado con la menci\xF3n \xABSIN CADUCIDAD\xBB");
    }
    return partes2.join(", ");
  }
  const partes = [String(entonces["nombre"] ?? entonces["equipo"] ?? "")];
  const cantidad = entonces["cantidad"];
  if (typeof cantidad === "number" && entonces["minimoPorUnidad"] === true) {
    partes.push(`\u2014 m\xEDnimo ${cantidad} ${String(entonces["unidad"])} en cada unidad`);
  } else if (typeof cantidad === "number") {
    partes.push(`\u2014 ${cantidad} ${String(entonces["unidad"] ?? "unidad(es)")}`);
  } else if (cantidad !== null && typeof cantidad === "object") {
    const expresion = describirExpresion(cantidad.expresion);
    partes.push(`\u2014 cantidad calculada: ${expresion} ${String(entonces["unidad"] ?? "")}`);
  }
  if (entonces["remitidoA"] !== void 0) {
    partes.push(`\u2014 seg\xFAn ${String(entonces["remitidoA"])}`);
  }
  return partes.join(" ").trim();
}
function agruparPorArticulo(reglas) {
  const grupos = /* @__PURE__ */ new Map();
  for (const regla of reglas) {
    const articulo = regla.cita.split(/,\s*(?=párrafo|nota|apartado|punto)/)[0] ?? regla.cita;
    const grupo = grupos.get(articulo) ?? [];
    grupo.push(regla);
    grupos.set(articulo, grupo);
  }
  return [...grupos.entries()].map(([articulo, reglas2]) => ({ articulo, reglas: reglas2 }));
}
function selloDeHoy() {
  return (/* @__PURE__ */ new Date()).toISOString();
}

// src/vista/revision.ts
var VEREDICTOS = [
  { valor: "correcta", texto: "Correcta" },
  { valor: "corregida", texto: "Hay que corregirla" },
  { valor: "dudosa", texto: "Dudosa" }
];
function panelAvanceRevision(avance, revisor, soloPendientes, acciones) {
  const porcentaje = avance.total === 0 ? 0 : Math.round(avance.revisadas / avance.total * 100);
  return h(
    "div",
    { class: "tarjeta revision-avance" },
    h("h2", {}, "Revisi\xF3n del cat\xE1logo"),
    h(
      "p",
      {},
      "Las reglas de este cat\xE1logo las escribi\xF3 el autor del trabajo leyendo el BOE. ",
      h("b", {}, "Ninguna la ha validado todav\xEDa un inspector en activo"),
      ". Hasta que eso ocurra, las conclusiones del sistema son orientativas."
    ),
    h(
      "p",
      { class: "revision-contador" },
      `${avance.revisadas} de ${avance.total} reglas revisadas (${porcentaje} %) \xB7 `,
      h("span", { class: "marca-veredicto correcta" }, `${avance.correctas} correctas`),
      " \xB7 ",
      h("span", { class: "marca-veredicto corregida" }, `${avance.corregidas} a corregir`),
      " \xB7 ",
      h("span", { class: "marca-veredicto dudosa" }, `${avance.dudosas} dudosas`)
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Revisa"),
      h("input", {
        type: "text",
        valor: revisor,
        placeholder: "Nombre del inspector que revisa",
        oninput: (e) => acciones.alCambiarRevisor(e.target.value)
      }),
      h(
        "small",
        { class: "campo-ayuda" },
        "Sin nombre, el dictamen no vale como evidencia de validaci\xF3n."
      )
    ),
    h(
      "label",
      { class: "campo campo-equipo" },
      h("input", {
        type: "checkbox",
        checked: soloPendientes,
        onchange: (e) => acciones.alFiltrar(e.target.checked)
      }),
      h("span", { class: "campo-etiqueta" }, "Ver solo las que faltan por revisar")
    )
  );
}
function portadaRevisionPapel(catalogos, version) {
  const total = catalogos.reduce((suma, c) => suma + c.reglas, 0);
  return h(
    "div",
    { class: "solo-papel portada-revision" },
    h("h1", {}, "Revisi\xF3n del cat\xE1logo de reglas"),
    h(
      "p",
      {},
      "Trabajo de Fin de Grado \u2014 Facultat de N\xE0utica de Barcelona (UPC). ",
      "Autor: V\xEDctor \xC1lvarez Albiol. Director: Antonio Morral."
    ),
    h(
      "p",
      {},
      "Estas reglas las escribi\xF3 el autor leyendo el BOE y ",
      h("b", {}, "ning\xFAn inspector en activo las ha validado todav\xEDa"),
      ". Cada una dice, en este orden: qu\xE9 art\xEDculo la sostiene, cu\xE1ndo se aplica, qu\xE9 exige y la frase que el sistema lleva al informe."
    ),
    h(
      "p",
      {},
      h("b", {}, "Lo que m\xE1s importa revisar es \xABSe aplica cuando\xBB"),
      ": una regla puede estar bien redactada y mal condicionada, y ese error no se ve leyendo solo la redacci\xF3n. Basta con marcar una casilla por regla; la observaci\xF3n, solo si hay algo que corregir o dudar."
    ),
    h(
      "table",
      { class: "portada-tabla" },
      ...catalogos.map((c) => h("tr", {}, h("td", {}, c.catalogo), h("td", {}, String(c.reglas)))),
      h("tr", {}, h("th", {}, "Total"), h("th", {}, String(total)))
    ),
    h("p", { class: "sutil" }, `Versi\xF3n de los cat\xE1logos: ${version}.`),
    h("p", { class: "renglon" }, "Revisa:"),
    h("p", { class: "renglon" }, "Fecha:")
  );
}
function pintarRegla(regla, dictamen, acciones) {
  let observacion = dictamen?.observacion ?? "";
  return h(
    "details",
    {
      class: `regla ${dictamen?.veredicto ?? "sin-revisar"}`,
      open: dictamen === void 0
    },
    h(
      "summary",
      {},
      h("span", { class: "regla-cita" }, regla.cita),
      h("span", { class: "regla-que" }, describirConsecuencia(regla.entonces)),
      dictamen !== void 0 && h(
        "span",
        { class: `marca-veredicto ${dictamen.veredicto}` },
        dictamen.veredicto === "correcta" ? "\u2713" : dictamen.veredicto === "corregida" ? "\u270E" : "?"
      )
    ),
    h(
      "div",
      { class: "regla-cuerpo" },
      h("h4", {}, "Se aplica cuando"),
      h(
        "ul",
        { class: "condiciones" },
        ...describirCondiciones(regla.cuando).map((c) => h("li", {}, c))
      ),
      // Que todas deban cumplirse a la vez no es evidente al leer una lista, y de ello
      // depende que la regla sea correcta o no.
      Object.keys(regla.cuando).length > 1 && h("p", { class: "sutil" }, "Todas las condiciones deben cumplirse a la vez."),
      h("h4", {}, "Entonces exige"),
      h("p", { class: "regla-consecuencia" }, describirConsecuencia(regla.entonces)),
      ...Array.isArray(regla.entonces["requisitos"]) ? [
        h(
          "ul",
          {},
          ...regla.entonces["requisitos"].map((r) => h("li", {}, r))
        )
      ] : [],
      h("h4", {}, "Redacci\xF3n que el sistema lleva al informe"),
      h("p", { class: "regla-explicacion" }, regla.explicacion),
      regla.advertencia !== void 0 && h("p", { class: "salvedad" }, "\u26A0 ", regla.advertencia),
      regla.grupo !== void 0 && h(
        "p",
        { class: "sutil" },
        `Compite con otras reglas del grupo \xAB${regla.grupo}\xBB; precedencia ${regla.precedencia ?? 0}. Solo se aplica la de mayor precedencia, y las desplazadas se informan.`
      ),
      h(
        "p",
        { class: "sutil" },
        `En vigor desde ${regla.vigenciaDesde}` + (regla.vigenciaHasta === null ? "" : ` hasta ${regla.vigenciaHasta}`) + ` \xB7 identificador ${regla.id}`
      ),
      h(
        "div",
        { class: "botonera" },
        ...VEREDICTOS.map(
          (v) => h(
            "button",
            {
              type: "button",
              class: `opcion ${v.valor} ${dictamen?.veredicto === v.valor ? "activa" : ""}`,
              onclick: () => acciones.alDictaminar(regla.id, v.valor, observacion)
            },
            v.texto
          )
        )
      ),
      // En papel, la botonera y el cuadro de texto no sirven: se sustituyen por casillas
      // para marcar a bolígrafo. Solo en las reglas sin dictamen; las dictaminadas ya
      // imprimen quién las revisó.
      dictamen === void 0 && h(
        "div",
        { class: "solo-papel dictamen-papel" },
        h("p", {}, ...VEREDICTOS.map((v) => h("span", { class: "casilla-papel" }, v.texto))),
        h("p", { class: "renglon" }, "Observaci\xF3n:"),
        h("p", { class: "renglon" }, "")
      ),
      h("textarea", {
        class: "observaciones",
        rows: "2",
        placeholder: "Correcci\xF3n o duda, en sus palabras. Es lo que se llevar\xE1 al cat\xE1logo.",
        valor: observacion,
        oninput: (e) => {
          observacion = e.target.value;
          if (dictamen !== void 0) {
            acciones.alDictaminar(regla.id, dictamen.veredicto, observacion);
          }
        }
      }),
      dictamen !== void 0 && h(
        "p",
        { class: "cita" },
        `Revisada por ${dictamen.revisadoPor || "\u2014"} el ` + new Date(dictamen.revisadoEn).toLocaleString("es-ES")
      )
    )
  );
}
function pintarRevision(grupos, dictamenes, acciones) {
  if (grupos.length === 0) {
    return h(
      "p",
      { class: "sutil" },
      "No queda ninguna regla pendiente de revisar en este cat\xE1logo."
    );
  }
  return h(
    "div",
    {},
    ...grupos.map(
      (g) => h(
        "section",
        { class: "bloque" },
        h("h2", {}, g.articulo),
        ...g.reglas.map((r) => pintarRegla(r, dictamenes[r.id], acciones))
      )
    )
  );
}
function pintarConclusionesRevision(reglas, dictamenes) {
  const pendientes2 = reglas.map((r) => ({ regla: r, dictamen: dictamenes[r.id] })).filter((x) => x.dictamen !== void 0 && x.dictamen.veredicto !== "correcta");
  if (pendientes2.length === 0) return false;
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Lo que hay que llevarse de la sesi\xF3n"),
    h(
      "p",
      { class: "sutil" },
      "Estas correcciones se aplican editando el cat\xE1logo de reglas, que es donde tienen que aplicarse. Este listado es la lista de trabajo."
    ),
    h(
      "ol",
      {},
      ...pendientes2.map(
        (x) => h(
          "li",
          {},
          h("b", {}, x.regla.cita),
          ` (${x.dictamen.veredicto}) \u2014 `,
          x.dictamen.observacion || "sin observaci\xF3n anotada"
        )
      )
    )
  );
}

// src/vista/registro.ts
var TEXTO_ESTADO = {
  en_plazo: "En plazo",
  proximo: "Vence pronto",
  vencido: "Fuera de plazo"
};
function tablaRecuento(titulo, filas, cabecera, nota) {
  if (filas.length === 0) return false;
  return h(
    "div",
    { class: "bloque-memoria" },
    h("h3", {}, titulo),
    nota !== void 0 && h("p", { class: "sutil" }, nota),
    h(
      "table",
      { class: "acta-puntos" },
      h("thead", {}, h("tr", {}, h("th", {}, cabecera), h("th", {}, "Veces"))),
      h(
        "tbody",
        {},
        ...filas.map(
          (f) => h("tr", {}, h("td", {}, f.etiqueta), h("td", {}, String(f.veces)))
        )
      )
    )
  );
}
function panelPlazoMemoria(memoria) {
  const estado2 = estadoMemoria(memoria);
  const dias = memoria.diasParaPresentar;
  return h(
    "div",
    { class: `tarjeta plazo-memoria ${estado2}` },
    h("h2", {}, `Memoria anual de ${memoria.anio}`),
    h(
      "p",
      { class: "plazo" },
      h("b", {}, TEXTO_ESTADO[estado2]),
      ` \xB7 L\xEDmite de presentaci\xF3n: ${fechaLarga(memoria.limitePresentacion)}. `,
      dias >= 0 ? `Quedan ${dias} d\xEDa(s).` : `Venci\xF3 hace ${Math.abs(dias)} d\xEDa(s).`
    ),
    h(
      "p",
      { class: "sutil" },
      "Art. 8.b) del RD 1434/1999: la entidad colaboradora debe llevar registro del n\xFAmero de inspecciones y actuaciones realizadas, de los certificados tramitados y de las tarifas aplicadas, y presentar memoria anual antes del 31 de marzo."
    )
  );
}
function pintarMemoria(memoria) {
  return h(
    "article",
    { class: "acta memoria" },
    h("h1", {}, `Memoria anual ${memoria.anio}`),
    h(
      "p",
      { class: "acta-norma" },
      "Art. 8.b) del Real Decreto 1434/1999 \xB7 Presentaci\xF3n antes del ",
      h("b", {}, fechaLarga(memoria.limitePresentacion))
    ),
    h("h2", {}, "Actuaciones realizadas"),
    h(
      "table",
      { class: "acta-datos" },
      h("tr", {}, h("th", {}, "Actuaciones"), h("td", {}, String(memoria.totalActuaciones))),
      h("tr", {}, h("th", {}, "Visitas"), h("td", {}, String(memoria.totalVisitas))),
      h(
        "tr",
        {},
        h("th", {}, "Embarcaciones distintas"),
        h("td", {}, String(memoria.embarcacionesDistintas))
      ),
      h("tr", {}, h("th", {}, "Favorables"), h("td", {}, String(memoria.favorables))),
      h("tr", {}, h("th", {}, "Desfavorables"), h("td", {}, String(memoria.desfavorables))),
      memoria.enEjecucion > 0 && h(
        "tr",
        {},
        h("th", {}, "Sin cerrar"),
        h("td", {}, `${memoria.enEjecucion} (no computan como resultado)`)
      )
    ),
    tablaRecuento(
      "Por tipo de reconocimiento",
      memoria.porTipo.map((r) => ({ ...r, etiqueta: nombreTipo(r.clave) })),
      "Tipo"
    ),
    tablaRecuento("Por motivo", memoria.porMotivo, "Motivo"),
    h("h2", {}, "Deficiencias"),
    h(
      "table",
      { class: "acta-datos" },
      h(
        "tr",
        {},
        h("th", {}, "Deficiencias graves"),
        h("td", {}, String(memoria.totalDeficienciasGraves))
      ),
      h(
        "tr",
        {},
        h("th", {}, "Deficiencias leves"),
        h("td", {}, String(memoria.totalDeficienciasLeves))
      )
    ),
    tablaRecuento(
      "Supuestos del Anexo III m\xE1s invocados",
      memoria.deficienciasGravesFrecuentes,
      "Supuesto",
      "\u26A0 La correspondencia entre el punto de inspecci\xF3n y la letra del Anexo III es interpretaci\xF3n propia y est\xE1 pendiente de validar con un inspector en activo. Este recuento la hereda."
    ),
    tablaRecuento(
      "Puntos que m\xE1s veces no se pudieron inspeccionar",
      memoria.puntosNoAccesibles,
      "Punto",
      "Un punto que se repite aqu\xED a\xF1o tras a\xF1o se\xF1ala una limitaci\xF3n del m\xE9todo de inspecci\xF3n, no del barco."
    ),
    h("h2", {}, "Tarifas"),
    h(
      "table",
      { class: "acta-datos" },
      memoria.importeFacturado !== void 0 && h(
        "tr",
        {},
        h("th", {}, "Importe registrado"),
        h("td", {}, `${memoria.importeFacturado.toFixed(2)} \u20AC`)
      ),
      h(
        "tr",
        {},
        h("th", {}, "Actuaciones sin tarifa anotada"),
        h(
          "td",
          {},
          String(memoria.sinTarifa),
          memoria.sinTarifa > 0 ? " \u2014 el art. 8.b) exige registrarla" : ""
        )
      )
    ),
    // Lo que la memoria destapa y que a la entidad le interesa antes que a nadie: el
    // art. 10.2.º obliga a comunicar a la Capitanía Marítima el plazo vencido sin
    // subsanar. Que salga solo es de lo más útil que hace este módulo.
    memoria.subsanacionesVencidas.length > 0 && h(
      "div",
      {},
      h("h2", {}, "Plazos de subsanaci\xF3n vencidos sin reinspecci\xF3n favorable"),
      h(
        "p",
        { class: "salvedad" },
        "Art. 10.2.\xBA del RD 1434/1999: transcurrido el plazo sin que la embarcaci\xF3n haya superado la inspecci\xF3n, la entidad lo comunica a la Capitan\xEDa Mar\xEDtima del puerto de matr\xEDcula, que declara la caducidad del certificado."
      ),
      h(
        "table",
        { class: "acta-puntos" },
        h(
          "thead",
          {},
          h(
            "tr",
            {},
            h("th", {}, "Informe"),
            h("th", {}, "Matr\xEDcula"),
            h("th", {}, "Inspecci\xF3n"),
            h("th", {}, "L\xEDmite de subsanaci\xF3n")
          )
        ),
        h(
          "tbody",
          {},
          ...memoria.subsanacionesVencidas.map(
            (l) => h(
              "tr",
              { class: "no_conforme" },
              h("td", {}, l.numeroInforme),
              h("td", {}, l.matricula),
              h("td", {}, fechaLarga(l.fecha)),
              h("td", {}, fechaLarga(l.limiteSubsanacion ?? ""))
            )
          )
        )
      )
    ),
    h(
      "p",
      { class: "acta-pie" },
      "Memoria compuesta autom\xE1ticamente a partir del registro de actuaciones. ",
      h("b", {}, "No tiene validez oficial: es un prototipo acad\xE9mico.")
    )
  );
}
function pintarRegistro(lineas, acciones) {
  if (lineas.length === 0) {
    return h("p", { class: "sutil" }, "No consta ninguna actuaci\xF3n en este a\xF1o.");
  }
  return h(
    "table",
    { class: "acta-puntos registro" },
    h(
      "thead",
      {},
      h(
        "tr",
        {},
        h("th", {}, "Fecha"),
        h("th", {}, "Informe"),
        h("th", {}, "Embarcaci\xF3n"),
        h("th", {}, "Tipo"),
        h("th", {}, "Visitas"),
        h("th", {}, "Resultado"),
        h("th", {}, "Tarifa")
      )
    ),
    h(
      "tbody",
      {},
      ...lineas.map(
        (l) => h(
          "tr",
          {
            class: l.resultado === "desfavorable" ? "no_conforme" : "",
            onclick: () => acciones.alAbrirInspeccion(l.inspeccionId)
          },
          h("td", {}, fechaLarga(l.fecha)),
          h("td", {}, l.numeroInforme),
          h("td", {}, `${l.nombre || "\u2014"} (${l.matricula || "sin matr\xEDcula"})`),
          h("td", {}, nombreTipo(l.tipo)),
          h("td", {}, String(l.visitas)),
          h("td", {}, l.resultado),
          h("td", {}, l.tarifaEuros !== void 0 ? `${l.tarifaEuros.toFixed(2)} \u20AC` : "\u2014")
        )
      )
    )
  );
}
function selectorAnio(anios, seleccionado, acciones) {
  return h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, "A\xF1o"),
    selector(
      anios.map((a) => ({ valor: String(a), texto: String(a) })),
      String(seleccionado),
      (v) => acciones.alCambiarAnio(Number(v))
    )
  );
}

// src/datos/biblioteca.json
var biblioteca_default = {
  grupos: [
    {
      clave: "nucleo",
      titulo: "N\xFAcleo \u2014 lo que aplica el sistema"
    },
    {
      clave: "actividad",
      titulo: "Marco de la actividad inspectora"
    },
    {
      clave: "registral",
      titulo: "Registro y explotaci\xF3n"
    },
    {
      clave: "manuales",
      titulo: "Manuales de fabricante"
    },
    {
      clave: "derogadas",
      titulo: "Derogadas \u2014 por los barcos certificados con ellas"
    }
  ],
  documentos: [
    {
      id: "rd-1434-1999",
      grupo: "nucleo",
      titulo: "RD 1434/1999 \u2014 reconocimientos e inspecciones de las embarcaciones de recreo",
      referencia: "BOE-A-1999-18663",
      url: "biblioteca/rd-1434-1999.pdf?v=c7e2a4aba917",
      paginas: 28,
      bytes: 1055516
    },
    {
      id: "rd-339-2021",
      grupo: "nucleo",
      titulo: "RD 339/2021 \u2014 equipo de seguridad y prevenci\xF3n de la contaminaci\xF3n",
      referencia: "BOE-A-2021-8268",
      url: "biblioteca/rd-339-2021.pdf?v=7c9cc42f84f3",
      paginas: 21,
      bytes: 241085
    },
    {
      id: "rd-98-2016",
      grupo: "nucleo",
      titulo: "RD 98/2016 \u2014 motos n\xE1uticas y embarcaciones deportivas (marcado CE)",
      referencia: "BOE-A-2016-2578",
      url: "biblioteca/rd-98-2016.pdf?v=a97389143546",
      paginas: 38,
      bytes: 598966
    },
    {
      id: "rd-1837-2000",
      grupo: "actividad",
      titulo: "RD 1837/2000 \u2014 Reglamento de inspecci\xF3n y certificaci\xF3n de buques civiles",
      referencia: "BOE-A-2000-21432",
      url: "biblioteca/rd-1837-2000.pdf?v=d0ed875c4a7d",
      paginas: 43,
      bytes: 350255
    },
    {
      id: "rd-877-2011",
      grupo: "actividad",
      titulo: "RD 877/2011 \u2014 organizaciones de inspecci\xF3n y reconocimiento de buques",
      referencia: "BOE-A-2011-10972",
      url: "biblioteca/rd-877-2011.pdf?v=4983ab4f0c0b",
      paginas: 13,
      bytes: 178213
    },
    {
      id: "rd-927-2020",
      grupo: "actividad",
      titulo: "RD 927/2020 \u2014 ampl\xEDa el \xE1mbito de las organizaciones de inspecci\xF3n",
      referencia: "BOE-A-2020-13021",
      url: "biblioteca/rd-927-2020.pdf?v=90049d5e387b",
      paginas: 7,
      bytes: 195283
    },
    {
      id: "orden-fom-3479-2002",
      grupo: "actividad",
      titulo: "Orden FOM/3479/2002 \u2014 firma y visado de documentos",
      referencia: "BOE-A-2003-1586",
      url: "biblioteca/orden-fom-3479-2002.pdf?v=8ae152913e45",
      paginas: 4,
      bytes: 186506
    },
    {
      id: "rd-587-2022",
      grupo: "actividad",
      titulo: "RD 587/2022 \u2014 modifica diversas normas de seguridad mar\xEDtima",
      referencia: "BOE-A-2022-12013",
      url: "biblioteca/rd-587-2022.pdf?v=ba43b8f40029",
      paginas: 7,
      bytes: 234035
    },
    {
      id: "rd-1435-2010",
      grupo: "registral",
      titulo: "RD 1435/2010 \u2014 abanderamiento y matriculaci\xF3n (listas 6.\xAA y 7.\xAA)",
      referencia: "BOE-A-2010-17038",
      url: "biblioteca/rd-1435-2010.pdf?v=88bc3af79766",
      paginas: 28,
      bytes: 749568
    },
    {
      id: "rd-804-2014",
      grupo: "registral",
      titulo: "RD 804/2014 \u2014 buques de recreo con hasta 12 pasajeros",
      referencia: "BOE-A-2014-10572",
      url: "biblioteca/rd-804-2014.pdf?v=034354f168be",
      paginas: 77,
      bytes: 913004
    },
    {
      id: "rd-875-2014",
      grupo: "registral",
      titulo: "RD 875/2014 \u2014 titulaciones n\xE1uticas de recreo",
      referencia: "BOE-A-2014-10344",
      url: "biblioteca/rd-875-2014.pdf?v=23c9b5547196",
      paginas: 116,
      bytes: 4401857
    },
    {
      id: "manual-yanmar-ym",
      grupo: "manuales",
      titulo: "Yanmar \u2014 YM Series Operation Manual (2YM15, 3YM20, 3YM30), \xA9 2009",
      plan: "yanmar-ym",
      desfasePagina: 6,
      url: "",
      paginas: 114,
      bytes: 2943019
    },
    {
      id: "manual-honda-bf8d-bf20d",
      grupo: "manuales",
      titulo: "Honda \u2014 Owner's Manual BF8D, BF9.9D, BF10D, BF15D, BF20D, \xA9 2020",
      plan: "honda-bf8d-bf20d",
      desfasePagina: 1,
      url: "",
      externo: "https://cf.hondappsv.com/files/OM/OM001369NZL/32ZY0637_web.pdf",
      paginas: 162,
      bytes: 23466584
    },
    {
      id: "orden-fom-1144-2003",
      grupo: "derogadas",
      titulo: "Orden FOM/1144/2003 \u2014 equipos de seguridad a bordo",
      referencia: "BOE-A-2003-9581",
      derogadaPor: "RD 339/2021",
      url: "biblioteca/orden-fom-1144-2003.pdf?v=216a70aef03c",
      paginas: 14,
      bytes: 275492
    },
    {
      id: "rd-2127-2004",
      grupo: "derogadas",
      titulo: "RD 2127/2004 \u2014 requisitos de seguridad de embarcaciones de recreo",
      referencia: "BOE-A-2004-18571",
      derogadaPor: "RD 98/2016",
      url: "biblioteca/rd-2127-2004.pdf?v=b96cba216f06",
      paginas: 31,
      bytes: 299748
    }
  ],
  auxiliares: [
    "pdfjs/standard_fonts/FoxitDingbats.pfb",
    "pdfjs/standard_fonts/FoxitFixed.pfb",
    "pdfjs/standard_fonts/FoxitFixedBold.pfb",
    "pdfjs/standard_fonts/FoxitFixedBoldItalic.pfb",
    "pdfjs/standard_fonts/FoxitFixedItalic.pfb",
    "pdfjs/standard_fonts/FoxitSerif.pfb",
    "pdfjs/standard_fonts/FoxitSerifBold.pfb",
    "pdfjs/standard_fonts/FoxitSerifBoldItalic.pfb",
    "pdfjs/standard_fonts/FoxitSerifItalic.pfb",
    "pdfjs/standard_fonts/FoxitSymbol.pfb",
    "pdfjs/standard_fonts/LICENSE_FOXIT",
    "pdfjs/standard_fonts/LICENSE_LIBERATION",
    "pdfjs/standard_fonts/LiberationSans-Bold.ttf",
    "pdfjs/standard_fonts/LiberationSans-BoldItalic.ttf",
    "pdfjs/standard_fonts/LiberationSans-Italic.ttf",
    "pdfjs/standard_fonts/LiberationSans-Regular.ttf",
    "pdfjs/wasm/LICENSE_JBIG2",
    "pdfjs/wasm/LICENSE_OPENJPEG",
    "pdfjs/wasm/LICENSE_PDFJS_JBIG2",
    "pdfjs/wasm/LICENSE_PDFJS_OPENJPEG",
    "pdfjs/wasm/LICENSE_PDFJS_QCMS",
    "pdfjs/wasm/LICENSE_QCMS",
    "pdfjs/wasm/jbig2.wasm",
    "pdfjs/wasm/jbig2_nowasm_fallback.js",
    "pdfjs/wasm/openjpeg.wasm",
    "pdfjs/wasm/openjpeg_nowasm_fallback.js",
    "pdfjs/wasm/qcms_bg.wasm",
    "pdfjs/wasm/quickjs-eval.js",
    "pdfjs/wasm/quickjs-eval.wasm"
  ]
};

// src/agenda.ts
var DIAS_PROXIMOS = 7;
var DIAS_PROGRAMAR = 60;
function situacionCita(cita, hoy2) {
  if (cita.estado === "hecha") return "hecha";
  if (cita.estado === "anulada") return "anulada";
  if (cita.fecha < hoy2) return "atrasada";
  if (cita.fecha === hoy2) return "hoy";
  if (cita.fecha <= sumarDias(hoy2, DIAS_PROXIMOS)) return "proxima";
  return "futura";
}
function ordenarCitas(citas) {
  return [...citas].sort(
    (a, b) => a.fecha.localeCompare(b.fecha) || (a.hora ?? "99:99").localeCompare(b.hora ?? "99:99") || a.embarcacion.nombre.localeCompare(b.embarcacion.nombre, "es")
  );
}
function resumirAgenda(citas, hoy2) {
  const ordenadas = ordenarCitas(citas);
  const de = (s) => ordenadas.filter((c) => situacionCita(c, hoy2) === s);
  return { atrasadas: de("atrasada"), hoy: de("hoy"), proximas: de("proxima"), futuras: de("futura") };
}
function porProgramar(barcos, citas, hoy2) {
  const limite = sumarDias(hoy2, DIAS_PROGRAMAR);
  const conCita = new Set(
    citas.filter((c) => c.estado === "pendiente").map((c) => c.embarcacion.matricula.trim())
  );
  const propuestas = [];
  for (const barco2 of barcos) {
    if (conCita.has(barco2.matricula) || barco2.enCurso === true) continue;
    const certificado = barco2.vencimientos.find((v) => v.clase === "certificado" && v.fecha <= limite);
    const proximo = certificado !== void 0 && certificado.fecha < hoy2 ? certificado : barco2.vencimientos.filter((v) => (v.clase === "certificado" || v.clase === "reconocimiento") && v.fecha <= limite).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    if (proximo === void 0) continue;
    propuestas.push({
      matricula: barco2.matricula,
      nombre: barco2.nombre,
      concepto: proximo.clase === "certificado" ? "Reconocimiento peri\xF3dico (caduca el certificado)" : "Reconocimiento intermedio (se cierra la ventana)",
      fecha: proximo.fecha,
      vencido: proximo.fecha < hoy2,
      cita: proximo.cita,
      motivo: proximo.clase === "certificado" ? "periodico" : "intermedio"
    });
  }
  return propuestas.sort((a, b) => a.fecha.localeCompare(b.fecha));
}
function datosDesdeCita(cita, inspecciones) {
  const matricula = cita.embarcacion.matricula.trim();
  const previa = inspecciones.filter((i) => matricula !== "" && i.embarcacion.matricula.trim() === matricula).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  return {
    motivo: cita.motivo,
    fecha: cita.fecha,
    lugar: cita.lugar,
    ...previa !== void 0 ? { embarcacionPrevia: previa.embarcacion } : {},
    nombre: cita.embarcacion.nombre,
    matricula
  };
}

// src/avisos.ts
var DIAS_AVISO_SUBSANACION = 15;
var DIAS_BORRADOR = 7;
var DIAS_AVISO_NOTA = 3;
var ORDEN_NIVEL = { urgente: 0, atencion: 1, info: 2 };
var NOMBRE_RECONOCIMIENTO = {
  periodico: "peri\xF3dico",
  intermedio: "intermedio",
  adicional: "adicional",
  extraordinario: "extraordinario"
};
function barco(nombre, matricula) {
  return nombre !== void 0 && nombre.trim() !== "" ? `${nombre} (${matricula})` : matricula;
}
function componerAvisos(entrada, hoy2) {
  const avisos = [];
  const citasPendientes = entrada.citas.filter((c) => c.estado === "pendiente");
  const citaDe = (matricula) => citasPendientes.filter((c) => c.embarcacion.matricula.trim() === matricula).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  for (const l of componerHistorico(entrada.inspecciones, {}, hoy2)) {
    if (l.limiteSubsanacion === void 0 || l.subsanacion === "subsanada") continue;
    const quien = barco(l.nombre, l.matricula);
    if (l.subsanacion === "vencida") {
      avisos.push({
        id: `subsanacion:${l.inspeccionId}`,
        nivel: "urgente",
        tipo: "subsanacion",
        titulo: `Subsanaci\xF3n vencida sin reinspecci\xF3n: ${quien}`,
        detalle: `El plazo acab\xF3 el ${l.limiteSubsanacion}. La entidad debe comunicarlo a la Capitan\xEDa Mar\xEDtima.`,
        fundamento: "RD 1434/1999, art. 10.2.\xBA",
        fecha: l.limiteSubsanacion,
        matricula: l.matricula,
        destino: { pantalla: "inspeccion", id: l.inspeccionId }
      });
    } else if (l.limiteSubsanacion <= sumarDias(hoy2, DIAS_AVISO_SUBSANACION)) {
      avisos.push({
        id: `subsanacion:${l.inspeccionId}`,
        nivel: "atencion",
        tipo: "subsanacion",
        titulo: `Vence el plazo de subsanaci\xF3n: ${quien}`,
        detalle: `Dos meses desde el reconocimiento desfavorable; acaba el ${l.limiteSubsanacion}.`,
        fundamento: "RD 1434/1999, art. 10.2.\xBA",
        fecha: l.limiteSubsanacion,
        matricula: l.matricula,
        destino: { pantalla: "inspeccion", id: l.inspeccionId }
      });
    }
  }
  for (const { expediente, compuesto } of entrada.expedientes) {
    const matricula = expediente.matricula;
    const quien = barco(compuesto.embarcacion?.nombre, matricula);
    const cita = citaDe(matricula);
    const enCurso = entrada.inspecciones.some(
      (i) => i.estado === "borrador" && i.embarcacion.matricula.trim() === matricula
    );
    for (const o of compuesto.obligacionesPendientes) {
      avisos.push({
        id: `suceso:${matricula}:${o.suceso.id}:${o.fundamento.reglaId}`,
        nivel: cita !== void 0 ? "atencion" : "urgente",
        tipo: "suceso",
        titulo: `Reconocimiento ${NOMBRE_RECONOCIMIENTO[o.tipo] ?? o.tipo} pendiente: ${quien}`,
        detalle: `Por ${o.suceso.descripcion || o.suceso.tipo} (${o.suceso.fecha}).` + (cita !== void 0 ? ` Tiene cita el ${cita.fecha}.` : ""),
        fundamento: o.fundamento.cita,
        fecha: o.suceso.fecha,
        matricula,
        destino: { pantalla: "expediente", matricula }
      });
    }
    for (const s of expediente.sucesos) {
      if (s.tipo !== "averia_maquinaria" || s.afectaSeguridad !== void 0) continue;
      avisos.push({
        id: `averia:${matricula}:${s.id}`,
        nivel: "atencion",
        tipo: "averia_sin_valorar",
        titulo: `Valorar si la aver\xEDa afecta a la seguridad: ${quien}`,
        detalle: `${s.descripcion || "Aver\xEDa en maquinaria"} (${s.fecha}). Si afecta a la seguridad de la navegaci\xF3n, obliga a un reconocimiento adicional.`,
        fundamento: "RD 1434/1999, art. 3.D.c)",
        fecha: s.fecha,
        matricula,
        destino: { pantalla: "expediente", matricula }
      });
    }
    const certificadoCaducado = compuesto.vencimientos.some((v) => v.clase === "certificado" && v.estado === "vencido");
    for (const v of compuesto.vencimientos) {
      if (v.clase === "certificado" || v.clase === "reconocimiento") {
        if (v.estado === "vigente") continue;
        if (v.clase === "reconocimiento" && certificadoCaducado) continue;
        const concepto = v.clase === "certificado" ? "Reconocimiento peri\xF3dico" : "Reconocimiento intermedio";
        const nivel = cita !== void 0 || enCurso ? "info" : v.estado === "vencido" ? "urgente" : "atencion";
        avisos.push({
          id: `reconocimiento:${matricula}:${v.clase}`,
          nivel,
          tipo: "reconocimiento",
          titulo: `${concepto} ${v.estado === "vencido" ? "vencido" : "pr\xF3ximo"}: ${quien}`,
          detalle: `${v.concepto}: ${v.fecha}.` + (enCurso ? " Hay una inspecci\xF3n en curso." : cita !== void 0 ? ` Tiene cita el ${cita.fecha}.` : " Sin cita en la agenda."),
          fundamento: v.cita,
          fecha: v.fecha,
          matricula,
          destino: cita !== void 0 ? { pantalla: "agenda", citaId: cita.id } : { pantalla: "expediente", matricula }
        });
      } else if (v.clase === "equipo" && v.gravedadSiVence !== void 0 && v.estado !== "vigente") {
        avisos.push({
          id: `equipo:${matricula}:${v.concepto}`,
          nivel: v.estado === "vencido" ? "atencion" : "info",
          tipo: "equipo",
          titulo: `${v.concepto} \u2014 ${v.estado === "vencido" ? "caducado" : "caduca pronto"}: ${quien}`,
          detalle: `${v.estado === "vencido" ? "Caduc\xF3" : "Caduca"} el ${v.fecha}. En el pr\xF3ximo reconocimiento ser\xEDa deficiencia grave: ${v.gravedadSiVence.supuesto}`,
          fundamento: `RD 1434/1999, Anexo III, letra ${v.gravedadSiVence.letra})`,
          fecha: v.fecha,
          matricula,
          destino: { pantalla: "expediente", matricula }
        });
      }
    }
  }
  for (const c of citasPendientes) {
    const situacion = situacionCita(c, hoy2);
    const quien = barco(c.embarcacion.nombre, c.embarcacion.matricula || "sin matr\xEDcula");
    if (situacion === "atrasada") {
      avisos.push({
        id: `cita:${c.id}`,
        nivel: "atencion",
        tipo: "cita",
        titulo: `Cita pasada sin inspecci\xF3n: ${quien}`,
        detalle: `Era el ${c.fecha}${c.lugar ? ` en ${c.lugar}` : ""}. Empiece la inspecci\xF3n, c\xE1mbiela de fecha o an\xFAlela.`,
        fecha: c.fecha,
        ...c.embarcacion.matricula ? { matricula: c.embarcacion.matricula } : {},
        destino: { pantalla: "agenda", citaId: c.id }
      });
    } else if (situacion === "hoy") {
      avisos.push({
        id: `cita:${c.id}`,
        nivel: "info",
        tipo: "cita",
        titulo: `Hoy${c.hora ? ` a las ${c.hora}` : ""}: ${quien}`,
        ...c.lugar ? { detalle: c.lugar } : {},
        fecha: c.fecha,
        ...c.embarcacion.matricula ? { matricula: c.embarcacion.matricula } : {},
        destino: { pantalla: "agenda", citaId: c.id }
      });
    }
  }
  for (const i of entrada.inspecciones) {
    if (i.estado !== "borrador") continue;
    const desde = i.creadaEn.slice(0, 10);
    if (desde > sumarDias(hoy2, -DIAS_BORRADOR)) continue;
    avisos.push({
      id: `borrador:${i.id}`,
      nivel: "atencion",
      tipo: "borrador",
      titulo: `Borrador abierto desde el ${desde}: ${barco(i.embarcacion.nombre, i.embarcacion.matricula || "sin matr\xEDcula")}`,
      detalle: "Una inspecci\xF3n sin firmar no cierra ninguna obligaci\xF3n ni cuenta en el registro.",
      fecha: desde,
      destino: { pantalla: "inspeccion", id: i.id }
    });
  }
  const anterior = Number(hoy2.slice(0, 4)) - 1;
  const memoria = componerMemoriaAnual(entrada.inspecciones, anterior, hoy2);
  if (memoria.totalActuaciones > 0 && estadoMemoria(memoria) === "proximo") {
    avisos.push({
      id: `memoria:${anterior}`,
      nivel: "atencion",
      tipo: "memoria",
      titulo: `Memoria anual de ${anterior}: quedan ${memoria.diasParaPresentar} d\xEDas`,
      detalle: `${memoria.totalActuaciones} actuaciones. L\xEDmite: ${memoria.limitePresentacion}.`,
      fundamento: "RD 1434/1999, art. 8.b)",
      fecha: memoria.limitePresentacion,
      destino: { pantalla: "registro" }
    });
  }
  for (const n of entrada.notas) {
    if (n.resuelta !== void 0) continue;
    const vencida = n.limite !== void 0 && n.limite < hoy2;
    const cerca = n.limite !== void 0 && n.limite <= sumarDias(hoy2, DIAS_AVISO_NOTA);
    avisos.push({
      id: `nota:${n.id}`,
      nivel: n.urgente || vencida ? "urgente" : cerca ? "atencion" : "info",
      tipo: "nota",
      titulo: n.texto,
      ...n.limite !== void 0 ? { detalle: `${vencida ? "Era para" : "Para"} el ${n.limite}.` } : {},
      fecha: n.limite ?? n.creadaEn.slice(0, 10),
      ...n.matricula !== void 0 ? { matricula: n.matricula } : {},
      destino: { pantalla: "nota", id: n.id }
    });
  }
  return avisos.sort(
    (a, b) => ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel] || (a.fecha ?? "9999").localeCompare(b.fecha ?? "9999") || a.titulo.localeCompare(b.titulo, "es")
  );
}
function contarAvisos(avisos) {
  return {
    urgente: avisos.filter((a) => a.nivel === "urgente").length,
    atencion: avisos.filter((a) => a.nivel === "atencion").length,
    info: avisos.filter((a) => a.nivel === "info").length
  };
}

// src/biblioteca.ts
function normalizarCaracter(c) {
  const n = c.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return n.length === 1 ? n : c.toLowerCase().length === 1 ? c.toLowerCase() : c;
}
function normalizarTexto(texto) {
  let salida = "";
  for (let i = 0; i < texto.length; i += 1) salida += normalizarCaracter(texto[i]);
  return salida;
}
var CONTEXTO = 60;
function expresionDeBusqueda(consulta) {
  const palabras = normalizarTexto(consulta).split(/[^\p{L}\p{N}]+/u).filter((p) => p !== "");
  if (palabras.join("").length < 2) return void 0;
  const escapar = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(palabras.map(escapar).join("[\\p{L}\\p{N}]*[^\\p{L}\\p{N}]+") + "[\\p{L}\\p{N}]*", "gu");
}
function buscarEnBiblioteca(indice, consulta, maximo = 60) {
  const expresion = expresionDeBusqueda(consulta);
  const resultados2 = [];
  const porDocumento = /* @__PURE__ */ new Map();
  let total = 0;
  if (expresion === void 0) return { resultados: resultados2, total, porDocumento };
  for (const doc of indice.documentos) {
    doc.paginas.forEach((texto, i) => {
      const comparable = normalizarTexto(texto);
      for (const m of comparable.matchAll(expresion)) {
        const pos = m.index;
        const fin = pos + m[0].length;
        total += 1;
        porDocumento.set(doc.id, (porDocumento.get(doc.id) ?? 0) + 1);
        if (resultados2.length < maximo) {
          resultados2.push({
            id: doc.id,
            pagina: i + 1,
            antes: (pos > CONTEXTO ? "\u2026" : "") + texto.slice(Math.max(0, pos - CONTEXTO), pos),
            coincidencia: texto.slice(pos, fin),
            despues: texto.slice(fin, fin + CONTEXTO) + (fin + CONTEXTO < texto.length ? "\u2026" : "")
          });
        }
      }
    });
  }
  return { resultados: resultados2, total, porDocumento };
}
function paginaDeFuente(fuente, documento) {
  const impresa = /\bpp?\.\s*(\d+)/.exec(fuente)?.[1];
  if (impresa === void 0) return 1;
  const pagina = Number(impresa) + (documento.desfasePagina ?? 0);
  return Math.min(Math.max(1, pagina), documento.paginas);
}
function manualDePlan(catalogo, planId) {
  return catalogo.documentos.find((d) => d.plan === planId);
}
function validarCatalogoBiblioteca(datos) {
  const c = datos;
  if (c === null || typeof c !== "object" || !Array.isArray(c.documentos) || !Array.isArray(c.grupos)) {
    throw new Error("El cat\xE1logo de la biblioteca no tiene documentos ni grupos");
  }
  const grupos = new Set(c.grupos.map((g) => g.clave));
  const vistos = /* @__PURE__ */ new Set();
  for (const d of c.documentos) {
    if (vistos.has(d.id)) throw new Error(`Documento repetido en la biblioteca: ${d.id}`);
    vistos.add(d.id);
    if (!grupos.has(d.grupo)) throw new Error(`${d.id}: grupo desconocido '${d.grupo}'`);
    if (d.grupo === "manuales" && d.plan === void 0) {
      throw new Error(`${d.id}: un manual debe decir de qu\xE9 plan de mantenimiento es la fuente`);
    }
  }
  return c;
}

// src/vista/portada.ts
var SIMBOLO_NIVEL = { urgente: "!", atencion: "\u203A", info: "\xB7" };
function lineaAviso(a, alAbrir) {
  return h(
    "li",
    { class: `aviso ${a.nivel}`, onclick: () => alAbrir(a) },
    h("span", { class: `marca-aviso ${a.nivel}`, "aria-hidden": "true" }, SIMBOLO_NIVEL[a.nivel]),
    h(
      "div",
      { class: "aviso-cuerpo" },
      h("b", {}, a.titulo),
      a.detalle !== void 0 && h("div", { class: "sutil" }, a.detalle),
      a.fundamento !== void 0 && h("div", { class: "cita" }, a.fundamento)
    )
  );
}
function lineaCita(c, hoy2, alAbrir) {
  const cuando = c.fecha === hoy2 ? "Hoy" : fechaLarga(c.fecha);
  return h(
    "li",
    { class: `cita-agenda ${c.origen}`, onclick: () => alAbrir(c) },
    h("div", { class: "cita-hora" }, c.hora ?? "\u2014"),
    h(
      "div",
      {},
      h("b", {}, c.embarcacion.nombre || c.embarcacion.matricula || "(sin nombre)"),
      h(
        "div",
        { class: "sutil" },
        [cuando, nombreTipo(c.motivo), c.lugar, c.origen === "empresa" ? `encargo ${c.referenciaEncargo ?? ""}`.trim() : void 0].filter(Boolean).join(" \xB7 ")
      )
    )
  );
}
function zona(clase, titulo, cifra3, cuerpo, pie) {
  return h(
    "section",
    { class: `zona-panel ${clase}` },
    h("header", { class: "zona-cabecera" }, h("h2", {}, titulo), cifra3 !== void 0 && h("span", { class: "zona-cifra" }, cifra3)),
    ...cuerpo,
    pie
  );
}
var verTodo = (texto, accion) => h("button", { class: "ver-todo", type: "button", onclick: accion }, texto);
function pintarPanel(d, acciones) {
  const cuenta = contarAvisos(d.avisos);
  const pendientesAgenda = d.agenda.atrasadas.length + d.agenda.hoy.length + d.agenda.proximas.length;
  let busqueda = "";
  const avisosVisibles = d.avisos.filter((a) => a.nivel !== "info").slice(0, 5);
  const zonaAvisos = zona(
    `avisos ${cuenta.urgente > 0 ? "hay-urgentes" : ""}`,
    "Avisos",
    cuenta.urgente + cuenta.atencion > 0 ? [cuenta.urgente > 0 ? `${cuenta.urgente} urgente${cuenta.urgente > 1 ? "s" : ""}` : "", cuenta.atencion > 0 ? `${cuenta.atencion} por atender` : ""].filter(Boolean).join(" \xB7 ") : void 0,
    [
      avisosVisibles.length === 0 && h("p", { class: "vacio-corto" }, "Nada pendiente."),
      avisosVisibles.length > 0 && h("ul", { class: "avisos" }, ...avisosVisibles.map((a) => lineaAviso(a, acciones.alAbrirAviso)))
    ],
    verTodo("Todos los avisos \xB7 anotar aver\xEDa o nota", () => acciones.alIr("avisos"))
  );
  const deHoyEnAdelante = [...d.agenda.atrasadas, ...d.agenda.hoy, ...d.agenda.proximas].slice(0, 5);
  const zonaAgenda = zona(
    "agenda",
    d.perfil.entidad.trim() !== "" ? `Agenda \xB7 encargos de ${d.perfil.entidad}` : "Agenda",
    pendientesAgenda > 0 ? `${d.agenda.hoy.length} hoy \xB7 ${d.agenda.proximas.length} esta semana` : void 0,
    [
      deHoyEnAdelante.length === 0 && h("p", { class: "vacio-corto" }, "Sin citas en los pr\xF3ximos siete d\xEDas."),
      deHoyEnAdelante.length > 0 && h("ul", { class: "citas" }, ...deHoyEnAdelante.map((c) => lineaCita(c, d.hoy, acciones.alAbrirCita))),
      d.porProgramar.length > 0 && h(
        "div",
        { class: "por-programar" },
        h("h3", {}, `Toca programar (${d.porProgramar.length})`),
        h(
          "ul",
          {},
          ...d.porProgramar.slice(0, 3).map(
            (p) => h(
              "li",
              {},
              h("span", {}, h("b", {}, p.nombre || p.matricula), ` \u2014 ${p.concepto.toLowerCase()}, ${p.vencido ? "venci\xF3" : "vence"} el ${fechaLarga(p.fecha)} `),
              h("button", { type: "button", class: "enlace", onclick: () => acciones.alProgramar(p) }, "Programar")
            )
          )
        )
      )
    ],
    verTodo("Agenda completa \xB7 nueva cita", () => acciones.alIr("agenda"))
  );
  const r = d.historial.resumen;
  const zonaHistorial = zona(
    "historial",
    "Historial",
    `${d.historial.total} inspecciones`,
    [
      h(
        "div",
        { class: "cifras" },
        cifra(String(r.total), `en ${d.historial.anio}`),
        cifra(String(r.favorables), "favorables", "verde"),
        cifra(String(r.desfavorables), "desfavorables", r.desfavorables > 0 ? "rojo" : void 0),
        cifra(String(r.vencidas), "subsanaciones vencidas", r.vencidas > 0 ? "rojo" : void 0)
      ),
      d.historial.ultimas.length > 0 && h(
        "ul",
        { class: "ultimas" },
        ...d.historial.ultimas.map(
          (l) => h(
            "li",
            { class: `resultado-${l.resultado.replace(" ", "-")}`, onclick: () => acciones.alAbrirInspeccion(l.inspeccionId) },
            h("b", {}, l.nombre || l.matricula),
            h("span", { class: "sutil" }, ` \xB7 ${nombreTipo(l.tipo)} \xB7 ${fechaLarga(l.fecha)} \xB7 ${l.resultado}`)
          )
        )
      )
    ],
    h(
      "div",
      { class: "botones-zona" },
      verTodo("Hist\xF3rico con filtros", () => acciones.alIr("historico")),
      verTodo(`Embarcaciones (${d.historial.embarcaciones})`, () => acciones.alIr("embarcaciones")),
      verTodo("Registro y memoria anual", () => acciones.alIr("registro"))
    )
  );
  const zonaBiblioteca = zona(
    "biblioteca",
    "Normativa y manuales",
    `${d.biblioteca.normas} normas \xB7 ${d.biblioteca.manuales} manuales`,
    [
      h(
        "form",
        {
          class: "buscador",
          onsubmit: (e) => {
            e.preventDefault();
            if (busqueda.trim() !== "") acciones.alBuscarEnBiblioteca(busqueda.trim());
          }
        },
        h("input", {
          type: "search",
          placeholder: "Buscar en toda la biblioteca: \xABbalsa salvavidas\xBB, \xABart. 10\xBB\u2026",
          oninput: (e) => {
            busqueda = e.target.value;
          }
        }),
        h("button", { type: "submit" }, "Buscar")
      ),
      h("p", { class: "sutil" }, `${d.biblioteca.paginas} p\xE1ginas. Se abren dentro de la aplicaci\xF3n.`)
    ],
    verTodo("Ver la biblioteca", () => acciones.alIr("biblioteca"))
  );
  const ahora = /* @__PURE__ */ new Date();
  const saludo = d.perfil.inspector.trim() !== "" ? d.perfil.inspector.trim() : "Inspecci\xF3n t\xE9cnica de embarcaciones";
  return h(
    "div",
    { class: "panel" },
    h(
      "header",
      { class: "barra portada" },
      h("h1", { class: "con-logo" }, h("img", { src: "./icono.svg", alt: "", width: 34, height: 34 }), saludo),
      h(
        "p",
        { class: "sutil" },
        `${fechaLarga(d.hoy)} \xB7 `,
        d.perfil.entidad.trim() !== "" ? d.perfil.entidad.trim() : "Inspector aut\xF3nomo",
        " \xB7 RD 1434/1999"
      )
    ),
    h(
      "div",
      { class: "contenido panel-contenido" },
      // --- Nueva inspección, siempre lo primero ------------------------------------------
      h(
        "section",
        { class: "zona-panel nueva" },
        h("button", { class: "principal", type: "button", onclick: acciones.alNuevaInspeccion }, "+ Nueva inspecci\xF3n"),
        d.borradores.length > 0 && h(
          "div",
          { class: "continuar" },
          h("span", { class: "sutil" }, "Continuar: "),
          ...d.borradores.slice(0, 4).map(
            (i) => h(
              "button",
              { type: "button", class: "chip", onclick: () => acciones.alAbrirInspeccion(i.id) },
              i.embarcacion.nombre || i.embarcacion.matricula || "(sin nombre)"
            )
          )
        ),
        d.soloEjemplo && h(
          "button",
          { type: "button", class: "secundario", onclick: acciones.alCargarEjemplo },
          d.historial.total === 0 ? "Cargar un caso de ejemplo" : "Reiniciar el caso de ejemplo"
        )
      ),
      h(
        "div",
        { class: "rejilla-panel" },
        ...cuenta.urgente > 0 ? [zonaAvisos, zonaAgenda, zonaHistorial, zonaBiblioteca] : [zonaAgenda, zonaAvisos, zonaHistorial, zonaBiblioteca]
      ),
      // --- Lo de la oficina y los ajustes, al final -----------------------------------------
      h(
        "details",
        { class: "ajustes" },
        h("summary", {}, "Perfil del inspector y cat\xE1logo"),
        formularioPerfil(d.perfil, acciones.alCambiarPerfil),
        h(
          "button",
          { type: "button", class: "secundario", onclick: () => acciones.alIr("revision") },
          "Revisar el cat\xE1logo de reglas"
        ),
        h(
          "button",
          { type: "button", class: "secundario", onclick: () => acciones.alIr("analisis") },
          "An\xE1lisis de fallos de la embarcaci\xF3n de referencia (AMFE)"
        ),
        d.espacio !== void 0 && h("p", { class: "sutil" }, d.espacio),
        h("p", { class: "sutil" }, `Actualizado: ${ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`)
      )
    )
  );
}
function cifra(valor2, texto, color) {
  return h("div", { class: `cifra ${color ?? ""}` }, h("b", {}, valor2), h("span", {}, texto));
}
function formularioPerfil(perfil, alCambiar) {
  const nuevo = { ...perfil };
  return h(
    "div",
    { class: "perfil" },
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Inspector"),
      h("input", {
        type: "text",
        valor: perfil.inspector,
        placeholder: "Nombre y apellidos",
        oninput: (e) => {
          nuevo.inspector = e.target.value;
        }
      }),
      h("small", { class: "campo-ayuda" }, "Se pone como inspector en cada inspecci\xF3n nueva.")
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Entidad colaboradora"),
      h("input", {
        type: "text",
        valor: perfil.entidad,
        placeholder: "Vac\xEDo si trabaja como aut\xF3nomo",
        oninput: (e) => {
          nuevo.entidad = e.target.value;
        }
      }),
      h(
        "small",
        { class: "campo-ayuda" },
        "Con entidad, las citas nuevas se proponen como encargos de ella, con su n\xFAmero de pedido."
      )
    ),
    h("button", { type: "button", onclick: () => alCambiar({ inspector: nuevo.inspector.trim(), entidad: nuevo.entidad.trim() }) }, "Guardar perfil")
  );
}

// src/vista/avisos.ts
var SUCESOS_DE_CLIENTE = [
  "averia_maquinaria",
  "averia_temporal",
  "varada",
  "abordaje",
  "reparacion",
  "modificacion"
];
function pintarAvisos(avisos, notas, barcos, acciones) {
  const cuenta = contarAvisos(avisos);
  const seccion = (nivel, titulo) => {
    const deNivel = avisos.filter((a) => a.nivel === nivel);
    return deNivel.length > 0 && h(
      "div",
      {},
      h("h2", {}, `${titulo} (${deNivel.length})`),
      h("ul", { class: "avisos" }, ...deNivel.map((a) => lineaAviso(a, acciones.alAbrirAviso)))
    );
  };
  return h(
    "div",
    {},
    avisos.length === 0 && h("p", { class: "vacio" }, "No hay nada pendiente."),
    seccion("urgente", "Urgente"),
    seccion("atencion", "Por atender"),
    seccion("info", "Para hoy"),
    h(
      "p",
      { class: "sutil" },
      `Los avisos salen de las inspecciones, los expedientes y la agenda: no hay que cerrarlos a mano. Desaparecen cuando se hace lo que piden. ${cuenta.urgente + cuenta.atencion + cuenta.info} en total.`
    ),
    formularioSuceso(barcos, acciones),
    formularioNota(barcos, acciones),
    notasAbiertas(notas, acciones)
  );
}
function campoMatricula(barcos, idLista, alCambiar) {
  return h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, "Embarcaci\xF3n (matr\xEDcula)"),
    h("input", {
      type: "text",
      list: idLista,
      placeholder: "7\xAA-BA-2-123-19",
      oninput: (e) => alCambiar(e.target.value)
    }),
    h(
      "datalist",
      { id: idLista },
      ...barcos.map((b) => h("option", { value: b.matricula }, b.nombre))
    )
  );
}
function formularioSuceso(barcos, acciones) {
  const nuevo = { matricula: "", fecha: hoy(), tipo: "averia_maquinaria", descripcion: "", afecta: "" };
  const error = h("p", { class: "salvedad", hidden: true }, "");
  return h(
    "details",
    { class: "tarjeta alta-suceso" },
    h("summary", {}, "+ Aver\xEDa o incidencia de un cliente"),
    h(
      "p",
      { class: "sutil" },
      "Se anota como suceso en el expediente del barco. Si obliga a un reconocimiento adicional (art. 3.D del RD 1434/1999), el aviso sale solo, con su art\xEDculo."
    ),
    campoMatricula(barcos, "barcos-suceso", (v) => {
      nuevo.matricula = v;
    }),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Qu\xE9 ha pasado"),
      selector(
        SUCESOS_DE_CLIENTE.map((t) => ({ valor: t, texto: NOMBRE_SUCESO[t] })),
        nuevo.tipo,
        (v) => {
          nuevo.tipo = v;
        }
      )
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Fecha"),
      h("input", {
        type: "date",
        valor: nuevo.fecha,
        oninput: (e) => {
          nuevo.fecha = e.target.value;
        }
      })
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Descripci\xF3n"),
      h("textarea", {
        placeholder: "Lo que ha contado el cliente: \xABse ha parado el motor saliendo de puerto\xBB\u2026",
        oninput: (e) => {
          nuevo.descripcion = e.target.value;
        }
      })
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "\xBFPuede afectar a la seguridad de la navegaci\xF3n?"),
      selector(
        [
          { valor: "", texto: "\u2014 sin valorar todav\xEDa" },
          { valor: "si", texto: "S\xED" },
          { valor: "no", texto: "No" }
        ],
        "",
        (v) => {
          nuevo.afecta = v;
        }
      ),
      h(
        "small",
        { class: "campo-ayuda" },
        "Lo valora el inspector, no el sistema (art. 3.D.c). Sin valorar, queda un aviso para hacerlo."
      )
    ),
    error,
    h(
      "button",
      {
        type: "button",
        onclick: () => {
          if (nuevo.matricula.trim() === "") {
            error.textContent = "Falta la matr\xEDcula: el suceso va al expediente del barco.";
            error.hidden = false;
            return;
          }
          acciones.alAnotarSuceso({
            matricula: nuevo.matricula.trim(),
            fecha: nuevo.fecha,
            tipo: nuevo.tipo,
            descripcion: nuevo.descripcion.trim(),
            ...nuevo.afecta !== "" ? { afectaSeguridad: nuevo.afecta === "si" } : {}
          });
        }
      },
      "Anotar en el expediente"
    )
  );
}
function formularioNota(barcos, acciones) {
  const nueva = { texto: "", matricula: "", limite: "", urgente: false };
  return h(
    "details",
    { class: "tarjeta alta-suceso" },
    h("summary", {}, "+ Nota o recordatorio"),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Qu\xE9 hay que hacer"),
      h("textarea", {
        placeholder: "Llamar a Pedro por la revisi\xF3n de la balsa\u2026",
        oninput: (e) => {
          nueva.texto = e.target.value;
        }
      })
    ),
    campoMatricula(barcos, "barcos-nota", (v) => {
      nueva.matricula = v;
    }),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Para cu\xE1ndo (opcional)"),
      h("input", {
        type: "date",
        oninput: (e) => {
          nueva.limite = e.target.value;
        }
      })
    ),
    h(
      "label",
      { class: "casilla" },
      h("input", {
        type: "checkbox",
        onchange: (e) => {
          nueva.urgente = e.target.checked;
        }
      }),
      h("span", {}, " Urgente")
    ),
    h(
      "button",
      {
        type: "button",
        onclick: () => {
          if (nueva.texto.trim() === "") return;
          acciones.alAnotarNota({
            texto: nueva.texto.trim(),
            ...nueva.matricula.trim() !== "" ? { matricula: nueva.matricula.trim() } : {},
            ...nueva.limite !== "" ? { limite: nueva.limite } : {},
            urgente: nueva.urgente
          });
        }
      },
      "Guardar nota"
    )
  );
}
function notasAbiertas(notas, acciones) {
  const abiertas = notas.filter((n) => n.resuelta === void 0);
  const resueltas = notas.filter((n) => n.resuelta !== void 0).sort((a, b) => (b.resuelta ?? "").localeCompare(a.resuelta ?? ""));
  if (abiertas.length === 0 && resueltas.length === 0) return false;
  return h(
    "div",
    { id: "notas" },
    abiertas.length > 0 && h("h2", {}, `Notas abiertas (${abiertas.length})`),
    abiertas.length > 0 && h(
      "ul",
      { class: "listado notas" },
      ...abiertas.map(
        (n) => h(
          "li",
          { class: n.urgente ? "urgente" : "", id: `nota-${n.id}` },
          h("div", {}, h("b", {}, n.texto)),
          h(
            "div",
            { class: "sutil" },
            [n.matricula, n.limite !== void 0 ? `para el ${n.limite}` : void 0, `anotada el ${n.creadaEn.slice(0, 10)}`].filter(Boolean).join(" \xB7 ")
          ),
          h("button", { type: "button", class: "enlace", onclick: () => acciones.alResolverNota(n.id) }, "Hecho")
        )
      )
    ),
    resueltas.length > 0 && h(
      "details",
      {},
      h("summary", {}, `Resueltas (${resueltas.length})`),
      h(
        "ul",
        { class: "listado notas resueltas" },
        ...resueltas.slice(0, 30).map((n) => h("li", {}, h("s", {}, n.texto), h("span", { class: "sutil" }, ` \xB7 resuelta el ${n.resuelta}`)))
      )
    )
  );
}

// src/vista/agenda.ts
function tarjetaCita(c, dia, acciones, resaltada) {
  const situacion = situacionCita(c, dia);
  let nuevaFecha = c.fecha;
  let nuevaHora = c.hora ?? "";
  return h(
    "li",
    { class: `tarjeta-cita ${situacion} ${c.origen} ${resaltada ? "resaltada" : ""}`, id: `cita-${c.id}` },
    h(
      "div",
      { class: "tarjeta-cita-cabecera" },
      h("span", { class: "cita-hora" }, c.hora ?? "\u2014"),
      h("b", {}, c.embarcacion.nombre || "(sin nombre)"),
      h("span", { class: `etiqueta-origen ${c.origen}` }, c.origen === "empresa" ? "Encargo" : "Propia")
    ),
    h(
      "p",
      { class: "sutil" },
      [
        fechaLarga(c.fecha),
        c.embarcacion.matricula,
        nombreTipo(c.motivo),
        c.lugar,
        c.referenciaEncargo !== void 0 ? `pedido ${c.referenciaEncargo}` : void 0
      ].filter(Boolean).join(" \xB7 ")
    ),
    c.cliente !== void 0 && h(
      "p",
      {},
      c.cliente.nombre,
      c.cliente.telefono !== void 0 && h("a", { href: `tel:${c.cliente.telefono.replace(/\s/g, "")}`, class: "telefono" }, ` \u260E ${c.cliente.telefono}`)
    ),
    c.notas !== void 0 && h("p", { class: "sutil" }, c.notas),
    situacion === "atrasada" && h("p", { class: "salvedad" }, "\u26A0 La fecha ha pasado sin inspecci\xF3n: empi\xE9cela, c\xE1mbiela de fecha o an\xFAlela."),
    c.estado === "pendiente" ? h(
      "div",
      { class: "acciones-cita" },
      h("button", { type: "button", class: "principal pequeno", onclick: () => acciones.alEmpezar(c) }, "Empezar inspecci\xF3n"),
      h(
        "details",
        {},
        h("summary", {}, "Cambiar fecha o anular"),
        h(
          "div",
          { class: "fila-lectura" },
          h("input", {
            type: "date",
            valor: c.fecha,
            oninput: (e) => {
              nuevaFecha = e.target.value;
            }
          }),
          h("input", {
            type: "time",
            valor: c.hora ?? "",
            oninput: (e) => {
              nuevaHora = e.target.value;
            }
          }),
          h(
            "button",
            { type: "button", onclick: () => acciones.alCambiarFecha(c, nuevaFecha, nuevaHora || void 0) },
            "Guardar"
          )
        ),
        h("button", { type: "button", class: "enlace peligro", onclick: () => acciones.alAnular(c) }, "Anular la cita (queda constancia)")
      )
    ) : c.inspeccionId !== void 0 && h("button", { type: "button", class: "enlace", onclick: () => acciones.alAbrirInspeccion(c.inspeccionId) }, "Ver la inspecci\xF3n")
  );
}
function pintarAgenda(citas, porProgramar2, perfil, motivos, borrador, resaltada, acciones) {
  const dia = hoy();
  const r = resumirAgenda(citas, dia);
  const cerradas = ordenarCitas(citas.filter((c) => c.estado !== "pendiente")).reverse();
  const lista2 = (titulo, grupo, clase = "") => grupo.length > 0 && h(
    "div",
    { class: clase },
    h("h2", {}, `${titulo} (${grupo.length})`),
    h("ul", { class: "citas-agenda" }, ...grupo.map((c) => tarjetaCita(c, dia, acciones, c.id === resaltada)))
  );
  return h(
    "div",
    {},
    formularioCita(perfil, motivos, borrador, acciones),
    citas.filter((c) => c.estado === "pendiente").length === 0 && h("p", { class: "vacio" }, "No hay citas pendientes."),
    lista2("Pasadas sin inspecci\xF3n", r.atrasadas, "atrasadas"),
    lista2("Hoy", r.hoy),
    lista2("Pr\xF3ximos siete d\xEDas", r.proximas),
    lista2("M\xE1s adelante", r.futuras),
    porProgramar2.length > 0 && h(
      "div",
      { class: "tarjeta por-programar" },
      h("h2", {}, `Toca programar (${porProgramar2.length})`),
      h(
        "p",
        { class: "sutil" },
        "Barcos con expediente cuyo reconocimiento vence en menos de sesenta d\xEDas, o ya ha vencido, y no tienen cita."
      ),
      h(
        "ul",
        {},
        ...porProgramar2.map(
          (p) => h(
            "li",
            {},
            h("b", {}, p.nombre || p.matricula),
            ` \xB7 ${p.matricula} \u2014 ${p.concepto}: ${p.vencido ? "venci\xF3" : "vence"} el ${fechaLarga(p.fecha)} `,
            h("span", { class: "cita" }, p.cita),
            " ",
            h("button", { type: "button", class: "enlace", onclick: () => acciones.alProgramar(p) }, "Programar")
          )
        )
      )
    ),
    cerradas.length > 0 && h(
      "details",
      {},
      h("summary", {}, `Hechas y anuladas (${cerradas.length})`),
      h("ul", { class: "citas-agenda" }, ...cerradas.slice(0, 50).map((c) => tarjetaCita(c, dia, acciones, false)))
    )
  );
}
function formularioCita(perfil, motivos, borrador, acciones) {
  const conEntidad = perfil.entidad.trim() !== "";
  const n = {
    fecha: borrador?.fecha ?? hoy(),
    hora: "",
    lugar: "",
    nombre: borrador?.nombre ?? "",
    matricula: borrador?.matricula ?? "",
    cliente: "",
    telefono: "",
    motivo: borrador?.motivo ?? "periodico",
    origen: conEntidad ? "empresa" : "propia",
    referencia: "",
    notas: borrador?.notas ?? ""
  };
  const texto = (etiqueta, clave, opciones = {}) => h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, etiqueta),
    h("input", {
      type: opciones.tipo ?? "text",
      valor: String(n[clave]),
      placeholder: opciones.placeholder,
      oninput: (e) => {
        n[clave] = e.target.value;
      }
    }),
    opciones.ayuda !== void 0 && h("small", { class: "campo-ayuda" }, opciones.ayuda)
  );
  const referencia = texto("N\xFAmero de pedido o encargo", "referencia", { placeholder: "El de la entidad" });
  referencia.hidden = n.origen !== "empresa";
  const error = h("p", { class: "salvedad", hidden: true }, "");
  return h(
    "details",
    { class: "tarjeta alta-cita", open: borrador !== void 0 },
    h("summary", {}, conEntidad ? "+ Nuevo encargo o cita" : "+ Nueva cita"),
    h(
      "div",
      { class: "dos-columnas" },
      texto("Fecha", "fecha", { tipo: "date" }),
      texto("Hora", "hora", { tipo: "time" })
    ),
    texto("Embarcaci\xF3n", "nombre", { placeholder: "Nombre del barco" }),
    texto("Matr\xEDcula", "matricula", {
      placeholder: "7\xAA-BA-2-123-19",
      ayuda: "Si el barco ya tiene inspecciones, la ficha se toma de la \xFAltima al empezar."
    }),
    texto("Lugar", "lugar", { placeholder: "Puerto, varadero o direcci\xF3n" }),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Motivo"),
      selector(
        motivos.map((m) => ({ valor: m.clave, texto: m.etiqueta })),
        n.motivo,
        (v) => {
          n.motivo = v;
        }
      )
    ),
    h(
      "div",
      { class: "dos-columnas" },
      texto("Cliente", "cliente", { placeholder: "Propietario o patr\xF3n" }),
      texto("Tel\xE9fono", "telefono", { tipo: "tel" })
    ),
    h(
      "div",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Origen"),
      h(
        "div",
        { class: "botonera" },
        ...["empresa", "propia"].map(
          (o) => h(
            "label",
            { class: "casilla" },
            h("input", {
              type: "radio",
              name: "origen-cita",
              checked: n.origen === o,
              onchange: () => {
                n.origen = o;
                referencia.hidden = o !== "empresa";
              }
            }),
            h("span", {}, o === "empresa" ? ` Encargo${conEntidad ? ` de ${perfil.entidad}` : " de la empresa"}` : " Cita propia")
          )
        )
      )
    ),
    referencia,
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Notas"),
      h("textarea", {
        valor: n.notas,
        oninput: (e) => {
          n.notas = e.target.value;
        }
      })
    ),
    error,
    h(
      "button",
      {
        type: "button",
        class: "principal",
        onclick: () => {
          if (n.fecha === "" || n.nombre.trim() === "" && n.matricula.trim() === "") {
            error.textContent = "Hace falta la fecha y el nombre o la matr\xEDcula del barco.";
            error.hidden = false;
            return;
          }
          acciones.alGuardarCita({
            fecha: n.fecha,
            ...n.hora !== "" ? { hora: n.hora } : {},
            lugar: n.lugar.trim(),
            embarcacion: { nombre: n.nombre.trim(), matricula: n.matricula.trim() },
            ...n.cliente.trim() !== "" || n.telefono.trim() !== "" ? { cliente: { nombre: n.cliente.trim(), ...n.telefono.trim() !== "" ? { telefono: n.telefono.trim() } : {} } } : {},
            motivo: n.motivo,
            origen: n.origen,
            ...n.origen === "empresa" && n.referencia.trim() !== "" ? { referenciaEncargo: n.referencia.trim() } : {},
            ...n.notas.trim() !== "" ? { notas: n.notas.trim() } : {}
          });
        }
      },
      "Guardar en la agenda"
    )
  );
}

// src/vista/biblioteca.ts
function pintarBiblioteca(catalogo, busqueda, sinConexion, acciones) {
  const porId = new Map(catalogo.documentos.map((d) => [d.id, d]));
  let texto = busqueda?.texto ?? "";
  return h(
    "div",
    {},
    h(
      "form",
      {
        class: "buscador",
        onsubmit: (e) => {
          e.preventDefault();
          acciones.alBuscar(texto.trim());
        }
      },
      h("input", {
        type: "search",
        valor: texto,
        placeholder: "Buscar en todas las normas y manuales",
        oninput: (e) => {
          texto = e.target.value;
        }
      }),
      h("button", { type: "submit" }, "Buscar")
    ),
    busqueda !== void 0 && busqueda.texto !== "" && resultados(busqueda, porId, acciones),
    ...catalogo.grupos.map((g) => {
      const docs = catalogo.documentos.filter((d) => d.grupo === g.clave);
      if (docs.length === 0) return false;
      return h(
        "div",
        { class: `grupo-biblioteca ${g.clave}` },
        h("h2", {}, g.titulo),
        h(
          "ul",
          { class: "listado documentos" },
          ...docs.map(
            (d) => h(
              "li",
              { class: `documento ${d.grupo}`, onclick: () => acciones.alAbrir(d) },
              h("b", {}, d.titulo),
              h(
                "div",
                { class: "sutil" },
                [
                  d.referencia,
                  d.derogadaPor !== void 0 ? `DEROGADA \u2014 sustituida por ${d.derogadaPor}` : void 0,
                  `${d.paginas} p\xE1gs.`,
                  d.url === "" ? d.externo !== void 0 ? "no se incluye: se abre en la web del fabricante" : "no se incluye en esta versi\xF3n (derechos del fabricante)" : tamano(d.bytes)
                ].filter(Boolean).join(" \xB7 ")
              )
            )
          )
        )
      );
    }),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Sin conexi\xF3n"),
      sinConexion.disponible ? h(
        "div",
        {},
        h(
          "p",
          { class: "sutil" },
          `Cada documento se guarda en el dispositivo la primera vez que se abre (${sinConexion.guardados} de ${catalogo.documentos.filter((d) => d.url !== "").length} guardados). Antes de ir a un varadero sin cobertura, se puede guardar todo de una vez: unos ${tamano(catalogo.documentos.filter((d) => d.url !== "").reduce((s, d) => s + d.bytes, 0))}.`
        ),
        h(
          "button",
          { type: "button", class: "secundario", disabled: sinConexion.guardando, onclick: acciones.alGuardarSinConexion },
          sinConexion.guardando ? "Guardando\u2026" : "Guardar toda la biblioteca en el dispositivo"
        )
      ) : h(
        "p",
        { class: "sutil" },
        "Abierta por la red local (http), el navegador no deja guardar nada para sin conexi\xF3n: los documentos se abren, pero necesitan el ordenador encendido."
      )
    ),
    h(
      "p",
      { class: "sutil" },
      "Textos consolidados del BOE descargados el 7 de septiembre de 2026. Son informativos y no tienen valor jur\xEDdico: para citar, el identificador BOE y la fecha de la versi\xF3n."
    )
  );
}
function resultados(b, porId, acciones) {
  if (b.total === 0) {
    return h("p", { class: "vacio-corto" }, `Ning\xFAn documento contiene \xAB${b.texto}\xBB.`);
  }
  const agrupados = /* @__PURE__ */ new Map();
  for (const r of b.resultados) agrupados.set(r.id, [...agrupados.get(r.id) ?? [], r]);
  return h(
    "div",
    { class: "resultados-biblioteca" },
    h(
      "h2",
      {},
      `\xAB${b.texto}\xBB: ${b.total} ${b.total === 1 ? "coincidencia" : "coincidencias"} en ${b.porDocumento.size} ${b.porDocumento.size === 1 ? "documento" : "documentos"}`
    ),
    b.resultados.length < b.total && h("p", { class: "sutil" }, `Se ense\xF1an las ${b.resultados.length} primeras.`),
    ...[...agrupados.entries()].map(([id, lista2]) => {
      const doc = porId.get(id);
      if (doc === void 0) return false;
      return h(
        "div",
        { class: "tarjeta" },
        h("h3", {}, doc.titulo, h("span", { class: "sutil" }, ` \xB7 ${b.porDocumento.get(id)}`)),
        h(
          "ul",
          { class: "fragmentos" },
          ...lista2.map(
            (r) => h(
              "li",
              // Se busca en el visor lo que está escrito en el documento, no la consulta: la
              // consulta «deficiencia grave» ha encontrado «deficiencias graves».
              { onclick: () => acciones.alAbrir(doc, r.pagina, r.coincidencia) },
              h("span", { class: "fragmento-pagina" }, `p. ${r.pagina}`),
              h("span", {}, r.antes, h("mark", {}, r.coincidencia), r.despues)
            )
          )
        )
      );
    })
  );
}

// src/vista/analisis.ts
var NOMBRE_TAREA = {
  condicion: "Seg\xFAn condici\xF3n",
  sustitucion: "Sustituci\xF3n programada",
  busqueda: "B\xFAsqueda de fallos",
  rediseno: "Redise\xF1o",
  correctivo: "Correctivo"
};
var MATRIZ2 = {
  5: ["B", "A", "A", "A", "A"],
  4: ["C", "B", "A", "A", "A"],
  3: ["C", "C", "B", "B", "A"],
  2: ["C", "C", "C", "B", "B"],
  1: ["C", "C", "C", "C", "C"]
};
function intervalo(c) {
  if (c === void 0) return "\u2014";
  return [c.horas !== void 0 ? `${c.horas} h` : void 0, c.meses !== void 0 ? `${c.meses} meses` : void 0].filter(Boolean).join(" o ");
}
var meses = (m) => m === void 0 ? "\u2014" : m >= 1200 ? "nunca" : m < 1 ? "< 1 mes" : `${Math.round(m)} meses`;
function matriz(cobertura) {
  const cuenta = (s, o) => cobertura.filter((c) => c.modo.severidad === s && c.modo.ocurrencia === o);
  return h(
    "div",
    { class: "matriz-criticidad" },
    h("div", { class: "matriz-eje-y" }, "Severidad \u2192"),
    h(
      "table",
      {},
      h(
        "tbody",
        {},
        ...[5, 4, 3, 2, 1].map(
          (s) => h(
            "tr",
            {},
            h("th", {}, `S${s}`),
            ...[1, 2, 3, 4, 5].map((o) => {
              const aqui = cuenta(s, o);
              const ocultos = aqui.filter((c) => c.modo.deteccion === "oculto").length;
              const letra = MATRIZ2[s][o - 1];
              return h(
                "td",
                { class: `casilla-${letra}`, title: aqui.map((c) => c.modo.elemento).join("\n") },
                h("span", { class: "letra" }, letra),
                aqui.length > 0 && h("b", {}, String(aqui.length)),
                ocultos > 0 && h("small", {}, `${ocultos} oculto${ocultos > 1 ? "s" : ""}`)
              );
            })
          )
        ),
        h("tr", {}, h("th", {}, ""), ...[1, 2, 3, 4, 5].map((o) => h("th", {}, `O${o}`)))
      )
    ),
    h("div", { class: "matriz-eje-x" }, "Ocurrencia \u2192"),
    h(
      "p",
      { class: "sutil" },
      "A: cr\xEDtico, exige una tarea. B: importante. C: aceptable con correctivo. Un fallo oculto con severidad 4 o 5 es cr\xEDtico aunque caiga en una casilla B o C (regla RCM de las funciones ocultas)."
    )
  );
}
function pintarAnalisis(a, sobre) {
  const r = a.resumen;
  const sistemas = [...new Set(a.cobertura.map((c) => c.modo.sistema))];
  const orden = { A: 0, B: 1, C: 2 };
  return h(
    "div",
    { class: "analisis" },
    h("h1", {}, a.catalogo.titulo),
    h("p", { class: "sutil" }, `Aplicado a: ${sobre}. Embarcaci\xF3n de referencia del an\xE1lisis: ${a.catalogo.embarcacion}`),
    h(
      "div",
      { class: "cifras cifras-analisis" },
      cifra2(String(r.total), "modos de fallo"),
      cifra2(String(r.porCriticidad.A), "cr\xEDticos (A)", "rojo"),
      cifra2(String(r.ocultos), "ocultos"),
      cifra2(`${r.cubiertosPorFabricante}/${r.relevantes}`, "A y B que cubre el fabricante"),
      cifra2(`${r.cubiertosPorNorma}/${r.relevantes}`, "que cubre el reconocimiento"),
      cifra2(String(r.huecos), "huecos: nadie los mira a tiempo", r.huecos > 0 ? "rojo" : "verde")
    ),
    h(
      "p",
      { class: "salvedad" },
      `Supuestos: reconocimiento cada ${meses(a.mesesEntreReconocimientos)} (lo calcula el motor de reglas para este barco); ${Math.round(a.horasAlAnio)} horas de motor al a\xF1o` + (a.horasSupuestas ? " (supuesto: no hay dos lecturas del hor\xF3metro)." : " (del hor\xF3metro).") + ` ${r.ocurrenciasPorJuicio} de ${r.total} notas de ocurrencia son juicio del autor, a validar.`
    ),
    h("h2", {}, "Matriz de criticidad"),
    matriz(a.cobertura),
    h("h2", {}, "Cobertura modo a modo"),
    h(
      "p",
      { class: "sutil" },
      "Una fuente cubre un modo si tiene una tarea sobre \xE9l con un intervalo igual o menor que el que pide el an\xE1lisis. Los huecos entran en el plan de mantenimiento como tareas del an\xE1lisis de fallos."
    ),
    ...sistemas.map(
      (sistema) => h(
        "div",
        { class: "tabla-desplazable" },
        h("h3", {}, sistema),
        h(
          "table",
          { class: "tabla-cobertura" },
          h(
            "thead",
            {},
            h(
              "tr",
              {},
              ...["Elemento y modo de fallo", "S", "O", "Crit.", "Tarea RCM", "Fabricante", "Reconocimiento", ""].map((t) => h("th", {}, t))
            )
          ),
          h(
            "tbody",
            {},
            ...a.cobertura.filter((c) => c.modo.sistema === sistema).sort((x, y) => orden[x.criticidad] - orden[y.criticidad] || y.modo.severidad - x.modo.severidad).map(
              (c) => h(
                "tr",
                { class: c.hueco ? "hueco" : "" },
                h(
                  "td",
                  {},
                  h("b", {}, c.modo.elemento),
                  h("div", {}, c.modo.modo, c.modo.deteccion === "oculto" && h("span", { class: "etiqueta-oculto" }, " oculto")),
                  h("div", { class: "sutil" }, c.modo.efecto)
                ),
                h("td", { title: c.modo.anclaSeveridad }, String(c.modo.severidad)),
                h(
                  "td",
                  { title: c.modo.juicioOcurrencia ?? (c.modo.fuentesOcurrencia ?? []).join(", ") },
                  String(c.modo.ocurrencia),
                  (c.modo.fuentesOcurrencia ?? []).length === 0 && h("sup", {}, "j")
                ),
                h("td", {}, h("span", { class: `marca-crit ${c.criticidad}` }, c.criticidad)),
                h(
                  "td",
                  {},
                  h("div", {}, NOMBRE_TAREA[c.modo.tarea.tipo] ?? c.modo.tarea.tipo, ` \xB7 ${intervalo(c.modo.tarea.cada)}`),
                  h("div", { class: "sutil" }, c.modo.tarea.descripcion)
                ),
                h(
                  "td",
                  {},
                  c.fabricante === void 0 ? "\u2014" : `${c.fabricante.suficiente ? "\u2713" : "\u2717"} ${meses(c.fabricante.meses)}`
                ),
                h(
                  "td",
                  {},
                  c.norma === void 0 ? "\u2014" : `${c.norma.suficiente ? "\u2713" : "\u2717"} cada ${meses(c.norma.meses)} (${c.norma.puntos.join(", ")})`
                ),
                h("td", {}, c.hueco && h("span", { class: "marca-hueco" }, "HUECO"))
              )
            )
          )
        )
      )
    ),
    h("p", { class: "sutil" }, "\u02B2 Ocurrencia por juicio del autor, sin fuente publicada: a validar con el director."),
    h("h2", {}, "Fuentes"),
    h(
      "ol",
      { class: "fuentes" },
      ...a.catalogo.fuentes.map((f) => h("li", {}, f.referencia, f.url !== void 0 && h("span", { class: "sutil" }, ` ${f.url}`)))
    )
  );
}
function cifra2(valor2, texto, color) {
  return h("div", { class: `cifra ${color ?? ""}` }, h("b", {}, valor2), h("span", {}, texto));
}

// src/main.ts
var CATALOGO_REGLAS = validarCatalogo(reglas_rd1434_default, "reglas-rd1434.json");
var CATALOGO_EQUIPO = validarCatalogoEquipo(equipo_rd339_default, "equipo-rd339.json");
var CATALOGO_SUCESOS = validarCatalogoSucesos(sucesos_rd1434_default, "sucesos-rd1434.json");
var CATALOGO_ANEXO = anexo2_rd1434_default;
var FORMULARIO = formulario_default;
var CAMPOS = formulario_campos_default;
var PAUTAS = pautas_default.map(
  (p, i) => validarCatalogoPautas(p, `pautas.json #${i + 1}`)
);
var ANALISIS = analisis_default.map(
  (a, i) => validarCatalogoAnalisis(a, `analisis.json #${i + 1}`)
);
var BIBLIOTECA = validarCatalogoBiblioteca(biblioteca_default);
var TITULO_PUNTO = new Map(
  FORMULARIO.bloques.flatMap((b) => b.puntos.map((p) => [p.codigo, p.titulo]))
);
var estado = {
  pantalla: "inicio",
  listado: [],
  sucesosExpediente: [],
  anioRegistro: Number(hoy().slice(0, 4)),
  filtroHistorico: {},
  revisor: "",
  soloPendientes: false,
  perfil: { inspector: "", entidad: "" },
  guardandoBiblioteca: false,
  filtroEmbarcaciones: ""
};
var raiz = document.getElementById("app");
async function persistir() {
  if (estado.inspeccion !== void 0) {
    await guardarInspeccion(estado.inspeccion);
  }
  await render();
}
function versionCatalogo() {
  return `${CATALOGO_REGLAS.norma}@${CATALOGO_REGLAS.version} + ${CATALOGO_EQUIPO.norma}@${CATALOGO_EQUIPO.version}`;
}
function embarcacionVacia() {
  return {
    id: nuevoId("emb"),
    nombre: "",
    matricula: "",
    lista: 7,
    esloraCascoM: 9,
    materialCasco: "materiales_compuestos",
    marcadoCE: true,
    categoriaDiseno: "B"
  };
}
async function nuevaInspeccion(desde) {
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  const datos = desde !== void 0 ? datosDesdeCita(desde, await listarInspecciones()) : void 0;
  const embarcacion = datos === void 0 ? embarcacionVacia() : {
    ...datos.embarcacionPrevia ?? embarcacionVacia(),
    ...datos.nombre !== "" ? { nombre: datos.nombre } : {},
    ...datos.matricula !== "" ? { matricula: datos.matricula } : {}
  };
  const motivo = datos?.motivo ?? "periodico";
  const fecha = datos?.fecha ?? hoy();
  const lugar = datos?.lugar ?? "";
  estado.inspeccion = {
    id: nuevoId("insp"),
    embarcacion,
    numeroInforme: FORMULARIO.prefijo_informe,
    identificacion: { banderaEspanola: true, win: "" },
    tipo: tipoNormativoDe(motivo),
    motivo,
    fecha,
    lugar,
    inspector: estado.perfil.inspector,
    estado: "borrador",
    visitas: { v1: { clave: "v1", fecha, lugar, condicion: "a_flote", refrendo: "" } },
    visitaActiva: "v1",
    hallazgos: {},
    registro: [],
    datosPunto: {},
    equiposMedida: [],
    observacionesGenerales: "",
    inventario: {},
    personasABordo: 4,
    navegacionDiurna: false,
    versionCatalogo: versionCatalogo(),
    creadaEn: ahora,
    actualizadaEn: ahora
  };
  if (desde !== void 0) {
    await guardarCita({ ...desde, estado: "hecha", inspeccionId: estado.inspeccion.id });
  }
  estado.pantalla = "ficha";
  await persistir();
}
async function cargarEjemplo() {
  await borrarInspeccionesDeEjemplo();
  const inspeccion = inspeccionEjemplo(hoy(), versionCatalogo(), FORMULARIO.prefijo_informe);
  responderEjemplo(inspeccion, puntosDe(guionActual(inspeccion)).map((p) => p.codigo), proponerGravedad);
  await guardarExpediente(expedienteEjemplo());
  await guardarInspeccion(inspeccion);
  estado.inspeccion = inspeccion;
  estado.matricula = void 0;
  estado.pantalla = "ficha";
  await persistir();
}
async function abrir2(id) {
  const inspeccion = await leerInspeccion(id);
  if (inspeccion === void 0) return;
  estado.inspeccion = inspeccion;
  estado.matricula = void 0;
  estado.pantalla = inspeccion.estado === "borrador" ? "ficha" : "acta";
  await render();
}
async function responder(puntoId, resultado) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  const previo = inspeccion.hallazgos[puntoId];
  const propuesta = proponerGravedad(puntoId);
  const hallazgo = {
    puntoId,
    visita: inspeccion.visitaActiva,
    resultado,
    fotos: previo?.fotos ?? [],
    registradoEn: (/* @__PURE__ */ new Date()).toISOString(),
    ...previo?.observaciones !== void 0 ? { observaciones: previo.observaciones } : {},
    ...resultado === "no_conforme" ? {
      gravedad: previo?.gravedad ?? (propuesta.grave ? "grave" : "leve"),
      ...propuesta.letra !== void 0 ? { letraAnexoIII: propuesta.letra } : {}
    } : {}
  };
  inspeccion.hallazgos[puntoId] = hallazgo;
  inspeccion.registro.push({ ...hallazgo });
  await persistir();
}
async function anotarDato(puntoId, campo2, valor2) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  const datos = inspeccion.datosPunto[puntoId] ??= {};
  datos[campo2] = valor2;
  await guardarInspeccion(inspeccion);
}
async function cambiarVisita(clave) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  inspeccion.visitaActiva = clave;
  inspeccion.visitas[clave] ??= {
    clave,
    fecha: hoy(),
    lugar: inspeccion.lugar,
    condicion: "a_flote",
    refrendo: inspeccion.inspector
  };
  await persistir();
}
async function editarVisita(clave, campo2, valor2) {
  const visita = estado.inspeccion?.visitas[clave];
  if (visita === void 0 || estado.inspeccion === void 0) return;
  visita[campo2] = valor2;
  await guardarInspeccion(estado.inspeccion);
}
async function anotarEquipoMedida(clave, usado, identificador) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  const resto = inspeccion.equiposMedida.filter((e) => e.clave !== clave);
  inspeccion.equiposMedida = usado ? [...resto, { clave, identificador }] : resto;
  await guardarInspeccion(inspeccion);
}
async function cambiarGravedad(puntoId, grave) {
  const hallazgo = estado.inspeccion?.hallazgos[puntoId];
  if (hallazgo === void 0) return;
  hallazgo.gravedad = grave ? "grave" : "leve";
  await persistir();
}
async function observar(puntoId, texto) {
  const hallazgo = estado.inspeccion?.hallazgos[puntoId];
  if (hallazgo === void 0 || estado.inspeccion === void 0) return;
  hallazgo.observaciones = texto;
  await guardarInspeccion(estado.inspeccion);
}
async function contar2(equipo, cantidad) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  if (cantidad === void 0) delete inspeccion.inventario[equipo];
  else inspeccion.inventario[equipo] = cantidad;
  await guardarInspeccion(inspeccion);
  refrescarZona();
}
async function anadirFoto(puntoId, fichero) {
  const hallazgo = estado.inspeccion?.hallazgos[puntoId];
  if (hallazgo === void 0) return;
  hallazgo.fotos.push(await guardarFoto(fichero));
  await persistir();
}
async function abrirExpediente(matricula) {
  estado.matricula = matricula;
  estado.inspeccion = void 0;
  estado.pantalla = "expediente";
  await render();
}
async function anadirSuceso(cambio) {
  const matricula = estado.matricula;
  if (matricula === void 0) return;
  const expediente = await leerExpediente(matricula);
  expediente.sucesos.push({ ...cambio, id: nuevoId("suc") });
  await guardarExpediente(expediente);
  await render();
}
async function registrarSucesoDelMotivo(descripcion) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  const fila = CAMPOS.tipos_reconocimiento.find((t) => t.clave === inspeccion.motivo);
  if (fila?.suceso === void 0) return;
  const matricula = inspeccion.embarcacion.matricula.trim();
  if (matricula === "") return;
  const expediente = await leerExpediente(matricula);
  expediente.sucesos.push({
    id: nuevoId("suc"),
    fecha: inspeccion.fecha,
    tipo: fila.suceso,
    descripcion,
    ...fila.suceso === "cambio_lista" ? { listaDestino: inspeccion.embarcacion.lista } : {}
  });
  await guardarExpediente(expediente);
  await persistir();
}
async function borrarSuceso(id) {
  const matricula = estado.matricula;
  if (matricula === void 0) return;
  const expediente = await leerExpediente(matricula);
  expediente.sucesos = expediente.sucesos.filter((s) => s.id !== id);
  await guardarExpediente(expediente);
  await render();
}
async function fijarCaducidad(equipo, fecha) {
  const matricula = estado.matricula;
  if (matricula === void 0) return;
  const expediente = await leerExpediente(matricula);
  if (fecha === "") delete expediente.caducidades[equipo];
  else expediente.caducidades[equipo] = fecha;
  await guardarExpediente(expediente);
  await render();
}
function equiposConCaducidad() {
  const vistos = /* @__PURE__ */ new Map();
  for (const regla of CATALOGO_EQUIPO.reglas) {
    if (regla.entonces.controlCaducidad !== true) continue;
    if (!vistos.has(regla.entonces.equipo)) {
      vistos.set(regla.entonces.equipo, regla.entonces.nombre);
    }
  }
  return [...vistos.entries()].map(([equipo, nombre]) => ({ equipo, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
var CATALOGOS_EXPEDIENTE = {
  reglas: CATALOGO_REGLAS,
  equipo: CATALOGO_EQUIPO,
  sucesos: CATALOGO_SUCESOS,
  pautas: PAUTAS,
  analisis: ANALISIS,
  tituloPunto: (codigo) => TITULO_PUNTO.get(codigo)
};
async function expedienteCompuesto(matricula) {
  const guardado = await leerExpediente(matricula);
  const todas = await listarInspecciones();
  const compuesto = componerExpediente(guardado, todas, CATALOGOS_EXPEDIENTE, hoy());
  return { guardado, compuesto };
}
async function cambiarExpediente(cambio) {
  const matricula = estado.matricula;
  if (matricula === void 0) return;
  const expediente = await leerExpediente(matricula);
  cambio(expediente);
  await guardarExpediente(expediente);
  await render();
}
var accionesMantenimiento = {
  alRegistrarTrabajo: (t) => void cambiarExpediente((e) => {
    e.trabajos.push({ id: nuevoId("trb"), ...t });
    if (t.componenteId !== void 0 && t.horas !== void 0) {
      e.lecturas.push({ componenteId: t.componenteId, fecha: t.fecha, horas: t.horas });
    }
  }),
  alAnotarLectura: (l) => void cambiarExpediente((e) => e.lecturas.push(l)),
  alAnadirComponente: (c) => void cambiarExpediente((e) => {
    const id = nuevoId("cmp");
    e.componentes.push({ id, ...c });
    if (c.alta.horas !== void 0) {
      e.lecturas.push({ componenteId: id, fecha: c.alta.fecha, horas: c.alta.horas });
    }
  }),
  alDarDeBaja: (id, fecha) => void cambiarExpediente((e) => {
    const c = e.componentes.find((x) => x.id === id);
    if (c !== void 0) c.baja = fecha;
  }),
  alAsignarPlan: (id, planId) => void cambiarExpediente((e) => {
    const c = e.componentes.find((x) => x.id === id);
    if (c !== void 0) c.planId = planId;
  }),
  alVerFuente: (planId, fuente) => verFuenteEnManual(planId, fuente),
  alFijarEquipamiento: (id, equipo, tiene) => void cambiarExpediente((e) => {
    const c = e.componentes.find((x) => x.id === id);
    if (c !== void 0) c.equipamiento = { ...c.equipamiento, [equipo]: tiene };
  })
};
async function pantallaPropietario(matricula) {
  const { compuesto } = await expedienteCompuesto(matricula);
  return h(
    "div",
    {},
    barra(
      "Estado para el propietario",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "expediente";
            await render();
          }
        },
        "Expediente"
      )
    ),
    h("div", { class: "contenido" }, pintarEstadoPropietario(compuesto, hoy()))
  );
}
async function pantallaExpediente(matricula) {
  const { guardado, compuesto } = await expedienteCompuesto(matricula);
  const acciones = {
    alAnadirSuceso: (s) => void anadirSuceso(s),
    alBorrarSuceso: (id) => void borrarSuceso(id),
    alFijarCaducidad: (equipo, fecha) => void fijarCaducidad(equipo, fecha),
    alAbrirInspeccion: (id) => void abrir2(id)
  };
  return h(
    "div",
    {},
    barra(
      compuesto.embarcacion?.nombre || matricula,
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "propietario";
            await render();
          }
        },
        "Estado para el propietario"
      ),
      ...compuesto.analisis !== void 0 ? [
        h(
          "button",
          {
            onclick: async () => {
              estado.pantalla = "analisis";
              await render();
            }
          },
          "An\xE1lisis de fallos"
        )
      ] : []
    ),
    h(
      "div",
      { class: "contenido" },
      cabeceraExpediente(compuesto),
      panelPendientes(compuesto.obligacionesPendientes),
      panelPlan(compuesto.plan, accionesMantenimiento),
      panelComponentes(guardado.componentes, guardado.lecturas, PAUTAS, accionesMantenimiento),
      panelCalendario(compuesto.vencimientos),
      panelSucesos(guardado.sucesos, compuesto.obligaciones, acciones),
      panelCaducidades(guardado.caducidades, equiposConCaducidad(), acciones),
      panelHistorico(compuesto.inspecciones, acciones)
    )
  );
}
function refrescarZona() {
  const inspeccion = estado.inspeccion;
  const anterior = document.querySelector(".tarjeta.zona");
  if (inspeccion === void 0 || anterior === null) return;
  anterior.replaceWith(panelZona(zonaActual(inspeccion)));
}
function zonaActual(inspeccion) {
  return calcularZona(
    inspeccion.embarcacion,
    inspeccion.personasABordo,
    inspeccion.navegacionDiurna,
    inspeccion.inventario,
    [CATALOGO_EQUIPO],
    inspeccion.fecha
  );
}
function evaluacionActual(inspeccion) {
  return evaluar(inspeccion.embarcacion, [CATALOGO_REGLAS], inspeccion.fecha);
}
function guionActual(inspeccion) {
  return generarGuion(
    FORMULARIO,
    CATALOGO_ANEXO,
    CAMPOS.campos_por_punto,
    inspeccion.embarcacion,
    evaluacionActual(inspeccion),
    inspeccion.tipo
  );
}
function contrastesDe(inspeccion) {
  const exigeSeco = conclusionesDe(
    evaluacionActual(inspeccion),
    inspeccion.tipo
  ).some((c) => c.consecuencia.enSeco === true);
  return [
    contrastarZona(inspeccion.zonaDeclarada, zonaActual(inspeccion)),
    contrastarCondicion(inspeccion, exigeSeco)
  ];
}
function tipoNormativoDe(motivo) {
  const fila = CAMPOS.tipos_reconocimiento.find((t) => t.clave === motivo);
  return fila?.tipo_normativo ?? "periodico";
}
function barra(titulo, ...acciones) {
  return h(
    "header",
    { class: "barra" },
    h(
      "button",
      {
        class: "volver",
        onclick: async () => {
          estado.pantalla = "inicio";
          estado.inspeccion = void 0;
          estado.matricula = void 0;
          estado.borradorCita = void 0;
          await render();
        }
      },
      "\u2039"
    ),
    h("h1", {}, titulo),
    h("div", { class: "acciones" }, ...acciones)
  );
}
function pestanas(actual) {
  const ir2 = (p) => async () => {
    estado.pantalla = p;
    await render();
  };
  const boton = (p, texto) => h("button", { class: actual === p ? "activa" : "", onclick: ir2(p) }, texto);
  return h(
    "nav",
    { class: "pestanas" },
    boton("ficha", "Ficha"),
    boton("guion", "Inspecci\xF3n"),
    boton("equipo", "Equipo"),
    boton("acta", "Acta")
  );
}
async function cargarTodo() {
  const dia = hoy();
  const inspecciones = await listarInspecciones();
  estado.listado = inspecciones;
  const matriculas = /* @__PURE__ */ new Set([
    ...matriculasConInspecciones(inspecciones).map((e) => e.matricula),
    ...await listarMatriculasConExpediente()
  ]);
  const expedientes = [];
  for (const matricula of matriculas) {
    const expediente = await leerExpediente(matricula);
    expedientes.push({
      expediente,
      compuesto: componerExpediente(expediente, inspecciones, CATALOGOS_EXPEDIENTE, dia)
    });
  }
  const [citas, notas] = await Promise.all([listarCitas(), listarNotas()]);
  return { dia, inspecciones, expedientes, citas, notas };
}
function barcosConocidos(t) {
  const nombres = new Map(matriculasConInspecciones(t.inspecciones).map((e) => [e.matricula, e.nombre]));
  return t.expedientes.map((e) => ({
    matricula: e.expediente.matricula,
    nombre: nombres.get(e.expediente.matricula) ?? e.compuesto.embarcacion?.nombre ?? ""
  })).sort((a, b) => (a.nombre || a.matricula).localeCompare(b.nombre || b.matricula, "es"));
}
function propuestasDeAgenda(t) {
  return porProgramar(
    t.expedientes.map((e) => ({
      matricula: e.expediente.matricula,
      nombre: e.compuesto.embarcacion?.nombre ?? "",
      vencimientos: e.compuesto.vencimientos,
      enCurso: t.inspecciones.some(
        (i) => i.estado === "borrador" && i.embarcacion.matricula.trim() === e.expediente.matricula
      )
    })),
    t.citas,
    t.dia
  );
}
async function ir(pantalla, resaltar) {
  estado.pantalla = pantalla;
  estado.inspeccion = void 0;
  estado.matricula = void 0;
  estado.resaltar = resaltar;
  await render();
}
async function irAAviso(aviso) {
  const d = aviso.destino;
  if (d === void 0) return;
  if (d.pantalla === "inspeccion") return abrir2(d.id);
  if (d.pantalla === "expediente") return abrirExpediente(d.matricula);
  if (d.pantalla === "agenda") return ir("agenda", d.citaId !== void 0 ? `cita-${d.citaId}` : void 0);
  if (d.pantalla === "nota") return ir("avisos", `nota-${d.id}`);
  return ir("registro");
}
async function programar(p) {
  estado.borradorCita = {
    nombre: p.nombre,
    matricula: p.matricula,
    motivo: p.motivo,
    notas: `${p.concepto}: ${p.vencido ? "venci\xF3" : "vence"} el ${p.fecha} (${p.cita}).`
  };
  await ir("agenda");
  window.scrollTo(0, 0);
}
var accionesPanel = {
  alNuevaInspeccion: () => void nuevaInspeccion(),
  alAbrirInspeccion: (id) => void abrir2(id),
  alIr: (zona2) => void ir(zona2),
  alAbrirAviso: (a) => void irAAviso(a),
  alAbrirCita: (c) => void ir("agenda", `cita-${c.id}`),
  alProgramar: (p) => void programar(p),
  alBuscarEnBiblioteca: (texto) => void (async () => {
    await buscarBiblioteca(texto);
    await ir("biblioteca");
  })(),
  alCambiarPerfil: (perfil) => void (async () => {
    await guardarPerfil(perfil);
    estado.perfil = perfil;
    await render();
  })(),
  alCargarEjemplo: () => void cargarEjemplo()
};
async function pantallaInicio() {
  const t = await cargarTodo();
  const anio = Number(t.dia.slice(0, 4));
  const espacio2 = await espacio();
  return pintarPanel(
    {
      hoy: t.dia,
      perfil: estado.perfil,
      avisos: componerAvisos(t, t.dia),
      agenda: resumirAgenda(t.citas, t.dia),
      porProgramar: propuestasDeAgenda(t),
      borradores: t.inspecciones.filter((i) => i.estado === "borrador"),
      historial: {
        anio,
        resumen: resumirHistorico(componerHistorico(t.inspecciones, { anio }, t.dia)),
        ultimas: componerHistorico(t.inspecciones, {}, t.dia).slice(0, 4),
        total: t.inspecciones.length,
        embarcaciones: t.expedientes.length
      },
      soloEjemplo: t.inspecciones.every((i) => i.embarcacion.matricula === MATRICULA_EJEMPLO),
      biblioteca: {
        normas: BIBLIOTECA.documentos.filter((d) => d.grupo !== "manuales").length,
        manuales: BIBLIOTECA.documentos.filter((d) => d.grupo === "manuales").length,
        paginas: BIBLIOTECA.documentos.reduce((s, d) => s + d.paginas, 0)
      },
      ...espacio2 !== void 0 ? { espacio: `Almacenamiento local: ${tamano(espacio2.usado)} usados de ${tamano(espacio2.total)}.` } : {}
    },
    accionesPanel
  );
}
function botonInicio() {
  return h("button", { onclick: () => void ir("inicio") }, "Inicio");
}
async function pantallaAvisos() {
  const t = await cargarTodo();
  return h(
    "div",
    {},
    barra("Avisos", botonInicio()),
    h(
      "div",
      { class: "contenido" },
      pintarAvisos(componerAvisos(t, t.dia), t.notas, barcosConocidos(t), {
        alAbrirAviso: (a) => void irAAviso(a),
        alAnotarSuceso: (s) => void (async () => {
          const expediente = await leerExpediente(s.matricula);
          expediente.sucesos.push({
            id: nuevoId("suc"),
            fecha: s.fecha,
            tipo: s.tipo,
            descripcion: s.descripcion,
            ...s.afectaSeguridad !== void 0 ? { afectaSeguridad: s.afectaSeguridad } : {}
          });
          await guardarExpediente(expediente);
          await render();
        })(),
        alAnotarNota: (n) => void (async () => {
          await guardarNota({ id: nuevoId("nota"), creadaEn: (/* @__PURE__ */ new Date()).toISOString(), ...n });
          await render();
        })(),
        alResolverNota: (id) => void (async () => {
          const nota = (await listarNotas()).find((n) => n.id === id);
          if (nota === void 0) return;
          await guardarNota({ ...nota, resuelta: hoy() });
          await render();
        })()
      })
    )
  );
}
async function pantallaAgenda() {
  const t = await cargarTodo();
  const guardarYPintar = async (cita) => {
    await guardarCita(cita);
    await render();
  };
  return h(
    "div",
    {},
    barra(estado.perfil.entidad !== "" ? "Agenda y encargos" : "Agenda", botonInicio()),
    h(
      "div",
      { class: "contenido" },
      pintarAgenda(
        t.citas,
        propuestasDeAgenda(t),
        estado.perfil,
        CAMPOS.tipos_reconocimiento.map((m) => ({ clave: m.clave, etiqueta: m.etiqueta })),
        estado.borradorCita,
        estado.resaltar?.replace(/^cita-/, ""),
        {
          alGuardarCita: (c) => void (async () => {
            estado.borradorCita = void 0;
            await guardarYPintar({ ...c, id: nuevoId("cita"), creadaEn: (/* @__PURE__ */ new Date()).toISOString(), estado: "pendiente" });
          })(),
          alEmpezar: (c) => void nuevaInspeccion(c),
          alCambiarFecha: (c, fecha, hora) => {
            const { hora: _anterior, ...resto } = c;
            void guardarYPintar({ ...resto, fecha, ...hora !== void 0 ? { hora } : {} });
          },
          alAnular: (c) => void guardarYPintar({ ...c, estado: "anulada" }),
          alAbrirInspeccion: (id) => void abrir2(id),
          alProgramar: (p) => void programar(p)
        }
      )
    )
  );
}
var CACHE_BIBLIOTECA = "itb-biblioteca";
var indiceBiblioteca;
async function buscarBiblioteca(texto) {
  if (texto === "") {
    estado.busqueda = void 0;
    return;
  }
  indiceBiblioteca ??= await (await fetch("./biblioteca/indice.json")).json();
  const { resultados: resultados2, total, porDocumento } = buscarEnBiblioteca(indiceBiblioteca, texto);
  estado.busqueda = { texto, resultados: resultados2, total, porDocumento };
}
var cacheDisponible = () => typeof caches !== "undefined" && window.isSecureContext;
async function documentosGuardados() {
  if (!cacheDisponible()) return 0;
  const cache = await caches.open(CACHE_BIBLIOTECA);
  const guardadas = new Set((await cache.keys()).map((r) => new URL(r.url).pathname + new URL(r.url).search));
  return BIBLIOTECA.documentos.filter((d) => d.url !== "" && guardadas.has(new URL(d.url, location.href).pathname + new URL(d.url, location.href).search)).length;
}
async function guardarBibliotecaSinConexion() {
  estado.guardandoBiblioteca = true;
  await render();
  try {
    const cache = await caches.open(CACHE_BIBLIOTECA);
    const urls = BIBLIOTECA.documentos.map((d) => d.url).filter((u) => u !== "");
    for (const url of [...urls, "biblioteca/indice.json", ...BIBLIOTECA.auxiliares ?? []]) {
      if (await cache.match(url) === void 0) await cache.add(url);
    }
  } finally {
    estado.guardandoBiblioteca = false;
    await render();
  }
}
async function abrirDocumento(doc, pagina, buscar) {
  if (doc.url === "") {
    if (doc.externo !== void 0) window.open(`${doc.externo}${pagina !== void 0 ? `#page=${pagina}` : ""}`, "_blank", "noopener");
    return;
  }
  const ruta = "./visor-pdf.js";
  const modulo = await import(ruta);
  history.pushState({ visor: doc.id }, "");
  let cerradoPorAtras = false;
  const alAtras = () => {
    cerradoPorAtras = true;
    visor.cerrar();
  };
  const visor = await modulo.abrirVisor({
    url: `./${doc.url}`,
    titulo: doc.titulo,
    ...pagina !== void 0 ? { pagina } : {},
    ...buscar !== void 0 ? { buscar } : {},
    alCerrar: () => {
      window.removeEventListener("popstate", alAtras);
      if (!cerradoPorAtras) history.back();
      if (estado.pantalla === "biblioteca") void render();
    }
  });
  window.addEventListener("popstate", alAtras);
}
async function pantallaBiblioteca() {
  return h(
    "div",
    {},
    barra("Normativa y manuales", botonInicio()),
    h(
      "div",
      { class: "contenido" },
      pintarBiblioteca(
        BIBLIOTECA,
        estado.busqueda,
        { disponible: cacheDisponible(), guardados: await documentosGuardados(), guardando: estado.guardandoBiblioteca },
        {
          alBuscar: (texto) => void (async () => {
            await buscarBiblioteca(texto);
            await render();
          })(),
          alAbrir: (doc, pagina, buscar) => void abrirDocumento(doc, pagina, buscar),
          alGuardarSinConexion: () => void guardarBibliotecaSinConexion()
        }
      )
    )
  );
}
function verFuenteEnManual(planId, fuente) {
  const doc = manualDePlan(BIBLIOTECA, planId);
  if (doc !== void 0) void abrirDocumento(doc, paginaDeFuente(fuente, doc));
}
async function pantallaAnalisis() {
  const matricula = estado.matricula;
  let analisis = void 0;
  let sobre = "la embarcaci\xF3n de referencia (reconocimiento cada 60 meses, 100 h de motor al a\xF1o)";
  if (matricula !== void 0) {
    const { compuesto } = await expedienteCompuesto(matricula);
    analisis = compuesto.analisis;
    sobre = `${compuesto.embarcacion?.nombre || matricula} (${matricula})`;
  }
  analisis ??= ANALISIS[0] !== void 0 ? analisisDeReferencia(ANALISIS[0], PAUTAS) : void 0;
  return h(
    "div",
    {},
    barra(
      "An\xE1lisis de fallos",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      matricula !== void 0 ? h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "expediente";
            await render();
          }
        },
        "Expediente"
      ) : botonInicio()
    ),
    h(
      "div",
      { class: "contenido contenido-ancho" },
      analisis === void 0 ? h("p", { class: "vacio" }, "No hay ning\xFAn an\xE1lisis de fallos en el cat\xE1logo.") : pintarAnalisis(analisis, sobre)
    )
  );
}
async function pantallaEmbarcaciones() {
  const t = await cargarTodo();
  const porMatricula = new Map(matriculasConInspecciones(t.inspecciones).map((e) => [e.matricula, e]));
  const texto = normalizar(estado.filtroEmbarcaciones);
  const lista2 = () => h(
    "ul",
    { class: "listado", id: "lista-embarcaciones" },
    ...barcosConocidos(t).filter((b) => texto === "" || normalizar(`${b.nombre} ${b.matricula}`).includes(normalizar(estado.filtroEmbarcaciones))).map(
      (b) => h(
        "li",
        { class: "embarcacion", onclick: () => void abrirExpediente(b.matricula) },
        h("div", {}, h("b", {}, b.nombre || "(sin nombre)")),
        h("div", { class: "sutil" }, `${b.matricula} \xB7 ${porMatricula.get(b.matricula)?.inspecciones ?? 0} inspecci\xF3n(es)`)
      )
    )
  );
  return h(
    "div",
    {},
    barra("Embarcaciones", botonInicio()),
    h(
      "div",
      { class: "contenido" },
      h("input", {
        type: "search",
        valor: estado.filtroEmbarcaciones,
        placeholder: "Buscar por nombre o matr\xEDcula",
        oninput: (e) => {
          estado.filtroEmbarcaciones = e.target.value;
          document.getElementById("lista-embarcaciones")?.replaceWith(lista2());
        }
      }),
      t.expedientes.length === 0 && h("p", { class: "vacio" }, "Todav\xEDa no hay embarcaciones."),
      lista2()
    )
  );
}
function pantallaFicha(inspeccion) {
  const actualizar = (cambio) => {
    inspeccion.embarcacion = { ...inspeccion.embarcacion, ...cambio };
    void persistir();
  };
  const dato = (etiqueta, valor2, alCambiar, tipo = "text") => h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, etiqueta),
    h("input", {
      type: tipo,
      valor: valor2,
      oninput: (e) => alCambiar(e.target.value)
    })
  );
  return h(
    "div",
    {},
    barra(inspeccion.embarcacion.nombre || "Nueva inspecci\xF3n"),
    pestanas("ficha"),
    h(
      "div",
      { class: "contenido" },
      formularioFicha(inspeccion.embarcacion, actualizar),
      formularioEquipamiento(inspeccion.embarcacion, actualizar),
      h(
        "div",
        { class: "tarjeta" },
        h("h2", {}, "Datos del reconocimiento"),
        // Número de informe. La hoja de campos revela que no es libre: lleva prefijo de
        // delegación y es correlativo por oficina.
        dato("N\xBA de informe", inspeccion.numeroInforme, (v) => {
          inspeccion.numeroInforme = v;
          void guardarInspeccion(inspeccion);
        }),
        // El inspector marca el MOTIVO, que es lo que dice la hoja; el sistema deriva de
        // él el tipo legal del art. 3 y lo enseña al lado. Así el acta puede decir las
        // dos cosas y el inspector no tiene que traducir la una a la otra.
        campo(
          "Motivo de la inspecci\xF3n",
          selector(
            CAMPOS.tipos_reconocimiento.map((t) => ({ valor: t.clave, texto: t.etiqueta })),
            inspeccion.motivo,
            (v) => {
              inspeccion.motivo = v;
              inspeccion.tipo = tipoNormativoDe(v);
              void persistir();
            }
          ),
          `Toda inspecci\xF3n tiene un motivo y figura en el acta. A efectos del art. 3 del RD 1434/1999 es un reconocimiento ${nombreTipo(inspeccion.tipo)}` + (CAMPOS.tipos_reconocimiento.find((t) => t.clave === inspeccion.motivo)?.nota?.includes("\u26A0") || CAMPOS.tipos_reconocimiento.find((t) => t.clave === inspeccion.motivo)?.nota?.includes("A confirmar") ? " (tipo legal pendiente de confirmar)." : ".")
        ),
        CAMPOS.tipos_reconocimiento.find((t) => t.clave === inspeccion.motivo)?.tipo_libre === true && dato("Especificar el motivo", inspeccion.motivoOtros ?? "", (v) => {
          inspeccion.motivoOtros = v;
          void guardarInspeccion(inspeccion);
        }),
        // El motivo que constituye un suceso del art. 3.D) tiene que llegar al expediente,
        // no quedarse en la cabecera del acta. Se propone; lo confirma el inspector.
        avisoSucesoDelMotivo(inspeccion),
        campo(
          "Bandera",
          selector(
            [
              { valor: "esp", texto: "Espa\xF1ola" },
              { valor: "otras", texto: "Otras" }
            ],
            inspeccion.identificacion.banderaEspanola ? "esp" : "otras",
            (v) => {
              inspeccion.identificacion.banderaEspanola = v === "esp";
              void persistir();
            }
          ),
          inspeccion.identificacion.banderaEspanola ? void 0 : "Sin bandera espa\xF1ola se anota el NIB en lugar de la matr\xEDcula."
        ),
        dato("WIN (identificaci\xF3n del casco)", inspeccion.identificacion.win, (v) => {
          inspeccion.identificacion.win = v;
          void guardarInspeccion(inspeccion);
        }),
        // La zona que el inspector escribe en la cabecera de la hoja. El sistema calcula
        // la efectiva desde el equipo verificado (art. 3.3 del RD 339/2021); tener las
        // dos permite contrastarlas, y que no coincidan es un hallazgo.
        campo(
          "Zona de navegaci\xF3n declarada",
          selector(
            [
              { valor: "", texto: "\u2014 sin declarar \u2014" },
              ...[1, 2, 3, 4, 5, 6, 7].map((z) => ({
                valor: String(z),
                texto: `Zona ${z}`
              }))
            ],
            inspeccion.zonaDeclarada === void 0 ? "" : String(inspeccion.zonaDeclarada),
            (v) => {
              if (v === "") delete inspeccion.zonaDeclarada;
              else inspeccion.zonaDeclarada = Number(v);
              void persistir();
            }
          ),
          "La zona autorizada la calcula el sistema del equipo verificado a bordo."
        ),
        dato(
          "Fecha",
          inspeccion.fecha,
          (v) => {
            inspeccion.fecha = v;
            void persistir();
          },
          "date"
        ),
        dato("Lugar", inspeccion.lugar, (v) => {
          inspeccion.lugar = v;
          void guardarInspeccion(inspeccion);
        }),
        dato("Inspector", inspeccion.inspector, (v) => {
          inspeccion.inspector = v;
          void guardarInspeccion(inspeccion);
        }),
        // No la pide el formulario de campo ni la necesita el inspector a bordo: la pide
        // el art. 8.b), que obliga a la entidad a registrar «las tarifas aplicadas». Va
        // aquí porque es donde están los datos administrativos de la actuación.
        campo(
          "Tarifa aplicada (\u20AC)",
          h("input", {
            type: "number",
            step: "0.01",
            min: "0",
            inputmode: "decimal",
            valor: inspeccion.tarifaEuros ?? "",
            disabled: inspeccion.estado !== "borrador",
            oninput: (e) => {
              const texto = e.target.value;
              const v = Number(texto);
              if (texto === "" || !Number.isFinite(v)) delete inspeccion.tarifaEuros;
              else inspeccion.tarifaEuros = v;
              void guardarInspeccion(inspeccion);
            }
          }),
          "Art. 8.b) del RD 1434/1999: la entidad debe registrar las tarifas aplicadas y presentar memoria anual antes del 31 de marzo."
        )
      ),
      // --- Equipos de medida --------------------------------------------------------
      // Con su número de identificación de calibración. Va en la ficha y no al final,
      // porque el inspector coge los aparatos antes de subir al barco, no después.
      h(
        "div",
        { class: "tarjeta" },
        h("h2", {}, "Equipos utilizados"),
        h(
          "p",
          { class: "sutil" },
          "Se anota el identificador de cada aparato: es la prueba de que la medida se tom\xF3 con un equipo calibrado y trazable."
        ),
        ...CAMPOS.equipos_medida.map((q) => {
          const usado = inspeccion.equiposMedida.find((x) => x.clave === q.clave);
          return h(
            "label",
            { class: "campo campo-equipo" },
            h("input", {
              type: "checkbox",
              checked: usado !== void 0,
              onchange: (e) => void anotarEquipoMedida(
                q.clave,
                e.target.checked,
                usado?.identificador ?? ""
              ).then(render)
            }),
            h("span", { class: "campo-etiqueta" }, q.etiqueta),
            h("input", {
              type: "text",
              placeholder: q.identificador_ejemplo ?? "identificaci\xF3n",
              valor: usado?.identificador ?? "",
              disabled: usado === void 0,
              oninput: (e) => void anotarEquipoMedida(
                q.clave,
                true,
                e.target.value
              )
            })
          );
        })
      ),
      // El campo libre del final de la hoja: donde se escribe lo que no cabe en una
      // casilla, y por tanto donde está el criterio del inspector.
      h(
        "div",
        { class: "tarjeta" },
        h("h2", {}, "Observaciones al reconocimiento"),
        h("textarea", {
          rows: "3",
          valor: inspeccion.observacionesGenerales,
          disabled: inspeccion.estado !== "borrador",
          oninput: (e) => {
            inspeccion.observacionesGenerales = e.target.value;
            void guardarInspeccion(inspeccion);
          }
        })
      ),
      panelConclusiones(evaluacionActual(inspeccion)),
      h(
        "button",
        {
          class: "principal",
          onclick: async () => {
            estado.pantalla = "guion";
            await render();
          }
        },
        "Comenzar la inspecci\xF3n \u2192"
      )
    )
  );
}
function avisoSucesoDelMotivo(inspeccion) {
  if (inspeccion.estado !== "borrador") return false;
  const fila = CAMPOS.tipos_reconocimiento.find((t) => t.clave === inspeccion.motivo);
  if (fila?.suceso === void 0) return false;
  const matricula = inspeccion.embarcacion.matricula.trim();
  if (matricula === "") {
    return h(
      "p",
      { class: "salvedad" },
      `El motivo \xAB${fila.etiqueta}\xBB declara un suceso del art. 3.D) del RD 1434/1999. Hace falta la matr\xEDcula para poder anotarlo en el expediente de la embarcaci\xF3n.`
    );
  }
  const yaEsta = estado.sucesosExpediente.some(
    (s) => s.tipo === fila.suceso && s.fecha === inspeccion.fecha
  );
  if (yaEsta) {
    return h(
      "p",
      { class: "cita" },
      `El suceso \xAB${fila.etiqueta}\xBB consta en el expediente con fecha ${fechaLarga(inspeccion.fecha)}.`
    );
  }
  let descripcion = `${fila.etiqueta} (declarado en el reconocimiento)`;
  return h(
    "div",
    { class: "salvedad accionable" },
    h(
      "p",
      {},
      `El motivo \xAB${fila.etiqueta}\xBB declara un suceso del art. 3.D) del RD 1434/1999. Conviene anotarlo en la l\xEDnea temporal del expediente, que es de donde el sistema deduce despu\xE9s si la obligaci\xF3n qued\xF3 atendida.`
    ),
    h("input", {
      type: "text",
      valor: descripcion,
      placeholder: "Descripci\xF3n del suceso",
      oninput: (e) => {
        descripcion = e.target.value;
      }
    }),
    h(
      "button",
      {
        type: "button",
        onclick: () => void registrarSucesoDelMotivo(descripcion)
      },
      `Anotar en el expediente con fecha ${fechaLarga(inspeccion.fecha)}`
    )
  );
}
function selectorVisita(inspeccion) {
  const soloLectura = inspeccion.estado !== "borrador";
  const visita = inspeccion.visitas[inspeccion.visitaActiva];
  return h(
    "div",
    { class: "tarjeta visita" },
    h(
      "div",
      { class: "botonera" },
      ...CAMPOS.visitas.columnas.map(
        (c) => h(
          "button",
          {
            type: "button",
            class: `opcion ${inspeccion.visitaActiva === c.clave ? "activa" : ""}`,
            disabled: soloLectura,
            onclick: () => void cambiarVisita(c.clave)
          },
          c.etiqueta
        )
      )
    ),
    visita !== void 0 && h(
      "div",
      { class: "casillas" },
      campo(
        "Fecha",
        h("input", {
          type: "date",
          valor: visita.fecha,
          disabled: soloLectura,
          oninput: (e) => void editarVisita(
            visita.clave,
            "fecha",
            e.target.value
          )
        })
      ),
      campo(
        "Lugar de realizaci\xF3n",
        h("input", {
          type: "text",
          valor: visita.lugar,
          disabled: soloLectura,
          oninput: (e) => void editarVisita(
            visita.clave,
            "lugar",
            e.target.value
          )
        })
      ),
      campo(
        "Condici\xF3n",
        selector(
          [
            { valor: "a_flote", texto: "A flote" },
            { valor: "seco", texto: "Seco" }
          ],
          visita.condicion,
          (v) => void editarVisita(visita.clave, "condicion", v)
        ),
        // El motor ya dice si la norma exige varada. Este campo dice si de verdad
        // estaba en seco, que puede no coincidir, y esa discrepancia es información.
        "Condici\xF3n real en la que se encontr\xF3 el barco"
      ),
      campo(
        "Refrendo del inspector",
        h("input", {
          type: "text",
          valor: visita.refrendo,
          disabled: soloLectura,
          oninput: (e) => void editarVisita(
            visita.clave,
            "refrendo",
            e.target.value
          )
        })
      )
    )
  );
}
function pantallaGuion(inspeccion) {
  const guion = guionActual(inspeccion);
  const avance = medirAvance(guion, inspeccion.hallazgos);
  return h(
    "div",
    {},
    barra(
      inspeccion.embarcacion.nombre || "Inspecci\xF3n",
      h("span", { class: "contador" }, `${avance.respondidos}/${avance.total}`)
    ),
    pestanas("guion"),
    h(
      "div",
      { class: "contenido" },
      h(
        "p",
        { class: "sutil" },
        (FORMULARIO.publica === true ? `Versi\xF3n p\xFAblica: guion del Anexo II del RD 1434/1999 (${FORMULARIO.version_formulario}). Los bloques 5 a 10 del Anexo II no detallan comprobaciones y quedan como un punto cada uno. ` : `Guion generado del formulario de inspecci\xF3n (${FORMULARIO.organizacion}, v. ${FORMULARIO.version_formulario}), con la cita del Anexo II del RD 1434/1999 en cada punto. `) + `${guion.bloques.length} bloques, ${avance.total} puntos, ${guion.totalComprobaciones} comprobaciones.`
      ),
      // Selector de visita. Va aquí, encima del guion, porque es el contexto de todo lo
      // que se registre a continuación: la hoja de papel lo resuelve con tres columnas,
      // y en una pantalla de móvil no caben tres columnas.
      selectorVisita(inspeccion),
      pintarGuion(
        guion,
        inspeccion.hallazgos,
        inspeccion.datosPunto,
        inspeccion.registro,
        inspeccion.visitaActiva,
        {
          alResponder: (p, r) => void responder(p, r),
          alObservar: (p, t) => void observar(p, t),
          alCambiarGravedad: (p, g) => void cambiarGravedad(p, g),
          alAnadirFoto: (p, f) => void anadirFoto(p, f),
          alAnotarDato: (p, c, v) => void anotarDato(p, c, v)
        },
        inspeccion.estado !== "borrador"
      )
    )
  );
}
function pantallaEquipo(inspeccion) {
  const soloLectura = inspeccion.estado !== "borrador";
  const zona2 = zonaActual(inspeccion);
  const zonaMostrada = zona2.zona ?? 7;
  const exigible = equipoExigible(
    inspeccion.embarcacion,
    {
      zona: zonaMostrada,
      personasABordo: inspeccion.personasABordo,
      navegacionDiurna: inspeccion.navegacionDiurna
    },
    [CATALOGO_EQUIPO],
    inspeccion.fecha
  );
  const lineas = inventarioContable(
    inspeccion.embarcacion,
    inspeccion.personasABordo,
    inspeccion.navegacionDiurna,
    zonaMostrada,
    [CATALOGO_EQUIPO],
    inspeccion.fecha
  );
  const contables = new Set(lineas.map((l) => l.equipo));
  const noContables = exigible.exigencias.filter((e) => !contables.has(e.equipo));
  const acciones = {
    alContar: (equipo, cantidad) => void contar2(equipo, cantidad),
    alCambiarPersonas: (personas) => {
      inspeccion.personasABordo = personas;
      void persistir();
    },
    alCambiarDiurna: (diurna) => {
      inspeccion.navegacionDiurna = diurna;
      void persistir();
    }
  };
  return h(
    "div",
    {},
    barra(inspeccion.embarcacion.nombre || "Equipo"),
    pestanas("equipo"),
    h(
      "div",
      { class: "contenido" },
      panelZona(zona2),
      // El contraste va inmediatamente después de la zona: el inspector acaba de contar
      // el equipo y aquí ve si lo contado respalda lo que dice la documentación.
      panelContraste(discrepancias(contrastesDe(inspeccion))),
      panelNavegacion(
        inspeccion.personasABordo,
        inspeccion.navegacionDiurna,
        acciones,
        soloLectura
      ),
      pintarInventario(
        lineas,
        noContables,
        zonaMostrada,
        exigible.versionCatalogo,
        inspeccion.inventario,
        acciones,
        soloLectura
      )
    )
  );
}
function pantallaActa(inspeccion) {
  const guion = guionActual(inspeccion);
  const avance = medirAvance(guion, inspeccion.hallazgos);
  const resultado = calcularResultado(inspeccion.hallazgos, inspeccion.fecha);
  const firmada = inspeccion.estado !== "borrador";
  return h(
    "div",
    {},
    barra(
      "Acta",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF")
    ),
    pestanas("acta"),
    h(
      "div",
      { class: "contenido" },
      panelResultado(resultado, avance),
      !firmada && h(
        "div",
        { class: "tarjeta" },
        // RF-24: el art. 12 tipifica como infracción realizar el reconocimiento «de
        // modo incompleto». La aplicación no deja firmar con puntos sin responder.
        !avance.completo ? h(
          "p",
          { class: "salvedad" },
          `\u26A0 No se puede firmar el acta: quedan ${avance.pendientes.length} puntos sin responder. El art. 12 del RD 1434/1999 tipifica como infracci\xF3n realizar el reconocimiento de modo incompleto.`
        ) : h(
          "button",
          {
            class: "principal",
            onclick: async () => {
              if (!confirm(
                "Una vez firmada, el acta no se puede modificar (ADR-003). \xBFFirmar?"
              )) {
                return;
              }
              estado.inspeccion = firmar(inspeccion, resultado);
              await persistir();
            }
          },
          "Firmar acta"
        )
      ),
      h("div", { class: "acta-marco" }, pintarActa(
        inspeccion,
        guion,
        resultado,
        avance,
        zonaActual(inspeccion),
        CAMPOS,
        discrepancias(contrastesDe(inspeccion))
      ))
    )
  );
}
async function pantallaRegistro() {
  const inspecciones = await listarInspecciones();
  const anios = aniosConActuaciones(inspecciones);
  const anio = anios.includes(estado.anioRegistro) ? estado.anioRegistro : anios[0] ?? estado.anioRegistro;
  const memoria = componerMemoriaAnual(inspecciones, anio, hoy());
  const registro = componerRegistro(inspecciones, anio);
  const acciones = {
    alCambiarAnio: (a) => {
      estado.anioRegistro = a;
      void render();
    },
    alAbrirInspeccion: (id) => void abrir2(id)
  };
  return h(
    "div",
    {},
    barra(
      "Registro y memoria anual",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "inicio";
            await render();
          }
        },
        "Inicio"
      )
    ),
    h(
      "div",
      { class: "contenido" },
      anios.length > 1 && selectorAnio(anios, anio, acciones),
      panelPlazoMemoria(memoria),
      h("div", { class: "acta-marco" }, pintarMemoria(memoria)),
      h("h2", {}, `Registro de actuaciones de ${anio}`),
      h(
        "p",
        { class: "sutil" },
        "El registro es la lista de todo lo actuado; la memoria es el resumen que se presenta. Se llevan por separado porque son dos obligaciones distintas del mismo art\xEDculo."
      ),
      pintarRegistro(registro, acciones)
    )
  );
}
function listaHistorico(acciones) {
  const lineas = componerHistorico(estado.listado, estado.filtroHistorico, hoy());
  return h(
    "div",
    { id: "resultados-historico" },
    pintarHistorico(lineas, resumirHistorico(lineas), acciones)
  );
}
async function pantallaHistorico() {
  estado.listado = await listarInspecciones();
  const acciones = {
    alBuscar: (texto) => {
      estado.filtroHistorico = { ...estado.filtroHistorico, texto };
      document.getElementById("resultados-historico")?.replaceWith(listaHistorico(acciones));
    },
    alFiltrar: (cambio) => {
      const f = {
        ...estado.filtroHistorico
      };
      if (cambio.anio !== void 0) f.anio = cambio.anio === "" ? void 0 : Number(cambio.anio);
      if (cambio.resultado !== void 0) {
        f.resultado = cambio.resultado === "" ? void 0 : cambio.resultado;
      }
      if (cambio.tipo !== void 0) f.tipo = cambio.tipo === "" ? void 0 : cambio.tipo;
      estado.filtroHistorico = f;
      void render();
    },
    alAbrirInspeccion: (id) => void abrir2(id),
    alAbrirExpediente: (matricula) => void abrirExpediente(matricula)
  };
  return h(
    "div",
    {},
    barra(
      "Hist\xF3rico de inspecciones",
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "inicio";
            await render();
          }
        },
        "Inicio"
      )
    ),
    h(
      "div",
      { class: "contenido" },
      panelFiltros(
        estado.filtroHistorico,
        aniosConActuaciones(estado.listado),
        tiposConActuaciones(estado.listado),
        acciones
      ),
      listaHistorico(acciones)
    )
  );
}
function reglasRevisables() {
  return [
    {
      catalogo: `${CATALOGO_REGLAS.norma} \u2014 reconocimientos y periodicidad`,
      reglas: CATALOGO_REGLAS.reglas
    },
    {
      catalogo: `${CATALOGO_EQUIPO.norma} \u2014 equipo, zonas y contaminaci\xF3n`,
      reglas: CATALOGO_EQUIPO.reglas
    },
    {
      catalogo: `${CATALOGO_SUCESOS.norma} \u2014 reconocimientos por suceso`,
      reglas: CATALOGO_SUCESOS.reglas
    },
    {
      catalogo: "RD 1434/1999 \u2014 propuesta de gravedad (Anexo II \u2192 Anexo III)",
      nota: "El Real Decreto no enlaza sus dos anexos: el II dice qu\xE9 se comprueba y el III qu\xE9 se considera deficiencia grave. Esta correspondencia es interpretaci\xF3n del autor y es lo que el sistema propone al marcar un defecto como no conforme. Se incluyen tambi\xE9n los puntos sin propuesta, porque dejar un punto fuera es tan revisable como meterlo.",
      reglas: correspondenciaRevisable(CATALOGO_ANEXO)
    }
  ];
}
var CLAVE_REVISION = `${CATALOGO_REGLAS.norma}@${CATALOGO_REGLAS.version}+${CATALOGO_EQUIPO.norma}@${CATALOGO_EQUIPO.version}`;
async function dictaminar(reglaId, veredicto2, observacion) {
  const revision = estado.revision;
  if (revision === void 0) return;
  const previo = revision.dictamenes[reglaId];
  revision.dictamenes[reglaId] = {
    reglaId,
    veredicto: veredicto2,
    observacion,
    revisadoPor: estado.revisor,
    revisadoEn: selloDeHoy()
  };
  await guardarRevision(revision);
  if (previo?.veredicto !== veredicto2) await render();
}
async function pantallaRevision() {
  estado.revision ??= await leerRevision(CLAVE_REVISION);
  const revision = estado.revision;
  const catalogos = reglasRevisables();
  const todas = catalogos.flatMap((c) => c.reglas);
  const avance = medirRevision(todas.length, revision.dictamenes);
  const acciones = {
    alDictaminar: (id, v, obs) => void dictaminar(id, v, obs),
    alCambiarRevisor: (nombre) => {
      estado.revisor = nombre;
    },
    alFiltrar: (soloPendientes) => {
      estado.soloPendientes = soloPendientes;
      void render();
    }
  };
  return h(
    "div",
    {},
    barra(
      "Revisi\xF3n del cat\xE1logo",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "inicio";
            await render();
          }
        },
        "Inicio"
      )
    ),
    h(
      "div",
      { class: "contenido revision" },
      portadaRevisionPapel(
        catalogos.map((c) => ({ catalogo: c.catalogo, reglas: c.reglas.length })),
        versionCatalogo()
      ),
      panelAvanceRevision(avance, estado.revisor, estado.soloPendientes, acciones),
      pintarConclusionesRevision(todas, revision.dictamenes),
      ...catalogos.map((c) => {
        const reglas = estado.soloPendientes ? c.reglas.filter((r) => revision.dictamenes[r.id] === void 0) : c.reglas;
        if (reglas.length === 0) return h("div", {});
        return h(
          "div",
          { class: "catalogo-revision" },
          h("h1", { class: "titulo-catalogo" }, c.catalogo),
          c.nota !== void 0 && h("p", { class: "salvedad" }, "\u26A0 ", c.nota),
          pintarRevision(agruparPorArticulo(reglas), revision.dictamenes, acciones)
        );
      })
    )
  );
}
async function render() {
  const nuevas = {
    avisos: pantallaAvisos,
    agenda: pantallaAgenda,
    biblioteca: pantallaBiblioteca,
    embarcaciones: pantallaEmbarcaciones,
    analisis: pantallaAnalisis
  };
  const pantallaNueva = nuevas[estado.pantalla];
  if (pantallaNueva !== void 0) {
    pintar(raiz, await pantallaNueva());
    if (estado.resaltar !== void 0) {
      document.getElementById(estado.resaltar)?.scrollIntoView({ block: "center" });
      estado.resaltar = void 0;
    }
    return;
  }
  if (estado.pantalla === "revision") {
    pintar(raiz, await pantallaRevision());
    return;
  }
  if (estado.pantalla === "registro") {
    pintar(raiz, await pantallaRegistro());
    return;
  }
  if (estado.pantalla === "historico") {
    pintar(raiz, await pantallaHistorico());
    return;
  }
  if (estado.pantalla === "propietario" && estado.matricula !== void 0) {
    pintar(raiz, await pantallaPropietario(estado.matricula));
    return;
  }
  if (estado.pantalla === "expediente" && estado.matricula !== void 0) {
    pintar(raiz, await pantallaExpediente(estado.matricula));
    return;
  }
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || estado.pantalla === "inicio") {
    pintar(raiz, await pantallaInicio());
    return;
  }
  const matricula = inspeccion.embarcacion.matricula.trim();
  estado.sucesosExpediente = matricula === "" ? [] : (await leerExpediente(matricula)).sucesos;
  pintar(
    raiz,
    estado.pantalla === "ficha" ? pantallaFicha(inspeccion) : estado.pantalla === "guion" ? pantallaGuion(inspeccion) : estado.pantalla === "equipo" ? pantallaEquipo(inspeccion) : pantallaActa(inspeccion)
  );
}
async function arrancar() {
  void pedirPersistencia();
  estado.perfil = await leerPerfil();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
    });
  }
  window.addEventListener("beforeprint", () => {
    for (const d of document.querySelectorAll(".revision details")) {
      d.open = true;
    }
  });
  await render();
}
void arrancar();
