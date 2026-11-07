# El Culto de la Calabaza · Contexto completo del proyecto

> Documento de traspaso para continuar el trabajo en Claude Code. Resume todo lo decidido en la conversación de diseño (finales de octubre a 6 de noviembre de 2026): las cuatro dinámicas, su contenido final, la historia del diseño, la arquitectura técnica, lo que ya se descartó y lo que sigue pendiente.
>
> Sugerencia: copia este archivo a la raíz del repo como `CLAUDE.md` para que Claude Code lo lea automáticamente en cada sesión.

---

## 0. Prompt para iniciar la sesión en la terminal

Abre la terminal en la carpeta del repo clonado (`gil-sevilla21/culto-calabaza`) y pega:

```text
Hola. Vamos a seguir trabajando en "El Culto de la Calabaza", la app web de dinámicas para mi fiesta de Halloween / baby shower. Este repo se publica solo en Netlify (culto-calabaza.netlify.app) cada vez que hago push a main.

Antes de tocar nada:
1. Lee completo CLAUDE.md (o CONTEXTO-culto-calabaza.md) en la raíz del repo. Ahí está todo el contexto: dinámicas, reglas, decisiones de diseño, arquitectura con Firebase y lo que ya descartamos.
2. Revisa index.html, app.js, styles.css y data.js para ubicarte.
3. Respóndeme en español con un resumen de 5 líneas de cómo está armada la app y confirma que entendiste las reglas fijas (tema siempre claro, nada de personajes ni logos con copyright, no meter aún al bebé en la interfaz, una sola sala, sin mover equipos a mano).

Forma de trabajo:
- Haz cambios pequeños y enfocados; no reescribas archivos completos si no hace falta.
- Antes de cada commit, valida la sintaxis (node --check app.js data.js) y, si el cambio toca la conexión en vivo, pruébalo con el simulador de Firebase descrito en el documento.
- Usa mensajes de commit claros en español y haz push a main solo cuando te lo confirme.
- Si una decisión no está cubierta en el documento, pregúntame antes de asumir.

Cuando termines el resumen, espera mi primer cambio.
```

---

## 1. Qué es el proyecto

- **Evento:** fiesta de Halloween que también es baby shower. Hay una idea pendiente para incluir al bebé en la interfaz, pero el dueño (Gil) pidió **no meter nada del bebé todavía**; lo propondrá él cuando la interfaz esté más avanzada.
- **Qué hace la app:** corre en la compu del anfitrión, proyectada en pantalla grande, y concentra las 4 dinámicas de la fiesta. Los invitados se unen desde su celular escaneando un QR, escriben su nombre y quedan asignados a uno de 4 equipos. Votan desde el celular en 3 de las 4 dinámicas.
- **Nombre y concepto visual:** "El Culto de la Calabaza", estética macabra pero tierna inspirada en el tono de *Cult of the Lamb* (paleta y trazo), sin usar ningún personaje, logo, nombre ni elemento propiedad de ese juego.
- **Dónde vive:**
  - Sitio en vivo: `https://culto-calabaza.netlify.app` (público, sin contraseña; la protección de acceso de Netlify se desactivó).
  - Repo: `https://github.com/gil-sevilla21/culto-calabaza` (rama `main`; Netlify hace deploy automático en cada push, sin build: sitio estático).
  - Base de datos en tiempo real: Firebase Realtime Database, proyecto `calabaza-os`.
  - Documento banco de información (Claude Doc, escrito durante la conversación): "Fiesta de Halloween — Banco de dinámicas". Contiene reglas y contenido, pero **`data.js` es la fuente de verdad** del contenido final; el doc tiene algunas reglas viejas (por ejemplo, "un celular por equipo").
  - Existe además una versión antigua publicada como artefacto en claude.ai (un solo HTML). Ahí los celulares no pueden conectarse porque la página no puede llamar a servicios externos; se considera obsoleta.

---

## 2. Las cuatro dinámicas

Todas se juegan con los **mismos 4 equipos**. Nombres por defecto: Los Vampiros, Las Brujas, Los Zombis, Los Fantasmas (editables desde el botón "Equipos" de la app).

### 2.1 Dinámica 1 · 100 Monstruos Dijeron (carta I)

Versión Halloween de *100 Mexicanos Dijeron*.

- **Torneo:** Semifinal 1, Semifinal 2 y Gran Final. Los emparejamientos se sortean al inicio; el anfitrión elige en la app qué dos equipos juegan cada partido.
- **Cada juego:** 5 rondas con multiplicadores x1, x1, x2, x3, x4. Cada pregunta tiene exactamente 5 respuestas en el tablero. Gana el partido quien tenga más puntos tras la ronda 5; el ganador de la Gran Final es el campeón.
- **Cada ronda:** cara a cara (contesta primero quien toque el timbre; controla quien dé la respuesta más alta), jugar o pasar, turnos por integrante, 3 strikes, robo (el rival da una sola respuesta tras el tercer strike y se lleva la bolsa si atina), cierre revelando las respuestas que nadie dijo.
- **Juego limpio:** 5 segundos por turno (si no contesta, strike), si un compañero sopla es strike, el conductor decide equivalencias y su decisión es final. Desempate: pregunta extra de cara a cara entre capitanes.
- **En la app:** la maneja **solo el anfitrión** (sin celulares). Se revela cada respuesta con clic, botón de strike con X gigante y buzzer, "Bolsa = suma × multiplicador", botones para dar los puntos a cada equipo, indicador de control y aviso de quién pasa a la final o es campeón.
- **Respuestas del cierre:** "Revelar las que faltan" las muestra en color hueso y **no suman** (en `rev`, `true` = adivinada y `"c"` = revelada al cierre). Sólo las adivinadas cuentan para la bolsa.
- **Desempate:** si el partido acaba empatado, aparece `DESEMPATE` (data.js): "Algo que llevarías para pasar la noche en un cementerio" (Linterna 34 · Cobija 22 · Comida 18 · Celular 14 · Un amigo 12). No suma puntos; el anfitrión marca quién ganó (`g1.tie`).
- No se puede poner al mismo equipo en los dos lados: elegir al rival intercambia los lados.
- **Control y puntos automáticos (7-nov-2026), sin botones:** el anfitrión toca la **tarjeta de puntos** del equipo que ganó el cara a cara (`g1.rc["G-r"]`). Sin control no se abre ninguna respuesta ni cuenta el strike. Cada respuesta abierta suma de inmediato al equipo con control. Al **3er strike** el control pasa solo al rival ("Intenta robar"): si atina, el anfitrión abre esa respuesta (`g1.st["G-r"]`) y el rival se lleva toda la bolsa; si falla, el anfitrión marca **un strike más** y la bolsa se queda con quien contestó. La ronda se cierra con 5 adivinadas, con el robo resuelto o con "Revelar las que faltan"; después, lo que se abra no suma. Volver a tocar una respuesta la oculta (para corregir), y "Quitar strike" deshace el robo. Sin celulares.
- Se descartó la "Ronda Relámpago" y la sección de materiales y pendientes.

### 2.2 Dinámica 2 · Trivia del Terror Mexicano (carta II)

- **Formato:** tipo Kahoot, **por equipos**, 25 preguntas de opción múltiple con 3 opciones y una sola correcta. 30 segundos por pregunta.
- **Tema final:** 100% mexicano: true crime, leyendas, folclore mexica, ovnis y misterios de México. Se quitaron las preguntas de cine (irán en la dinámica de películas) y las internacionales.
- **Puntos:** respuesta correcta = `round(500 + 500 × segundosRestantes / 30)`, es decir, de 500 a 1000 según rapidez. Incorrecta o sin respuesta = 0.
- **Flujo:** pregunta → los equipos votan → "Revelar respuesta" → marcador → siguiente. Tras la pregunta 25, podio con top 3 de equipos; solo hay un equipo campeón. Empate en primer lugar: gana quien tenga más respuestas correctas.
- **Juego limpio:** prohibido buscar en internet (el equipo descubierto pierde los puntos de esa pregunta).
- **Pendiente:** varios datos son muy específicos y conviene verificarlos antes de la fiesta (la condena de 759 años, el rancho de Las Poquianchis, lo que ocupa hoy Lecumberri, etc.). Juan Gabriel: no se encontró fuente confiable sobre la crujía donde estuvo, por eso la pregunta es sobre los 18 meses en Lecumberri.

### 2.3 Dinámica 3 · Florida o Tamaulipas (carta III)

- **Formato:** el conductor lee una noticia extraña pero real sin decir dónde pasó; cada equipo vota "Florida" o "Tamaulipas". 10 noticias (5 y 5, intercaladas), cada una con fuente.
- **Puntos:** 1 por acierto. Empate en primer lugar: piedra, papel o tijera entre capitanes.
- Se evitaron noticias violentas (abundan las de Tamaulipas). Se probó la idea "México o Australia" y Gil decidió quedarse con Florida o Tamaulipas.
- En la app, al revelar aparece un sello con el lugar y la fuente.

### 2.4 Dinámica 4 · Adivina la Película (carta IV)

- **Formato final:** 15 películas de terror icónicas, de la más fácil a la más difícil. **Gil elige y prepara las escenas** (imágenes) por su cuenta; la app solo muestra la imagen.
- Se descartaron versiones intermedias: rondas de música, póster, imagen + frase, frases sueltas.
- **Opciones:** cada escena tiene 3 opciones (la correcta + 2 títulos de la misma lista), generadas con una semilla fija por escena (`movieOpts(i)`) y guardadas en el estado para que no cambien.
- **Imágenes:** se cargan en la compu del anfitrión desde la propia app (botón "Cargar las 15 imágenes", ordenadas por nombre de archivo: `01.jpg` … `15.jpg`) y se guardan en IndexedDB de ese navegador. Los celulares nunca ven la imagen, solo los botones.
- **Puntos:** 1 por acierto; al revelar se asignan solos según el voto del equipo.

---

## 3. Contenido final (copiado de `data.js`)

### Dinámica 1 · 100 Monstruos Dijeron (fuente: `MONSTRUOS` en data.js)

**Semifinal 1**

| Ronda | Pregunta | Respuestas (puntos) |
|---|---|---|
| 1 (x1) | Algo que le pedirías al diablo a cambio de tu alma | Dinero 38 · Fama 20 · Vida eterna 18 · Revivir a alguien 14 · Belleza 10 |
| 2 (x1) | Señales de que una casa está embrujada | Puertas que se abren solas 26 · Ruidos extraños 24 · Luces que parpadean 20 · Objetos que se mueven 16 · Sombras 14 |
| 3 (x2) | Cosas que necesita un sacerdote para hacer un exorcismo | Agua bendita 32 · Crucifijo 26 · Biblia 20 · Rosario 12 · Valor 10 |
| 4 (x3) | Un objeto que usarías como arma en un apocalipsis zombie | Bate 30 · Machete 25 · Sartén 18 · Pala 15 · Escoba 12 |
| 5 (x4) | Si escucho un ruido extraño en mi casa en la noche, yo… | Prendo la luz 26 · Me tapo con las cobijas 24 · Voy a ver qué es 20 · Pongo videos chistosos 18 · Agarro algo para defenderme 12 |

**Semifinal 2**

| Ronda | Pregunta | Respuestas (puntos) |
|---|---|---|
| 1 (x1) | Algo que haría un fantasma para asustarte | Aparecerse frente a ti 28 · Jalarte los pies 24 · Azotar puertas 20 · Susurrarte al oído 16 · Prender la tele 12 |
| 2 (x1) | Señales de que alguien está poseído | Cabeza que gira 30 · Voz diferente 25 · Hablar en otro idioma 18 · Subirse a las paredes 15 · Odiar los objetos religiosos 12 |
| 3 (x2) | Lugares en los que aterrizaría un platillo volador | En el campo 30 · En una granja 24 · En la Casa Blanca 18 · En el Zócalo 16 · En Teotihuacán 12 |
| 4 (x3) | ¿Qué harías para sacar a un espíritu maligno de tu casa? | Llamar a un sacerdote 30 · Echar agua bendita 24 · Hacer una limpia 20 · Mudarme 16 · Quemar salvia 10 |
| 5 (x4) | Algo que no deberías hacer si estuvieras en una película de terror | Separarte del grupo 30 · Bajar al sótano 24 · Preguntar “¿hay alguien ahí?” 18 · Jugar la ouija 15 · Esconderte en el clóset 13 |

**Gran Final**

| Ronda | Pregunta | Respuestas (puntos) |
|---|---|---|
| 1 (x1) | Señales de que tu vecino es vampiro | Nunca sale de día 32 · Está muy pálido 24 · No se refleja en el espejo 18 · Tiene colmillos 16 · Duerme en un ataúd 10 |
| 2 (x1) | Menciona un objeto que, si lo encuentras en una casa abandonada, seguro está maldito | Muñeca de porcelana 32 · Ouija 22 · Espejo antiguo 18 · Payaso de juguete 16 · Cuadro viejo 12 |
| 3 (x2) | Razones por las que un fantasma sigue en este mundo | Tiene asuntos pendientes 34 · Quiere venganza 24 · No sabe que está muerto 20 · Cuida a su familia 12 · Lo enterraron mal 10 |
| 4 (x3) | Formas de darte cuenta de que entraste a una secta | Te piden todo tu dinero 30 · Usan túnicas o se visten igual 24 · No te dejan salir 20 · Intercambio de parejas 14 · Te cambian el nombre 12 |
| 5 (x4) | ¿Qué personaje muere primero en una película de terror? | El negro 30 · El marihuano 24 · La chichona 20 · El incrédulo 15 · El que dice “ahorita vuelvo” 11 |

### Dinámica 2 · Trivia del Terror Mexicano (fuente: `TRIVIA`)

| # | Pregunta | Opciones | Correcta |
|---|---|---|---|
| 1 | ¿En qué tipo de lugar se aparece La Planchada? | A) Escuela · B) Hospital · C) Iglesia | B |
| 2 | Según la tradición mexica, ¿qué animal guía a las almas al inframundo? | A) Jaguar · B) Águila · C) Xoloitzcuintle | C |
| 3 | ¿Cómo se llamaba el inframundo mexica? | A) Mictlán · B) Tlalocan · C) Aztlán | A |
| 4 | ¿En qué ciudad está el Callejón del Beso? | A) Guanajuato · B) Puebla · C) Zacatecas | A |
| 5 | ¿En qué lugar está la Isla de las Muñecas? | A) Pátzcuaro · B) Xochimilco · C) Chapala | B |
| 6 | ¿A qué delito se dedicaba Daniel Arizmendi, “El Mochaorejas”? | A) Robo de bancos · B) Fraude · C) Secuestro | C |
| 7 | El Chupacabras se hizo famoso en México en los noventa, pero ¿dónde se reportó primero? | A) Estados Unidos · B) Puerto Rico · C) Chile | B |
| 8 | Antes de ser detenida, ¿a qué se dedicaba Juana Barraza, “La Mataviejitas”? | A) Enfermería · B) Lucha libre · C) Cocina | B |
| 9 | ¿En qué región de México se cuentan historias de los aluxes? | A) Península de Yucatán · B) Sierra Tarahumara · C) El Bajío | A |
| 10 | ¿Durante qué evento de 1991 muchos capitalinos dijeron haber grabado ovnis? | A) Un terremoto · B) Un partido del Mundial · C) Un eclipse total de sol | C |
| 11 | En algunas versiones, ¿a qué personaje histórico se asocia la leyenda de La Llorona? | A) La Malinche · B) Sor Juana · C) La Corregidora | A |
| 12 | ¿Con qué apodo se conoció a Santiago Meza López, que disolvía cuerpos en Tijuana? | A) El Químico · B) El Pozolero · C) El Carnicero | B |
| 13 | ¿En qué estado se ubica principalmente la Zona del Silencio? | A) Sonora · B) Durango · C) Baja California | B |
| 14 | ¿En qué ciudad está La Pascualita, el maniquí que según la leyenda es una novia embalsamada? | A) Monterrey · B) Puebla · C) Chihuahua | C |
| 15 | ¿En qué estado operaban las hermanas conocidas como “Las Poquianchis”? | A) Guanajuato · B) Jalisco · C) Michoacán | A |
| 16 | ¿En qué colonia de la CDMX está la famosa Casa de las Brujas? | A) Condesa · B) Roma · C) Coyoacán | B |
| 17 | En 2023, Jaime Maussan presentó ante el Congreso supuestos cuerpos extraterrestres. ¿De qué país dijo que provenían? | A) Chile · B) Perú · C) Bolivia | B |
| 18 | ¿Qué institución ocupa hoy el antiguo Palacio Negro de Lecumberri? | A) Archivo General de la Nación · B) Museo Nacional de Antropología · C) Senado de la República | A |
| 19 | ¿Cómo se llamaba el rancho donde operaban Las Poquianchis? | A) Rancho Las Ánimas · B) Rancho El Ángel · C) Rancho El Diablo | B |
| 20 | ¿En qué ciudad se descubrió en 1989 el caso de los “narcosatánicos” de Adolfo de Jesús Constanzo? | A) Tijuana · B) Ciudad Juárez · C) Matamoros | C |
| 21 | ¿Cuánto tiempo estuvo preso Juan Gabriel en Lecumberri? | A) 3 meses · B) 18 meses · C) 5 años | B |
| 22 | José Luis Calva, “el Caníbal de la Guerrero”, se presentaba como… | A) Chef · B) Escritor y poeta · C) Médico | B |
| 23 | ¿A qué se dedicó Gregorio “Goyo” Cárdenas, el Estrangulador de Tacuba, al salir de prisión? | A) Abogado · B) Sacerdote · C) Actor | A |
| 24 | ¿A cuántos años de prisión fue sentenciada “La Mataviejitas”? | A) 99 · B) 300 · C) 759 | C |
| 25 | Según la historia, ¿por qué Don Julián Santana empezó a colgar muñecas en su isla de Xochimilco? | A) Para calmar el espíritu de una niña ahogada · B) Por una promesa a la Virgen · C) Para atraer turistas | A |

### Dinámica 3 · Florida o Tamaulipas (fuente: `NOTICIAS`)

| # | Texto para leer | Respuesta | Lugar | Fuente |
|---|---|---|---|---|
| 1 | Durante una lluvia ligera, empezaron a caer peces pequeños del cielo en el patio de una escuela; Protección Civil lo confirmó. | Tamaulipas | Tampico | NPR |
| 2 | Un hombre fue arrestado por la Guardia Costera mientras intentaba cruzar el océano Atlántico hasta Londres corriendo dentro de una rueda gigante tipo hámster. | Florida | — | NPR |
| 3 | Se organizó la primera reunión de therians (personas que se identifican con un animal) de la ciudad; llegó más público a mirar que participantes: solo se presentó una joven. | Tamaulipas | Ciudad Victoria | Posta |
| 4 | Un joven pidió su bebida en el autoservicio de un restaurante de hamburguesas y, cuando le dieron la espalda, aventó un caimán vivo por la ventanilla. El juez le prohibió acercarse a esa cadena. | Florida | — | CBS News |
| 5 | Después de horas de beber, un hombre se metió a una jaula llena de cocodrilos para enfrentarlos, y salió ileso. | Tamaulipas | Tampico | Diario de Cuyo |
| 6 | El servicio meteorológico tuvo que advertir a la población que, por el frío, podrían caer iguanas de los árboles, pero que no estaban muertas. | Florida | Miami | NBC Miami |
| 7 | Una persona disfrazada de cocodrilo cruzó la calle a cuatro patas, y un transeúnte asustado le dio una patada. | Tamaulipas | Tampico | Posta |
| 8 | Atraparon una serpiente pitón de casi 5 metros que se había tragado entero un venado adulto de unos 35 kilos. | Florida | Everglades | ABC News |
| 9 | Las autoridades montaron un operativo de varios días para capturar a un tigre. | Tamaulipas | Reynosa | Milenio |
| 10 | La cámara del timbre de una casa captó a un caimán parado en dos patas, “tocando” la puerta; esperó un rato y luego se fue. | Florida | Lake Mary | Fox News |

### Dinámica 4 · Adivina la Película (fuente: `PELIS`, de más fácil a más difícil)

| # | Película | Año |
|---|---|---|
| 1 | El exorcista | 1973 |
| 2 | Scream | 1996 |
| 3 | Chucky, el muñeco diabólico | 1988 |
| 4 | Eso (It) | 2017 |
| 5 | El aro | 2002 |
| 6 | Psicosis | 1960 |
| 7 | El resplandor | 1980 |
| 8 | El conjuro | 2013 |
| 9 | Halloween | 1978 |
| 10 | Pesadilla en la calle del infierno | 1984 |
| 11 | El juego del miedo (Saw) | 2004 |
| 12 | ¡Huye! (Get Out) | 2017 |
| 13 | Viernes 13 | 1980 |
| 14 | La masacre de Texas | 1974 |
| 15 | El bebé de Rosemary | 1968 |


---

## 4. Historia del diseño y sistema visual actual

1. **v1 · "Calabaza OS" pixel art de los 80:** escritorio retro con íconos `.exe`, ventanas con barras rayadas y fuentes Silkscreen y VT323. A Gil le gustó, pero lo sintió "muy 8-bit".
2. **v2 · "Calabaza 98", estilo Windows 98 y GeoCities** (referencia: elgranformateo.com): **descartada**; Gil pidió volver a la v1.
3. **v1 + fondo de cementerio pixelado:** aprobado como paso intermedio.
4. **v3 actual · "El Culto de la Calabaza"**, inspirada en el tono de *Cult of the Lamb*:
   - **Paleta clara (regla fija: nunca temas oscuros):** pergamino `#F3E6CF`, papel `#FBF3E4`, hueso `#E9D8B8`, tinta `#1E1416`, rojo sangre `#C8102E` / `#8E0B1F`, oro `#D9A441`, musgo `#4E8B4A`, ciruela `#7A3E8E`.
   - **Colores de equipo:** `--t0 #E0453A`, `--t1 #5E9E52`, `--t2 #9A63B5`, `--t3 #E3A52B`, con tintes claros `--tint0..3`.
   - **Tipografía:** Pirata One (títulos góticos) y Fredoka (texto de juego, redondo y legible), ambas de Google Fonts.
   - **Trazo dibujado a mano:** bordes de tinta gruesos y radios irregulares (`--hand` y `--hand2`), sombras desplazadas en tinta.
   - **Escritorio:** gran círculo ritual de fondo (runas, velas, ojo al centro) dibujado en SVG por `drawRitual()`. Las 4 dinámicas son **cartas de tarot** (I a IV) con ilustraciones SVG originales (`ART`): calabaza con ojos tachados, calavera tierna, cocodrilo y ojo en claqueta. Se abren con **un clic**.
   - **Arranque:** el círculo ritual se dibuja solo y se encienden velas, con mensajes como "La congregación se reúne…". Solo aparece una vez por sesión.
   - **Ventanas:** pergamino con barra de título roja y fuente gótica, botón ✕ redondo, arrastrables y maximizables.
   - **Strike:** X roja de pincel gigante. **Marcador:** tarjetas con velita.
   - **Cursor:** manita de adivina (dedo índice con uña roja, anillo dorado y puño de manga rojo), SVG en data URI con punto activo en la punta del dedo (13, 2), aplicada a `body` y a los elementos interactivos.
   - **Sonidos:** sintetizados con WebAudio (`SFX`), con interruptor "Sonido" en la barra superior.
5. **Restricciones de propiedad intelectual:** nada de personajes, logos, nombres ni tipografías del juego de referencia. Todo es original.

**Código muerto:** se borró el 7 de noviembre de 2026: lo del diseño pixelado (`PAL`, `pixels`, `DOC`, `SYM`, `docWith`, `BIG_PUMPKIN`, `drawGraveyard`), `NET.move()` (mover gente de equipo, prohibido por las reglas), las constantes `RED2`/`BONE` y las clases CSS `.card .corner`, `.hits` y `.code`.

---

## 5. Arquitectura técnica

### 5.1 Archivos del repo

| Archivo | Qué contiene |
|---|---|
| `index.html` | Estructura: arranque, barra superior (Celulares, Equipos, Pantalla completa, Sonido, reloj), círculo ritual y escritorio. Carga Google Fonts, `qrcode-generator` 1.4.4 desde cdnjs, Firebase compat 10.12.2 desde gstatic, `data.js` y `app.js`. |
| `styles.css` | Todo el diseño, incluido el modo jugador (`body.player`). |
| `data.js` | Contenido de las 4 dinámicas: `MONSTRUOS`, `MULT`, `TRIVIA`, `TRIVIA_SECS = 30`, `NOTICIAS`, `PELIS`. |
| `app.js` | Lógica completa: estado, ventanas, las 4 dinámicas (`R1` a `R4`), panel de equipos (`RT`), panel de celulares (`RN`), conexión en vivo (`NET`) y modo jugador (`startPlayer`). |

Son scripts clásicos sin módulos ni build: las constantes de nivel superior de `data.js` son globales y `app.js` las usa directamente.

### 5.2 Estado local del anfitrión

- `localStorage["calabazaOS.v1"]` guarda equipos, sonido y el progreso de cada dinámica (`g1` a `g4`): rondas reveladas, strikes y puntos; pregunta actual, fase, respuestas y marcador; votos y revelados; opciones de películas, respuestas y aciertos.
- `localStorage["calabazaRoom"]` guarda el código de la **única sala** (4 letras).
- `sessionStorage["calabazaBoot"]` evita repetir la animación de arranque.
- IndexedDB `calabazaOS` (store `img`, llaves `p0` a `p14`) guarda las imágenes de las películas como data URLs.
- Cada dinámica tiene su botón "Reiniciar" con confirmación.

### 5.3 Firebase Realtime Database

```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDnmCeGek6Bg52DwiO5jPXMhq58Yecl9k4",
  authDomain: "calabaza-os.firebaseapp.com",
  databaseURL: "https://calabaza-os-default-rtdb.firebaseio.com",
  projectId: "calabaza-os",
  storageBucket: "calabaza-os.firebasestorage.app",
  messagingSenderId: "878886923884",
  appId: "1:878886923884:web:115bb517cff6bfa24ab249"
};
```

- La `apiKey` de Firebase web no es secreta.
- La base se creó el **5 de noviembre de 2026 en modo de prueba**: las reglas abiertas **vencen ~30 días después (alrededor del 5 de diciembre de 2026)**. Si la fiesta es después, o para endurecerlo, hay que escribir reglas que limiten lectura y escritura a `rooms/`.
- Se eligió Firebase porque Gil ya no tenía proyectos gratuitos en Supabase.

**Estructura de datos:**

```text
rooms/{CODE}/
  teams:   ["Los Vampiros", "Las Brujas", "Los Zombis", "Los Fantasmas"]   // las publica el anfitrión
  state:   { mode: "idle" }
         | { mode: "q", seq, open, kind: "abc"|"ft", prompt, opts?, reveal?, at }
  players/{pid}: { name, team: 0..3, online: bool, at }
  answers/{seq}/{pid}: { c }        // c = 0|1|2 en "abc", "F"|"T" en "ft"
```

### 5.4 Flujo del anfitrión (objeto `NET`)

- `NET.init()` inicializa Firebase si cargó y observa `.info/connected` (puntito verde junto al botón "Celulares").
- `NET.host()` abre o crea la sala, publica los nombres de equipo, pone el estado en `idle` y escucha `players`. Los registros **sin nombre** se borran solos (limpieza de "fantasmas").
- `NET.open(key, payload)` abre una votación con un `seq` nuevo y escucha `answers/{seq}`. Lo llaman R2 (por pregunta), R3 (por noticia no revelada) y R4 (por escena no revelada). Si ya está abierta con la misma llave, no hace nada.
- `NET.lock()` cierra al acabarse el tiempo de la trivia; `NET.reveal(x)` cierra y publica la respuesta correcta; `NET.idle()` regresa a los celulares a "Esperando al anfitrión" (al cambiar de fase o cerrar una ventana de juego).
- **Voto por mayoría:** cada jugador vota; `NET.apply()` calcula por equipo la opción más votada (empate: la votada más rápido) y la escribe en el estado del juego como si fuera la respuesta del equipo. En la trivia "más rápido" = mayor tiempo restante al llegar al anfitrión; en Florida o Tamaulipas y Películas = hora de llegada.
- **Recarga a media votación:** `NET.open` guarda `{key, seq}` en `localStorage["calabazaVote"]`; al recargar, `NET.host()` retoma esa votación si sigue abierta y sin revelar, en vez de mandar a todos a "Esperando".
- **Podios:** la trivia desempata por más respuestas correctas; si sigue el empate, o en Florida o Tamaulipas y Películas, el podio anuncia el empate (piedra, papel o tijera entre capitanes).
- **Privacidad en pantalla grande:** antes de revelar, solo se muestra "Respondió · n/m votos" por equipo, nunca la letra elegida (clases `.answers.hide` y `.ans.got`).
- **Respaldo manual:** los botones A/B/C (o Florida/Tamaulipas) por equipo siguen en pantalla por si falla un celular.
- `NET.kick(pid)` borra a un jugador; `NET.resetPlayers()` borra a todos; `NET.shuffle()` rebaraja a todos al azar en equipos equilibrados. `NET.assign()` es un respaldo que asigna equipo a quien no tenga.

### 5.5 Panel "Celulares" (`RN`)

- Muestra el QR (URL = `origin + pathname + "#jugar-" + CODE`), el estado de conexión, el título "Escanea, escribe tu nombre y únete" y los 4 equipos con sus integrantes.
- Cada nombre es un chip con ✕ para **quitar** a esa persona (con confirmación); su celular regresa solo a la pantalla del nombre.
- Botones: **Rebarajar equipos**, **Reiniciar equipos** (borra a todos) y **Listo**.
- **Gil pidió quitar a propósito:** la línea "Sala XXXX · n jugadores", la nota con la liga, el botón "Crear sala nueva" (solo habrá una sala) y la opción de mover integrantes de equipo con clic. **No reintroducir.**

### 5.6 Modo jugador (celular), `startPlayer()`

- Se activa si el hash coincide con `^#jugar-[A-Z]{4}$`. Agrega `body.player` y oculta todo lo demás.
- **Pantalla de nombre:** el campo viene lleno con un **nombre sugerido temático** (`spookyName()`: sustantivo masculino o femenino + adjetivo concordado; más de 600 combinaciones de máximo 28 caracteres, como "Lechuza de Medianoche" o "Hombre Lobo Dormilón"). Botón "🎲 Sugerir otro nombre"; al enfocar el campo se selecciona todo para escribir encima. Máximo 30 caracteres.
- **Unirse:** el **propio celular** lee los jugadores, elige al azar entre los equipos con menos integrantes y crea `players/{pid}` con `{name, team, online, at}` en una sola escritura. Así funciona aunque la página del anfitrión esté cerrada. 1.2 s después revisa: si por uniones simultáneas su equipo quedó 2 o más arriba del más chico y él es el último en llegar (empate de `at` → mayor `pid`), se cambia solo antes de ver su equipo. Gil **no quiere** asignaciones manuales ni una pantalla de "el anfitrión te está acomodando".
- El `pid` se guarda en `localStorage["calabazaPid-" + CODE]`, así que recargar no hace perder el lugar.
- **Presencia:** al conectarse marca `online: true` solo si el registro existe con nombre, y deja un `onDisconnect().update({online:false})`. Si el registro desaparece (lo quitaron o reiniciaron), el celular olvida su `pid` y vuelve a la pantalla de nombre.
- **Pantallas:** "Esperando al anfitrión…" con vela animada; votación con botones grandes (A/B/C en rojo, ciruela y musgo, o Florida en azul y Tamaulipas en rojo); el voto se puede cambiar mientras siga abierto; al revelar muestra "¡Correcto!", "Fallaste…" o "Sin respuesta". Vibración corta al votar. Enlace "Salir de la sala".

---

## 6. Decisiones fijas (no cambiar sin preguntar)

- Tema **siempre claro** en apps y artefactos; nunca modo oscuro.
- Nada de personajes, logos ni nombres con derechos de autor (Cult of the Lamb, películas, etc.) en la interfaz. Los títulos de películas solo como texto de respuesta.
- El bebé **todavía no** aparece en la interfaz.
- **Una sola sala.** Sin "Crear sala nueva".
- **Equipos automáticos y equilibrados**; el anfitrión no mueve gente a mano, solo puede quitar personas, rebarajar o reiniciar equipos.
- En 100 Monstruos Dijeron el anfitrión controla todo (sin celulares).
- Trivia, Florida o Tamaulipas y Adivina la Película se votan desde el celular, con voto por mayoría por equipo.
- La pantalla grande no revela qué votó cada equipo antes del "Revelar".

---

## 7. Pendientes e ideas

- **Elemento del bebé:** Gil tiene una idea que propondrá cuando la interfaz avance más; no inventar nada por adelantado. Una sugerencia anterior fue una mascota original como "el pequeño elegido", pero quedó en espera.
- **Reglas de seguridad de Firebase** antes de que venza el modo de prueba (alrededor del 5 de diciembre de 2026).
- **Verificar datos** finos de la trivia antes de la fiesta.
- **Cargar las 15 imágenes** de películas en la compu y el navegador que se usarán en la fiesta, desde la URL de Netlify.
- **Actualizar el Claude Doc** con las reglas actuales (equipos por QR, voto por mayoría, 25 preguntas, opciones en películas).
- Los nombres de equipo se publican a los celulares mientras se escriben (también si se cierra "Equipos" con ✕).

---

## 8. Cómo probar sin Firebase real

Durante el desarrollo se usó un simulador de Firebase en memoria que sincroniza varias pestañas del mismo navegador con `BroadcastChannel`. Implementa lo que usa la app: `ref`, `child`, `set`, `update`, `remove`, `on` (`value`, `child_added`, `child_changed`), `off`, `once`, `onDisconnect` y `ServerValue.TIMESTAMP`.

1. Copia la app a una carpeta de prueba y crea `test.html` igual a `index.html`, pero reemplaza las dos etiquetas `<script>` de gstatic por `<script src="mockfb.js"></script>`.
2. Sírvela con `python3 -m http.server`.
3. Abre `test.html` como anfitrión y `test.html#jugar-XXXX` en otras pestañas, usando el código que muestra el panel Celulares.
4. Con Playwright, cada pestaña de "celular" necesita borrar `calabazaPid-*` de `localStorage` antes de cargar, porque comparten almacenamiento.

Limitación: el QR no se genera sin internet porque la librería viene de cdnjs.

```js
// mockfb.js
(function(){
 const bc=new BroadcastChannel("mockfb"); let tree={}; const L=[];
 const get=(p)=>p.split("/").filter(Boolean).reduce((o,k)=>o==null?undefined:o[k],tree);
 function setP(p,v){ const ks=p.split("/").filter(Boolean); if(!ks.length){tree=v||{};return;} let o=tree; ks.slice(0,-1).forEach(k=>{ if(typeof o[k]!=="object"||o[k]===null) o[k]={}; o=o[k]; }); if(v===null||v===undefined) delete o[ks.at(-1)]; else o[ks.at(-1)]=JSON.parse(JSON.stringify(v)); }
 const fix=v=>JSON.parse(JSON.stringify(v,(k,x)=>x&&x[".sv"]?Date.now():x));
 function apply(op){ if(op.t==="set") setP(op.p,op.v); if(op.t==="update") Object.entries(op.v).forEach(([k,x])=>setP(op.p+"/"+k,x)); fire(); }
 bc.onmessage=e=>{ const d=e.data; if(d.t==="sync?"){ bc.postMessage({t:"tree",v:tree}); return; } if(d.t==="tree"){ if(!Object.keys(tree).length){ tree=d.v||{}; fire(); } return; } apply(d); };
 bc.postMessage({t:"sync?"});
 function doOp(op){ op.v=op.v===undefined?null:fix(op.v); apply(op); bc.postMessage(op); }
 let prev={};
 function fire(){ L.forEach(l=>{ const v=get(l.p);
   if(l.ev==="value"){ const s=JSON.stringify(v); if(s!==l.last){ l.last=s; l.cb(snap(l.p,v)); } }
   else { const cur=v||{}; const old=l.seen||{}; Object.keys(cur).forEach(k=>{ const s=JSON.stringify(cur[k]); if(!(k in old)){ if(l.ev==="child_added") l.cb(snap(l.p+"/"+k,cur[k])); } else if(old[k]!==s && l.ev==="child_changed") l.cb(snap(l.p+"/"+k,cur[k])); }); l.seen=Object.fromEntries(Object.entries(cur).map(([k,x])=>[k,JSON.stringify(x)])); } }); }
 const snap=(p,v)=>({key:p.split("/").filter(Boolean).at(-1),val:()=>v===undefined?null:JSON.parse(JSON.stringify(v))});
 function ref(p){ p=p.replace(/^\/+/,""); return {
   child:c=>ref(p+"/"+c), set:v=>{doOp({t:"set",p,v}); return Promise.resolve();}, update:v=>{doOp({t:"update",p,v}); return Promise.resolve();}, remove:()=>{doOp({t:"set",p,v:null}); return Promise.resolve();},
   on(ev,cb){ if(p===".info/connected"){ setTimeout(()=>cb(snap(p,true)),50); return; } const l={p,ev,cb}; L.push(l); setTimeout(fire,0); },
   off(){ for(let i=L.length-1;i>=0;i--) if(L[i].p===p) L.splice(i,1); },
   onDisconnect(){ return {remove(){},set(){},update(){},cancel(){}}; },
   once(ev){ return Promise.resolve(snap(p,get(p))); } }; }
 window.firebase={initializeApp(){}, database:Object.assign(()=>({ref}),{ServerValue:{TIMESTAMP:{".sv":"timestamp"}}})};
})();

```

---

## 9. Cómo publicar

- Haz push a `main` y Netlify publica en menos de un minuto. La URL y el QR no cambian; el progreso, los equipos y las imágenes guardadas en la compu del anfitrión se conservan.
- Si cambias algo que afecte a los jugadores ya unidos, puede convenir usar **Reiniciar equipos** desde el panel Celulares para limpiar registros viejos.
