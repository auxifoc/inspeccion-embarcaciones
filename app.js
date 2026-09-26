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
    [condiciones.combustible, embarcacion.combustible],
    [condiciones.anclaAltoPoderAgarre, embarcacion.anclaAltoPoderAgarre]
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
  const fecha2 = /* @__PURE__ */ new Date(`${valor2}T00:00:00Z`);
  return !Number.isNaN(fecha2.getTime()) && fecha2.toISOString().slice(0, 10) === valor2;
}
function estaEnVigor(regla, fecha2) {
  if (fecha2 < regla.vigenciaDesde) return false;
  if (regla.vigenciaHasta !== null && fecha2 >= regla.vigenciaHasta) return false;
  return true;
}
function reglasEnVigor(reglas, fecha2) {
  return reglas.filter((regla) => estaEnVigor(regla, fecha2));
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
  const resultado2 = expresion();
  if (i < fichas.length) {
    throw new ErrorExpresion(
      `Sobra texto a partir de '${fichas[i]?.valor}'`,
      texto
    );
  }
  return faltaVariable ? void 0 : resultado2;
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
var ZONA_POR_CATEGORIA_NAVEGACION = {
  A: 1,
  B: 2,
  C: 3,
  "D-1": 5,
  "D-2": 6
};
function techoDeZona(embarcacion, personasABordo) {
  if (embarcacion.marcadoCE) {
    const placa = embarcacion.categoriasDiseno ?? [];
    if (placa.length > 0) {
      const admiten = personasABordo === void 0 ? placa : placa.filter((c) => c.personasMax >= personasABordo);
      const elegida = [...admiten].sort(
        (a, b) => (zonaTecho(true, a.categoria) ?? 7) - (zonaTecho(true, b.categoria) ?? 7)
      )[0];
      if (elegida !== void 0) {
        return {
          zona: zonaTecho(true, elegida.categoria),
          categoria: elegida.categoria,
          fundamento: `Categor\xEDa de dise\xF1o ${elegida.categoria}` + (placa.length > 1 ? `, la m\xE1s exigente que admite ${personasABordo ?? "las"} personas (la placa trae ${placa.length}; CT 1/2020 de la DGMM)` : "") + " (art. 3.3 del RD 339/2021)."
        };
      }
      return {
        fundamento: `Ninguna categor\xEDa de la placa admite ${personasABordo} personas (m\xE1ximo ${Math.max(...placa.map((c) => c.personasMax))}; CT 1/2020 de la DGMM).`
      };
    }
    if (embarcacion.categoriaDiseno !== void 0) {
      return {
        zona: zonaTecho(true, embarcacion.categoriaDiseno),
        categoria: embarcacion.categoriaDiseno,
        fundamento: `Categor\xEDa de dise\xF1o ${embarcacion.categoriaDiseno} (art. 3.3 del RD 339/2021).`
      };
    }
  }
  if (embarcacion.zonaCertificada !== void 0) {
    return {
      zona: embarcacion.zonaCertificada,
      fundamento: `Zona ${embarcacion.zonaCertificada} del certificado de navegabilidad vigente (art. 3.4 y disposici\xF3n adicional tercera del RD 339/2021).`
    };
  }
  if (embarcacion.categoriaNavegacion !== void 0) {
    const zona2 = ZONA_POR_CATEGORIA_NAVEGACION[embarcacion.categoriaNavegacion];
    return {
      zona: zona2,
      fundamento: `Categor\xEDa de navegaci\xF3n ${embarcacion.categoriaNavegacion} de la ficha antigua, que equivale a la zona ${zona2} (CT 1/2024 de la DGMM).`
    };
  }
  return {
    fundamento: embarcacion.marcadoCE ? "No consta la categor\xEDa de dise\xF1o." : "Sin marcado CE y sin zona en el certificado ni categor\xEDa de navegaci\xF3n: el techo tiene que tomarse del certificado (art. 3.4 del RD 339/2021)."
  };
}
function leerEstabilidad(embarcacion, techo) {
  const e = embarcacion.estabilidad;
  if (e === void 0) return void 0;
  const reserva = e.preliminar ? " La evaluaci\xF3n es preliminar (pesos calculados con GM < 1,5 m, C.2.3 de la ISO 12217-2): har\xEDa falta una experiencia de estabilidad." : "";
  const origen = `${e.norma}, evaluaci\xF3n del ${e.fecha}`;
  if (e.categoria === null) {
    return {
      nota: `La evaluaci\xF3n de estabilidad (${origen}) no alcanza ni la categor\xEDa D.` + reserva
    };
  }
  const zonaISO = zonaTecho(true, e.categoria);
  if (embarcacion.marcadoCE) {
    if (techo.categoria !== void 0 && zonaISO > (techo.zona ?? 7)) {
      return {
        categoria: e.categoria,
        nota: `La estabilidad calculada (${origen}) da categor\xEDa ${e.categoria}, por debajo de la ${techo.categoria} de la placa. Si el barco ha tenido reformas, puede tratarse de una conversi\xF3n importante (CT 5/2020 de la DGMM). La placa sigue mandando.` + reserva
      };
    }
    return {
      categoria: e.categoria,
      nota: `La estabilidad calculada (${origen}) respalda la categor\xEDa de la placa.` + reserva
    };
  }
  if (techo.zona === void 0 || zonaISO < techo.zona) {
    return {
      zonaJustificable: zonaISO,
      categoria: e.categoria,
      nota: `La estabilidad calculada (${origen}) corresponde a la categor\xEDa de dise\xF1o ${e.categoria}, que permitir\xEDa optar a la zona ${zonaISO} con el equipo que exige. Subir de zona requiere justificaci\xF3n t\xE9cnica firmada por t\xE9cnico competente y la decide la Capitan\xEDa Mar\xEDtima (CT 1/2024 de la DGMM, caso B.2).` + reserva
    };
  }
  return {
    categoria: e.categoria,
    nota: `La estabilidad calculada (${origen}) no permite una zona mejor que la actual.` + reserva
  };
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
function valorEnTabla(tabla, x) {
  const puntos = tabla.puntos;
  const primero = puntos[0];
  const ultimo = puntos.at(-1);
  if (x <= primero[0]) return primero[1];
  if (x >= ultimo[0]) return ultimo[1];
  for (let i = 1; i < puntos.length; i++) {
    const [x1, y1] = puntos[i - 1];
    const [x2, y2] = puntos[i];
    if (x <= x2) {
      const proporcion = (x - x1) / (x2 - x1);
      return Math.round((y1 + proporcion * (y2 - y1)) * 10) / 10;
    }
  }
  return ultimo[1];
}
function aExigencia(regla, variables) {
  const c = regla.entonces;
  let cantidad;
  let minimoAceptable;
  let faltaDato;
  if (typeof c.cantidad === "number") {
    cantidad = c.cantidad;
  } else if (c.cantidad !== void 0 && "tabla" in c.cantidad) {
    const tabla = c.cantidad.tabla;
    const x = variables[tabla.variable];
    if (x === void 0) {
      faltaDato = tabla.variable;
    } else {
      cantidad = valorEnTabla(tabla, x);
      if (tabla.factor !== void 0) cantidad = Math.round(cantidad * tabla.factor * 10) / 10;
      if (tabla.tolerancia !== void 0) {
        minimoAceptable = Math.round(cantidad * (1 - tabla.tolerancia) * 100) / 100;
      }
    }
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
    ...minimoAceptable !== void 0 ? { minimoAceptable } : {},
    ...c.unidad !== void 0 ? { unidad: c.unidad } : {},
    minimoPorUnidad: c.minimoPorUnidad === true,
    satisfechoPor: c.satisfechoPor ?? [],
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
function conDA2(exigencia, regla, embarcacion) {
  const nuevos = regla.entonces.requisitosNuevos ?? [];
  if (nuevos.length === 0 || !(embarcacion.equiposFOM1144 ?? []).includes(exigencia.equipo)) {
    return exigencia;
  }
  return {
    ...exigencia,
    requisitos: exigencia.requisitos.filter((r) => !nuevos.includes(r)),
    retiradosPorDA2: nuevos
  };
}
function equiposConRequisitosNuevos(catalogos) {
  const porEquipo = /* @__PURE__ */ new Map();
  for (const catalogo of catalogos) {
    for (const regla of catalogo.reglas) {
      const nuevos = regla.entonces.requisitosNuevos ?? [];
      if (nuevos.length === 0) continue;
      const linea2 = porEquipo.get(regla.entonces.equipo) ?? { equipo: regla.entonces.equipo, nombre: regla.entonces.nombre, requisitos: [] };
      for (const n of nuevos) if (!linea2.requisitos.includes(n)) linea2.requisitos.push(n);
      porEquipo.set(linea2.equipo, linea2);
    }
  }
  return [...porEquipo.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
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
    const lista3 = porGrupo.get(grupo);
    if (lista3) lista3.push(candidata);
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
function equipoExigible(embarcacion, contexto, catalogos, fecha2) {
  const variables = variablesDe(embarcacion, contexto);
  const candidatas = [];
  const avisos = [];
  for (const catalogo of catalogos) {
    for (const regla of catalogo.reglas) {
      if (!estaEnVigor(regla, fecha2)) continue;
      if (!cumpleCondicionesEquipo(embarcacion, contexto, regla.cuando)) continue;
      candidatas.push({ regla, exigencia: conDA2(aExigencia(regla, variables), regla, embarcacion) });
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
function inventarioContable(embarcacion, personasABordo, navegacionDiurna, zonaActual2, catalogos, fecha2) {
  const techo = techoDeZona(embarcacion).zona;
  const zonas = ZONAS.filter((z) => techo === void 0 || z >= techo);
  const lineas = /* @__PURE__ */ new Map();
  for (const zona2 of [...zonas].reverse()) {
    const { exigencias } = equipoExigible(
      embarcacion,
      { zona: zona2, personasABordo, navegacionDiurna },
      catalogos,
      fecha2
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
        const base2 = lineas.get(e.equipo);
        if (base2 !== void 0) lineas.set(e.equipo, { ...base2, enZonaActual: e });
      }
    }
  }
  return [...lineas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
function dependeDePersonas(equipo, embarcacion, contexto, catalogos, fecha2) {
  const cantidad = (personas) => equipoExigible(embarcacion, { ...contexto, personasABordo: personas }, catalogos, fecha2).exigencias.find((e) => e.equipo === equipo)?.cantidad;
  return cantidad(contexto.personasABordo) !== cantidad(contexto.personasABordo + 1);
}
function carenciasEn(embarcacion, contexto, catalogos, fecha2, inventario) {
  const { exigencias } = equipoExigible(embarcacion, contexto, catalogos, fecha2);
  const carencias = [];
  for (const e of exigencias) {
    if (e.exento) continue;
    if (e.remitidoA !== void 0) continue;
    if (e.cantidad === void 0 && e.faltaDato === void 0) continue;
    const anotados = [e.equipo, ...e.satisfechoPor].map((clave) => inventario[clave]).filter((v) => v !== void 0);
    const anotado = anotados.length > 0 ? Math.max(...anotados) : void 0;
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
    if (aBordo < (e.minimoAceptable ?? e.cantidad)) {
      carencias.push({ ...comun, exigido: e.cantidad, aBordo });
    }
  }
  return carencias;
}
function calcularZona(embarcacionOriginal, personasABordo, navegacionDiurna, inventario, catalogos, fecha2) {
  const avisos = [];
  const techoInfo = techoDeZona(embarcacionOriginal, personasABordo);
  const techo = techoInfo.zona;
  const embarcacion = techoInfo.categoria !== void 0 ? { ...embarcacionOriginal, categoriaDiseno: techoInfo.categoria } : embarcacionOriginal;
  if (techo === void 0) {
    avisos.push(
      "No hay techo de zona: " + techoInfo.fundamento + " El sistema no puede deducirlo, as\xED que recorre todas las zonas y el techo debe tomarse del certificado."
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
    const carencias = carenciasEn(embarcacion, contexto, catalogos, fecha2, inventario);
    if (carencias.length === 0) {
      carenciasPorZona.set(zona2, carencias);
      alcanzada = zona2;
      carenciasAlcanzada = [];
      break;
    }
    const porPersonas = carencias.filter(
      (c) => dependeDePersonas(c.equipo, embarcacion, contexto, catalogos, fecha2)
    );
    const resto = carencias.filter((c) => !porPersonas.includes(c));
    carenciasPorZona.set(zona2, carencias);
    if (resto.length > 0) continue;
    for (let n = personasABordo - 1; n >= 1; n--) {
      const conN = carenciasEn(embarcacion, { ...contexto, personasABordo: n }, catalogos, fecha2, inventario);
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
  const estabilidad = leerEstabilidad(embarcacionOriginal, techoInfo);
  const siguiente = alcanzada !== void 0 && alcanzada > 1 && (techo === void 0 || alcanzada - 1 >= techo) ? alcanzada - 1 : void 0;
  return {
    ...alcanzada !== void 0 ? { zona: alcanzada } : {},
    ...techo !== void 0 ? { techo } : {},
    fundamentoTecho: techoInfo.fundamento,
    enElTecho: alcanzada !== void 0 && alcanzada === techo,
    ...siguiente !== void 0 ? { siguienteZona: siguiente } : {},
    faltaParaSubir: siguiente !== void 0 ? carenciasPorZona.get(siguiente) ?? [] : [],
    carenciasEnZonaAlcanzada: carenciasAlcanzada,
    ...personasAptas !== void 0 ? { personasAptas } : {},
    limitanPersonas,
    ...estabilidad !== void 0 ? { estabilidad } : {},
    avisos
  };
}
function zonaPorCategoria(embarcacion, navegacionDiurna, inventario, catalogos, fecha2) {
  const placa = embarcacion.marcadoCE ? embarcacion.categoriasDiseno ?? [] : [];
  if (placa.length < 2) return [];
  return placa.map((c) => {
    const resultado2 = calcularZona(
      { ...embarcacion, categoriaDiseno: c.categoria, categoriasDiseno: [c] },
      c.personasMax,
      navegacionDiurna,
      inventario,
      catalogos,
      fecha2
    );
    return {
      categoria: c.categoria,
      personasMax: c.personasMax,
      ...c.cargaMaxKg !== void 0 ? { cargaMaxKg: c.cargaMaxKg } : {},
      resultado: resultado2,
      personas: resultado2.personasAptas ?? c.personasMax
    };
  });
}
function describirZonaPorCategoria(z) {
  const carga = z.cargaMaxKg !== void 0 ? `, carga m\xE1xima ${z.cargaMaxKg} kg` : "";
  if (z.resultado.zona === void 0) {
    return `Categor\xEDa ${z.categoria} (${z.personasMax} personas${carga}): no alcanza ninguna zona`;
  }
  return `Categor\xEDa ${z.categoria}: apto zona ${z.resultado.zona} con hasta ${z.personas} personas${carga}`;
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
    } else if (typeof cantidad === "object" && cantidad !== null && typeof cantidad["tabla"] === "object") {
      validarTabla(cantidad["tabla"], id, origen);
    } else {
      throw new ErrorCatalogo(
        `${id}: 'cantidad' debe ser un n\xFAmero, { expresion: "..." } o { tabla: {...} }`,
        origen
      );
    }
  }
  const nuevos = c["requisitosNuevos"];
  if (nuevos !== void 0) {
    const requisitos = Array.isArray(c["requisitos"]) ? c["requisitos"] : [];
    if (!Array.isArray(nuevos) || nuevos.some((n) => !requisitos.includes(n))) {
      throw new ErrorCatalogo(
        `${id}: cada 'requisitosNuevos' tiene que copiar literalmente uno de 'requisitos'`,
        origen
      );
    }
  }
  const satisfechoPor = c["satisfechoPor"];
  if (satisfechoPor !== void 0 && (!Array.isArray(satisfechoPor) || satisfechoPor.some((s) => typeof s !== "string"))) {
    throw new ErrorCatalogo(`${id}: 'satisfechoPor' es una lista de claves de equipo`, origen);
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
function validarTabla(tabla, id, origen) {
  const t = tabla;
  if (typeof t["variable"] !== "string" || !VARIABLES_EQUIPO.includes(t["variable"])) {
    throw new ErrorCatalogo(`${id}: la tabla usa una variable desconocida`, origen);
  }
  const puntos = t["puntos"];
  if (!Array.isArray(puntos) || puntos.length < 2) {
    throw new ErrorCatalogo(`${id}: la tabla necesita al menos dos puntos`, origen);
  }
  let anterior = -Infinity;
  for (const punto2 of puntos) {
    if (!Array.isArray(punto2) || punto2.length !== 2 || typeof punto2[0] !== "number" || typeof punto2[1] !== "number") {
      throw new ErrorCatalogo(`${id}: cada punto de la tabla es [variable, valor]`, origen);
    }
    if (punto2[0] <= anterior) {
      throw new ErrorCatalogo(`${id}: los puntos de la tabla van de menor a mayor`, origen);
    }
    anterior = punto2[0];
  }
  const tolerancia = t["tolerancia"];
  if (tolerancia !== void 0 && (typeof tolerancia !== "number" || tolerancia < 0 || tolerancia > 0.5)) {
    throw new ErrorCatalogo(`${id}: 'tolerancia' es una fracci\xF3n entre 0 y 0,5`, origen);
  }
  const factor = t["factor"];
  if (factor !== void 0 && (typeof factor !== "number" || factor <= 0 || factor > 3)) {
    throw new ErrorCatalogo(`${id}: 'factor' es un n\xFAmero positivo, no mayor que 3`, origen);
  }
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
    const lista3 = porGrupo.get(regla.grupo);
    if (lista3) lista3.push(regla);
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
function evaluarSucesos(sucesos, catalogos, fecha2) {
  const obligaciones = [];
  const avisos = [];
  for (const suceso of sucesos) {
    let alguna = false;
    for (const catalogo of catalogos) {
      for (const regla of catalogo.reglas) {
        if (!estaEnVigor(regla, fecha2)) continue;
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
function aUTC(fecha2) {
  if (!esFechaISO(fecha2)) {
    throw new TypeError(`Fecha inv\xE1lida: '${fecha2}'. Se espera AAAA-MM-DD.`);
  }
  return /* @__PURE__ */ new Date(`${fecha2}T00:00:00Z`);
}
var aISO = (d) => d.toISOString().slice(0, 10);
function sumarMeses(fecha2, meses2) {
  const d = aUTC(fecha2);
  const diaOriginal = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + meses2);
  const ultimoDia = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)
  ).getUTCDate();
  d.setUTCDate(Math.min(diaOriginal, ultimoDia));
  return aISO(d);
}
function sumarAnios(fecha2, anios) {
  return sumarMeses(fecha2, anios * 12);
}
function sumarDias(fecha2, dias) {
  const d = aUTC(fecha2);
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
  const anadir = (clase, concepto, fecha2, cita, extra = {}) => {
    vencimientos.push({
      clase,
      concepto,
      fecha: fecha2,
      // Que se abriera la ventana del intermedio no es un plazo que venza: pasada la
      // fecha, la ventana está abierta. Lo que vence es su cierre, que es otra línea.
      estado: clase === "ventana" && fecha2 <= hoy2 ? "vigente" : estadoPlazo(fecha2, hoy2, avisoDias),
      diasRestantes: diasEntre(hoy2, fecha2),
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
  for (const [equipo, fecha2] of Object.entries(caducidades)) {
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
      fecha2,
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

// ../itb-motor/src/motor/temporada.ts
var VIGENCIA_TEMPORADA_COMERCIAL = "2025-12-31";
var CITA_TEMPORADA = "RD 186/2023, art. 9 (redacci\xF3n del RD 1188/2025)";
function comprobarPeriodo(embarcacion, periodo) {
  const errores = [];
  if (embarcacion.lista !== 7) {
    errores.push("El uso comercial temporal es de embarcaciones de la lista 7.\xAA; la 6.\xAA ya es comercial.");
  }
  if (periodo.fin < periodo.inicio) errores.push("El periodo acaba antes de empezar.");
  if (periodo.fin > sumarMeses(periodo.inicio, 3)) {
    errores.push(`Pasa de tres meses consecutivos (${CITA_TEMPORADA}).`);
  }
  if (periodo.inicio.slice(0, 4) !== periodo.fin.slice(0, 4)) {
    errores.push("Los tres meses son por a\xF1o natural: el periodo no puede cruzar de a\xF1o.");
  }
  if (periodo.inicio < VIGENCIA_TEMPORADA_COMERCIAL) {
    errores.push(`Antes del ${VIGENCIA_TEMPORADA_COMERCIAL} la norma no lo permit\xEDa.`);
  }
  return errores;
}
function enTemporada(periodo, fecha2) {
  return periodo.inicio <= fecha2 && fecha2 <= periodo.fin;
}
function conRegimenComercial(embarcacion) {
  return { ...embarcacion, lista: 6, finesComerciales: true };
}
function revisarTemporada(embarcacion, periodo, catalogo, hoy2) {
  const comercial = conRegimenComercial(embarcacion);
  const avisos = comprobarPeriodo(embarcacion, periodo);
  const resultado2 = calendario(comercial, evaluar(comercial, [catalogo], periodo.inicio), {}, [], hoy2);
  const pendientes2 = resultado2.vencimientos.filter(
    (v) => (v.clase === "certificado" || v.clase === "reconocimiento") && v.fecha <= periodo.inicio
  );
  if (comercial.fechaCertificado === void 0) {
    avisos.push(
      "No consta la fecha del certificado: con el r\xE9gimen de la lista 6.\xAA necesita reconocimiento peri\xF3dico cada cinco a\xF1os cualquiera que sea su eslora, y no se puede saber si lo tiene al d\xEDa."
    );
  }
  return { periodo, pendientes: pendientes2, avisos };
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
    (c) => c.aplicaA.tipo === componente.tipo && (c.aplicaA.marca === void 0 || normal(c.aplicaA.marca) === normal(componente.marca)) && (c.aplicaA.modelos === void 0 || c.aplicaA.modelos.some((m2) => normal(m2) === normal(componente.modelo)))
  );
}
function planParecido(componente, catalogos) {
  const anotado = normal(componente.modelo);
  if (anotado === "") return void 0;
  for (const c of catalogos) {
    if (c.aplicaA.tipo !== componente.tipo) continue;
    if (c.aplicaA.marca !== void 0 && normal(c.aplicaA.marca) !== normal(componente.marca)) continue;
    const modelo = (c.aplicaA.modelos ?? []).find(
      (m2) => anotado.startsWith(normal(m2)) && anotado !== normal(m2)
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
function evaluarTarea(base2, componente, trabajos, lecturas, hoy2) {
  const avisos = [];
  const serie = componente !== void 0 ? lecturasDe(lecturas, componente.id, hoy2) : [];
  const horasActuales = serie.at(-1)?.horas;
  const hechos = trabajos.filter(
    (t) => t.tareaId === base2.tareaId && t.componenteId === componente?.id && t.fecha <= hoy2
  ).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const ultimo = hechos.at(-1);
  let desde;
  let intervalo2 = base2.cada;
  let taller = base2.taller;
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
    if (base2.primeraVez !== void 0) {
      intervalo2 = base2.primeraVez;
      taller = base2.tallerPrimeraVez ?? base2.taller;
      rodaje = true;
    }
  }
  const comun = {
    origen: base2.origen,
    tarea: base2.tarea,
    tareaId: base2.tareaId,
    ...base2.planId !== void 0 ? { planId: base2.planId } : {},
    ...componente !== void 0 ? { componenteId: componente.id, componente: componente.nombre } : {},
    ...base2.sistema !== void 0 ? { sistema: base2.sistema } : {},
    ...base2.accion !== void 0 ? { accion: base2.accion } : {},
    ...taller !== void 0 && taller !== "no" ? { taller } : {},
    ...rodaje ? { rodaje } : {},
    intervalo: intervalo2,
    fuente: base2.fuente,
    ...base2.notas !== void 0 ? { notas: base2.notas } : {},
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
function planMantenimiento(entrada2, hoy2) {
  if (!esFechaISO(hoy2)) {
    throw new TypeError(`Fecha inv\xE1lida: '${hoy2}'. Se espera AAAA-MM-DD.`);
  }
  const lineas = [];
  const avisos = [];
  for (const componente of entrada2.componentes) {
    if (componente.baja !== void 0 && componente.baja <= hoy2) continue;
    const serie = lecturasDe(entrada2.lecturas, componente.id, hoy2);
    for (let i = 1; i < serie.length; i += 1) {
      const antes = serie[i - 1];
      const ahora = serie[i];
      if (ahora.horas < antes.horas) {
        avisos.push(
          `${componente.nombre}: la lectura del ${ahora.fecha} (${ahora.horas} h) es menor que la del ${antes.fecha} (${antes.horas} h). \xBFError de anotaci\xF3n o hor\xF3metro cambiado?`
        );
      }
    }
    const plan = planDe(componente, entrada2.catalogos);
    const propias = (entrada2.tareasPropias ?? []).filter((t) => t.componenteId === componente.id);
    if (plan === void 0 && propias.length === 0) {
      const parecido = planParecido(componente, entrada2.catalogos);
      avisos.push(
        `${componente.nombre}: no hay plan del fabricante en el cat\xE1logo para ${[componente.marca, componente.modelo].filter(Boolean).join(" ") || "este componente"}. ` + (parecido !== void 0 ? `El cat\xE1logo tiene el de \xAB${parecido.plan.documento}\xBB para el ${parecido.modelo}: si \xAB${componente.modelo}\xBB es ese modelo con su c\xF3digo de tipo, anote solo ${parecido.modelo} o as\xEDgnele el plan a mano; si es otro modelo, tiene su propio manual.` : "Pueden anotarse sus tareas a mano, con la fuente de la que salen.")
      );
    }
    if (plan !== void 0) {
      if (componente.planId !== void 0 && plan.aplicaA.modelos !== void 0 && !plan.aplicaA.modelos.some((m2) => normal(m2) === normal(componente.modelo))) {
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
            entrada2.trabajos,
            entrada2.lecturas,
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
          entrada2.trabajos,
          entrada2.lecturas,
          hoy2
        )
      );
    }
  }
  for (const propia of (entrada2.tareasPropias ?? []).filter((t) => t.componenteId === void 0)) {
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
        entrada2.trabajos,
        entrada2.lecturas,
        hoy2
      )
    );
  }
  for (const t of entrada2.tareasAnalisis ?? []) {
    const componente = t.componenteId !== void 0 ? entrada2.componentes.find((c) => c.id === t.componenteId && (c.baja === void 0 || c.baja > hoy2)) : void 0;
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
        entrada2.trabajos,
        entrada2.lecturas,
        hoy2
      )
    );
  }
  for (const v of entrada2.vencimientos ?? []) {
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
  for (const d of entrada2.deficiencias ?? []) {
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
  for (const [i, m2] of c["modos"].entries()) {
    const donde = `modo #${i + 1}${typeof m2["id"] === "string" ? ` (${m2["id"]})` : ""}`;
    for (const campo2 of ["id", "sistema", "subsistema", "elemento", "funcion", "modo", "causa", "efecto", "anclaSeveridad"]) {
      if (typeof m2[campo2] !== "string" || m2[campo2].trim() === "") {
        throw new ErrorCatalogo(`${donde}: falta '${campo2}'`, origen);
      }
    }
    if (vistos.has(m2["id"])) throw new ErrorCatalogo(`modo repetido: ${m2["id"]}`, origen);
    vistos.add(m2["id"]);
    if (!escala(m2["severidad"])) throw new ErrorCatalogo(`${donde}: 'severidad' debe ser un entero de 1 a 5`, origen);
    if (!escala(m2["ocurrencia"])) throw new ErrorCatalogo(`${donde}: 'ocurrencia' debe ser un entero de 1 a 5`, origen);
    if (m2["deteccion"] !== "evidente" && m2["deteccion"] !== "oculto") {
      throw new ErrorCatalogo(`${donde}: 'deteccion' debe ser evidente u oculto`, origen);
    }
    const citadas = m2["fuentesOcurrencia"] ?? [];
    const juicio = m2["juicioOcurrencia"];
    if (citadas.length === 0 && (typeof juicio !== "string" || juicio.trim() === "")) {
      throw new ErrorCatalogo(
        `${donde}: la ocurrencia no tiene fuente ni est\xE1 declarada como juicio del autor`,
        origen
      );
    }
    for (const f of citadas) {
      if (!claves.has(f)) throw new ErrorCatalogo(`${donde}: fuente desconocida '${String(f)}'`, origen);
    }
    const tarea = m2["tarea"];
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
    const criticidad = criticidadDe(m2);
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
function criticidadDe(m2) {
  if (m2.deteccion === "oculto" && m2.severidad >= 4) return "A";
  return MATRIZ[m2.severidad][m2.ocurrencia - 1];
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
  return catalogo.modos.filter((m2) => m2.soloSi?.transmision === void 0 || m2.soloSi.transmision === opciones.transmision).map((modo) => {
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
    const lista3 = porTipo.get(c.tipo);
    if (lista3) lista3.push(c);
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
function evaluar(embarcacion, catalogos, fecha2) {
  if (!esFechaISO(fecha2)) {
    throw new TypeError(
      `Fecha de evaluaci\xF3n inv\xE1lida: '${fecha2}'. Se espera AAAA-MM-DD.`
    );
  }
  const avisos = [];
  const candidatas = [];
  for (const catalogo of catalogos) {
    for (const regla of reglasEnVigor(catalogo.reglas, fecha2)) {
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
    fechaEvaluacion: fecha2,
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
        ],
        requisitosNuevos: [
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
      explicacion: "Las embarcaciones de recreo deber\xE1n disponer de una l\xEDnea de fondeo cuya longitud no podr\xE1 ser inferior a cinco veces la eslora de la embarcaci\xF3n. La longitud del tramo de cadena ser\xE1 como m\xEDnimo igual a la eslora de la embarcaci\xF3n."
    },
    {
      id: "RD339-A11-peso-ancla",
      cita: "RD 339/2021, art. 11.4 y 11.7",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "peso_ancla",
        nombre: "Peso del ancla",
        minimoPorUnidad: true,
        unidad: "kg",
        cantidad: {
          tabla: {
            variable: "esloraCascoM",
            tolerancia: 0.1,
            puntos: [
              [
                3,
                3.5
              ],
              [
                5,
                6
              ],
              [
                7,
                10
              ],
              [
                9,
                14
              ],
              [
                12,
                20
              ],
              [
                15,
                33
              ],
              [
                18,
                46
              ],
              [
                21,
                58
              ],
              [
                24,
                75
              ]
            ]
          }
        },
        requisitos: [
          "Si el ancla NO es de alto poder de agarre, el peso se aumenta en un tercio",
          "El peso puede repartirse en dos anclas si la principal lleva al menos el 75 %"
        ]
      },
      grupo: "peso_ancla",
      precedencia: 0,
      explicacion: "El peso m\xEDnimo del ancla se obtiene de la tabla del art. 11.4 en funci\xF3n de la eslora, interpolando para las esloras intermedias. Los pesos de la tabla se asocian a anclas de alto poder de agarre, con una tolerancia del 10 %.",
      advertencia: "No consta el tipo de ancla: si no es de alto poder de agarre, el peso exigible es un tercio mayor que el que aqu\xED se indica. An\xF3tese en el punto del fondeo."
    },
    {
      id: "RD339-A11-peso-ancla-alto-poder",
      cita: "RD 339/2021, art. 11.4 y 11.7",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        anclaAltoPoderAgarre: "si"
      },
      entonces: {
        equipo: "peso_ancla",
        nombre: "Peso del ancla",
        minimoPorUnidad: true,
        unidad: "kg",
        cantidad: {
          tabla: {
            variable: "esloraCascoM",
            tolerancia: 0.1,
            puntos: [
              [
                3,
                3.5
              ],
              [
                5,
                6
              ],
              [
                7,
                10
              ],
              [
                9,
                14
              ],
              [
                12,
                20
              ],
              [
                15,
                33
              ],
              [
                18,
                46
              ],
              [
                21,
                58
              ],
              [
                24,
                75
              ]
            ]
          }
        },
        requisitos: [
          "El peso puede repartirse en dos anclas si la principal lleva al menos el 75 %"
        ]
      },
      grupo: "peso_ancla",
      precedencia: 1,
      explicacion: "El ancla es de alto poder de agarre, a la que se asocian los pesos de la tabla del art. 11.4, con una tolerancia del 10 % (art. 11.7)."
    },
    {
      id: "RD339-A11-peso-ancla-otros-tipos",
      cita: "RD 339/2021, art. 11.4 y 11.7",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        anclaAltoPoderAgarre: "no"
      },
      entonces: {
        equipo: "peso_ancla",
        nombre: "Peso del ancla",
        minimoPorUnidad: true,
        unidad: "kg",
        cantidad: {
          tabla: {
            variable: "esloraCascoM",
            tolerancia: 0.1,
            factor: 1.3333333333,
            puntos: [
              [
                3,
                3.5
              ],
              [
                5,
                6
              ],
              [
                7,
                10
              ],
              [
                9,
                14
              ],
              [
                12,
                20
              ],
              [
                15,
                33
              ],
              [
                18,
                46
              ],
              [
                21,
                58
              ],
              [
                24,
                75
              ]
            ]
          }
        },
        requisitos: [
          "El peso puede repartirse en dos anclas si la principal lleva al menos el 75 %"
        ]
      },
      grupo: "peso_ancla",
      precedencia: 1,
      explicacion: "El ancla no es de alto poder de agarre, as\xED que su peso tiene que ser un tercio mayor que el de la tabla del art. 11.4 (art. 11.7). La tolerancia del 10 % se aplica sobre ese peso aumentado."
    },
    {
      id: "RD339-A11-diametro-cadena",
      cita: "RD 339/2021, art. 11.4 y 11.5",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        esloraCascoM: {
          min: 6,
          minExcluido: true
        }
      },
      entonces: {
        equipo: "diametro_cadena",
        nombre: "Di\xE1metro de la cadena",
        minimoPorUnidad: true,
        unidad: "mm",
        cantidad: {
          tabla: {
            variable: "esloraCascoM",
            puntos: [
              [
                7,
                6
              ],
              [
                9,
                8
              ],
              [
                12,
                8
              ],
              [
                15,
                10
              ],
              [
                18,
                10
              ],
              [
                21,
                12
              ],
              [
                24,
                12
              ]
            ]
          }
        },
        requisitos: [
          "Acero galvanizado o material equivalente, medida seg\xFAn UNE-EN 24565:1992"
        ]
      },
      explicacion: "El di\xE1metro m\xEDnimo de la cadena sale de la tabla del art. 11.4 en funci\xF3n de la eslora. Las embarcaciones de hasta 6 metros pueden llevar la l\xEDnea de fondeo constituida enteramente por estacha (art. 11.2)."
    },
    {
      id: "RD339-A11-diametro-estacha",
      cita: "RD 339/2021, art. 11.4 y 11.6",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {},
      entonces: {
        equipo: "diametro_estacha",
        nombre: "Di\xE1metro de la estacha",
        minimoPorUnidad: true,
        unidad: "mm",
        cantidad: {
          tabla: {
            variable: "esloraCascoM",
            puntos: [
              [
                3,
                10
              ],
              [
                7,
                10
              ],
              [
                9,
                12
              ],
              [
                12,
                12
              ],
              [
                15,
                14
              ],
              [
                18,
                14
              ],
              [
                21,
                16
              ],
              [
                24,
                16
              ]
            ]
          }
        },
        requisitos: [
          "El di\xE1metro es para estacha de nylon; en todo caso su carga de rotura ser\xE1 mayor que la de la cadena"
        ]
      },
      explicacion: "El di\xE1metro m\xEDnimo de la estacha sale de la tabla del art. 11.4 en funci\xF3n de la eslora, y se refiere a estachas de nylon."
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
      id: "RD339-A20-bombas-espacios-cerrados",
      cita: "RD 339/2021, art. 20.3",
      vigenciaDesde: "2021-07-01",
      vigenciaHasta: null,
      cuando: {
        compartimentoInteriorConMotorODeposito: true,
        combustible: [
          "grupo_1",
          "glp"
        ]
      },
      entonces: {
        equipo: "bomba_espacio_cerrado",
        nombre: "Bombas en espacios cerrados con gasolina o GLP",
        requisitos: [
          "Cumplen la UNE-EN ISO 8849:2019 (bombas de sentina el\xE9ctricas de CC), art. 20.3",
          "Y la protecci\xF3n contra la inflamaci\xF3n \u2014ISO 8846 / \xABIgnition Protected\xBB\u2014 que pregunta la hoja de la entidad"
        ],
        requisitosNuevos: [
          "Cumplen la UNE-EN ISO 8849:2019 (bombas de sentina el\xE9ctricas de CC), art. 20.3"
        ]
      },
      explicacion: "Las bombas situadas en espacios cerrados que contengan motores o dep\xF3sitos de combustible del grupo 1.\xBA o GLP deben cumplir la UNE-EN ISO 8849. El director confirm\xF3 el 16/09/2026 que en la pr\xE1ctica se exigen ambas normas \u2014la del art. 20.3 y la de protecci\xF3n contra la inflamaci\xF3n que pregunta el formulario\u2014, y no una u otra."
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
        ],
        requisitosNuevos: [
          "Conforme a la norma UNE-EN ISO 9094:2017 o la armonizada que la sustituya (art. 16.3)"
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
        ],
        requisitosNuevos: [
          "Conforme a la norma UNE-EN ISO 9094:2017 o la armonizada que la sustituya (art. 16.3)"
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
        ],
        requisitosNuevos: [
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
        ],
        requisitosNuevos: [
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
        ],
        requisitosNuevos: [
          "Conforme a la norma UNE-EN ISO 11105:2020 o la armonizada que la sustituya"
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
          "Ventilaci\xF3n forzada",
          "Conforme a la norma UNE-EN 15609:2012 o la armonizada que la sustituya"
        ],
        requisitosNuevos: [
          "Conforme a la norma UNE-EN 15609:2012 o la armonizada que la sustituya"
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
        ],
        requisitosNuevos: [
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

// src/datos/radio-rd1185.json
var radio_rd1185_default = {
  norma: "RD 1185/2006",
  identificadorBoe: "BOE-A-2006-18968",
  version: "2006-11-01",
  descripcion: "Equipamiento radioel\xE9ctrico exigible a las embarcaciones de recreo en funci\xF3n de la zona de navegaci\xF3n por la que est\xE1n autorizadas a navegar (arts. 56 a 60).",
  reglas: [
    {
      id: "RD1185-A56-mf-hf-zona1",
      cita: "RD 1185/2006, art. 56.1.a) y 56.2",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "mf_hf",
        nombre: "Instalaci\xF3n de MF/HF (o ETB)",
        cantidad: 1,
        satisfechoPor: [
          "etb"
        ],
        requisitos: [
          "Transmite y recibe en 2.182 kHz y en las bandas de 1.605 a 27.500 kHz del servicio m\xF3vil mar\xEDtimo",
          "Apta para llamada selectiva digital (LSD)"
        ]
      },
      explicacion: "Las embarcaciones autorizadas a navegar por la zona 1 llevar\xE1n una ETB o, en su lugar, una instalaci\xF3n de MF/HF capaz de transmitir y recibir en la frecuencia de socorro de 2.182 kHz y comunicaciones generales en las bandas del servicio m\xF3vil mar\xEDtimo. Las instalaciones deben ser aptas para LSD."
    },
    {
      id: "RD1185-A56-vhf-zona1",
      cita: "RD 1185/2006, art. 56.1.b) y 56.2",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "vhf_fijo",
        nombre: "Instalaci\xF3n de VHF fija",
        cantidad: 1,
        requisitos: [
          "Canales 16, 6 y 13 en radiotelefon\xEDa y canales del ap\xE9ndice 18 del Reglamento de Radiocomunicaciones",
          "Apta para llamada selectiva digital (LSD)"
        ]
      },
      explicacion: "Instalaci\xF3n radioel\xE9ctrica de VHF capaz de transmitir y recibir en los canales 16, 6 y 13 en radiotelefon\xEDa, y comunicaciones generales en los canales del ap\xE9ndice 18 del Reglamento de Radiocomunicaciones de la UIT, apta para LSD."
    },
    {
      id: "RD1185-A56-radiobaliza-zona1",
      cita: "RD 1185/2006, art. 56.1.c)",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "radiobaliza_406",
        nombre: "Radiobaliza de 406 MHz",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "De activaci\xF3n autom\xE1tica y manual"
        ]
      },
      explicacion: "Una radiobaliza de 406 MHz de activaci\xF3n autom\xE1tica y manual."
    },
    {
      id: "RD1185-A56-navtex-zona1-comercial",
      cita: "RD 1185/2006, art. 56.3.a)",
      vigenciaDesde: "2007-01-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1,
        finesComerciales: true
      },
      entonces: {
        equipo: "navtex",
        nombre: "Receptor NAVTEX",
        cantidad: 1
      },
      explicacion: "Receptor NAVTEX, solo en las embarcaciones que se exploten con fines lucrativos (lista sexta)."
    },
    {
      id: "RD1185-A56-vhf-portatil-zona1",
      cita: "RD 1185/2006, art. 56.3.b)",
      vigenciaDesde: "2007-01-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "vhf_portatil",
        nombre: "VHF port\xE1til bidireccional",
        cantidad: 1
      },
      explicacion: "Equipo radiotelef\xF3nico bidireccional port\xE1til de VHF."
    },
    {
      id: "RD1185-A56-respondedor-zona1",
      cita: "RD 1185/2006, art. 56.3.c)",
      vigenciaDesde: "2007-01-01",
      vigenciaHasta: null,
      cuando: {
        zona: 1
      },
      entonces: {
        equipo: "respondedor_radar",
        nombre: "Respondedor de radar de 9 GHz",
        cantidad: 1
      },
      explicacion: "Un respondedor de radar de 9 GHz."
    },
    {
      id: "RD1185-A57-vhf-zona2",
      cita: "RD 1185/2006, art. 57.1.a) y 57.2",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 2
      },
      entonces: {
        equipo: "vhf_fijo",
        nombre: "Instalaci\xF3n de VHF fija",
        cantidad: 1,
        requisitos: [
          "Apta para llamada selectiva digital (LSD)"
        ]
      },
      explicacion: "Las embarcaciones autorizadas a navegar por la zona 2 llevar\xE1n una instalaci\xF3n radioel\xE9ctrica de VHF, apta para llamada selectiva digital."
    },
    {
      id: "RD1185-A57-radiobaliza-zona2",
      cita: "RD 1185/2006, art. 57.1.b)",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 2
      },
      entonces: {
        equipo: "radiobaliza_406",
        nombre: "Radiobaliza de 406 MHz",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "De activaci\xF3n autom\xE1tica y manual"
        ]
      },
      explicacion: "Una radiobaliza de 406 MHz de activaci\xF3n autom\xE1tica y manual."
    },
    {
      id: "RD1185-A57-portatil-o-respondedor-zona2",
      cita: "RD 1185/2006, art. 57.3",
      vigenciaDesde: "2008-01-01",
      vigenciaHasta: null,
      cuando: {
        zona: 2
      },
      entonces: {
        equipo: "vhf_portatil",
        nombre: "VHF port\xE1til bidireccional",
        cantidad: 1,
        satisfechoPor: [
          "respondedor_radar"
        ],
        requisitos: [
          "Se admite un respondedor de radar de 9 GHz en su lugar"
        ]
      },
      explicacion: "En zona 2 se exige, adem\xE1s, un equipo port\xE1til bidireccional de VHF **o** un respondedor de radar de 9 GHz: cualquiera de los dos cumple."
    },
    {
      id: "RD1185-A58-vhf-zona3",
      cita: "RD 1185/2006, art. 58.1.a) y 58.2",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 3
      },
      entonces: {
        equipo: "vhf_fijo",
        nombre: "Instalaci\xF3n de VHF fija",
        cantidad: 1,
        requisitos: [
          "Apta para llamada selectiva digital (LSD)"
        ]
      },
      explicacion: "Las embarcaciones autorizadas a navegar por la zona 3 llevar\xE1n una instalaci\xF3n radioel\xE9ctrica de VHF, apta para llamada selectiva digital."
    },
    {
      id: "RD1185-A58-radiobaliza-zona3",
      cita: "RD 1185/2006, art. 58.1.b)",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 3
      },
      entonces: {
        equipo: "radiobaliza_406",
        nombre: "Radiobaliza de 406 MHz",
        familia: "salvamento",
        controlCaducidad: true,
        cantidad: 1,
        requisitos: [
          "De activaci\xF3n autom\xE1tica y manual, o \xFAnicamente manual"
        ]
      },
      explicacion: "Una radiobaliza de 406 MHz, de activaci\xF3n autom\xE1tica y manual o \xFAnicamente manual. En zona 3 la norma admite la de activaci\xF3n solo manual, que en zonas 1 y 2 no basta."
    },
    {
      id: "RD1185-A59-vhf-zona4",
      cita: "RD 1185/2006, art. 59",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 4
      },
      entonces: {
        equipo: "vhf_fijo",
        nombre: "Instalaci\xF3n de VHF fija",
        cantidad: 1
      },
      explicacion: "Las embarcaciones autorizadas a navegar por la zona 4 deben ir provistas, como m\xEDnimo, de una instalaci\xF3n radiotelef\xF3nica de VHF de tipo fijo."
    },
    {
      id: "RD1185-A60-vhf-zona5",
      cita: "RD 1185/2006, art. 60",
      vigenciaDesde: "2006-11-02",
      vigenciaHasta: null,
      cuando: {
        zona: 5
      },
      entonces: {
        equipo: "vhf_fijo",
        nombre: "Instalaci\xF3n de VHF fija",
        cantidad: 1,
        satisfechoPor: [
          "vhf_portatil"
        ],
        requisitos: [
          "Con radiotelefon\xEDa, o radiotelefon\xEDa y LSD",
          "Como alternativa, un VHF port\xE1til estanco conforme a IEC 60529 IPX7"
        ]
      },
      explicacion: "En zona 5 se exige una instalaci\xF3n de VHF fija con radiotelefon\xEDa, o radiotelefon\xEDa y LSD. Se admite como alternativa un VHF port\xE1til que cumpla la estanqueidad IPX7 de la norma IEC 60529."
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
      explicacion: "Ser\xE1 obligatoria la realizaci\xF3n de un reconocimiento adicional despu\xE9s de haber sufrido varada, abordaje o serias aver\xEDas por temporal u otro motivo."
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
      tipo_normativo: "extraordinario",
      nota: "No lo cita el RD 1434/1999. Extraordinario (art. 3.E) con el alcance de un peri\xF3dico, como pide la IS 1/2022 de la DGMM (punto 2)."
    },
    {
      clave: "cambio_categoria",
      etiqueta: "Cambio de categor\xEDa",
      tipo_normativo: "adicional",
      suceso: "modificacion",
      nota: "Adicional (art. 3.D), como indica la CT 1/2024 de la DGMM para el cambio de zona."
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
    const resultado2 = r?.resultado ?? "conforme";
    const propuesta = resultado2 === "no_conforme" ? proponer(puntoId) : void 0;
    const hallazgo = {
      puntoId,
      visita: inspeccion.visitaActiva,
      resultado: resultado2,
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
function inspeccionEjemplo(fecha2, versionCatalogo2, prefijoInforme = "") {
  const ahora = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: nuevoId("insp"),
    embarcacion: embarcacionEjemplo(),
    numeroInforme: `${prefijoInforme}0007`,
    identificacion: { banderaEspanola: true, win: "ES-EJE12345K021" },
    tipo: "periodico",
    motivo: "periodico",
    fecha: fecha2,
    lugar: "Varadero de ejemplo",
    inspector: "",
    estado: "borrador",
    visitas: {
      v1: {
        clave: "v1",
        fecha: fecha2,
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
      "10.00": { pesoAnclaKg: "18", origenPesoAncla: "Medido", molinete: "El\xE9ctrico" }
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
      // Art. 11.4: a 11 m le tocan 18 kg de ancla, interpolando entre los 14 kg de 9 m y
      // los 20 kg de 12 m, con cadena de 8 mm y estacha de 12 mm de la misma tabla.
      // Radio (RD 1185/2006): con VHF fijo alcanza la zona 4; para la 3 le faltaría además
      // la radiobaliza de 406 MHz, que el sistema cuenta desde el 16/09/2026.
      vhf_fijo: 1,
      peso_ancla: 18,
      diametro_cadena: 8,
      diametro_estacha: 12,
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
  const hecho = (fecha2, horas, tareas, descripcion, quien) => tareas.map((tareaId) => ({
    id: nuevoId("trb"),
    fecha: fecha2,
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
  return new Promise((resolver2, rechazar) => {
    peticion.onsuccess = () => resolver2(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
}
function abrir() {
  if (conexion !== void 0) return conexion;
  conexion = new Promise((resolver2, rechazar) => {
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
    peticion.onsuccess = () => resolver2(peticion.result);
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
async function leerFoto(clave) {
  return transaccion(
    ALMACEN_FOTOS,
    "readonly",
    (a) => a.get(clave)
  );
}
async function borrarFoto(clave) {
  await transaccion(ALMACEN_FOTOS, "readwrite", (a) => a.delete(clave));
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
  const [bloque2, punto2] = codigo.split(".");
  if (bloque2 === void 0 || punto2 === void 0) return null;
  if (bloque2 === "99") return null;
  const nb = String(Number(bloque2));
  return punto2 === "00" ? nb : `${nb}.${Number(punto2)}`;
}
function cambioEnFicha(campo2, valor2) {
  if (campo2.modelo === "embarcacion.anclaAltoPoderAgarre") {
    const tipo = valor2 === "S\xED" ? "si" : valor2 === "No" ? "no" : void 0;
    return { anclaAltoPoderAgarre: tipo };
  }
  return void 0;
}

// src/guion.ts
var BLOQUES_SOLO_VELA = /* @__PURE__ */ new Set(["03"]);
function puedeLlevarAparejo(embarcacion) {
  return embarcacion.propulsion !== "motor";
}
function bloquesEnSeco(catalogoAnexo) {
  const seco = /* @__PURE__ */ new Set();
  for (const bloque2 of catalogoAnexo.bloques) {
    if (bloque2.requiere_seco) seco.add(bloque2.codigo);
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
    const bloque2 = {
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
      omitidos.push({ ...bloque2, omitidoPorque: "Embarcaci\xF3n sin aparejo" });
      continue;
    }
    if (requiereSeco && !enSeco) {
      omitidos.push({
        ...bloque2,
        omitidoPorque: "Requiere varada y este reconocimiento no es en seco"
      });
      continue;
    }
    incluidos.push(bloque2);
  }
  const totalComprobaciones = incluidos.reduce(
    (n, b) => n + b.puntos.reduce((m2, p) => m2 + p.comprobaciones.length, 0),
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
var GRAVE_POR_CRITERIO_PUNTO = {
  "1.9": "Los cadenotes sostienen la jarcia: desgaste, corrosi\xF3n, da\xF1o en su fijaci\xF3n al casco o tornillos flojos (1.9.a, c y d) se califican graves, como la jarcia. Si el defecto es solo la estanqueidad del paso por cubierta (1.9.b), se propone leve (criterio del autor, 23/09/2026, pendiente de confirmar con el director)."
};
function proponerGravedad(puntoId) {
  const codigo = /^\d{2}\.\d{2}$/.test(puntoId) ? correspondenciaAnexoII(puntoId) : puntoId;
  if (codigo === null) return { grave: false };
  const bloque2 = codigo.split(".")[0] ?? "";
  const letra = LETRA_POR_PUNTO[codigo] ?? LETRA_POR_BLOQUE[bloque2];
  if (letra !== void 0) return { grave: true, letra, supuesto: DEFICIENCIAS_GRAVES[letra] };
  const criterio = GRAVE_POR_CRITERIO_PUNTO[codigo] ?? GRAVE_POR_CRITERIO[bloque2];
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
  for (const bloque2 of anexo.bloques) {
    const citaBloque = `RD 1434/1999, Anexo II, bloque ${bloque2.codigo} (${bloque2.titulo})`;
    if (bloque2.puntos.length === 0) {
      const propuesta = proponerGravedad(bloque2.codigo);
      entradas.push({
        id: `RD1434-AIII-bloque-${bloque2.codigo}`,
        cita: citaBloque,
        vigenciaDesde: VIGENCIA_RD1434,
        vigenciaHasta: null,
        cuando: { bloqueAnexoII: { codigo: bloque2.codigo, titulo: bloque2.titulo } },
        entonces: consecuencia(propuesta),
        explicacion: textoPropuesta(propuesta)
      });
      continue;
    }
    for (const punto2 of bloque2.puntos) {
      const propuesta = proponerGravedad(punto2.codigo);
      entradas.push({
        id: `RD1434-AIII-punto-${punto2.codigo}`,
        cita: `${citaBloque}, punto ${punto2.codigo}`,
        vigenciaDesde: VIGENCIA_RD1434,
        vigenciaHasta: null,
        cuando: { puntoAnexoII: { codigo: punto2.codigo, titulo: punto2.titulo } },
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
function siguienteSinResponder(guion, hallazgos, desde) {
  const puntos = puntosDe(guion).map((p) => p.codigo);
  const i = puntos.indexOf(desde);
  const pendiente = (c) => hallazgos[c] === void 0;
  return puntos.slice(i + 1).find(pendiente) ?? puntos.slice(0, Math.max(i, 0)).find(pendiente);
}
function avanceDeBloque(bloque2, hallazgos) {
  const respondidos = bloque2.puntos.filter((p) => hallazgos[p.codigo] !== void 0).length;
  return { respondidos, total: bloque2.puntos.length };
}
function calcularResultado(hallazgos, fechaInspeccion) {
  const lista3 = Object.values(hallazgos);
  const noConformes = lista3.filter((h2) => h2.resultado === "no_conforme");
  const deficienciasGraves = noConformes.filter((h2) => h2.gravedad === "grave");
  const deficienciasLeves = noConformes.filter((h2) => h2.gravedad !== "grave");
  const noAccesibles = lista3.filter((h2) => h2.resultado === "no_accesible");
  const favorable = deficienciasGraves.length === 0;
  return {
    favorable,
    deficienciasGraves,
    deficienciasLeves,
    noAccesibles,
    ...favorable ? {} : { limiteSubsanacion: limiteSubsanacion(fechaInspeccion) }
  };
}
function veredicto(resultado2, avance) {
  if (!resultado2.favorable) return "desfavorable";
  return avance.completo ? "favorable" : "pendiente";
}
function textoVeredicto(v, avance) {
  if (v === "favorable") return "FAVORABLE";
  if (v === "desfavorable") return "DESFAVORABLE";
  return `PENDIENTE \u2014 faltan ${avance.pendientes.length} de ${avance.total} puntos por responder`;
}
function firmar(inspeccion, resultado2) {
  return {
    ...inspeccion,
    estado: resultado2.favorable ? "firmada_favorable" : "firmada_desfavorable",
    firmadaEn: (/* @__PURE__ */ new Date()).toISOString(),
    ...resultado2.limiteSubsanacion !== void 0 ? { limiteSubsanacion: resultado2.limiteSubsanacion } : {},
    actualizadaEn: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/texto.ts
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
  const [a, m2, d] = iso.split("-").map(Number);
  if (a === void 0 || m2 === void 0 || d === void 0) return iso;
  return `${d} de ${MESES[m2 - 1]} de ${a}`;
}
function cuenta(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}
function mayuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
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
function formularioEquipamiento(embarcacion, alCambiar, equiposDA2 = []) {
  const marcados = embarcacion.equiposFOM1144 ?? [];
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
    campo(
      "Ancla de alto poder de agarre",
      selector(
        [
          { valor: "", texto: "No consta" },
          { valor: "si", texto: "S\xED" },
          { valor: "no", texto: "No" }
        ],
        embarcacion.anclaAltoPoderAgarre ?? "",
        (v) => alCambiar({ anclaAltoPoderAgarre: v === "" ? void 0 : v })
      ),
      "Si no lo es, el peso de la tabla del art. 11.4 sube un tercio (art. 11.7). Se anota tambi\xE9n en el punto del fondeo."
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
    ),
    // --- Disposición adicional segunda del RD 339/2021 ---------------------------------
    // Solo los equipos a los que el real decreto añadió algún requisito: a los demás
    // marcarlos no les cambiaría nada. Por omisión, nada marcado, que es lo estricto.
    equiposDA2.length > 0 && h("h3", {}, "Equipo instalado antes de julio de 2021 (DA 2.\xAA)"),
    equiposDA2.length > 0 && h(
      "p",
      { class: "sutil" },
      "Marque el equipo que ya estaba a bordo conforme a la Orden FOM/1144/2003. No se le exigen los requisitos que a\xF1adi\xF3 el RD 339/2021 (disposici\xF3n adicional segunda, apartado 1); sus revisiones s\xED siguen el real decreto (apartado 2). Solo para embarcaciones matriculadas antes del 1 de julio de 2021."
    ),
    ...equiposDA2.map(
      (e) => casilla(
        e.nombre,
        marcados.includes(e.equipo),
        (v) => alCambiar({
          equiposFOM1144: v ? [...marcados.filter((m2) => m2 !== e.equipo), e.equipo] : marcados.filter((m2) => m2 !== e.equipo)
        }),
        `No se le pedir\xEDa: ${e.requisitos.join("; ")}.`
      )
    )
  );
}
var CATEGORIAS = ["A", "B", "C", "D"];
function categoriasDePlaca(embarcacion, alCambiar) {
  const placa = embarcacion.categoriasDiseno ?? [];
  const varias = placa.length > 1;
  const cambiarFila = (i, cambio) => alCambiar({ categoriasDiseno: placa.map((c, j) => j === i ? { ...c, ...cambio } : c) });
  const numero = (valor2, alFijar) => h("input", {
    type: "number",
    min: "0",
    step: "1",
    valor: valor2 ?? "",
    onchange: (e) => {
      const v = Number(e.target.value);
      alFijar(Number.isFinite(v) && v > 0 ? v : void 0);
    }
  });
  return h(
    "div",
    {},
    casilla(
      "La placa trae varias categor\xEDas de dise\xF1o",
      varias,
      (v) => alCambiar({
        categoriasDiseno: v ? [
          { categoria: embarcacion.categoriaDiseno ?? "B", personasMax: 6 },
          { categoria: "C", personasMax: 8 }
        ] : void 0
      }),
      "Cada categor\xEDa lleva su m\xE1ximo de personas y de carga (CT 1/2020). La zona se da por categor\xEDa: \xABapto zona N con hasta X personas\xBB."
    ),
    ...varias ? placa.map(
      (c, i) => h(
        "div",
        { class: "campo fila-placa" },
        selector(
          CATEGORIAS.map((k) => ({ valor: k, texto: `Categor\xEDa ${k}` })),
          c.categoria,
          (v) => cambiarFila(i, { categoria: v })
        ),
        h("span", { class: "sutil" }, " personas "),
        numero(c.personasMax, (v) => cambiarFila(i, { personasMax: v ?? 1 })),
        h("span", { class: "sutil" }, " carga (kg) "),
        numero(c.cargaMaxKg, (v) => {
          const { cargaMaxKg: _, ...resto } = c;
          alCambiar({
            categoriasDiseno: placa.map(
              (x, j) => j === i ? v === void 0 ? resto : { ...resto, cargaMaxKg: v } : x
            )
          });
        }),
        placa.length > 2 && h(
          "button",
          {
            class: "sutil",
            onclick: () => alCambiar({ categoriasDiseno: placa.filter((_, j) => j !== i) })
          },
          "Quitar"
        )
      )
    ) : [],
    varias && h(
      "button",
      {
        class: "sutil",
        onclick: () => alCambiar({ categoriasDiseno: [...placa, { categoria: "D", personasMax: 1 }] })
      },
      "A\xF1adir categor\xEDa"
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
          ...v === "si" ? { zonaCertificada: void 0, categoriaNavegacion: void 0 } : { categoriaDiseno: void 0, categoriasDiseno: void 0 }
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
    ),
    embarcacion.marcadoCE && categoriasDePlaca(embarcacion, alCambiar),
    // Sin marcado CE no hay categoría de diseño: el techo sale del certificado (art. 3.4 y
    // DA 3.ª del RD 339/2021) o, si no consta, de la categoría de navegación antigua con la
    // tabla de la CT 1/2024 de la DGMM. Duda 13 de la segunda hoja (23/09/2026).
    !embarcacion.marcadoCE && campo(
      "Zona del certificado vigente",
      selector(
        [
          { valor: "", texto: "No consta" },
          ...[1, 2, 3, 4, 5, 6, 7].map((z) => ({ valor: String(z), texto: `Zona ${z}` }))
        ],
        embarcacion.zonaCertificada !== void 0 ? String(embarcacion.zonaCertificada) : "",
        (v) => alCambiar({ zonaCertificada: v === "" ? void 0 : Number(v) })
      ),
      "Sin marcado CE, es el techo de zona (art. 3.4 y disposici\xF3n adicional tercera del RD 339/2021)."
    ),
    !embarcacion.marcadoCE && embarcacion.zonaCertificada === void 0 && campo(
      "Categor\xEDa de navegaci\xF3n (ficha antigua)",
      selector(
        [
          { valor: "", texto: "No consta" },
          ...["A", "B", "C", "D-1", "D-2"].map((c) => ({ valor: c, texto: c }))
        ],
        embarcacion.categoriaNavegacion ?? "",
        (v) => alCambiar({
          categoriaNavegacion: v === "" ? void 0 : v
        })
      ),
      "CT 1/2024 de la DGMM: A \u2192 zona 1, B \u2192 2, C \u2192 3, D-1 \u2192 5, D-2 \u2192 6."
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
function textoAvanceBloque(bloque2, hallazgos) {
  const { respondidos, total } = avanceDeBloque(bloque2, hallazgos);
  return `${respondidos}/${total}`;
}
function pintarPunto(punto2, hallazgo, datos, historico, acciones, soloLectura, abierto) {
  const resultado2 = hallazgo?.resultado;
  const propuesta = proponerGravedad(punto2.codigo);
  return h(
    "details",
    {
      class: `punto ${resultado2 ?? "sin-responder"}`,
      // Con qué punto se corresponde este nodo, para poder sustituirlo solo a él.
      "data-punto": punto2.codigo,
      // Abierto solo si es el punto en el que está el inspector. Responder no lo cierra:
      // después de responder es cuando se escribe la observación y se añade la foto.
      open: abierto
    },
    h(
      "summary",
      {
        // El aviso de abrir o cerrar va aquí y no en el `toggle` del <details>: al
        // repintar, TODOS los puntos abiertos disparan `toggle`, y el último —el primero
        // sin responder— se quedaba con el sitio, de modo que el punto recién contestado
        // se cerraba solo. Al pulsar, `open` es todavía el estado anterior.
        onclick: (e) => {
          const detalle = e.currentTarget.parentElement;
          acciones.alAbrirPunto(punto2.codigo, !detalle.open);
        }
      },
      h("span", { class: "punto-codigo" }, punto2.codigo),
      h("span", { class: "punto-titulo" }, punto2.titulo),
      h(
        "span",
        { class: "punto-marca" },
        resultado2 === void 0 ? "\xB7" : resultado2 === "conforme" ? "\u2713" : resultado2 === "no_conforme" ? "\u2717" : resultado2 === "no_aplica" ? "\u2014" : "?"
      )
    ),
    h(
      "div",
      { class: "punto-cuerpo" },
      ...punto2.notas.map((n) => h("p", { class: "punto-nota" }, n)),
      // El punto del Anexo II del que deriva. El inspector trabaja con la hoja de su
      // empresa, pero el acta cita la norma, y aquí se ve el enlace entre las dos.
      punto2.anexoII !== null && h("p", { class: "cita" }, `Anexo II del RD 1434/1999, punto ${punto2.anexoII}`),
      // El texto literal de la norma, delante del inspector.
      punto2.comprobaciones.length > 0 && h(
        "ul",
        { class: "comprobaciones" },
        ...punto2.comprobaciones.map(
          (c) => h("li", {}, h("b", {}, `${c.letra}) `), c.texto)
        )
      ),
      // Las casillas de datos van delante de la botonera: se anotan mientras se mira,
      // antes de decidir si el punto es conforme.
      punto2.campos.length > 0 && h(
        "div",
        { class: "casillas" },
        ...punto2.campos.map(
          (c) => pintarCampo(punto2.codigo, c, datos[c.campo] ?? "", acciones, soloLectura)
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
              class: `opcion ${o.valor} ${resultado2 === o.valor ? "activa" : ""}`,
              // Un acta firmada no se edita (ADR-003). Los controles se deshabilitan
              // además de ignorarse: dejarlos con aspecto de pulsables e ignorar el
              // clic haría creer al inspector que ha registrado algo que no se ha
              // registrado, que es peor que no dejarle pulsar.
              disabled: soloLectura,
              onclick: () => acciones.alResponder(punto2.codigo, o.valor)
            },
            o.texto
          )
        )
      ),
      // Segundo paso, solo si es incorrecto: ¿leve o grave? Dos botones y no una casilla,
      // porque son las dos respuestas posibles y el inspector elige una. La propuesta del
      // sistema llega marcada y se dice de dónde sale; la decisión es del inspector.
      resultado2 === "no_conforme" && h(
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
                onclick: () => acciones.alCambiarGravedad(punto2.codigo, g === "grave")
              },
              g === "leve" ? "Leve" : "Grave",
              (propuesta.grave ? "grave" : "leve") === g ? " \xB7 propuesta" : ""
            )
          )
        ),
        h("p", { class: propuesta.grave ? "cita" : "sutil" }, textoPropuesta(propuesta))
      ),
      (resultado2 === "no_conforme" || resultado2 === "no_accesible" || (hallazgo?.observaciones ?? "") !== "") && h("textarea", {
        class: "observaciones",
        rows: "2",
        disabled: soloLectura,
        placeholder: resultado2 === "no_accesible" ? "Motivo por el que no se ha podido acceder" : "Observaciones",
        valor: hallazgo?.observaciones ?? "",
        oninput: (e) => acciones.alObservar(punto2.codigo, e.target.value)
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
              const entrada2 = e.target;
              const fichero = entrada2.files?.[0];
              if (fichero) acciones.alAnadirFoto(punto2.codigo, fichero);
              entrada2.value = "";
            }
          })
        ),
        (hallazgo?.fotos.length ?? 0) > 0 && h("span", { class: "sutil" }, cuenta(hallazgo?.fotos.length ?? 0, "foto"))
      ),
      // Las fotos, en miniatura. Hasta ahora solo se decía cuántas había, de modo que una
      // foto movida —o del barco de al lado— se quedaba en el acta sin que nadie la viera.
      (hallazgo?.fotos.length ?? 0) > 0 && h(
        "div",
        { class: "miniaturas" },
        ...(hallazgo?.fotos ?? []).map(
          (clave) => miniatura(punto2.codigo, clave, acciones, soloLectura)
        )
      )
    )
  );
}
function miniatura(puntoId, clave, acciones, soloLectura) {
  const img = h("img", {
    alt: `Fotograf\xEDa del punto ${puntoId}`,
    loading: "lazy"
  });
  void acciones.urlDeFoto(clave).then((url) => {
    if (url !== void 0) img.src = url;
  });
  return h(
    "figure",
    { class: "miniatura" },
    img,
    !soloLectura && h(
      "button",
      {
        type: "button",
        class: "quitar-foto",
        title: "Quitar esta foto",
        "aria-label": `Quitar la fotograf\xEDa del punto ${puntoId}`,
        onclick: () => acciones.alBorrarFoto(puntoId, clave)
      },
      "\u2715"
    )
  );
}
function buscadorDeGuion(total) {
  const contador = h("span", { class: "sutil filtro-cuenta" }, `${total} puntos`);
  const aplicar = (texto, soloPendientes2) => {
    const buscado = texto.trim().toLowerCase();
    let visibles = 0;
    for (const nodo of document.querySelectorAll("[data-punto]")) {
      const pendiente = nodo.classList.contains("sin-responder");
      const casa = buscado === "" || (nodo.textContent ?? "").toLowerCase().includes(buscado);
      const visible = casa && (!soloPendientes2 || pendiente);
      nodo.hidden = !visible;
      if (visible) visibles += 1;
    }
    for (const bloque2 of document.querySelectorAll("[data-bloque]")) {
      const alguno = [...bloque2.querySelectorAll("[data-punto]")].some((p) => !p.hidden);
      bloque2.hidden = !alguno;
    }
    contador.textContent = buscado === "" && !soloPendientes2 ? `${total} puntos` : `${visibles} de ${total} puntos`;
  };
  const caja = h("input", {
    type: "search",
    class: "buscar-punto",
    placeholder: "Buscar punto: \xAB02.08\xBB, \xABprensaestopa\xBB, \xABjarcia\xBB\u2026",
    "aria-label": "Buscar un punto del guion"
  });
  const soloPendientes = h("input", { type: "checkbox" });
  const refrescar = () => aplicar(caja.value, soloPendientes.checked);
  caja.addEventListener("input", refrescar);
  soloPendientes.addEventListener("change", refrescar);
  return h(
    "div",
    { class: "filtro-guion" },
    caja,
    h("label", { class: "filtro-pendientes" }, soloPendientes, " Solo los que faltan"),
    contador
  );
}
function pintarGuion(guion, hallazgos, datosPunto, registro, visitaActiva, acciones, soloLectura = false, puntoAbierto) {
  const actual = puntoAbierto ?? puntosDe(guion).find((p) => hallazgos[p.codigo] === void 0)?.codigo;
  return h(
    "div",
    {},
    buscadorDeGuion(puntosDe(guion).length),
    soloLectura && h(
      "p",
      { class: "salvedad" },
      "\u{1F512} Acta firmada. El registro es inalterable: para corregir algo hay que levantar un acta nueva que haga referencia a esta."
    ),
    ...guion.bloques.map(
      (bloque2) => h(
        "section",
        { class: "bloque", "data-bloque": bloque2.codigo },
        h(
          "h2",
          {},
          `${bloque2.codigo}. ${bloque2.titulo}`,
          // Cuánto queda de este bloque. Con el título fijo arriba, acompaña al inspector
          // mientras lo recorre y le dice si puede cerrar la sección o le falta algo.
          h("span", { class: "contador-bloque" }, textoAvanceBloque(bloque2, hallazgos)),
          bloque2.requiereSeco && h("span", { class: "etiqueta" }, "en seco"),
          // La hoja anota en la cabecera de cada bloque la norma de la que cuelga. Es
          // información de la empresa, no del BOE, y merece verse.
          bloque2.normaCitada !== null && h("span", { class: "etiqueta norma" }, bloque2.normaCitada)
        ),
        ...bloque2.puntos.map(
          (p) => pintarPunto(
            p,
            hallazgos[p.codigo],
            datosPunto[p.codigo] ?? {},
            registro.filter((r) => r.puntoId === p.codigo && r.visita !== visitaActiva),
            acciones,
            soloLectura,
            p.codigo === actual
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
  const { fecha: fecha2, horas, fechaEstimada } = l.proxima;
  const partes = [];
  if (horas !== void 0) partes.push(`a las ${horas} h`);
  if (fecha2 !== void 0) partes.push(`el ${fechaLarga(fecha2)}`);
  let texto = partes.length === 2 ? `${partes[0]} o ${partes[1]}, lo que llegue antes` : partes[0] ?? "";
  if (fechaEstimada !== void 0) {
    texto += ` (a este ritmo de uso, hacia el ${fechaLarga(fechaEstimada)})`;
  }
  return texto;
}
function textoUltima(l) {
  if (l.ultimaVez === void 0) return void 0;
  const base2 = l.origen === "inspeccion" ? "Detectada el" : "\xDAltima vez:";
  return `${base2} ${fechaLarga(l.ultimaVez.fecha)}` + (l.ultimaVez.horas !== void 0 ? `, a las ${l.ultimaVez.horas} h` : "");
}
function formularioHecho(l, acciones) {
  let fecha2 = hoy();
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
          valor: fecha2,
          oninput: (e) => {
            fecha2 = e.target.value;
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
              fecha: fecha2,
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
  const lista3 = (lineas) => h("ul", { class: "plan" }, ...lineas.map((l) => pintarLinea(l, acciones)));
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
    urgentes.length > 0 && lista3(urgentes),
    pendientes2.length > 0 && h("h3", {}, `Deficiencias abiertas (${pendientes2.length})`),
    pendientes2.length > 0 && lista3(pendientes2),
    // Lo que no se sabe va plegado: es información, pero no debe tapar lo urgente.
    sinRegistro.length > 0 && h(
      "details",
      {},
      h("summary", {}, `Sin registro (${sinRegistro.length}) \u2014 no consta cu\xE1ndo se hizo`),
      lista3(sinRegistro)
    ),
    alDia.length > 0 && h("details", {}, h("summary", {}, `Al d\xEDa (${alDia.length})`), lista3(alDia))
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
      let fecha2 = hoy();
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
            valor: fecha2,
            oninput: (e) => {
              fecha2 = e.target.value;
            }
          }),
          h(
            "button",
            {
              type: "button",
              onclick: () => {
                const n = Number(horas.replace(",", "."));
                if (horas.trim() === "" || !Number.isFinite(n)) return;
                acciones.alAnotarLectura({ componenteId: c.id, fecha: fecha2, horas: n });
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

// src/vista/guia.ts
var ETIQUETA_CARACTER = {
  obligatorio: "Obligatorio",
  plazo: "Plazos",
  voluntario_norma: "Voluntario \xB7 lo exige la norma para esa zona",
  fabricante: "Lo prescribe el fabricante",
  criterio: "Voluntario \xB7 criterio t\xE9cnico"
};
function punto(p) {
  return h(
    "li",
    { class: `punto-guia${p.urgente ? " urgente" : ""}` },
    h("b", {}, p.titulo),
    p.cuando !== void 0 && h("p", { class: "cuando" }, p.cuando),
    p.detalle !== void 0 && h("p", {}, p.detalle),
    h("div", { class: "cita" }, p.fuente)
  );
}
function seccion(s, n) {
  return h(
    "section",
    { class: `seccion-guia ${s.caracter}` },
    h("h2", {}, `${n}. ${s.titulo}`),
    h("p", { class: "caracter" }, ETIQUETA_CARACTER[s.caracter]),
    h("p", { class: "sutil" }, s.explicacion),
    s.puntos.length === 0 ? h("p", { class: "vacio" }, s.clave === "corregir" ? "No hay deficiencias abiertas." : "Nada que se\xF1alar.") : h("ul", { class: "puntos-guia" }, ...s.puntos.map(punto))
  );
}
function pintarGuia(g) {
  return h(
    "article",
    { class: "guia" },
    h("p", { class: "borrador" }, "BORRADOR \u2014 pendiente de validar con el director del TFG"),
    h("h1", {}, "Gu\xEDa t\xE9cnica de la embarcaci\xF3n"),
    h(
      "p",
      { class: "sutil" },
      `${g.nombre ?? "Embarcaci\xF3n"} \xB7 matr\xEDcula ${g.matricula}` + (g.zonaActual !== void 0 ? ` \xB7 zona ${g.zonaActual} con el equipo comprobado` : "") + ` \xB7 ${fechaLarga(g.fecha)}`
    ),
    g.basadaEn !== void 0 && h(
      "p",
      { class: "sutil" },
      `Elaborada a partir del reconocimiento del ${fechaLarga(g.basadaEn.fecha)}` + (g.basadaEn.numeroInforme !== void 0 ? ` (informe ${g.basadaEn.numeroInforme})` : "") + " y del expediente de mantenimiento."
    ),
    h("p", { class: "aviso-guia" }, g.aviso),
    ...g.secciones.map((s, i) => seccion(s, i + 1)),
    h(
      "p",
      { class: "pie-propietario sutil" },
      "Generada por la aplicaci\xF3n del TFG \xABInspecci\xF3n t\xE9cnica y gesti\xF3n del mantenimiento de embarcaciones de recreo\xBB."
    )
  );
}

// ../itb-estabilidad/src/iges.ts
function leerIges(texto) {
  const lineas = texto.split(/\r?\n/).filter((l) => l.length >= 73);
  const seccion2 = (s) => lineas.filter((l) => l[72] === s);
  const global = seccion2("G").map((l) => l.slice(0, 72)).join("");
  const unidad = unidadGlobal(global);
  const directorio = seccion2("D");
  const parametros = seccion2("P");
  const superficies = [];
  for (let k = 0; k + 1 < directorio.length; k += 2) {
    const linea2 = directorio[k];
    const tipo = Number(linea2.slice(0, 8));
    if (tipo !== 128) continue;
    const matriz2 = Number(linea2.slice(48, 56));
    if (matriz2 !== 0) {
      throw new Error(
        `IGES: la superficie de la l\xEDnea D${k + 1} tiene matriz de transformaci\xF3n; no est\xE1 soportada`
      );
    }
    const secuencia = k + 1;
    superficies.push(superficie128(parametrosDe(parametros, secuencia)));
  }
  return { unidad, superficies };
}
function unidadGlobal(global) {
  const m2 = /\d+H(MM|M|IN|FT|CM|KM|MI|MIL|UM|UIN)[,;]/.exec(global);
  return m2?.[1] ?? "?";
}
function parametrosDe(lineasP, secuencia) {
  const texto = lineasP.filter((l) => Number(l.slice(64, 72)) === secuencia).map((l) => l.slice(0, 64)).join("");
  const cuerpo = texto.split(";")[0] ?? "";
  return cuerpo.split(",").map((s) => Number(s.trim().replace(/D/i, "E")));
}
function superficie128(p) {
  let i = 0;
  const sig = () => {
    const v2 = p[i++];
    if (v2 === void 0 || Number.isNaN(v2)) throw new Error("IGES: par\xE1metros de la entidad 128 incompletos");
    return v2;
  };
  if (sig() !== 128) throw new Error("IGES: se esperaba la entidad 128");
  const k1 = sig(), k2 = sig(), m1 = sig(), m2 = sig();
  for (let n = 0; n < 5; n++) sig();
  const nudosU = Array.from({ length: k1 + m1 + 2 }, sig);
  const nudosV = Array.from({ length: k2 + m2 + 2 }, sig);
  const pesos = Array.from({ length: k1 + 1 }, () => []);
  for (let j = 0; j <= k2; j++) for (let a = 0; a <= k1; a++) pesos[a][j] = sig();
  const control = Array.from({ length: k1 + 1 }, () => []);
  for (let j = 0; j <= k2; j++) {
    for (let a = 0; a <= k1; a++) control[a][j] = [sig(), sig(), sig()];
  }
  const u = [sig(), sig()];
  const v = [sig(), sig()];
  return { gradoU: m1, gradoV: m2, nudosU, nudosV, control, pesos, u, v };
}
function tramo(n, grado, t, nudos) {
  if (t >= nudos[n + 1]) return n;
  if (t <= nudos[grado]) return grado;
  let bajo = grado, alto = n + 1;
  let medio = bajo + alto >> 1;
  while (t < nudos[medio] || t >= nudos[medio + 1]) {
    if (t < nudos[medio]) alto = medio;
    else bajo = medio;
    medio = bajo + alto >> 1;
  }
  return medio;
}
function base(i, t, grado, nudos) {
  const N = [1];
  const izq = [], der = [];
  for (let j = 1; j <= grado; j++) {
    izq[j] = t - nudos[i + 1 - j];
    der[j] = nudos[i + j] - t;
    let resto = 0;
    for (let r = 0; r < j; r++) {
      const tmp = N[r] / (der[r + 1] + izq[j - r]);
      N[r] = resto + der[r + 1] * tmp;
      resto = izq[j - r] * tmp;
    }
    N[j] = resto;
  }
  return N;
}
function evaluar2(s, u, v) {
  const nU = s.control.length - 1;
  const nV = s.control[0].length - 1;
  const iu = tramo(nU, s.gradoU, u, s.nudosU);
  const iv = tramo(nV, s.gradoV, v, s.nudosV);
  const Nu = base(iu, u, s.gradoU, s.nudosU);
  const Nv = base(iv, v, s.gradoV, s.nudosV);
  let x = 0, y = 0, z = 0, w = 0;
  for (let a = 0; a <= s.gradoU; a++) {
    for (let b = 0; b <= s.gradoV; b++) {
      const ii = iu - s.gradoU + a, jj = iv - s.gradoV + b;
      const peso = s.pesos[ii][jj] * Nu[a] * Nv[b];
      const p = s.control[ii][jj];
      x += p[0] * peso;
      y += p[1] * peso;
      z += p[2] * peso;
      w += peso;
    }
  }
  return [x / w, y / w, z / w];
}

// ../itb-estabilidad/src/formas.ts
function poligonoSeccion(s) {
  const estribor = s.puntos;
  const babor = [...estribor].reverse().map(([y, z]) => [-y, z]);
  const cierre = estribor[0] && estribor[0][0] === 0 ? babor.slice(0, -1) : babor;
  return [...estribor, ...cierre];
}
function seccionesDeSuperficies(superficies, abscisas, opciones) {
  return abscisas.map((xm) => {
    const tramos = superficies.map((s) => tramoDeSeccion(s, xm / opciones.escala, opciones)).filter((t) => t.length > 0);
    const puntos = encadenar(tramos);
    if (puntos.length > 0 && puntos[0][0] !== 0) puntos.unshift([0, puntos[0][1]]);
    return { x: xm, puntos };
  });
}
function tramoDeSeccion(superficie, x, opciones) {
  const n = opciones.puntosPorSeccion ?? 60;
  const [u0, u1] = superficie.u;
  const [v0, v1] = superficie.v;
  const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
  const avanceU = Math.abs(evaluar2(superficie, u1, vm)[0] - evaluar2(superficie, u0, vm)[0]);
  const avanceV = Math.abs(evaluar2(superficie, um, v1)[0] - evaluar2(superficie, um, v0)[0]);
  const longitudinalEnV = avanceV >= avanceU;
  const [t0, t1] = longitudinalEnV ? [u0, u1] : [v0, v1];
  const [s0, s1] = longitudinalEnV ? [v0, v1] : [u0, u1];
  const punto2 = (t, s) => longitudinalEnV ? evaluar2(superficie, t, s) : evaluar2(superficie, s, t);
  const puntos = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * (0.5 - 0.5 * Math.cos(Math.PI * i / n));
    const s = corte((ss) => punto2(t, ss)[0] - x, s0, s1);
    if (s === void 0) continue;
    const p = punto2(t, s);
    puntos.push([Math.abs(p[1]) * opciones.escala, p[2] * opciones.escala]);
  }
  return puntos;
}
function encadenar(tramos) {
  if (tramos.length === 0) return [];
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const quilla = (t) => Math.min(...[t[0], t[t.length - 1]].map(([y, z]) => y * 1e3 + z));
  const pendientes2 = [...tramos].sort((a, b) => quilla(a) - quilla(b));
  const primero = pendientes2.shift();
  if (primero[0][0] > primero[primero.length - 1][0]) primero.reverse();
  const contorno = [...primero];
  while (pendientes2.length > 0) {
    const fin = contorno[contorno.length - 1];
    let mejor = 0, invertir = false, dist = Infinity;
    pendientes2.forEach((t2, i) => {
      const a = d(fin, t2[0]), b = d(fin, t2[t2.length - 1]);
      if (a < dist) {
        dist = a;
        mejor = i;
        invertir = false;
      }
      if (b < dist) {
        dist = b;
        mejor = i;
        invertir = true;
      }
    });
    const t = pendientes2.splice(mejor, 1)[0];
    if (invertir) t.reverse();
    contorno.push(...d(fin, t[0]) < 1e-9 ? t.slice(1) : t);
  }
  return contorno;
}
function corte(f, a, b) {
  let fa = f(a);
  if (fa * f(b) > 0) return void 0;
  for (let k = 0; k < 50; k++) {
    const m2 = (a + b) / 2;
    const fm = f(m2);
    if (fa * fm <= 0) b = m2;
    else {
      a = m2;
      fa = fm;
    }
  }
  return (a + b) / 2;
}
function densificar(formas, porIntervalo, puntos = 41) {
  const ss = [...formas.secciones].filter((s) => s.puntos.length >= 2).sort((a, b) => a.x - b.x);
  if (ss.length < 3) return formas;
  const remuestreadas = ss.map((s) => remuestrear(s.puntos, puntos));
  const xs = ss.map((s) => s.x);
  const splines = Array.from({ length: puntos }, (_, k) => ({
    y: splineNatural(xs, remuestreadas.map((p) => p[k][0])),
    z: splineNatural(xs, remuestreadas.map((p) => p[k][1]))
  }));
  const nuevas = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    for (let j = 0; j < porIntervalo; j++) {
      const x = xs[i] + (xs[i + 1] - xs[i]) * j / porIntervalo;
      nuevas.push({ x, puntos: splines.map((s) => [Math.max(0, s.y(x)), s.z(x)]) });
    }
  }
  nuevas.push({ x: xs.at(-1), puntos: remuestreadas.at(-1) });
  return { ...formas, fuente: `${formas.fuente}; alisadas con splines (${porIntervalo} por intervalo)`, secciones: nuevas };
}
function remuestrear(p, n) {
  const L = [0];
  for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  const total = L.at(-1);
  if (total === 0) return Array.from({ length: n }, () => p[0]);
  return Array.from({ length: n }, (_, k) => {
    const s = total * k / (n - 1);
    let i = 1;
    while (i < p.length - 1 && L[i] < s) i++;
    const t = (s - L[i - 1]) / (L[i] - L[i - 1] || 1);
    return [p[i - 1][0] + t * (p[i][0] - p[i - 1][0]), p[i - 1][1] + t * (p[i][1] - p[i - 1][1])];
  });
}
function splineNatural(x, y) {
  const n = x.length;
  const h2 = x.slice(1).map((v, i) => v - x[i]);
  const a = new Array(n).fill(0), b = new Array(n).fill(1), c = new Array(n).fill(0), d = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    a[i] = h2[i - 1];
    b[i] = 2 * (h2[i - 1] + h2[i]);
    c[i] = h2[i];
    d[i] = 6 * ((y[i + 1] - y[i]) / h2[i] - (y[i] - y[i - 1]) / h2[i - 1]);
  }
  const m2 = new Array(n).fill(0);
  const cp = new Array(n).fill(0), dp = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const den = b[i] - a[i] * cp[i - 1];
    cp[i] = c[i] / den;
    dp[i] = (d[i] - a[i] * dp[i - 1]) / den;
  }
  for (let i = n - 2; i >= 1; i--) m2[i] = dp[i] - cp[i] * m2[i + 1];
  return (t) => {
    let i = 0;
    while (i < n - 2 && t > x[i + 1]) i++;
    const hi = h2[i], u = t - x[i], w = x[i + 1] - t;
    return (m2[i] * w ** 3 + m2[i + 1] * u ** 3) / (6 * hi) + (y[i] / hi - m2[i] * hi / 6) * w + (y[i + 1] / hi - m2[i + 1] * hi / 6) * u;
  };
}

// ../itb-estabilidad/src/hidrostatica.ts
function normal2(f) {
  const { escora: p, trimado: t } = f;
  return [-Math.sin(t), -Math.cos(t) * Math.sin(p), Math.cos(t) * Math.cos(p)];
}
function carena(formas, f) {
  const sT = Math.sin(f.trimado), cT = Math.cos(f.trimado);
  const sP = Math.sin(f.escora), cP = Math.cos(f.escora);
  const plano = (x) => (f.c + x * sT) / cT;
  const cortar = (x, pol) => {
    const k = plano(x);
    const { area, cy, cz } = areaYCentro(recortar(pol, -sP, cP, k));
    let prof = 0;
    for (const [y, z] of pol) prof = Math.max(prof, k - (z * cP - y * sP));
    return { x, area, cy, cz, cuerda: longitudDentro(pol, -sP, cP, k), prof };
  };
  const datos = formas.secciones.map((s) => cortar(s.x, poligonoSeccion(s)));
  const suma = integrar(datos);
  let caladoTotal = Math.max(0, ...datos.map((d) => d.prof));
  for (const cuerpo of formas.cuerpos ?? []) {
    const d = cuerpo.secciones.map((s) => cortar(s.x, s.poligono));
    const parcial = integrar(d);
    for (const k of Object.keys(suma)) suma[k] += parcial[k];
    caladoTotal = Math.max(caladoTotal, ...d.filter((q) => q.area > 0).map((q) => q.prof));
  }
  const { V, Mx, My, Mz, Aw, MAw } = suma;
  const mojadas = datos.filter((d) => d.cuerda > 0);
  const extremos = [
    extremo(datos, "popa"),
    extremo(datos, "proa")
  ];
  return {
    volumen: V,
    centro: V > 0 ? [Mx / V, My / V, Mz / V] : [0, 0, 0],
    areaFlotacion: Aw / cT,
    xCentroFlotacion: Aw > 0 ? MAw / Aw : 0,
    esloraFlotacion: (extremos[1] - extremos[0]) / cT,
    extremosFlotacion: extremos,
    mangaFlotacion: Math.max(0, ...mojadas.map((d) => d.cuerda)),
    calado: Math.max(0, ...datos.map((d) => d.prof)),
    caladoTotal,
    areaMaestra: Math.max(0, ...datos.map((d) => d.area))
  };
}
function integrar(datos) {
  let V = 0, Mx = 0, My = 0, Mz = 0, Aw = 0, MAw = 0;
  const producto = (a0, a1, c0, c1, dx) => dx * (2 * a0 * c0 + a0 * c1 + a1 * c0 + 2 * a1 * c1) / 6;
  for (let i = 0; i + 1 < datos.length; i++) {
    const a = datos[i], b = datos[i + 1];
    const dx = b.x - a.x;
    V += (a.area + b.area) / 2 * dx;
    Mx += producto(a.area, b.area, a.x, b.x, dx);
    const [ay, az] = a.area > 0 ? [a.cy, a.cz] : [b.cy, b.cz];
    const [by, bz] = b.area > 0 ? [b.cy, b.cz] : [a.cy, a.cz];
    My += producto(a.area, b.area, ay, by, dx);
    Mz += producto(a.area, b.area, az, bz, dx);
    Aw += (a.cuerda + b.cuerda) / 2 * dx;
    MAw += producto(a.cuerda, b.cuerda, a.x, b.x, dx);
  }
  return { V, Mx, My, Mz, Aw, MAw };
}
function extremo(datos, lado) {
  const orden = lado === "proa" ? [...datos].reverse() : datos;
  const i = orden.findIndex((d) => d.cuerda > 0);
  if (i < 0) return 0;
  const mojada = orden[i];
  if (i === 0) return mojada.x;
  const seca = orden[i - 1];
  const interior = orden[i + 1];
  if (interior === void 0 || interior.cuerda <= mojada.cuerda) return mojada.x;
  const pendiente = (interior.cuerda - mojada.cuerda) / (interior.x - mojada.x);
  const x0 = mojada.x - mojada.cuerda / pendiente;
  return lado === "proa" ? Math.min(x0, seca.x) : Math.max(x0, seca.x);
}
function recortar(pol, a, b, k) {
  const dentro = (p) => a * p[0] + b * p[1] < k;
  const corte2 = (p, q) => {
    const fp = a * p[0] + b * p[1] - k, fq = a * q[0] + b * q[1] - k;
    const t = fp / (fp - fq);
    return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
  };
  const salida = [];
  for (let i = 0; i < pol.length; i++) {
    const p = pol[i], q = pol[(i + 1) % pol.length];
    if (dentro(p)) {
      salida.push(p);
      if (!dentro(q)) salida.push(corte2(p, q));
    } else if (dentro(q)) {
      salida.push(corte2(p, q));
    }
  }
  return salida;
}
function areaYCentro(pol) {
  let A = 0, Sy = 0, Sz = 0;
  for (let i = 0; i < pol.length; i++) {
    const [y0, z0] = pol[i], [y1, z1] = pol[(i + 1) % pol.length];
    const cruz = y0 * z1 - y1 * z0;
    A += cruz;
    Sy += (y0 + y1) * cruz;
    Sz += (z0 + z1) * cruz;
  }
  if (Math.abs(A) < 1e-15) return { area: 0, cy: 0, cz: 0 };
  return { area: Math.abs(A) / 2, cy: Sy / (3 * A), cz: Sz / (3 * A) };
}
function longitudDentro(pol, a, b, k) {
  const ts = [];
  for (let i = 0; i < pol.length; i++) {
    const p = pol[i], q = pol[(i + 1) % pol.length];
    const fp = a * p[0] + b * p[1] - k, fq = a * q[0] + b * q[1] - k;
    if (fp < 0 && fq >= 0 || fp >= 0 && fq < 0) {
      const t = fp / (fp - fq);
      const y = p[0] + t * (q[0] - p[0]), z = p[1] + t * (q[1] - p[1]);
      ts.push(b * y - a * z);
    }
  }
  ts.sort((m2, n) => m2 - n);
  let L = 0;
  for (let i = 0; i + 1 < ts.length; i += 2) L += ts[i + 1] - ts[i];
  return L;
}
function equilibrio(formas, cond, escora, inicio) {
  if (inicio !== void 0) {
    try {
      return equilibrioDesde(formas, cond, escora, inicio.c, inicio.trimado);
    } catch {
    }
  }
  return equilibrioDesde(formas, cond, escora, calarSinTrimado(formas, cond.volumen, escora), 0);
}
function calarSinTrimado(formas, volumen, escora) {
  const [zMin, zMax] = alturasExtremas(formas);
  const alcance = Math.hypot(zMax - zMin, ...formas.secciones.map((s) => Math.abs(s.x)));
  let lo = -alcance, hi = alcance;
  let c = (lo + hi) / 2;
  for (let k = 0; k < 100; k++) {
    const car = carena(formas, { escora, trimado: 0, c });
    const r = car.volumen - volumen;
    if (Math.abs(r) <= 1e-11 * volumen) return c;
    if (r < 0) lo = c;
    else hi = c;
    const newton = car.areaFlotacion > 1e-12 ? c - r / car.areaFlotacion : NaN;
    c = newton > lo && newton < hi ? newton : (lo + hi) / 2;
    if (hi - lo < 1e-12) return c;
  }
  return c;
}
function equilibrioDesde(formas, cond, escora, c0, t0) {
  let c = c0, t = t0;
  const residuo = (cc, tt) => {
    const f = { escora, trimado: tt, c: cc };
    const car2 = carena(formas, f);
    const ex2 = ejeLongitudinal(f);
    const bg2 = [car2.centro[0] - cond.g[0], car2.centro[1] - cond.g[1], car2.centro[2] - cond.g[2]];
    return [(car2.volumen - cond.volumen) / cond.volumen, dot(bg2, ex2), car2];
  };
  const h2 = 1e-6;
  for (let it = 0; it < 40; it++) {
    const [r1, r2] = residuo(c, t);
    if (Math.abs(r1) < 1e-7 && Math.abs(r2) < 1e-6) break;
    const [a1, a2] = residuo(c + h2, t);
    const [b1, b2] = residuo(c, t + h2);
    const J = [[(a1 - r1) / h2, (b1 - r1) / h2], [(a2 - r2) / h2, (b2 - r2) / h2]];
    const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    if (Math.abs(det) < 1e-14) throw new Error(`equilibrio: jacobiano singular a ${grados(escora)}\xB0`);
    let dc = (-r1 * J[1][1] + r2 * J[0][1]) / det;
    let dt = (-r2 * J[0][0] + r1 * J[1][0]) / det;
    const lim = 0.05;
    if (Math.abs(dt) > lim) {
      dc *= lim / Math.abs(dt);
      dt = Math.sign(dt) * lim;
    }
    c += dc;
    t += dt;
    if (it === 39) {
      throw new Error(`equilibrio: no converge a ${grados(escora)}\xB0 (residuos ${r1.toExponential(1)}, ${r2.toExponential(1)})`);
    }
  }
  const flotacion = { escora, trimado: t, c };
  const car = carena(formas, flotacion);
  const n = normal2(flotacion);
  const ex = ejeLongitudinal(flotacion);
  const transversal = cross(n, ex);
  const bg = [car.centro[0] - cond.g[0], car.centro[1] - cond.g[1], car.centro[2] - cond.g[2]];
  return { flotacion, carena: car, gz: dot(bg, transversal) };
}
function ejeLongitudinal(f) {
  const n = normal2(f);
  const v = [1 - n[0] * n[0], -n[0] * n[1], -n[0] * n[2]];
  const m2 = Math.hypot(...v);
  return [v[0] / m2, v[1] / m2, v[2] / m2];
}
function alturasExtremas(formas) {
  let lo = Infinity, hi = -Infinity;
  for (const s of formas.secciones) for (const [, z] of s.puntos) {
    lo = Math.min(lo, z);
    hi = Math.max(hi, z);
  }
  return [lo, hi];
}
var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
var grados = (r) => r * 180 / Math.PI;
var radianes = (g) => g * Math.PI / 180;

// ../itb-estabilidad/src/estabilidad.ts
function curvaGZ(formas, cond, opciones = {}) {
  const paso = opciones.paso ?? 5;
  const hasta = opciones.hasta ?? 180;
  const puntos = [];
  const flotaciones = [];
  let previa;
  for (let e = 0; e <= hasta + 1e-9; e += paso) {
    const eq = equilibrio(formas, cond, radianes(e), previa);
    previa = eq.flotacion;
    flotaciones.push(eq.flotacion);
    puntos.push({ escora: e, gz: eq.gz, trimado: grados(eq.flotacion.trimado) });
  }
  const d = radianes(0.5);
  const gmPendiente = equilibrio(formas, cond, d, flotaciones[0]).gz / d;
  let iMax = 0;
  puntos.forEach((p, i) => {
    if (p.gz > puntos[iMax].gz) iMax = i;
  });
  let gzMax = puntos[iMax].gz, escoraGzMax = puntos[iMax].escora;
  const a = puntos[iMax - 1], c = puntos[iMax + 1];
  if (a && c) {
    const den = a.gz - 2 * gzMax + c.gz;
    if (den < 0) {
      const t = 0.5 * (a.gz - c.gz) / den;
      escoraGzMax += t * paso;
      gzMax -= 0.25 * (a.gz - c.gz) * t;
    }
  }
  let avs;
  for (let i = iMax; i + 1 < puntos.length; i++) {
    if (puntos[i].gz > 0 && puntos[i + 1].gz <= 0) {
      let lo = puntos[i].escora, hi = puntos[i + 1].escora;
      const cerca = flotaciones[i];
      for (let k = 0; k < 30; k++) {
        const m2 = (lo + hi) / 2;
        if (equilibrio(formas, cond, radianes(m2), cerca).gz > 0) lo = m2;
        else hi = m2;
      }
      avs = (lo + hi) / 2;
      break;
    }
  }
  return { puntos, gmPendiente, gzMax, escoraGzMax, avs };
}
function areaBajoCurva(curva, hasta) {
  const pts = curva.puntos.filter((p) => p.escora <= hasta + 1e-9);
  if (pts.length < 2) return 0;
  const h2 = radianes(pts[1].escora - pts[0].escora);
  const n = pts.length - 1;
  const pares = n - n % 2;
  let area = 0;
  for (let i = 0; i + 2 <= pares; i += 2) {
    area += h2 / 3 * (pts[i].gz + 4 * pts[i + 1].gz + pts[i + 2].gz);
  }
  if (n % 2 === 1) area += h2 / 2 * (pts[n - 1].gz + pts[n].gz);
  const ultimo = pts[n];
  if (hasta > ultimo.escora) {
    const sig = curva.puntos.find((p) => p.escora > ultimo.escora);
    if (sig) {
      const t = (hasta - ultimo.escora) / (sig.escora - ultimo.escora);
      const gzH = ultimo.gz + t * (sig.gz - ultimo.gz);
      area += radianes(hasta - ultimo.escora) * (ultimo.gz + gzH) / 2;
    }
  }
  return area;
}
function metacentroTransversal(formas, cond) {
  const eq = equilibrio(formas, cond, 0);
  const { c, trimado } = eq.flotacion;
  const semimangas = formas.secciones.map((s) => {
    const k = (c + s.x * Math.sin(trimado)) / Math.cos(trimado);
    return { x: s.x, b: 2 * semimangaA(s.puntos, k) };
  });
  let I = 0;
  for (let i = 0; i + 1 < semimangas.length; i++) {
    const a = semimangas[i], b = semimangas[i + 1];
    I += (a.b ** 3 + b.b ** 3) / 24 * (b.x - a.x);
  }
  const kb = eq.carena.centro[2];
  const bm = I / eq.carena.volumen;
  return { kb, bm, km: kb + bm };
}
function semimangaA(puntos, z) {
  let y = 0;
  for (let i = 0; i + 1 < puntos.length; i++) {
    const [y0, z0] = puntos[i], [y1, z1] = puntos[i + 1];
    if ((z0 - z) * (z1 - z) <= 0 && z0 !== z1) y = Math.max(y, y0 + (z - z0) / (z1 - z0) * (y1 - y0));
  }
  return y;
}
function angulosInundacion(formas, cond, aberturas, hasta = 180) {
  const altura = (eq, a) => {
    const n = normal2(eq.flotacion);
    return n[0] * a.x + n[1] * a.y + n[2] * a.z - eq.flotacion.c;
  };
  const marcha = [];
  let previa;
  const pendientes2 = new Set(aberturas.map((_, i) => i));
  for (let e = 0; e <= hasta && pendientes2.size > 0; e += 5) {
    const eq = equilibrio(formas, cond, radianes(e), previa);
    previa = eq.flotacion;
    marcha.push({ escora: e, eq });
    for (const i of [...pendientes2]) if (altura(eq, aberturas[i]) <= 0) pendientes2.delete(i);
  }
  return aberturas.map((a) => {
    const j = marcha.findIndex((m2) => altura(m2.eq, a) <= 0);
    if (j < 0) return { abertura: a.nombre, escora: void 0 };
    if (j === 0) return { abertura: a.nombre, escora: 0 };
    let lo = marcha[j - 1].escora, hi = marcha[j].escora;
    const cerca = marcha[j - 1].eq.flotacion;
    for (let k = 0; k < 25; k++) {
      const m2 = (lo + hi) / 2;
      if (altura(equilibrio(formas, cond, radianes(m2), cerca), a) > 0) lo = m2;
      else hi = m2;
    }
    return { abertura: a.nombre, escora: (lo + hi) / 2 };
  });
}

// ../itb-estabilidad/src/iso12217.ts
var CATEGORIAS2 = ["A", "B", "C", "D"];
var acotar = (v, min, max) => Math.min(max, Math.max(min, v));
var aGrados = (rad) => rad * 180 / Math.PI;
var eslorasBS = (LWL, LH) => (2 * LWL + LH) / 3;
function gzA(curva, escora) {
  const p = curva.puntos;
  for (let i = 0; i + 1 < p.length; i++) {
    const a = p[i], b = p[i + 1];
    if (escora >= a.escora && escora <= b.escora) {
      return a.gz + (escora - a.escora) / (b.escora - a.escora) * (b.gz - a.gz);
    }
  }
  throw new Error(`GZ fuera de la curva a ${escora}\xB0`);
}
function areaGZ(curva) {
  if (curva.avs === void 0) throw new Error("la curva no tiene \xE1ngulo de estabilidad nula");
  return aGrados(areaBajoCurva(curva, curva.avs));
}
function factorFDS(AGZ, LH) {
  return acotar(AGZ / (15.81 * Math.sqrt(LH)), 0.5, 1.5);
}
function factorFIR(phiV, m2) {
  const v = m2 < 4e4 ? phiV / (125 - m2 / 1600) : phiV / 100;
  return acotar(v, 0.4, 1.5);
}
function factorFKR(GZ90, m2, AS, hCE, phiV) {
  if (phiV < 90) return 0.5;
  const FR = GZ90 * m2 / (2 * AS * hCE);
  const v = FR >= 1.5 ? 0.875 + 0.0833 * FR : 0.5 + 0.333 * FR;
  return acotar(v, 0.5, 1.5);
}
function factorFDL(m2, LBS) {
  const FL = (LBS / 11) ** 0.2;
  const v = Math.sqrt(0.6 + 15 * m2 * FL / (LBS ** 3 * (333 - 8 * LBS)));
  return acotar(v, 0.75, 1.25);
}
function factorFBD(BH, BWL, m2) {
  const FB = 3.3 * BH / Math.cbrt(0.03 * m2);
  let v;
  if (FB > 2.2) v = Math.sqrt(13.31 * BWL / (BH * FB ** 3));
  else if (FB < 1.45) v = Math.sqrt(BWL * FB ** 2 / (1.682 * BH));
  else v = 1.118 * Math.sqrt(BWL / BH);
  return acotar(v, 0.75, 1.25);
}
function factorFWM(cond, barco2) {
  const phiDW = minimoAngulo([cond.phiDC, cond.phiDH]);
  if (phiDW === "sin-calcular") return { valor: 0.5 };
  if (phiDW === "no-hay" || phiDW >= 90) return { valor: 1 };
  const GZD = gzA(cond.curva, phiDW);
  const cos = Math.abs(Math.cos(phiDW * Math.PI / 180));
  const vAW = Math.sqrt(13 * cond.m * GZD / (barco2.AS * (barco2.hCE + barco2.hLP) * cos ** 1.3));
  return { valor: acotar(vAW / 17, 0.5, 1), vAW };
}
function factorFDF(cond, phiV) {
  const phi = minimoAngulo([cond.phiDC, cond.phiDH, cond.phiDA]);
  if (phi === "sin-calcular") return 0.5;
  const phiDF = phi === "no-hay" ? phiV : Math.min(phi, phiV);
  return acotar(phiDF / 90, 0.5, 1.25);
}
function minimoAngulo(angulos) {
  if (angulos.some((a) => a === void 0)) return "sin-calcular";
  const nums = angulos.filter((a) => typeof a === "number");
  return nums.length === 0 ? "no-hay" : Math.min(...nums);
}
function stix(cond, barco2) {
  const phiV = cond.curva.avs;
  if (phiV === void 0) throw new Error("STIX: la curva no llega al \xE1ngulo de estabilidad nula");
  const AGZ = areaGZ(cond.curva);
  const LBS = eslorasBS(cond.LWL, barco2.LH);
  const wm = factorFWM(cond, barco2);
  const factores = {
    FDS: factorFDS(AGZ, barco2.LH),
    FIR: factorFIR(phiV, cond.m),
    FKR: factorFKR(gzA(cond.curva, 90), cond.m, barco2.AS, barco2.hCE, phiV),
    FDL: factorFDL(cond.m, LBS),
    FBD: factorFBD(barco2.BH, cond.BWL, cond.m),
    FWM: wm.valor,
    FDF: factorFDF(cond, phiV)
  };
  const producto = Object.values(factores).reduce((a, b) => a * b, 1);
  return {
    condicion: cond.nombre,
    factores,
    AGZ,
    LBS,
    ...wm.vAW !== void 0 ? { vAW: wm.vAW } : {},
    stix: (7 + 2.25 * LBS) * Math.sqrt(producto)
  };
}
var STIX_REQUERIDO = { A: 32, B: 23, C: 14, D: 5 };
var INUNDACION_REQUERIDA = { A: 40, B: 40, C: 35, D: 30 };
function avsRequerido(cat, m2) {
  switch (cat) {
    case "A":
      return Math.max(130 - 2e-3 * m2, 100);
    case "B":
      return Math.max(130 - 5e-3 * m2, 95);
    case "C":
      return 90;
    case "D":
      return 75;
  }
}
var ENERGIA_REQUERIDA = { A: 172e3, B: 57e3 };
var LIMITES_ALTURA = {
  A: [0.5, 1.41],
  B: [0.4, 1.41],
  C: [0.3, 0.75],
  D: [0.2, 0.4]
};
function alturaInundacionRequerida(a, barco2, cat, F5 = 1) {
  const { LH, BH, VD, FM } = barco2;
  const H1 = LH / 15;
  const F1 = a.yD === 0 ? 1 : acotar(Math.max(1 - a.xD / LH, 1 - a.yD / BH), 0.5, 1);
  const F2 = a.areaMm2 >= (30 * LH) ** 2 ? 1 : acotar(1 + a.xDproa / LH * (Math.sqrt(a.areaMm2) / (75 * LH) - 0.4), 0.6, 1);
  let F3 = 1;
  if (a.receso?.tipo === "achique-rapido") F3 = 0.7;
  else if (a.receso?.tipo === "estanco") F3 = Math.min(1.2, 0.7 + Math.sqrt(a.receso.volumen / (LH * BH * FM)));
  const F4 = Math.cbrt(10 * VD / (LH * BH ** 2));
  const [min, max] = LIMITES_ALTURA[cat];
  return acotar(H1 * F1 * F2 * F3 * F4 * F5, min, max);
}
function evaluar3(barco2, condiciones, alturas) {
  const stixes = condiciones.map((c) => stix(c, barco2));
  const mo = condiciones.find((c) => c.nombre === "m\xEDnima operaci\xF3n");
  const porCategoria = {};
  for (const cat of CATEGORIAS2) {
    const lista3 = [];
    condiciones.forEach((c, i) => {
      const phiV = c.curva.avs ?? 0;
      lista3.push({
        requisito: "\xC1ngulo de estabilidad nula",
        apartado: "6.5.2, tabla 5",
        condicion: c.nombre,
        valor: phiV,
        exigido: avsRequerido(cat, c.m),
        cumple: phiV >= avsRequerido(cat, c.m)
      });
      lista3.push({
        requisito: "STIX",
        apartado: "6.6.9, tabla 6",
        condicion: c.nombre,
        valor: stixes[i].stix,
        exigido: STIX_REQUERIDO[cat],
        cumple: stixes[i].stix > STIX_REQUERIDO[cat]
      });
      if (c.phiD !== void 0) {
        lista3.push({
          requisito: "\xC1ngulo de inundaci\xF3n",
          apartado: "6.2.3, tabla 3",
          condicion: c.nombre,
          valor: c.phiD,
          exigido: INUNDACION_REQUERIDA[cat],
          cumple: c.phiD > INUNDACION_REQUERIDA[cat]
        });
      }
    });
    const energia = ENERGIA_REQUERIDA[cat];
    if (energia !== void 0 && mo) {
      const v = mo.m * areaGZ(mo.curva);
      lista3.push({
        requisito: "Energ\xEDa adrizante (m_MO \xD7 A_GZ)",
        apartado: "6.4, tabla 4",
        condicion: mo.nombre,
        valor: v,
        exigido: energia,
        cumple: v > energia
      });
    }
    for (const a of alturas?.aberturas ?? []) {
      const exigida = alturaInundacionRequerida(a, { LH: barco2.LH, BH: barco2.BH, VD: alturas.VD, FM: alturas.FM }, cat);
      lista3.push({
        requisito: `Altura de inundaci\xF3n: ${a.nombre}`,
        apartado: "6.2.2, anexo A",
        valor: a.alturaMedida,
        exigido: exigida,
        cumple: a.alturaMedida >= exigida
      });
    }
    porCategoria[cat] = lista3;
  }
  const categoria = CATEGORIAS2.find((c) => porCategoria[c].every((x) => x.cumple));
  return { categoria, stix: stixes, porCategoria };
}

// src/vista/estabilidad.ts
var NORMA_ESTABILIDAD = "UNE-EN ISO 12217-2:2025";
var num = (v, d = 2) => v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
function panelEstabilidad(guardada, hoy2, alGuardar, alVerCalculo, alAbrirExperiencia, alAbrirBalance) {
  let categoria = guardada?.categoria ?? null;
  let fecha2 = guardada?.fecha ?? hoy2;
  let preliminar = guardada?.preliminar ?? true;
  const guardar = () => alGuardar({ categoria, norma: NORMA_ESTABILIDAD, fecha: fecha2, preliminar });
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Estabilidad"),
    h(
      "p",
      { class: "sutil" },
      `Resultado de una evaluaci\xF3n seg\xFAn la ${NORMA_ESTABILIDAD}. No cambia la zona: el sistema lo usa para decir si un barco sin marcado CE podr\xEDa justificar una zona mejor (CT 1/2024) o si uno con marcado CE ya no respalda su placa (CT 5/2020).`
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Categor\xEDa que cumple"),
      h(
        "select",
        {
          onchange: (ev) => {
            const v = ev.target.value;
            categoria = v === "" ? null : v;
          }
        },
        ...[...CATEGORIAS2, ""].map(
          (c) => h("option", { value: c, selected: (categoria ?? "") === c }, c === "" ? "Ninguna" : c)
        )
      )
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Fecha"),
      h("input", { type: "date", valor: fecha2, onchange: (ev) => fecha2 = ev.target.value })
    ),
    h(
      "label",
      { class: "casilla-linea" },
      h("input", {
        type: "checkbox",
        checked: preliminar,
        onchange: (ev) => preliminar = ev.target.checked
      }),
      " Preliminar (pesos calculados, sin experiencia de estabilidad)"
    ),
    h("button", { onclick: guardar }, guardada === void 0 ? "Anotar" : "Guardar cambios"),
    guardada !== void 0 && h("button", { class: "sutil", onclick: () => alGuardar(void 0) }, "Quitar"),
    h("button", { class: "sutil", onclick: alVerCalculo }, "Ver el c\xE1lculo del velero de referencia"),
    h("button", { class: "sutil", onclick: alAbrirExperiencia }, "Experiencia de estabilidad"),
    h("button", { class: "sutil", onclick: alAbrirBalance }, "Prueba de balance y huella del barco")
  );
}
function graficoGZ(informe) {
  const W = 640, H = 300, m2 = { i: 48, d: 12, a: 14, b: 36 };
  const curvas = informe.isoCondiciones.map((c) => c.curva);
  const todos = curvas.flatMap((c) => c.puntos.map((p) => p.gz));
  const yMax = Math.max(...todos) * 1.1, yMin = Math.min(0, ...todos) * 1.1;
  const X = (e) => m2.i + e / 180 * (W - m2.i - m2.d);
  const Y = (g) => m2.a + (yMax - g) / (yMax - yMin) * (H - m2.a - m2.b);
  const ns = "http://www.w3.org/2000/svg";
  const el2 = (t, a, texto) => {
    const e = document.createElementNS(ns, t);
    for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
    if (texto !== void 0) e.textContent = texto;
    return e;
  };
  const svg = el2("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-gz", role: "img", "aria-label": "Curva de brazos adrizantes GZ" });
  for (let e = 0; e <= 180; e += 30) {
    svg.append(el2("line", { x1: X(e), x2: X(e), y1: m2.a, y2: H - m2.b, class: "rejilla" }));
    svg.append(el2("text", { x: X(e), y: H - m2.b + 16, "text-anchor": "middle", class: "eje" }, `${e}\xB0`));
  }
  for (const g of [yMin, 0, yMax / 2, yMax].map((v) => Math.round(v * 10) / 10)) {
    svg.append(el2("text", { x: m2.i - 6, y: Y(g) + 4, "text-anchor": "end", class: "eje" }, num(g, 1)));
  }
  svg.append(el2("line", { x1: m2.i, x2: W - m2.d, y1: Y(0), y2: Y(0), class: "cero" }));
  svg.append(el2("text", { x: (W + m2.i) / 2, y: H - 4, "text-anchor": "middle", class: "eje" }, "Escora \u2014 GZ en metros"));
  curvas.forEach((c, i) => {
    const d = c.puntos.map((p, k) => `${k === 0 ? "M" : "L"}${X(p.escora).toFixed(1)},${Y(p.gz).toFixed(1)}`).join(" ");
    svg.append(el2("path", { d, class: `curva curva-${i}` }));
    if (c.avs !== void 0) svg.append(el2("circle", { cx: X(c.avs), cy: Y(0), r: 4, class: `curva-${i}` }));
  });
  return svg;
}
function pintarInformeEstabilidad(informe, descripcion) {
  const ev = informe.evaluacion;
  const pesos = [informe.condiciones.minimaOperacion, informe.condiciones.llegadaCargada];
  const gms = [informe.gm.mo, informe.gm.la];
  const preliminar = informe.preliminar;
  const tabla = (cabecera, filas) => h(
    "table",
    { class: "tabla-estabilidad" },
    h("thead", {}, h("tr", {}, ...cabecera.map((c) => h("th", {}, c)))),
    h("tbody", {}, ...filas.map((f) => h("tr", {}, ...f.map((v) => h("td", {}, String(v))))))
  );
  return h(
    "div",
    { class: "estabilidad" },
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, `Categor\xEDa de dise\xF1o: ${ev.categoria ?? "ninguna"}`),
      h(
        "p",
        { class: "sutil" },
        (descripcion ?? `Velero de referencia: el casco Sysser 1 de la serie de Delft (Standfast 43) a escala real, con la quilla y el tim\xF3n de la serie, una caseta y un c\xE1lculo de pesos supuesto.`) + ` L_H ${num(informe.barco.LH)} m \xB7 B_H ${num(informe.barco.BH)} m \xB7 A_S ${num(informe.barco.AS, 0)} m\xB2. Evaluaci\xF3n seg\xFAn la ${NORMA_ESTABILIDAD}.`
      ),
      preliminar && h(
        "p",
        { class: "salvedad" },
        "\u26A0 Evaluaci\xF3n preliminar: la VCG sale de un c\xE1lculo de pesos y GM es menor de 1,5 m (C.2.3). El valor definitivo exige una experiencia de estabilidad."
      ),
      informe.condiciones.superficieLibre.cuentan.length > 0 && h(
        "p",
        { class: "sutil" },
        `Superficie libre (C.2.5): ${informe.condiciones.superficieLibre.cuentan.join(", ")} sube la VCG ${num(informe.condiciones.superficieLibre.subida * 1e3, 0)} mm en llegada cargada.`
      )
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Curva de brazos adrizantes"),
      graficoGZ(informe),
      h(
        "p",
        { class: "leyenda-gz" },
        h("span", { class: "muestra curva-0" }),
        " M\xEDnima operaci\xF3n  ",
        h("span", { class: "muestra curva-1" }),
        " Llegada cargada  \xB7 el punto marca el AVS"
      ),
      tabla(
        ["Condici\xF3n", "Masa (kg)", "GM (m)", "GZ m\xE1x. (m)", "a (\xB0)", "AVS (\xB0)", "Inundaci\xF3n (\xB0)"],
        informe.isoCondiciones.map((c, i) => [
          c.nombre,
          num(pesos[i].masa, 0),
          num(gms[i]),
          num(c.curva.gzMax, 3),
          num(c.curva.escoraGzMax, 0),
          c.curva.avs === void 0 ? "\u2014" : num(c.curva.avs, 0),
          c.phiD === void 0 ? "\u2014" : num(c.phiD, 0)
        ])
      )
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "STIX (6.6)"),
      tabla(
        ["Condici\xF3n", "FDS", "FIR", "FKR", "FDL", "FBD", "FWM", "FDF", "STIX"],
        ev.stix.map((s) => [
          s.condicion,
          ...Object.values(s.factores).map((v) => num(v)),
          num(s.stix, 1)
        ])
      )
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Requisitos por categor\xEDa"),
      ...CATEGORIAS2.map((cat) => {
        const fallos = ev.porCategoria[cat].filter((c) => !c.cumple);
        return h(
          "p",
          { class: fallos.length === 0 ? "" : "salvedad" },
          h("strong", {}, `${cat}: `),
          fallos.length === 0 ? "cumple todo" : fallos.map((c) => `${c.requisito}${c.condicion ? ` (${c.condicion})` : ""}: ${num(c.valor, 1)} frente a ${num(c.exigido, 1)} [${c.apartado}]`).join("; ")
        );
      })
    )
  );
}

// src/vista/experiencia.ts
var num2 = (v, d = 2) => v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
var leer = (ev) => Number(ev.target.value.replace(",", "."));
function entrada(valor2, alCambiar, paso = "0.01", ancho = "5.5em") {
  return h("input", {
    type: "number",
    step: paso,
    inputmode: "decimal",
    style: `width:${ancho}`,
    valor: valor2 === null || Number.isNaN(valor2) ? "" : String(valor2),
    onchange: (ev) => {
      const t = ev.target.value;
      alCambiar(t === "" ? null : leer(ev));
    }
  });
}
function grafico(r) {
  const W = 640, H = 280, m2 = { i: 56, d: 12, a: 12, b: 36 };
  const todos = r.instrumentos.flatMap((i) => i.tangentes);
  const xs = r.momentos;
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...todos), yMax = Math.max(...todos);
  const X = (v) => m2.i + (v - xMin) / (xMax - xMin || 1) * (W - m2.i - m2.d);
  const Y = (v) => m2.a + (yMax - v) / (yMax - yMin || 1) * (H - m2.a - m2.b);
  const ns = "http://www.w3.org/2000/svg";
  const el2 = (t, a, texto) => {
    const e = document.createElementNS(ns, t);
    for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
    if (texto !== void 0) e.textContent = texto;
    return e;
  };
  const svg = el2("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-gz", role: "img", "aria-label": "Tangente de la escora frente al momento escorante" });
  svg.append(el2("line", { x1: m2.i, x2: W - m2.d, y1: Y(0), y2: Y(0), class: "cero" }));
  svg.append(el2("line", { x1: X(0), x2: X(0), y1: m2.a, y2: H - m2.b, class: "cero" }));
  svg.append(el2("text", { x: (W + m2.i) / 2, y: H - 6, "text-anchor": "middle", class: "eje" }, "Momento escorante (kg\xB7m) \u2014 tangente de la escora"));
  for (const v of [xMin, 0, xMax]) svg.append(el2("text", { x: X(v), y: H - m2.b + 16, "text-anchor": "middle", class: "eje" }, num2(v, 0)));
  for (const v of [yMin, 0, yMax]) svg.append(el2("text", { x: m2.i - 6, y: Y(v) + 4, "text-anchor": "end", class: "eje" }, num2(v, 3)));
  r.instrumentos.forEach((ins, k) => {
    const { pendiente: b, ordenada: a } = ins.recta;
    svg.append(el2("line", { x1: X(xMin), y1: Y(a + b * xMin), x2: X(xMax), y2: Y(a + b * xMax), class: `curva curva-${k % 2}` }));
    ins.tangentes.forEach((t, i) => {
      const sospechoso = ins.sospechosos.includes(i);
      svg.append(el2("circle", { cx: X(xs[i]), cy: Y(t), r: sospechoso ? 6 : 4, class: `curva-${k % 2}${sospechoso ? " sospechoso" : ""}` }));
    });
  });
  return svg;
}
function pintarExperiencia(reg, resultado2, faltan, telefonoDisponible, midiendo, acciones, origenFormas) {
  const c = acciones.cambiar;
  const tabla = (cab, filas) => h(
    "table",
    { class: "tabla-estabilidad" },
    h("thead", {}, h("tr", {}, ...cab.map((t) => h("th", {}, t)))),
    h("tbody", {}, ...filas.map((f) => h("tr", {}, ...f.map((v) => h("td", {}, v)))))
  );
  return h(
    "div",
    { class: "estabilidad" },
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Experiencia de estabilidad"),
      h(
        "p",
        { class: "sutil" },
        `Procedimiento del C\xF3digo IS 2008 (parte B, cap. 8, y anexo 1), adaptado a esloras menores de 24 m (8.1.6). Formas del casco: ${origenFormas}.`
      ),
      h(
        "div",
        {},
        h("button", { class: "sutil", onclick: acciones.cargarEjemplo }, "Cargar una prueba simulada del velero de referencia"),
        h("button", { class: "sutil", onclick: acciones.vaciar }, "Empezar una prueba en blanco")
      ),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Densidad del agua medida con hidr\xF3metro (kg/m\xB3)"),
        entrada(reg.densidad, (v) => c((r) => {
          r.densidad = v ?? 1025;
        }), "1", "7em")
      )
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Pesos de prueba"),
      h("p", { class: "sutil" }, "Bidones llenos de agua, pesados con b\xE1scula (anexo 1, 2.3.1). x: posici\xF3n longitudinal; z: altura en cubierta."),
      tabla(["Peso", "Masa (kg)", "x (m)", "z (m)", ""], reg.pesos.map((p, i) => [
        p.id,
        entrada(p.masa, (v) => c((r) => {
          r.pesos[i].masa = v ?? 0;
        }), "0.1"),
        entrada(p.x, (v) => c((r) => {
          r.pesos[i].x = v ?? 0;
        })),
        entrada(p.z, (v) => c((r) => {
          r.pesos[i].z = v ?? 0;
        })),
        h("button", { class: "sutil", onclick: () => c((r) => {
          r.pesos.splice(i, 1);
        }) }, "Quitar")
      ])),
      h("button", { class: "sutil", onclick: () => c((r) => {
        r.pesos.push({ id: String.fromCharCode(65 + r.pesos.length), masa: 75, x: 5, z: 2.1 });
      }) }, "A\xF1adir peso")
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Instrumentos"),
      h("p", { class: "sutil" }, "Dos p\xE9ndulos como m\xEDnimo (8.2.2.9). El tel\xE9fono solo cuenta junto a un p\xE9ndulo (anexo 1, 2.4.7)."),
      tabla(["P\xE9ndulo", "Longitud (m)", ""], reg.pendulos.map((p, i) => [
        p.nombre,
        entrada(p.longitud, (v) => c((r) => {
          r.pendulos[i].longitud = v ?? 0;
        })),
        h("button", { class: "sutil", onclick: () => c((r) => {
          r.pendulos.splice(i, 1);
          r.estados.forEach((e) => e.deflexiones.splice(i, 1));
        }) }, "Quitar")
      ])),
      h("button", { class: "sutil", onclick: () => c((r) => {
        r.pendulos.push({ nombre: `P\xE9ndulo ${r.pendulos.length + 1}`, longitud: 1.8 });
        r.estados.forEach((e) => e.deflexiones.push(null));
      }) }, "A\xF1adir p\xE9ndulo"),
      h(
        "label",
        { class: "casilla-linea" },
        h("input", { type: "checkbox", checked: reg.telefono, onchange: (ev) => c((r) => {
          r.telefono = ev.target.checked;
        }) }),
        " Usar el tel\xE9fono como inclin\xF3metro"
      ),
      reg.telefono && !telefonoDisponible.disponible && h("p", { class: "salvedad" }, `\u26A0 ${telefonoDisponible.motivo}`)
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Francobordos"),
      h("p", { class: "sutil" }, "Cinco por banda como m\xEDnimo, justo antes o despu\xE9s de la prueba, con los pesos y las personas en su sitio (8.4.1.1)."),
      tabla(["x (m)", "Banda", "Francobordo (m)", ""], reg.francobordos.map((l, i) => [
        entrada(l.x, (v) => c((r) => {
          r.francobordos[i] = { ...r.francobordos[i], x: v ?? 0 };
        })),
        l.banda,
        entrada(l.francobordo, (v) => c((r) => {
          r.francobordos[i] = { ...r.francobordos[i], francobordo: v ?? 0 };
        }), "0.005"),
        h("button", { class: "sutil", onclick: () => c((r) => {
          r.francobordos.splice(i, 1);
        }) }, "Quitar")
      ])),
      h("button", { class: "sutil", onclick: () => c((r) => {
        r.francobordos.push({ x: 5, banda: "babor", francobordo: 1.2 }, { x: 5, banda: "estribor", francobordo: 1.2 });
      }) }, "A\xF1adir una pareja")
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Movimientos"),
      h("p", { class: "sutil" }, "Estado 0: posici\xF3n inicial. Posici\xF3n transversal de cada peso (m, estribor positivo) y deflexi\xF3n de cada p\xE9ndulo (cm, hacia estribor positiva)."),
      tabla(
        ["Estado", ...reg.pesos.map((p) => `y ${p.id}`), ...reg.pendulos.map((p) => `${p.nombre} (cm)`), ...reg.telefono ? ["Tel\xE9fono (\xB0)"] : []],
        reg.estados.map((e, i) => [
          String(i),
          ...reg.pesos.map((p) => entrada(e.posiciones[p.id] ?? null, (v) => c((r) => {
            r.estados[i].posiciones[p.id] = v ?? 0;
          }))),
          ...reg.pendulos.map((_, k) => entrada(
            e.deflexiones[k] === null || e.deflexiones[k] === void 0 ? null : Math.round(e.deflexiones[k] * 1e3) / 10,
            (v) => c((r) => {
              r.estados[i].deflexiones[k] = v === null ? null : v / 100;
            }),
            "0.1"
          )),
          ...reg.telefono ? [midiendo?.estado === i ? `${Math.round(midiendo.fraccion * 100)} % \xB7 ${num2(midiendo.media, 2)}\xB0` : h(
            "span",
            {},
            e.telefono ? `${num2(e.telefono.media, 2)}\xB0 \xB1${num2(e.telefono.desviacion, 2)} ` : "",
            h("button", { class: "sutil", disabled: !telefonoDisponible.disponible || midiendo !== void 0, onclick: () => acciones.medirTelefono(i) }, e.telefono ? "Repetir" : "Medir 20 s")
          )] : []
        ])
      ),
      h("button", { class: "sutil", onclick: () => c((r) => {
        const ultimo = r.estados.at(-1);
        r.estados.push({ posiciones: { ...ultimo?.posiciones ?? {} }, deflexiones: r.pendulos.map(() => null), telefono: null });
      }) }, "A\xF1adir movimiento")
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Resultado"),
      faltan.length > 0 ? h("p", { class: "sutil" }, `Faltan datos: ${faltan.join("; ")}.`) : resultado2 === void 0 ? h("p", { class: "sutil" }, "Calculando\u2026") : h(
        "div",
        {},
        grafico(resultado2),
        tabla(["Instrumento", "GM (m)", "\xB1 (m)", "R\xB2"], resultado2.instrumentos.map((i) => [i.nombre, num2(i.gm, 3), num2(i.errorGm, 3), num2(i.recta.r2, 4)])),
        h("p", {}, h("strong", {}, `Desplazamiento ${num2(resultado2.flotacion.desplazamiento, 0)} kg \xB7 KM ${num2(resultado2.km, 3)} m \xB7 GM ${num2(resultado2.gm, 3)} m \xB7 KG ${num2(resultado2.kg, 3)} m \xB7 LCG ${num2(resultado2.lcg, 2)} m`)),
        h("p", { class: resultado2.valida ? "sutil" : "salvedad" }, resultado2.valida ? "La prueba cumple el procedimiento del C\xF3digo (con las adaptaciones que se avisan abajo). Con este KG, la evaluaci\xF3n de estabilidad deja de ser preliminar (UNE-EN ISO 12217-2, C.2.3 a)." : "\u26A0 La prueba no es v\xE1lida tal como est\xE1: ver los avisos."),
        ...resultado2.avisos.map((a) => h("p", { class: "salvedad" }, `\u26A0 ${a}`))
      )
    )
  );
}

// src/inclinometro.ts
function disponibilidad() {
  if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
    return { disponible: false, motivo: "Este navegador no da acceso al aceler\xF3metro." };
  }
  if (!window.isSecureContext) {
    return { disponible: false, motivo: "El aceler\xF3metro solo est\xE1 disponible en HTTPS: abre la aplicaci\xF3n desde la web publicada." };
  }
  return { disponible: true };
}
async function pedirPermiso() {
  const DM = window.DeviceMotionEvent;
  if (typeof DM.requestPermission === "function") {
    const r = await DM.requestPermission();
    if (r !== "granted") throw new Error("Sin permiso para usar el aceler\xF3metro.");
  }
}
async function medirEscora(segundos, alProgreso) {
  await pedirPermiso();
  return new Promise((resolver2, rechazar) => {
    const angulos = [];
    const inicio = performance.now();
    const alMovimiento = (ev) => {
      const a = ev.accelerationIncludingGravity;
      if (!a || a.x === null || a.z === null) return;
      angulos.push(Math.atan2(a.x, Math.abs(a.z)) * 180 / Math.PI);
      const t = (performance.now() - inicio) / 1e3;
      alProgreso?.(Math.min(1, t / segundos), angulos.reduce((s, v) => s + v, 0) / angulos.length);
      if (t >= segundos) {
        window.removeEventListener("devicemotion", alMovimiento);
        if (angulos.length < 10) {
          rechazar(new Error("El tel\xE9fono apenas ha dado muestras."));
          return;
        }
        const media = angulos.reduce((s, v) => s + v, 0) / angulos.length;
        const desviacion = Math.sqrt(angulos.reduce((s, v) => s + (v - media) ** 2, 0) / (angulos.length - 1));
        resolver2({ media, desviacion, muestras: angulos.length });
      }
    };
    window.addEventListener("devicemotion", alMovimiento);
    setTimeout(() => {
      if (angulos.length === 0) {
        window.removeEventListener("devicemotion", alMovimiento);
        rechazar(new Error("El tel\xE9fono no da lecturas del aceler\xF3metro."));
      }
    }, 3e3);
  });
}
function alinearSigno(telefono, pendulo) {
  const n = Math.min(telefono.length, pendulo.length);
  let s = 0;
  for (let i = 1; i < n; i++) s += (telefono[i] - telefono[0]) * (pendulo[i] - pendulo[0]);
  return s < 0 ? telefono.map((v) => -v) : telefono;
}

// src/giroscopio.ts
async function pedirPermiso2() {
  const DM = window.DeviceMotionEvent;
  if (typeof DM.requestPermission === "function") {
    const r = await DM.requestPermission();
    if (r !== "granted") throw new Error("Sin permiso para usar los sensores de movimiento.");
  }
}
async function registrarBalance(segundos, alMuestra) {
  await pedirPermiso2();
  return new Promise((resolver2, rechazar) => {
    const muestras = [];
    let magnitud;
    const inicio = performance.now();
    const alMovimiento = (ev) => {
      const t = (performance.now() - inicio) / 1e3;
      const r = ev.rotationRate;
      const a = ev.accelerationIncludingGravity;
      if (magnitud === void 0) magnitud = r && r.gamma !== null ? "velocidad" : a && a.x !== null && a.z !== null ? "angulo" : void 0;
      let v;
      if (magnitud === "velocidad" && r && r.gamma !== null) v = r.gamma;
      else if (magnitud === "angulo" && a && a.x !== null && a.z !== null) v = Math.atan2(a.x, Math.abs(a.z)) * 180 / Math.PI;
      if (v === void 0 || magnitud === void 0) return;
      const m2 = { t, v };
      muestras.push(m2);
      alMuestra?.(m2, Math.min(1, t / segundos), magnitud);
      if (t >= segundos) {
        window.removeEventListener("devicemotion", alMovimiento);
        resolver2({ muestras, magnitud });
      }
    };
    window.addEventListener("devicemotion", alMovimiento);
    setTimeout(() => {
      if (muestras.length === 0) {
        window.removeEventListener("devicemotion", alMovimiento);
        rechazar(new Error("El tel\xE9fono no da lecturas de los sensores de movimiento."));
      }
    }, 3e3);
  });
}
function leerCsvBalance(texto) {
  const lineas = texto.split(/\r?\n/).filter((l) => l.trim() !== "");
  const sep = [";", "	", ","].reduce((a, b) => lineas[0].split(b).length > lineas[0].split(a).length ? b : a);
  const partir = (l) => l.split(sep).map((x) => x.trim().replace(/^"|"$/g, ""));
  const cab = partir(lineas[0]);
  const conCabecera = cab.some((c) => Number.isNaN(Number(c.replace(",", "."))));
  let col = cab.findIndex((c) => /gyroscope y|gyro.*y|\by\b|gamma/i.test(c));
  if (col < 1) col = Math.min(2, cab.length - 1);
  const enRad = conCabecera && /rad/i.test(cab[col] ?? "");
  const muestras = [];
  for (const l of lineas.slice(conCabecera ? 1 : 0)) {
    const c = partir(l).map((x) => Number(x.replace(",", ".")));
    if (Number.isFinite(c[0]) && Number.isFinite(c[col])) muestras.push({ t: c[0], v: enRad ? c[col] * 180 / Math.PI : c[col] });
  }
  if (muestras.length < 50) throw new Error("El CSV no tiene suficientes filas de tiempo y velocidad angular.");
  return { muestras, magnitud: "velocidad" };
}

// ../itb-estabilidad/src/balance.ts
var FS = 25;
function remuestrear2(m2) {
  const orden = [...m2].sort((a, b) => a.t - b.t);
  const t = [], v = [];
  let j = 0;
  for (let x = orden[0].t; x <= orden.at(-1).t; x += 1 / FS) {
    while (j + 1 < orden.length - 1 && orden[j + 1].t < x) j++;
    const a = orden[j], b = orden[j + 1] ?? a;
    const u = b.t > a.t ? (x - a.t) / (b.t - a.t) : 0;
    t.push(x);
    v.push(a.v + Math.min(1, Math.max(0, u)) * (b.v - a.v));
  }
  return { t, v };
}
function espectro(t, v, f) {
  let re = 0, im = 0;
  const w = 2 * Math.PI * f;
  for (let i = 0; i < t.length; i++) {
    re += v[i] * Math.cos(w * t[i]);
    im -= v[i] * Math.sin(w * t[i]);
  }
  return Math.hypot(re, im);
}
function linealDado(tau, v, sigma, omega) {
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], g = [0, 0, 0];
  const fila = (x) => {
    const e = Math.exp(-sigma * x);
    return [e * Math.cos(omega * x), e * Math.sin(omega * x), 1];
  };
  for (let i = 0; i < tau.length; i++) {
    const f = fila(tau[i]);
    for (let a = 0; a < 3; a++) {
      g[a] += f[a] * v[i];
      for (let b = 0; b < 3; b++) A[a][b] += f[a] * f[b];
    }
  }
  const p = resolver(A, g);
  let ssr = 0;
  for (let i = 0; i < tau.length; i++) {
    const f = fila(tau[i]);
    const r = v[i] - (f[0] * p[0] + f[1] * p[1] + f[2] * p[2]);
    ssr += r * r;
  }
  return { p, ssr };
}
function resolver(A, b) {
  const n = b.length;
  const m2 = A.map((f, i) => [...f, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let f = c + 1; f < n; f++) if (Math.abs(m2[f][c]) > Math.abs(m2[p][c])) p = f;
    [m2[c], m2[p]] = [m2[p], m2[c]];
    const piv = m2[c][c];
    if (Math.abs(piv) < 1e-300) throw new Error("sistema singular");
    for (let f = 0; f < n; f++) {
      if (f === c) continue;
      const k = m2[f][c] / piv;
      for (let k2 = c; k2 <= n; k2++) m2[f][k2] -= k * m2[c][k2];
    }
  }
  return m2.map((f, i) => f[n] / f[i]);
}
function analizarBalance(muestras, opciones = {}) {
  const magnitud = opciones.magnitud ?? "velocidad";
  const fMin = opciones.fMin ?? 0.1, fMax = opciones.fMax ?? 1.2;
  if (muestras.length < 50) throw new Error("hacen falta m\xE1s muestras: el registro es demasiado corto");
  const r = remuestrear2(muestras);
  const duracion = r.t.at(-1) - r.t[0];
  if (duracion < 8) throw new Error("el registro dura menos de 8 s: no da para varios ciclos");
  const media = r.v.reduce((s, x) => s + x, 0) / r.v.length;
  const v0 = r.v.map((x) => x - media);
  const df = 2e-3;
  let fPico = fMin, mPico = -1;
  const mods = [];
  for (let f = fMin; f <= fMax + 1e-12; f += df) {
    const x = espectro(r.t, v0, f);
    mods.push(x);
    if (x > mPico) {
      mPico = x;
      fPico = f;
    }
  }
  const iP = Math.round((fPico - fMin) / df);
  if (iP > 0 && iP < mods.length - 1) {
    const a = mods[iP - 1], b = mods[iP], c = mods[iP + 1];
    const den = a - 2 * b + c;
    if (den < 0) fPico += 0.5 * (a - c) / den * df;
  }
  const ventana = Math.max(1, Math.round(FS / fPico / 4));
  const suave = v0.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - ventana); k <= Math.min(v0.length - 1, i + ventana); k++) {
      s += v0[k];
      n++;
    }
    return s / n;
  });
  let iMax = 0;
  suave.forEach((x, i) => {
    if (Math.abs(x) > Math.abs(suave[iMax])) iMax = i;
  });
  const pico = Math.abs(suave[iMax]);
  const cola = v0.slice(Math.max(0, v0.length - 3 * FS));
  const ruido = Math.sqrt(cola.reduce((s, x) => s + x * x, 0) / cola.length);
  const cicloN = Math.round(FS / fPico);
  let iFin = v0.length - 1;
  for (let i = iMax; i < v0.length; i += cicloN) {
    const trozo = suave.slice(i, i + cicloN);
    const amp = Math.max(...trozo.map(Math.abs));
    if (amp < Math.max(3 * ruido, 0.05 * pico)) {
      iFin = Math.min(v0.length - 1, Math.max(i, iMax + 4 * cicloN));
      break;
    }
  }
  const tau = r.t.slice(iMax, iFin + 1).map((x) => x - r.t[iMax]);
  const vs = v0.slice(iMax, iFin + 1);
  if (tau.length < 2 * cicloN) throw new Error("no hay balance libre suficiente despu\xE9s de soltar el barco");
  let omega = 2 * Math.PI * fPico, sigma = 0;
  let mejor = Infinity;
  for (let z = 0; z <= 0.4; z += 0.01) {
    const s = z * omega;
    const { ssr: ssr2 } = linealDado(tau, vs, s, omega);
    if (ssr2 < mejor) {
      mejor = ssr2;
      sigma = s;
    }
  }
  const reducido = (s, w) => linealDado(tau, vs, s, w).ssr;
  for (let it = 0; it < 50; it++) {
    const h1 = 1e-5 * Math.max(1, sigma), h22 = 1e-6 * omega;
    const f0 = reducido(sigma, omega);
    const gs = (reducido(sigma + h1, omega) - reducido(sigma - h1, omega)) / (2 * h1);
    const gw = (reducido(sigma, omega + h22) - reducido(sigma, omega - h22)) / (2 * h22);
    const hss = (reducido(sigma + h1, omega) - 2 * f0 + reducido(sigma - h1, omega)) / (h1 * h1);
    const hww2 = (reducido(sigma, omega + h22) - 2 * f0 + reducido(sigma, omega - h22)) / (h22 * h22);
    const hsw = (reducido(sigma + h1, omega + h22) - reducido(sigma + h1, omega - h22) - reducido(sigma - h1, omega + h22) + reducido(sigma - h1, omega - h22)) / (4 * h1 * h22);
    const det = hss * hww2 - hsw * hsw;
    if (!(det > 0) || hss <= 0) break;
    let ds = -(hww2 * gs - hsw * gw) / det, dw = -(hss * gw - hsw * gs) / det;
    const lim = 0.05 * omega;
    const k = Math.min(1, lim / Math.max(Math.abs(ds), Math.abs(dw), 1e-300));
    ds *= k;
    dw *= k;
    let paso = 1;
    while (paso > 1e-4 && reducido(Math.max(0, sigma + paso * ds), omega + paso * dw) > f0) paso /= 2;
    if (paso <= 1e-4) break;
    sigma = Math.max(0, sigma + paso * ds);
    omega += paso * dw;
    if (Math.abs(paso * dw) < 1e-10 * omega && Math.abs(paso * ds) < 1e-10) break;
  }
  const { p, ssr } = linealDado(tau, vs, sigma, omega);
  const mediaT = vs.reduce((s, x) => s + x, 0) / vs.length;
  const sst = vs.reduce((s, x) => s + (x - mediaT) ** 2, 0);
  const r2 = 1 - ssr / sst;
  const h2 = 1e-6 * omega;
  const hww = (reducido(sigma, omega + h2) - 2 * ssr + reducido(sigma, omega - h2)) / (h2 * h2);
  const s2 = ssr / Math.max(1, tau.length - 5);
  const correlacion = Math.max(1, ventana);
  const errorOmega = hww > 0 ? Math.sqrt(2 * s2 * correlacion / hww) : Infinity;
  const amplitud = Math.hypot(p[0], p[1]);
  const residuoTipico = Math.sqrt(ssr / tau.length);
  const umbral = Math.max(5 * residuoTipico, 0.1 * amplitud);
  const tauUtil = Math.min(tau.at(-1), amplitud > umbral ? sigma > 0 ? Math.log(amplitud / umbral) / sigma : Infinity : 0);
  const Td = 2 * Math.PI / omega;
  const v8 = Math.max(1, Math.round(FS * Td / 16));
  const vsSuave = vs.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - v8); k <= Math.min(vs.length - 1, i + v8); k++) {
      s += vs[k];
      n++;
    }
    return s / n - p[2];
  });
  const cruces = [];
  for (let i = 1; i < vs.length && tau[i] <= tauUtil; i++) {
    const a = vsSuave[i - 1], b = vsSuave[i];
    if (a < 0 && b >= 0) cruces.push(tau[i - 1] + a / (a - b) * (tau[i] - tau[i - 1]));
  }
  const periodosCiclo = cruces.slice(1).map((x, i) => x - cruces[i]).filter((x) => x > 0.7 * Td && x < 1.3 * Td);
  const omega0 = Math.hypot(omega, sigma);
  const periodo = 2 * Math.PI / omega0;
  const periodoAmortiguado = 2 * Math.PI / omega;
  const amortiguamiento = sigma / omega0;
  const errorAjuste = periodo * errorOmega / omega;
  let errorCiclos = 0;
  if (periodosCiclo.length >= 2) {
    const m2 = periodosCiclo.reduce((s, x) => s + x, 0) / periodosCiclo.length;
    errorCiclos = Math.sqrt(periodosCiclo.reduce((s, x) => s + (x - m2) ** 2, 0) / (periodosCiclo.length - 1)) / Math.sqrt(periodosCiclo.length);
  }
  const errorPeriodo = Math.max(errorAjuste, errorCiclos);
  const amplitudAngulo = magnitud === "velocidad" ? amplitud / omega0 : amplitud;
  const avisos = [];
  let valida = true;
  const ciclos = tauUtil / Td;
  if (ciclos < 3) {
    valida = false;
    avisos.push(`\u2717 Solo ${ciclos.toFixed(1)} ciclos de balance libre por encima del ruido: hacen falta tres como m\xEDnimo. D\xE9 m\xE1s balance o registre m\xE1s tiempo.`);
  }
  if (r2 < 0.8) {
    valida = false;
    avisos.push(`\u2717 La se\xF1al no se parece a un balance libre (R\xB2 = ${r2.toFixed(2)}): viento, oleaje, alguien movi\xE9ndose a bordo o amarras tensas.`);
  }
  if (amortiguamiento > 0.25) avisos.push(`Amortiguamiento muy alto (\u03B6 = ${amortiguamiento.toFixed(2)}): pocos ciclos \xFAtiles. \xBFAmarras tensas o defensas contra el muelle?`);
  if (periodo < 1 || periodo > 10) {
    valida = false;
    avisos.push(`\u2717 Periodo de ${periodo.toFixed(2)} s, fuera de lo que da un barco de recreo (1-10 s).`);
  }
  if (amplitudAngulo > 8) avisos.push(`Balance grande (${amplitudAngulo.toFixed(1)}\xB0): la curva GZ deja de ser recta y el periodo cambia con la amplitud. Mejor por debajo de 5\xB0.`);
  if (periodosCiclo.length >= 3) {
    const m2 = periodosCiclo.reduce((s, x) => s + x, 0) / periodosCiclo.length;
    const disp = Math.max(...periodosCiclo.map((x) => Math.abs(x - m2))) / m2;
    if (disp > 0.1) avisos.push(`Los ciclos no duran lo mismo (hasta un ${(disp * 100).toFixed(0)} % de diferencia): repita la prueba con el agua m\xE1s tranquila.`);
  }
  const fueraDelPico = mods.filter((_, i) => Math.abs(fMin + i * df - fPico) > 0.25 * fPico);
  if (fueraDelPico.length > 0 && Math.max(...fueraDelPico) > 0.5 * mPico) {
    avisos.push("Hay otra oscilaci\xF3n casi tan fuerte como el balance (cabeceo, oleaje o las amarras): compruebe el periodo con una segunda prueba.");
  }
  return {
    periodo,
    errorPeriodo,
    periodoAmortiguado,
    amortiguamiento,
    periodosCiclo,
    ciclos,
    amplitudAngulo,
    r2,
    frecuenciaPico: fPico,
    ajuste: {
      t0: r.t[iMax],
      t1: r.t[iFin],
      amplitud,
      sigma,
      omega,
      fase: Math.atan2(-p[1], p[0]),
      c: p[2] + media
    },
    avisos,
    valida
  };
}
var coeficienteIS = (x) => 0.373 + 0.023 * (x.B / x.d) - 0.043 * (x.Lwl / 100);
var VELEROS_FNB = [
  { barco: "Barcelona (buque escuela, 12,9 m)", B: 3.9, T: 4.72, GM: 1.47, fuente: "Romero 2024, tabla 24" },
  { barco: "Platu 25 (7,5 m)", B: 2.59, T: 3.81, GM: 0.97, fuente: "Romero 2024, tabla 24" },
  { barco: "Class Globe 5.80", B: 2.23, Bpublicada: 1.749, T: 3.35, GM: 0.75, fuente: "Romero 2024, tabla 24; B de Arbona 2024, p. 35" },
  { barco: "Class Globe 5.80 \xABVoladora\xBB", B: 2.23, T: 3.73, GM: 0.6865, fuente: "Arbona 2024, tablas 7 y 9" },
  { barco: "Class Globe 5.80 \xABMarinero\xBB", B: 2.23, T: 3.54, GM: 0.731, fuente: "Arbona 2024, tablas 8 y 10" }
];
function coeficienteVeleros(lista3 = VELEROS_FNB) {
  const cs = lista3.map((v) => coeficienteDesdeReferencia(v.T, v.GM, v.B));
  const n = cs.length;
  const C = cs.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(cs.reduce((a, b) => a + (b - C) ** 2, 0) / (n - 1));
  return { C, errorRelativo: sd * Math.sqrt(1 + 1 / n) / C };
}
var ERROR_RELATIVO_C_IS = 0.2;
var gmDesdePeriodo = (T, B, C) => (2 * C * B / T) ** 2;
var coeficienteDesdeReferencia = (T, GM, B) => T * Math.sqrt(GM) / (2 * B);
function estimarGM(a, dim, ref) {
  let C, errorRelC, metodo, explicacion;
  if (ref) {
    C = coeficienteDesdeReferencia(ref.periodo, ref.gm, dim.B);
    errorRelC = Math.hypot(ref.errorPeriodo / ref.periodo, ref.errorGm / (2 * ref.gm));
    metodo = "calibrado";
    explicacion = `C = ${C.toFixed(3)} calibrada con ${ref.origen} (GM ${ref.gm.toFixed(3)} m, T ${ref.periodo.toFixed(2)} s).`;
  } else if ((dim.tipo ?? "velero") === "velero") {
    const v = coeficienteVeleros();
    C = v.C;
    errorRelC = v.errorRelativo;
    metodo = "veleros-fnb";
    explicacion = `C = ${C.toFixed(3)} \xB1 ${(errorRelC * 100).toFixed(0)} %: media de cinco veleros medidos en la FNB (Romero 2024; Arbona 2024), con B la manga m\xE1xima. Cinco barcos, tres de la misma clase: sin calibrar este, el GM es orientativo.`;
  } else {
    C = coeficienteIS(dim);
    errorRelC = ERROR_RELATIVO_C_IS;
    metodo = "codigo-is";
    explicacion = `C = ${C.toFixed(3)} del C\xF3digo IS 2008 (parte A, 2.3.4), pensada para buques: \xB1${(ERROR_RELATIVO_C_IS * 100).toFixed(0)} % supuesto. Solo orden de magnitud.`;
  }
  const gm = gmDesdePeriodo(a.periodo, dim.B, C);
  const errorGm = gm * Math.hypot(2 * errorRelC, 2 * a.errorPeriodo / a.periodo);
  return { gm, errorGm, metodo, C, errorC: C * errorRelC, explicacion };
}
function cambioRespectoDe(actual, anterior) {
  const q = anterior.periodo / actual.periodo;
  const cambioGM = q * q - 1;
  const errorCambioGM = q * q * 2 * Math.hypot(actual.errorPeriodo / actual.periodo, anterior.errorPeriodo / anterior.periodo);
  return { cambioPeriodo: actual.periodo / anterior.periodo - 1, cambioGM, errorCambioGM };
}
function aleatorio(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function simularBalance(p) {
  const g = 9.80665, k2 = p.radioGiro ** 2;
  const d = 1e-4;
  const GM = p.gz(d) / Math.sin(d);
  const w0 = Math.sqrt(g * GM / k2);
  const acel = (phi2, w2) => -2 * p.amortiguamiento * w0 * w2 - g / k2 * p.gz(phi2);
  const fs = p.fs ?? 60, dt = 1 / fs, antes = p.antes ?? 3;
  const rnd = aleatorio(p.semilla ?? 1);
  const normal3 = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const fase = 2 * Math.PI * rnd();
  const out = [];
  let phi = p.escoraInicial * Math.PI / 180, w = 0;
  for (let i = 0; i * dt <= p.duracion; i++) {
    const t = i * dt;
    let lectura = 0;
    if (t >= antes) {
      lectura = w * 180 / Math.PI;
      const h2 = dt / 4;
      for (let s = 0; s < 4; s++) {
        const k1p = w, k1w = acel(phi, w);
        const k2p = w + 0.5 * h2 * k1w, k2w = acel(phi + 0.5 * h2 * k1p, w + 0.5 * h2 * k1w);
        const k3p = w + 0.5 * h2 * k2w, k3w = acel(phi + 0.5 * h2 * k2p, w + 0.5 * h2 * k2w);
        const k4p = w + h2 * k3w, k4w = acel(phi + h2 * k3p, w + h2 * k3w);
        phi += h2 / 6 * (k1p + 2 * k2p + 2 * k3p + k4p);
        w += h2 / 6 * (k1w + 2 * k2w + 2 * k3w + k4w);
      }
    }
    if (p.oleaje) lectura += p.oleaje.amplitud * Math.sin(2 * Math.PI * t / p.oleaje.periodo + fase);
    lectura += (p.ruido ?? 0) * normal3();
    out.push({ t: t + (rnd() - 0.5) * 0.2 * dt, v: lectura });
  }
  return out;
}

// src/huella.ts
var UMBRAL_ATENCION = 0.05;
var UMBRAL_URGENTE = 0.15;
function analizarHuella(h2, dimensionesPorDefecto) {
  const dim = h2.dimensiones ?? dimensionesPorDefecto;
  const orden = [...h2.medidas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const analizadas = orden.map((medida) => {
    try {
      return { medida, analisis: analizarBalance(medida.muestras, { magnitud: medida.magnitud }) };
    } catch (e) {
      return { medida, error: e.message };
    }
  });
  const ref = [...analizadas].reverse().find((r) => r.medida.referencia && r.analisis?.valida);
  const datosRef = ref?.analisis && ref.medida.referencia ? { periodo: ref.analisis.periodo, errorPeriodo: ref.analisis.errorPeriodo, ...ref.medida.referencia } : void 0;
  const resultados2 = analizadas.map((r) => {
    if (!r.analisis) return r;
    const estimacion = estimarGM(r.analisis, dim, datosRef);
    const cambio = ref?.analisis && ref !== r ? cambioRespectoDe(r.analisis, ref.analisis) : void 0;
    return { ...r, estimacion, cambio };
  });
  const ultima = [...resultados2].reverse().find((r) => r.analisis?.valida && r.cambio && r.medida.fecha >= (ref?.medida.fecha ?? ""));
  let alerta;
  if (ultima?.cambio && ref) {
    const { cambioGM, errorCambioGM, cambioPeriodo } = ultima.cambio;
    const significativa = -cambioGM > 2 * errorCambioGM;
    if (significativa && -cambioGM >= UMBRAL_ATENCION) {
      const pct2 = (x) => `${Math.round(x * 100)} %`;
      alerta = {
        nivel: -cambioGM >= UMBRAL_URGENTE ? "urgente" : "atencion",
        titulo: `El GM ha bajado un ${pct2(-cambioGM)} (\xB1${pct2(errorCambioGM)}) desde la referencia del ${ref.medida.fecha}`,
        detalle: `El periodo de balance ha subido un ${pct2(cambioPeriodo)}. Causas habituales: peso a\xF1adido en alto (radar, enrollador, antenas, bater\xEDas sobre cubierta), agua en la sentina o en el laminado, tanques a medias. Compruebe que la condici\xF3n de carga es la de la referencia; si lo es, conviene repetir la experiencia de estabilidad. Con peso en alto, la prueba exagera la ca\xEDda (sube tambi\xE9n la inercia): el aviso va del lado seguro.`
      };
    }
  }
  return { resultados: resultados2, referencia: ref, alerta };
}

// ../itb-estabilidad/src/masas.ts
function sumarPartidas(partidas) {
  const m2 = partidas.reduce((s, p) => s + p.masa, 0);
  if (m2 <= 0) throw new Error("pesos: la masa total ha de ser positiva");
  const mom = (f) => partidas.reduce((s, p) => s + p.masa * f(p), 0) / m2;
  return { masa: m2, g: [mom((p) => p.x), mom((p) => p.y ?? 0), mom((p) => p.z)] };
}
function conMargenVCG(p, FM, TC) {
  return { masa: p.masa, g: [p.g[0], p.g[1], p.g[2] + 0.05 * (FM + TC)] };
}
var RHO = 1025;
var LLENADO_TABLA_C1 = {
  "llegada cargada": { combustible: 0.1, agua: 0.1, "negras-grises": 0.95, aceite: 0.1, vivero: 0.95 },
  "m\xEDnima operaci\xF3n": { combustible: 0, agua: 0, "negras-grises": 0, aceite: 0, vivero: 0 }
};
function subidaSuperficieLibre(tanques, condicion, masa, BH) {
  let suma = 0;
  const cuentan = [];
  for (const t of tanques) {
    if (t.manga <= 0.35 * BH) continue;
    const llenado = LLENADO_TABLA_C1[condicion][t.contenido];
    if (llenado <= 0 || llenado >= 1) continue;
    suma += (t.segundoMomento ?? t.eslora * t.manga ** 3 / 12) * t.densidad;
    cuentan.push(t.nombre);
  }
  return { subida: suma / masa, cuentan };
}

// ../itb-estabilidad/src/parametros.ts
function coeficientes(m2) {
  const { lwl, bwl, tc, volumen, aw, ax } = m2;
  if (!(lwl > 0 && bwl > 0 && tc > 0 && ax > 0)) throw new Error("Coeficientes de forma: la carena est\xE1 vac\xEDa en esa flotaci\xF3n");
  return {
    ...m2,
    cb: volumen / (lwl * bwl * tc),
    cm: ax / (bwl * tc),
    cp: volumen / (ax * lwl),
    cw: aw / (lwl * bwl)
  };
}
function coeficientesForma(formas, flotacion) {
  const casco = { nombre: formas.nombre, secciones: formas.secciones, fuente: formas.fuente };
  const c = carena(casco, flotacion);
  return coeficientes({
    lwl: c.esloraFlotacion,
    bwl: c.mangaFlotacion,
    tc: c.calado,
    volumen: c.volumen,
    aw: c.areaFlotacion,
    ax: c.areaMaestra
  });
}
var PIE = 0.3048;
var LIBRA = 0.45359237;
var TONELADA_LARGA = 2240 * LIBRA;
var LB_PIE3_AGUA_MAR = 64;
function indicesProyecto(e) {
  if (!(e.masa > 0 && e.lwl > 0 && e.bh > 0 && e.lh > 0)) throw new Error("\xCDndices de proyecto: faltan masa, esloras o manga");
  const lb = e.masa / LIBRA;
  const lwlPies = e.lwl / PIE, lhPies = e.lh / PIE, bPies = e.bh / PIE;
  const volPies3 = lb / LB_PIE3_AGUA_MAR;
  return {
    desplazamientoEslora: e.masa / TONELADA_LARGA / (0.01 * lwlPies) ** 3,
    ...e.as !== void 0 && e.as > 0 ? { superficieVelicaDesplazamiento: e.as / PIE ** 2 / volPies3 ** (2 / 3) } : {},
    ...e.lastre !== void 0 && e.lastre > 0 ? { lastreDesplazamiento: e.lastre / e.masa } : {},
    indiceVuelco: bPies / volPies3 ** (1 / 3),
    indiceConfort: lb / (0.65 * (0.7 * lwlPies + 0.3 * lhPies) * bPies ** 1.333),
    velocidadCasco: 1.34 * Math.sqrt(lwlPies)
  };
}
function banda(valor2, bandas, ultima) {
  for (const [hasta, texto] of bandas) if (valor2 < hasta) return texto;
  return ultima;
}
var INTERPRETACION = {
  desplazamientoEslora: (v) => banda(v, [[100, "ultraligero"], [200, "ligero"], [300, "medio"], [400, "pesado"]], "muy pesado"),
  superficieVelicaDesplazamiento: (v) => banda(v, [[16, "poco trapo: crucero pesado o motovelero"], [20, "crucero"], [24, "regata-crucero"]], "regata"),
  lastreDesplazamiento: (v) => banda(v, [[0.3, "poco lastre para un velero"], [0.4, "normal en un crucero"]], "mucho lastre: rigidez alta"),
  indiceVuelco: (v) => v < 2 ? "por debajo de 2: apto para alta mar seg\xFAn el criterio de 1979" : "2 o m\xE1s: no apto para alta mar seg\xFAn el criterio de 1979",
  indiceConfort: (v) => banda(v, [[20, "ligero, de regata"], [30, "costero"], [40, "crucero"], [50, "oce\xE1nico"]], "oce\xE1nico pesado")
};

// src/ingenieria.ts
function resumirInforme(informe, extra) {
  const pesos = [informe.condiciones.minimaOperacion, informe.condiciones.llegadaCargada];
  const gms = [informe.gm.mo, informe.gm.la];
  const condiciones = informe.isoCondiciones.map((c, i) => {
    const s = informe.evaluacion.stix[i];
    return {
      nombre: c.nombre,
      masa: pesos[i].masa,
      lwl: c.LWL,
      bwl: c.BWL,
      gm: gms[i],
      gzMax: c.curva.gzMax,
      escoraGzMax: c.curva.escoraGzMax,
      ...c.curva.avs !== void 0 ? { avs: c.curva.avs } : {},
      ...c.phiD !== void 0 ? { inundacion: c.phiD } : {},
      areaGZ: s?.AGZ ?? 0,
      stix: s?.stix ?? 0
    };
  });
  let coeficientes2;
  try {
    const mo = informe.condiciones.minimaOperacion;
    const eq = equilibrio(informe.formas, { volumen: mo.masa / RHO, g: mo.g }, 0);
    coeficientes2 = coeficientesForma(informe.formas, eq.flotacion);
  } catch {
    coeficientes2 = void 0;
  }
  return {
    fecha: extra.fecha,
    norma: extra.norma,
    formas: informe.formas.nombre,
    categoria: informe.evaluacion.categoria ?? null,
    preliminar: informe.preliminar,
    origenRosca: extra.origenRosca,
    lh: informe.barco.LH,
    bh: informe.barco.BH,
    as: informe.barco.AS,
    masaRosca: extra.masaRosca,
    cargaMaxima: informe.condiciones.cargaMaxima.masa,
    subidaSuperficieLibre: informe.condiciones.superficieLibre.subida,
    condiciones,
    ...coeficientes2 !== void 0 ? { coeficientes: coeficientes2 } : {}
  };
}
var num3 = (v, d) => v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
var kg = (v) => `${num3(v, 0)} kg`;
var m = (v, d = 2) => `${num3(v, d)} m`;
var gr = (v) => `${num3(v, 0)}\xB0`;
var fecha = (iso) => iso.split("-").reverse().join("/");
function faltaEvaluacion(e) {
  return e.tieneFormas ? { texto: "Falta evaluar el barco: rosca, carga, aparejo y aberturas, y anotar el resultado.", destino: "evaluar", boton: "Evaluar este barco" } : { texto: "Faltan las formas del casco (IGES o tabla de semimangas).", destino: "formas", boton: "Cargar las formas" };
}
function componerIngenieria(e) {
  const r = e.resumen;
  const mo = r?.condiciones.find((c) => c.nombre === "m\xEDnima operaci\xF3n");
  const la = r?.condiciones.find((c) => c.nombre === "llegada cargada");
  const bloques = [];
  const nota = r?.preliminar ? "Evaluaci\xF3n preliminar: el centro de gravedad sale de un c\xE1lculo de pesos y GM < 1,5 m (UNE-EN ISO 12217-2, C.2.3). La definitiva exige una experiencia de estabilidad." : void 0;
  bloques.push(
    r === void 0 || mo === void 0 ? { clave: "dimensiones", titulo: "Dimensiones y pesos", parametros: [], falta: faltaEvaluacion(e) } : {
      clave: "dimensiones",
      titulo: "Dimensiones y pesos",
      parametros: [
        { nombre: "Eslora del casco L_H", valor: m(r.lh), fuente: "formas del casco (ISO 8666)" },
        { nombre: "Manga del casco B_H", valor: m(r.bh), fuente: "formas del casco (ISO 8666)" },
        { nombre: "Eslora y manga en la flotaci\xF3n", valor: `${m(mo.lwl)} \xD7 ${m(mo.bwl)}`, fuente: "m\xEDnima operaci\xF3n, trimado libre" },
        ...r.coeficientes ? [{ nombre: "Calado del cuerpo de canoa T_C", valor: m(r.coeficientes.tc), fuente: "m\xEDnima operaci\xF3n, sin quilla ni tim\xF3n" }] : [],
        { nombre: "Masa en rosca", valor: kg(r.masaRosca), fuente: r.origenRosca === "experiencia" ? "experiencia de estabilidad" : "c\xE1lculo de pesos" },
        { nombre: "M\xEDnima operaci\xF3n m_MO", valor: kg(mo.masa), fuente: "UNE-EN ISO 12217-2, 3.5.3" },
        { nombre: "Carga m\xE1xima m_LDC", valor: kg(r.cargaMaxima), fuente: "UNE-EN ISO 12217-2, 3.5.4" },
        e.lastreKg !== void 0 && e.lastreKg > 0 ? { nombre: "Lastre", valor: kg(e.lastreKg), fuente: "anotado en esta pantalla" } : { nombre: "Lastre", lectura: "Sin anotar: se escribe abajo, de la placa o del plano." }
      ]
    }
  );
  if (r === void 0 || mo === void 0) {
    bloques.push({ clave: "estabilidad", titulo: "Estabilidad (UNE-EN ISO 12217-2)", parametros: [], falta: faltaEvaluacion(e) });
  } else {
    const fila = (c) => [
      { nombre: `GM, ${c.nombre}`, valor: m(c.gm), fuente: "altura metac\xE9ntrica inicial, KB + BM \u2212 KG" },
      { nombre: `GZ m\xE1ximo, ${c.nombre}`, valor: `${m(c.gzMax)} a ${gr(c.escoraGzMax)}` },
      { nombre: `Estabilidad nula (AVS), ${c.nombre}`, valor: c.avs !== void 0 ? gr(c.avs) : "no vuelve a cero antes de 180\xB0" },
      ...c.inundacion !== void 0 ? [{ nombre: `\xC1ngulo de inundaci\xF3n, ${c.nombre}`, valor: gr(c.inundacion), fuente: "UNE-EN ISO 12217-2, 3.3.2" }] : [],
      { nombre: `\xC1rea bajo la curva GZ, ${c.nombre}`, valor: `${num3(c.areaGZ, 1)} m\xB7\xB0` },
      { nombre: `STIX, ${c.nombre}`, valor: num3(c.stix, 1), fuente: "UNE-EN ISO 12217-2, 6.6.9" }
    ];
    const categoria = r.categoria ?? "ninguna";
    const placa = e.categoriaPlaca;
    bloques.push({
      clave: "estabilidad",
      titulo: "Estabilidad (UNE-EN ISO 12217-2)",
      parametros: [
        {
          nombre: "Categor\xEDa de dise\xF1o calculada",
          valor: categoria,
          lectura: placa === void 0 ? "El barco no declara categor\xEDa de placa." : placa === categoria ? `Coincide con la de la placa (${placa}).` : `La placa dice ${placa}: la zona la sigue mandando la placa; el motor avisa, no cambia nada.`,
          fuente: `${r.norma}, evaluada el ${fecha(r.fecha)}`
        },
        ...fila(mo),
        ...la ? fila(la) : [],
        ...r.subidaSuperficieLibre > 0 ? [{ nombre: "Superficie libre de los tanques", valor: `+${num3(r.subidaSuperficieLibre * 1e3, 0)} mm de KG`, fuente: "UNE-EN ISO 12217-2, C.2.5" }] : []
      ],
      ...nota !== void 0 ? { nota } : {}
    });
  }
  const ultima = e.huella?.resultados.filter((x) => x.estimacion !== void 0).at(-1);
  if (ultima?.estimacion === void 0 || ultima.analisis === void 0) {
    bloques.push({
      clave: "balance",
      titulo: "Prueba de balance",
      parametros: [],
      falta: { texto: "No hay ninguna prueba de balance en el expediente.", destino: "balance", boton: "Hacer una prueba de balance" }
    });
  } else {
    const est = ultima.estimacion;
    const cambio = ultima.cambio;
    bloques.push({
      clave: "balance",
      titulo: "Prueba de balance",
      parametros: [
        { nombre: "\xDAltima prueba", valor: fecha(ultima.medida.fecha), lectura: ultima.medida.condicion },
        { nombre: "Periodo de balance T", valor: `${num3(ultima.analisis.periodo, 2)} \xB1 ${num3(ultima.analisis.errorPeriodo, 2)} s`, fuente: "ajuste de la oscilaci\xF3n amortiguada" },
        {
          nombre: "GM estimado",
          valor: `${num3(est.gm, 2)} \xB1 ${num3(est.errorGm, 2)} m`,
          lectura: est.metodo === "calibrado" ? "C calibrada con este mismo barco" : est.metodo === "veleros-fnb" ? "C de cinco veleros medidos en la FNB: orientativo hasta calibrarla con este barco" : "C del C\xF3digo IS, pensada para buques: solo orden de magnitud",
          fuente: "GM = (2\xB7C\xB7B / T)\xB2, C\xF3digo IS 2008, parte A, 2.3.4"
        },
        ...cambio !== void 0 ? [{ nombre: "Cambio de GM respecto de la referencia", valor: `${cambio.cambioGM >= 0 ? "+" : ""}${num3(100 * cambio.cambioGM, 1)} % \xB1 ${num3(100 * cambio.errorCambioGM, 1)} %` }] : [],
        ...e.huella?.alerta !== void 0 ? [{ nombre: "Aviso", valor: e.huella.alerta.titulo, lectura: e.huella.alerta.detalle }] : []
      ],
      ...ultima.medida.simulada === true ? { nota: "Prueba simulada (demostraci\xF3n), no medida a bordo." } : {}
    });
  }
  if (r === void 0 || mo === void 0) {
    bloques.push({ clave: "proyecto", titulo: "Par\xE1metros de proyecto", parametros: [], falta: faltaEvaluacion(e) });
  } else {
    const i = indicesProyecto({ masa: mo.masa, lwl: mo.lwl, lh: r.lh, bh: r.bh, as: r.as, ...e.lastreKg !== void 0 ? { lastre: e.lastreKg } : {} });
    const c = r.coeficientes;
    const conMo = "con la masa y la flotaci\xF3n de m\xEDnima operaci\xF3n";
    bloques.push({
      clave: "proyecto",
      titulo: "Par\xE1metros de proyecto",
      parametros: [
        ...c ? [
          { nombre: "Coeficiente de bloque C_B", valor: num3(c.cb, 3), fuente: "\u2207 / (L_WL\xB7B_WL\xB7T_C), cuerpo de canoa" },
          { nombre: "Coeficiente prism\xE1tico C_P", valor: num3(c.cp, 3), lectura: "c\xF3mo se reparte el volumen a lo largo: cuanto m\xE1s alto, m\xE1s llenos los extremos", fuente: "\u2207 / (A_X\xB7L_WL)" },
          { nombre: "Coeficiente de la maestra C_M", valor: num3(c.cm, 3), fuente: "A_X / (B_WL\xB7T_C)" },
          { nombre: "Coeficiente de la flotaci\xF3n C_W", valor: num3(c.cw, 3), fuente: "A_W / (L_WL\xB7B_WL)" }
        ] : [],
        { nombre: "Desplazamiento-eslora D/L", valor: num3(i.desplazamientoEslora, 0), lectura: INTERPRETACION.desplazamientoEslora(i.desplazamientoEslora), fuente: `\u0394[t largas] / (0,01\xB7L_WL[ft])\xB3, ${conMo}` },
        ...i.superficieVelicaDesplazamiento !== void 0 ? [{ nombre: "Superficie v\xE9lica-desplazamiento SA/D", valor: num3(i.superficieVelicaDesplazamiento, 1), lectura: INTERPRETACION.superficieVelicaDesplazamiento(i.superficieVelicaDesplazamiento), fuente: "A_S[ft\xB2] / (\u0394[lb]/64)^(2/3)" }] : [],
        i.lastreDesplazamiento !== void 0 ? { nombre: "Lastre-desplazamiento", valor: `${num3(100 * i.lastreDesplazamiento, 0)} %`, lectura: INTERPRETACION.lastreDesplazamiento(i.lastreDesplazamiento) } : { nombre: "Lastre-desplazamiento", lectura: "Falta el lastre: an\xF3talo abajo." },
        { nombre: "\xCDndice de vuelco (CSF)", valor: num3(i.indiceVuelco, 2), lectura: `${INTERPRETACION.indiceVuelco(i.indiceVuelco)}. La ISO lo sustituy\xF3 por el STIX (${mo ? num3(mo.stix, 1) : "\u2014"}).`, fuente: "B[ft] / (\u0394[lb]/64)^(1/3)" },
        { nombre: "\xCDndice de confort (Brewer)", valor: num3(i.indiceConfort, 1), lectura: INTERPRETACION.indiceConfort(i.indiceConfort), fuente: "\u0394[lb] / (0,65\xB7(0,7 L_WL + 0,3 L_H)\xB7B^1,333), en ft" },
        { nombre: "Velocidad de casco", valor: `${num3(i.velocidadCasco, 1)} nudos`, fuente: "1,34\xB7\u221AL_WL[ft]" }
      ],
      nota: "Las lecturas de los \xEDndices son orientativas: son las bandas con que la literatura de proyecto de yates compara barcos, no l\xEDmites de ninguna norma."
    });
  }
  const a = e.analisis;
  if (a === void 0) {
    bloques.push({
      clave: "fallos",
      titulo: "An\xE1lisis de fallos (AMFE)",
      parametros: [],
      falta: { texto: "El an\xE1lisis de fallos se aplica a embarcaciones con motor intraborda y su plan del fabricante.", destino: "analisis", boton: "Ver el an\xE1lisis de referencia" }
    });
  } else {
    const huecos = a.cobertura.filter((c) => c.hueco);
    bloques.push({
      clave: "fallos",
      titulo: "An\xE1lisis de fallos (AMFE)",
      parametros: [
        { nombre: "Modos de fallo cr\xEDticos o importantes", valor: String(a.resumen.relevantes), fuente: "UNE-EN IEC 60812:2018, matriz de criticidad" },
        { nombre: "Los vigila el plan del fabricante a tiempo", valor: String(a.resumen.cubiertosPorFabricante) },
        { nombre: `Los vigila el reconocimiento (cada ${a.mesesEntreReconocimientos} meses)`, valor: String(a.resumen.cubiertosPorNorma) },
        { nombre: "Huecos: nadie los vigila a tiempo", valor: String(a.resumen.huecos), lectura: huecos.slice(0, 6).map((c) => `${c.modo.elemento}: ${c.modo.modo}`).join(" \xB7 ") + (huecos.length > 6 ? " \xB7 \u2026" : "") },
        { nombre: "Uso del motor", valor: `${num3(a.horasAlAnio, 0)} h/a\xF1o`, lectura: a.horasSupuestas ? "supuesto: no hay dos lecturas del hor\xF3metro" : "de las lecturas del hor\xF3metro" }
      ]
    });
  }
  return bloques;
}

// src/vista/ingenieria.ts
function bloque(b, acciones) {
  return h(
    "section",
    { class: `tarjeta ingenieria-bloque ${b.clave}` },
    h("h2", {}, b.titulo),
    b.falta !== void 0 && h(
      "div",
      { class: "ingenieria-falta" },
      h("p", {}, b.falta.texto),
      h("button", { type: "button", class: "secundario", onclick: () => acciones.alIr(b.falta.destino) }, b.falta.boton)
    ),
    b.parametros.length > 0 && h(
      "dl",
      { class: "ingenieria-parametros" },
      ...b.parametros.flatMap((p) => [
        h("dt", {}, p.nombre),
        h(
          "dd",
          {},
          p.valor !== void 0 ? h("b", {}, p.valor) : h("span", { class: "sutil" }, "\u2014"),
          p.lectura !== void 0 && h("span", { class: "lectura" }, p.lectura),
          p.fuente !== void 0 && h("span", { class: "sutil fuente" }, p.fuente)
        )
      ])
    ),
    b.nota !== void 0 && h("p", { class: "sutil nota-ingenieria" }, b.nota)
  );
}
function pintarIngenieria(bloques, lastreKg, acciones) {
  return h(
    "div",
    { class: "ingenieria" },
    h(
      "p",
      { class: "sutil" },
      "Lo que se sabe de este barco como ingeniero naval. Cada cifra dice de d\xF3nde sale; lo que falta dice c\xF3mo conseguirlo. Nada de esto cambia la zona de navegaci\xF3n: la asigna la Capitan\xEDa Mar\xEDtima."
    ),
    ...bloques.map((b) => bloque(b, acciones)),
    h(
      "section",
      { class: "tarjeta" },
      h("h2", {}, "Datos que solo se anotan aqu\xED"),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Masa del lastre (kg)"),
        h("input", {
          type: "number",
          inputmode: "decimal",
          step: "1",
          min: "0",
          valor: lastreKg !== void 0 ? String(lastreKg) : "",
          placeholder: "de la placa, el plano o el fabricante",
          onchange: (e) => {
            const v = Number(e.target.value.replace(",", "."));
            acciones.alCambiarLastre(Number.isFinite(v) && v > 0 ? v : void 0);
          }
        }),
        h("span", { class: "sutil" }, "No sale de las formas del casco. Con \xE9l se calcula la relaci\xF3n lastre-desplazamiento.")
      )
    )
  );
}

// src/vista/balance.ts
var num4 = (v, d = 2) => v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
var pct = (v) => `${v >= 0 ? "+" : "\u2212"}${num4(Math.abs(v) * 100, 1)} %`;
var NS = "http://www.w3.org/2000/svg";
function el(t, a, texto) {
  const e = document.createElementNS(NS, t);
  for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v));
  if (texto !== void 0) e.textContent = texto;
  return e;
}
function graficoSenal(muestras, r, unidad = "\xB0/s") {
  const W = 640, H = 220, m2 = { i: 44, d: 10, a: 10, b: 30 };
  const paso = Math.max(1, Math.ceil(muestras.length / 700));
  const pts = muestras.filter((_, i) => i % paso === 0);
  const t0 = pts[0]?.t ?? 0, t1 = Math.max(t0 + 1, pts.at(-1)?.t ?? 1);
  const amp = Math.max(0.5, ...pts.map((p) => Math.abs(p.v)));
  const X = (t) => m2.i + (t - t0) / (t1 - t0) * (W - m2.i - m2.d);
  const Y = (v) => m2.a + (amp - v) / (2 * amp) * (H - m2.a - m2.b);
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "grafico-gz grafico-balance", role: "img", "aria-label": "Se\xF1al de balance y ajuste" });
  svg.append(el("line", { x1: m2.i, x2: W - m2.d, y1: Y(0), y2: Y(0), class: "cero" }));
  for (let s = Math.ceil(t0 / 5) * 5; s <= t1; s += 5) svg.append(el("text", { x: X(s), y: H - 10, "text-anchor": "middle", class: "eje" }, `${num4(s - t0, 0)} s`));
  svg.append(el("text", { x: m2.i - 6, y: Y(amp) + 10, "text-anchor": "end", class: "eje" }, num4(amp, 1)));
  svg.append(el("text", { x: m2.i - 6, y: Y(-amp), "text-anchor": "end", class: "eje" }, num4(-amp, 1)));
  svg.append(el("text", { x: m2.i + 4, y: m2.a + 10, class: "eje" }, unidad));
  svg.append(el("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${X(p.t).toFixed(1)},${Y(p.v).toFixed(1)}`).join(""), class: "curva senal" }));
  const a = r?.analisis?.ajuste;
  if (a) {
    const d = [];
    for (let t = a.t0; t <= a.t1; t += 0.04) {
      const tau = t - a.t0;
      d.push(`${d.length ? "L" : "M"}${X(t).toFixed(1)},${Y(a.amplitud * Math.exp(-a.sigma * tau) * Math.cos(a.omega * tau + a.fase) + a.c).toFixed(1)}`);
    }
    svg.append(el("path", { d: d.join(""), class: "curva curva-1 ajuste" }));
  }
  return svg;
}
function cifra(valor2, texto, clase = "") {
  return h("div", { class: `cifra ${clase}` }, h("b", {}, valor2), h("span", {}, texto));
}
function formularioReferencia(r, gmExp, alMarcar) {
  if (r.medida.referencia) {
    return h(
      "div",
      { class: "referencia-balance" },
      h("p", {}, h("b", {}, "Es la prueba de referencia del barco. "), `GM ${num4(r.medida.referencia.gm, 3)} \xB1 ${num4(r.medida.referencia.errorGm, 3)} m (${r.medida.referencia.origen}).`),
      h("button", { class: "sutil", onclick: () => alMarcar(r.medida.id, void 0) }, "Dejar de usarla como referencia")
    );
  }
  let gm = gmExp?.gm ?? NaN, err = gmExp?.errorGm ?? 0.02, origen = gmExp?.origen ?? "";
  return h(
    "details",
    { class: "referencia-balance" },
    h("summary", {}, "Usar esta prueba como referencia (calibrar el barco)"),
    h(
      "p",
      { class: "sutil" },
      "Haga esta prueba el mismo d\xEDa que la experiencia de estabilidad, en la misma condici\xF3n de carga. Con el GM conocido se despeja la C de este barco, y las pruebas siguientes dan el GM con el error del periodo."
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "GM conocido (m)"),
      h("input", { type: "number", step: "0.001", inputmode: "decimal", valor: Number.isNaN(gm) ? "" : String(Math.round(gm * 1e3) / 1e3), oninput: (e) => {
        gm = Number(e.target.value.replace(",", "."));
      } })
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Incertidumbre (m)"),
      h("input", { type: "number", step: "0.001", inputmode: "decimal", valor: String(Math.round(err * 1e3) / 1e3), oninput: (e) => {
        err = Number(e.target.value.replace(",", "."));
      } })
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "De d\xF3nde sale"),
      h("input", { type: "text", valor: origen, placeholder: "Experiencia de estabilidad del \u2026", oninput: (e) => {
        origen = e.target.value;
      } })
    ),
    h("button", { onclick: () => {
      if (gm > 0) alMarcar(r.medida.id, { gm, errorGm: err > 0 ? err : 0.02, origen: origen.trim() || "GM conocido" });
    } }, "Calibrar con este GM")
  );
}
function resultado(r, d, acciones) {
  const a = r.analisis, e = r.estimacion;
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, `Prueba del ${fechaLarga(r.medida.fecha)}${r.medida.simulada ? " \xB7 simulada" : ""}`),
    h("p", { class: "sutil" }, `Condici\xF3n de carga: ${r.medida.condicion || "sin anotar"} \xB7 ${r.medida.muestras.length} muestras \xB7 ${r.medida.magnitud === "velocidad" ? "gir\xF3scopo" : "aceler\xF3metro"}`),
    r.error !== void 0 && h("p", { class: "salvedad" }, `\u26A0 ${r.error}`),
    a && h(
      "div",
      { class: "cifras cifras-analisis" },
      cifra(`${num4(a.periodo, 2)} s`, `periodo natural \xB1 ${num4(a.errorPeriodo, 2)}`),
      e && cifra(`${num4(e.gm, 2)} m`, `GM \xB1 ${num4(e.errorGm, 2)} \xB7 ${e.metodo === "calibrado" ? "calibrado" : "sin calibrar, orientativo"}`, e.metodo === "calibrado" ? "verde" : ""),
      r.cambio && cifra(pct(r.cambio.cambioGM), `GM frente a la referencia \xB1 ${num4(r.cambio.errorCambioGM * 100, 1)} %`, r.cambio.cambioGM < -2 * r.cambio.errorCambioGM ? "rojo" : ""),
      cifra(num4(a.amortiguamiento, 3), "amortiguamiento \u03B6"),
      cifra(num4(a.ciclos, 1), "ciclos \xFAtiles"),
      cifra(`${num4(a.amplitudAngulo, 1)}\xB0`, "amplitud inicial")
    ),
    graficoSenal(r.medida.muestras, r, r.medida.magnitud === "velocidad" ? "\xB0/s" : "\xB0"),
    h(
      "p",
      { class: "leyenda-balance sutil" },
      h("span", { class: "muestra senal" }),
      " se\xF1al del tel\xE9fono  ",
      h("span", { class: "muestra curva-1" }),
      " oscilaci\xF3n amortiguada ajustada",
      a ? ` (R\xB2 ${num4(a.r2, 3)})` : ""
    ),
    ...(a?.avisos ?? []).map((x) => h("p", { class: "salvedad" }, x.startsWith("\u2717") ? x : `\u26A0 ${x}`)),
    e && h("p", { class: e.metodo === "calibrado" ? "sutil" : "salvedad" }, e.metodo === "calibrado" ? e.explicacion : `\u26A0 ${e.explicacion} Para que el GM sirva, calibre el barco con una experiencia de estabilidad.`),
    a && formularioReferencia(r, d.gmExperiencia, acciones.marcarReferencia),
    h("button", { class: "sutil", onclick: () => acciones.borrar(r.medida.id) }, "Borrar esta prueba")
  );
}
function tablaHuella(d, acciones) {
  const filas = [...d.huella.resultados].reverse();
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Huella de balance del barco"),
    h(
      "p",
      { class: "sutil" },
      "Todas las pruebas, la m\xE1s reciente arriba. La comparaci\xF3n con la referencia no depende de ning\xFAn coeficiente (GM\u2082/GM\u2081 = (T\u2081/T\u2082)\xB2), pero solo vale en la misma condici\xF3n de carga."
    ),
    h(
      "table",
      { class: "tabla-estabilidad tabla-huella" },
      h("thead", {}, h("tr", {}, ...["Fecha", "Condici\xF3n", "T (s)", "GM (m)", "\u0394GM", ""].map((t) => h("th", {}, t)))),
      h("tbody", {}, ...filas.map((r) => h(
        "tr",
        {
          class: `${r.medida.id === d.seleccionada ? "elegida" : ""} ${r.analisis?.valida === false ? "invalida" : ""}`,
          onclick: () => acciones.seleccionar(r.medida.id)
        },
        h("td", {}, r.medida.fecha, r.medida.simulada ? " (sim.)" : ""),
        // La condición entera está en el detalle de la prueba; aquí, lo justo para reconocerla.
        h("td", { title: r.medida.condicion }, r.medida.condicion.length > 22 ? `${r.medida.condicion.slice(0, 20)}\u2026` : r.medida.condicion || "\u2014"),
        h("td", {}, r.analisis ? `${num4(r.analisis.periodo, 2)} \xB1 ${num4(r.analisis.errorPeriodo, 2)}` : "\u2014"),
        h("td", {}, r.estimacion ? `${num4(r.estimacion.gm, 2)} \xB1 ${num4(r.estimacion.errorGm, 2)}` : "\u2014"),
        h("td", {}, r.cambio ? `${pct(r.cambio.cambioGM)} \xB1 ${num4(r.cambio.errorCambioGM * 100, 1)} %` : r.medida.referencia ? "referencia" : "\u2014"),
        h("td", {}, r.analisis?.valida === false ? "no v\xE1lida" : r.medida.referencia ? "\u2605" : "")
      )))
    )
  );
}
function dimensiones(d, alCambiar) {
  const nuevo = { B: d.dim.B, d: d.dim.d, Lwl: d.dim.Lwl };
  const campo2 = (etiqueta, clave) => h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, etiqueta),
    h("input", {
      type: "number",
      step: "0.01",
      inputmode: "decimal",
      valor: String(Math.round(nuevo[clave] * 100) / 100),
      oninput: (e) => {
        nuevo[clave] = Number(e.target.value.replace(",", "."));
      }
    })
  );
  let tipo = d.dim.tipo ?? "velero";
  return h(
    "details",
    { class: "tarjeta" },
    h("summary", {}, "Tipo de barco y dimensiones (estimaci\xF3n sin calibrar)"),
    h(
      "p",
      { class: "sutil" },
      `Solo cuentan sin referencia. Velero: C medida en cinco veleros de la FNB (Romero 2024; Arbona 2024). Motor: C del C\xF3digo IS 2008 (parte A, 2.3.4), pensada para buques. Dimensiones ahora: ${d.dimOrigen}.`
    ),
    h(
      "label",
      { class: "campo" },
      h("span", { class: "campo-etiqueta" }, "Tipo"),
      h(
        "select",
        { onchange: (e) => {
          tipo = e.target.value;
        } },
        h("option", { value: "velero", selected: tipo === "velero" }, "Velero"),
        h("option", { value: "motor", selected: tipo === "motor" }, "Motor")
      )
    ),
    campo2("Manga m\xE1xima B (m)", "B"),
    campo2("Calado medio del casco d, sin quilla (m)", "d"),
    campo2("Eslora en la flotaci\xF3n (m)", "Lwl"),
    h("button", { onclick: () => alCambiar({ ...nuevo, tipo }) }, "Guardar"),
    h("button", { class: "sutil", onclick: () => alCambiar(void 0) }, "Volver a las de las formas")
  );
}
function pintarBalance(d, acciones) {
  let condicion = "M\xEDnima operaci\xF3n: tanques como est\xE9n, dos personas en la ba\xF1era";
  let segundos = 45;
  const elegida = d.huella.resultados.find((r) => r.medida.id === d.seleccionada) ?? d.huella.resultados.at(-1);
  return h(
    "div",
    { class: "estabilidad balance" },
    h(
      "div",
      { class: "tarjeta destacada" },
      h("h2", {}, d.nombreBarco ? `Prueba de balance \xB7 ${d.nombreBarco}` : "Prueba de balance"),
      h(
        "p",
        {},
        "El tel\xE9fono mide el periodo natural de balance del barco. Del periodo sale el GM: con precisi\xF3n si el barco ya se calibr\xF3 con una experiencia de estabilidad, y como orden de magnitud si no. Repetida cada a\xF1o, en la misma condici\xF3n, avisa si la estabilidad ha bajado."
      ),
      h(
        "ol",
        { class: "pasos-balance" },
        h("li", {}, "Amarras flojas y defensas separadas del muelle. Nadie movi\xE9ndose a bordo."),
        h("li", {}, "Tel\xE9fono tumbado en la ba\xF1era, sobre la l\xEDnea de cruj\xEDa, con la parte de arriba hacia proa."),
        h("li", {}, "Pulse \xABRegistrar\xBB. D\xE9 balance al barco (una persona en la regala que se balancea unas veces, o tirando de un obenque) hasta unos 3-5\xB0 y su\xE9ltelo."),
        h("li", {}, "Quieto hasta que acabe. Mejor dos o tres pruebas seguidas.")
      ),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Condici\xF3n de carga"),
        h("input", { type: "text", valor: condicion, oninput: (e) => {
          condicion = e.target.value;
        } }),
        h("small", { class: "campo-ayuda" }, "An\xF3tela bien: el a\xF1o que viene hay que repetir la prueba en la misma.")
      ),
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Duraci\xF3n (s)"),
        h("input", { type: "number", step: "5", min: "20", valor: "45", style: "width:6em", oninput: (e) => {
          segundos = Number(e.target.value) || 45;
        } })
      ),
      h("button", {
        class: "principal",
        disabled: !d.sensor.disponible || d.registrando !== void 0,
        onclick: () => acciones.registrar(segundos, condicion)
      }, d.registrando ? `Registrando\u2026 ${Math.round(d.registrando.fraccion * 100)} %` : "\u25CF Registrar el balance"),
      !d.sensor.disponible && h("p", { class: "salvedad" }, `\u26A0 ${d.sensor.motivo ?? "Sin sensores de movimiento."} En el ordenador puede importar un CSV o cargar pruebas simuladas.`),
      h(
        "div",
        { class: "botones-balance" },
        h(
          "label",
          { class: "boton-fichero sutil" },
          "Importar CSV (phyphox, Sensor Logger\u2026)",
          h("input", { type: "file", accept: ".csv,.txt,text/csv", onchange: (e) => {
            const f = e.target.files?.[0];
            if (f) acciones.importar(f, condicion);
          } })
        ),
        h("button", { class: "sutil", onclick: acciones.cargarSimuladas }, "Cargar dos pruebas simuladas (referencia y un a\xF1o despu\xE9s)")
      ),
      !d.enExpediente && h("p", { class: "sutil" }, "Sin expediente abierto, las pruebas solo viven en esta pesta\xF1a. \xC1bralas desde el expediente del barco para guardar su huella.")
    ),
    d.registrando && h("div", { class: "tarjeta" }, h("h2", {}, "Registrando"), graficoSenal(d.registrando.muestras)),
    d.huella.alerta && h(
      "div",
      { class: `alerta-balance ${d.huella.alerta.nivel}` },
      h("b", {}, `${d.huella.alerta.nivel === "urgente" ? "!" : "\u203A"} ${d.huella.alerta.titulo}`),
      h("p", {}, d.huella.alerta.detalle)
    ),
    elegida && resultado(elegida, d, acciones),
    d.huella.resultados.length > 0 && tablaHuella(d, acciones),
    dimensiones(d, acciones.cambiarDimensiones),
    h(
      "div",
      { class: "tarjeta metodo-balance" },
      h("h2", {}, "M\xE9todo"),
      h(
        "p",
        { class: "sutil" },
        "Se\xF1al remuestreada a 25 Hz; pico del espectro entre 1 y 10 s; ajuste por m\xEDnimos cuadrados de una oscilaci\xF3n amortiguada desde que se suelta el barco; incertidumbre del periodo, la mayor entre la del ajuste y la dispersi\xF3n ciclo a ciclo. GM = (2\xB7C\xB7B/T)\xB2, con la C de este barco si est\xE1 calibrado; si no, la media de cinco veleros medidos en la FNB (Romero 2024; Arbona 2024) o, en un barco a motor, la del C\xF3digo IS 2008 (parte A, 2.3.4). Esos cinco veleros muestran que la C del C\xF3digo, pensada para buques, subestima el GM de un velero en m\xE1s de un 30 %. El C\xF3digo recomienda vigilar la estabilidad por el periodo de balance (parte B, 3.6.3.1; anexo 2, 3.3.4). Validado con balances simulados por integraci\xF3n de la ecuaci\xF3n del balance (ADR-022)."
      )
    )
  );
}

// ../itb-estabilidad/src/experiencia.ts
function regalaEn(formas, x) {
  const s = formas.secciones;
  for (let i = 0; i + 1 < s.length; i++) {
    const a = s[i], b = s[i + 1];
    if (x >= a.x && x <= b.x) {
      const pa = a.puntos.at(-1), pb = b.puntos.at(-1);
      const t = (x - a.x) / (b.x - a.x);
      return [pa[0] + t * (pb[0] - pa[0]), pa[1] + t * (pb[1] - pa[1])];
    }
  }
  throw new Error(`francobordo fuera de las formas en x = ${x}`);
}
var alturaSobreAgua = (f, p) => {
  const n = normal2(f);
  return n[0] * p[0] + n[1] * p[1] + n[2] * p[2] - f.c;
};
function flotacionDesdeFrancobordos(formas, lecturas, densidad) {
  if (lecturas.length < 3) throw new Error("hacen falta al menos tres francobordos para fijar el plano");
  const puntos = lecturas.map((l) => {
    const [y, z] = regalaEn(formas, l.x);
    return { p: [l.x, l.banda === "estribor" ? y : -y, z], medido: l.francobordo };
  });
  let q = [0, 0, 0];
  q[0] = puntos.reduce((s, k) => s + k.p[2] - k.medido, 0) / puntos.length;
  const residuos = (v) => {
    const f = { c: v[0], trimado: v[1], escora: v[2] };
    return puntos.map((k) => alturaSobreAgua(f, k.p) - k.medido);
  };
  for (let it = 0; it < 30; it++) {
    const r2 = residuos(q);
    const h2 = 1e-7;
    const J = r2.map(() => [0, 0, 0]);
    for (let j = 0; j < 3; j++) {
      const qj = [...q];
      qj[j] += h2;
      const rj = residuos(qj);
      rj.forEach((v, i) => {
        J[i][j] = (v - r2[i]) / h2;
      });
    }
    const A = [0, 1, 2].map((a) => [0, 1, 2].map((b) => J.reduce((s, fila) => s + fila[a] * fila[b], 0)));
    const g = [0, 1, 2].map((a) => -J.reduce((s, fila, i) => s + fila[a] * r2[i], 0));
    const d = resolver3(A, g);
    q = q.map((v, i) => v + d[i]);
    if (Math.max(...d.map(Math.abs)) < 1e-10) break;
  }
  const flotacion = { c: q[0], trimado: q[1], escora: q[2] };
  const r = residuos(q);
  const volumen = carena(formas, flotacion).volumen;
  return {
    flotacion,
    volumen,
    desplazamiento: volumen * densidad,
    residuo: Math.sqrt(r.reduce((s, v) => s + v * v, 0) / r.length)
  };
}
function resolver3(A, b) {
  const m2 = A.map((fila, i) => [...fila, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c;
    for (let f = c + 1; f < 3; f++) if (Math.abs(m2[f][c]) > Math.abs(m2[p][c])) p = f;
    [m2[c], m2[p]] = [m2[p], m2[c]];
    if (Math.abs(m2[c][c]) < 1e-15) throw new Error("francobordos insuficientes para fijar el plano (\xBFtodos en una banda o en una secci\xF3n?)");
    for (let f = 0; f < 3; f++) {
      if (f === c) continue;
      const k = m2[f][c] / m2[c][c];
      for (let k2 = c; k2 < 4; k2++) m2[f][k2] -= k * m2[c][k2];
    }
  }
  return [0, 1, 2].map((i) => m2[i][3] / m2[i][i]);
}
function metacentroEnFlotacion(formas, f) {
  const car = carena(formas, f);
  const sT = Math.sin(f.trimado), cT = Math.cos(f.trimado);
  const sP = Math.sin(f.escora), cP = Math.cos(f.escora);
  let I = 0, previo;
  for (const s of formas.secciones) {
    const k = (f.c + s.x * sT) / cT;
    const b = cuerdaEn(poligonoSeccion(s), -sP, cP, k);
    if (previo) I += (previo.b ** 3 + b ** 3) / 24 * (s.x - previo.x);
    previo = { x: s.x, b };
  }
  return { kb: car.centro[2], km: car.centro[2] + I / car.volumen, lcb: car.centro[0] };
}
function cuerdaEn(pol, a, b, k) {
  const ts = [];
  for (let i = 0; i < pol.length; i++) {
    const p = pol[i], q = pol[(i + 1) % pol.length];
    const fp = a * p[0] + b * p[1] - k, fq = a * q[0] + b * q[1] - k;
    if (fp < 0 && fq >= 0 || fp >= 0 && fq < 0) {
      const t = fp / (fp - fq);
      ts.push(b * (p[0] + t * (q[0] - p[0])) - a * (p[1] + t * (q[1] - p[1])));
    }
  }
  ts.sort((m2, n) => m2 - n);
  let L = 0;
  for (let i = 0; i + 1 < ts.length; i += 2) L += ts[i + 1] - ts[i];
  return L;
}
function regresion(x, y) {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (x[i] - mx) ** 2;
    sxy += (x[i] - mx) * (y[i] - my);
    syy += (y[i] - my) ** 2;
  }
  const pendiente = sxy / sxx, ordenada = my - pendiente * mx;
  const residuos = x.map((xi, i) => y[i] - (ordenada + pendiente * xi));
  const sse = residuos.reduce((s, r) => s + r * r, 0);
  return {
    pendiente,
    ordenada,
    r2: syy > 0 ? 1 - sse / syy : 1,
    errorPendiente: n > 2 ? Math.sqrt(sse / (n - 2) / sxx) : Infinity,
    residuos
  };
}
function analizarExperiencia(formas, d) {
  const avisos = [];
  let valida = true;
  const flotacion = flotacionDesdeFrancobordos(formas, d.francobordos, d.densidad);
  const D = flotacion.desplazamiento;
  const inicial = d.estados[0];
  const momentos = d.estados.map(
    (e) => d.pesos.reduce((s, p) => s + p.masa * ((e[p.id] ?? 0) - (inicial[p.id] ?? 0)), 0)
  );
  const instrumentos = d.instrumentos.map((ins) => {
    const tangentes = ins.lecturas.map(
      (l) => ins.tipo === "pendulo" ? l / ins.longitud : Math.tan(l * Math.PI / 180)
    );
    const recta = regresion(momentos, tangentes);
    const gm2 = 1 / (D * recta.pendiente);
    const errorGm = gm2 * recta.errorPendiente / Math.abs(recta.pendiente);
    const sospechosos = puntosSospechosos(momentos, tangentes);
    return { nombre: ins.nombre, tipo: ins.tipo, tangentes, recta, gm: gm2, errorGm, sospechosos };
  });
  const pendulos = instrumentos.filter((i) => i.tipo === "pendulo");
  if (pendulos.length === 0) {
    valida = false;
    avisos.push("Sin p\xE9ndulo: los inclin\xF3metros solo valen junto a un p\xE9ndulo como m\xEDnimo (C\xF3digo IS 2008, anexo 1, 2.4.7 y 8.2.2.9).");
  } else if (pendulos.length < 2) {
    avisos.push("Un solo p\xE9ndulo: se recomiendan tres y como m\xEDnimo dos, para detectar lecturas err\xF3neas (8.2.2.9).");
  }
  const movimientos = d.estados.length - 1;
  if (movimientos < 6) {
    valida = false;
    avisos.push(`Solo ${movimientos} movimientos de pesos: la prueba normalizada tiene ocho, y como m\xEDnimo la posici\xF3n inicial y seis (8.4.1.2).`);
  }
  const ref = pendulos[0] ?? instrumentos[0];
  const escoras = ref.tangentes.map((t2) => Math.atan(t2) * 180 / Math.PI);
  const rel = escoras.map((e) => e - escoras[0]);
  const maxEst = Math.max(...rel), maxBab = -Math.min(...rel);
  if (maxEst > 4 || maxBab > 4) avisos.push(`Escora de hasta ${Math.max(maxEst, maxBab).toFixed(1)}\xB0: no debe pasar de 4\xB0 a cada banda (8.2.2.8).`);
  if (maxEst < 1 || maxBab < 1) {
    valida = false;
    avisos.push(`Escora m\xE1xima de ${maxEst.toFixed(1)}\xB0 a estribor y ${maxBab.toFixed(1)}\xB0 a babor: tiene que llegar a 1\xB0 a cada banda como m\xEDnimo (8.2.2.8).`);
  }
  for (const [i, ins] of d.instrumentos.entries()) {
    if (ins.tipo !== "pendulo") continue;
    const deflexion = Math.max(...ins.lecturas.map((l) => Math.abs(l - ins.lecturas[0])));
    if (deflexion < 0.15) {
      avisos.push(
        `${ins.nombre}: deflexi\xF3n m\xE1xima de ${(deflexion * 100).toFixed(1)} cm, menos de los 15 cm recomendados (anexo 1, 2.4.1). En buques peque\xF1os se admite adaptar el procedimiento (8.1.6); la precisi\xF3n que se pierde queda en el error t\xEDpico de GM.`
      );
    }
    void i;
  }
  for (const r of instrumentos) {
    if (r.recta.r2 < 0.99) avisos.push(`${r.nombre}: los puntos no se alinean bien (R\xB2 = ${r.recta.r2.toFixed(3)}); ver figuras A1-4.3.2-2 a -5 (l\xEDquido libre, casco que toca, viento).`);
    if (r.sospechosos.length > 0) avisos.push(`${r.nombre}: los estados ${r.sospechosos.join(", ")} se apartan de la recta; repetirlos o explicarlos (anexo 1, 4.3.2).`);
  }
  for (const banda2 of ["babor", "estribor"]) {
    const n = d.francobordos.filter((l) => l.banda === banda2).length;
    if (n < 5) avisos.push(`${n} lecturas de francobordo a ${banda2}: se recomiendan cinco por banda como m\xEDnimo (8.4.1.1).`);
  }
  if (flotacion.residuo > 0.01) avisos.push(`Los francobordos no casan con un plano (residuo ${(flotacion.residuo * 1e3).toFixed(0)} mm): repetir las lecturas (anexo 1, 4.2.8).`);
  const gm = (pendulos.length > 0 ? pendulos : instrumentos).reduce((s, r) => s + r.gm, 0) / (pendulos.length > 0 ? pendulos.length : instrumentos.length);
  const { km, lcb } = metacentroEnFlotacion(formas, flotacion.flotacion);
  const fsc = (d.superficiesLibres ?? []).reduce((s, t2) => s + t2.segundoMomento * t2.densidad, 0) / D;
  const kg2 = km - gm - fsc;
  const t = flotacion.flotacion.trimado;
  const zB = carena(formas, flotacion.flotacion).centro[2];
  const lcg = lcb - (kg2 - zB) * Math.tan(t);
  return {
    flotacion,
    momentos,
    instrumentos,
    gm,
    km,
    correccionSuperficieLibre: fsc,
    kg: kg2,
    lcg,
    escoras,
    avisos,
    valida
  };
}
function puntosSospechosos(x, y) {
  if (x.length < 5) return [];
  return x.flatMap((xi, i) => {
    const xs = x.filter((_, k) => k !== i), ys = y.filter((_, k) => k !== i);
    const r = regresion(xs, ys);
    const disp = Math.sqrt(r.residuos.reduce((s, v) => s + v * v, 0) / (xs.length - 2));
    const resto = y[i] - (r.ordenada + r.pendiente * xi);
    return Math.abs(resto) > Math.max(3 * disp, 1e-3) ? [i] : [];
  });
}
function aRosca(prueba, retirar, anadir) {
  return sumarPartidas([
    { nombre: "Barco en la prueba", masa: prueba.masa, x: prueba.lcg, z: prueba.kg },
    ...retirar.map((p) => ({ ...p, masa: -p.masa })),
    ...anadir
  ]);
}

// ../itb-estabilidad/src/simulacion-experiencia.ts
function simularExperiencia(formas, barco2, plan) {
  const mPesos = plan.pesos.reduce((s, p) => s + p.masa, 0);
  const masa = barco2.masa + mPesos;
  const volumen = masa / plan.densidad;
  const gEn = (estado2) => {
    let mx = barco2.masa * barco2.g[0], my = barco2.masa * barco2.g[1], mz = barco2.masa * barco2.g[2];
    for (const p of plan.pesos) {
      mx += p.masa * p.x;
      my += p.masa * (estado2[p.id] ?? 0);
      mz += p.masa * p.z;
    }
    return [mx / masa, my / masa, mz / masa];
  };
  let previa;
  const equilibrios = plan.estados.map((estado2) => {
    const g = gEn(estado2);
    const gz = (phi) => {
      const eq = equilibrio(formas, { volumen, g }, phi, previa);
      return { gz: eq.gz, eq };
    };
    let a = -radianes(8), b = radianes(8);
    let fa = gz(a).gz, fb = gz(b).gz;
    let sol = gz(0).eq;
    for (let k = 0; k < 60; k++) {
      const m2 = (a + b) / 2;
      const r = gz(m2);
      sol = r.eq;
      if (Math.abs(b - a) < 1e-9) break;
      if (Math.sign(r.gz) === Math.sign(fa)) {
        a = m2;
        fa = r.gz;
      } else {
        b = m2;
        fb = r.gz;
      }
    }
    void fb;
    previa = sol.flotacion;
    return sol;
  });
  const escoras = equilibrios.map((e) => e.flotacion.escora * 180 / Math.PI);
  const inicial = equilibrios[0].flotacion;
  const francobordos = [];
  for (const x of plan.francobordosEn) {
    for (const banda2 of ["babor", "estribor"]) {
      const s = formas.secciones;
      const i = s.findIndex((q, k) => k + 1 < s.length && x >= q.x && x <= s[k + 1].x);
      const a = s[i], b = s[i + 1];
      const t = (x - a.x) / (b.x - a.x);
      const pa = a.puntos.at(-1), pb = b.puntos.at(-1);
      const y = pa[0] + t * (pb[0] - pa[0]), z = pa[1] + t * (pb[1] - pa[1]);
      const n = normal2(inicial);
      const p = [x, banda2 === "estribor" ? y : -y, z];
      francobordos.push({ x, banda: banda2, francobordo: n[0] * p[0] + n[1] * p[1] + n[2] * p[2] - inicial.c });
    }
  }
  const instrumentos = [
    ...plan.pendulos.map((p) => ({
      nombre: p.nombre,
      tipo: "pendulo",
      longitud: p.longitud,
      lecturas: equilibrios.map((e) => p.longitud * Math.tan(e.flotacion.escora))
    })),
    ...plan.inclinometro ? [{ nombre: "Tel\xE9fono", tipo: "inclinometro", lecturas: escoras }] : []
  ];
  return {
    datos: {
      pesos: plan.pesos.map(({ id, masa: masa2 }) => ({ id, masa: masa2 })),
      estados: plan.estados,
      instrumentos,
      francobordos,
      densidad: plan.densidad
    },
    verdad: { masa, g: gEn(plan.estados[0]), escoras, flotacionInicial: inicial }
  };
}
function planOchoMovimientos(masaGrupo, yBanda, x, z) {
  const pesos = ["A", "B", "C", "D"].map((id) => ({ id, masa: masaGrupo, x, z }));
  const B = -yBanda, E = yBanda;
  const estados = [
    { A: B, B, C: E, D: E },
    // 0 inicial
    { A: E, B, C: E, D: E },
    // 1 A a estribor
    { A: E, B: E, C: E, D: E },
    // 2 B a estribor
    { A: B, B: E, C: E, D: E },
    // 3 A vuelve
    { A: B, B, C: E, D: E },
    // 4 B vuelve: inicio
    { A: B, B, C: B, D: E },
    // 5 C a babor
    { A: B, B, C: B, D: B },
    // 6 D a babor
    { A: B, B, C: E, D: B },
    // 7 C vuelve
    { A: B, B, C: E, D: E }
    // 8 D vuelve: inicio
  ];
  return { pesos, estados };
}

// ../itb-estabilidad/src/apendices.ts
function semiespesorNaca(tc, xi) {
  const s = Math.min(1, Math.max(0, xi));
  return 5 * tc * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s ** 2 + 0.2843 * s ** 3 - 0.1036 * s ** 4);
}
function cuerpoAleta(a, opciones = {}) {
  const nS = opciones.secciones ?? 41;
  const nZ = opciones.puntosEnvergadura ?? 24;
  const tanF = Math.tan(a.flecha * Math.PI / 180);
  const cuerda = (d) => a.cuerdaRaiz + (a.cuerdaPunta - a.cuerdaRaiz) * (d / a.envergadura);
  const cuartoCuerda = (d) => a.xBordeAtaqueRaiz - 0.25 * a.cuerdaRaiz - d * tanF;
  const bordeAtaque = (d) => cuartoCuerda(d) + 0.25 * cuerda(d);
  const tc = (d) => a.espesorRaiz + (a.espesorPunta - a.espesorRaiz) * (d / a.envergadura);
  let xMin = Infinity, xMax = -Infinity;
  for (let i = 0; i <= nZ; i++) {
    const d = a.envergadura * i / nZ;
    xMax = Math.max(xMax, bordeAtaque(d));
    xMin = Math.min(xMin, bordeAtaque(d) - cuerda(d));
  }
  const secciones = Array.from({ length: nS }, (_, j) => {
    const x = xMin + (xMax - xMin) * j / (nS - 1);
    const estribor = [];
    for (let i = 0; i <= nZ; i++) {
      const d = a.envergadura * i / nZ;
      const xi = (bordeAtaque(d) - x) / cuerda(d);
      if (xi <= 0 || xi >= 1) continue;
      estribor.push([semiespesorNaca(tc(d), xi) * cuerda(d), a.zRaiz - d]);
    }
    const babor = [...estribor].reverse().map(([y, z]) => [-y, z]);
    return { x, poligono: estribor.length > 1 ? [...estribor, ...babor] : [] };
  });
  return { nombre: a.nombre, secciones };
}
function cuerpoCaseta(formas, c) {
  const n = c.secciones ?? 21;
  const cubiertaEn = (x) => {
    const ss = formas.secciones;
    for (let i = 0; i + 1 < ss.length; i++) {
      const a = ss[i], b = ss[i + 1];
      if (x >= a.x && x <= b.x) {
        const za = a.puntos.at(-1)[1], zb = b.puntos.at(-1)[1];
        return za + (x - a.x) / (b.x - a.x) * (zb - za);
      }
    }
    throw new Error(`caseta fuera de las formas en x = ${x}`);
  };
  const secciones = Array.from({ length: n }, (_, j) => {
    const x = c.x0 + (c.x1 - c.x0) * j / (n - 1);
    const z0 = cubiertaEn(x), z1 = z0 + c.altura, b = c.semimanga;
    const poligono = [[-b, z0], [b, z0], [b, z1], [-b, z1]];
    return { x, poligono };
  });
  return { nombre: c.nombre, secciones };
}
function cuerpoDesdeCortes(nombre, cortes, zTecho, secciones = 81) {
  const orden = [...cortes].sort((a, b) => b.z - a.z);
  const semimanga = (corte2, x) => {
    const p = corte2.puntos;
    if (x < p[0][0] || x > p.at(-1)[0]) return 0;
    for (let i = 0; i + 1 < p.length; i++) {
      if (x >= p[i][0] && x <= p[i + 1][0]) {
        const t = (x - p[i][0]) / (p[i + 1][0] - p[i][0] || 1);
        return p[i][1] + t * (p[i + 1][1] - p[i][1]);
      }
    }
    return 0;
  };
  const xMin = Math.min(...orden.map((c) => c.puntos[0][0]));
  const xMax = Math.max(...orden.map((c) => c.puntos.at(-1)[0]));
  const lista3 = Array.from({ length: secciones }, (_, j) => {
    const x = xMin + (xMax - xMin) * j / (secciones - 1);
    const estribor = [];
    const arriba = semimanga(orden[0], x);
    if (arriba > 0) estribor.push([arriba, Math.max(zTecho(x), orden[0].z)]);
    for (const c of orden) {
      const y = semimanga(c, x);
      if (y <= 0) break;
      estribor.push([y, c.z]);
    }
    const babor = [...estribor].reverse().map(([y, z]) => [-y, z]);
    return { x, poligono: estribor.length > 1 ? [...estribor, ...babor] : [] };
  });
  return { nombre, secciones: lista3 };
}

// ../itb-estabilidad/src/evaluar-barco.ts
var tripulacionMinima = (LH) => LH <= 8 ? 75 : LH <= 16 ? 150 : 225;
function evaluarBarco(e, paso = 5) {
  const { formas } = e;
  let xMin = Infinity, xMax = -Infinity, BH = 0;
  for (const s of formas.secciones) {
    xMin = Math.min(xMin, s.x);
    xMax = Math.max(xMax, s.x);
    for (const [y] of s.puntos) BH = Math.max(BH, 2 * y);
  }
  const LH = xMax - xMin, xMedio = (xMin + xMax) / 2;
  const regalaMedia = alturaRegala(formas, xMedio);
  const tripMin = tripulacionMinima(LH);
  const rosca = { nombre: "Barco en rosca", masa: e.rosca.masa, x: e.rosca.x, z: e.rosca.z };
  const mo = [rosca, { nombre: "Tripulaci\xF3n m\xEDnima", masa: tripMin, ...e.puestoGobierno }, ...e.pertrechos];
  const restoTripulacion = Math.max(0, e.personasMax * 75 - tripMin);
  const ldc = [
    ...mo,
    ...restoTripulacion > 0 ? [{ nombre: "Resto de la tripulaci\xF3n", masa: restoTripulacion, x: xMedio, z: regalaMedia }] : [],
    ...e.carga,
    ...e.tanques.map((t) => ({ nombre: t.nombre, masa: 0.95 * t.capacidad * t.densidad, x: t.x, z: t.z }))
  ];
  const la = [
    ...mo,
    ...restoTripulacion > 0 ? [{ nombre: "Resto de la tripulaci\xF3n", masa: restoTripulacion, x: xMedio, z: regalaMedia }] : [],
    ...e.carga.map((p) => p.viveres ? { ...p, masa: 0.1 * p.masa } : p),
    ...e.tanques.map((t) => ({ nombre: t.nombre, masa: 0.1 * t.capacidad * t.densidad, x: t.x, z: t.z }))
  ];
  const pLdc0 = sumarPartidas(ldc);
  const eqLdc0 = equilibrio(formas, { volumen: pLdc0.masa / RHO, g: pLdc0.g }, 0);
  const TC = eqLdc0.carena.calado;
  const FM = regalaMedia - eqLdc0.flotacion.c;
  const margen = e.rosca.deExperiencia ? 0 : 0.05 * (FM + TC) * e.rosca.masa;
  const conMargen = (p) => ({ masa: p.masa, g: [p.g[0], p.g[1], p.g[2] + margen / p.masa] });
  const pMo = conMargen(sumarPartidas(mo));
  const pLdc = conMargen(pLdc0);
  const pLa0 = conMargen(sumarPartidas(la));
  const sl = subidaSuperficieLibre(e.tanques, "llegada cargada", pLa0.masa, BH);
  const pLa = { masa: pLa0.masa, g: [pLa0.g[0], pLa0.g[1], pLa0.g[2] + sl.subida] };
  const barco2 = { LH, BH, ...e.aparejo };
  const iso = (nombre, p) => {
    const cond = { volumen: p.masa / RHO, g: p.g };
    const curva = curvaGZ(formas, cond, { paso });
    const recta = equilibrio(formas, cond, 0).carena;
    const angulos = angulosInundacion(formas, cond, e.aberturas);
    const menor = (tipo) => {
      const v = angulos.filter((_, i) => e.aberturas[i].tipo === tipo).map((r) => r.escora).filter((x) => x !== void 0);
      return e.aberturas.some((a) => a.tipo === tipo) ? v.length > 0 ? Math.min(...v) : "no-hay" : "no-hay";
    };
    const todos = angulos.map((r) => r.escora).filter((x) => x !== void 0);
    return {
      c: {
        nombre,
        m: p.masa,
        LWL: recta.esloraFlotacion,
        BWL: recta.mangaFlotacion,
        curva,
        phiD: todos.length > 0 ? Math.min(...todos) : void 0,
        phiDA: menor("DA"),
        phiDH: menor("DH"),
        phiDC: menor("DC")
      },
      gm: metacentroTransversal(formas, cond).km - p.g[2]
    };
  };
  const cMo = iso("m\xEDnima operaci\xF3n", pMo);
  const cLa = iso("llegada cargada", pLa);
  const eq = equilibrio(formas, { volumen: pLdc.masa / RHO, g: pLdc.g }, 0);
  const n = normal2(eq.flotacion);
  const aberturasAltura = e.aberturas.map((a) => ({
    nombre: a.nombre,
    alturaMedida: n[0] * a.x + n[1] * a.y + n[2] * a.z - eq.flotacion.c,
    xD: Math.min(a.x - xMin, xMax - a.x),
    xDproa: xMax - a.x,
    yD: Math.max(0, BH / 2 - Math.abs(a.y)),
    areaMm2: a.areaMm2
  }));
  const evaluacion = evaluar3(barco2, [cMo.c, cLa.c], { aberturas: aberturasAltura, VD: pLdc.masa / RHO, FM });
  return {
    formas,
    barco: barco2,
    condiciones: { minimaOperacion: pMo, llegadaCargada: pLa, cargaMaxima: pLdc, superficieLibre: sl },
    gm: { mo: cMo.gm, la: cLa.gm },
    evaluacion,
    isoCondiciones: [cMo.c, cLa.c],
    preliminar: !e.rosca.deExperiencia && Math.min(cMo.gm, cLa.gm) < 1.5,
    FM,
    TC
  };
}
function alturaRegala(formas, x) {
  const s = formas.secciones;
  for (let i = 0; i + 1 < s.length; i++) {
    const a = s[i], b = s[i + 1];
    if (x >= a.x && x <= b.x) {
      const za = a.puntos.at(-1)[1], zb = b.puntos.at(-1)[1];
      return za + (x - a.x) / (b.x - a.x) * (zb - za);
    }
  }
  return Math.max(...s.flatMap((q) => q.puntos.map(([, z]) => z)));
}

// ../itb-estabilidad/datos/sysser01.json
var sysser01_default = { nombre: "Sysser 1 (Standfast 43), escala de modelo", fuente: "IGES: 1 de 2 superficies, unidad MM; TU Delft, DSYHS, doi:10.4121/21501330 (CC0)", secciones: [{ x: -0.271998, puntos: [[0, 0.214876], [225e-6, 0.214947], [895e-6, 0.215157], [1999e-6, 0.215501], [3531e-6, 0.215971], [5503e-6, 0.216557], [791e-5, 0.217241], [0.010719, 0.218003], [0.013897, 0.218862], [0.017423, 0.219882], [0.021285, 0.221101], [0.025446, 0.222468], [0.029871, 0.22395], [0.034559, 0.225602], [0.039374, 0.227478], [0.044333, 0.229657], [0.049322, 0.23214], [0.054289, 0.23494], [0.059192, 0.238124], [0.063814, 0.241833], [0.068018, 0.246026], [0.071801, 0.250609], [0.075012, 0.255577], [0.077375, 0.260896], [0.078911, 0.266432], [0.079562, 0.271959], [0.079466, 0.277388], [0.07883, 0.282541], [0.077879, 0.287416], [0.076984, 0.292001], [0.076145, 0.296279], [0.075368, 0.300248], [0.074657, 0.303879], [0.07402, 0.307127], [0.073461, 0.309986], [0.072984, 0.312422], [0.072588, 0.314444], [0.072275, 0.316041], [0.072051, 0.317187], [0.071917, 0.317872], [0.071872, 0.3181]] }, { x: -0.271632, puntos: [[0, 0.214771], [225e-6, 0.214842], [896e-6, 0.215052], [2001e-6, 0.215397], [3535e-6, 0.215868], [5509e-6, 0.216454], [7919e-6, 0.217139], [0.010732, 0.217902], [0.013914, 0.218761], [0.017445, 0.219782], [0.021312, 0.221002], [0.025478, 0.222371], [0.029908, 0.223854], [0.034602, 0.225508], [0.039423, 0.227385], [0.044389, 0.229566], [0.049384, 0.232051], [0.054358, 0.234854], [0.059268, 0.238041], [0.063896, 0.241752], [0.068108, 0.245949], [0.071898, 0.250535], [0.075116, 0.255507], [0.077487, 0.260829], [0.079031, 0.26637], [0.079689, 0.271902], [0.079599, 0.277338], [0.078966, 0.282497], [0.078017, 0.287379], [0.077121, 0.291969], [0.07628, 0.296253], [0.075502, 0.300226], [0.07479, 0.303861], [0.074152, 0.307114], [0.073592, 0.309976], [0.073114, 0.312415], [0.072718, 0.31444], [0.072405, 0.316039], [0.07218, 0.317185], [0.072046, 0.317872], [0.072001, 0.3181]] }, { x: -0.270534, puntos: [[0, 0.214456], [226e-6, 0.214527], [899e-6, 0.214739], [2008e-6, 0.215085], [3548e-6, 0.215558], [5529e-6, 0.216146], [7948e-6, 0.216833], [0.010771, 0.217598], [0.013966, 0.218459], [0.01751, 0.219481], [0.021392, 0.220705], [0.025573, 0.222078], [0.03002, 0.223566], [0.034732, 0.225224], [0.039572, 0.227105], [0.044556, 0.229292], [0.049571, 0.231785], [0.054564, 0.234596], [0.059494, 0.237791], [0.064145, 0.24151], [0.068378, 0.245715], [0.072188, 0.250313], [0.075428, 0.255296], [0.077824, 0.260628], [0.079391, 0.266183], [0.08007, 0.271732], [0.079998, 0.277186], [0.079376, 0.282366], [0.078431, 0.287266], [0.077532, 0.291875], [0.076685, 0.296174], [0.075903, 0.300162], [0.075188, 0.303809], [0.074548, 0.307073], [0.073985, 0.309947], [0.073506, 0.312395], [0.073107, 0.314427], [0.072793, 0.316031], [0.072568, 0.317182], [0.072433, 0.317871], [0.072388, 0.3181]] }, { x: -0.268706, puntos: [[0, 0.21393], [227e-6, 0.214001], [905e-6, 0.214214], [202e-5, 0.214564], [3569e-6, 0.21504], [5562e-6, 0.215632], [7995e-6, 0.216322], [0.010837, 0.217091], [0.014052, 0.217955], [0.017619, 0.21898], [0.021524, 0.220208], [0.025731, 0.221589], [0.030206, 0.223086], [0.034947, 0.22475], [0.039819, 0.226638], [0.044835, 0.228836], [0.049882, 0.23134], [0.054909, 0.234165], [0.059871, 0.237375], [0.064558, 0.241106], [0.068827, 0.245326], [0.07267, 0.249943], [0.075947, 0.254945], [0.078385, 0.260293], [0.07999, 0.265872], [0.080704, 0.271448], [0.080662, 0.276933], [0.080057, 0.282147], [0.079121, 0.28708], [0.078216, 0.291717], [0.07736, 0.296041], [0.076572, 0.300053], [0.075852, 0.303722], [0.075208, 0.307006], [0.074641, 0.309898], [0.074157, 0.312362], [0.073756, 0.314405], [0.07344, 0.316018], [0.073213, 0.317175], [0.073077, 0.317869], [0.073032, 0.3181]] }, { x: -0.266147, puntos: [[0, 0.21319], [229e-6, 0.213263], [912e-6, 0.213478], [2037e-6, 0.213831], [3599e-6, 0.214312], [5608e-6, 0.21491], [8061e-6, 0.215606], [0.010928, 0.216379], [0.014173, 0.217247], [0.017771, 0.218276], [0.02171, 0.219512], [0.025953, 0.220904], [0.030466, 0.222412], [0.035249, 0.224086], [0.040164, 0.225984], [0.045226, 0.228197], [0.050318, 0.230718], [0.055391, 0.233561], [0.060398, 0.236793], [0.065136, 0.24054], [0.069455, 0.244781], [0.073345, 0.249426], [0.076673, 0.254454], [0.079169, 0.259825], [0.080828, 0.265436], [0.08159, 0.271051], [0.08159, 0.276578], [0.081009, 0.28184], [0.080084, 0.286818], [0.079171, 0.291496], [0.078303, 0.295856], [0.077507, 0.299902], [0.07678, 0.303601], [0.07613, 0.306911], [0.075557, 0.309829], [0.075068, 0.312315], [0.074664, 0.314375], [0.074345, 0.316], [0.074115, 0.317167], [0.073978, 0.317867], [0.073932, 0.3181]] }, { x: -0.262861, puntos: [[0, 0.212236], [232e-6, 0.21231], [922e-6, 0.212528], [2059e-6, 0.212886], [3638e-6, 0.213373], [5667e-6, 0.213978], [8146e-6, 0.214681], [0.011046, 0.215461], [0.014328, 0.216335], [0.017966, 0.217369], [0.021949, 0.218614], [0.026237, 0.22002], [0.030799, 0.221545], [0.035636, 0.223231], [0.040608, 0.225142], [0.045726, 0.227375], [0.050876, 0.229916], [0.056009, 0.232784], [0.061074, 0.236043], [0.065878, 0.239812], [0.070262, 0.24408], [0.074211, 0.24876], [0.077604, 0.253822], [0.080174, 0.259222], [0.081903, 0.264877], [0.082726, 0.270541], [0.082779, 0.276123], [0.082229, 0.281445], [0.081318, 0.286481], [0.080396, 0.291211], [0.079512, 0.295618], [0.078707, 0.299707], [0.077972, 0.303444], [0.077313, 0.30679], [0.076733, 0.309741], [0.076238, 0.312254], [0.075829, 0.314335], [0.075506, 0.315977], [0.075274, 0.317156], [0.075135, 0.317864], [0.075088, 0.3181]] }, { x: -0.258849, puntos: [[0, 0.211065], [235e-6, 0.21114], [933e-6, 0.211362], [2085e-6, 0.211726], [3684e-6, 0.212221], [574e-5, 0.212834], [825e-5, 0.213546], [0.01119, 0.214334], [0.014517, 0.215215], [0.018205, 0.216257], [0.022239, 0.217513], [0.026584, 0.218938], [0.031206, 0.220481], [0.036108, 0.222183], [0.041149, 0.224111], [0.046337, 0.226369], [0.051558, 0.228936], [0.056763, 0.231834], [0.061898, 0.235126], [0.066783, 0.238922], [0.071245, 0.243222], [0.075268, 0.247945], [0.078739, 0.253049], [0.0814, 0.258486], [0.083212, 0.264193], [0.08411, 0.269917], [0.084227, 0.275566], [0.083714, 0.280962], [0.082821, 0.286069], [0.081889, 0.290863], [0.080986, 0.295327], [0.080169, 0.299469], [0.079424, 0.303253], [0.078756, 0.306641], [0.078167, 0.309633], [0.077665, 0.312181], [0.07725, 0.314288], [0.076923, 0.315948], [0.076688, 0.317142], [0.076546, 0.31786], [0.076499, 0.3181]] }, { x: -0.254114, puntos: [[0, 0.209675], [238e-6, 0.209751], [947e-6, 0.209978], [2117e-6, 0.210348], [374e-5, 0.210853], [5825e-6, 0.211476], [8373e-6, 0.212199], [0.011359, 0.212997], [0.01474, 0.213887], [0.018486, 0.214938], [0.022582, 0.216209], [0.026993, 0.217655], [0.031685, 0.219222], [0.036664, 0.220942], [0.041786, 0.22289], [0.047056, 0.225178], [0.052361, 0.227777], [0.057652, 0.230709], [0.062871, 0.234041], [0.06785, 0.237868], [0.072405, 0.242208], [0.076514, 0.246981], [0.080077, 0.252135], [0.082843, 0.257615], [0.084753, 0.263385], [0.085739, 0.269181], [0.085931, 0.274909], [0.085462, 0.280392], [0.08459, 0.285583], [0.083646, 0.290452], [0.082723, 0.294983], [0.081892, 0.299188], [0.081135, 0.303027], [0.080457, 0.306466], [0.079857, 0.309506], [0.079347, 0.312093], [0.078926, 0.314231], [0.078594, 0.315915], [0.078355, 0.317126], [0.078211, 0.317856], [0.078163, 0.3181]] }, { x: -0.24866, puntos: [[0, 0.208063], [242e-6, 0.208141], [963e-6, 0.208373], [2153e-6, 0.208751], [3803e-6, 0.209266], [5924e-6, 0.209902], [8514e-6, 0.210637], [0.011555, 0.211448], [0.014997, 0.212349], [0.018809, 0.213411], [0.022977, 0.214699], [0.027463, 0.216171], [0.032238, 0.217764], [0.037305, 0.219507], [0.04252, 0.221479], [0.047884, 0.223802], [0.053286, 0.226437], [0.058675, 0.229409], [0.063991, 0.232788], [0.069079, 0.236652], [0.073739, 0.241036], [0.077948, 0.245868], [0.081617, 0.25108], [0.084503, 0.256612], [0.086525, 0.262453], [0.087609, 0.268332], [0.087886, 0.274151], [0.087468, 0.279734], [0.086621, 0.285021], [0.085664, 0.289977], [0.084719, 0.294586], [0.083873, 0.298863], [0.083103, 0.302766], [0.082413, 0.306263], [0.081802, 0.309359], [0.081283, 0.311992], [0.080854, 0.314166], [0.080516, 0.315876], [0.080273, 0.317108], [0.080127, 0.317852], [0.080078, 0.3181]] }, { x: -0.242489, puntos: [[0, 0.206228], [246e-6, 0.206308], [981e-6, 0.206545], [2193e-6, 0.206933], [3875e-6, 0.20746], [6035e-6, 0.20811], [8675e-6, 0.208859], [0.011776, 0.209685], [0.015287, 0.210599], [0.019175, 0.211675], [0.023422, 0.212984], [0.027995, 0.214485], [0.032862, 0.216109], [0.038029, 0.217877], [0.04335, 0.219878], [0.04882, 0.222241], [0.054331, 0.224917], [0.059833, 0.227935], [0.065258, 0.231365], [0.070468, 0.235271], [0.075249, 0.239706], [0.07957, 0.244605], [0.083357, 0.249884], [0.086376, 0.255474], [0.088523, 0.261398], [0.089717, 0.26737], [0.090089, 0.273293], [0.089728, 0.278988], [0.08891, 0.284385], [0.087941, 0.289438], [0.086971, 0.294136], [0.08611, 0.298494], [0.085325, 0.30247], [0.084622, 0.306034], [0.083998, 0.309192], [0.083468, 0.311878], [0.083032, 0.314092], [0.082688, 0.315832], [0.082441, 0.317088], [0.082291, 0.317846], [0.082241, 0.3181]] }, { x: -0.235607, puntos: [[0, 0.20417], [252e-6, 0.204252], [1001e-6, 0.204496], [2239e-6, 0.204893], [3956e-6, 0.205434], [616e-5, 0.206099], [8854e-6, 0.206865], [0.012023, 0.207707], [0.01561, 0.208637], [0.019582, 0.20973], [0.02392, 0.211062], [0.028588, 0.212596], [0.033558, 0.214255], [0.038836, 0.216053], [0.044275, 0.218086], [0.049864, 0.220494], [0.055496, 0.223216], [0.061123, 0.226284], [0.066671, 0.229771], [0.072017, 0.233725], [0.076932, 0.238218], [0.081378, 0.243191], [0.085296, 0.248545], [0.088461, 0.254203], [0.090744, 0.26022], [0.092059, 0.266297], [0.092535, 0.272335], [0.092237, 0.278156], [0.091451, 0.283673], [0.090471, 0.288836], [0.089477, 0.293633], [0.088598, 0.298083], [0.087798, 0.30214], [0.08708, 0.305778], [0.086443, 0.309006], [0.085902, 0.31175], [0.085456, 0.314009], [0.085106, 0.315783], [0.084854, 0.317065], [0.084701, 0.31784], [0.084649, 0.3181]] }, { x: -0.228017, puntos: [[0, 0.20189], [257e-6, 0.201974], [1024e-6, 0.202224], [2289e-6, 0.202633], [4046e-6, 0.203187], [6299e-6, 0.203869], [9053e-6, 0.204653], [0.012296, 0.205515], [0.015967, 0.206464], [0.020032, 0.207577], [0.024468, 0.208935], [0.029242, 0.210505], [0.034326, 0.212202], [0.039727, 0.214034], [0.045295, 0.216105], [0.051015, 0.218562], [0.056782, 0.221334], [0.062547, 0.224457], [0.068231, 0.228006], [0.073727, 0.232014], [0.078788, 0.23657], [0.083372, 0.241625], [0.087433, 0.247063], [0.090755, 0.252799], [0.093185, 0.258919], [0.09463, 0.265112], [0.095217, 0.271278], [0.094989, 0.277236], [0.094241, 0.282886], [0.093252, 0.288171], [0.092233, 0.293077], [0.091336, 0.297628], [0.090518, 0.301775], [0.089784, 0.305496], [0.089133, 0.3088], [0.088579, 0.311609], [0.088124, 0.313917], [0.087767, 0.31573], [0.087509, 0.31704], [0.087352, 0.317834], [0.0873, 0.3181]] }, { x: -0.219726, puntos: [[0, 0.19939], [263e-6, 0.199477], [1049e-6, 0.199733], [2345e-6, 0.200153], [4144e-6, 0.200722], [6451e-6, 0.201422], [9271e-6, 0.202226], [0.012595, 0.20311], [0.016358, 0.20408], [0.020523, 0.205217], [0.025067, 0.206605], [0.029958, 0.208214], [0.035167, 0.209953], [0.0407, 0.211823], [0.046409, 0.213936], [0.052273, 0.216444], [0.058188, 0.219272], [0.064105, 0.222454], [0.069938, 0.226069], [0.075597, 0.230135], [0.080819, 0.234763], [0.085553, 0.239906], [0.089768, 0.245437], [0.093257, 0.251263], [0.095841, 0.257495], [0.097425, 0.263817], [0.09813, 0.270122], [0.097979, 0.276229], [0.097273, 0.282025], [0.096279, 0.287443], [0.095236, 0.29247], [0.094318, 0.297131], [0.093481, 0.301377], [0.092731, 0.305187], [0.092064, 0.308575], [0.091497, 0.311453], [0.091031, 0.313817], [0.090666, 0.315671], [0.090402, 0.317012], [0.090242, 0.317827], [0.090188, 0.3181]] }, { x: -0.210739, puntos: [[0, 0.196676], [27e-5, 0.196765], [1076e-6, 0.197028], [2406e-6, 0.197458], [4252e-6, 0.198043], [6617e-6, 0.198761], [9509e-6, 0.199587], [0.01292, 0.200494], [0.016782, 0.201491], [0.021056, 0.202655], [0.025717, 0.204076], [0.030735, 0.205725], [0.036079, 0.207508], [0.041757, 0.209423], [0.047618, 0.211581], [0.053639, 0.214143], [0.059716, 0.217028], [0.065796, 0.220274], [0.071795, 0.223957], [0.077629, 0.228088], [0.083024, 0.232793], [0.087921, 0.238032], [0.0923, 0.243666], [0.095963, 0.249593], [0.098709, 0.25595], [0.100438, 0.262412], [0.101266, 0.268869], [0.101198, 0.275137], [0.100543, 0.28109], [0.099548, 0.286651], [0.098482, 0.29181], [0.097542, 0.29659], [0.096684, 0.300944], [0.095916, 0.304852], [0.095232, 0.308329], [0.09465, 0.311284], [0.094173, 0.313708], [0.093799, 0.315608], [0.093529, 0.316983], [0.093364, 0.317819], [0.093309, 0.3181]] }, { x: -0.201062, puntos: [[0, 0.193755], [278e-6, 0.193846], [1106e-6, 0.194116], [2473e-6, 0.194557], [4369e-6, 0.195155], [6799e-6, 0.195892], [9769e-6, 0.19674], [0.013271, 0.197674], [0.01724, 0.1987], [0.021632, 0.199896], [0.02642, 0.201353], [0.031575, 0.203044], [0.037064, 0.204873], [0.042898, 0.206837], [0.048922, 0.209045], [0.055115, 0.211659], [0.061366, 0.214605], [0.067623, 0.217917], [0.073802, 0.22167], [0.079824, 0.225871], [0.085405, 0.230661], [0.090477, 0.236002], [0.095032, 0.241748], [0.098873, 0.247792], [0.101784, 0.254284], [0.103663, 0.260899], [0.104618, 0.267519], [0.104641, 0.27396], [0.104043, 0.28008], [0.103056, 0.285798], [0.101969, 0.291098], [0.101003, 0.296008], [0.100123, 0.300478], [0.099334, 0.304491], [0.098631, 0.308064], [0.098034, 0.311101], [0.097544, 0.313591], [0.097161, 0.31554], [0.096883, 0.316952], [0.096714, 0.317811], [0.096657, 0.3181]] }, { x: -0.190701, puntos: [[0, 0.19064], [286e-6, 0.190732], [1139e-6, 0.191008], [2546e-6, 0.191457], [4497e-6, 0.192069], [6996e-6, 0.192823], [0.01005, 0.193694], [0.01365, 0.194656], [0.017732, 0.195716], [0.02225, 0.196949], [0.027174, 0.198445], [0.032478, 0.200177], [0.038124, 0.202051], [0.044125, 0.20407], [0.050321, 0.206333], [0.0567, 0.208996], [0.063141, 0.212002], [0.069588, 0.215385], [0.075965, 0.219206], [0.082186, 0.223481], [0.087965, 0.228365], [0.093225, 0.233813], [0.097964, 0.239682], [0.101986, 0.245859], [0.105062, 0.252498], [0.107093, 0.259279], [0.108177, 0.266075], [0.108298, 0.272699], [0.107769, 0.278997], [0.1068, 0.284883], [0.105692, 0.290337], [0.104697, 0.295385], [0.103793, 0.299979], [0.102981, 0.304105], [0.102257, 0.307779], [0.101642, 0.310904], [0.101138, 0.313465], [0.100744, 0.315468], [0.100458, 0.316919], [0.100284, 0.317803], [0.100225, 0.3181]] }, { x: -0.179665, puntos: [[0, 0.187335], [295e-6, 0.187429], [1175e-6, 0.187708], [2626e-6, 0.188166], [4635e-6, 0.188788], [7209e-6, 0.189558], [0.010353, 0.190452], [0.014057, 0.191444], [0.018259, 0.192543], [0.022912, 0.193818], [0.027981, 0.195354], [0.033445, 0.197127], [0.039257, 0.199045], [0.045436, 0.201127], [0.051814, 0.203447], [0.058397, 0.206153], [0.065041, 0.209221], [0.071691, 0.212676], [0.078283, 0.216563], [0.084715, 0.220918], [0.090705, 0.225903], [0.096164, 0.231463], [0.101096, 0.237467], [0.105299, 0.243795], [0.108537, 0.250592], [0.110723, 0.257553], [0.111935, 0.264536], [0.112163, 0.271355], [0.111713, 0.277841], [0.110774, 0.283907], [0.109647, 0.289525], [0.108621, 0.29472], [0.107688, 0.299449], [0.10685, 0.303694], [0.106105, 0.307474], [0.10547, 0.310693], [0.104949, 0.31333], [0.104543, 0.315391], [0.104248, 0.316884], [0.104069, 0.317794], [0.104008, 0.3181]] }, { x: -0.167959, puntos: [[0, 0.183828], [305e-6, 0.183923], [1214e-6, 0.184206], [2711e-6, 0.184669], [4784e-6, 0.185301], [7438e-6, 0.186086], [0.010678, 0.187003], [0.01449, 0.188028], [0.01882, 0.189171], [0.023615, 0.190494], [0.028839, 0.192073], [0.034475, 0.193886], [0.040463, 0.19585], [0.04683, 0.198001], [0.053401, 0.200382], [0.060201, 0.203128], [0.067063, 0.206258], [0.073928, 0.209788], [0.080753, 0.21374], [0.087407, 0.218179], [0.09362, 0.223275], [0.09929, 0.228952], [0.104423, 0.235101], [0.108805, 0.2416], [0.112203, 0.248565], [0.114544, 0.255721], [0.115883, 0.262903], [0.116226, 0.269926], [0.115866, 0.276612], [0.114969, 0.282869], [0.113829, 0.288662], [0.112766, 0.294013], [0.111804, 0.298885], [0.110939, 0.303258], [0.110169, 0.307149], [0.109513, 0.310467], [0.108975, 0.313186], [0.108555, 0.31531], [0.108251, 0.316848], [0.108066, 0.317785], [0.108003, 0.3181]] }, { x: -0.155593, puntos: [[0, 0.1801], [316e-6, 0.180196], [1256e-6, 0.180482], [2803e-6, 0.180949], [4943e-6, 0.181589], [7682e-6, 0.182389], [0.011023, 0.183331], [0.014949, 0.184393], [0.019413, 0.185585], [0.024357, 0.186963], [0.029745, 0.18859], [0.035563, 0.190444], [0.041738, 0.192455], [0.048304, 0.194682], [0.055077, 0.197131], [0.062108, 0.199916], [0.069202, 0.203111], [0.076295, 0.206718], [0.083369, 0.210734], [0.090255, 0.215264], [0.096703, 0.220477], [0.102595, 0.226278], [0.107936, 0.232584], [0.112496, 0.239271], [0.116052, 0.246419], [0.118549, 0.253781], [0.120014, 0.261174], [0.120478, 0.268412], [0.120218, 0.275306], [0.119376, 0.281767], [0.118227, 0.287746], [0.117128, 0.293264], [0.116136, 0.298287], [0.115241, 0.302796], [0.114448, 0.306803], [0.113769, 0.310227], [0.113213, 0.313034], [0.112779, 0.315224], [0.112465, 0.31681], [0.112274, 0.317775], [0.112209, 0.3181]] }, { x: -0.142575, puntos: [[0, 0.176122], [327e-6, 0.176219], [13e-4, 0.176507], [2899e-6, 0.17698], [511e-5, 0.177629], [794e-5, 0.178445], [0.011388, 0.179413], [0.015433, 0.180516], [0.020035, 0.181764], [0.025137, 0.183204], [0.030696, 0.184886], [0.036705, 0.186784], [0.043078, 0.188846], [0.049852, 0.191156], [0.056837, 0.193681], [0.064111, 0.19651], [0.071449, 0.199774], [0.078783, 0.203461], [0.08612, 0.207543], [0.09325, 0.212171], [0.099944, 0.217511], [0.10607, 0.223442], [0.111624, 0.229916], [0.116363, 0.236809], [0.120077, 0.24415], [0.122729, 0.251731], [0.12432, 0.259347], [0.124911, 0.266809], [0.124759, 0.273924], [0.123983, 0.280599], [0.122834, 0.286777], [0.121699, 0.29247], [0.120676, 0.297655], [0.119753, 0.302307], [0.118936, 0.306437], [0.118236, 0.309973], [0.117662, 0.312873], [0.117214, 0.315134], [0.11689, 0.31677], [0.116693, 0.317765], [0.116627, 0.3181]] }, { x: -0.128913, puntos: [[0, 0.171859], [339e-6, 0.171957], [1346e-6, 0.172249], [3e-3, 0.172728], [5284e-6, 0.173387], [8209e-6, 0.174222], [0.011771, 0.175222], [0.015938, 0.176371], [0.020686, 0.177683], [0.025951, 0.179194], [0.031689, 0.180938], [0.037897, 0.182887], [0.044478, 0.185006], [0.051469, 0.187406], [0.058677, 0.190018], [0.066202, 0.192902], [0.073795, 0.196241], [0.081383, 0.200011], [0.088996, 0.204165], [0.09638, 0.208901], [0.103332, 0.214372], [0.109702, 0.220442], [0.115475, 0.227098], [0.120392, 0.23421], [0.124269, 0.241758], [0.127077, 0.24957], [0.128794, 0.257421], [0.129516, 0.265116], [0.129476, 0.272462], [0.128777, 0.279363], [0.127637, 0.285752], [0.126471, 0.291629], [0.125419, 0.296985], [0.12447, 0.301791], [0.123631, 0.306051], [0.122911, 0.309704], [0.12232, 0.312702], [0.121859, 0.315039], [0.121526, 0.316728], [0.121324, 0.317755], [0.121256, 0.3181]] }, { x: -0.114618, puntos: [[0, 0.167266], [351e-6, 0.167366], [1393e-6, 0.167662], [3103e-6, 0.16815], [5463e-6, 0.168823], [8487e-6, 0.169683], [0.012168, 0.170721], [0.016464, 0.171925], [0.02136, 0.173308], [0.026795, 0.174899], [0.032718, 0.176716], [0.039131, 0.178727], [0.045932, 0.180913], [0.053148, 0.18341], [0.060589, 0.186122], [0.06837, 0.18908], [0.076228, 0.192505], [0.084083, 0.196361], [0.091981, 0.200599], [0.099629, 0.205453], [0.106851, 0.211062], [0.113478, 0.217279], [0.119472, 0.22413], [0.12457, 0.231473], [0.128618, 0.239242], [0.131583, 0.247294], [0.133429, 0.255391], [0.134283, 0.263327], [0.134357, 0.270917], [0.133741, 0.278055], [0.132625, 0.284667], [0.131435, 0.29074], [0.130358, 0.296277], [0.129388, 0.301247], [0.12853, 0.305645], [0.127794, 0.30942], [0.127189, 0.312522], [0.126718, 0.31494], [0.126378, 0.316685], [0.126171, 0.317744], [0.126102, 0.3181]] }, { x: -0.099698, puntos: [[0, 0.162297], [363e-6, 0.1624], [1441e-6, 0.162704], [3208e-6, 0.163205], [5647e-6, 0.163898], [8773e-6, 0.16479], [0.012577, 0.165875], [0.017008, 0.167142], [0.022055, 0.168604], [0.027665, 0.170286], [0.033778, 0.17219], [0.040401, 0.174278], [0.047432, 0.176544], [0.05488, 0.179145], [0.062566, 0.181974], [0.070604, 0.185035], [0.078735, 0.188559], [0.086871, 0.192506], [0.09506, 0.196843], [0.102983, 0.201827], [0.110484, 0.207579], [0.117379, 0.213954], [0.123598, 0.221014], [0.128883, 0.228596], [0.133113, 0.236599], [0.136239, 0.2449], [0.138216, 0.253255], [0.139202, 0.26144], [0.139387, 0.269287], [0.13886, 0.276673], [0.137784, 0.283521], [0.13658, 0.2898], [0.135484, 0.295528], [0.134499, 0.300672], [0.133629, 0.305217], [0.132882, 0.309121], [0.132267, 0.312331], [0.131788, 0.314835], [0.131443, 0.316639], [0.131233, 0.317733], [0.131163, 0.3181]] }, { x: -0.084165, puntos: [[0, 0.156927], [375e-6, 0.157033], [1489e-6, 0.157348], [3314e-6, 0.157867], [5833e-6, 0.158588], [9065e-6, 0.15952], [0.012997, 0.160663], [0.017567, 0.162002], [0.022769, 0.163554], [0.028558, 0.165339], [0.034866, 0.167344], [0.041703, 0.169525], [0.048972, 0.17189], [0.056659, 0.174604], [0.064599, 0.177568], [0.072895, 0.180761], [0.081306, 0.184401], [0.089734, 0.188447], [0.098218, 0.1929], [0.106427, 0.198027], [0.114219, 0.203927], [0.12139, 0.210472], [0.127839, 0.217753], [0.133319, 0.225582], [0.137745, 0.233833], [0.141033, 0.242391], [0.143146, 0.251014], [0.144262, 0.259458], [0.144556, 0.267574], [0.14412, 0.275218], [0.1431, 0.282314], [0.141895, 0.288811], [0.140786, 0.294739], [0.139792, 0.300068], [0.138914, 0.30477], [0.138161, 0.308807], [0.13754, 0.31213], [0.137056, 0.314724], [0.136708, 0.316591], [0.136497, 0.317721], [0.136426, 0.3181]] }, { x: -0.068028, puntos: [[0, 0.151135], [387e-6, 0.151246], [1537e-6, 0.151575], [3422e-6, 0.152117], [6023e-6, 0.152873], [9364e-6, 0.153854], [0.013426, 0.155064], [0.01814, 0.156488], [0.0235, 0.158142], [0.029472, 0.160042], [0.035979, 0.162162], [0.043032, 0.164457], [0.050546, 0.166942], [0.058476, 0.169783], [0.066678, 0.1729], [0.075233, 0.176254], [0.08393, 0.180029], [0.092658, 0.184189], [0.101441, 0.188778], [0.109947, 0.19406], [0.118038, 0.200115], [0.125495, 0.20684], [0.132181, 0.214353], [0.137866, 0.222434], [0.142499, 0.230946], [0.145953, 0.239771], [0.148206, 0.248673], [0.14945, 0.257385], [0.14985, 0.265781], [0.149509, 0.273693], [0.148557, 0.28105], [0.147364, 0.287774], [0.146246, 0.293913], [0.145249, 0.299436], [0.144367, 0.304302], [0.143611, 0.308478], [0.142989, 0.311919], [0.142502, 0.314608], [0.142152, 0.316541], [0.14194, 0.317709], [0.14187, 0.3181]] }, { x: -0.0513, puntos: [[0, 0.1449], [4e-4, 0.145016], [1586e-6, 0.145362], [3531e-6, 0.145933], [6218e-6, 0.146731], [9668e-6, 0.147772], [0.013863, 0.149059], [0.018725, 0.150582], [0.024245, 0.152351], [0.030402, 0.154379], [0.037114, 0.156629], [0.044387, 0.15906], [0.052146, 0.161692], [0.060322, 0.164681], [0.068794, 0.167969], [0.077607, 0.171511], [0.086594, 0.175443], [0.09563, 0.179737], [0.104714, 0.184482], [0.113528, 0.189931], [0.121926, 0.196149], [0.129676, 0.203067], [0.136609, 0.210818], [0.142514, 0.219157], [0.147363, 0.227944], [0.150986, 0.237045], [0.153384, 0.246235], [0.154755, 0.255227], [0.155258, 0.263912], [0.155011, 0.272102], [0.15414, 0.27973], [0.15297, 0.286694], [0.151848, 0.293052], [0.15085, 0.298777], [0.149969, 0.303815], [0.149213, 0.308134], [0.14859, 0.311697], [0.148102, 0.314485], [0.147752, 0.316489], [0.147541, 0.317696], [0.14747, 0.3181]] }, { x: -0.03399, puntos: [[0, 0.138199], [412e-6, 0.138322], [1635e-6, 0.138688], [3643e-6, 0.139295], [6417e-6, 0.140144], [9979e-6, 0.141253], [0.014307, 0.14263], [0.019319, 0.144265], [0.025002, 0.146165], [0.031345, 0.148335], [0.038268, 0.150731], [0.045761, 0.153322], [0.053764, 0.156134], [0.062189, 0.159295], [0.070932, 0.162772], [0.080007, 0.166527], [0.089287, 0.170643], [0.098632, 0.175099], [0.10802, 0.180023], [0.117152, 0.18565], [0.125863, 0.192041], [0.133912, 0.199164], [0.141108, 0.207158], [0.14725, 0.215757], [0.152324, 0.224832], [0.156121, 0.234219], [0.158668, 0.243707], [0.160164, 0.252992], [0.160767, 0.261973], [0.160614, 0.270451], [0.159831, 0.278358], [0.158695, 0.285575], [0.157572, 0.292159], [0.156575, 0.298092], [0.155694, 0.303309], [0.154941, 0.307775], [0.154318, 0.311464], [0.15383, 0.314357], [0.15348, 0.316434], [0.153269, 0.317683], [0.153199, 0.3181]] }, { x: -0.016112, puntos: [[0, 0.131037], [424e-6, 0.131168], [1685e-6, 0.131559], [3756e-6, 0.132206], [6621e-6, 0.133114], [0.010295, 0.134302], [0.014755, 0.13578], [0.019921, 0.137543], [0.02577, 0.139591], [0.0323, 0.141914], [0.039438, 0.144472], [0.047154, 0.147247], [0.055394, 0.150274], [0.064068, 0.153636], [0.073085, 0.157319], [0.082425, 0.161309], [0.092, 0.165638], [0.101653, 0.170287], [0.111345, 0.175412], [0.120808, 0.181227], [0.129834, 0.187802], [0.138187, 0.195142], [0.145664, 0.203381], [0.152064, 0.212244], [0.157367, 0.221617], [0.161343, 0.231301], [0.164046, 0.241095], [0.165664, 0.250687], [0.166366, 0.259972], [0.166304, 0.268747], [0.165614, 0.276941], [0.164521, 0.284421], [0.163398, 0.291239], [0.162402, 0.297384], [0.161522, 0.302785], [0.160769, 0.307401], [0.160147, 0.311221], [0.159659, 0.314223], [0.159308, 0.316376], [0.159098, 0.317669], [0.159027, 0.3181]] }, { x: 2323e-6, puntos: [[0, 0.123486], [436e-6, 0.123625], [1735e-6, 0.124043], [3872e-6, 0.124738], [6829e-6, 0.125713], [0.010616, 0.126987], [0.015206, 0.128575], [0.020528, 0.130477], [0.026547, 0.132685], [0.033264, 0.135173], [0.040621, 0.137905], [0.048562, 0.140885], [0.057037, 0.144154], [0.065962, 0.14774], [0.075252, 0.151644], [0.08486, 0.155885], [0.094732, 0.160448], [0.104694, 0.165317], [0.114693, 0.170663], [0.124492, 0.176678], [0.133839, 0.183449], [0.1425, 0.191017], [0.150273, 0.199502], [0.156947, 0.208634], [0.162482, 0.218314], [0.166642, 0.228305], [0.169506, 0.238413], [0.171246, 0.248325], [0.172046, 0.257918], [0.172072, 0.266998], [0.171477, 0.275484], [0.170433, 0.283238], [0.169312, 0.290296], [0.168312, 0.296657], [0.16743, 0.302246], [0.166678, 0.307017], [0.166054, 0.31097], [0.165564, 0.314083], [0.165212, 0.316315], [0.165001, 0.317654], [0.16493, 0.3181]] }, { x: 0.021302, puntos: [[0, 0.115638], [449e-6, 0.115788], [1786e-6, 0.116237], [399e-5, 0.116983], [704e-5, 0.118031], [0.010938, 0.119399], [0.015659, 0.121103], [0.021139, 0.123151], [0.027331, 0.125524], [0.034237, 0.128185], [0.041815, 0.131102], [0.049985, 0.134302], [0.058693, 0.137825], [0.067872, 0.141653], [0.077435, 0.14579], [0.087319, 0.15029], [0.097488, 0.155102], [0.10776, 0.160212], [0.118068, 0.165792], [0.128206, 0.172017], [0.137878, 0.178998], [0.146851, 0.186805], [0.154932, 0.195539], [0.161892, 0.204943], [0.167657, 0.214936], [0.172008, 0.225244], [0.175038, 0.235673], [0.176901, 0.245917], [0.177797, 0.255823], [0.177911, 0.265215], [0.177408, 0.273997], [0.176417, 0.28203], [0.175296, 0.289335], [0.174287, 0.295914], [0.173399, 0.301696], [0.172642, 0.306626], [0.172015, 0.310714], [0.17152, 0.313939], [0.171165, 0.316252], [0.170952, 0.317639], [0.170881, 0.3181]] }, { x: 0.040811, puntos: [[0, 0.107607], [462e-6, 0.107768], [1839e-6, 0.108251], [4109e-6, 0.109053], [7252e-6, 0.110179], [0.01126, 0.111645], [0.016111, 0.113469], [0.021752, 0.115663], [0.028121, 0.1182], [0.03522, 0.121036], [0.043018, 0.124147], [0.051422, 0.127574], [0.060365, 0.131352], [0.069805, 0.135431], [0.079637, 0.139809], [0.089806, 0.144567], [0.100273, 0.149635], [0.110858, 0.154997], [0.121479, 0.160818], [0.131955, 0.167266], [0.141957, 0.174469], [0.151246, 0.182526], [0.159639, 0.19151], [0.166893, 0.201193], [0.172884, 0.211502], [0.17743, 0.222135], [0.180632, 0.232894], [0.182618, 0.243478], [0.183611, 0.253703], [0.183814, 0.263413], [0.183397, 0.272489], [0.182457, 0.280804], [0.181334, 0.288361], [0.180306, 0.295161], [0.179406, 0.301139], [0.178639, 0.306231], [0.178002, 0.310456], [0.177499, 0.313792], [0.177139, 0.316187], [0.176922, 0.317622], [0.17685, 0.3181]] }, { x: 0.060839, puntos: [[0, 0.099509], [476e-6, 0.099682], [1894e-6, 0.100201], [4231e-6, 0.101063], [7463e-6, 0.10227], [0.011579, 0.103836], [0.016561, 0.105779], [0.022364, 0.108114], [0.028916, 0.110808], [0.036211, 0.113818], [0.044227, 0.117126], [0.052871, 0.12078], [0.062057, 0.124799], [0.071765, 0.129131], [0.081865, 0.133753], [0.092328, 0.138761], [0.103095, 0.144082], [0.113995, 0.149698], [0.124934, 0.155763], [0.135742, 0.162445], [0.146077, 0.169885], [0.155685, 0.178201], [0.164394, 0.187439], [0.171941, 0.197407], [0.178151, 0.208029], [0.182898, 0.218997], [0.186277, 0.23009], [0.188389, 0.241021], [0.18948, 0.25157], [0.189774, 0.261602], [0.189432, 0.270971], [0.188537, 0.279567], [0.187408, 0.287382], [0.18635, 0.294403], [0.185429, 0.300579], [0.184643, 0.305838], [0.183991, 0.3102], [0.183476, 0.313645], [0.183107, 0.31612], [0.182885, 0.317605], [0.182811, 0.3181]] }, { x: 0.08137, puntos: [[0, 0.09142], [49e-5, 0.091606], [195e-5, 0.092163], [4353e-6, 0.093087], [7671e-6, 0.094375], [0.011896, 0.096041], [0.017011, 0.098102], [0.022978, 0.100569], [0.029718, 0.103409], [0.037214, 0.106588], [0.045446, 0.110096], [0.054335, 0.113971], [0.06377, 0.118213], [0.073754, 0.122792], [0.084119, 0.12766], [0.094886, 0.132908], [0.105955, 0.138475], [0.117171, 0.144346], [0.128431, 0.150656], [0.139564, 0.157583], [0.150235, 0.16527], [0.160164, 0.173849], [0.169186, 0.183345], [0.177025, 0.193602], [0.18345, 0.204538], [0.188401, 0.215845], [0.191961, 0.227277], [0.1942, 0.238557], [0.195389, 0.249434], [0.195773, 0.25979], [0.195497, 0.269448], [0.194642, 0.278325], [0.193502, 0.286401], [0.192404, 0.293643], [0.191453, 0.300019], [0.190641, 0.305448], [0.189968, 0.309947], [0.189436, 0.313497], [0.189054, 0.316052], [0.188824, 0.317588], [0.188748, 0.3181]] }, { x: 0.102391, puntos: [[0, 0.083412], [504e-6, 0.083612], [2005e-6, 0.084207], [4472e-6, 0.08519], [7876e-6, 0.086559], [0.01221, 0.088324], [0.017462, 0.090498], [0.023597, 0.093088], [0.030527, 0.096063], [0.038228, 0.099403], [0.046678, 0.103105], [0.055815, 0.107192], [0.065505, 0.111638], [0.075772, 0.116453], [0.086405, 0.121562], [0.097481, 0.127042], [0.108854, 0.132847], [0.120383, 0.13897], [0.131966, 0.145532], [0.143417, 0.152711], [0.154424, 0.160648], [0.164674, 0.169493], [0.174006, 0.179253], [0.182132, 0.189797], [0.188776, 0.201048], [0.193932, 0.212694], [0.197671, 0.224466], [0.200039, 0.236093], [0.201325, 0.247302], [0.201795, 0.25798], [0.201575, 0.267929], [0.200756, 0.277086], [0.199601, 0.285422], [0.198456, 0.292885], [0.197467, 0.299459], [0.196621, 0.305063], [0.19592, 0.3097], [0.195369, 0.313353], [0.194972, 0.315984], [0.194732, 0.31757], [0.194652, 0.3181]] }, { x: 0.123887, puntos: [[0, 0.075564], [517e-6, 0.075775], [2057e-6, 0.076406], [4585e-6, 0.077447], [8074e-6, 0.078893], [0.012521, 0.080753], [0.017917, 0.083035], [0.024222, 0.085736], [0.031345, 0.088831], [0.039258, 0.092322], [0.047928, 0.096209], [0.057312, 0.100492], [0.067265, 0.105122], [0.077821, 0.110156], [0.088726, 0.115498], [0.100113, 0.121202], [0.111793, 0.127233], [0.123632, 0.133604], [0.135533, 0.140429], [0.147298, 0.147863], [0.158638, 0.15605], [0.169205, 0.165156], [0.178843, 0.175188], [0.187247, 0.186015], [0.194122, 0.197581], [0.199482, 0.209562], [0.203394, 0.221672], [0.20589, 0.233638], [0.207272, 0.245182], [0.207821, 0.256177], [0.207651, 0.266421], [0.206862, 0.275857], [0.20569, 0.28445], [0.204493, 0.292131], [0.203459, 0.298903], [0.202573, 0.304685], [0.20184, 0.30946], [0.201265, 0.313213], [0.20085, 0.315919], [0.200599, 0.317553], [0.200515, 0.3181]] }, { x: 0.145844, puntos: [[0, 0.067947], [53e-5, 0.06817], [2105e-6, 0.068832], [4693e-6, 0.069925], [8266e-6, 0.071441], [0.012831, 0.07339], [0.018379, 0.075773], [0.024856, 0.078574], [0.032175, 0.081775], [0.040303, 0.085401], [0.049198, 0.089458], [0.058828, 0.093918], [0.069049, 0.098712], [0.0799, 0.103942], [0.091084, 0.109504], [0.102783, 0.115425], [0.114773, 0.121667], [0.126913, 0.128284], [0.139129, 0.135381], [0.151201, 0.143069], [0.162869, 0.151501], [0.173749, 0.16086], [0.183685, 0.171172], [0.192355, 0.182274], [0.199478, 0.194157], [0.205039, 0.206467], [0.209116, 0.218909], [0.211737, 0.231203], [0.213214, 0.243082], [0.213832, 0.254388], [0.213705, 0.26493], [0.212943, 0.274646], [0.211753, 0.28349], [0.210502, 0.291384], [0.209417, 0.298353], [0.208486, 0.304314], [0.207717, 0.309228], [0.207114, 0.313079], [0.20668, 0.315856], [0.206418, 0.317537], [0.206329, 0.3181]] }, { x: 0.168247, puntos: [[0, 0.060614], [541e-6, 0.060846], [2151e-6, 0.061537], [4797e-6, 0.062675], [8455e-6, 0.064254], [0.013143, 0.066283], [0.018847, 0.068758], [0.025497, 0.071647], [0.033013, 0.074942], [0.04136, 0.078686], [0.050488, 0.082894], [0.060363, 0.087507], [0.070855, 0.092446], [0.082002, 0.09785], [0.093473, 0.103612], [0.105483, 0.109738], [0.117783, 0.116181], [0.13022, 0.123038], [0.142743, 0.13041], [0.15512, 0.13835], [0.167104, 0.147023], [0.178291, 0.156629], [0.188517, 0.167221], [0.197444, 0.178597], [0.204821, 0.190793], [0.210581, 0.203425], [0.214812, 0.21619], [0.217557, 0.228804], [0.219127, 0.241015], [0.219806, 0.252624], [0.219719, 0.263465], [0.21898, 0.273459], [0.217772, 0.282547], [0.216469, 0.290651], [0.215328, 0.297812], [0.214348, 0.303949], [0.21354, 0.309], [0.212909, 0.312948], [0.212454, 0.315796], [0.212179, 0.317521], [0.212086, 0.3181]] }, { x: 0.191079, puntos: [[0, 0.053614], [553e-6, 0.053854], [2198e-6, 0.054569], [4903e-6, 0.055746], [8648e-6, 0.057378], [0.013459, 0.059478], [0.01932, 0.062032], [0.026146, 0.065001], [0.033858, 0.068378], [0.042428, 0.072224], [0.051795, 0.076554], [0.061916, 0.081294], [0.07268, 0.086361], [0.084122, 0.091917], [0.095887, 0.097857], [0.108206, 0.104167], [0.120815, 0.110802], [0.133544, 0.117899], [0.146366, 0.125536], [0.159044, 0.133722], [0.171331, 0.142636], [0.182817, 0.152485], [0.193324, 0.163351], [0.202498, 0.175004], [0.210128, 0.187504], [0.216086, 0.20045], [0.220461, 0.213529], [0.223327, 0.226458], [0.22499, 0.238991], [0.225724, 0.250896], [0.225671, 0.262032], [0.224951, 0.272301], [0.223729, 0.281628], [0.222376, 0.289937], [0.221178, 0.297283], [0.220149, 0.303588], [0.219301, 0.308773], [0.21864, 0.31282], [0.218163, 0.315737], [0.217874, 0.317507], [0.217777, 0.3181]] }, { x: 0.214327, puntos: [[0, 0.046998], [565e-6, 0.047244], [2248e-6, 0.047978], [5015e-6, 0.049186], [885e-5, 0.050862], [0.013783, 0.053018], [0.019799, 0.05564], [0.026798, 0.058679], [0.034706, 0.062131], [0.0435, 0.066058], [0.053117, 0.07048], [0.063485, 0.075315], [0.074521, 0.080497], [0.086252, 0.086184], [0.098319, 0.092271], [0.110945, 0.098741], [0.123857, 0.105561], [0.136876, 0.112896], [0.149988, 0.120779], [0.162965, 0.129204], [0.175536, 0.138362], [0.187311, 0.14845], [0.198089, 0.159576], [0.207503, 0.171517], [0.215371, 0.184306], [0.221529, 0.197561], [0.226035, 0.210938], [0.229021, 0.224184], [0.230776, 0.23702], [0.231564, 0.249218], [0.231541, 0.260639], [0.230837, 0.271179], [0.229604, 0.280738], [0.228207, 0.289247], [0.226952, 0.296772], [0.225876, 0.303228], [0.22499, 0.308542], [0.224298, 0.31269], [0.223799, 0.31568], [0.223497, 0.317492], [0.223396, 0.3181]] }, { x: 0.237973, puntos: [[0, 0.040791], [579e-6, 0.041042], [23e-4, 0.04179], [5133e-6, 0.043022], [9059e-6, 0.044731], [0.014114, 0.046931], [0.02028, 0.049607], [0.027451, 0.052707], [0.035555, 0.056224], [0.044573, 0.060214], [0.054444, 0.064696], [0.065065, 0.069597], [0.076369, 0.074877], [0.088382, 0.080671], [0.100758, 0.086877], [0.113686, 0.093483], [0.126895, 0.100484], [0.140202, 0.108049], [0.153596, 0.116154], [0.166865, 0.124808], [0.179704, 0.134212], [0.191757, 0.144538], [0.202793, 0.155912], [0.212439, 0.168148], [0.220527, 0.181211], [0.226881, 0.194765], [0.231515, 0.208428], [0.234619, 0.221989], [0.236462, 0.235113], [0.237302, 0.247596], [0.237305, 0.259291], [0.236614, 0.270094], [0.235376, 0.279878], [0.233941, 0.288583], [0.232631, 0.296279], [0.23151, 0.302874], [0.230588, 0.308308], [0.229866, 0.312559], [0.229346, 0.315624], [0.229031, 0.317479], [0.228925, 0.3181]] }, { x: 0.262001, puntos: [[0, 0.035], [593e-6, 0.035255], [2357e-6, 0.036015], [5256e-6, 0.037266], [9274e-6, 0.039], [0.014448, 0.041232], [0.02076, 0.043948], [0.0281, 0.047097], [0.036398, 0.050665], [0.045639, 0.054698], [0.055762, 0.059214], [0.06664, 0.064159], [0.078216, 0.069516], [0.090504, 0.075389], [0.103193, 0.081688], [0.116416, 0.088415], [0.129909, 0.09559], [0.143504, 0.103367], [0.157173, 0.111671], [0.170722, 0.120544], [0.183818, 0.130189], [0.196136, 0.140756], [0.207413, 0.152374], [0.217282, 0.164902], [0.225573, 0.178227], [0.232114, 0.192068], [0.236878, 0.206007], [0.2401, 0.219875], [0.242024, 0.233275], [0.242909, 0.246037], [0.242937, 0.257993], [0.242258, 0.269045], [0.241018, 0.279047], [0.239553, 0.287947], [0.238189, 0.295807], [0.237028, 0.30253], [0.236072, 0.308079], [0.235321, 0.312432], [0.23478, 0.315569], [0.234453, 0.317465], [0.234343, 0.3181]] }, { x: 0.286395, puntos: [[0, 0.02963], [608e-6, 0.02989], [2416e-6, 0.03066], [5382e-6, 0.031926], [9489e-6, 0.033678], [0.014779, 0.035934], [0.021234, 0.038679], [0.028739, 0.041858], [0.037229, 0.04546], [0.04669, 0.049518], [0.057058, 0.054049], [0.068199, 0.059019], [0.08005, 0.064427], [0.092607, 0.070346], [0.105612, 0.076715], [0.119117, 0.083559], [0.13288, 0.090901], [0.146764, 0.098858], [0.160702, 0.107341], [0.174513, 0.116423], [0.187859, 0.126299], [0.200428, 0.137108], [0.211927, 0.148977], [0.222008, 0.161785], [0.230483, 0.175362], [0.237196, 0.189474], [0.242104, 0.203683], [0.245445, 0.217841], [0.247436, 0.231513], [0.248358, 0.244542], [0.248409, 0.256749], [0.247744, 0.26803], [0.246507, 0.278244], [0.245016, 0.287339], [0.243603, 0.295357], [0.242403, 0.302204], [0.241417, 0.307862], [0.240639, 0.31231], [0.240078, 0.315516], [0.23974, 0.317452], [0.239627, 0.3181]] }, { x: 0.311139, puntos: [[0, 0.024697], [624e-6, 0.02496], [2476e-6, 0.025741], [551e-5, 0.027019], [9702e-6, 0.028784], [0.015104, 0.031054], [0.0217, 0.033815], [0.029364, 0.037007], [0.038044, 0.040621], [0.047721, 0.044687], [0.058321, 0.049218], [0.069728, 0.054198], [0.081859, 0.059627], [0.094682, 0.06556], [0.107998, 0.071981], [0.121772, 0.078936], [0.135792, 0.086435], [0.149963, 0.094536], [0.164164, 0.10318], [0.178216, 0.112458], [0.191809, 0.122553], [0.204612, 0.133607], [0.216313, 0.145734], [0.226591, 0.158804], [0.235233, 0.172628], [0.242096, 0.186992], [0.247164, 0.201466], [0.250623, 0.215893], [0.252666, 0.229835], [0.253617, 0.243118], [0.253691, 0.255563], [0.253042, 0.267051], [0.251813, 0.277468], [0.2503, 0.28676], [0.248842, 0.294928], [0.247606, 0.301898], [0.246592, 0.307662], [0.245791, 0.312196], [0.245213, 0.315466], [0.244864, 0.31744], [0.244747, 0.3181]] }, { x: 0.336215, puntos: [[0, 0.020235], [639e-6, 0.020501], [2535e-6, 0.021287], [5635e-6, 0.022572], [9913e-6, 0.024344], [0.015425, 0.026619], [0.022154, 0.029382], [0.029971, 0.03257], [0.03884, 0.036179], [0.048728, 0.040235], [0.059548, 0.04475], [0.07122, 0.049723], [0.08363, 0.055145], [0.096714, 0.061064], [0.11033, 0.067518], [0.124365, 0.074571], [0.138633, 0.082207], [0.153082, 0.090425], [0.167538, 0.099213], [0.181814, 0.108676], [0.19564, 0.118981], [0.20866, 0.130273], [0.220551, 0.142652], [0.231008, 0.155967], [0.239796, 0.170037], [0.246788, 0.184639], [0.252014, 0.199372], [0.255584, 0.214045], [0.257672, 0.228248], [0.25865, 0.241768], [0.258749, 0.254439], [0.258119, 0.266119], [0.256901, 0.27673], [0.255371, 0.28621], [0.253872, 0.29452], [0.252602, 0.301614], [0.251561, 0.307479], [0.250738, 0.312092], [0.250145, 0.315418], [0.249786, 0.317428], [0.249667, 0.3181]] }, { x: 0.361606, puntos: [[0, 0.016278], [653e-6, 0.016543], [2588e-6, 0.01733], [5753e-6, 0.018616], [0.01012, 0.020386], [0.01574, 0.022655], [0.022596, 0.025405], [0.030561, 0.028573], [0.039614, 0.032162], [0.049706, 0.036192], [0.060737, 0.040673], [0.072667, 0.045618], [0.085348, 0.051008], [0.09869, 0.056895], [0.112586, 0.063361], [0.126877, 0.070485], [0.141395, 0.078231], [0.156099, 0.086547], [0.170801, 0.09547], [0.185291, 0.105102], [0.199329, 0.115613], [0.212545, 0.127128], [0.22462, 0.139737], [0.235233, 0.153282], [0.244144, 0.167602], [0.251245, 0.182435], [0.256608, 0.197419], [0.260275, 0.212313], [0.262411, 0.226761], [0.263417, 0.240497], [0.263547, 0.253381], [0.26294, 0.265243], [0.261734, 0.276037], [0.260192, 0.285689], [0.258656, 0.29413], [0.257353, 0.30135], [0.256285, 0.307316], [0.255444, 0.311997], [0.254836, 0.315373], [0.254469, 0.317416], [0.254346, 0.3181]] }, { x: 0.387295, puntos: [[0, 0.01285], [664e-6, 0.013113], [2634e-6, 0.013893], [5863e-6, 0.01517], [0.010322, 0.016929], [0.01605, 0.01918], [0.023023, 0.021901], [0.031129, 0.025036], [0.040362, 0.028593], [0.050651, 0.032582], [0.061887, 0.037011], [0.074059, 0.041903], [0.087001, 0.047239], [0.100595, 0.053082], [0.114743, 0.05954], [0.129289, 0.066701], [0.144062, 0.074522], [0.158994, 0.082925], [0.173929, 0.091973], [0.188627, 0.101762], [0.202849, 0.112472], [0.216242, 0.124191], [0.228498, 0.136996], [0.239242, 0.150759], [0.248252, 0.165333], [0.255441, 0.180393], [0.260907, 0.195617], [0.264651, 0.210709], [0.266844, 0.225379], [0.267887, 0.239308], [0.26805, 0.252393], [0.26747, 0.264431], [0.266281, 0.275397], [0.264732, 0.285197], [0.263166, 0.293756], [0.261829, 0.301106], [0.260736, 0.30717], [0.259877, 0.311912], [0.259256, 0.315332], [0.258881, 0.317405], [0.258755, 0.3181]] }, { x: 0.413264, puntos: [[0, 9945e-6], [672e-6, 0.010203], [2673e-6, 0.01097], [5963e-6, 0.012231], [0.010516, 0.013971], [0.016347, 0.016191], [0.023429, 0.018871], [0.031673, 0.021962], [0.041078, 0.025473], [0.051553, 0.029404], [0.062989, 0.03376], [0.075388, 0.038577], [0.088571, 0.043845], [0.10241, 0.049639], [0.116787, 0.05607], [0.13158, 0.063234], [0.146608, 0.071097], [0.161746, 0.079575], [0.1769, 0.088737], [0.191798, 0.098669], [0.206178, 0.109565], [0.219732, 0.121468], [0.232156, 0.134442], [0.24301, 0.148412], [0.252099, 0.163232], [0.25936, 0.178513], [0.264894, 0.193959], [0.268699, 0.209236], [0.270951, 0.224104], [0.272035, 0.238207], [0.272235, 0.251475], [0.271685, 0.263683], [0.270518, 0.274809], [0.268972, 0.284739], [0.267387, 0.293404], [0.266024, 0.300878], [0.26491, 0.307037], [0.264038, 0.311836], [0.263409, 0.315295], [0.263027, 0.317395], [0.2629, 0.3181]] }, { x: 0.439495, puntos: [[0, 755e-5], [679e-6, 7802e-6], [2707e-6, 8552e-6], [6054e-6, 979e-5], [0.010694, 0.011502], [0.016624, 0.013682], [0.02381, 0.016308], [0.032191, 0.019346], [0.041755, 0.022798], [0.052404, 0.026652], [0.064037, 0.030913], [0.076643, 0.035634], [0.090045, 0.040829], [0.104115, 0.046575], [0.118704, 0.052961], [0.133729, 0.060096], [0.149001, 0.067976], [0.164333, 0.076512], [0.179687, 0.085774], [0.194776, 0.095836], [0.209295, 0.10689], [0.223, 0.118964], [0.235562, 0.132091], [0.246511, 0.146258], [0.255663, 0.161299], [0.262984, 0.176791], [0.268559, 0.192435], [0.272411, 0.207893], [0.274719, 0.222933], [0.275844, 0.2372], [0.276078, 0.250628], [0.27556, 0.262994], [0.274425, 0.274272], [0.272899, 0.284315], [0.271312, 0.293077], [0.269936, 0.300664], [0.268812, 0.306913], [0.267935, 0.311766], [0.267302, 0.315263], [0.266919, 0.317387], [0.26679, 0.3181]] }, { x: 0.465971, puntos: [[0, 5642e-6], [686e-6, 5887e-6], [2737e-6, 6618e-6], [6134e-6, 7827e-6], [0.010853, 9503e-6], [0.016873, 0.011633], [0.024162, 0.014199], [0.03268, 0.017177], [0.042388, 0.020556], [0.053193, 0.024314], [0.065019, 0.028461], [0.077812, 0.033066], [0.091407, 0.03819], [0.105691, 0.043894], [0.12048, 0.050218], [0.135715, 0.057298], [0.151213, 0.065171], [0.166733, 0.073749], [0.182267, 0.083094], [0.197536, 0.093274], [0.21218, 0.104448], [0.226026, 0.116682], [0.238687, 0.129957], [0.249722, 0.14431], [0.258927, 0.159535], [0.266296, 0.175224], [0.271891, 0.191036], [0.275779, 0.20668], [0.278133, 0.221864], [0.279296, 0.236292], [0.279559, 0.249853], [0.279075, 0.262361], [0.277985, 0.273783], [0.276497, 0.28393], [0.274929, 0.292779], [0.27356, 0.300461], [0.272441, 0.306793], [0.271568, 0.311702], [0.27094, 0.315236], [0.270559, 0.31738], [0.270432, 0.3181]] }, { x: 0.492672, puntos: [[0, 4165e-6], [692e-6, 4402e-6], [2763e-6, 5111e-6], [6205e-6, 6287e-6], [0.010995, 792e-5], [0.017098, 9994e-6], [0.024486, 0.012495], [0.033135, 0.015407], [0.04297, 0.018704], [0.053916, 0.022357], [0.065923, 0.026381], [0.078882, 0.030862], [0.092647, 0.035908], [0.107127, 0.041565], [0.122103, 0.047819], [0.137526, 0.054832], [0.153225, 0.062682], [0.168927, 0.071288], [0.184621, 0.080698], [0.200054, 0.090978], [0.214815, 0.102243], [0.228785, 0.114625], [0.241514, 0.128048], [0.252625, 0.142571], [0.261876, 0.157944], [0.269282, 0.173814], [0.274877, 0.189771], [0.278791, 0.205597], [0.281186, 0.220899], [0.282386, 0.235483], [0.282671, 0.249156], [0.282219, 0.261788], [0.281181, 0.273339], [0.279749, 0.283581], [0.278218, 0.292515], [0.276874, 0.300274], [0.275772, 0.306675], [0.274913, 0.311643], [0.274296, 0.315214], [0.273922, 0.317375], [0.273797, 0.3181]] }, { x: 0.519582, puntos: [[0, 305e-5], [697e-6, 3279e-6], [2787e-6, 3963e-6], [6268e-6, 5102e-6], [0.011121, 6687e-6], [0.017304, 8701e-6], [0.024787, 0.011133], [0.033553, 0.013975], [0.043497, 0.017188], [0.054569, 0.020742], [0.066732, 0.024651], [0.079839, 0.02901], [0.093755, 0.03396], [0.108417, 0.03955], [0.123559, 0.045734], [0.139155, 0.052688], [0.155024, 0.060501], [0.170897, 0.069126], [0.186732, 0.078588], [0.202305, 0.088939], [0.217184, 0.100282], [0.23125, 0.112796], [0.244031, 0.126371], [0.255206, 0.141044], [0.264497, 0.156533], [0.271926, 0.172562], [0.277507, 0.188649], [0.281437, 0.20464], [0.283874, 0.22004], [0.285115, 0.23477], [0.285415, 0.248542], [0.284985, 0.261279], [0.284002, 0.272935], [0.282634, 0.283266], [0.281154, 0.292287], [0.279848, 0.300103], [0.278774, 0.306562], [0.277936, 0.311589], [0.277334, 0.315196], [0.276971, 0.317372], [0.276849, 0.3181]] }, { x: 0.546681, puntos: [[0, 2226e-6], [701e-6, 2446e-6], [2809e-6, 3104e-6], [6324e-6, 4203e-6], [0.011235, 5736e-6], [0.017494, 7689e-6], [0.025066, 0.010053], [0.033927, 0.012821], [0.043964, 0.015954], [0.055147, 0.019424], [0.067432, 0.023239], [0.080672, 0.02749], [0.094721, 0.032319], [0.109553, 0.037812], [0.124836, 0.043932], [0.140593, 0.05085], [0.156595, 0.058621], [0.172623, 0.067259], [0.188585, 0.07676], [0.204268, 0.08715], [0.21927, 0.09857], [0.233396, 0.111197], [0.246223, 0.124929], [0.25745, 0.139727], [0.266775, 0.155309], [0.274213, 0.171473], [0.279771, 0.187683], [0.283706, 0.203809], [0.286192, 0.219291], [0.287481, 0.234152], [0.287787, 0.248018], [0.28737, 0.260839], [0.286438, 0.27257], [0.285137, 0.282985], [0.283714, 0.292099], [0.282455, 0.299954], [0.281415, 0.306455], [0.280601, 0.311539], [0.280018, 0.315181], [0.279667, 0.31737], [0.27955, 0.3181]] }, { x: 0.573951, puntos: [[0, 1619e-6], [706e-6, 183e-5], [2829e-6, 2465e-6], [6375e-6, 3526e-6], [0.011334, 5011e-6], [0.01766, 6907e-6], [0.025311, 9206e-6], [0.034248, 0.0119], [0.044364, 0.014954], [0.055644, 0.01835], [0.06802, 0.022089], [0.081378, 0.026251], [0.095546, 0.030949], [0.110528, 0.036331], [0.125925, 0.042394], [0.141827, 0.049294], [0.157933, 0.057025], [0.17409, 0.065671], [0.190161, 0.075208], [0.205928, 0.085619], [0.221048, 0.097115], [0.235209, 0.109832], [0.248075, 0.123714], [0.259332, 0.138618], [0.268683, 0.154282], [0.276121, 0.170558], [0.281658, 0.186877], [0.285597, 0.203107], [0.288132, 0.218661], [0.289466, 0.23363], [0.289781, 0.247583], [0.289374, 0.26047], [0.28849, 0.272252], [0.287252, 0.282743], [0.285883, 0.29195], [0.284669, 0.299827], [0.283663, 0.30636], [0.282871, 0.311495], [0.282305, 0.31517], [0.281967, 0.317369], [0.281854, 0.3181]] }, { x: 0.601373, puntos: [[0, 1152e-6], [712e-6, 1358e-6], [2852e-6, 1977e-6], [6422e-6, 301e-5], [0.011414, 4456e-6], [0.017791, 6306e-6], [0.025506, 8548e-6], [0.034502, 0.011167], [0.044688, 0.014139], [0.056049, 0.017462], [0.068498, 0.021136], [0.081959, 0.02523], [0.096229, 0.029814], [0.111335, 0.035093], [0.126817, 0.041103], [0.142843, 0.047991], [0.159033, 0.055691], [0.175283, 0.064345], [0.191443, 0.073919], [0.207269, 0.084358], [0.222489, 0.095924], [0.236677, 0.108708], [0.249571, 0.122715], [0.260828, 0.137713], [0.270189, 0.153464], [0.277627, 0.169831], [0.283162, 0.186238], [0.287113, 0.202538], [0.289685, 0.21816], [0.291054, 0.233206], [0.291387, 0.247237], [0.291005, 0.260178], [0.290165, 0.271994], [0.288977, 0.282551], [0.287648, 0.291835], [0.286466, 0.299727], [0.285482, 0.30628], [0.284706, 0.311458], [0.284152, 0.31516], [0.283821, 0.317368], [0.283711, 0.3181]] }, { x: 0.628928, puntos: [[0, 758e-6], [72e-5, 963e-6], [2878e-6, 1576e-6], [6466e-6, 2596e-6], [0.011472, 4019e-6], [0.017877, 5836e-6], [0.025638, 8032e-6], [0.034681, 0.010579], [0.044931, 0.013464], [0.056356, 0.016704], [0.068868, 0.020322], [0.082418, 0.024368], [0.096773, 0.028876], [0.11197, 0.034081], [0.127505, 0.04004], [0.143631, 0.046913], [0.159892, 0.054603], [0.176191, 0.063263], [0.192416, 0.072883], [0.20828, 0.083375], [0.223568, 0.095004], [0.23779, 0.10783], [0.250693, 0.121923], [0.261915, 0.137012], [0.271269, 0.152864], [0.278714, 0.169301], [0.284273, 0.18577], [0.288254, 0.202107], [0.290846, 0.217797], [0.292228, 0.232879], [0.2926, 0.246976], [0.292265, 0.259963], [0.291468, 0.271806], [0.290311, 0.282416], [0.288999, 0.291751], [0.287828, 0.299655], [0.286851, 0.306223], [0.286078, 0.311429], [0.285526, 0.31515], [0.285197, 0.317366], [0.285088, 0.3181]] }, { x: 0.656598, puntos: [[0, 435e-6], [729e-6, 64e-5], [2905e-6, 1252e-6], [6507e-6, 2264e-6], [0.011515, 3668e-6], [0.017931, 5459e-6], [0.025722, 7614e-6], [0.034802, 0.010096], [0.045104, 0.012901], [0.056574, 0.016063], [0.069139, 0.019632], [0.082759, 0.023648], [0.097175, 0.028117], [0.112425, 0.033279], [0.127996, 0.039199], [0.144185, 0.046054], [0.160498, 0.053754], [0.176812, 0.062432], [0.193072, 0.072104], [0.208956, 0.082664], [0.224275, 0.094353], [0.238523, 0.10721], [0.251422, 0.121354], [0.262592, 0.13652], [0.271926, 0.152475], [0.279385, 0.168958], [0.284988, 0.185462], [0.289009, 0.201812], [0.29161, 0.217562], [0.292997, 0.232649], [0.293419, 0.246795], [0.293144, 0.259821], [0.292386, 0.271684], [0.291249, 0.282331], [0.289945, 0.291694], [0.288773, 0.29961], [0.287791, 0.306188], [0.287016, 0.311407], [0.286462, 0.31514], [0.286132, 0.317364], [0.286022, 0.3181]] }, { x: 0.684364, puntos: [[0, 198e-6], [736e-6, 401e-6], [2929e-6, 1006e-6], [6544e-6, 2003e-6], [0.011554, 338e-5], [0.017975, 5136e-6], [0.025782, 725e-5], [0.034887, 968e-5], [0.045224, 0.012428], [0.056717, 0.015534], [0.069324, 0.019066], [0.082985, 0.023062], [0.097433, 0.02752], [0.112696, 0.032668], [0.128296, 0.038571], [0.144501, 0.045416], [0.160841, 0.053147], [0.177147, 0.061862], [0.193409, 0.071585], [0.209296, 0.082215], [0.224602, 0.093964], [0.23885, 0.106861], [0.251737, 0.121031], [0.262863, 0.136248], [0.272178, 0.152281], [0.279651, 0.168786], [0.285302, 0.185304], [0.289362, 0.201647], [0.291976, 0.21744], [0.293378, 0.232515], [0.293848, 0.246686], [0.293626, 0.259743], [0.292903, 0.271621], [0.291789, 0.282286], [0.290499, 0.291657], [0.289328, 0.299589], [0.288345, 0.306174], [0.287571, 0.311393], [0.287018, 0.31513], [0.286687, 0.31736], [0.286577, 0.3181]] }, { x: 0.712206, puntos: [[0, 59e-6], [741e-6, 255e-6], [2946e-6, 84e-5], [6575e-6, 1802e-6], [0.011595, 3134e-6], [0.018022, 4839e-6], [0.025836, 6904e-6], [0.034954, 9301e-6], [0.045301, 0.012027], [0.056797, 0.015112], [0.069431, 0.018625], [0.083098, 0.022605], [0.097543, 0.027075], [0.11278, 0.032233], [0.128412, 0.038151], [0.14458, 0.044999], [0.16091, 0.052781], [0.177199, 0.06156], [0.193425, 0.071331], [0.209296, 0.082018], [0.224544, 0.093833], [0.23875, 0.106793], [0.251624, 0.120975], [0.262733, 0.136206], [0.272034, 0.152273], [0.27952, 0.16877], [0.28521, 0.185285], [0.289297, 0.201611], [0.291942, 0.217418], [0.293381, 0.232474], [0.29389, 0.246643], [0.293699, 0.259723], [0.293007, 0.271609], [0.291928, 0.282273], [0.290671, 0.291638], [0.289513, 0.29959], [0.288542, 0.30618], [0.28778, 0.311385], [0.287235, 0.315119], [0.286907, 0.317356], [0.286798, 0.3181]] }, { x: 0.740105, puntos: [[0, -5e-6], [743e-6, 181e-6], [2955e-6, 735e-6], [6596e-6, 1652e-6], [0.011631, 2927e-6], [0.018065, 4571e-6], [0.025878, 6587e-6], [0.034994, 8964e-6], [0.045331, 0.011698], [0.056812, 0.014795], [0.069447, 0.018307], [0.083088, 0.022282], [0.097502, 0.026786], [0.112683, 0.031981], [0.128332, 0.03794], [0.144428, 0.044808], [0.160715, 0.052656], [0.176965, 0.061517], [0.193124, 0.071337], [0.208954, 0.082075], [0.224106, 0.093958], [0.238233, 0.106994], [0.25108, 0.121177], [0.262188, 0.136395], [0.271484, 0.152453], [0.278981, 0.168915], [0.284701, 0.185411], [0.288809, 0.201708], [0.291499, 0.217502], [0.292996, 0.232532], [0.293539, 0.246675], [0.293368, 0.259761], [0.292703, 0.271647], [0.291667, 0.282296], [0.29045, 0.291642], [0.289314, 0.299611], [0.288358, 0.306202], [0.287614, 0.311386], [0.28708, 0.315112], [0.286757, 0.317352], [0.28665, 0.3181]] }, { x: 0.768043, puntos: [[0, -25e-6], [742e-6, 15e-5], [2953e-6, 672e-6], [66e-4, 1541e-6], [0.011648, 2761e-6], [0.018088, 4348e-6], [0.025892, 632e-5], [0.03499, 8689e-6], [0.045301, 0.011449], [0.056755, 0.014581], [0.069355, 0.01811], [0.08294, 0.022101], [0.097307, 0.026665], [0.112412, 0.031921], [0.128043, 0.037937], [0.144054, 0.044849], [0.160266, 0.052773], [0.176445, 0.061717], [0.192513, 0.071596], [0.208268, 0.082388], [0.223297, 0.094338], [0.23732, 0.107448], [0.250109, 0.121625], [0.261213, 0.136815], [0.270511, 0.152826], [0.278021, 0.169229], [0.283763, 0.18569], [0.287889, 0.201945], [0.290636, 0.2177], [0.292204, 0.232693], [0.29279, 0.246797], [0.292642, 0.259862], [0.292004, 0.271736], [0.291007, 0.282364], [0.289824, 0.291681], [0.288702, 0.299651], [0.287756, 0.306235], [0.287023, 0.3114], [0.286497, 0.315113], [0.286178, 0.317352], [0.286072, 0.3181]] }, { x: 0.796, puntos: [[0, -29e-6], [738e-6, 136e-6], [2941e-6, 633e-6], [6583e-6, 1464e-6], [0.011635, 2641e-6], [0.018076, 4187e-6], [0.025864, 613e-5], [0.034926, 8496e-6], [0.045202, 0.01129], [0.056618, 0.014472], [0.06914, 0.018035], [0.082644, 0.02207], [0.096955, 0.026718], [0.111976, 0.03206], [0.127532, 0.038141], [0.143464, 0.045124], [0.159573, 0.053131], [0.175637, 0.062147], [0.191597, 0.072098], [0.207235, 0.082957], [0.222125, 0.094971], [0.236026, 0.108137], [0.248719, 0.122304], [0.259797, 0.137461], [0.269099, 0.153397], [0.276626, 0.169721], [0.282385, 0.186127], [0.286535, 0.202325], [0.289345, 0.218017], [0.290991, 0.232959], [0.291634, 0.247017], [0.291526, 0.260026], [0.290919, 0.271875], [0.289948, 0.28248], [0.288783, 0.291762], [0.28766, 0.299708], [0.28671, 0.306277], [0.285975, 0.311426], [0.285448, 0.315127], [0.28513, 0.317356], [0.285024, 0.3181]] }, { x: 0.823957, puntos: [[0, -28e-6], [732e-6, 131e-6], [2922e-6, 613e-6], [6549e-6, 1425e-6], [0.011589, 2582e-6], [0.018017, 4112e-6], [0.025778, 6048e-6], [0.034791, 8422e-6], [0.045019, 0.011249], [0.056385, 0.014482], [0.068806, 0.018093], [0.082208, 0.022194], [0.096447, 0.026945], [0.111371, 0.03239], [0.126805, 0.038544], [0.142654, 0.045618], [0.158632, 0.053713], [0.174544, 0.062798], [0.190373, 0.072834], [0.205856, 0.083769], [0.220591, 0.095839], [0.234356, 0.109043], [0.246918, 0.123201], [0.257942, 0.138319], [0.267243, 0.154161], [0.274789, 0.170385], [0.280567, 0.186715], [0.28475, 0.202838], [0.287627, 0.218447], [0.289351, 0.23332], [0.290064, 0.247326], [0.290009, 0.260254], [0.289437, 0.272061], [0.288488, 0.282637], [0.287332, 0.291879], [0.286204, 0.299781], [0.285244, 0.306324], [0.2845, 0.311463], [0.283969, 0.315149], [0.283649, 0.317362], [0.283542, 0.3181]] }, { x: 0.851895, puntos: [[0, -33e-6], [726e-6, 128e-6], [2899e-6, 615e-6], [6501e-6, 1435e-6], [0.01151, 2605e-6], [0.017901, 4152e-6], [0.025618, 6108e-6], [0.034578, 8504e-6], [0.044739, 0.011356], [0.056037, 0.01463], [0.06836, 0.018299], [0.081641, 0.022478], [0.095785, 0.02734], [0.110595, 0.032898], [0.125873, 0.039134], [0.141615, 0.046312], [0.157433, 0.054499], [0.173173, 0.063664], [0.188836, 0.07379], [0.204132, 0.084804], [0.2187, 0.096922], [0.23231, 0.110148], [0.244718, 0.1243], [0.255655, 0.13937], [0.264938, 0.15511], [0.272502, 0.171216], [0.278311, 0.187443], [0.282539, 0.203469], [0.285482, 0.218977], [0.287281, 0.233763], [0.28807, 0.247709], [0.288075, 0.260544], [0.287546, 0.272289], [0.286624, 0.282824], [0.285483, 0.292023], [0.284356, 0.299869], [0.283392, 0.306377], [0.282644, 0.311503], [0.282111, 0.315174], [0.281791, 0.31737], [0.281684, 0.3181]] }, { x: 0.879794, puntos: [[0, -21e-6], [721e-6, 149e-6], [2876e-6, 661e-6], [6444e-6, 152e-5], [0.0114, 2738e-6], [0.017725, 4336e-6], [0.025378, 6341e-6], [0.034286, 8775e-6], [0.044358, 0.01164], [0.055566, 0.014938], [0.06781, 0.018672], [0.080956, 0.022934], [0.094975, 0.027904], [0.109648, 0.033577], [0.124747, 0.039905], [0.140348, 0.047194], [0.155978, 0.055476], [0.171532, 0.064737], [0.18699, 0.074956], [0.202071, 0.086049], [0.216457, 0.098207], [0.229894, 0.111438], [0.242132, 0.125589], [0.252948, 0.140598], [0.262189, 0.156234], [0.269763, 0.172208], [0.275619, 0.188304], [0.279904, 0.204208], [0.28291, 0.2196], [0.284781, 0.23428], [0.285646, 0.248155], [0.285713, 0.260893], [0.285236, 0.272556], [0.284358, 0.28303], [0.283251, 0.292187], [0.282143, 0.299971], [0.281191, 0.306435], [0.280451, 0.311544], [0.279925, 0.315197], [0.279609, 0.317377], [0.279503, 0.3181]] }, { x: 0.907636, puntos: [[0, 121e-6], [716e-6, 303e-6], [2854e-6, 849e-6], [6384e-6, 1758e-6], [0.011275, 3037e-6], [0.017517, 4701e-6], [0.02509, 6767e-6], [0.033936, 9246e-6], [0.043904, 0.012126], [0.055002, 0.015445], [0.067165, 0.019247], [0.08017, 0.023594], [0.094031, 0.028661], [0.108546, 0.034443], [0.123452, 0.040874], [0.138874, 0.048274], [0.154291, 0.056648], [0.169644, 0.066012], [0.184865, 0.076324], [0.199705, 0.087498], [0.213882, 0.099693], [0.22712, 0.112919], [0.239177, 0.127064], [0.249846, 0.141996], [0.259016, 0.157524], [0.266581, 0.173359], [0.272482, 0.1893], [0.276834, 0.205059], [0.279907, 0.220316], [0.281849, 0.234876], [0.282792, 0.248655], [0.282929, 0.261296], [0.282519, 0.272863], [0.281708, 0.283259], [0.280661, 0.29237], [0.279597, 0.30009], [0.278677, 0.306505], [0.277962, 0.311585], [0.277453, 0.315218], [0.277149, 0.317382], [0.277047, 0.3181]] }, { x: 0.935402, puntos: [[0, 527e-6], [712e-6, 719e-6], [2833e-6, 1291e-6], [6325e-6, 224e-5], [0.011152, 3567e-6], [0.017309, 5284e-6], [0.024792, 7403e-6], [0.033553, 9927e-6], [0.043407, 0.012834], [0.05438, 0.016189], [0.066436, 0.020062], [0.079296, 0.024492], [0.092971, 0.029639], [0.107307, 0.035518], [0.122014, 0.042059], [0.137218, 0.049566], [0.152404, 0.058027], [0.167537, 0.067486], [0.182496, 0.077886], [0.197069, 0.089148], [0.210998, 0.101384], [0.224008, 0.114601], [0.235871, 0.128722], [0.246377, 0.143562], [0.255446, 0.158969], [0.262969, 0.174664], [0.268893, 0.19044], [0.273316, 0.206029], [0.276466, 0.22113], [0.278486, 0.235558], [0.279511, 0.249201], [0.279733, 0.261748], [0.279413, 0.273211], [0.278696, 0.283513], [0.27774, 0.29257], [0.276749, 0.300231], [0.275886, 0.306591], [0.275217, 0.311629], [0.274741, 0.315235], [0.274455, 0.317386], [0.274359, 0.3181]] }, { x: 0.963072, puntos: [[0, 1283e-6], [708e-6, 1478e-6], [2812e-6, 2061e-6], [627e-5, 3025e-6], [0.01104, 4372e-6], [0.017121, 6114e-6], [0.024509, 8264e-6], [0.033154, 0.010826], [0.042889, 0.013783], [0.053725, 0.017197], [0.06563, 0.02114], [0.078346, 0.025653], [0.091808, 0.030855], [0.105946, 0.036816], [0.12045, 0.043474], [0.135399, 0.051082], [0.150339, 0.05962], [0.165228, 0.069157], [0.179907, 0.079641], [0.194189, 0.090997], [0.207823, 0.103279], [0.220575, 0.116488], [0.23223, 0.130559], [0.242563, 0.145293], [0.251501, 0.160561], [0.258944, 0.176122], [0.264857, 0.191724], [0.269348, 0.207123], [0.272583, 0.222045], [0.274693, 0.23633], [0.275806, 0.249795], [0.276133, 0.262245], [0.275929, 0.273601], [0.27534, 0.283796], [0.274507, 0.292787], [0.273618, 0.300396], [0.272838, 0.306696], [0.272236, 0.311677], [0.271806, 0.31525], [0.271548, 0.317389], [0.271461, 0.3181]] }, { x: 0.990627, puntos: [[0, 2352e-6], [702e-6, 2547e-6], [2787e-6, 313e-5], [6209e-6, 4095e-6], [0.010924, 5444e-6], [0.016931, 7194e-6], [0.02422, 9363e-6], [0.032733, 0.011956], [0.042341, 0.014972], [0.053028, 0.018457], [0.064749, 0.022469], [0.077309, 0.02706], [0.090548, 0.032306], [0.10447, 0.038333], [0.118752, 0.045114], [0.133416, 0.052826], [0.148089, 0.061438], [0.162712, 0.071044], [0.177093, 0.081604], [0.191061, 0.093047], [0.204372, 0.10537], [0.21684, 0.118568], [0.228264, 0.132571], [0.238407, 0.147192], [0.247188, 0.162306], [0.254528, 0.177726], [0.260406, 0.193145], [0.264947, 0.208341], [0.268262, 0.223071], [0.270467, 0.237194], [0.271684, 0.250457], [0.272137, 0.262797], [0.272072, 0.274038], [0.271633, 0.284114], [0.270946, 0.293021], [0.270179, 0.300578], [0.2695, 0.306818], [0.268978, 0.311735], [0.268606, 0.315268], [0.26838, 0.317392], [0.268305, 0.3181]] }, { x: 1.018049, puntos: [[0, 3678e-6], [693e-6, 3872e-6], [2754e-6, 4453e-6], [6133e-6, 5417e-6], [0.010786, 6766e-6], [0.016715, 8523e-6], [0.023903, 0.010709], [0.03228, 0.013331], [0.041752, 0.016402], [0.052276, 0.019953], [0.063796, 0.024032], [0.076172, 0.028693], [0.089193, 0.03398], [0.102883, 0.040065], [0.11691, 0.046969], [0.131266, 0.0548], [0.145647, 0.063493], [0.159978, 0.073166], [0.174045, 0.083792], [0.187676, 0.095299], [0.200654, 0.107648], [0.212824, 0.120824], [0.223985, 0.134756], [0.233908, 0.149264], [0.242514, 0.164213], [0.249747, 0.179472], [0.25558, 0.194695], [0.260137, 0.209684], [0.263509, 0.224214], [0.265808, 0.238151], [0.267148, 0.251214], [0.267752, 0.263412], [0.267845, 0.274525], [0.267568, 0.284473], [0.267038, 0.293273], [0.266403, 0.30077], [0.265833, 0.306952], [0.265397, 0.311804], [0.265086, 0.315295], [0.264897, 0.317398], [0.264833, 0.3181]] }, { x: 1.045319, puntos: [[0, 522e-5], [682e-6, 5415e-6], [271e-5, 5998e-6], [6035e-6, 6966e-6], [0.010617, 8325e-6], [0.016459, 0.010097], [0.02354, 0.012305], [0.031788, 0.014957], [0.041111, 0.018067], [0.05146, 0.021671], [0.062774, 0.025815], [0.074933, 0.03054], [0.087744, 0.035878], [0.101185, 0.042016], [0.114918, 0.049039], [0.12895, 0.057004], [0.14301, 0.065787], [0.157025, 0.075532], [0.170757, 0.086216], [0.184033, 0.097756], [0.19668, 0.110109], [0.208542, 0.123249], [0.219404, 0.137111], [0.229077, 0.151508], [0.237494, 0.166285], [0.244626, 0.181355], [0.250409, 0.196368], [0.254945, 0.21115], [0.258345, 0.225477], [0.260733, 0.239199], [0.262218, 0.252076], [0.262992, 0.264096], [0.263256, 0.275065], [0.263146, 0.284876], [0.262774, 0.293546], [0.262274, 0.30097], [0.261814, 0.307093], [0.261463, 0.311888], [0.261213, 0.315332], [0.261061, 0.317407], [0.26101, 0.3181]] }, { x: 1.072418, puntos: [[0, 6973e-6], [669e-6, 717e-5], [2658e-6, 7759e-6], [5923e-6, 8737e-6], [0.010425, 0.01011], [0.01617, 0.011904], [0.023139, 0.014138], [0.03126, 0.016822], [0.040424, 0.019963], [0.050585, 0.023609], [0.061685, 0.027816], [0.073604, 0.032607], [0.086194, 0.038011], [0.099366, 0.044213], [0.112777, 0.051341], [0.126479, 0.059437], [0.140197, 0.068313], [0.153865, 0.078135], [0.167238, 0.08887], [0.180143, 0.100422], [0.192454, 0.112761], [0.204, 0.125855], [0.214543, 0.139636], [0.223947, 0.153911], [0.23217, 0.168513], [0.239191, 0.183375], [0.244915, 0.198167], [0.249412, 0.212729], [0.252829, 0.226847], [0.2553, 0.240335], [0.256935, 0.253032], [0.257884, 0.264846], [0.258323, 0.275653], [0.258382, 0.285321], [0.258167, 0.293849], [0.257802, 0.301183], [0.257453, 0.307243], [0.257187, 0.31198], [0.256998, 0.315376], [0.256883, 0.317418], [0.256844, 0.3181]] }, { x: 1.099328, puntos: [[0, 894e-5], [655e-6, 9139e-6], [2603e-6, 9734e-6], [5803e-6, 0.010724], [0.010222, 0.012115], [0.015862, 0.01393], [0.02271, 0.016193], [0.0307, 0.01891], [0.039695, 0.022082], [0.049654, 0.025766], [0.060534, 0.030035], [0.072199, 0.034902], [0.084534, 0.040395], [0.097413, 0.046685], [0.110492, 0.053897], [0.123868, 0.062095], [0.137228, 0.07106], [0.150513, 0.08096], [0.163496, 0.091746], [0.176019, 0.103303], [0.187983, 0.115614], [0.199203, 0.128654], [0.209422, 0.142334], [0.218557, 0.156463], [0.226584, 0.170889], [0.233467, 0.185532], [0.239113, 0.200096], [0.243578, 0.214415], [0.247022, 0.228309], [0.249572, 0.241556], [0.251346, 0.254062], [0.25246, 0.26566], [0.253068, 0.276285], [0.253292, 0.285805], [0.253234, 0.294194], [0.253005, 0.30142], [0.252767, 0.3074], [0.252586, 0.312075], [0.252457, 0.315422], [0.252379, 0.31743], [0.252353, 0.3181]] }, { x: 1.126029, puntos: [[0, 0.011115], [64e-5, 0.011315], [2547e-6, 0.011917], [5682e-6, 0.012918], [0.010014, 0.014327], [0.015543, 0.016165], [0.022261, 0.018456], [0.030108, 0.021211], [0.038925, 0.02442], [0.048669, 0.028145], [0.059317, 0.032476], [0.070725, 0.037435], [0.082757, 0.04304], [0.09532, 0.049446], [0.108065, 0.056719], [0.121118, 0.06498], [0.134112, 0.074027], [0.146977, 0.084001], [0.159543, 0.094839], [0.171675, 0.106399], [0.183272, 0.118671], [0.194158, 0.131649], [0.204061, 0.145202], [0.212934, 0.159154], [0.220768, 0.173404], [0.227481, 0.187823], [0.23303, 0.202153], [0.237479, 0.2162], [0.240971, 0.229852], [0.243597, 0.242859], [0.245488, 0.255154], [0.246747, 0.266532], [0.247514, 0.27696], [0.247898, 0.286328], [0.247995, 0.294583], [0.247904, 0.301683], [0.247777, 0.307564], [0.247682, 0.312171], [0.247615, 0.315467], [0.247574, 0.317442], [0.24756, 0.3181]] }, { x: 1.152505, puntos: [[0, 0.013478], [626e-6, 0.013681], [2491e-6, 0.014289], [5561e-6, 0.015303], [9802e-6, 0.01673], [0.015214, 0.018593], [0.021791, 0.020918], [0.029477, 0.023718], [0.038101, 0.026978], [0.047618, 0.030759], [0.058022, 0.03516], [0.069163, 0.040218], [0.080863, 0.045944], [0.09309, 0.052479], [0.105495, 0.059808], [0.118209, 0.068114], [0.130826, 0.077232], [0.143255, 0.087264], [0.155393, 0.098143], [0.167125, 0.109701], [0.178339, 0.121928], [0.188874, 0.134827], [0.198473, 0.148233], [0.207091, 0.161989], [0.214727, 0.176054], [0.221257, 0.190238], [0.226704, 0.204323], [0.231144, 0.218082], [0.234689, 0.231479], [0.237389, 0.244241], [0.239381, 0.256305], [0.240771, 0.26746], [0.241687, 0.277681], [0.242229, 0.286888], [0.24248, 0.295009], [0.242529, 0.30197], [0.242518, 0.30774], [0.24251, 0.31227], [0.242506, 0.315513], [0.242503, 0.317454], [0.242502, 0.3181]] }, { x: 1.178736, puntos: [[0, 0.016011], [613e-6, 0.016217], [2438e-6, 0.016834], [544e-5, 0.017861], [9585e-6, 0.019308], [0.014876, 0.021201], [0.0213, 0.023568], [0.028797, 0.026423], [0.037212, 0.029758], [0.046493, 0.033622], [0.056633, 0.038106], [0.067492, 0.043265], [0.078849, 0.049103], [0.090728, 0.055762], [0.102777, 0.063163], [0.115115, 0.071515], [0.127347, 0.080697], [0.139341, 0.090753], [0.151064, 0.101653], [0.162385, 0.113198], [0.173197, 0.125375], [0.183363, 0.138169], [0.192671, 0.151417], [0.201038, 0.164969], [0.208463, 0.178834], [0.21482, 0.192766], [0.220177, 0.206591], [0.224599, 0.220058], [0.228185, 0.233191], [0.230955, 0.245701], [0.233044, 0.257512], [0.234557, 0.268438], [0.235615, 0.278452], [0.236311, 0.287488], [0.236719, 0.295462], [0.236913, 0.302277], [0.237022, 0.307928], [0.237108, 0.312377], [0.237169, 0.315561], [0.237206, 0.317467], [0.237218, 0.3181]] }, { x: 1.204705, puntos: [[0, 0.018705], [601e-6, 0.018915], [2387e-6, 0.019542], [5318e-6, 0.020585], [9362e-6, 0.022056], [0.014526, 0.023986], [0.020788, 0.026407], [0.028066, 0.029329], [0.036252, 0.032763], [0.045286, 0.03674], [0.055143, 0.041324], [0.065701, 0.046579], [0.076717, 0.052513], [0.088238, 0.05928], [0.099912, 0.066779], [0.111829, 0.075191], [0.123663, 0.084429], [0.135235, 0.094475], [0.146562, 0.105365], [0.157467, 0.116879], [0.167865, 0.129002], [0.177642, 0.141663], [0.186669, 0.154746], [0.194786, 0.168093], [0.201988, 0.181737], [0.208195, 0.195394], [0.213482, 0.208942], [0.21787, 0.222124], [0.221473, 0.234987], [0.224311, 0.247233], [0.226497, 0.258771], [0.228129, 0.269463], [0.229326, 0.279272], [0.230174, 0.288124], [0.230739, 0.295934], [0.23108, 0.302599], [0.231315, 0.30813], [0.231496, 0.312491], [0.231627, 0.315613], [0.231705, 0.31748], [0.23173, 0.3181]] }, { x: 1.230394, puntos: [[0, 0.02158], [588e-6, 0.021795], [2334e-6, 0.022434], [5192e-6, 0.023498], [9127e-6, 0.024997], [0.014157, 0.026972], [0.020248, 0.029455], [0.027291, 0.032454], [0.035231, 0.036], [0.044006, 0.040105], [0.053563, 0.044801], [0.063797, 0.05015], [0.074471, 0.056174], [0.085621, 0.063037], [0.096901, 0.070644], [0.108368, 0.079125], [0.119787, 0.088409], [0.130943, 0.098427], [0.141882, 0.109282], [0.152374, 0.120743], [0.162359, 0.132792], [0.171742, 0.1453], [0.180485, 0.158209], [0.188354, 0.171346], [0.195335, 0.184744], [0.20141, 0.198114], [0.206631, 0.211368], [0.210976, 0.224273], [0.21458, 0.236854], [0.217483, 0.248825], [0.219765, 0.260081], [0.221515, 0.27053], [0.222848, 0.28013], [0.223843, 0.288788], [0.224557, 0.296421], [0.22504, 0.302935], [0.225394, 0.308344], [0.225669, 0.312613], [0.225865, 0.315668], [0.225983, 0.317494], [0.226022, 0.3181]] }, { x: 1.255785, puntos: [[0, 0.024658], [574e-6, 0.024878], [2274e-6, 0.025533], [5053e-6, 0.026622], [8876e-6, 0.028156], [0.013763, 0.030183], [0.019674, 0.032735], [0.026481, 0.035817], [0.034162, 0.039472], [0.042663, 0.043705], [0.051906, 0.048518], [0.061792, 0.053964], [0.072117, 0.060086], [0.082876, 0.067036], [0.093747, 0.074743], [0.104758, 0.083293], [0.115739, 0.092617], [0.126471, 0.10261], [0.137014, 0.113406], [0.14711, 0.124787], [0.156698, 0.136727], [0.165697, 0.149074], [0.174138, 0.161794], [0.181761, 0.174712], [0.18854, 0.18784], [0.194492, 0.200916], [0.199635, 0.213862], [0.203937, 0.226498], [0.207537, 0.238779], [0.210497, 0.250465], [0.212873, 0.261437], [0.214742, 0.271634], [0.216208, 0.281017], [0.217341, 0.289472], [0.21819, 0.296921], [0.218799, 0.30328], [0.219259, 0.308566], [0.219615, 0.312739], [0.219869, 0.315725], [0.22002, 0.317508], [0.220071, 0.3181]] }, { x: 1.280861, puntos: [[0, 0.027969], [557e-6, 0.028195], [2207e-6, 0.028869], [49e-4, 0.029989], [8603e-6, 0.031566], [0.013339, 0.03365], [0.019064, 0.036274], [0.025642, 0.039442], [0.033054, 0.043193], [0.041265, 0.047542], [0.050181, 0.052473], [0.059698, 0.05802], [0.069661, 0.064252], [0.080008, 0.071287], [0.090458, 0.079071], [0.101018, 0.087682], [0.111537, 0.097036], [0.121834, 0.10702], [0.131961, 0.117737], [0.141684, 0.129007], [0.150901, 0.140797], [0.159537, 0.152977], [0.167653, 0.165494], [0.175032, 0.178176], [0.181637, 0.191012], [0.187467, 0.203792], [0.192509, 0.216419], [0.196775, 0.22879], [0.200373, 0.240752], [0.203383, 0.252144], [0.205848, 0.262837], [0.207834, 0.272773], [0.20943, 0.281924], [0.210688, 0.290168], [0.211654, 0.297432], [0.212366, 0.303635], [0.212912, 0.308794], [0.213333, 0.312868], [0.213633, 0.315783], [0.213812, 0.317523], [0.213872, 0.3181]] }, { x: 1.305605, puntos: [[0, 0.031577], [538e-6, 0.03181], [2131e-6, 0.032505], [4734e-6, 0.033659], [8312e-6, 0.035284], [0.012887, 0.037429], [0.018418, 0.040127], [0.024772, 0.043379], [0.031908, 0.047213], [0.039817, 0.051662], [0.048396, 0.056704], [0.057526, 0.062353], [0.067111, 0.068701], [0.077029, 0.075813], [0.087047, 0.083653], [0.097165, 0.092308], [0.107212, 0.101673], [0.117069, 0.111644], [0.126767, 0.122266], [0.136121, 0.133403], [0.144984, 0.145012], [0.153283, 0.157011], [0.16107, 0.169305], [0.168205, 0.181736], [0.174648, 0.194266], [0.180356, 0.206745], [0.18529, 0.219045], [0.189522, 0.231141], [0.193117, 0.242772], [0.196168, 0.253864], [0.198712, 0.264278], [0.200807, 0.273947], [0.202521, 0.282855], [0.203891, 0.290881], [0.204957, 0.297957], [0.205758, 0.304002], [0.206375, 0.309029], [0.20685, 0.313001], [0.207188, 0.315841], [0.207391, 0.317537], [0.207459, 0.3181]] }, { x: 1.329999, puntos: [[0, 0.035549], [517e-6, 0.035789], [205e-5, 0.036506], [4556e-6, 0.037695], [8003e-6, 0.03937], [0.01241, 0.041577], [0.01774, 0.044346], [0.023866, 0.047675], [0.030725, 0.051582], [0.038324, 0.056115], [0.046555, 0.061255], [0.05529, 0.067004], [0.064477, 0.073459], [0.073953, 0.080641], [0.083532, 0.088518], [0.093212, 0.097191], [0.102793, 0.106536], [0.112214, 0.116472], [0.121479, 0.126986], [0.130449, 0.137976], [0.138965, 0.149388], [0.146955, 0.161173], [0.154432, 0.173223], [0.161322, 0.18539], [0.167598, 0.197609], [0.173179, 0.209779], [0.178015, 0.221747], [0.182212, 0.233539], [0.185801, 0.244842], [0.188881, 0.255628], [0.191489, 0.265758], [0.193674, 0.275158], [0.195486, 0.283814], [0.196951, 0.291613], [0.198107, 0.298501], [0.198989, 0.304384], [0.199673, 0.309275], [0.200198, 0.313138], [0.200572, 0.315902], [0.200797, 0.317552], [0.200872, 0.3181]] }, { x: 1.354027, puntos: [[0, 0.039941], [496e-6, 0.040188], [1966e-6, 0.040927], [437e-5, 0.042153], [7679e-6, 0.043876], [0.011912, 0.046142], [0.017032, 0.048978], [0.022921, 0.052373], [0.029506, 0.056342], [0.03679, 0.060944], [0.044664, 0.066165], [0.053002, 0.072006], [0.061768, 0.078551], [0.070795, 0.085791], [0.079931, 0.093688], [0.089175, 0.102345], [0.09831, 0.111633], [0.107305, 0.121492], [0.116141, 0.131888], [0.124699, 0.142722], [0.132865, 0.153934], [0.140575, 0.165464], [0.147775, 0.177246], [0.15442, 0.189136], [0.160507, 0.201047], [0.165957, 0.212897], [0.170719, 0.224531], [0.174875, 0.235978], [0.178451, 0.246963], [0.181547, 0.257438], [0.184201, 0.267275], [0.186451, 0.276407], [0.188336, 0.284804], [0.189877, 0.292368], [0.191117, 0.299066], [0.192079, 0.304783], [0.19283, 0.309532], [0.193407, 0.313281], [0.193818, 0.315964], [0.194066, 0.317568], [0.194148, 0.3181]] }, { x: 1.377673, puntos: [[0, 0.044801], [474e-6, 0.045055], [188e-5, 0.045813], [418e-5, 0.04707], [7349e-6, 0.048837], [0.011402, 0.051156], [0.016306, 0.054049], [0.021949, 0.057498], [0.028258, 0.061522], [0.03522, 0.066178], [0.042729, 0.071462], [0.050673, 0.07738], [0.059003, 0.083988], [0.06758, 0.091268], [0.07627, 0.099165], [0.085078, 0.107777], [0.093784, 0.116971], [0.102364, 0.126715], [0.110779, 0.136975], [0.118911, 0.147641], [0.126726, 0.158643], [0.134167, 0.169889], [0.141118, 0.181381], [0.147522, 0.192978], [0.153403, 0.204579], [0.158717, 0.216097], [0.163418, 0.227394], [0.167526, 0.238466], [0.171087, 0.249136], [0.174189, 0.259294], [0.176872, 0.26883], [0.179164, 0.277692], [0.181098, 0.285825], [0.1827, 0.293147], [0.184015, 0.299651], [0.185054, 0.305198], [0.185872, 0.309798], [0.1865, 0.313428], [0.186947, 0.316028], [0.187217, 0.317583], [0.187307, 0.3181]] }, { x: 1.400921, puntos: [[0, 0.050164], [453e-6, 0.050423], [1795e-6, 0.051197], [3993e-6, 0.052479], [7021e-6, 0.054279], [0.010892, 0.056638], [0.015575, 0.059575], [0.020965, 0.06307], [0.02699, 0.06714], [0.033621, 0.071836], [0.04076, 0.077166], [0.048311, 0.083138], [0.056203, 0.089778], [0.064335, 0.097072], [0.072581, 0.104946], [0.08095, 0.113485], [0.089236, 0.122558], [0.097408, 0.132153], [0.105416, 0.142251], [0.11313, 0.152726], [0.120595, 0.163504], [0.127761, 0.17445], [0.134471, 0.185637], [0.140642, 0.196922], [0.146313, 0.2082], [0.151486, 0.219378], [0.156123, 0.23033], [0.160179, 0.241016], [0.163723, 0.251362], [0.166825, 0.261195], [0.169524, 0.270423], [0.17184, 0.279008], [0.173806, 0.286874], [0.175456, 0.29395], [0.176836, 0.300252], [0.177944, 0.305623], [0.178821, 0.310071], [0.179495, 0.313578], [0.179977, 0.316093], [0.180266, 0.317599], [0.180363, 0.3181]] }, { x: 1.423753, puntos: [[0, 0.056059], [432e-6, 0.056321], [1715e-6, 0.057104], [3814e-6, 0.058402], [6703e-6, 0.060222], [0.010392, 0.062604], [0.014849, 0.065568], [0.019981, 0.069099], [0.025713, 0.073209], [0.031997, 0.077932], [0.038766, 0.08329], [0.045927, 0.089288], [0.053388, 0.095924], [0.061083, 0.103198], [0.068889, 0.111022], [0.076816, 0.119466], [0.084685, 0.128397], [0.092456, 0.137815], [0.100071, 0.147718], [0.107397, 0.157972], [0.114515, 0.168502], [0.121382, 0.17915], [0.127847, 0.190018], [0.133796, 0.200968], [0.139262, 0.211907], [0.14429, 0.222736], [0.148846, 0.233334], [0.152848, 0.243638], [0.156375, 0.253641], [0.159475, 0.263138], [0.162179, 0.272054], [0.164505, 0.280353], [0.166493, 0.287948], [0.16818, 0.294779], [0.169612, 0.300867], [0.170776, 0.306056], [0.171702, 0.310349], [0.172415, 0.313731], [0.172924, 0.316158], [0.17323, 0.317615], [0.173333, 0.3181]] }, { x: 1.446156, puntos: [[0, 0.062491], [413e-6, 0.062755], [1637e-6, 0.063541], [3641e-6, 0.064845], [6394e-6, 0.066672], [9901e-6, 0.069059], [0.014131, 0.072033], [0.019002, 0.075591], [0.024429, 0.07973], [0.030358, 0.084465], [0.036756, 0.089833], [0.043533, 0.095825], [0.050575, 0.10242], [0.057844, 0.109638], [0.065216, 0.117385], [0.072704, 0.125709], [0.080157, 0.134478], [0.087531, 0.143695], [0.094768, 0.153371], [0.101737, 0.163373], [0.108516, 0.173629], [0.115063, 0.183982], [0.121269, 0.19452], [0.127006, 0.205117], [0.132277, 0.215697], [0.137155, 0.226166], [0.14161, 0.236401], [0.145553, 0.246331], [0.149061, 0.255972], [0.152157, 0.265122], [0.154858, 0.27372], [0.157184, 0.281722], [0.159186, 0.289046], [0.160902, 0.29563], [0.162372, 0.301493], [0.163578, 0.306494], [0.164542, 0.31063], [0.165283, 0.313886], [0.165813, 0.316225], [0.166132, 0.317631], [0.166239, 0.3181]] }, { x: 1.468113, puntos: [[0, 0.069449], [394e-6, 0.069712], [1561e-6, 0.070498], [3469e-6, 0.0718], [6087e-6, 0.073624], [9411e-6, 0.076004], [0.013414, 0.078973], [0.018022, 0.082542], [0.02314, 0.086692], [0.028715, 0.091423], [0.034745, 0.096776], [0.041142, 0.102732], [0.047775, 0.109256], [0.054629, 0.116385], [0.061581, 0.124022], [0.068638, 0.132198], [0.075682, 0.140786], [0.082663, 0.149781], [0.089532, 0.159202], [0.096168, 0.168925], [0.102617, 0.178881], [0.108836, 0.188934], [0.114772, 0.199133], [0.120297, 0.209363], [0.12538, 0.219567], [0.130107, 0.229666], [0.134446, 0.239527], [0.138322, 0.249088], [0.141802, 0.258352], [0.144886, 0.267148], [0.14758, 0.27542], [0.149903, 0.283114], [0.151913, 0.290162], [0.153648, 0.296499], [0.155142, 0.30213], [0.156376, 0.306939], [0.157366, 0.310915], [0.158128, 0.314043], [0.158673, 0.316293], [0.159001, 0.317648], [0.159111, 0.3181]] }, { x: 1.489609, puntos: [[0, 0.076917], [374e-6, 0.077178], [1482e-6, 0.077959], [3293e-6, 0.079254], [5774e-6, 0.081068], [8917e-6, 0.083433], [0.012694, 0.086385], [0.017037, 0.089945], [0.021848, 0.094084], [0.027077, 0.098789], [0.032745, 0.1041], [0.038765, 0.10999], [0.045003, 0.116418], [0.051452, 0.123427], [0.057997, 0.130918], [0.064643, 0.138915], [0.071286, 0.147301], [0.077879, 0.156056], [0.084387, 0.1652], [0.090705, 0.174621], [0.096834, 0.184253], [0.102733, 0.193994], [0.108389, 0.203844], [0.113693, 0.213698], [0.118595, 0.223515], [0.123169, 0.233231], [0.127381, 0.242708], [0.131182, 0.2519], [0.134616, 0.26078], [0.137679, 0.269215], [0.140365, 0.277151], [0.142685, 0.284528], [0.144697, 0.291295], [0.146441, 0.297381], [0.147944, 0.302774], [0.149196, 0.307388], [0.150202, 0.311204], [0.150977, 0.314204], [0.15153, 0.316363], [0.151865, 0.317665], [0.151976, 0.3181]] }, { x: 1.51063, puntos: [[0, 0.084871], [353e-6, 0.08513], [14e-4, 0.085904], [311e-5, 0.087188], [5452e-6, 0.088987], [8414e-6, 0.091331], [0.011967, 0.094256], [0.016047, 0.097784], [0.020556, 0.101884], [0.025454, 0.106541], [0.030766, 0.111782], [0.036414, 0.117578], [0.04227, 0.123889], [0.048323, 0.130748], [0.054478, 0.138056], [0.060737, 0.145843], [0.066992, 0.154004], [0.0732, 0.162503], [0.079351, 0.171351], [0.08536, 0.180451], [0.091182, 0.189736], [0.096775, 0.199149], [0.102145, 0.208641], [0.107216, 0.218114], [0.111939, 0.227535], [0.11636, 0.236854], [0.120439, 0.245939], [0.124154, 0.254759], [0.127521, 0.263251], [0.13055, 0.271321], [0.133228, 0.278909], [0.135547, 0.28596], [0.137558, 0.292441], [0.139299, 0.298272], [0.1408, 0.303427], [0.142057, 0.307843], [0.143071, 0.311497], [0.143852, 0.314368], [0.14441, 0.316435], [0.144747, 0.317683], [0.144859, 0.3181]] }, { x: 1.531161, puntos: [[0, 0.093276], [332e-6, 0.093532], [1315e-6, 0.094297], [2922e-6, 0.095566], [5124e-6, 0.097344], [7906e-6, 0.09966], [0.011239, 0.102548], [0.015058, 0.106023], [0.019273, 0.11006], [0.023854, 0.114646], [0.028819, 0.11979], [0.034099, 0.125467], [0.039584, 0.131639], [0.045254, 0.138321], [0.051035, 0.145417], [0.056924, 0.152965], [0.062805, 0.160879], [0.068639, 0.169103], [0.074441, 0.177638], [0.080144, 0.186401], [0.085668, 0.195322], [0.090972, 0.204387], [0.096055, 0.213508], [0.100883, 0.222598], [0.105425, 0.231617], [0.10969, 0.240528], [0.113631, 0.249214], [0.117247, 0.257657], [0.12053, 0.265759], [0.123513, 0.273459], [0.126178, 0.280691], [0.128494, 0.28741], [0.130498, 0.2936], [0.132229, 0.299172], [0.133717, 0.304086], [0.13497, 0.308304], [0.135985, 0.311794], [0.136767, 0.314534], [0.137325, 0.316509], [0.137661, 0.317701], [0.137773, 0.3181]] }, { x: 1.551189, puntos: [[0, 0.102094], [31e-5, 0.102346], [1229e-6, 0.103099], [2733e-6, 0.104348], [4794e-6, 0.1061], [7399e-6, 0.108381], [0.010516, 0.11122], [0.01408, 0.114624], [0.018011, 0.118575], [0.022287, 0.123068], [0.026912, 0.128093], [0.03183, 0.133628], [0.036954, 0.139639], [0.042256, 0.146118], [0.047676, 0.152977], [0.053207, 0.160265], [0.058728, 0.167909], [0.064204, 0.175835], [0.069667, 0.184042], [0.075065, 0.192453], [0.080296, 0.200998], [0.085326, 0.209694], [0.090131, 0.218433], [0.094707, 0.227136], [0.099062, 0.235749], [0.103165, 0.244245], [0.106962, 0.252526], [0.110467, 0.260584], [0.113656, 0.268294], [0.116581, 0.275622], [0.119223, 0.282495], [0.121529, 0.288879], [0.123519, 0.29477], [0.125233, 0.300079], [0.126703, 0.304752], [0.127945, 0.308768], [0.128954, 0.312094], [0.129732, 0.314704], [0.130286, 0.316584], [0.13062, 0.31772], [0.130731, 0.3181]] }, { x: 1.570698, puntos: [[0, 0.111282], [288e-6, 0.111529], [1145e-6, 0.112268], [2546e-6, 0.113494], [4468e-6, 0.115212], [6898e-6, 0.11745], [9805e-6, 0.120228], [0.013121, 0.123546], [0.016777, 0.12739], [0.02076, 0.131768], [0.025053, 0.136655], [0.029614, 0.142029], [0.034387, 0.147857], [0.039337, 0.15411], [0.044408, 0.160715], [0.049588, 0.167724], [0.054764, 0.175074], [0.059902, 0.18268], [0.065042, 0.190542], [0.070132, 0.198589], [0.075072, 0.206752], [0.079841, 0.215057], [0.084381, 0.223399], [0.088704, 0.231711], [0.092858, 0.239919], [0.096793, 0.247995], [0.100442, 0.255869], [0.103821, 0.263532], [0.106908, 0.270851], [0.109767, 0.277803], [0.112372, 0.284315], [0.114655, 0.290363], [0.116624, 0.295952], [0.118316, 0.300991], [0.119766, 0.305423], [0.120993, 0.309237], [0.12199, 0.312396], [0.12276, 0.314876], [0.123307, 0.316661], [0.123635, 0.317739], [0.123745, 0.3181]] }, { x: 1.589677, puntos: [[0, 0.120778], [267e-6, 0.121019], [1062e-6, 0.121741], [2362e-6, 0.122939], [4147e-6, 0.124618], [6407e-6, 0.126803], [9108e-6, 0.129509], [0.012185, 0.132727], [0.015578, 0.136447], [0.019278, 0.14069], [0.023249, 0.145424], [0.027461, 0.15062], [0.031893, 0.156243], [0.036508, 0.162249], [0.04124, 0.168585], [0.046074, 0.175304], [0.050919, 0.182339], [0.055742, 0.189604], [0.060573, 0.197106], [0.065353, 0.20478], [0.070004, 0.212557], [0.074522, 0.220454], [0.078814, 0.228386], [0.082883, 0.236304], [0.086825, 0.244107], [0.090584, 0.251762], [0.094079, 0.259228], [0.097322, 0.266487], [0.100303, 0.273416], [0.103086, 0.279992], [0.105638, 0.286145], [0.107883, 0.291858], [0.109823, 0.29714], [0.11149, 0.301906], [0.112918, 0.306098], [0.114125, 0.309708], [0.115107, 0.3127], [0.115865, 0.315048], [0.116402, 0.316739], [0.116724, 0.317759], [0.116831, 0.3181]] }, { x: 1.608112, puntos: [[0, 0.13048], [247e-6, 0.130715], [981e-6, 0.131418], [2183e-6, 0.132583], [3834e-6, 0.134216], [5926e-6, 0.13634], [8428e-6, 0.138963], [0.011275, 0.142071], [0.014416, 0.145656], [0.017841, 0.149746], [0.021502, 0.154312], [0.025377, 0.159316], [0.029481, 0.164715], [0.033777, 0.17046], [0.038181, 0.176518], [0.042677, 0.182936], [0.047204, 0.18964], [0.051728, 0.196551], [0.056263, 0.203684], [0.060738, 0.210979], [0.065103, 0.218368], [0.069377, 0.225845], [0.073433, 0.233362], [0.077253, 0.240881], [0.080976, 0.248282], [0.084553, 0.255516], [0.087891, 0.262577], [0.090988, 0.269429], [0.09386, 0.27597], [0.096559, 0.282172], [0.099043, 0.287971], [0.101235, 0.293353], [0.103138, 0.298328], [0.104777, 0.302819], [0.106179, 0.306774], [0.107363, 0.310179], [0.108326, 0.313004], [0.109068, 0.315221], [0.109594, 0.316817], [0.109907, 0.317779], [0.110012, 0.3181]] }, { x: 1.62599, puntos: [[0, 0.140291], [227e-6, 0.140519], [903e-6, 0.1412], [2009e-6, 0.14233], [353e-5, 0.143911], [5459e-6, 0.145965], [7766e-6, 0.148497], [0.010392, 0.151488], [0.01329, 0.154928], [0.01645, 0.158854], [0.019815, 0.163239], [0.023372, 0.168037], [0.027162, 0.173198], [0.031153, 0.178672], [0.03524, 0.184443], [0.03941, 0.190554], [0.043629, 0.196919], [0.047867, 0.203469], [0.052116, 0.210228], [0.056294, 0.21714], [0.06038, 0.22414], [0.064413, 0.231196], [0.06824, 0.238295], [0.071821, 0.245413], [0.075324, 0.252411], [0.078717, 0.259231], [0.081891, 0.26589], [0.084839, 0.272339], [0.087598, 0.278496], [0.090205, 0.284328], [0.092607, 0.289779], [0.094735, 0.294836], [0.096592, 0.299508], [0.098195, 0.303726], [0.09957, 0.307446], [0.100726, 0.310648], [0.101665, 0.313305], [0.102389, 0.315393], [0.102901, 0.316894], [0.103207, 0.317798], [0.103308, 0.3181]] }, { x: 1.6433, puntos: [[0, 0.150123], [208e-6, 0.150343], [828e-6, 0.151], [1842e-6, 0.15209], [3237e-6, 0.153614], [5007e-6, 0.155591], [7125e-6, 0.158024], [9538e-6, 0.160893], [0.012202, 0.164183], [0.015105, 0.167935], [0.018191, 0.172128], [0.02145, 0.176709], [0.024943, 0.181621], [0.028642, 0.186819], [0.032425, 0.192298], [0.036281, 0.198098], [0.040203, 0.204121], [0.044163, 0.21031], [0.048133, 0.216694], [0.052027, 0.223222], [0.055845, 0.229831], [0.059636, 0.236474], [0.063237, 0.243158], [0.066592, 0.249872], [0.069882, 0.256468], [0.073087, 0.262881], [0.076094, 0.269144], [0.07889, 0.275198], [0.081533, 0.280976], [0.08404, 0.286445], [0.086348, 0.291557], [0.088401, 0.296298], [0.090203, 0.300672], [0.091766, 0.304623], [0.093107, 0.308112], [0.094232, 0.311112], [0.095145, 0.313603], [0.095848, 0.315562], [0.096346, 0.31697], [0.096641, 0.317817], [0.096739, 0.3181]] }, { x: 1.660028, puntos: [[0, 0.159909], [19e-5, 0.16012], [756e-6, 0.160752], [1682e-6, 0.161799], [2955e-6, 0.163261], [457e-5, 0.165155], [6505e-6, 0.167483], [8714e-6, 0.170226], [0.011152, 0.173364], [0.013807, 0.176935], [0.016632, 0.180927], [0.019617, 0.18528], [0.022829, 0.189936], [0.026248, 0.194856], [0.029739, 0.20004], [0.033297, 0.205526], [0.036932, 0.211208], [0.040617, 0.217041], [0.044315, 0.223052], [0.047942, 0.229196], [0.051503, 0.235416], [0.055049, 0.241655], [0.058426, 0.247931], [0.061568, 0.254239], [0.064653, 0.260434], [0.067671, 0.26645], [0.070505, 0.272325], [0.073152, 0.277996], [0.075675, 0.283402], [0.078073, 0.288516], [0.080279, 0.293299], [0.082246, 0.297731], [0.083986, 0.301816], [0.085502, 0.305506], [0.086804, 0.308768], [0.087893, 0.31157], [0.088776, 0.313896], [0.089458, 0.315729], [0.089939, 0.317045], [0.090225, 0.317836], [0.09032, 0.3181]] }, { x: 1.676165, puntos: [[0, 0.169631], [173e-6, 0.169834], [686e-6, 0.170439], [1528e-6, 0.17144], [2684e-6, 0.172836], [415e-5, 0.174641], [5909e-6, 0.176859], [7922e-6, 0.179473], [0.010144, 0.182456], [0.012562, 0.185841], [0.015142, 0.189624], [0.017874, 0.193741], [0.020823, 0.198133], [0.023972, 0.202774], [0.027183, 0.207661], [0.030459, 0.212833], [0.033816, 0.218174], [0.037232, 0.223657], [0.040664, 0.229299], [0.044035, 0.235062], [0.047349, 0.240892], [0.050651, 0.246738], [0.053805, 0.252613], [0.056746, 0.258516], [0.059634, 0.264313], [0.062465, 0.26994], [0.065126, 0.275433], [0.067621, 0.28073], [0.070019, 0.285772], [0.072302, 0.29054], [0.074398, 0.295002], [0.076272, 0.299134], [0.077941, 0.302938], [0.079403, 0.306374], [0.08066, 0.309413], [0.08171, 0.31202], [0.082561, 0.314185], [0.083218, 0.315892], [0.083683, 0.317118], [0.083959, 0.317855], [0.08405, 0.3181]] }, { x: 1.691698, puntos: [[0, 0.179275], [156e-6, 0.179468], [62e-5, 0.180045], [138e-5, 0.180999], [2424e-6, 0.182326], [3748e-6, 0.184039], [5338e-6, 0.186143], [7164e-6, 0.188624], [9179e-6, 0.191448], [0.011373, 0.194643], [0.013725, 0.198209], [0.016224, 0.202084], [0.018923, 0.20621], [0.021813, 0.210572], [0.024757, 0.21516], [0.027767, 0.220016], [0.030855, 0.225019], [0.034008, 0.230155], [0.037178, 0.235433], [0.040304, 0.240817], [0.04338, 0.246262], [0.046441, 0.251721], [0.049373, 0.257202], [0.05212, 0.262703], [0.054817, 0.268106], [0.057463, 0.273351], [0.059952, 0.278468], [0.062295, 0.2834], [0.064561, 0.288087], [0.066721, 0.292517], [0.068702, 0.296666], [0.070478, 0.300506], [0.072068, 0.304037], [0.073469, 0.307226], [0.074676, 0.310047], [0.075682, 0.312462], [0.076499, 0.314469], [0.077131, 0.316053], [0.077578, 0.31719], [0.077843, 0.317873], [0.077931, 0.3181]] }, { x: 1.706618, puntos: [[0, 0.188822], [14e-5, 0.189006], [557e-6, 0.189553], [1239e-6, 0.190457], [2176e-6, 0.191713], [3363e-6, 0.193332], [4793e-6, 0.19532], [644e-5, 0.197663], [826e-5, 0.200326], [0.010243, 0.203329], [0.012382, 0.206672], [0.014665, 0.210299], [0.01713, 0.214157], [0.01977, 0.21824], [0.022459, 0.22253], [0.025218, 0.227067], [0.02805, 0.231735], [0.030944, 0.23653], [0.033858, 0.241448], [0.036745, 0.246459], [0.039592, 0.251522], [0.042418, 0.256602], [0.04513, 0.261697], [0.047688, 0.266801], [0.050199, 0.271814], [0.052662, 0.276684], [0.054982, 0.281431], [0.057172, 0.286006], [0.059299, 0.290349], [0.061329, 0.294449], [0.063191, 0.298291], [0.064865, 0.301845], [0.066369, 0.305112], [0.067701, 0.30806], [0.068852, 0.310667], [0.069812, 0.312895], [0.070592, 0.314747], [0.071198, 0.31621], [0.071626, 0.31726], [0.071881, 0.31789], [0.071965, 0.3181]] }, { x: 1.720913, puntos: [[0, 0.198248], [125e-6, 0.198422], [496e-6, 0.19894], [1104e-6, 0.199793], [1938e-6, 0.200977], [2997e-6, 0.202501], [4275e-6, 0.204371], [5752e-6, 0.206572], [7387e-6, 0.209072], [9176e-6, 0.21188], [0.011116, 0.214995], [0.013199, 0.218372], [0.015443, 0.221963], [0.017842, 0.225769], [0.020289, 0.229759], [0.022813, 0.233978], [0.025399, 0.238314], [0.02804, 0.242772], [0.030703, 0.247339], [0.033357, 0.251982], [0.035983, 0.256668], [0.03858, 0.261374], [0.041075, 0.266093], [0.043446, 0.270807], [0.045775, 0.275436], [0.048061, 0.279936], [0.050218, 0.28432], [0.052253, 0.288545], [0.054232, 0.292554], [0.056125, 0.296334], [0.057867, 0.299874], [0.059435, 0.30315], [0.060849, 0.30616], [0.062103, 0.308875], [0.063192, 0.311272], [0.064103, 0.313319], [0.064846, 0.31502], [0.065424, 0.316364], [0.065833, 0.317329], [0.066077, 0.317908], [0.066158, 0.3181]] }, { x: 1.734575, puntos: [[0, 0.20754], [111e-6, 0.207704], [439e-6, 0.208192], [975e-6, 0.208993], [1713e-6, 0.210103], [2651e-6, 0.211532], [3787e-6, 0.213282], [5101e-6, 0.215338], [6564e-6, 0.217672], [8172e-6, 0.220285], [9927e-6, 0.22317], [0.011824, 0.226295], [0.01386, 0.229619], [0.016027, 0.23315], [0.018245, 0.236843], [0.020548, 0.240745], [0.0229, 0.244752], [0.025293, 0.248878], [0.027712, 0.253101], [0.030138, 0.257383], [0.032549, 0.261698], [0.034926, 0.266035], [0.037207, 0.270386], [0.039393, 0.274719], [0.041544, 0.278971], [0.043655, 0.283106], [0.045654, 0.287135], [0.047534, 0.291017], [0.049357, 0.294703], [0.05111, 0.29817], [0.05273, 0.301414], [0.054192, 0.304419], [0.055508, 0.307181], [0.056679, 0.309668], [0.057701, 0.311862], [0.05856, 0.313732], [0.059264, 0.315286], [0.059813, 0.316515], [0.060204, 0.317396], [0.060436, 0.317924], [0.060513, 0.3181]] }, { x: 1.747593, puntos: [[0, 0.216695], [97e-6, 0.216849], [384e-6, 0.217306], [854e-6, 0.218055], [1501e-6, 0.21909], [2328e-6, 0.220423], [333e-5, 0.222052], [4492e-6, 0.223959], [5794e-6, 0.226125], [7234e-6, 0.228543], [8816e-6, 0.231195], [0.010538, 0.234069], [0.012377, 0.237129], [0.014322, 0.240386], [0.016322, 0.243784], [0.018416, 0.247369], [0.020545, 0.251053], [0.022699, 0.254851], [0.02488, 0.258734], [0.027083, 0.262662], [0.029288, 0.266613], [0.031451, 0.270587], [0.033524, 0.274577], [0.035527, 0.278537], [0.037502, 0.282419], [0.039441, 0.286197], [0.041286, 0.289877], [0.04301, 0.293423], [0.044675, 0.296795], [0.046283, 0.299958], [0.047782, 0.302913], [0.049135, 0.305653], [0.050351, 0.308173], [0.051434, 0.310439], [0.052385, 0.312435], [0.053189, 0.314134], [0.053851, 0.315545], [0.05437, 0.316661], [0.05474, 0.317462], [0.05496, 0.317941], [0.055033, 0.3181]] }, { x: 1.759959, puntos: [[0, 0.225707], [84e-6, 0.22585], [334e-6, 0.226275], [742e-6, 0.22697], [1305e-6, 0.227929], [2028e-6, 0.229163], [2907e-6, 0.23067], [3926e-6, 0.232426], [5079e-6, 0.234422], [6363e-6, 0.236644], [7781e-6, 0.239066], [9337e-6, 0.241689], [0.010989, 0.244487], [0.012725, 0.247473], [0.014518, 0.250578], [0.016412, 0.25385], [0.018327, 0.257213], [0.020252, 0.260687], [0.022206, 0.264236], [0.024193, 0.267816], [0.026196, 0.271409], [0.028152, 0.275026], [0.030023, 0.278662], [0.031845, 0.282259], [0.033647, 0.285779], [0.035417, 0.289206], [0.03711, 0.292545], [0.038679, 0.295763], [0.040185, 0.298829], [0.041648, 0.301696], [0.043024, 0.304368], [0.044268, 0.306852], [0.045381, 0.309136], [0.046373, 0.311186], [0.04725, 0.31299], [0.047996, 0.314524], [0.048615, 0.315797], [0.049101, 0.316803], [0.049448, 0.317525], [0.049655, 0.317957], [0.049724, 0.3181]] }, { x: 1.771665, puntos: [[0, 0.234557], [73e-6, 0.234689], [288e-6, 0.235081], [64e-5, 0.23572], [1126e-6, 0.236601], [1753e-6, 0.237736], [2519e-6, 0.239118], [3407e-6, 0.240722], [442e-5, 0.242547], [5558e-6, 0.244573], [6822e-6, 0.246767], [822e-5, 0.249144], [9695e-6, 0.251683], [0.011232, 0.254399], [0.012828, 0.257215], [0.014531, 0.260178], [0.016242, 0.263226], [0.01795, 0.266378], [0.019687, 0.269598], [0.021466, 0.272837], [0.023272, 0.27608], [0.025029, 0.279347], [0.026703, 0.282636], [0.028347, 0.285877], [0.029979, 0.289046], [0.031583, 0.292131], [0.033124, 0.295137], [0.03454, 0.298034], [0.03589, 0.300802], [0.037209, 0.303381], [0.038462, 0.305779], [0.039595, 0.308012], [0.040605, 0.310067], [0.041505, 0.311908], [0.042305, 0.313527], [0.042992, 0.3149], [0.043564, 0.31604], [0.044015, 0.31694], [0.044338, 0.317586], [0.04453, 0.317972], [0.044594, 0.3181]] }, { x: 1.782701, puntos: [[0, 0.243218], [62e-6, 0.243339], [246e-6, 0.243697], [547e-6, 0.24428], [964e-6, 0.245082], [1504e-6, 0.246115], [2166e-6, 0.247372], [2934e-6, 0.248824], [3819e-6, 0.250477], [482e-5, 0.252307], [5938e-6, 0.254278], [7184e-6, 0.256413], [849e-5, 0.258698], [9841e-6, 0.261146], [0.011252, 0.263678], [0.01277, 0.266338], [0.014287, 0.269076], [0.015789, 0.271913], [0.017321, 0.274808], [0.0189, 0.277712], [0.020515, 0.280614], [0.022079, 0.283539], [0.023565, 0.286489], [0.025036, 0.289384], [0.026499, 0.292211], [0.027939, 0.294964], [0.029328, 0.297648], [0.030595, 0.300233], [0.031793, 0.30271], [0.032972, 0.305009], [0.034101, 0.307142], [0.035123, 0.309132], [0.03603, 0.310965], [0.036839, 0.312604], [0.037562, 0.314042], [0.038186, 0.315262], [0.038709, 0.316273], [0.039123, 0.317072], [0.039419, 0.317644], [0.039596, 0.317986], [0.039655, 0.3181]] }, { x: 1.793062, puntos: [[0, 0.251658], [53e-6, 0.251768], [209e-6, 0.252091], [465e-6, 0.252616], [819e-6, 0.253339], [1281e-6, 0.254269], [1849e-6, 0.255399], [2508e-6, 0.2567], [3274e-6, 0.258182], [4148e-6, 0.25982], [5128e-6, 0.261573], [6227e-6, 0.263472], [7373e-6, 0.265508], [855e-5, 0.267693], [9785e-6, 0.269946], [0.011125, 0.272311], [0.012457, 0.274746], [0.013768, 0.277272], [0.015107, 0.279849], [0.016495, 0.282427], [0.017924, 0.284998], [0.019303, 0.28759], [0.02061, 0.290208], [0.021912, 0.292769], [0.02321, 0.295267], [0.024488, 0.297699], [0.025727, 0.30007], [0.026848, 0.302354], [0.027902, 0.304546], [0.028944, 0.306575], [0.02995, 0.308453], [0.030861, 0.310209], [0.031667, 0.311826], [0.032386, 0.31327], [0.033031, 0.314536], [0.033592, 0.315608], [0.034063, 0.316496], [0.034438, 0.317198], [0.034706, 0.3177], [0.034867, 0.318], [0.03492, 0.3181]] }, { x: 1.802739, puntos: [[0, 0.259832], [45e-6, 0.259929], [176e-6, 0.260217], [392e-6, 0.260685], [691e-6, 0.261328], [1083e-6, 0.262155], [1566e-6, 0.263158], [2127e-6, 0.26431], [2784e-6, 0.265623], [3538e-6, 0.267071], [4388e-6, 0.268614], [5346e-6, 0.270286], [634e-5, 0.272079], [7356e-6, 0.274005], [8427e-6, 0.275989], [9596e-6, 0.278068], [0.010753, 0.280208], [0.011886, 0.282431], [0.013044, 0.284696], [0.014252, 0.286958], [0.015501, 0.28921], [0.016703, 0.291482], [0.01784, 0.293776], [0.018978, 0.296015], [0.020116, 0.298197], [0.021236, 0.300322], [0.022325, 0.302392], [0.023305, 0.304386], [0.024223, 0.306303], [0.025135, 0.308072], [0.026019, 0.309708], [0.026821, 0.311237], [0.027529, 0.312648], [0.02816, 0.313905], [0.028729, 0.315005], [0.029225, 0.315937], [0.029644, 0.316708], [0.029977, 0.317317], [0.030216, 0.317753], [0.030359, 0.318014], [0.030406, 0.3181]] }, { x: 1.811726, puntos: [[0, 0.267674], [37e-6, 0.26776], [147e-6, 0.268013], [328e-6, 0.268424], [578e-6, 0.268987], [907e-6, 0.269712], [1314e-6, 0.270591], [1787e-6, 0.271597], [2344e-6, 0.272745], [2987e-6, 0.274007], [3714e-6, 0.275349], [4538e-6, 0.276801], [5391e-6, 0.27836], [6258e-6, 0.280036], [7174e-6, 0.281759], [818e-5, 0.283563], [9172e-6, 0.28542], [0.01014, 0.287349], [0.011132, 0.289314], [0.012169, 0.291272], [0.013247, 0.293219], [0.01428, 0.295183], [0.015257, 0.297168], [0.016239, 0.2991], [0.017222, 0.300981], [0.01819, 0.302812], [0.019133, 0.304597], [0.019979, 0.306315], [0.020769, 0.307967], [0.021556, 0.30949], [0.022323, 0.310895], [0.023018, 0.312211], [0.023631, 0.313423], [0.024178, 0.314503], [0.024672, 0.315448], [0.025105, 0.316246], [0.025471, 0.316907], [0.025762, 0.31743], [0.025971, 0.317803], [0.026096, 0.318026], [0.026138, 0.3181]] }, { x: 1.820017, puntos: [[0, 0.275124], [31e-6, 0.275198], [122e-6, 0.275417], [271e-6, 0.275771], [478e-6, 0.276257], [751e-6, 0.276882], [109e-5, 0.27764], [1484e-6, 0.278506], [195e-5, 0.279493], [249e-5, 0.280577], [3104e-6, 0.281726], [3802e-6, 0.28297], [4522e-6, 0.284304], [5252e-6, 0.28574], [6025e-6, 0.287214], [6877e-6, 0.288756], [7716e-6, 0.290343], [8532e-6, 0.291991], [9369e-6, 0.293669], [0.010247, 0.295338], [0.011162, 0.296996], [0.012038, 0.298669], [0.012864, 0.300359], [0.013699, 0.302], [0.014536, 0.303598], [0.015359, 0.305153], [0.016162, 0.306668], [0.016881, 0.308126], [0.017551, 0.309528], [0.01822, 0.310818], [0.018874, 0.312008], [0.019467, 0.313122], [0.01999, 0.314149], [0.020456, 0.315063], [0.020879, 0.315861], [0.02125, 0.316535], [0.021564, 0.317093], [0.021814, 0.317534], [0.021994, 0.31785], [0.022101, 0.318038], [0.022137, 0.3181]] }, { x: 1.827607, puntos: [[0, 0.282123], [25e-6, 0.282186], [99e-6, 0.282371], [221e-6, 0.282672], [39e-5, 0.283083], [613e-6, 0.283612], [891e-6, 0.284253], [1214e-6, 0.284984], [1598e-6, 0.285818], [2044e-6, 0.286732], [2553e-6, 0.287699], [3134e-6, 0.288746], [3732e-6, 0.289868], [4337e-6, 0.291076], [4978e-6, 0.292314], [5687e-6, 0.293609], [6384e-6, 0.29494], [7061e-6, 0.296323], [7755e-6, 0.29773], [8486e-6, 0.299128], [925e-5, 0.300515], [9979e-6, 0.301914], [0.010666, 0.303327], [0.011363, 0.304698], [0.012062, 0.306031], [0.012749, 0.307329], [0.013421, 0.308592], [0.014021, 0.309807], [0.01458, 0.310976], [0.015139, 0.312049], [0.015686, 0.313039], [0.016182, 0.313966], [0.01662, 0.31482], [0.017011, 0.315579], [0.017366, 0.316243], [0.017677, 0.316802], [0.017941, 0.317265], [0.018152, 0.317631], [0.018303, 0.317892], [0.018394, 0.318048], [0.018424, 0.3181]] }, { x: 1.834489, puntos: [[0, 0.28862], [2e-5, 0.288672], [8e-5, 0.288825], [177e-6, 0.289074], [312e-6, 0.289415], [492e-6, 0.289852], [715e-6, 0.290382], [975e-6, 0.290987], [1286e-6, 0.291676], [1647e-6, 0.29243], [206e-5, 0.293227], [2533e-6, 0.294089], [3019e-6, 0.295012], [3511e-6, 0.296007], [4032e-6, 0.297025], [461e-5, 0.298089], [5177e-6, 0.299183], [5727e-6, 0.300319], [6292e-6, 0.301473], [6888e-6, 0.302619], [7511e-6, 0.303755], [8105e-6, 0.3049], [8666e-6, 0.306057], [9235e-6, 0.307177], [9806e-6, 0.308266], [0.010368, 0.309326], [0.010917, 0.310357], [0.011407, 0.311349], [0.011864, 0.312302], [0.012321, 0.313177], [0.012769, 0.313983], [0.013176, 0.314738], [0.013534, 0.315434], [0.013855, 0.316051], [0.014146, 0.316591], [0.014402, 0.317045], [0.014618, 0.317422], [0.014792, 0.317719], [0.014916, 0.317931], [0.014991, 0.318058], [0.015015, 0.3181]] }, { x: 1.84066, puntos: [[0, 0.294565], [16e-6, 0.294607], [62e-6, 0.294731], [138e-6, 0.294931], [245e-6, 0.295206], [385e-6, 0.295558], [561e-6, 0.295985], [765e-6, 0.296472], [101e-5, 0.297026], [1295e-6, 0.297632], [1623e-6, 0.298272], [1998e-6, 0.298963], [2384e-6, 0.299704], [2773e-6, 0.300501], [3186e-6, 0.301317], [3645e-6, 0.302169], [4095e-6, 0.303044], [4531e-6, 0.303952], [4979e-6, 0.304875], [5453e-6, 0.30579], [5949e-6, 0.306696], [6421e-6, 0.30761], [6866e-6, 0.308532], [7319e-6, 0.309424], [7774e-6, 0.310291], [8221e-6, 0.311135], [8658e-6, 0.311955], [9048e-6, 0.312743], [9412e-6, 0.313501], [9776e-6, 0.314196], [0.010134, 0.314836], [0.010458, 0.315435], [0.010744, 0.315987], [0.011, 0.316477], [0.011233, 0.316905], [0.011437, 0.317265], [0.01161, 0.317563], [0.011749, 0.317798], [0.011849, 0.317967], [0.011908, 0.318067], [0.011928, 0.3181]] }, { x: 1.846114, puntos: [[0, 0.299916], [12e-6, 0.299949], [47e-6, 0.300046], [105e-6, 0.300202], [186e-6, 0.300416], [293e-6, 0.30069], [427e-6, 0.301023], [583e-6, 0.301402], [77e-5, 0.301833], [988e-6, 0.302304], [1239e-6, 0.302801], [1528e-6, 0.303337], [1824e-6, 0.303912], [2123e-6, 0.30453], [244e-5, 0.305162], [2792e-6, 0.305822], [3138e-6, 0.3065], [3473e-6, 0.307203], [3818e-6, 0.307916], [4182e-6, 0.308623], [4564e-6, 0.309323], [4927e-6, 0.310029], [527e-5, 0.31074], [5619e-6, 0.311428], [5969e-6, 0.312096], [6313e-6, 0.312746], [665e-5, 0.313378], [6951e-6, 0.313985], [7232e-6, 0.314568], [7513e-6, 0.315102], [7788e-6, 0.315594], [8038e-6, 0.316055], [8259e-6, 0.316479], [8457e-6, 0.316855], [8637e-6, 0.317183], [8795e-6, 0.317459], [8929e-6, 0.317688], [9037e-6, 0.317869], [9114e-6, 0.317998], [916e-5, 0.318075], [9175e-6, 0.3181]] }, { x: 1.850849, puntos: [[0, 0.304635], [9e-6, 0.304659], [35e-6, 0.304731], [77e-6, 0.304848], [136e-6, 0.305007], [214e-6, 0.305212], [312e-6, 0.30546], [427e-6, 0.305742], [564e-6, 0.306064], [724e-6, 0.306414], [909e-6, 0.306784], [1121e-6, 0.307183], [1339e-6, 0.30761], [1559e-6, 0.30807], [1793e-6, 0.308539], [2053e-6, 0.309029], [2308e-6, 0.309532], [2555e-6, 0.310053], [2809e-6, 0.310582], [3078e-6, 0.311105], [336e-5, 0.311623], [3627e-6, 0.312145], [388e-5, 0.312672], [4138e-6, 0.31318], [4397e-6, 0.313674], [4651e-6, 0.314154], [49e-4, 0.31462], [5122e-6, 0.315068], [5329e-6, 0.315499], [5537e-6, 0.315892], [5741e-6, 0.316255], [5926e-6, 0.316594], [6089e-6, 0.316907], [6236e-6, 0.317184], [6369e-6, 0.317425], [6486e-6, 0.317629], [6586e-6, 0.317797], [6665e-6, 0.31793], [6722e-6, 0.318025], [6756e-6, 0.318081], [6767e-6, 0.3181]] }, { x: 1.854861, puntos: [[0, 0.308686], [6e-6, 0.308703], [24e-6, 0.308754], [53e-6, 0.308836], [94e-6, 0.308948], [148e-6, 0.309092], [216e-6, 0.309267], [295e-6, 0.309465], [39e-5, 0.309691], [502e-6, 0.309938], [63e-5, 0.310197], [778e-6, 0.310477], [93e-5, 0.310776], [1083e-6, 0.311099], [1246e-6, 0.311428], [1427e-6, 0.311771], [1604e-6, 0.312123], [1776e-6, 0.312488], [1953e-6, 0.312858], [2141e-6, 0.313224], [2337e-6, 0.313586], [2524e-6, 0.313951], [27e-4, 0.314318], [288e-5, 0.314673], [306e-5, 0.315018], [3237e-6, 0.315353], [3411e-6, 0.315678], [3566e-6, 0.31599], [3711e-6, 0.31629], [3856e-6, 0.316564], [3998e-6, 0.316817], [4127e-6, 0.317053], [4241e-6, 0.31727], [4344e-6, 0.317463], [4437e-6, 0.317631], [4519e-6, 0.317772], [4588e-6, 0.317889], [4644e-6, 0.317982], [4684e-6, 0.318048], [4707e-6, 0.318087], [4715e-6, 0.3181]] }, { x: 1.858147, puntos: [[0, 0.312041], [4e-6, 0.312053], [15e-6, 0.312085], [34e-6, 0.312139], [6e-5, 0.312211], [95e-6, 0.312304], [138e-6, 0.312417], [189e-6, 0.312546], [249e-6, 0.312692], [321e-6, 0.312851], [403e-6, 0.313018], [498e-6, 0.313199], [595e-6, 0.313392], [693e-6, 0.3136], [797e-6, 0.313813], [914e-6, 0.314034], [1027e-6, 0.314261], [1138e-6, 0.314496], [1251e-6, 0.314734], [1372e-6, 0.314969], [1498e-6, 0.315202], [1618e-6, 0.315437], [1731e-6, 0.315673], [1846e-6, 0.315901], [1962e-6, 0.316123], [2076e-6, 0.316338], [2187e-6, 0.316547], [2287e-6, 0.316747], [238e-5, 0.31694], [2473e-6, 0.317116], [2565e-6, 0.317278], [2648e-6, 0.317429], [2721e-6, 0.317568], [2787e-6, 0.317692], [2847e-6, 0.3178], [29e-4, 0.31789], [2944e-6, 0.317965], [298e-5, 0.318024], [3006e-6, 0.318066], [3021e-6, 0.318092], [3026e-6, 0.3181]] }, { x: 1.860706, puntos: [[0, 0.314677], [2e-6, 0.314683], [9e-6, 0.314702], [19e-6, 0.314732], [34e-6, 0.314773], [53e-6, 0.314826], [77e-6, 0.31489], [106e-6, 0.314963], [14e-5, 0.315045], [18e-5, 0.315136], [226e-6, 0.315231], [28e-5, 0.315333], [335e-6, 0.315443], [39e-5, 0.31556], [449e-6, 0.31568], [514e-6, 0.315806], [578e-6, 0.315934], [641e-6, 0.316067], [705e-6, 0.316201], [773e-6, 0.316335], [844e-6, 0.316466], [911e-6, 0.316599], [975e-6, 0.316732], [104e-5, 0.316861], [1105e-6, 0.316986], [117e-5, 0.317107], [1232e-6, 0.317225], [1289e-6, 0.317338], [1341e-6, 0.317446], [1394e-6, 0.317546], [1445e-6, 0.317637], [1492e-6, 0.317722], [1534e-6, 0.317801], [1571e-6, 0.31787], [1605e-6, 0.317931], [1635e-6, 0.317982], [166e-5, 0.318024], [168e-5, 0.318057], [1695e-6, 0.318081], [1703e-6, 0.318095], [1706e-6, 0.3181]] }, { x: 1.862534, puntos: [[0, 0.316573], [1e-6, 0.316576], [4e-6, 0.316584], [8e-6, 0.316597], [15e-6, 0.316616], [24e-6, 0.316639], [34e-6, 0.316668], [47e-6, 0.316701], [62e-6, 0.316738], [8e-5, 0.316778], [101e-6, 0.316821], [124e-6, 0.316866], [149e-6, 0.316915], [174e-6, 0.316968], [2e-4, 0.317021], [229e-6, 0.317077], [257e-6, 0.317135], [285e-6, 0.317194], [314e-6, 0.317254], [344e-6, 0.317313], [376e-6, 0.317372], [406e-6, 0.317431], [434e-6, 0.317491], [463e-6, 0.317548], [492e-6, 0.317604], [521e-6, 0.317658], [549e-6, 0.31771], [574e-6, 0.317761], [597e-6, 0.317809], [621e-6, 0.317853], [644e-6, 0.317894], [665e-6, 0.317932], [683e-6, 0.317967], [7e-4, 0.317998], [715e-6, 0.318025], [728e-6, 0.318047], [739e-6, 0.318066], [748e-6, 0.318081], [755e-6, 0.318092], [759e-6, 0.318098], [76e-5, 0.3181]] }, { x: 1.863632, puntos: [[0, 0.317716], [0, 0.317717], [1e-6, 0.317719], [2e-6, 0.317722], [4e-6, 0.317727], [6e-6, 0.317733], [9e-6, 0.31774], [12e-6, 0.317748], [16e-6, 0.317757], [2e-5, 0.317768], [25e-6, 0.317778], [31e-6, 0.31779], [37e-6, 0.317802], [44e-6, 0.317815], [5e-5, 0.317829], [57e-6, 0.317843], [65e-6, 0.317857], [72e-6, 0.317872], [79e-6, 0.317887], [86e-6, 0.317902], [94e-6, 0.317917], [102e-6, 0.317932], [109e-6, 0.317947], [116e-6, 0.317961], [124e-6, 0.317975], [131e-6, 0.317989], [138e-6, 0.318002], [144e-6, 0.318015], [15e-5, 0.318027], [156e-6, 0.318038], [162e-6, 0.318048], [167e-6, 0.318058], [172e-6, 0.318067], [176e-6, 0.318074], [18e-5, 0.318081], [183e-6, 0.318087], [186e-6, 0.318092], [188e-6, 0.318095], [19e-5, 0.318098], [191e-6, 0.318099], [191e-6, 0.3181]] }, { x: 1.863998, puntos: [[0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318098], [0, 0.318099], [0, 0.318099], [0, 0.318099], [0, 0.318099], [1e-6, 0.318099], [1e-6, 0.318099], [1e-6, 0.318099], [1e-6, 0.318099], [1e-6, 0.318099], [1e-6, 0.318099], [1e-6, 0.318099], [1e-6, 0.318099], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181], [1e-6, 0.3181]] }] };

// ../itb-estabilidad/src/caso-referencia.ts
var ESCALA = 6.25;
function formasReferencia() {
  const modelo = sysser01_default;
  const casco = {
    nombre: "Sysser 1 a escala real",
    fuente: `${modelo.fuente}; escalado \xD7${ESCALA}`,
    secciones: modelo.secciones.map((s) => ({
      x: s.x * ESCALA,
      puntos: s.puntos.map(([y, z]) => [y * ESCALA, z * ESCALA])
    }))
  };
  const quilla = cuerpoAleta({
    nombre: "quilla",
    xBordeAtaqueRaiz: 4.985 + 1.6,
    zRaiz: 0,
    cuerdaRaiz: 0.414 * ESCALA,
    cuerdaPunta: 0.262 * ESCALA,
    envergadura: 0.219 * ESCALA,
    flecha: 45,
    espesorRaiz: 0.15,
    espesorPunta: 0.15
  });
  const timon = cuerpoAleta({
    nombre: "tim\xF3n",
    xBordeAtaqueRaiz: -0.05 + 0.124 * ESCALA,
    zRaiz: 0.58,
    cuerdaRaiz: 0.124 * ESCALA,
    cuerdaPunta: 0.096 * ESCALA,
    envergadura: 0.266 * ESCALA,
    flecha: 5.4,
    espesorRaiz: 0.12,
    espesorPunta: 0.12
  });
  const caseta = cuerpoCaseta(casco, { nombre: "caseta", x0: 4, x1: 8, semimanga: 1.1, altura: 0.5 });
  return { ...casco, cuerpos: [quilla, timon, caseta] };
}
var ROSCA = [
  { nombre: "Casco, cubierta e interiores", masa: 3300, x: 4.9, z: 1.05 },
  // El plomo, en el centroide de la quilla (x = 5,00, z = −0,58 con la posición de la figura 3).
  { nombre: "Lastre de la quilla (plomo)", masa: 4300, x: 5, z: -0.58 },
  { nombre: "Aparejo: palo, botavara, jarcia, velas", masa: 480, x: 6, z: 8 },
  { nombre: "Motor, eje, bater\xEDas, dep\xF3sitos vac\xEDos", masa: 520, x: 3.2, z: 0.55 },
  { nombre: "Equipo est\xE1ndar (fondeo, seguridad)", masa: 300, x: 7, z: 1.6 },
  { nombre: "Tim\xF3n y gobierno", masa: 120, x: 1.2, z: 0.8 }
];
var TRIPULACION_MINIMA = { nombre: "Tripulaci\xF3n m\xEDnima (2 \xD7 75 kg)", masa: 150, x: 1.8, z: 2.3 };
var PERTRECHOS = { nombre: "Pertrechos no comestibles", masa: 180, x: 5, z: 1.2 };
function cargaMaxima() {
  return [
    // El resto de la tripulación, a la altura de la regala en el centro de L_H (3.5.5).
    { nombre: "Resto de la tripulaci\xF3n (6 \xD7 75 kg)", masa: 450, x: 4.98, z: 1.99 },
    { nombre: "Efectos personales (8 \xD7 20 kg)", masa: 160, x: 5, z: 1.3 },
    { nombre: "Gas\xF3leo, 160 L al 95 %", masa: 0.95 * 160 * 0.84, x: 3, z: 0.5 },
    { nombre: "Agua, 300 L al 95 %", masa: 0.95 * 300, x: 5.5, z: 0.4 },
    { nombre: "Provisiones", masa: 100, x: 5.5, z: 1 },
    { nombre: "Balsa salvavidas", masa: 45, x: 1.5, z: 2.1 }
  ];
}
function cargaLlegada() {
  return cargaMaxima().map((p) => {
    if (p.nombre.startsWith("Gas\xF3leo")) return { ...p, nombre: "Gas\xF3leo al 10 %", masa: 0.1 * 160 * 0.84 };
    if (p.nombre.startsWith("Agua")) return { ...p, nombre: "Agua al 10 %", masa: 0.1 * 300 };
    if (p.nombre === "Provisiones") return { ...p, nombre: "Provisiones al 10 %", masa: 10 };
    return p;
  });
}
var TANQUES = [
  { nombre: "Agua, 300 L", contenido: "agua", densidad: 1e3, eslora: 1.2, manga: 1.4 },
  { nombre: "Gas\xF3leo, 160 L", contenido: "combustible", densidad: 840, eslora: 0.8, manga: 0.6 }
];
function condicionesReferencia(FM, TC, BH = 3.674) {
  const mo = [...ROSCA, TRIPULACION_MINIMA, PERTRECHOS];
  const la = conMargenVCG(sumarPartidas([...mo, ...cargaLlegada()]), FM, TC);
  const sl = subidaSuperficieLibre(TANQUES, "llegada cargada", la.masa, BH);
  return {
    minimaOperacion: conMargenVCG(sumarPartidas(mo), FM, TC),
    llegadaCargada: { masa: la.masa, g: [la.g[0], la.g[1], la.g[2] + sl.subida] },
    cargaMaxima: conMargenVCG(sumarPartidas([...mo, ...cargaMaxima()]), FM, TC),
    superficieLibre: sl
  };
}
var APAREJO = { AS: 80, hCE: 7.3, hLP: 0.9 };
var ABERTURAS = [
  { nombre: "Tambucho de la entrada (> 0,18 m\xB2)", tipo: "DH", x: 4, y: 0.35, z: 2.14 },
  { nombre: "Manguerotes de ventilaci\xF3n", tipo: "DA", x: 8.5, y: 0.9, z: 2.3 }
];
function entradaReferencia() {
  const rosca = sumarPartidas(ROSCA);
  return {
    formas: formasReferencia(),
    rosca: { masa: rosca.masa, x: rosca.g[0], z: rosca.g[2], deExperiencia: false },
    personasMax: 8,
    puestoGobierno: { x: TRIPULACION_MINIMA.x, z: TRIPULACION_MINIMA.z },
    pertrechos: [PERTRECHOS],
    carga: [
      { nombre: "Efectos personales (8 \xD7 20 kg)", masa: 160, x: 5, z: 1.3 },
      { nombre: "Provisiones", masa: 100, x: 5.5, z: 1, viveres: true },
      { nombre: "Balsa salvavidas", masa: 45, x: 1.5, z: 2.1 }
    ],
    tanques: [
      { ...TANQUES[0], capacidad: 0.3, x: 5.5, z: 0.4 },
      { ...TANQUES[1], capacidad: 0.16, x: 3, z: 0.5 }
    ],
    aparejo: APAREJO,
    aberturas: [
      { ...ABERTURAS[0], tipo: "DH", areaMm2: 0.6 * 0.5 * 1e6 },
      { ...ABERTURAS[1], tipo: "DA", areaMm2: 2 * 8e3 }
    ]
  };
}
function evaluarReferencia(paso = 5) {
  return evaluarBarco(entradaReferencia(), paso);
}

// src/vista/formas.ts
var num5 = (v, d = 2) => v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
function dimensiones2(f) {
  const xs = f.secciones.map((s) => s.x);
  const ys = f.secciones.flatMap((s) => s.puntos.map(([y]) => y));
  const zs = f.secciones.flatMap((s) => s.puntos.map(([, z]) => z));
  return { eslora: Math.max(...xs) - Math.min(...xs), manga: 2 * Math.max(...ys), puntal: Math.max(...zs) - Math.min(...zs) };
}
function cajaDeCuadernas(f) {
  const W = 360, H = 220, m2 = 10;
  const { manga, puntal } = dimensiones2(f);
  const zMin = Math.min(...f.secciones.flatMap((s) => s.puntos.map(([, z]) => z)));
  const k = Math.min((W - 2 * m2) / manga, (H - 2 * m2) / puntal);
  const X = (y) => W / 2 + y * k, Y = (z) => H - m2 - (z - zMin) * k;
  const xs = f.secciones.map((s) => s.x);
  const medio = (Math.min(...xs) + Math.max(...xs)) / 2;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "caja-cuadernas");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Caja de cuadernas");
  const eje = document.createElementNS(ns, "line");
  Object.entries({ x1: W / 2, x2: W / 2, y1: m2, y2: H - m2, stroke: "currentColor", "stroke-opacity": 0.35, "stroke-dasharray": "4 3" }).forEach(([a, v]) => eje.setAttribute(a, String(v)));
  svg.append(eje);
  const paso = Math.max(1, Math.floor(f.secciones.length / 16));
  f.secciones.forEach((s, i) => {
    if (i % paso !== 0 || s.puntos.length < 2) return;
    const lado = s.x >= medio ? 1 : -1;
    const d = s.puntos.map(([y, z], j) => `${j === 0 ? "M" : "L"}${X(lado * y).toFixed(1)},${Y(z).toFixed(1)}`).join(" ");
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", lado > 0 ? "#1f6feb" : "#d97706");
    p.setAttribute("stroke-width", "1.5");
    svg.append(p);
  });
  return svg;
}
function camposAleta(a, cambiar, quitar) {
  const campo2 = (etiqueta, clave, paso = "0.01") => h(
    "label",
    { class: "campo" },
    h("span", { class: "campo-etiqueta" }, etiqueta),
    h("input", {
      type: "number",
      step: paso,
      inputmode: "decimal",
      valor: String(a[clave]),
      onchange: (ev) => cambiar({ ...a, [clave]: Number(ev.target.value.replace(",", ".")) })
    })
  );
  return h(
    "div",
    { class: "aleta" },
    h("h3", {}, a.nombre),
    campo2("Borde de ataque de la ra\xEDz, x (m)", "xBordeAtaqueRaiz"),
    campo2("Altura de la ra\xEDz, z (m)", "zRaiz"),
    campo2("Cuerda en la ra\xEDz (m)", "cuerdaRaiz"),
    campo2("Cuerda en la punta (m)", "cuerdaPunta"),
    campo2("Envergadura (m)", "envergadura"),
    campo2("Flecha del 25 % de la cuerda (\xB0)", "flecha", "0.5"),
    campo2("Espesor relativo t/c", "espesorRaiz", "0.01"),
    h("button", { class: "sutil", onclick: quitar }, `Quitar ${a.nombre}`)
  );
}
function panelFormas(formas, apendices, acciones) {
  let escala2 = 1;
  const d = formas ? dimensiones2(formas) : void 0;
  const nueva = (nombre) => ({
    nombre,
    xBordeAtaqueRaiz: d ? d.eslora / 2 : 5,
    zRaiz: 0,
    cuerdaRaiz: 2,
    cuerdaPunta: 1.4,
    envergadura: 1.4,
    flecha: 30,
    espesorRaiz: 0.12,
    espesorPunta: 0.12
  });
  return h(
    "div",
    { class: "tarjeta", id: "panel-formas" },
    h("h2", {}, "Formas del casco"),
    h(
      "p",
      { class: "sutil" },
      "Para calcular la estabilidad de este barco y hacerle la experiencia de estabilidad. Un fichero IGES del plano de formas, o una tabla de semimangas medida a mano (una l\xEDnea por punto: x; semimanga; altura, en metros, de la quilla a la regala). Ejes: x hacia proa, z hacia arriba."
    ),
    formas && d ? h(
      "div",
      {},
      h("p", {}, h("strong", {}, `${formas.nombre}`), ` \xB7 ${formas.fuente}`),
      h("p", { class: "sutil" }, `Eslora ${num5(d.eslora)} m \xB7 manga ${num5(d.manga)} m \xB7 puntal ${num5(d.puntal)} m \xB7 ${formas.secciones.length} secciones`),
      cajaDeCuadernas(formas),
      h("button", { onclick: acciones.alEvaluar }, "Evaluar este barco (UNE-EN ISO 12217-2)"),
      h("button", { class: "sutil", onclick: acciones.alQuitar }, "Quitar las formas")
    ) : h(
      "div",
      {},
      h(
        "label",
        { class: "campo" },
        h("span", { class: "campo-etiqueta" }, "Factor de escala (1 si el fichero ya est\xE1 en el tama\xF1o real)"),
        h("input", { type: "number", step: "0.01", valor: "1", onchange: (ev) => escala2 = Number(ev.target.value.replace(",", ".")) || 1 })
      ),
      h("input", {
        type: "file",
        accept: ".igs,.iges,.csv,.txt",
        onchange: (ev) => {
          const f = ev.target.files?.[0];
          if (f) acciones.alCargar(f, escala2);
        }
      }),
      h("p", { class: "sutil" }, "\xBFSin formas a mano? Prueba con un barco real cuyos c\xE1lculos est\xE1n publicados:"),
      h("button", { class: "sutil", onclick: acciones.alCargarEjemplo }, "Cargar el Corbin 39 de ejemplo")
    ),
    formas && h(
      "div",
      {},
      formas.cuerpos?.length ? h("p", { class: "sutil" }, `Ap\xE9ndices que vienen con las formas: ${formas.cuerpos.map((c) => c.nombre).join(", ")}.`) : null,
      h("h3", {}, "Quilla y tim\xF3n"),
      h("p", { class: "sutil" }, "Como aletas de perfil NACA: en un velero son el 6-7 % del desplazamiento, y sin ellos el desplazamiento que sale de los francobordos no es el bueno."),
      ...apendices.map((a, i) => camposAleta(a, (nuevaA) => {
        const lista3 = [...apendices];
        lista3[i] = { ...nuevaA, espesorPunta: nuevaA.espesorRaiz };
        acciones.alCambiarApendices(lista3);
      }, () => acciones.alCambiarApendices(apendices.filter((_, k) => k !== i)))),
      !apendices.some((a) => a.nombre === "quilla") && h("button", { class: "sutil", onclick: () => acciones.alCambiarApendices([...apendices, nueva("quilla")]) }, "A\xF1adir quilla"),
      !apendices.some((a) => a.nombre === "tim\xF3n") && h("button", { class: "sutil", onclick: () => acciones.alCambiarApendices([...apendices, { ...nueva("tim\xF3n"), xBordeAtaqueRaiz: 0.8, cuerdaRaiz: 0.8, cuerdaPunta: 0.6, envergadura: 1.5, flecha: 5 }]) }, "A\xF1adir tim\xF3n")
    )
  );
}

// src/vista/evaluar.ts
function datosEvaluacionIniciales(eslora) {
  const medio = eslora / 2;
  return {
    origenRosca: "experiencia",
    rosca: { masa: 0, x: medio, z: 0.8 },
    aBordoEnLaPrueba: [{ nombre: "Personas a bordo durante la prueba", masa: 150, x: medio, z: 1.5 }],
    personasMax: 6,
    puestoGobierno: { x: eslora * 0.15, z: 1.6 },
    pertrechos: [{ nombre: "Pertrechos no comestibles", masa: 100, x: medio, z: 1 }],
    carga: [
      { nombre: "Efectos personales", masa: 120, x: medio, z: 1.2 },
      { nombre: "V\xEDveres", masa: 60, x: medio, z: 0.9, viveres: true }
    ],
    tanques: [{ nombre: "Agua", contenido: "agua", capacidadL: 200, x: medio, z: 0.4, eslora: 1, manga: 0.8 }],
    aparejo: { AS: 50, hCE: 6, hLP: 0.8 },
    aberturas: [{ nombre: "Tambucho de la entrada", tipo: "DH", x: medio - 1, y: 0.3, z: 1.8, areaCm2: 3e3 }]
  };
}
function datosEvaluacionCorbin39() {
  const puesto = { x: 1.2, z: 1.3 };
  const tripMin = 150;
  return {
    origenRosca: "calculo",
    rosca: {
      masa: 14e3 - tripMin,
      x: Number(((14e3 * 4.505 - tripMin * puesto.x) / (14e3 - tripMin)).toFixed(3)),
      z: Number(((14e3 * 0.038 - tripMin * puesto.z) / (14e3 - tripMin)).toFixed(3))
    },
    aBordoEnLaPrueba: [],
    personasMax: 6,
    puestoGobierno: puesto,
    pertrechos: [],
    carga: [
      { nombre: "Efectos personales y pertrechos de crucero", masa: 450, x: 4.5, z: 0 },
      { nombre: "V\xEDveres", masa: 100, x: 4.5, z: -0.2, viveres: true },
      { nombre: "Agua y gasoil (sin tanques publicados)", masa: 150, x: 4.5, z: -0.73 }
    ],
    tanques: [],
    aparejo: { AS: 71.1, hCE: 6.52, hLP: 0.7 },
    aberturas: [{ nombre: "Tambucho de la entrada (esquina alta)", tipo: "DH", x: 3.2, y: 0.35, z: 2, areaCm2: 3600 }]
  };
}
function lista(filas, campos, nueva, cambiar) {
  const celda = (fila, i, c) => {
    const valor2 = fila[c.clave];
    const poner = (v) => {
      const copia = filas.map((f) => ({ ...f }));
      copia[i][c.clave] = v;
      cambiar(copia);
    };
    if (c.tipo === "si-no") return h("input", { type: "checkbox", checked: Boolean(valor2), onchange: (ev) => poner(ev.target.checked) });
    if (c.tipo === "opciones") return h("select", { onchange: (ev) => poner(ev.target.value) }, ...(c.opciones ?? []).map((o) => h("option", { value: o, selected: o === valor2 }, o)));
    if (c.tipo === "texto") return h("input", { type: "text", valor: String(valor2 ?? ""), style: "width:11em", onchange: (ev) => poner(ev.target.value) });
    return h("input", { type: "number", step: c.paso ?? "0.01", inputmode: "decimal", style: "width:5.5em", valor: String(valor2 ?? ""), onchange: (ev) => poner(Number(ev.target.value.replace(",", "."))) });
  };
  return h(
    "div",
    {},
    h(
      "table",
      { class: "tabla-estabilidad" },
      h("thead", {}, h("tr", {}, ...campos.map((c) => h("th", {}, c.etiqueta)), h("th", {}, ""))),
      h("tbody", {}, ...filas.map((f, i) => h(
        "tr",
        {},
        ...campos.map((c) => h("td", {}, celda(f, i, c))),
        h("td", {}, h("button", { class: "sutil", onclick: () => cambiar(filas.filter((_, k) => k !== i)) }, "Quitar"))
      )))
    ),
    h("button", { class: "sutil", onclick: () => cambiar([...filas, nueva()]) }, "A\xF1adir")
  );
}
var PARTIDA = [
  { clave: "nombre", etiqueta: "Partida", tipo: "texto" },
  { clave: "masa", etiqueta: "Masa (kg)", paso: "1" },
  { clave: "x", etiqueta: "x (m)" },
  { clave: "z", etiqueta: "z (m)" }
];
function pintarDatosEvaluacion(d, experiencia, acciones) {
  const c = acciones.cambiar;
  const numero = (valor2, poner, paso = "0.01") => h("input", { type: "number", step: paso, inputmode: "decimal", style: "width:6em", valor: String(valor2), onchange: (ev) => poner(Number(ev.target.value.replace(",", "."))) });
  const campo2 = (etiqueta, control) => h("label", { class: "campo" }, h("span", { class: "campo-etiqueta" }, etiqueta), control);
  return h(
    "div",
    { class: "estabilidad" },
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Barco en rosca"),
      h(
        "label",
        { class: "casilla-linea" },
        h("input", { type: "radio", name: "origen", checked: d.origenRosca === "experiencia", onchange: () => c((x) => {
          x.origenRosca = "experiencia";
        }) }),
        " De la experiencia de estabilidad guardada (UNE-EN ISO 12217-2, C.2.3 a)"
      ),
      h(
        "label",
        { class: "casilla-linea" },
        h("input", { type: "radio", name: "origen", checked: d.origenRosca === "calculo", onchange: () => c((x) => {
          x.origenRosca = "calculo";
        }) }),
        " De un c\xE1lculo de pesos (C.2.3 c: preliminar si GM < 1,5 m)"
      ),
      d.origenRosca === "experiencia" ? h(
        "div",
        {},
        experiencia === void 0 ? h("p", { class: "salvedad" }, "\u26A0 No hay experiencia calculada en este expediente: hazla primero en \xABExperiencia de estabilidad\xBB.") : h(
          "p",
          { class: experiencia.valida ? "sutil" : "salvedad" },
          `${experiencia.valida ? "" : "\u26A0 La experiencia guardada no es v\xE1lida seg\xFAn el C\xF3digo. "}Barco durante la prueba: ${experiencia.masa.toFixed(0)} kg, KG ${experiencia.kg.toFixed(3)} m, LCG ${experiencia.lcg.toFixed(2)} m. Se le quitan los pesos de prueba y lo que se anota aqu\xED:`
        ),
        lista(d.aBordoEnLaPrueba, PARTIDA, () => ({ nombre: "", masa: 0, x: 0, z: 0 }), (f) => c((x) => {
          x.aBordoEnLaPrueba = f;
        }))
      ) : h(
        "div",
        {},
        campo2("Masa en rosca (kg)", numero(d.rosca.masa, (v) => c((x) => {
          x.rosca.masa = v;
        }), "1")),
        campo2("LCG (m)", numero(d.rosca.x, (v) => c((x) => {
          x.rosca.x = v;
        }))),
        campo2("VCG (m)", numero(d.rosca.z, (v) => c((x) => {
          x.rosca.z = v;
        })))
      )
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Tripulaci\xF3n y carga"),
      campo2("L\xEDmite de tripulaci\xF3n (personas)", numero(d.personasMax, (v) => c((x) => {
        x.personasMax = Math.round(v);
      }), "1")),
      campo2("Puesto de gobierno, x (m)", numero(d.puestoGobierno.x, (v) => c((x) => {
        x.puestoGobierno.x = v;
      }))),
      campo2("Puesto de gobierno, z (m)", numero(d.puestoGobierno.z, (v) => c((x) => {
        x.puestoGobierno.z = v;
      }))),
      h("h3", {}, "Pertrechos (m\xEDnima operaci\xF3n, 3.5.3)"),
      lista(d.pertrechos, PARTIDA, () => ({ nombre: "", masa: 0, x: 0, z: 0 }), (f) => c((x) => {
        x.pertrechos = f;
      })),
      h("h3", {}, "Carga m\xE1xima adem\xE1s de tripulaci\xF3n y tanques (3.5.4)"),
      lista(d.carga, [...PARTIDA, { clave: "viveres", etiqueta: "V\xEDveres", tipo: "si-no" }], () => ({ nombre: "", masa: 0, x: 0, z: 0 }), (f) => c((x) => {
        x.carga = f;
      })),
      h("h3", {}, "Tanques"),
      lista(d.tanques, [
        { clave: "nombre", etiqueta: "Tanque", tipo: "texto" },
        { clave: "contenido", etiqueta: "Contenido", tipo: "opciones", opciones: ["combustible", "agua", "negras-grises", "aceite", "vivero"] },
        { clave: "capacidadL", etiqueta: "Capacidad (L)", paso: "1" },
        { clave: "x", etiqueta: "x (m)" },
        { clave: "z", etiqueta: "z (m)" },
        { clave: "eslora", etiqueta: "Eslora (m)" },
        { clave: "manga", etiqueta: "Manga (m)" }
      ], () => ({ nombre: "", contenido: "agua", capacidadL: 100, x: 0, z: 0, eslora: 1, manga: 0.6 }), (f) => c((x) => {
        x.tanques = f;
      }))
    ),
    h(
      "div",
      { class: "tarjeta" },
      h("h2", {}, "Aparejo y aberturas"),
      campo2("Superficie v\xE9lica de referencia A_S (m\xB2)", numero(d.aparejo.AS, (v) => c((x) => {
        x.aparejo.AS = v;
      }), "0.5")),
      campo2("Altura del centro v\xE9lico sobre la flotaci\xF3n h_CE (m)", numero(d.aparejo.hCE, (v) => c((x) => {
        x.aparejo.hCE = v;
      }))),
      campo2("Profundidad del centro del plano de deriva bajo la flotaci\xF3n h_LP (m)", numero(d.aparejo.hLP, (v) => c((x) => {
        x.aparejo.hLP = v;
      }))),
      h("p", { class: "sutil" }, "DH: acceso principal (> 0,18 m\xB2) a la ba\xF1era; DA: otras aberturas sin r\xF3tulo de mantener cerrado; DC: ba\xF1era que no achica r\xE1pido (3.3.2). y: distancia a cruj\xEDa por la banda que se sumerge."),
      lista(d.aberturas, [
        { clave: "nombre", etiqueta: "Abertura", tipo: "texto" },
        { clave: "tipo", etiqueta: "Tipo", tipo: "opciones", opciones: ["DH", "DA", "DC"] },
        { clave: "x", etiqueta: "x (m)" },
        { clave: "y", etiqueta: "y (m)" },
        { clave: "z", etiqueta: "z (m)" },
        { clave: "areaCm2", etiqueta: "\xC1rea (cm\xB2)", paso: "10" }
      ], () => ({ nombre: "", tipo: "DA", x: 0, y: 0.5, z: 1.5, areaCm2: 100 }), (f) => c((x) => {
        x.aberturas = f;
      })),
      h("button", { onclick: acciones.calcular }, "Calcular la categor\xEDa de dise\xF1o")
    )
  );
}

// ../itb-estabilidad/datos/corbin39.json
var corbin39_default = {
  nombre: "Corbin 39",
  fuente: "corbin39.org, \xABC9 V0 : Data for transfer to a 3D modeller\xBB (C9-V0_Offsets.ods, 2020). Ejes: x hacia proa desde C0, z desde la flotaci\xF3n de proyecto H0, en metros.",
  secciones: [
    {
      x: -0.3,
      puntos: [
        [
          0,
          0.17928521326163602
        ],
        [
          0.009884037683107189,
          0.184907664627057
        ],
        [
          0.032859876435329595,
          0.196152567357899
        ],
        [
          0.0692513989110419,
          0.21301992145416102
        ],
        [
          0.118425295153299,
          0.235509726915844
        ],
        [
          0.17893068696956,
          0.263621983742948
        ],
        [
          0.248664209866018,
          0.297356691935473
        ],
        [
          0.325033146883056,
          0.33671385149341804
        ],
        [
          0.405127852634716,
          0.381693462416785
        ],
        [
          0.485902120505534,
          0.43229552470557203
        ],
        [
          0.564355188224847,
          0.488520038359779
        ],
        [
          0.637707693746256,
          0.550367003379408
        ],
        [
          0.703564719655814,
          0.617836419764457
        ],
        [
          0.760061036453921,
          0.6909282875149271
        ],
        [
          0.805985233359261,
          0.7696426066308181
        ],
        [
          0.84087886136121,
          0.85397937711213
        ],
        [
          0.8651028812998599,
          0.9439385989588619
        ],
        [
          0.879856460350016,
          1.03952027217102
        ],
        [
          0.8871219375451279,
          1.14072439674859
        ],
        [
          0.889488690554024,
          1.24755097269158
        ],
        [
          0.889742303599141,
          1.36
        ]
      ]
    },
    {
      x: 0,
      puntos: [
        [
          0,
          0
        ],
        [
          0.0131315380204632,
          0.00640210909244141
        ],
        [
          0.0430498265525621,
          0.0192063272773243
        ],
        [
          0.0897716171782386,
          0.0384126545546486
        ],
        [
          0.152062385383101,
          0.0640210909244144
        ],
        [
          0.227652239631979,
          0.0960316363866216
        ],
        [
          0.313500653707781,
          0.13444429094127
        ],
        [
          0.406064059692442,
          0.17925905458836
        ],
        [
          0.50156859674742,
          0.23047592732789202
        ],
        [
          0.596274770114086,
          0.288094909159865
        ],
        [
          0.686715984458659,
          0.352116000084279
        ],
        [
          0.769894686117387,
          0.422539200101135
        ],
        [
          0.8434268265026,
          0.499364509210432
        ],
        [
          0.9056356506857649,
          0.582591927412171
        ],
        [
          0.955605604049764,
          0.672221454706351
        ],
        [
          0.993211317285005,
          0.7682530910929729
        ],
        [
          1.0191312649170299,
          0.8706868365720359
        ],
        [
          1.03484054443211,
          0.97952269114354
        ],
        [
          1.04255483610777,
          1.09476065480749
        ],
        [
          1.04506625716518,
          1.21640072756387
        ],
        [
          1.04533740112756,
          1.3444429094127
        ]
      ]
    },
    {
      x: 0.97155,
      puntos: [
        [
          0,
          -0.403077855057412
        ],
        [
          0.025018571068333002,
          -0.394953278999771
        ],
        [
          0.0789961886419177,
          -0.378704126884488
        ],
        [
          0.160172382750816,
          -0.354330398711563
        ],
        [
          0.26461472644419,
          -0.32183209448099703
        ],
        [
          0.38675963799261703,
          -0.28120921419279
        ],
        [
          0.520083730250247,
          -0.23246175784694098
        ],
        [
          0.6577820919318159,
          -0.175589725443451
        ],
        [
          0.793406011682165,
          -0.110593116982319
        ],
        [
          0.921396742909419,
          -0.0374719324635458
        ],
        [
          1.0374572771228001,
          0.0437738281128689
        ],
        [
          1.13872540410456,
          0.133144164746925
        ],
        [
          1.22374551205237,
          0.230639077438623
        ],
        [
          1.29227761632295,
          0.336258566187962
        ],
        [
          1.3450184999338899,
          0.450002630994943
        ],
        [
          1.38332619522846,
          0.571871271859565
        ],
        [
          1.40902316719346,
          0.701864488781828
        ],
        [
          1.4243057788796099,
          0.839982281761733
        ],
        [
          1.43172294189485,
          0.98622465079928
        ],
        [
          1.43412243698718,
          1.1405915958944701
        ],
        [
          1.43438052202271,
          1.3030831170472998
        ]
      ]
    },
    {
      x: 1.9431,
      puntos: [
        [
          0,
          -0.617431297189419
        ],
        [
          0.0365474241779808,
          -0.608417291383103
        ],
        [
          0.11232660691525301,
          -0.5903892797704701
        ],
        [
          0.223386522689046,
          -0.563347262351521
        ],
        [
          0.362961777978962,
          -0.527291239126255
        ],
        [
          0.5223193334045679,
          -0.482221210094673
        ],
        [
          0.691791808967767,
          -0.42813717525677497
        ],
        [
          0.8618125186769809,
          -0.36503913461256
        ],
        [
          1.02385386208716,
          -0.292927088162029
        ],
        [
          1.171162865123,
          -0.211801035905181
        ],
        [
          1.29920664267373,
          -0.121660977842017
        ],
        [
          1.4057800168152599,
          -0.0225069139725364
        ],
        [
          1.490782684939,
          0.0856611557032606
        ],
        [
          1.55573622576604,
          0.202843231185374
        ],
        [
          1.60316772068509,
          0.32903931247380397
        ],
        [
          1.63601682264506,
          0.46424939956855
        ],
        [
          1.6572073916324102,
          0.608473492469612
        ],
        [
          1.66945725930555,
          0.761711591176992
        ],
        [
          1.67529735130306,
          0.9239636956906869
        ],
        [
          1.6771679163898099,
          1.0952298060107
        ],
        [
          1.6773669465756,
          1.27550992213703
        ]
      ]
    },
    {
      x: 2.91465,
      puntos: [
        [
          0,
          -0.7185398825957501
        ],
        [
          0.044387686949384504,
          -0.7091100577991899
        ],
        [
          0.133991895595387,
          -0.6902504082060701
        ],
        [
          0.263372872934045,
          -0.661960933816389
        ],
        [
          0.42407985970148,
          -0.624241634630148
        ],
        [
          0.6056045602623921,
          -0.577092510647347
        ],
        [
          0.796537656807092,
          -0.520513561867986
        ],
        [
          0.985741085014235,
          -0.45450478829206503
        ],
        [
          1.16342024494705,
          -0.37906618991958296
        ],
        [
          1.3219754332681402,
          -0.294197766750541
        ],
        [
          1.45653097919545,
          -0.199899518784939
        ],
        [
          1.5650791206388601,
          -0.09617144602277711
        ],
        [
          1.6482302037907999,
          0.016986451535945298
        ],
        [
          1.70862612515427,
          0.139574173891228
        ],
        [
          1.75014036642864,
          0.271591721043071
        ],
        [
          1.77703930285514,
          0.413039092991474
        ],
        [
          1.7932939911767598,
          0.5639162897364369
        ],
        [
          1.8021895292093602,
          0.72422331127796
        ],
        [
          1.80627579980201,
          0.8939601576160441
        ],
        [
          1.80756034163274,
          1.07312682875069
        ],
        [
          1.80769598102665,
          1.26172332468189
        ]
      ]
    },
    {
      x: 3.8862,
      puntos: [
        [
          0,
          -0.7548008517504899
        ],
        [
          0.046538112294071794,
          -0.745200495062192
        ],
        [
          0.138996652357281,
          -0.725999781685597
        ],
        [
          0.271758801255674,
          -0.697198711620705
        ],
        [
          0.436447344332785,
          -0.658797284867516
        ],
        [
          0.622736514788917,
          -0.610795501426029
        ],
        [
          0.819346948041061,
          -0.5531933612962451
        ],
        [
          1.01508825319349,
          -0.485990864478163
        ],
        [
          1.19985708848874,
          -0.40918801097178403
        ],
        [
          1.36549030577189,
          -0.322784800777108
        ],
        [
          1.50637945157741,
          -0.22678123389413402
        ],
        [
          1.61977270634858,
          -0.12117731032286301
        ],
        [
          1.70572268345516,
          -0.005973030063295019
        ],
        [
          1.76668274024262,
          0.11883160688457099
        ],
        [
          1.80680847404897,
          0.253236600520734
        ],
        [
          1.83107948638815,
          0.39724195084519404
        ],
        [
          1.8444081359376698,
          0.550847657857952
        ],
        [
          1.8509282232236899,
          0.7140537215590069
        ],
        [
          1.85363291770917,
          0.88686014194836
        ],
        [
          1.8544336226684701,
          1.06926691902601
        ],
        [
          1.85451703611335,
          1.26127405279196
        ]
      ]
    },
    {
      x: 4.857749999999999,
      puntos: [
        [
          0,
          -0.7575642097879439
        ],
        [
          0.0429868948639465,
          -0.7479021589073941
        ],
        [
          0.127758900785844,
          -0.728578057146293
        ],
        [
          0.249703447260862,
          -0.699591904504642
        ],
        [
          0.402033497538821,
          -0.660943700982441
        ],
        [
          0.576311398246969,
          -0.61263344657969
        ],
        [
          0.763106107716187,
          -0.554661141296388
        ],
        [
          0.952715108034874,
          -0.487026785132536
        ],
        [
          1.13590290600425,
          -0.409730378088134
        ],
        [
          1.3045989802728102,
          -0.32277192016318096
        ],
        [
          1.4524946676292,
          -0.226151411357678
        ],
        [
          1.5754800411645702,
          -0.119868851671625
        ],
        [
          1.67186866287782,
          -0.00392424110502215
        ],
        [
          1.7423710938004502,
          0.12168242034213099
        ],
        [
          1.78979850541547,
          0.256951132669835
        ],
        [
          1.81850720748424,
          0.40188189587809
        ],
        [
          1.83363478866685,
          0.556474709966894
        ],
        [
          1.84022914103507,
          0.720729574936249
        ],
        [
          1.84243066983565,
          0.894646490786154
        ],
        [
          1.8429299046895,
          1.07822545751661
        ],
        [
          1.8429738842846002,
          1.2714664751276101
        ]
      ]
    },
    {
      x: 5.8293,
      puntos: [
        [
          0,
          -0.7443593099729909
        ],
        [
          0.0353114108008239,
          -0.734663068878839
        ],
        [
          0.104849562658192,
          -0.715270586690535
        ],
        [
          0.205545786317348,
          -0.686181863408079
        ],
        [
          0.332883091924623,
          -0.6473968990314709
        ],
        [
          0.48114626859624204,
          -0.5989156935607111
        ],
        [
          0.6437450817582079,
          -0.540738246995799
        ],
        [
          0.813587593072672,
          -0.472864559336735
        ],
        [
          0.983489405727192,
          -0.395294630583519
        ],
        [
          1.1465998915362001,
          -0.308028460736151
        ],
        [
          1.29682281838092,
          -0.211066049794631
        ],
        [
          1.42920570116235,
          -0.10440739775895899
        ],
        [
          1.5402695034631901,
          0.0119474953708652
        ],
        [
          1.62824805923266,
          0.137998629594841
        ],
        [
          1.69320492397602,
          0.27374600491296897
        ],
        [
          1.73699461700423,
          0.41918962132524906
        ],
        [
          1.76303595224236,
          0.574329478831681
        ],
        [
          1.77586842563891,
          0.7391655774322651
        ],
        [
          1.78047052977341,
          0.9136979171270011
        ],
        [
          1.78133683107581,
          1.09792649791589
        ],
        [
          1.78136593344194,
          1.2918513197989299
        ]
      ]
    },
    {
      x: 6.8008500000000005,
      puntos: [
        [
          0,
          -0.716854210243413
        ],
        [
          0.025866332066583602,
          -0.707143339781274
        ],
        [
          0.0769148045456427,
          -0.6877215988569949
        ],
        [
          0.151491206398778,
          -0.6585889874705759
        ],
        [
          0.247145035982617,
          -0.619745505622017
        ],
        [
          0.360713108399509,
          -0.571191153311319
        ],
        [
          0.48843076799055196,
          -0.512925930538482
        ],
        [
          0.6260661411592711,
          -0.44494983730350496
        ],
        [
          0.769076295575637,
          -0.367262873606388
        ],
        [
          0.912783134993628,
          -0.279865039447132
        ],
        [
          1.05256603769794,
          -0.182756334825736
        ],
        [
          1.18406740064265,
          -0.07593675974220031
        ],
        [
          1.3034062473851902,
          0.040593685803474805
        ],
        [
          1.40739377036235,
          0.16683500181129
        ],
        [
          1.49374292693937,
          0.302787188281244
        ],
        [
          1.56126168343066,
          0.448450245213338
        ],
        [
          1.61001560352744,
          0.603824172607571
        ],
        [
          1.6414389204605002,
          0.768908970463944
        ],
        [
          1.65836082945367,
          0.943704638782457
        ],
        [
          1.66488578056758,
          1.12821117756311
        ],
        [
          1.66597997036439,
          1.3224285868058998
        ]
      ]
    },
    {
      x: 7.7724,
      puntos: [
        [
          0,
          -0.659509188041109
        ],
        [
          0.0168047396006843,
          -0.649877247735444
        ],
        [
          0.050094283958838,
          -0.6306133671241141
        ],
        [
          0.0991627409045058,
          -0.601717546207119
        ],
        [
          0.162956263718525,
          -0.563189784984459
        ],
        [
          0.240089651362543,
          -0.515030083456135
        ],
        [
          0.328868978060457,
          -0.457238441622145
        ],
        [
          0.427319776969234,
          -0.38981485948249
        ],
        [
          0.533221272621834,
          -0.312759337037171
        ],
        [
          0.644147136457351,
          -0.22607187428618603
        ],
        [
          0.757513318557076,
          -0.129752471229537
        ],
        [
          0.87063365338885,
          -0.0238011278672225
        ],
        [
          0.980784151617743,
          0.09178215580075691
        ],
        [
          1.08527720099606,
          0.216997379774401
        ],
        [
          1.18154736208999,
          0.35184454405371
        ],
        [
          1.26725116524149,
          0.49632364863868506
        ],
        [
          1.3403845096765301,
          0.650434693529324
        ],
        [
          1.39942341282012,
          0.8141776787256281
        ],
        [
          1.44349813718055,
          0.987552604227597
        ],
        [
          1.47262047025617,
          1.17055947003523
        ],
        [
          1.4880107684527801,
          1.3631982761485302
        ]
      ]
    },
    {
      x: 8.74395,
      puntos: [
        [
          0,
          -0.510374072488374
        ],
        [
          0.009721665599885571,
          -0.501209622677349
        ],
        [
          0.0290568568349046,
          -0.4828807230553
        ],
        [
          0.0577794691303845,
          -0.455387373622226
        ],
        [
          0.0955496157341882,
          -0.418729574378127
        ],
        [
          0.141914193395477,
          -0.37290732532300297
        ],
        [
          0.196307686126712,
          -0.31792062645685504
        ],
        [
          0.258053129689321,
          -0.253769477779682
        ],
        [
          0.326363292118087,
          -0.18045387929148402
        ],
        [
          0.400342118711753,
          -0.0979738309922617
        ],
        [
          0.478986496425317,
          -0.0063293328820146
        ],
        [
          0.561188407386312,
          0.0944796150392572
        ],
        [
          0.645737564131571,
          0.204453012771554
        ],
        [
          0.731324652578466,
          0.323590860314875
        ],
        [
          0.816545357679022,
          0.451893157669221
        ],
        [
          0.899905420187051,
          0.589359904834592
        ],
        [
          0.9798270883497869,
          0.7359911018109869
        ],
        [
          1.05465752245114,
          0.891786748598407
        ],
        [
          1.12268006981527,
          1.05674684519685
        ],
        [
          1.1821300776858,
          1.23087139160632
        ],
        [
          1.23121867292218,
          1.4141603878268199
        ]
      ]
    },
    {
      x: 9.229725,
      puntos: [
        [
          0,
          -0.338426580989589
        ],
        [
          0.00708487257634978,
          -0.32994138964182
        ],
        [
          0.021201768639543702,
          -0.312971006946283
        ],
        [
          0.042241998963948105,
          -0.287515432902977
        ],
        [
          0.07004173328935359,
          -0.253574667511902
        ],
        [
          0.10438142674186,
          -0.211148710773059
        ],
        [
          0.144985036232814,
          -0.160237562686447
        ],
        [
          0.19151897506461102,
          -0.100841223252066
        ],
        [
          0.243590779725863,
          -0.032959692469917
        ],
        [
          0.300747446083103,
          0.043407029660001
        ],
        [
          0.362473374214952,
          0.128258943137688
        ],
        [
          0.428187838079321,
          0.22159604796314303
        ],
        [
          0.49724186410851096,
          0.32341834413636694
        ],
        [
          0.568914356016484,
          0.43372583165736
        ],
        [
          0.642407232167278,
          0.552518510526121
        ],
        [
          0.7168392301957719,
          0.6797963807426509
        ],
        [
          0.79123785055241,
          0.8155594423069501
        ],
        [
          0.8645285969858201,
          0.9598076952190171
        ],
        [
          0.9355201063427969,
          1.11254113947885
        ],
        [
          1.00288267445487,
          1.27375977508646
        ],
        [
          1.06511541503617,
          1.4434636020418299
        ]
      ]
    },
    {
      x: 9.715499999999999,
      puntos: [
        [
          0,
          0
        ],
        [
          0.0049382432245436295,
          0.007025309151622639
        ],
        [
          0.014794358086750801,
          0.021075927454868002
        ],
        [
          0.0295269036435039,
          0.042151854909736004
        ],
        [
          0.0490732994370092,
          0.0702530915162266
        ],
        [
          0.07334938921455661,
          0.10537963727434001
        ],
        [
          0.102248840186002,
          0.147531492184076
        ],
        [
          0.135642353313039,
          0.196708656245435
        ],
        [
          0.173376659969595,
          0.252911129458416
        ],
        [
          0.215273270281215,
          0.31613891182302
        ],
        [
          0.261126926142376,
          0.386392003339246
        ],
        [
          0.310703695636829,
          0.46367040400709597
        ],
        [
          0.363738623205861,
          0.547974113826568
        ],
        [
          0.419932818220317,
          0.639303132797662
        ],
        [
          0.47894981849163004,
          0.73765746092038
        ],
        [
          0.5404109961762861,
          0.8430370981947201
        ],
        [
          0.603889666770154,
          0.9554420446206819
        ],
        [
          0.6689033910809791,
          1.0748723001982698
        ],
        [
          0.734903675900926,
          1.20132786492748
        ],
        [
          0.801261784462835,
          1.33480873880831
        ],
        [
          0.8672484563860521,
          1.47531492184076
        ]
      ]
    },
    {
      x: 10.1557666666667,
      puntos: [
        [
          0.0620220155815813,
          0.579808169704802
        ],
        [
          0.068050721379081,
          0.588674919936011
        ],
        [
          0.0770801824145689,
          0.601975045282825
        ],
        [
          0.0890968506226727,
          0.619708545745243
        ],
        [
          0.10408196035428499,
          0.641875421323266
        ],
        [
          0.12201163767373799,
          0.6684756720168941
        ],
        [
          0.142856776760218,
          0.699509297826126
        ],
        [
          0.166582829863464,
          0.7349762987509629
        ],
        [
          0.193149531304777,
          0.774876674791404
        ],
        [
          0.222510554784921,
          0.8192104259474501
        ],
        [
          0.25461309603621296,
          0.8679775522191009
        ],
        [
          0.289397368176997,
          0.921178053606356
        ],
        [
          0.326795992414506,
          0.9788119301092161
        ],
        [
          0.366733260952727,
          1.04087918172768
        ],
        [
          0.40912424125187696,
          1.10737980846175
        ],
        [
          0.45387368008927703,
          1.17831381031142
        ],
        [
          0.500874650588251,
          1.2536811872767
        ],
        [
          0.550006862954569,
          1.3334819393575799
        ],
        [
          0.6011345258335691,
          1.41771606655407
        ],
        [
          0.6541035922481739,
          1.50638356886616
        ]
      ]
    }
  ],
  nombresSecciones: [
    "Car2",
    "C0",
    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
    "C6",
    "C7",
    "C8",
    "C9",
    "C9,5",
    "C10",
    "Cav1"
  ],
  quilla: {
    cortes: [
      {
        z: -0.7741800000000001,
        puntos: [
          [
            2.5869999999999997,
            0.019948895898009057
          ],
          [
            2.70623076923077,
            0.039897791796018114
          ],
          [
            2.9446923076923097,
            0.07161374769547407
          ],
          [
            3.1831538461538504,
            0.10153343408809307
          ],
          [
            3.42161538461538,
            0.12975690276737312
          ],
          [
            3.6600769230769203,
            0.15632981486952402
          ],
          [
            3.89853846153846,
            0.1812412520538061
          ],
          [
            4.137,
            0.20442080907444804
          ],
          [
            4.37546153846154,
            0.22573465645825905
          ],
          [
            4.61392307692308,
            0.2449800888619911
          ],
          [
            4.8523846153846195,
            0.26187777989616107
          ],
          [
            5.09084615384615,
            0.27606044075053005
          ],
          [
            5.32930769230769,
            0.28705560326364904
          ],
          [
            5.567769230769231,
            0.29425831427535504
          ],
          [
            5.806230769230769,
            0.29688541109550604
          ],
          [
            6.04469230769231,
            0.2938934468750001
          ],
          [
            6.2831538461538505,
            0.2838171265836861
          ],
          [
            6.52161538461538,
            0.2644072589041301
          ],
          [
            6.7600769230769195,
            0.2316410436318251
          ],
          [
            6.87930769230769,
            0.20775522508369107
          ],
          [
            6.99853846153846,
            0.17583845176684307
          ],
          [
            7.11776923076923,
            0.1293414759518501
          ],
          [
            7.177384615384621,
            0.09368505184269907
          ],
          [
            7.2012307692307695,
            0.07345098470541003
          ],
          [
            7.21315384615385,
            0.060414369556633006
          ],
          [
            7.237,
            0
          ]
        ]
      },
      {
        z: -0.954624,
        puntos: [
          [
            2.6184267627992197,
            0.015331344859622079
          ],
          [
            2.72929855767101,
            0.030662689719244015
          ],
          [
            2.9510421474146,
            0.05503738493712106
          ],
          [
            3.17278573715819,
            0.07803159135948107
          ],
          [
            3.3945293269017798,
            0.09972220189096305
          ],
          [
            3.6162729166453698,
            0.12014430853011604
          ],
          [
            3.8380165063889597,
            0.13928952019364205
          ],
          [
            4.05976009613255,
            0.15710372826779506
          ],
          [
            4.281503685876141,
            0.17348408065407298
          ],
          [
            4.503247275619731,
            0.18827479201287103
          ],
          [
            4.724990865363321,
            0.20126119135550596
          ],
          [
            4.94673445510691,
            0.21216100584634703
          ],
          [
            5.1684780448505,
            0.22061112905808103
          ],
          [
            5.39022163459409,
            0.22614663573520402
          ],
          [
            5.61196522433768,
            0.22816564107440995
          ],
          [
            5.8337088140812705,
            0.22586622382812507
          ],
          [
            6.05545240382486,
            0.21812225934548096
          ],
          [
            6.2771959935684505,
            0.20320517438016097
          ],
          [
            6.49893958331204,
            0.17802332227904002
          ],
          [
            6.60981137818383,
            0.1596663303288061
          ],
          [
            6.7206831730556305,
            0.13513730070086497
          ],
          [
            6.831554967927421,
            0.09940293350612109
          ],
          [
            6.88699086536332,
            0.07199986632520108
          ],
          [
            6.909165224337681,
            0.05644935852865203
          ],
          [
            6.92025240382486,
            0.046430315686886985
          ],
          [
            6.9424267627992196,
            0
          ]
        ]
      },
      {
        z: -1.135068,
        puntos: [
          [
            2.6498535255984303,
            0.01304609398181995
          ],
          [
            2.75236634611125,
            0.026092187963640042
          ],
          [
            2.95739198713689,
            0.046833653732110035
          ],
          [
            3.16241762816254,
            0.06640040281838992
          ],
          [
            3.36744326918818,
            0.08485786666829
          ],
          [
            3.57246891021382,
            0.10223590655718993
          ],
          [
            3.77749455123946,
            0.11852738215512999
          ],
          [
            3.9825201922651003,
            0.13368625013932003
          ],
          [
            4.1875458332907405,
            0.14762498928082196
          ],
          [
            4.39257147431638,
            0.16021103520253505
          ],
          [
            4.59759711534202,
            0.17126171522184905
          ],
          [
            4.80262275636766,
            0.180536831366839
          ],
          [
            5.00764839739331,
            0.18772740092140894
          ],
          [
            5.21267403841895,
            0.19243779919422593
          ],
          [
            5.41769967944459,
            0.19415585678449404
          ],
          [
            5.62272532047023,
            0.19219918476562498
          ],
          [
            5.82775096149587,
            0.185609515734142
          ],
          [
            6.03277660252151,
            0.17291593313103604
          ],
          [
            6.23780224354715,
            0.15148762321070394
          ],
          [
            6.34031506405997,
            0.13586687732056701
          ],
          [
            6.44282788457279,
            0.11499408183269992
          ],
          [
            6.54534070508561,
            0.08458618760866997
          ],
          [
            6.5965971153420195,
            0.061267751221929956
          ],
          [
            6.61709967944459,
            0.04803516216752001
          ],
          [
            6.627350961495869,
            0.03950953211233994
          ],
          [
            6.64785352559843,
            0
          ]
        ]
      },
      {
        z: -1.315512,
        puntos: [
          [
            2.6812802883976503,
            0.011574123563469811
          ],
          [
            2.77543413455149,
            0.02314824712692996
          ],
          [
            2.9637418268591897,
            0.04154948569123988
          ],
          [
            3.15204951916688,
            0.058908549022809925
          ],
          [
            3.3403572114745703,
            0.07528348603955991
          ],
          [
            3.5286649037822597,
            0.09070078881580997
          ],
          [
            3.71697259608996,
            0.1051541226538599
          ],
          [
            3.90528028839765,
            0.11860263922716001
          ],
          [
            4.09358798070534,
            0.1309686921903999
          ],
          [
            4.28189567301303,
            0.1421346741982299
          ],
          [
            4.47020336532073,
            0.15193852324163998
          ],
          [
            4.65851105762842,
            0.16016714251091999
          ],
          [
            4.84681874993611,
            0.16654641132748993
          ],
          [
            5.0351264422438,
            0.17072534271635986
          ],
          [
            5.2234341345515,
            0.17224955455068994
          ],
          [
            5.41174182685919,
            0.1705136507812499
          ],
          [
            5.60004951916688,
            0.16466748381977994
          ],
          [
            5.78835721147457,
            0.15340609832645
          ],
          [
            5.97666490378227,
            0.13439551116375
          ],
          [
            6.07081874993611,
            0.12053722964760993
          ],
          [
            6.16497259608996,
            0.10201947909113997
          ],
          [
            6.2591264422438,
            0.07504246010413994
          ],
          [
            6.30620336532073,
            0.054355006493639876
          ],
          [
            6.3250341345515,
            0.0426154298054999
          ],
          [
            6.3344495191668795,
            0.03505173328050006
          ],
          [
            6.3532802883976505,
            0
          ]
        ]
      },
      {
        z: -1.4959559999999998,
        puntos: [
          [
            2.7127070511968703,
            0.010223137015119904
          ],
          [
            2.7985019229917403,
            0.020446274030239808
          ],
          [
            2.97009166658148,
            0.03669963283180976
          ],
          [
            3.14168141017123,
            0.05203246403234005
          ],
          [
            3.3132711537609705,
            0.06649604080497994
          ],
          [
            3.48486089735071,
            0.08011376294358001
          ],
          [
            3.6564506409404602,
            0.0928800351663898
          ],
          [
            3.8280403845302,
            0.10475877715709003
          ],
          [
            3.9996301281199402,
            0.11568140581975
          ],
          [
            4.17121987170969,
            0.12554404149564988
          ],
          [
            4.34280961529943,
            0.1342035388214498
          ],
          [
            4.51439935888917,
            0.1414716746568598
          ],
          [
            4.68598910247892,
            0.14710632498786994
          ],
          [
            4.85757884606866,
            0.15079747170242996
          ],
          [
            5.0291685896584,
            0.15214377030870993
          ],
          [
            5.2007583332481495,
            0.15061048945311994
          ],
          [
            5.3723480768378895,
            0.1454467148024898
          ],
          [
            5.54393782042764,
            0.13549981158799995
          ],
          [
            5.715527564017379,
            0.11870823024393985
          ],
          [
            5.80132243581225,
            0.10646755301626996
          ],
          [
            5.88711730760712,
            0.0901112820543699
          ],
          [
            5.97291217940199,
            0.06628314855887993
          ],
          [
            6.01580961529943,
            0.04801043256493984
          ],
          [
            6.0329685896584,
            0.03764115489788992
          ],
          [
            6.04154807683789,
            0.03096032887318984
          ],
          [
            6.058707051196871,
            0
          ]
        ]
      },
      {
        z: -1.6764,
        puntos: [
          [
            2.74413381399608,
            0.009107396880659735
          ],
          [
            2.82156971143198,
            0.018214793761319754
          ],
          [
            2.97644150630377,
            0.03269428171406986
          ],
          [
            3.1313133011755703,
            0.04635370727403995
          ],
          [
            3.28618509604736,
            0.059238747725669894
          ],
          [
            3.4410568909191603,
            0.07137024903914976
          ],
          [
            3.59592868579095,
            0.08274322659464986
          ],
          [
            3.7508004806627504,
            0.09332553783553976
          ],
          [
            3.90567227553454,
            0.10305608473750993
          ],
          [
            4.06054407040634,
            0.11184232493530999
          ],
          [
            4.21541586527813,
            0.11955673576795987
          ],
          [
            4.37028766014993,
            0.12603163652862975
          ],
          [
            4.525159455021719,
            0.13105132830937977
          ],
          [
            4.68003124989352,
            0.13433962797948
          ],
          [
            4.834903044765309,
            0.13553899327304975
          ],
          [
            4.98977483963711,
            0.13417305273436994
          ],
          [
            5.1446466345089,
            0.1295728458628298
          ],
          [
            5.2995184293807,
            0.12071153497812986
          ],
          [
            5.45439022425249,
            0.10575256540468984
          ],
          [
            5.53182612168839,
            0.09484782007694975
          ],
          [
            5.60926201912429,
            0.08027665166578998
          ],
          [
            5.68669791656019,
            0.05904909026776977
          ],
          [
            5.72541586527813,
            0.04277063519098988
          ],
          [
            5.740903044765309,
            0.033533047262749846
          ],
          [
            5.7486466345089005,
            0.02758135806914993
          ],
          [
            5.7641338139960805,
            0
          ]
        ]
      }
    ],
    perfil: [
      [
        2.46555625,
        -0.6822946881669
      ],
      [
        2.5869999999999997,
        -0.7741800000000001
      ],
      [
        2.6184267627992197,
        -0.954624
      ],
      [
        2.6498535255984303,
        -1.135068
      ],
      [
        2.6812802883976503,
        -1.315512
      ],
      [
        2.7127070511968703,
        -1.4959559999999998
      ],
      [
        2.74413381399608,
        -1.6764
      ],
      [
        5.7641338139960805,
        -1.6764
      ],
      [
        6.058707051196871,
        -1.4959559999999998
      ],
      [
        6.3532802883976505,
        -1.315512
      ],
      [
        6.64785352559843,
        -1.135068
      ],
      [
        6.9424267627992196,
        -0.954624
      ],
      [
        7.237,
        -0.7741800000000001
      ],
      [
        7.4798875,
        -0.6820157173366169
      ]
    ]
  },
  lineaQuilla: [
    [
      -0.42,
      0.26
    ],
    [
      -0.3,
      0.17928521326163602
    ],
    [
      -0.15,
      0.0857955860920224
    ],
    [
      0,
      0
    ],
    [
      0.97155,
      -0.403077855057412
    ],
    [
      1.9431,
      -0.617431297189419
    ],
    [
      2.91465,
      -0.7185398825957501
    ],
    [
      3.8862,
      -0.7548008517504899
    ],
    [
      4.857749999999999,
      -0.7575642097879439
    ],
    [
      5.8293,
      -0.7443593099729909
    ],
    [
      6.8008500000000005,
      -0.716854210243413
    ],
    [
      7.7724,
      -0.659509188041109
    ],
    [
      8.74395,
      -0.510374072488374
    ],
    [
      9.229725,
      -0.338426580989589
    ],
    [
      9.618345,
      -0.0884454484252194
    ],
    [
      9.715499999999999,
      0
    ],
    [
      10.1557666666667,
      0.5753747945891969
    ],
    [
      10.5960333333333,
      1.13161662642196
    ],
    [
      11.0363,
      1.5748
    ]
  ]
};

// ../itb-estabilidad/src/corbin39.ts
function zTechoQuilla(x) {
  const lq = corbin39_default.lineaQuilla;
  for (let i = 0; i + 1 < lq.length; i++) {
    const [xa, za] = lq[i], [xb, zb] = lq[i + 1];
    if (x >= xa && x <= xb) return za + (x - xa) / (xb - xa) * (zb - za);
  }
  return 0;
}
function formasCorbin39(porIntervalo = 6) {
  const casco = densificar({ nombre: corbin39_default.nombre, fuente: corbin39_default.fuente, secciones: corbin39_default.secciones }, porIntervalo);
  const cortes = corbin39_default.quilla.cortes;
  return { ...casco, cuerpos: [cuerpoDesdeCortes("quilla", cortes, zTechoQuilla, 121)] };
}

// ../itb-estabilidad/src/importar.ts
var A_METROS = { MM: 1e-3, CM: 0.01, M: 1, IN: 0.0254, FT: 0.3048 };
function formasDesdeIges(texto, opciones) {
  const fichero = leerIges(texto);
  const escala2 = A_METROS[fichero.unidad];
  if (escala2 === void 0) throw new Error(`IGES: unidad \xAB${fichero.unidad}\xBB no soportada`);
  const conExtension = fichero.superficies.map((s) => ({ s, ...extensionX(s) }));
  if (conExtension.length === 0) throw new Error("IGES: el fichero no tiene superficies NURBS");
  const min = Math.min(...conExtension.map((e) => e.min));
  const max = Math.max(...conExtension.map((e) => e.max));
  const longitudinales = conExtension.filter((e) => e.max - e.min > 0.05 * (max - min));
  const babor = longitudinales.filter((e) => e.yMedia <= 0);
  const casco = (babor.length > 0 ? babor : longitudinales).map((e) => e.s);
  const N = opciones.secciones ?? 121;
  const x0 = min * escala2, x1 = max * escala2;
  const margen = (x1 - x0) * 1e-6;
  const abscisas = Array.from({ length: N }, (_, i) => {
    const t = 0.5 - 0.5 * Math.cos(Math.PI * i / (N - 1));
    return x0 + margen + (x1 - x0 - 2 * margen) * t;
  });
  return {
    nombre: opciones.nombre,
    fuente: `IGES: ${casco.length} de ${fichero.superficies.length} superficies, unidad ${fichero.unidad}`,
    secciones: seccionesDeSuperficies(casco, abscisas, {
      escala: escala2,
      ...opciones.puntosPorSeccion ? { puntosPorSeccion: opciones.puntosPorSeccion } : {}
    })
  };
}
function extensionX(s) {
  let min = Infinity, max = -Infinity, sy = 0;
  for (let a = 0; a <= 40; a++) {
    for (let b = 0; b <= 40; b++) {
      const p = evaluar2(s, s.u[0] + (s.u[1] - s.u[0]) * a / 40, s.v[0] + (s.v[1] - s.v[0]) * b / 40);
      min = Math.min(min, p[0]);
      max = Math.max(max, p[0]);
      sy += p[1];
    }
  }
  return { min, max, yMedia: sy / 41 ** 2 };
}
function formasDesdeTabla(texto, nombre) {
  const porX = /* @__PURE__ */ new Map();
  const lineas = texto.split(/\r?\n/);
  lineas.forEach((linea2, i) => {
    const l = linea2.trim();
    if (l === "" || l.startsWith("#")) return;
    const campos = l.includes(";") ? l.split(";").map((c) => c.replace(",", ".")) : l.split(/[,\t ]+/);
    const [x, y, z] = campos.map((c) => Number(c.trim()));
    if (campos.length < 3 || [x, y, z].some((v) => v === void 0 || Number.isNaN(v))) {
      if (i === 0) return;
      throw new Error(`l\xEDnea ${i + 1}: se esperaban tres n\xFAmeros (x, semimanga, altura): \xAB${l}\xBB`);
    }
    if (y < 0) throw new Error(`l\xEDnea ${i + 1}: la semimanga no puede ser negativa`);
    if (!porX.has(x)) porX.set(x, []);
    porX.get(x).push([y, z]);
  });
  const secciones = [...porX.entries()].sort((a, b) => a[0] - b[0]).map(([x, puntos]) => {
    const p = [...puntos];
    if (p.length > 0 && p[0][0] !== 0) p.unshift([0, p[0][1]]);
    return { x, puntos: p };
  });
  if (secciones.length < 3) throw new Error("hacen falta al menos tres secciones");
  const pocas = secciones.find((s) => s.puntos.length < 3);
  if (pocas) throw new Error(`la secci\xF3n x = ${pocas.x} tiene menos de tres puntos`);
  return { nombre, fuente: `tabla de semimangas (${secciones.length} secciones)`, secciones };
}
function escalarFormas(f, k) {
  if (k === 1) return f;
  return {
    ...f,
    fuente: `${f.fuente}; escalado \xD7${k}`,
    secciones: f.secciones.map((s) => ({ x: s.x * k, puntos: s.puntos.map(([y, z]) => [y * k, z * k]) }))
  };
}

// src/guia.ts
var AVISO_INDEPENDENCIA = "Esta gu\xEDa es informativa. No forma parte del acta de reconocimiento, no condiciona su resultado ni sustituye al certificado. Recoge lo que establecen la normativa, el acta y el manual del fabricante, con la fuente de cada punto. No recomienda talleres, marcas ni proveedores: qui\xE9n realiza los trabajos lo decide el propietario. La entidad colaboradora de inspecci\xF3n act\xFAa con independencia de quien los realice (RD 1434/1999, art. 6).";
var HORIZONTE_DIAS = 90;
var ORDEN_CARACTER = {
  obligatorio: 0,
  plazo: 1,
  voluntario_norma: 2,
  fabricante: 3,
  criterio: 4
};
function textoIntervalo(i) {
  if (i === void 0) return void 0;
  const partes = [];
  if (i.horas !== void 0) partes.push(`${i.horas} h de motor`);
  if (i.meses !== void 0) partes.push(i.meses % 12 === 0 ? `${i.meses / 12} a\xF1o${i.meses === 12 ? "" : "s"}` : `${i.meses} meses`);
  return partes.length === 0 ? void 0 : `cada ${partes.join(" o ")}${partes.length === 2 ? ", lo que llegue antes" : ""}`;
}
function cuandoLinea(l) {
  if (l.estado === "sin_registro") return "No consta cu\xE1ndo se hizo por \xFAltima vez";
  const { fecha: fecha2, horas } = l.proxima;
  const partes = [];
  if (horas !== void 0) partes.push(`a las ${horas} h`);
  if (fecha2 !== void 0) partes.push(`el ${fechaLarga(fecha2)}`);
  if (partes.length === 0) return textoIntervalo(l.intervalo);
  const prefijo = l.estado === "vencido" ? "Tocaba" : "Toca";
  return `${prefijo} ${partes.join(" o ")}`;
}
function ultimaFirmada(e) {
  return e.inspecciones.find((i) => i.estado === "firmada_favorable" || i.estado === "firmada_desfavorable");
}
function componerGuia(e, zona2, hoy2, opciones) {
  const secciones = [];
  const firmada = ultimaFirmada(e);
  const deficiencias = [...e.deficiencias].sort((a, b) => Number(b.grave) - Number(a.grave));
  secciones.push({
    clave: "corregir",
    titulo: "Lo que hay que corregir",
    caracter: "obligatorio",
    explicacion: "Deficiencias anotadas en el acta que siguen abiertas. Las graves tienen plazo de subsanaci\xF3n; si vence sin corregirlas, se comunica a la Capitan\xEDa Mar\xEDtima.",
    puntos: deficiencias.map((d) => ({
      titulo: `${d.puntoId} \xB7 ${d.titulo}`,
      ...d.observacion !== void 0 ? { detalle: d.observacion } : {},
      cuando: d.grave ? d.limite !== void 0 ? `Grave \xB7 plazo de subsanaci\xF3n hasta el ${fechaLarga(d.limite)}` : "Grave" : "Leve \xB7 sin plazo legal: conviene corregirla antes del siguiente reconocimiento",
      fuente: `Acta${d.numeroInforme !== void 0 ? ` ${d.numeroInforme}` : ""} del ${fechaLarga(d.fecha)}` + (d.grave ? " \xB7 RD 1434/1999, art. 10.2.\xBA" : ""),
      urgente: d.grave
    }))
  });
  const plazos = e.vencimientos.filter((v) => v.clase !== "ventana" && (v.estado !== "vigente" || v.diasRestantes <= HORIZONTE_DIAS)).sort((a, b) => a.fecha.localeCompare(b.fecha));
  secciones.push({
    clave: "plazos",
    titulo: "Lo que caduca o vence pronto",
    caracter: "plazo",
    explicacion: `Plazos vencidos o que vencen en los pr\xF3ximos ${HORIZONTE_DIAS / 30} meses. El equipo caducado a bordo se califica como deficiencia en el siguiente reconocimiento.`,
    puntos: plazos.map((v) => ({
      titulo: v.concepto,
      cuando: `${v.diasRestantes < 0 ? "Venci\xF3" : "Vence"} el ${fechaLarga(v.fecha)}`,
      ...v.gravedadSiVence !== void 0 ? { detalle: `Caducado, es deficiencia grave (Anexo III, letra ${v.gravedadSiVence.letra}).` } : v.detalle !== void 0 ? { detalle: v.detalle } : {},
      fuente: v.cita,
      urgente: v.estado === "vencido"
    }))
  });
  const certificado = e.vencimientos.find((v) => v.clase === "certificado");
  const preparar = [];
  const solicitud = e.vencimientos.find((v) => v.clase === "solicitud" && v.diasRestantes > HORIZONTE_DIAS);
  if (solicitud !== void 0) {
    preparar.push({
      titulo: "Pedir cita a una entidad colaboradora de inspecci\xF3n",
      cuando: `Como tarde el ${fechaLarga(solicitud.fecha)}`,
      ...solicitud.detalle !== void 0 ? { detalle: solicitud.detalle } : {},
      fuente: solicitud.cita,
      urgente: false
    });
  }
  if (firmada !== void 0) {
    const noVistos = Object.values(firmada.hallazgos).filter((h2) => h2.resultado === "no_accesible");
    for (const h2 of noVistos.sort((a, b) => a.puntoId.localeCompare(b.puntoId))) {
      const titulo = opciones.tituloPunto?.(h2.puntoId);
      preparar.push({
        titulo: `Dejar accesible: ${h2.puntoId}${titulo !== void 0 ? ` \xB7 ${titulo}` : ""}`,
        detalle: "En el \xFAltimo reconocimiento no se pudo comprobar." + (h2.observaciones ? ` Motivo anotado: ${h2.observaciones}` : ""),
        fuente: `Acta${firmada.numeroInforme ? ` ${firmada.numeroInforme}` : ""} del ${fechaLarga(firmada.fecha)} \xB7 punto \xABno accesible\xBB`,
        urgente: false
      });
    }
  }
  if (certificado !== void 0 && certificado.diasRestantes >= 0) {
    for (const v of e.vencimientos) {
      if (v.clase !== "equipo" || v.diasRestantes <= HORIZONTE_DIAS || v.fecha > certificado.fecha) continue;
      preparar.push({
        titulo: `${v.concepto}: caducar\xE1 antes del pr\xF3ximo reconocimiento`,
        cuando: `Caduca el ${fechaLarga(v.fecha)}; el certificado, el ${fechaLarga(certificado.fecha)}`,
        ...v.gravedadSiVence !== void 0 ? { detalle: `Si llega caducado, es deficiencia grave (Anexo III, letra ${v.gravedadSiVence.letra}).` } : {},
        fuente: v.cita,
        urgente: false
      });
    }
  }
  if (preparar.length > 0) {
    secciones.push({
      clave: "preparar",
      titulo: "Para preparar el pr\xF3ximo reconocimiento",
      caracter: "plazo",
      explicacion: "Lo que conviene tener listo antes de la pr\xF3xima inspecci\xF3n de esta embarcaci\xF3n, sacado de su expediente: lo que el \xFAltimo acta no pudo comprobar y lo que caducar\xE1 antes.",
      puntos: preparar
    });
  }
  if (zona2 !== void 0 && zona2.zona !== void 0) {
    const puntos = [];
    if (zona2.personasAptas !== void 0) {
      puntos.push({
        titulo: `El equipo cubre a ${zona2.personasAptas} persona${zona2.personasAptas === 1 ? "" : "s"}`,
        detalle: "Para llevar a bordo a todas las personas declaradas en la zona actual: " + zona2.limitanPersonas.map((c) => `${c.nombre} (${describirCarencia(c)})`).join("; ") + ".",
        fuente: [...new Set(zona2.limitanPersonas.map((c) => c.cita))].join(" \xB7 "),
        urgente: false
      });
    }
    for (const c of zona2.faltaParaSubir) {
      puntos.push({ titulo: c.nombre, detalle: describirCarencia(c), fuente: c.cita, urgente: false });
    }
    secciones.push({
      clave: "zona",
      titulo: zona2.siguienteZona !== void 0 ? `Para navegar en zona ${zona2.siguienteZona}` : `Zona de navegaci\xF3n`,
      caracter: "voluntario_norma",
      explicacion: zona2.siguienteZona !== void 0 ? `Con el equipo comprobado, la embarcaci\xF3n puede navegar hasta la zona ${zona2.zona}. Si se quiere ir a la zona ${zona2.siguienteZona}, la norma exige adem\xE1s lo siguiente. No es obligatorio: solo lo es para navegar en esa zona.` : zona2.enElTecho ? `La embarcaci\xF3n alcanza la zona ${zona2.zona}, la m\xE1xima que permite su categor\xEDa de dise\xF1o. Ir m\xE1s lejos no depende del equipo: exigir\xEDa un cambio de categor\xEDa, que la Administraci\xF3n trata como conversi\xF3n importante.` : `La embarcaci\xF3n alcanza la zona ${zona2.zona}.`,
      puntos
    });
  }
  const mantenimiento = e.plan.lineas.filter(
    (l) => (l.origen === "fabricante" || l.origen === "propia") && (l.estado === "vencido" || l.estado === "proximo" || l.estado === "sin_registro")
  );
  secciones.push({
    clave: "mantenimiento",
    titulo: "Mantenimiento seg\xFAn el fabricante",
    caracter: "fabricante",
    explicacion: "Tareas del manual del fabricante vencidas, pr\xF3ximas o sin registro. Los plazos son los del manual, que advierte que deben ajustarse al uso de cada motor.",
    puntos: mantenimiento.map((l) => ({
      titulo: l.componente !== void 0 ? `${l.tarea} (${l.componente.toLowerCase()})` : l.tarea,
      ...l.taller === "oficial" ? { detalle: "El manual indica que la realice un servicio oficial." } : {},
      ...cuandoLinea(l) !== void 0 ? { cuando: cuandoLinea(l) } : {},
      fuente: l.fuente,
      urgente: l.estado === "vencido"
    }))
  });
  if (opciones.incluirAnalisis && e.analisis !== void 0) {
    const huecos = e.analisis.cobertura.filter((c) => c.hueco).sort((a, b) => a.criticidad.localeCompare(b.criticidad));
    secciones.push({
      clave: "analisis",
      titulo: "Mejoras recomendables (criterio t\xE9cnico)",
      caracter: "criterio",
      explicacion: "Revisiones que ni el fabricante ni la inspecci\xF3n peri\xF3dica cubren con la frecuencia que el an\xE1lisis de fallos considera necesaria. No son obligatorias. Salen de un an\xE1lisis de modos de fallo (IEC 60812) y mantenimiento centrado en la fiabilidad (SAE JA1011) hecho para una embarcaci\xF3n de referencia, no de una norma.",
      puntos: huecos.map((c) => ({
        titulo: `${c.modo.elemento}: ${c.modo.tarea.descripcion}`,
        // El efecto va tal cual: son varias frases y pasarlo a minúsculas las rompe.
        detalle: `Previene: ${c.modo.modo.charAt(0).toLowerCase()}${c.modo.modo.slice(1)}. Efecto: ${c.modo.efecto}`,
        ...textoIntervalo(c.modo.tarea.cada) !== void 0 ? { cuando: textoIntervalo(c.modo.tarea.cada) } : {},
        fuente: `An\xE1lisis de fallos, modo ${c.modo.id}, criticidad ${c.criticidad} \xB7 ${c.modo.tarea.justificacion}`,
        urgente: false
      }))
    });
  }
  return {
    matricula: e.matricula,
    ...e.embarcacion?.nombre ? { nombre: e.embarcacion.nombre } : {},
    fecha: hoy2,
    ...firmada !== void 0 ? { basadaEn: { fecha: firmada.fecha, ...firmada.numeroInforme ? { numeroInforme: firmada.numeroInforme } : {} } } : {},
    ...zona2?.zona !== void 0 ? { zonaActual: zona2.zona } : {},
    secciones: secciones.sort((a, b) => ORDEN_CARACTER[a.caracter] - ORDEN_CARACTER[b.caracter]),
    incluyeAnalisis: opciones.incluirAnalisis && e.analisis !== void 0,
    aviso: AVISO_INDEPENDENCIA
  };
}

// src/vista/acta.ts
function panelResultado(resultado2, avance) {
  const v = veredicto(resultado2, avance);
  return h(
    "div",
    { class: `tarjeta resultado ${v}` },
    h("h2", {}, `Resultado: ${textoVeredicto(v, avance)}`),
    h(
      "p",
      { class: "avance" },
      `${avance.respondidos} de ${avance.total} puntos respondidos.`,
      !avance.completo && ` ${avance.pendientes.length === 1 ? "Falta" : "Faltan"} ${cuenta(avance.pendientes.length, "punto")}: ${avance.pendientes.slice(0, 8).join(", ")}` + (avance.pendientes.length > 8 ? "\u2026" : "")
    ),
    resultado2.deficienciasGraves.length > 0 && h(
      "div",
      {},
      h("h3", {}, `Deficiencias graves (${resultado2.deficienciasGraves.length})`),
      h(
        "ul",
        {},
        ...resultado2.deficienciasGraves.map(
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
    resultado2.deficienciasLeves.length > 0 && h("p", {}, `Deficiencias leves: ${resultado2.deficienciasLeves.length}`),
    resultado2.noAccesibles.length > 0 && h(
      "p",
      { class: "salvedad" },
      `\u26A0 ${cuenta(resultado2.noAccesibles.length, "punto no accesible", "puntos no accesibles")}: ` + resultado2.noAccesibles.map((n) => n.puntoId).join(", ")
    ),
    resultado2.limiteSubsanacion !== void 0 && h(
      "p",
      { class: "plazo" },
      h("b", {}, "Plazo de subsanaci\xF3n: "),
      `hasta el ${fechaLarga(resultado2.limiteSubsanacion)}. `,
      h(
        "span",
        { class: "sutil" },
        "Art. 10.2.\xBA del RD 1434/1999: dos meses como m\xE1ximo para subsanar. Transcurrido el plazo sin superar la inspecci\xF3n, la entidad lo comunica a la Capitan\xEDa Mar\xEDtima y el certificado caduca."
      )
    )
  );
}
function pintarActa(inspeccion, guion, resultado2, avance, zona2, campos, contrastes, porCategoria = []) {
  const e = inspeccion.embarcacion;
  const v = veredicto(resultado2, avance);
  const puntos = puntosDe(guion);
  const motivo = campos.tipos_reconocimiento.find((t) => t.clave === inspeccion.motivo);
  const nombreEquipo2 = (clave) => campos.equipos_medida.find((q) => q.clave === clave)?.etiqueta ?? clave;
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
    resultado2.limiteSubsanacion !== void 0 && h(
      "p",
      { class: "acta-plazo" },
      `Plazo de subsanaci\xF3n hasta el ${fechaLarga(resultado2.limiteSubsanacion)} (art. 10.2.\xBA del RD 1434/1999).`
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
        "Techo de zona",
        zona2.techo !== void 0 ? `Zona ${zona2.techo}. ${zona2.fundamentoTecho}` : `No consta. ${zona2.fundamentoTecho}`
      ),
      // Varias categorías en la placa (CT 1/2020): la zona se escribe por categoría, «apto
      // zona N con hasta X personas», que es como la placa da los límites.
      porCategoria.length > 0 && fila("Por categor\xEDa de la placa", porCategoria.map(describirZonaPorCategoria).join(". ") + "."),
      (e.equiposFOM1144?.length ?? 0) > 0 && fila(
        "Equipo anterior a 2021",
        `Instalado conforme a la Orden FOM/1144/2003: ${e.equiposFOM1144.join(", ").replace(/_/g, " ")}. No se le exigen los requisitos que a\xF1adi\xF3 el RD 339/2021 (disposici\xF3n adicional segunda, apartado 1); sus revisiones, s\xED (apartado 2).`
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
            nombreEquipo2(q.clave),
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
function panelZona(zona2, porCategoria = []) {
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
    // La evaluación de estabilidad no cambia la zona: se dice lo que implica (ADR-020).
    zona2.estabilidad !== void 0 && h(
      "p",
      { class: zona2.estabilidad.zonaJustificable !== void 0 ? "falta-subir" : "sutil" },
      `Estabilidad: ${zona2.estabilidad.nota}`
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
      `Techo: zona ${zona2.techo}. ${zona2.fundamentoTecho} `,
      zona2.enElTecho ? "La embarcaci\xF3n est\xE1 en el m\xE1ximo que se le permite." : "El equipo a bordo no llega al m\xE1ximo que se le permitir\xEDa."
    ),
    // Con varias categorías en la placa, la zona depende de cuántos vayan a bordo: una
    // línea por categoría, como la da la placa (CT 1/2020).
    porCategoria.length > 0 && h(
      "div",
      { class: "falta-subir" },
      h("h3", {}, "Seg\xFAn la categor\xEDa de la placa"),
      h("ul", {}, ...porCategoria.map((c) => h("li", {}, describirZonaPorCategoria(c))))
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
    // Disposición adicional segunda del RD 339/2021: lo que no se exige al equipo
    // instalado con la FOM/1144/2003 se nombra, no se calla.
    (exigencia?.retiradosPorDA2?.length ?? 0) > 0 && h(
      "p",
      { class: "sutil" },
      `Instalado conforme a la Orden FOM/1144/2003: no se exige ${(exigencia?.retiradosPorDA2 ?? []).map((r) => `\xAB${r}\xBB`).join(", ")} (RD 339/2021, disposici\xF3n adicional segunda, apartado 1).`
    ),
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
    // Disposición adicional segunda del RD 339/2021: lo que no se exige al equipo
    // instalado con la FOM/1144/2003 se nombra, no se calla.
    (exigencia.retiradosPorDA2?.length ?? 0) > 0 && h(
      "p",
      { class: "sutil" },
      `Instalado conforme a la Orden FOM/1144/2003: no se exige ${(exigencia.retiradosPorDA2 ?? []).map((r) => `\xAB${r}\xBB`).join(", ")} (RD 339/2021, disposici\xF3n adicional segunda, apartado 1).`
    ),
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
function fichaSegunTemporada(embarcacion, periodo, fecha2) {
  if (periodo === void 0 || embarcacion.lista !== 7) return embarcacion;
  const antesEnElMismoAnio = fecha2 < periodo.inicio && fecha2.slice(0, 4) === periodo.inicio.slice(0, 4);
  return enTemporada(periodo, fecha2) || antesEnElMismoAnio ? conRegimenComercial(embarcacion) : embarcacion;
}
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
  let temporada;
  const avisos = [...evaluacionSucesos.avisos];
  if (embarcacion !== void 0) {
    const porAbanderamiento = new Set(
      inspecciones.filter((i) => i.motivo === "abanderamiento").map((i) => i.id)
    );
    const ultimoPeriodico = realizados.filter((r) => (r.tipo === "periodico" || porAbanderamiento.has(r.id)) && r.favorable).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
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
      const nombreRenovador = ultimoPeriodico.tipo === "periodico" ? "peri\xF3dico" : "extraordinario por abanderamiento";
      avisos.push(
        antesDeCaducar ? `El certificado renovado se cuenta desde la caducidad del anterior (${caducidadAnterior}): el reconocimiento ${nombreRenovador} favorable del ${ultimoPeriodico.fecha} se hizo antes de que caducara.` : `El certificado se cuenta desde el reconocimiento ${nombreRenovador} favorable del ${ultimoPeriodico.fecha}` + (caducidadAnterior !== void 0 ? `, porque el anterior ya hab\xEDa caducado (${caducidadAnterior}).` : ".")
      );
    }
    const resultado2 = calendario(
      ficha,
      evaluar(ficha, [catalogos.reglas], hoy2),
      expediente.caducidades,
      [catalogos.equipo],
      hoy2
    );
    const apertura = resultado2.vencimientos.find((v) => v.clase === "ventana")?.fecha;
    const intermedioHecho = apertura !== void 0 && realizados.some((r) => r.tipo === "intermedio" && r.favorable && r.fecha >= apertura);
    vencimientos = intermedioHecho ? resultado2.vencimientos.filter((v) => v.clase !== "ventana" && v.clase !== "reconocimiento") : resultado2.vencimientos;
    avisos.push(...resultado2.avisos);
    const periodo = expediente.periodoComercial;
    if (periodo !== void 0 && ficha.lista === 7 && periodo.fin >= hoy2) {
      const revision = revisarTemporada(ficha, periodo, catalogos.reglas, hoy2);
      const aperturaComercial = ficha.fechaCertificado !== void 0 ? sumarAnios(ficha.fechaCertificado, 2) : void 0;
      const intermedioComercialHecho = aperturaComercial !== void 0 && realizados.some((r) => r.tipo === "intermedio" && r.favorable && r.fecha >= aperturaComercial);
      const pendientesTemporada = revision.pendientes.filter(
        (v) => !(v.clase === "reconocimiento" && intermedioComercialHecho)
      );
      temporada = { ...revision, pendientes: pendientesTemporada };
      avisos.push(...revision.avisos);
      if (pendientesTemporada.length > 0) {
        avisos.push(
          `Toca reconocimiento antes de la temporada comercial (${periodo.inicio} a ${periodo.fin}): ` + pendientesTemporada.map((v) => `${v.concepto.toLowerCase()} el ${v.fecha}`).join("; ") + ". Durante la temporada rige el r\xE9gimen de la lista 6.\xAA (RD 186/2023, art. 9)."
        );
      }
    }
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
    ...temporada !== void 0 ? { temporada } : {},
    avisos
  };
}
function resumenInspeccion(inspeccion) {
  const resultado2 = calcularResultado(inspeccion.hallazgos, inspeccion.fecha);
  return {
    graves: resultado2.deficienciasGraves.length,
    leves: resultado2.deficienciasLeves.length,
    noAccesibles: resultado2.noAccesibles.length
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
  let fecha2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
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
            valor: fecha2,
            oninput: (e) => {
              fecha2 = e.target.value;
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
                fecha: fecha2,
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
            resumen.graves > 0 && ` \xB7 ${cuenta(resumen.graves, "deficiencia grave", "deficiencias graves")}`,
            resumen.leves > 0 && ` \xB7 ${cuenta(resumen.leves, "leve")}`,
            resumen.noAccesibles > 0 && ` \xB7 ${cuenta(resumen.noAccesibles, "no accesible")}`
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
function panelTemporada(expediente, periodo, alFijar) {
  if (expediente.embarcacion?.lista !== 7) return false;
  const fecha2 = (valor2, alCambiar) => h("input", {
    type: "date",
    valor: valor2,
    onchange: (ev) => alCambiar(ev.target.value)
  });
  const inicio = periodo?.inicio ?? "";
  const fin = periodo?.fin ?? "";
  const fijar = (i, f) => alFijar(i === "" || f === "" ? void 0 : { inicio: i, fin: f });
  return h(
    "div",
    { class: "tarjeta" },
    h("h2", {}, "Temporada comercial"),
    h(
      "p",
      { class: "sutil" },
      "Desde el 31/12/2025 una embarcaci\xF3n de la lista 7.\xAA puede dedicarse a fines comerciales hasta tres meses consecutivos por a\xF1o natural. Durante ese periodo rige el r\xE9gimen de reconocimientos de la lista 6.\xAA y el equipo de fines comerciales (RD 186/2023, art. 9, redacci\xF3n del RD 1188/2025)."
    ),
    h("label", { class: "campo" }, h("span", { class: "campo-etiqueta" }, "Desde"), fecha2(inicio, (v) => fijar(v, fin))),
    h("label", { class: "campo" }, h("span", { class: "campo-etiqueta" }, "Hasta"), fecha2(fin, (v) => fijar(inicio, v))),
    expediente.temporada !== void 0 && (expediente.temporada.pendientes.length === 0 ? h("p", { class: "sutil" }, "Con el r\xE9gimen de la lista 6.\xAA no le falta nada antes de empezar.") : h(
      "ul",
      {},
      ...expediente.temporada.pendientes.map(
        (v) => h("li", {}, `${v.concepto}: ${v.fecha} (${v.cita})`)
      )
    )),
    periodo !== void 0 && h("button", { class: "sutil", onclick: () => alFijar(void 0) }, "Quitar la temporada")
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
  const cuenta2 = /* @__PURE__ */ new Map();
  for (const v of valores) cuenta2.set(v, (cuenta2.get(v) ?? 0) + 1);
  return [...cuenta2.entries()].map(([clave, veces]) => ({ clave, etiqueta: nombres[clave] ?? clave, veces })).sort((a, b) => b.veces - a.veces || a.clave.localeCompare(b.clave));
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
function reinspeccionFavorablePosterior(inspecciones, matricula, fecha2) {
  return inspecciones.filter(
    (i) => i.estado === "firmada_favorable" && i.embarcacion.matricula === matricula && i.fecha > fecha2
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
      `${cuenta(resumen.total, "inspecci\xF3n", "inspecciones")} \xB7 ${cuenta(resumen.favorables, "favorable")} \xB7 ${cuenta(resumen.desfavorables, "desfavorable")} \xB7 ${resumen.enCurso} en curso`
    ),
    // Lo único del histórico que es una obligación con consecuencias: va arriba y en rojo.
    resumen.vencidas > 0 && h(
      "p",
      { class: "salvedad" },
      `\u26A0 ${cuenta(resumen.vencidas, "plazo de subsanaci\xF3n vencido", "plazos de subsanaci\xF3n vencidos")} sin reinspecci\xF3n favorable. El art. 10.2.\xBA del RD 1434/1999 obliga a comunicarlo a la Capitan\xEDa Mar\xEDtima.`
    ),
    lineas.length === 0 ? h("p", { class: "vacio" }, "Ninguna inspecci\xF3n coincide con la b\xFAsqueda.") : h("ul", { class: "listado" }, ...lineas.map((l) => pintarLinea3(l, acciones)))
  );
}
function pintarLinea3(l, acciones) {
  const resultado2 = l.resultado === "favorable" ? "FAVORABLE" : l.resultado === "desfavorable" ? "DESFAVORABLE" : "en curso";
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
      h("b", {}, resultado2),
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
  const lista3 = Object.values(dictamenes);
  return {
    total,
    revisadas: lista3.length,
    correctas: lista3.filter((d) => d.veredicto === "correcta").length,
    corregidas: lista3.filter((d) => d.veredicto === "corregida").length,
    dudosas: lista3.filter((d) => d.veredicto === "dudosa").length,
    pendientes: total - lista3.length
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
var NOMBRE_EQUIPO = {
  etb: "ETB (estaci\xF3n terrena de buque)",
  vhf_fijo: "VHF fijo",
  vhf_portatil: "VHF port\xE1til",
  respondedor_radar: "respondedor de radar de 9 GHz",
  radiobaliza_406: "radiobaliza de 406 MHz",
  navtex: "receptor NAVTEX",
  mf_hf: "instalaci\xF3n de MF/HF"
};
function nombreEquipo(clave) {
  return NOMBRE_EQUIPO[clave] ?? clave.replace(/_/g, " ");
}
function valor(v) {
  const texto = String(v);
  return NOMBRE_VALOR[texto] ?? texto.replace(/_/g, " ");
}
function lista2(v) {
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
      frases.push(`Casco de ${lista2(v)}`);
      continue;
    }
    if (clave === "categoriaDiseno") {
      frases.push(`Categor\xEDa de dise\xF1o ${lista2(v).toUpperCase()}`);
      continue;
    }
    if (clave === "propulsion") {
      frases.push(`Propulsi\xF3n ${lista2(v)}`);
      continue;
    }
    if (clave === "disposicionMotor") {
      frases.push(`Motor ${lista2(v)}`);
      continue;
    }
    if (clave === "combustible") {
      frases.push(`Combustible del ${lista2(v)}`);
      continue;
    }
    if (clave === "anclaAltoPoderAgarre") {
      frases.push(v === "si" ? "Ancla de alto poder de agarre" : "Ancla que no es de alto poder de agarre");
      continue;
    }
    if (clave === "tipoSuceso") {
      frases.push(`El suceso es ${lista2(v)}`);
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
    const unidad = entonces["unidad"];
    partes.push(unidad !== void 0 ? `\u2014 ${cantidad} ${String(unidad)}` : `\u2014 ${cantidad}`);
  } else if (cantidad !== null && typeof cantidad === "object" && "tabla" in cantidad) {
    const tabla = cantidad.tabla;
    const unidad = String(entonces["unidad"] ?? "");
    const extremos = `${tabla.puntos[0][1]} a ${tabla.puntos.at(-1)[1]} ${unidad}`.trim();
    partes.push(
      `\u2014 seg\xFAn tabla por ${NOMBRE_VARIABLE[tabla.variable] ?? tabla.variable} (${extremos}, interpolando las intermedias)` + (tabla.factor !== void 0 ? Math.abs(tabla.factor - 4 / 3) < 1e-3 ? ", aumentados en un tercio" : `, multiplicados por ${String(tabla.factor).replace(".", ",")}` : "") + (tabla.tolerancia !== void 0 ? `, con una tolerancia del ${Math.round(tabla.tolerancia * 100)} %` : "")
    );
  } else if (cantidad !== null && typeof cantidad === "object") {
    const expresion = describirExpresion(cantidad.expresion);
    partes.push(`\u2014 cantidad calculada: ${expresion} ${String(entonces["unidad"] ?? "")}`);
  }
  const satisfechoPor = entonces["satisfechoPor"];
  if (Array.isArray(satisfechoPor) && satisfechoPor.length > 0) {
    partes.push(`\u2014 se satisface tambi\xE9n con: ${satisfechoPor.map((s) => nombreEquipo(String(s))).join(", ")}`);
  }
  if (entonces["remitidoA"] !== void 0) {
    partes.push(`\u2014 seg\xFAn ${String(entonces["remitidoA"])}`);
  }
  const nuevos = entonces["requisitosNuevos"];
  if (Array.isArray(nuevos) && nuevos.length > 0) {
    partes.push(
      `\u2014 no se exige al equipo instalado con la FOM/1144/2003 (DA 2.\xAA.1): ${nuevos.map(String).join("; ")}`
    );
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
      dias >= 0 ? `Quedan ${cuenta(dias, "d\xEDa")}.` : `Venci\xF3 hace ${cuenta(Math.abs(dias), "d\xEDa")}.`
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
      memoria.porTipo.map((r) => ({ ...r, etiqueta: mayuscula(nombreTipo(r.clave)) })),
      "Tipo"
    ),
    tablaRecuento(
      "Por motivo",
      memoria.porMotivo.map((r) => ({ ...r, etiqueta: mayuscula(r.etiqueta) })),
      "Motivo"
    ),
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
          h("td", {}, mayuscula(nombreTipo(l.tipo))),
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
      clave: "criterios",
      titulo: "Criterios de la Administraci\xF3n \u2014 instrucciones y consultas de la DGMM, tablas del Ministerio"
    },
    {
      clave: "consulta",
      titulo: "Normas de pago \u2014 se consultan, no se reparten"
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
      id: "rd-1185-2006",
      grupo: "nucleo",
      titulo: "RD 1185/2006 \u2014 radiocomunicaciones mar\xEDtimas (equipo de radio por zona)",
      referencia: "BOE-A-2006-18968",
      url: "biblioteca/rd-1185-2006.pdf?v=65108d3d3e04",
      paginas: 61,
      bytes: 1059135
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
      id: "directiva-2013-53-ue",
      grupo: "nucleo",
      titulo: "Directiva 2013/53/UE \u2014 embarcaciones de recreo y motos acu\xE1ticas (origen del RD 98/2016)",
      referencia: "CELEX 32013L0053",
      url: "biblioteca/directiva-2013-53-ue.pdf?v=60ef4d067878",
      paginas: 42,
      bytes: 1106802
    },
    {
      id: "codigo-is-2008",
      grupo: "nucleo",
      titulo: "C\xF3digo IS 2008 \u2014 C\xF3digo Internacional de Estabilidad sin Aver\xEDa (experiencia de estabilidad y periodo de balance)",
      referencia: "BOE-A-2011-5295",
      url: "biblioteca/codigo-is-2008.pdf?v=033520058de7",
      paginas: 105,
      bytes: 3477860
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
      id: "rdl-2-2011",
      grupo: "actividad",
      titulo: "RDL 2/2011 \u2014 Texto refundido de la Ley de Puertos del Estado y de la Marina Mercante (habilitaci\xF3n legal)",
      referencia: "BOE-A-2011-16467",
      url: "biblioteca/rdl-2-2011.pdf?v=96d87e1c3c92",
      paginas: 212,
      bytes: 1554963
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
      id: "rd-186-2023",
      grupo: "registral",
      titulo: "RD 186/2023 \u2014 Reglamento de Ordenaci\xF3n de la Navegaci\xF3n Mar\xEDtima (art. 9: lista 7.\xAA con temporada comercial)",
      referencia: "BOE-A-2023-7410",
      url: "biblioteca/rd-186-2023.pdf?v=14dbc182bb33",
      paginas: 39,
      bytes: 735901
    },
    {
      id: "mitms-tabla-material-rd339",
      grupo: "criterios",
      titulo: "Ministerio \u2014 tabla del material del RD 339/2021 por zona (rev. 1)",
      url: "biblioteca/mitms-tabla-material-rd339.pdf?v=f3643e0a0efc",
      paginas: 2,
      bytes: 243889
    },
    {
      id: "mitms-tabla-material-variaciones",
      grupo: "criterios",
      titulo: "Ministerio \u2014 variaciones de la tabla del material del RD 339/2021",
      url: "biblioteca/mitms-tabla-material-variaciones.pdf?v=416c1fb29eb1",
      paginas: 1,
      bytes: 230613
    },
    {
      id: "mitms-plazos-rd339",
      grupo: "criterios",
      titulo: "Ministerio \u2014 plazos de aplicaci\xF3n del RD 339/2021 (revisada)",
      url: "biblioteca/mitms-plazos-rd339.pdf?v=b00839ad22d0",
      paginas: 1,
      bytes: 148529
    },
    {
      id: "dgmm-ct-1-2020",
      grupo: "criterios",
      titulo: "DGMM CT 1/2020 \u2014 categor\xEDa de dise\xF1o en la placa",
      url: "biblioteca/dgmm-ct-1-2020.pdf?v=444caf01a072",
      paginas: 2,
      bytes: 301365
    },
    {
      id: "dgmm-ct-2-2020",
      grupo: "criterios",
      titulo: "DGMM CT 2/2020 \u2014 inscripci\xF3n de embarcaciones con marcado CE no reciente",
      url: "biblioteca/dgmm-ct-2-2020.pdf?v=c199ae38a6a7",
      paginas: 2,
      bytes: 299832
    },
    {
      id: "dgmm-ct-3-2020",
      grupo: "criterios",
      titulo: "DGMM CT 3/2020 \u2014 potencia m\xE1xima recomendada",
      url: "biblioteca/dgmm-ct-3-2020.pdf?v=6ae29a0ad911",
      paginas: 2,
      bytes: 329386
    },
    {
      id: "dgmm-ct-4-2020",
      grupo: "criterios",
      titulo: "DGMM CT 4/2020 \u2014 titulaciones de recreo para socorrismo",
      url: "biblioteca/dgmm-ct-4-2020.pdf?v=8179c5aec3e4",
      paginas: 3,
      bytes: 310877
    },
    {
      id: "dgmm-ct-5-2020",
      grupo: "criterios",
      titulo: "DGMM CT 5/2020 \u2014 conversi\xF3n importante",
      url: "biblioteca/dgmm-ct-5-2020.pdf?v=f5a18154f866",
      paginas: 4,
      bytes: 461395
    },
    {
      id: "dgmm-ct-6-2020",
      grupo: "criterios",
      titulo: "DGMM CT 6/2020 \u2014 pruebas a flote de embarcaciones de recreo",
      url: "biblioteca/dgmm-ct-6-2020.pdf?v=75daae2cf003",
      paginas: 2,
      bytes: 397839
    },
    {
      id: "dgmm-ct-7-2020",
      grupo: "criterios",
      titulo: "DGMM CT 7/2020 \u2014 uso privado de una embarcaci\xF3n dedicada al ch\xE1rter",
      url: "biblioteca/dgmm-ct-7-2020.pdf?v=f8b97f5abea8",
      paginas: 2,
      bytes: 339227
    },
    {
      id: "dgmm-ct-7-2020-anexos",
      grupo: "criterios",
      titulo: "DGMM CT 7/2020, anexos \u2014 informe de la DG de Tributos (escaneado, sin texto buscable)",
      url: "biblioteca/dgmm-ct-7-2020-anexos.pdf?v=6d2b3f2f569a",
      paginas: 14,
      bytes: 1432316
    },
    {
      id: "dgmm-ct-8-2020",
      grupo: "criterios",
      titulo: "DGMM CT 8/2020 \u2014 navegaci\xF3n en aguas espa\xF1olas con ICP holand\xE9s",
      url: "biblioteca/dgmm-ct-8-2020.pdf?v=94aeb8ec5af4",
      paginas: 3,
      bytes: 518421
    },
    {
      id: "dgmm-ct-1-2021",
      grupo: "criterios",
      titulo: "DGMM CT 1/2021 \u2014 kayaks",
      url: "biblioteca/dgmm-ct-1-2021.pdf?v=0a810a81869c",
      paginas: 4,
      bytes: 745332
    },
    {
      id: "dgmm-ct-2-2021",
      grupo: "criterios",
      titulo: "DGMM CT 2/2021 \u2014 canje de certificados de navegabilidad",
      url: "biblioteca/dgmm-ct-2-2021.pdf?v=32ad01c323e1",
      paginas: 4,
      bytes: 523493
    },
    {
      id: "dgmm-ct-3-2021",
      grupo: "criterios",
      titulo: "DGMM CT 3/2021 \u2014 balsas salvavidas en embarcaciones de alquiler",
      url: "biblioteca/dgmm-ct-3-2021.pdf?v=360b302f71fb",
      paginas: 3,
      bytes: 544786
    },
    {
      id: "dgmm-ct-5-2021",
      grupo: "criterios",
      titulo: "DGMM CT 5/2021 \u2014 abanderamiento de embarcaciones antiguas sin marcado CE",
      url: "biblioteca/dgmm-ct-5-2021.pdf?v=71e364ea2023",
      paginas: 2,
      bytes: 301641
    },
    {
      id: "dgmm-ct-1-2022",
      grupo: "criterios",
      titulo: "DGMM CT 1/2022 \u2014 representante autorizado",
      url: "biblioteca/dgmm-ct-1-2022.pdf?v=bd3022ddeb94",
      paginas: 3,
      bytes: 496313
    },
    {
      id: "dgmm-ct-1-2024",
      grupo: "criterios",
      titulo: "DGMM CT 1/2024 \u2014 cambio de zona de navegaci\xF3n",
      url: "biblioteca/dgmm-ct-1-2024.pdf?v=ea9b6046bf8e",
      paginas: 5,
      bytes: 340513
    },
    {
      id: "dgmm-ct-1-2025",
      grupo: "criterios",
      titulo: "DGMM CT 1/2025 \u2014 declaraci\xF3n de conformidad no disponible",
      url: "biblioteca/dgmm-ct-1-2025.pdf?v=57ac5fc3eb60",
      paginas: 2,
      bytes: 269045
    },
    {
      id: "dgmm-ct-1-2026",
      grupo: "criterios",
      titulo: "DGMM CT 1/2026 \u2014 abanderamiento de motos de agua el\xE9ctricas",
      url: "biblioteca/dgmm-ct-1-2026.pdf?v=4986b27f4b37",
      paginas: 3,
      bytes: 375473
    },
    {
      id: "dgmm-is-6-2020",
      grupo: "criterios",
      titulo: "DGMM IS 6/2020 \u2014 modifica la IS 4/2011 (aplicaci\xF3n del RD 1435/2010)",
      url: "biblioteca/dgmm-is-6-2020.pdf?v=eff37fc3807c",
      paginas: 16,
      bytes: 824700
    },
    {
      id: "dgmm-is-1-2022",
      grupo: "criterios",
      titulo: "DGMM IS 1/2022 \u2014 reabanderamiento de embarcaciones procedentes de la UE",
      url: "biblioteca/dgmm-is-1-2022.pdf?v=062d3dd4ebeb",
      paginas: 3,
      bytes: 394193
    },
    {
      id: "dgmm-is-2-2022",
      grupo: "criterios",
      titulo: "DGMM IS 2/2022 \u2014 tripulaci\xF3n m\xEDnima de seguridad en buques de recreo",
      url: "biblioteca/dgmm-is-2-2022.pdf?v=b31fa5e1e8fe",
      paginas: 4,
      bytes: 763716
    },
    {
      id: "dgmm-is-4-2023",
      grupo: "criterios",
      titulo: "DGMM IS 4/2023 \u2014 tasas del certificado de navegabilidad",
      url: "biblioteca/dgmm-is-4-2023.pdf?v=5b70832530ba",
      paginas: 4,
      bytes: 484741
    },
    {
      id: "une-en-iso-12217-2-2025",
      grupo: "consulta",
      titulo: "UNE-EN ISO 12217-2:2025 \u2014 estabilidad y flotabilidad, veleros de 6 m o m\xE1s",
      referencia: "AENOR",
      url: "",
      externo: "https://discovery.upc.edu/",
      nota: "de pago: se consulta en AENORm\xE1s con la suscripci\xF3n de la UPC; la aplicaci\xF3n la aplica en \xABEstabilidad ISO 12217-2\xBB",
      paginas: 0,
      bytes: 0
    },
    {
      id: "une-en-iec-60812-2018",
      grupo: "consulta",
      titulo: "UNE-EN IEC 60812:2018 \u2014 an\xE1lisis de modos de fallo y sus efectos (AMFE)",
      referencia: "AENOR",
      url: "",
      externo: "https://discovery.upc.edu/",
      nota: "de pago: se consulta en AENORm\xE1s con la suscripci\xF3n de la UPC; es el m\xE9todo del \xABAn\xE1lisis de fallos\xBB",
      paginas: 0,
      bytes: 0
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
function componerAvisos(entrada2, hoy2) {
  const avisos = [];
  const citasPendientes = entrada2.citas.filter((c) => c.estado === "pendiente");
  const citaDe = (matricula) => citasPendientes.filter((c) => c.embarcacion.matricula.trim() === matricula).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  for (const l of componerHistorico(entrada2.inspecciones, {}, hoy2)) {
    if (l.limiteSubsanacion === void 0 || l.subsanacion === "subsanada") continue;
    const quien = barco(l.nombre, l.matricula);
    if (l.subsanacion === "vencida") {
      avisos.push({
        id: `subsanacion:${l.inspeccionId}`,
        nivel: "urgente",
        tipo: "subsanacion",
        titulo: `Subsanaci\xF3n vencida sin reinspecci\xF3n: ${quien}`,
        detalle: `El plazo acab\xF3 el ${fechaLarga(l.limiteSubsanacion)}. La entidad debe comunicarlo a la Capitan\xEDa Mar\xEDtima.`,
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
        detalle: `Dos meses desde el reconocimiento desfavorable; acaba el ${fechaLarga(l.limiteSubsanacion)}.`,
        fundamento: "RD 1434/1999, art. 10.2.\xBA",
        fecha: l.limiteSubsanacion,
        matricula: l.matricula,
        destino: { pantalla: "inspeccion", id: l.inspeccionId }
      });
    }
  }
  for (const { expediente, compuesto } of entrada2.expedientes) {
    const matricula = expediente.matricula;
    const quien = barco(compuesto.embarcacion?.nombre, matricula);
    const cita = citaDe(matricula);
    const enCurso = entrada2.inspecciones.some(
      (i) => i.estado === "borrador" && i.embarcacion.matricula.trim() === matricula
    );
    for (const o of compuesto.obligacionesPendientes) {
      avisos.push({
        id: `suceso:${matricula}:${o.suceso.id}:${o.fundamento.reglaId}`,
        nivel: cita !== void 0 ? "atencion" : "urgente",
        tipo: "suceso",
        titulo: `Reconocimiento ${NOMBRE_RECONOCIMIENTO[o.tipo] ?? o.tipo} pendiente: ${quien}`,
        detalle: `Por ${o.suceso.descripcion || o.suceso.tipo} (${fechaLarga(o.suceso.fecha)}).` + (cita !== void 0 ? ` Tiene cita el ${fechaLarga(cita.fecha)}.` : ""),
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
        detalle: `${s.descripcion || "Aver\xEDa en maquinaria"} (${fechaLarga(s.fecha)}). Si afecta a la seguridad de la navegaci\xF3n, obliga a un reconocimiento adicional.`,
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
          detalle: `${v.concepto}: ${fechaLarga(v.fecha)}.` + (enCurso ? " Hay una inspecci\xF3n en curso." : cita !== void 0 ? ` Tiene cita el ${fechaLarga(cita.fecha)}.` : " Sin cita en la agenda."),
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
          detalle: `${v.estado === "vencido" ? "Caduc\xF3" : "Caduca"} el ${fechaLarga(v.fecha)}. En el pr\xF3ximo reconocimiento ser\xEDa deficiencia grave: ${v.gravedadSiVence.supuesto}`,
          fundamento: `RD 1434/1999, Anexo III, letra ${v.gravedadSiVence.letra})`,
          fecha: v.fecha,
          matricula,
          destino: { pantalla: "expediente", matricula }
        });
      }
    }
    const temporada = compuesto.temporada;
    if (temporada !== void 0 && temporada.pendientes.length > 0) {
      const vencido = temporada.pendientes.some((v) => v.estado === "vencido");
      avisos.push({
        id: `temporada:${matricula}:${temporada.periodo.inicio}`,
        nivel: cita !== void 0 || enCurso ? "info" : vencido ? "urgente" : "atencion",
        tipo: "temporada",
        titulo: `Toca reconocimiento antes de la temporada comercial: ${quien}`,
        detalle: `La temporada empieza el ${fechaLarga(temporada.periodo.inicio)} y durante ella rige el r\xE9gimen de la lista 6.\xAA. ` + temporada.pendientes.map((v) => `${v.concepto}: ${fechaLarga(v.fecha)}.`).join(" ") + (cita !== void 0 ? ` Tiene cita el ${fechaLarga(cita.fecha)}.` : ""),
        fundamento: "RD 186/2023, art. 9 (redacci\xF3n del RD 1188/2025)",
        fecha: temporada.periodo.inicio,
        matricula,
        destino: cita !== void 0 ? { pantalla: "agenda", citaId: cita.id } : { pantalla: "expediente", matricula }
      });
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
        detalle: `Era el ${fechaLarga(c.fecha)}${c.lugar ? ` en ${c.lugar}` : ""}. Empiece la inspecci\xF3n, c\xE1mbiela de fecha o an\xFAlela.`,
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
  for (const i of entrada2.inspecciones) {
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
  const memoria = componerMemoriaAnual(entrada2.inspecciones, anterior, hoy2);
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
  for (const n of entrada2.notas) {
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
      for (const m2 of comparable.matchAll(expresion)) {
        const pos = m2.index;
        const fin = pos + m2[0].length;
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
    if (d.grupo === "consulta" && (d.url !== "" || d.externo === void 0 || d.nota === void 0)) {
      throw new Error(`${d.id}: una norma de pago no se sirve; necesita d\xF3nde consultarla y una nota`);
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
function zona(clase, titulo, cifra4, cuerpo, pie) {
  return h(
    "section",
    { class: `zona-panel ${clase}` },
    h("header", { class: "zona-cabecera" }, h("h2", {}, titulo), cifra4 !== void 0 && h("span", { class: "zona-cifra" }, cifra4)),
    ...cuerpo,
    pie
  );
}
var verTodo = (texto, accion) => h("button", { class: "ver-todo", type: "button", onclick: accion }, texto);
function pintarPanel(d, acciones) {
  const cuenta2 = contarAvisos(d.avisos);
  const pendientesAgenda = d.agenda.atrasadas.length + d.agenda.hoy.length + d.agenda.proximas.length;
  let busqueda = "";
  const avisosVisibles = d.avisos.filter((a) => a.nivel !== "info").slice(0, 5);
  const zonaAvisos = zona(
    `avisos ${cuenta2.urgente > 0 ? "hay-urgentes" : ""}`,
    "Avisos",
    cuenta2.urgente + cuenta2.atencion > 0 ? [cuenta2.urgente > 0 ? `${cuenta2.urgente} urgente${cuenta2.urgente > 1 ? "s" : ""}` : "", cuenta2.atencion > 0 ? `${cuenta2.atencion} por atender` : ""].filter(Boolean).join(" \xB7 ") : void 0,
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
        cifra2(String(r.total), `en ${d.historial.anio}`),
        cifra2(String(r.favorables), "favorables", "verde"),
        cifra2(String(r.desfavorables), "desfavorables", r.desfavorables > 0 ? "rojo" : void 0),
        cifra2(String(r.vencidas), "subsanaciones vencidas", r.vencidas > 0 ? "rojo" : void 0)
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
      // Solo la fecha y, si consta, la entidad. Antes decía además «Inspector autónomo» y
      // «RD 1434/1999»: ni una cosa ni la otra le dicen nada a quien abre la aplicación, y
      // la norma ya se cita donde importa, que es en cada conclusión (Víctor, 16/09/2026).
      h(
        "p",
        { class: "sutil" },
        fechaLarga(d.hoy),
        d.perfil.entidad.trim() !== "" ? ` \xB7 ${d.perfil.entidad.trim()}` : ""
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
      zonaIngenieria(acciones),
      h(
        "div",
        { class: "rejilla-panel" },
        ...cuenta2.urgente > 0 ? [zonaAvisos, zonaAgenda, zonaHistorial, zonaBiblioteca] : [zonaAgenda, zonaAvisos, zonaHistorial, zonaBiblioteca]
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
        d.espacio !== void 0 && h("p", { class: "sutil" }, d.espacio),
        h("p", { class: "sutil" }, `Actualizado: ${ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`)
      )
    )
  );
}
function zonaIngenieria(acciones) {
  const ficha = (zona2, titulo, texto, nuevo = false) => h(
    "button",
    { type: "button", class: `ficha-ingenieria${nuevo ? " nueva" : ""}`, onclick: () => acciones.alIr(zona2) },
    nuevo && h("span", { class: "etiqueta-nuevo" }, "Nuevo"),
    h("b", {}, titulo),
    h("span", {}, texto)
  );
  return h(
    "section",
    { class: "zona-panel ingenieria" },
    h("header", { class: "zona-cabecera" }, h("h2", {}, "Ingenier\xEDa naval"), h("span", { class: "zona-cifra" }, "medir y calcular la estabilidad")),
    h(
      "div",
      { class: "fichas-ingenieria" },
      ficha("balance", "Prueba de balance", "El tel\xE9fono mide el periodo de balance y da el GM. Cada a\xF1o, avisa si la estabilidad ha bajado.", true),
      ficha("estabilidad", "Estabilidad ISO 12217-2", "Carenas, curva GZ, STIX y categor\xEDa de dise\xF1o del velero de referencia."),
      ficha("experiencia", "Experiencia de estabilidad", "P\xE9ndulos y tel\xE9fono a bordo: KG y rosca seg\xFAn el C\xF3digo IS 2008."),
      ficha("analisis", "An\xE1lisis de fallos", "AMFE y RCM de un velero: lo que ni el fabricante ni la inspecci\xF3n cubren.")
    ),
    h("p", { class: "sutil" }, "Para un barco concreto, \xE1bralo en \xABEmbarcaciones\xBB o en una inspecci\xF3n: la pesta\xF1a \xABIngenier\xEDa\xBB junta sus dimensiones, su estabilidad, su balance, sus par\xE1metros de proyecto y sus fallos.")
  );
}
function cifra2(valor2, texto, color) {
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
  const cuenta2 = contarAvisos(avisos);
  const seccion2 = (nivel, titulo) => {
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
    seccion2("urgente", "Urgente"),
    seccion2("atencion", "Por atender"),
    seccion2("info", "Para hoy"),
    h(
      "p",
      { class: "sutil" },
      `Los avisos salen de las inspecciones, los expedientes y la agenda: no hay que cerrarlos a mano. Desaparecen cuando se hace lo que piden. ${cuenta2.urgente + cuenta2.atencion + cuenta2.info} en total.`
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
  const lista3 = (titulo, grupo, clase = "") => grupo.length > 0 && h(
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
    lista3("Pasadas sin inspecci\xF3n", r.atrasadas, "atrasadas"),
    lista3("Hoy", r.hoy),
    lista3("Pr\xF3ximos siete d\xEDas", r.proximas),
    lista3("M\xE1s adelante", r.futuras),
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
        motivos.map((m2) => ({ valor: m2.clave, texto: m2.etiqueta })),
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
                (d.grupo === "consulta" ? [d.referencia, d.nota] : [
                  d.referencia,
                  d.derogadaPor !== void 0 ? `DEROGADA \u2014 sustituida por ${d.derogadaPor}` : void 0,
                  `${d.paginas} p\xE1gs.`,
                  d.url === "" ? d.externo !== void 0 ? "no se incluye: se abre en la web del fabricante" : "no se incluye en esta versi\xF3n (derechos del fabricante)" : tamano(d.bytes)
                ]).filter(Boolean).join(" \xB7 ")
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
    ...[...agrupados.entries()].map(([id, lista3]) => {
      const doc = porId.get(id);
      if (doc === void 0) return false;
      return h(
        "div",
        { class: "tarjeta" },
        h("h3", {}, doc.titulo, h("span", { class: "sutil" }, ` \xB7 ${b.porDocumento.get(id)}`)),
        h(
          "ul",
          { class: "fragmentos" },
          ...lista3.map(
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
var meses = (m2) => m2 === void 0 ? "\u2014" : m2 >= 1200 ? "nunca" : m2 < 1 ? "< 1 mes" : `${Math.round(m2)} meses`;
function matriz(cobertura) {
  const cuenta2 = (s, o) => cobertura.filter((c) => c.modo.severidad === s && c.modo.ocurrencia === o);
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
              const aqui = cuenta2(s, o);
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
      cifra3(String(r.total), "modos de fallo"),
      cifra3(String(r.porCriticidad.A), "cr\xEDticos (A)", "rojo"),
      cifra3(String(r.ocultos), "ocultos"),
      cifra3(`${r.cubiertosPorFabricante}/${r.relevantes}`, "A y B que cubre el fabricante"),
      cifra3(`${r.cubiertosPorNorma}/${r.relevantes}`, "que cubre el reconocimiento"),
      cifra3(String(r.huecos), "huecos: nadie los mira a tiempo", r.huecos > 0 ? "rojo" : "verde")
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
function cifra3(valor2, texto, color) {
  return h("div", { class: `cifra ${color ?? ""}` }, h("b", {}, valor2), h("span", {}, texto));
}

// src/main.ts
var CATALOGO_REGLAS = validarCatalogo(reglas_rd1434_default, "reglas-rd1434.json");
var CATALOGO_EQUIPO = validarCatalogoEquipo(equipo_rd339_default, "equipo-rd339.json");
var CATALOGO_RADIO = validarCatalogoEquipo(radio_rd1185_default, "radio-rd1185.json");
var CATALOGOS_EQUIPO = [CATALOGO_EQUIPO, CATALOGO_RADIO];
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
  filtroEmbarcaciones: "",
  guiaConAnalisis: false
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
  const fecha2 = datos?.fecha ?? hoy();
  const lugar = datos?.lugar ?? "";
  estado.inspeccion = {
    id: nuevoId("insp"),
    embarcacion,
    numeroInforme: FORMULARIO.prefijo_informe,
    identificacion: { banderaEspanola: true, win: "" },
    tipo: tipoNormativoDe(motivo),
    motivo,
    fecha: fecha2,
    lugar,
    inspector: estado.perfil.inspector,
    estado: "borrador",
    visitas: { v1: { clave: "v1", fecha: fecha2, lugar, condicion: "a_flote", refrendo: "" } },
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
async function responder(puntoId, resultado2) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  const previo = inspeccion.hallazgos[puntoId];
  const propuesta = proponerGravedad(puntoId);
  const hallazgo = {
    puntoId,
    visita: inspeccion.visitaActiva,
    resultado: resultado2,
    fotos: previo?.fotos ?? [],
    registradoEn: (/* @__PURE__ */ new Date()).toISOString(),
    ...previo?.observaciones !== void 0 ? { observaciones: previo.observaciones } : {},
    ...resultado2 === "no_conforme" ? {
      gravedad: previo?.gravedad ?? (propuesta.grave ? "grave" : "leve"),
      ...propuesta.letra !== void 0 ? { letraAnexoIII: propuesta.letra } : {}
    } : {}
  };
  estado.puntoAbierto = puntoId;
  inspeccion.hallazgos[puntoId] = hallazgo;
  inspeccion.registro.push({ ...hallazgo });
  repintarPunto(puntoId);
  if (resultado2 === "conforme" || resultado2 === "no_aplica") avanzarAlSiguiente(puntoId);
  await guardarInspeccion(inspeccion);
}
async function anotarDato(puntoId, campo2, valor2) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0 || inspeccion.estado !== "borrador") return;
  const datos = inspeccion.datosPunto[puntoId] ??= {};
  datos[campo2] = valor2;
  const definicion = CAMPOS.campos_por_punto[puntoId]?.find((c) => c.campo === campo2);
  const cambio = definicion !== void 0 ? cambioEnFicha(definicion, valor2) : void 0;
  if (cambio !== void 0) {
    inspeccion.embarcacion = { ...inspeccion.embarcacion, ...cambio };
  }
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
  repintarPunto(puntoId);
  if (estado.inspeccion !== void 0) await guardarInspeccion(estado.inspeccion);
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
var urlsDeFotos = /* @__PURE__ */ new Map();
async function urlDeFoto(clave) {
  const guardada = urlsDeFotos.get(clave);
  if (guardada !== void 0) return guardada;
  const blob = await leerFoto(clave);
  if (blob === void 0) return void 0;
  const url = URL.createObjectURL(blob);
  urlsDeFotos.set(clave, url);
  return url;
}
async function borrarFoto2(puntoId, clave) {
  const inspeccion = estado.inspeccion;
  const hallazgo = inspeccion?.hallazgos[puntoId];
  if (inspeccion === void 0 || hallazgo === void 0 || inspeccion.estado !== "borrador") return;
  estado.puntoAbierto = puntoId;
  hallazgo.fotos = hallazgo.fotos.filter((f) => f !== clave);
  const url = urlsDeFotos.get(clave);
  if (url !== void 0) {
    URL.revokeObjectURL(url);
    urlsDeFotos.delete(clave);
  }
  repintarPunto(puntoId);
  await borrarFoto(clave);
  await guardarInspeccion(inspeccion);
}
async function anadirFoto(puntoId, fichero) {
  const hallazgo = estado.inspeccion?.hallazgos[puntoId];
  if (hallazgo === void 0) return;
  estado.puntoAbierto = puntoId;
  hallazgo.fotos.push(await guardarFoto(fichero));
  repintarPunto(puntoId);
  if (estado.inspeccion !== void 0) await guardarInspeccion(estado.inspeccion);
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
async function fijarCaducidad(equipo, fecha2) {
  const matricula = estado.matricula;
  if (matricula === void 0) return;
  const expediente = await leerExpediente(matricula);
  if (fecha2 === "") delete expediente.caducidades[equipo];
  else expediente.caducidades[equipo] = fecha2;
  await guardarExpediente(expediente);
  await render();
}
function equiposConCaducidad() {
  const vistos = /* @__PURE__ */ new Map();
  for (const regla of CATALOGOS_EQUIPO.flatMap((c) => c.reglas)) {
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
  alDarDeBaja: (id, fecha2) => void cambiarExpediente((e) => {
    const c = e.componentes.find((x) => x.id === id);
    if (c !== void 0) c.baja = fecha2;
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
async function pantallaGuia(matricula) {
  const { compuesto } = await expedienteCompuesto(matricula);
  const firmada = compuesto.inspecciones.find(
    (i) => i.estado === "firmada_favorable" || i.estado === "firmada_desfavorable"
  );
  const guia = componerGuia(compuesto, firmada !== void 0 ? zonaActual(firmada) : void 0, hoy(), {
    incluirAnalisis: estado.guiaConAnalisis,
    tituloPunto: (codigo) => TITULO_PUNTO.get(codigo)
  });
  return h(
    "div",
    {},
    barra(
      "Gu\xEDa t\xE9cnica para el propietario",
      ...compuesto.analisis !== void 0 ? [
        h(
          "label",
          { class: "interruptor-guia" },
          h("input", {
            type: "checkbox",
            checked: estado.guiaConAnalisis,
            onchange: async (ev) => {
              estado.guiaConAnalisis = ev.target.checked;
              await render();
            }
          }),
          "Incluir mejoras del an\xE1lisis de fallos"
        )
      ] : [],
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
    h("div", { class: "contenido" }, pintarGuia(guia))
  );
}
var informeEstabilidad;
var calculandoEstabilidad = false;
function pantallaEstabilidad() {
  if (informeEstabilidad === void 0 && !calculandoEstabilidad) {
    calculandoEstabilidad = true;
    setTimeout(() => {
      informeEstabilidad = evaluarReferencia(5);
      calculandoEstabilidad = false;
      if (estado.pantalla === "estabilidad") void render();
    }, 30);
  }
  return h(
    "div",
    {},
    barra(
      "Estabilidad \xB7 UNE-EN ISO 12217-2",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = estado.matricula !== void 0 ? "expediente" : "inicio";
            await render();
          }
        },
        estado.matricula !== void 0 ? "Expediente" : "Inicio"
      )
    ),
    h(
      "div",
      { class: "contenido" },
      informeEstabilidad === void 0 ? h("p", { class: "sutil" }, "Calculando carenas, curva GZ y requisitos de la norma\u2026") : pintarInformeEstabilidad(informeEstabilidad)
    )
  );
}
var registroSuelto;
var midiendoTelefono;
var formasCache;
var formasReferenciaCache = () => formasCache ??= formasReferencia();
async function formasExperiencia() {
  if (estado.matricula !== void 0) {
    const e = await leerExpediente(estado.matricula);
    if (e.formas) {
      return { formas: { ...e.formas, cuerpos: [...e.formas.cuerpos ?? [], ...(e.apendices ?? []).map((a) => cuerpoAleta(a))] }, propias: true };
    }
  }
  return { formas: formasReferenciaCache(), propias: false };
}
function registroEnBlanco() {
  const plan = planOchoMovimientos(75, 1.6, 5, 2.1);
  return {
    densidad: 1025,
    pesos: plan.pesos.map((p) => ({ id: p.id, masa: p.masa, x: p.x, z: p.z })),
    pendulos: [{ nombre: "P\xE9ndulo 1", longitud: 1.8 }, { nombre: "P\xE9ndulo 2", longitud: 1.6 }],
    telefono: true,
    francobordos: [],
    estados: plan.estados.map((e) => ({ posiciones: { ...e }, deflexiones: [null, null], telefono: null }))
  };
}
function registroSimulado() {
  const mo = condicionesReferencia(1.196, 0.794).minimaOperacion;
  const plan = {
    ...planOchoMovimientos(75, 1.6, 5, 2.1),
    pendulos: [{ nombre: "P\xE9ndulo 1", longitud: 1.8 }, { nombre: "P\xE9ndulo 2", longitud: 1.6 }],
    inclinometro: true,
    francobordosEn: [0.5, 2.5, 4.5, 6.5, 8.5],
    densidad: 1025
  };
  const { datos } = simularExperiencia(formasReferenciaCache(), { masa: mo.masa, g: [mo.g[0], 0, mo.g[2]] }, plan);
  const pend = datos.instrumentos.filter((i) => i.tipo === "pendulo");
  const tel = datos.instrumentos.find((i) => i.tipo === "inclinometro");
  return {
    densidad: 1025,
    pesos: plan.pesos.map((p) => ({ id: p.id, masa: p.masa, x: p.x, z: p.z })),
    pendulos: plan.pendulos.map((p) => ({ ...p })),
    telefono: true,
    francobordos: datos.francobordos.map((l) => ({ ...l, francobordo: Math.round(l.francobordo * 200) / 200 })),
    estados: datos.estados.map((e, i) => ({
      posiciones: { ...e },
      deflexiones: pend.map((p) => Math.round(p.lecturas[i] * 1e3) / 1e3),
      telefono: tel ? { media: Math.round(tel.lecturas[i] * 100) / 100, desviacion: 0.05, muestras: 1200 } : null
    }))
  };
}
function datosDeRegistro(r) {
  const faltan = [];
  if (r.pesos.length === 0) faltan.push("pesos de prueba");
  if (r.pendulos.length === 0) faltan.push("al menos un p\xE9ndulo");
  if (r.francobordos.length < 3) faltan.push("francobordos (tres como m\xEDnimo)");
  if (r.estados.length < 3) faltan.push("movimientos");
  const huecos = r.estados.flatMap((e, i) => e.deflexiones.some((d) => d === null || d === void 0) ? [i] : []);
  if (huecos.length > 0) faltan.push(`deflexiones de los estados ${huecos.join(", ")}`);
  if (faltan.length > 0) return { faltan };
  const pendulos = r.pendulos.map((p, k) => ({ nombre: p.nombre, tipo: "pendulo", longitud: p.longitud, lecturas: r.estados.map((e) => e.deflexiones[k]) }));
  const conTelefono = r.telefono && r.estados.every((e) => e.telefono !== null);
  const telefono = conTelefono ? [{ nombre: "Tel\xE9fono", tipo: "inclinometro", lecturas: alinearSigno(r.estados.map((e) => e.telefono.media), pendulos[0].lecturas) }] : [];
  return {
    faltan,
    datos: {
      pesos: r.pesos.map((p) => ({ id: p.id, masa: p.masa })),
      estados: r.estados.map((e) => e.posiciones),
      instrumentos: [...pendulos, ...telefono],
      francobordos: r.francobordos,
      densidad: r.densidad
    }
  };
}
async function registroActual() {
  if (estado.matricula !== void 0) {
    const e = await leerExpediente(estado.matricula);
    return e.experiencia ?? (registroSuelto ??= registroEnBlanco());
  }
  return registroSuelto ??= registroEnBlanco();
}
async function guardarRegistro(r) {
  if (estado.matricula !== void 0) {
    await cambiarExpediente((e) => {
      e.experiencia = r;
    });
  } else {
    registroSuelto = r;
    await render();
  }
}
async function pantallaExperiencia() {
  const reg = await registroActual();
  const { faltan, datos } = datosDeRegistro(reg);
  const { formas, propias } = await formasExperiencia();
  let resultado2;
  let error;
  if (datos) {
    try {
      resultado2 = analizarExperiencia(formas, datos);
    } catch (e) {
      error = e.message;
    }
  }
  const acciones = {
    cambiar: (mutar) => {
      const copia = structuredClone(reg);
      mutar(copia);
      void guardarRegistro(copia);
    },
    medirTelefono: (i) => {
      midiendoTelefono = { estado: i, fraccion: 0, media: 0 };
      void render();
      let ultimo = 0;
      medirEscora(20, (fraccion, media) => {
        midiendoTelefono = { estado: i, fraccion, media };
        if (performance.now() - ultimo > 500) {
          ultimo = performance.now();
          void render();
        }
      }).then((lectura) => {
        midiendoTelefono = void 0;
        const copia = structuredClone(reg);
        copia.estados[i].telefono = lectura;
        void guardarRegistro(copia);
      }).catch((e) => {
        midiendoTelefono = void 0;
        alertaSuave(e.message);
        void render();
      });
    },
    cargarEjemplo: () => {
      registroSuelto = void 0;
      void guardarRegistro(registroSimulado());
    },
    vaciar: () => void guardarRegistro(registroEnBlanco())
  };
  return h(
    "div",
    {},
    barra(
      "Experiencia de estabilidad",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h("button", {
        onclick: async () => {
          estado.pantalla = estado.matricula !== void 0 ? "expediente" : "inicio";
          await render();
        }
      }, estado.matricula !== void 0 ? "Expediente" : "Inicio")
    ),
    h(
      "div",
      { class: "contenido" },
      error !== void 0 && h("p", { class: "salvedad" }, `\u26A0 ${error}`),
      pintarExperiencia(
        reg,
        resultado2,
        faltan,
        disponibilidad(),
        midiendoTelefono,
        acciones,
        propias ? `las de este barco (${formas.fuente})` : "las del velero de referencia: carga las de tu barco en el expediente, en \xABFormas del casco\xBB"
      )
    )
  );
}
var huellaSuelta = { medidas: [] };
var balanceElegido;
var registrandoBalance;
async function huellaActual() {
  if (estado.matricula !== void 0) return (await leerExpediente(estado.matricula)).balance ?? { medidas: [] };
  return huellaSuelta;
}
async function guardarHuella(hb) {
  if (estado.matricula !== void 0) await cambiarExpediente((e) => {
    e.balance = hb;
  });
  else {
    huellaSuelta = hb;
    await render();
  }
}
function pruebasSimuladas() {
  const k = 1.45, GM1 = 0.9, dKG = 60 * 6.1 / 9060;
  const k2 = Math.sqrt((9e3 * k * k + 60 * 6.1 ** 2) / 9060);
  const sim = (GM, rg, semilla) => simularBalance({
    gz: (phi) => GM * Math.sin(phi),
    radioGiro: rg,
    amortiguamiento: 0.06,
    escoraInicial: 4,
    duracion: 45,
    ruido: 0.3,
    oleaje: { amplitud: 0.3, periodo: 1.8 },
    semilla
  });
  const anio = Number(hoy().slice(0, 4));
  const condicion = "M\xEDnima operaci\xF3n: tanques al 50 %, dos personas en la ba\xF1era";
  return [
    {
      id: nuevoId("bal"),
      fecha: `${anio - 1}-09-20`,
      condicion,
      magnitud: "velocidad",
      muestras: sim(GM1, k, 41),
      simulada: true,
      referencia: { gm: GM1, errorGm: 0.01, origen: "experiencia de estabilidad simulada" }
    },
    { id: nuevoId("bal"), fecha: hoy(), condicion, magnitud: "velocidad", muestras: sim(GM1 - dKG, k2, 42), simulada: true }
  ];
}
async function pantallaBalance() {
  const hb = await huellaActual();
  const expediente = estado.matricula !== void 0 ? await leerExpediente(estado.matricula) : void 0;
  const { formas, propias } = await formasExperiencia();
  const dimF = dimensiones2(formas);
  const dimPorDefecto = { B: dimF.manga, Lwl: 0.87 * dimF.eslora, d: 0.22 * dimF.manga };
  const huella = analizarHuella(hb, dimPorDefecto);
  let gmExperiencia;
  if (expediente?.experiencia) {
    const { datos } = datosDeRegistro(expediente.experiencia);
    if (datos) {
      try {
        const r = analizarExperiencia(formas, datos);
        if (r.valida) gmExperiencia = { gm: r.gm, errorGm: Math.max(...r.instrumentos.map((i) => i.errorGm)), origen: "experiencia de estabilidad del expediente" };
      } catch {
      }
    }
  }
  const anadir = (m2) => {
    balanceElegido = m2.id;
    void guardarHuella({ ...hb, medidas: [...hb.medidas, m2] });
  };
  const acciones = {
    registrar: (segundos, condicion) => {
      registrandoBalance = { muestras: [], fraccion: 0 };
      void render();
      let ultimo = 0;
      registrarBalance(segundos, (m2, fraccion) => {
        registrandoBalance.muestras.push(m2);
        registrandoBalance.fraccion = fraccion;
        if (performance.now() - ultimo > 400) {
          ultimo = performance.now();
          void render();
        }
      }).then((r) => {
        registrandoBalance = void 0;
        anadir({ id: nuevoId("bal"), fecha: hoy(), condicion, magnitud: r.magnitud, muestras: r.muestras });
      }).catch((e) => {
        registrandoBalance = void 0;
        alertaSuave(e.message);
        void render();
      });
    },
    importar: (fichero, condicion) => {
      void fichero.text().then((t) => {
        try {
          const r = leerCsvBalance(t);
          anadir({ id: nuevoId("bal"), fecha: hoy(), condicion, magnitud: r.magnitud, muestras: r.muestras });
        } catch (e) {
          alertaSuave(e.message);
        }
      });
    },
    cargarSimuladas: () => {
      const s = pruebasSimuladas();
      balanceElegido = s[1].id;
      void guardarHuella({ ...hb, medidas: [...hb.medidas.filter((m2) => !m2.simulada), ...s] });
    },
    seleccionar: (id) => {
      balanceElegido = id;
      void render();
    },
    marcarReferencia: (id, ref) => void guardarHuella({
      ...hb,
      // Una sola referencia: marcar una desmarca las demás.
      medidas: hb.medidas.map((m2) => m2.id === id ? { ...m2, referencia: ref } : ref ? { ...m2, referencia: void 0 } : m2)
    }),
    borrar: (id) => void guardarHuella({ ...hb, medidas: hb.medidas.filter((m2) => m2.id !== id) }),
    cambiarDimensiones: (d) => void guardarHuella({ ...hb, dimensiones: d })
  };
  return h(
    "div",
    {},
    barra(
      "Prueba de balance",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h("button", {
        onclick: async () => {
          estado.pantalla = estado.matricula !== void 0 ? "expediente" : "inicio";
          await render();
        }
      }, estado.matricula !== void 0 ? "Expediente" : "Inicio")
    ),
    h(
      "div",
      { class: "contenido" },
      pintarBalance({
        nombreBarco: expediente?.matricula,
        enExpediente: expediente !== void 0,
        huella,
        seleccionada: balanceElegido,
        dim: hb.dimensiones ?? dimPorDefecto,
        dimOrigen: hb.dimensiones ? "las anotadas a mano" : propias ? `estimadas de las formas de este barco (${formas.fuente})` : "estimadas de las formas del velero de referencia",
        sensor: disponibilidad(),
        registrando: registrandoBalance,
        gmExperiencia
      }, acciones)
    )
  );
}
async function cargarFormas(fichero, escala2) {
  try {
    const texto = await fichero.text();
    const nombre = fichero.name.replace(/\.[^.]+$/, "");
    const esIges = /\.(igs|iges)$/i.test(fichero.name) || /^.{72}S\s*\d+\s*$/m.test(texto.slice(0, 400));
    const leidas = esIges ? formasDesdeIges(texto, { nombre }) : formasDesdeTabla(texto, nombre);
    const formas = escalarFormas(leidas, escala2);
    await cambiarExpediente((e) => {
      e.formas = formas;
    });
  } catch (e) {
    alertaSuave(`No se han podido leer las formas: ${e.message}`);
  }
}
var informeBarco;
var calculandoBarco = false;
async function pantallaIngenieria(matricula) {
  const { guardado, compuesto } = await expedienteCompuesto(matricula);
  const r = guardado.resumenEvaluacion;
  let huella;
  if (guardado.balance !== void 0 && guardado.balance.medidas.length > 0) {
    const mo = r?.condiciones.find((c) => c.nombre === "m\xEDnima operaci\xF3n");
    const dimF = guardado.formas ? dimensiones2(guardado.formas) : void 0;
    const dim = r !== void 0 && mo !== void 0 ? { B: r.bh, Lwl: mo.lwl, d: r.coeficientes?.tc ?? 0.22 * r.bh } : dimF !== void 0 ? { B: dimF.manga, Lwl: 0.87 * dimF.eslora, d: 0.22 * dimF.manga } : void 0;
    if (dim !== void 0) {
      try {
        huella = analizarHuella(guardado.balance, dim);
      } catch {
        huella = void 0;
      }
    }
  }
  const e = compuesto.embarcacion;
  const bloques = componerIngenieria({
    ...r !== void 0 ? { resumen: r } : {},
    tieneFormas: guardado.formas !== void 0,
    ...guardado.lastreKg !== void 0 ? { lastreKg: guardado.lastreKg } : {},
    ...huella !== void 0 ? { huella } : {},
    ...compuesto.analisis !== void 0 ? { analisis: compuesto.analisis } : {},
    ...e?.marcadoCE === true && e.categoriaDiseno !== void 0 ? { categoriaPlaca: e.categoriaDiseno } : {}
  });
  const ir2 = async (destino) => {
    estado.pantalla = destino === "formas" ? "expediente" : destino;
    await render();
    if (destino === "formas") document.getElementById("panel-formas")?.scrollIntoView({ block: "start" });
  };
  const enInspeccion = estado.inspeccion !== void 0 && estado.inspeccion.embarcacion.matricula.trim() === matricula;
  return h(
    "div",
    {},
    enInspeccion ? barra(estado.inspeccion.embarcacion.nombre || matricula) : barra(
      `Ingenier\xEDa \xB7 ${e?.nombre || matricula}`,
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h("button", { onclick: async () => {
        estado.pantalla = "expediente";
        await render();
      } }, "Expediente")
    ),
    enInspeccion && pestanas("ingenieria"),
    h(
      "div",
      { class: "contenido" },
      pintarIngenieria(bloques, guardado.lastreKg, {
        alIr: (d) => void ir2(d),
        alCambiarLastre: (kg2) => void cambiarExpediente((x) => {
          if (kg2 === void 0) delete x.lastreKg;
          else x.lastreKg = kg2;
        })
      })
    )
  );
}
async function pantallaEvaluar(matricula) {
  const e = await leerExpediente(matricula);
  const { formas } = await formasExperiencia();
  const d = e.datosEvaluacion ?? datosEvaluacionIniciales(e.formas ? dimensiones2(e.formas).eslora : 10);
  let exp;
  if (e.experiencia) {
    const { datos } = datosDeRegistro(e.experiencia);
    if (datos) {
      try {
        exp = analizarExperiencia(formas, datos);
      } catch {
        exp = void 0;
      }
    }
  }
  const entrada2 = () => {
    if (!e.formas) return "Este expediente no tiene formas del casco.";
    let rosca;
    if (d.origenRosca === "experiencia") {
      if (!exp || !e.experiencia) return "No hay experiencia de estabilidad calculada en este expediente.";
      const retirar = [
        ...e.experiencia.pesos.map((p) => ({ nombre: `Peso de prueba ${p.id}`, masa: p.masa, x: p.x, z: p.z })),
        ...d.aBordoEnLaPrueba
      ];
      const r = aRosca({ masa: exp.flotacion.desplazamiento, lcg: exp.lcg, kg: exp.kg }, retirar, []);
      rosca = { masa: r.masa, x: r.g[0], z: r.g[2], deExperiencia: true };
    } else {
      if (d.rosca.masa <= 0) return "Falta la masa en rosca.";
      rosca = { ...d.rosca, deExperiencia: false };
    }
    return {
      formas,
      rosca,
      personasMax: d.personasMax,
      puestoGobierno: d.puestoGobierno,
      pertrechos: d.pertrechos,
      carga: d.carga,
      tanques: d.tanques.map((t) => ({
        nombre: t.nombre,
        contenido: t.contenido,
        capacidad: t.capacidadL / 1e3,
        x: t.x,
        z: t.z,
        eslora: t.eslora,
        manga: t.manga,
        densidad: t.contenido === "combustible" ? 840 : t.contenido === "aceite" ? 900 : 1e3
      })),
      aparejo: d.aparejo,
      aberturas: d.aberturas.map((a) => ({ nombre: a.nombre, tipo: a.tipo, x: a.x, y: a.y, z: a.z, areaMm2: a.areaCm2 * 100 }))
    };
  };
  const guardar = (mutar) => {
    const copia = structuredClone(d);
    mutar(copia);
    informeBarco = void 0;
    void cambiarExpediente((x) => {
      x.datosEvaluacion = copia;
    });
  };
  const calcular = () => {
    const en = entrada2();
    if (typeof en === "string") {
      alertaSuave(en);
      return;
    }
    calculandoBarco = true;
    void render();
    setTimeout(() => {
      try {
        informeBarco = { matricula, informe: evaluarBarco(en, 5) };
      } catch (err) {
        alertaSuave(`No se ha podido evaluar: ${err.message}`);
      }
      calculandoBarco = false;
      if (estado.pantalla === "evaluar") void render();
    }, 30);
  };
  const informe = informeBarco?.matricula === matricula ? informeBarco.informe : void 0;
  return h(
    "div",
    {},
    barra(
      "Evaluar este barco \xB7 UNE-EN ISO 12217-2",
      h("button", { onclick: () => window.print() }, "Imprimir / PDF"),
      h("button", { onclick: async () => {
        estado.pantalla = "expediente";
        await render();
      } }, "Expediente")
    ),
    h(
      "div",
      { class: "contenido" },
      pintarDatosEvaluacion(d, exp ? { valida: exp.valida, masa: exp.flotacion.desplazamiento, kg: exp.kg, lcg: exp.lcg } : void 0, { cambiar: guardar, calcular }),
      calculandoBarco && h("p", { class: "sutil" }, "Calculando carenas, curvas GZ y requisitos de la norma\u2026"),
      informe && pintarInformeEstabilidad(informe, `${e.formas?.nombre ?? "Este barco"}: formas del expediente; rosca ${d.origenRosca === "experiencia" ? "medida en la experiencia de estabilidad" : "por c\xE1lculo de pesos"}.`),
      informe && h("button", {
        onclick: () => void cambiarExpediente((x) => {
          x.estabilidad = { categoria: informe.evaluacion.categoria ?? null, norma: NORMA_ESTABILIDAD, fecha: hoy(), preliminar: informe.preliminar };
          const en = entrada2();
          if (typeof en !== "string") {
            x.resumenEvaluacion = resumirInforme(informe, { fecha: hoy(), norma: NORMA_ESTABILIDAD, origenRosca: d.origenRosca, masaRosca: en.rosca.masa });
          }
        }).then(() => alertaSuave(`Anotada en el expediente: categor\xEDa ${informe.evaluacion.categoria ?? "ninguna"}${informe.preliminar ? " (preliminar)" : ""}.`))
      }, "Anotar el resultado en el expediente")
    )
  );
}
function alertaSuave(texto) {
  const aviso = document.createElement("div");
  aviso.className = "aviso-flotante";
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 6e3);
}
async function pantallaExpediente(matricula) {
  const { guardado, compuesto } = await expedienteCompuesto(matricula);
  const acciones = {
    alAnadirSuceso: (s) => void anadirSuceso(s),
    alBorrarSuceso: (id) => void borrarSuceso(id),
    alFijarCaducidad: (equipo, fecha2) => void fijarCaducidad(equipo, fecha2),
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
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "guia";
            await render();
          }
        },
        "Gu\xEDa t\xE9cnica"
      ),
      h(
        "button",
        {
          onclick: async () => {
            estado.pantalla = "ingenieria";
            await render();
          }
        },
        "Ingenier\xEDa"
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
      panelTemporada(
        compuesto,
        guardado.periodoComercial,
        (periodo) => void cambiarExpediente((e) => {
          if (periodo === void 0) delete e.periodoComercial;
          else e.periodoComercial = periodo;
        })
      ),
      panelFormas(guardado.formas, guardado.apendices ?? [], {
        alCargar: (fichero, escala2) => void cargarFormas(fichero, escala2),
        alQuitar: () => void cambiarExpediente((e) => {
          delete e.formas;
          delete e.apendices;
        }),
        alCambiarApendices: (lista3) => void cambiarExpediente((e) => {
          e.apendices = lista3;
        }),
        alEvaluar: () => {
          estado.pantalla = "evaluar";
          void render();
        },
        alCargarEjemplo: () => void cambiarExpediente((e) => {
          e.formas = formasCorbin39();
          e.apendices = [];
          e.datosEvaluacion = datosEvaluacionCorbin39();
        })
      }),
      panelEstabilidad(
        guardado.estabilidad,
        hoy(),
        (evaluacion) => void cambiarExpediente((e) => {
          if (evaluacion === void 0) delete e.estabilidad;
          else e.estabilidad = evaluacion;
        }),
        () => {
          estado.pantalla = "estabilidad";
          void render();
        },
        () => {
          estado.pantalla = "experiencia";
          void render();
        },
        () => {
          estado.pantalla = "balance";
          void render();
        }
      ),
      panelHistorico(compuesto.inspecciones, acciones)
    )
  );
}
function refrescarZona() {
  const inspeccion = estado.inspeccion;
  const anterior = document.querySelector(".tarjeta.zona");
  if (inspeccion === void 0 || anterior === null) return;
  anterior.replaceWith(panelZona(zonaActual(inspeccion), porCategoriaActual(inspeccion)));
}
function fichaDeCalculo(inspeccion) {
  const ficha = fichaSegunTemporada(inspeccion.embarcacion, estado.periodoComercial, inspeccion.fecha);
  return estado.estabilidad !== void 0 ? { ...ficha, estabilidad: estado.estabilidad } : ficha;
}
function porCategoriaActual(inspeccion) {
  return zonaPorCategoria(
    fichaDeCalculo(inspeccion),
    inspeccion.navegacionDiurna,
    inspeccion.inventario,
    CATALOGOS_EQUIPO,
    inspeccion.fecha
  );
}
function zonaActual(inspeccion) {
  return calcularZona(
    fichaDeCalculo(inspeccion),
    inspeccion.personasABordo,
    inspeccion.navegacionDiurna,
    inspeccion.inventario,
    CATALOGOS_EQUIPO,
    inspeccion.fecha
  );
}
function evaluacionActual(inspeccion) {
  return evaluar(fichaDeCalculo(inspeccion), [CATALOGO_REGLAS], inspeccion.fecha);
}
function guionActual(inspeccion) {
  return generarGuion(
    FORMULARIO,
    CATALOGO_ANEXO,
    CAMPOS.campos_por_punto,
    fichaDeCalculo(inspeccion),
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
    boton("acta", "Acta"),
    boton("ingenieria", "Ingenier\xEDa")
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
        CAMPOS.tipos_reconocimiento.map((m2) => ({ clave: m2.clave, etiqueta: m2.etiqueta })),
        estado.borradorCita,
        estado.resaltar?.replace(/^cita-/, ""),
        {
          alGuardarCita: (c) => void (async () => {
            estado.borradorCita = void 0;
            await guardarYPintar({ ...c, id: nuevoId("cita"), creadaEn: (/* @__PURE__ */ new Date()).toISOString(), estado: "pendiente" });
          })(),
          alEmpezar: (c) => void nuevaInspeccion(c),
          alCambiarFecha: (c, fecha2, hora) => {
            const { hora: _anterior, ...resto } = c;
            void guardarYPintar({ ...resto, fecha: fecha2, ...hora !== void 0 ? { hora } : {} });
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
  const lista3 = () => h(
    "ul",
    { class: "listado", id: "lista-embarcaciones" },
    ...barcosConocidos(t).filter((b) => texto === "" || normalizar(`${b.nombre} ${b.matricula}`).includes(normalizar(estado.filtroEmbarcaciones))).map(
      (b) => h(
        "li",
        { class: "embarcacion", onclick: () => void abrirExpediente(b.matricula) },
        h("div", {}, h("b", {}, b.nombre || "(sin nombre)")),
        h("div", { class: "sutil" }, `${b.matricula} \xB7 ${cuenta(porMatricula.get(b.matricula)?.inspecciones ?? 0, "inspecci\xF3n", "inspecciones")}`)
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
          document.getElementById("lista-embarcaciones")?.replaceWith(lista3());
        }
      }),
      t.expedientes.length === 0 && h("p", { class: "vacio" }, "Todav\xEDa no hay embarcaciones."),
      lista3()
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
      fichaDeCalculo(inspeccion).lista !== inspeccion.embarcacion.lista && h(
        "p",
        { class: "salvedad" },
        `\u26A0 Temporada comercial del ${estado.periodoComercial?.inicio} al ${estado.periodoComercial?.fin}: esta inspecci\xF3n se eval\xFAa con el r\xE9gimen de reconocimientos de la lista 6.\xAA y el equipo de fines comerciales (RD 186/2023, art. 9). La embarcaci\xF3n sigue inscrita en la 7.\xAA.`
      ),
      formularioEquipamiento(
        inspeccion.embarcacion,
        actualizar,
        equiposConRequisitosNuevos(CATALOGOS_EQUIPO)
      ),
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
var ACCIONES_GUION = {
  alResponder: (p, r) => void responder(p, r),
  alAbrirPunto: (p, abierto) => {
    estado.puntoAbierto = abierto ? p : void 0;
  },
  alObservar: (p, t) => void observar(p, t),
  alCambiarGravedad: (p, g) => void cambiarGravedad(p, g),
  alAnadirFoto: (p, f) => void anadirFoto(p, f),
  urlDeFoto: (clave) => urlDeFoto(clave),
  alBorrarFoto: (p, clave) => void borrarFoto2(p, clave),
  alAnotarDato: (p, c, v) => void anotarDato(p, c, v)
};
function repintarPunto(puntoId) {
  const inspeccion = estado.inspeccion;
  const nodo = document.querySelector(`[data-punto="${puntoId}"]`);
  if (inspeccion === void 0 || nodo === null) {
    void render();
    return;
  }
  const guion = guionActual(inspeccion);
  const punto2 = puntosDe(guion).find((p) => p.codigo === puntoId);
  if (punto2 === void 0) {
    void render();
    return;
  }
  nodo.replaceWith(
    pintarPunto(
      punto2,
      inspeccion.hallazgos[puntoId],
      inspeccion.datosPunto[puntoId] ?? {},
      inspeccion.registro.filter(
        (r) => r.puntoId === puntoId && r.visita !== inspeccion.visitaActiva
      ),
      ACCIONES_GUION,
      inspeccion.estado !== "borrador",
      estado.puntoAbierto === puntoId
    )
  );
  const avance = medirAvance(guion, inspeccion.hallazgos);
  const contador = document.querySelector(".barra .contador");
  if (contador !== null) contador.textContent = `${avance.respondidos}/${avance.total}`;
  const bloque2 = guion.bloques.find((b) => b.puntos.some((p) => p.codigo === puntoId));
  const contadorBloque = document.querySelector(
    `[data-bloque="${bloque2?.codigo ?? ""}"] .contador-bloque`
  );
  if (bloque2 !== void 0 && contadorBloque !== null) {
    contadorBloque.textContent = textoAvanceBloque(bloque2, inspeccion.hallazgos);
  }
}
function avanzarAlSiguiente(desde) {
  const inspeccion = estado.inspeccion;
  if (inspeccion === void 0) return;
  const siguiente = siguienteSinResponder(guionActual(inspeccion), inspeccion.hallazgos, desde);
  if (siguiente === void 0) return;
  estado.puntoAbierto = siguiente;
  repintarPunto(desde);
  repintarPunto(siguiente);
  document.querySelector(`[data-punto="${siguiente}"]`)?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
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
        (FORMULARIO.publica === true ? `Versi\xF3n p\xFAblica: guion del Anexo II del RD 1434/1999 (${FORMULARIO.version_formulario}). Los bloques 5 a 10 del Anexo II no detallan comprobaciones y quedan como un punto cada uno. ` : `Guion generado del formulario de inspecci\xF3n de la entidad colaboradora (v. ${FORMULARIO.version_formulario}), con la cita del Anexo II del RD 1434/1999 en cada punto. `) + `${guion.bloques.length} bloques, ${avance.total} puntos, ${guion.totalComprobaciones} comprobaciones.`
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
        ACCIONES_GUION,
        inspeccion.estado !== "borrador",
        estado.puntoAbierto
      )
    )
  );
}
function pantallaEquipo(inspeccion) {
  const soloLectura = inspeccion.estado !== "borrador";
  const zona2 = zonaActual(inspeccion);
  const zonaMostrada = zona2.zona ?? 7;
  const exigible = equipoExigible(
    fichaDeCalculo(inspeccion),
    {
      zona: zonaMostrada,
      personasABordo: inspeccion.personasABordo,
      navegacionDiurna: inspeccion.navegacionDiurna
    },
    CATALOGOS_EQUIPO,
    inspeccion.fecha
  );
  const lineas = inventarioContable(
    fichaDeCalculo(inspeccion),
    inspeccion.personasABordo,
    inspeccion.navegacionDiurna,
    zonaMostrada,
    CATALOGOS_EQUIPO,
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
      panelZona(zona2, porCategoriaActual(inspeccion)),
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
  const resultado2 = calcularResultado(inspeccion.hallazgos, inspeccion.fecha);
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
      panelResultado(resultado2, avance),
      !firmada && h(
        "div",
        { class: "tarjeta" },
        // RF-24: el art. 12 tipifica como infracción realizar el reconocimiento «de
        // modo incompleto». La aplicación no deja firmar con puntos sin responder.
        !avance.completo ? h(
          "p",
          { class: "salvedad" },
          `\u26A0 No se puede firmar el acta: ${avance.pendientes.length === 1 ? "queda" : "quedan"} ${cuenta(avance.pendientes.length, "punto")} sin responder. El art. 12 del RD 1434/1999 tipifica como infracci\xF3n realizar el reconocimiento de modo incompleto.`
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
              estado.inspeccion = firmar(inspeccion, resultado2);
              await persistir();
            }
          },
          "Firmar acta"
        )
      ),
      h("div", { class: "acta-marco" }, pintarActa(
        inspeccion,
        guion,
        resultado2,
        avance,
        zonaActual(inspeccion),
        CAMPOS,
        discrepancias(contrastesDe(inspeccion)),
        porCategoriaActual(inspeccion)
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
      catalogo: `${CATALOGO_RADIO.norma} \u2014 equipo radioel\xE9ctrico por zona`,
      nota: "El equipo de radio no lo regula el RD 339/2021 sino este reglamento, y la zona de navegaci\xF3n depende de los dos. Vaciados los art\xEDculos 56 a 60; el 61, de regatas, remite a lo que decida la Administraci\xF3n y no se formaliza.",
      reglas: CATALOGO_RADIO.reglas
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
  if (estado.pantalla === "guia" && estado.matricula !== void 0) {
    pintar(raiz, await pantallaGuia(estado.matricula));
    return;
  }
  if (estado.pantalla === "estabilidad") {
    pintar(raiz, pantallaEstabilidad());
    return;
  }
  if (estado.pantalla === "experiencia") {
    pintar(raiz, await pantallaExperiencia());
    return;
  }
  if (estado.pantalla === "balance") {
    pintar(raiz, await pantallaBalance());
    return;
  }
  if (estado.pantalla === "ingenieria") {
    const m2 = estado.matricula ?? estado.inspeccion?.embarcacion.matricula.trim();
    if (m2 !== void 0 && m2 !== "") {
      estado.matricula = m2;
      pintar(raiz, await pantallaIngenieria(m2));
      return;
    }
  }
  if (estado.pantalla === "evaluar" && estado.matricula !== void 0) {
    pintar(raiz, await pantallaEvaluar(estado.matricula));
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
  const expedienteAbierto = matricula === "" ? void 0 : await leerExpediente(matricula);
  estado.sucesosExpediente = expedienteAbierto?.sucesos ?? [];
  estado.periodoComercial = expedienteAbierto?.periodoComercial;
  estado.estabilidad = expedienteAbierto?.estabilidad;
  pintar(
    raiz,
    estado.pantalla === "ingenieria" ? h(
      "div",
      {},
      barra(inspeccion.embarcacion.nombre || "Ingenier\xEDa"),
      pestanas("ingenieria"),
      h("div", { class: "contenido" }, h("p", { class: "tarjeta" }, "Escribe la matr\xEDcula en la Ficha: la ingenier\xEDa es la del expediente de esa matr\xEDcula."))
    ) : estado.pantalla === "ficha" ? pantallaFicha(inspeccion) : estado.pantalla === "guion" ? pantallaGuion(inspeccion) : estado.pantalla === "equipo" ? pantallaEquipo(inspeccion) : pantallaActa(inspeccion)
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
