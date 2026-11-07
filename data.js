/* ===================== DATOS ===================== */
const MONSTRUOS = [
 {name:"Semifinal 1", rounds:[
  {q:"Algo que le pedirías al diablo a cambio de tu alma", a:[["Dinero",38],["Fama",20],["Vida eterna",18],["Revivir a alguien",14],["Belleza",10]]},
  {q:"Señales de que una casa está embrujada", a:[["Puertas que se abren solas",26],["Ruidos extraños",24],["Luces que parpadean",20],["Objetos que se mueven",16],["Sombras",14]]},
  {q:"Cosas que necesita un sacerdote para hacer un exorcismo", a:[["Agua bendita",32],["Crucifijo",26],["Biblia",20],["Rosario",12],["Valor",10]]},
  {q:"Un objeto que usarías como arma en un apocalipsis zombie", a:[["Bate",30],["Machete",25],["Sartén",18],["Pala",15],["Escoba",12]]},
  {q:"Si escucho un ruido extraño en mi casa en la noche, yo…", a:[["Prendo la luz",26],["Me tapo con las cobijas",24],["Voy a ver qué es",20],["Pongo videos chistosos",18],["Agarro algo para defenderme",12]]}
 ]},
 {name:"Semifinal 2", rounds:[
  {q:"Algo que haría un fantasma para asustarte", a:[["Aparecerse frente a ti",28],["Jalarte los pies",24],["Azotar puertas",20],["Susurrarte al oído",16],["Prender la tele",12]]},
  {q:"Señales de que alguien está poseído", a:[["Cabeza que gira",30],["Voz diferente",25],["Hablar en otro idioma",18],["Subirse a las paredes",15],["Odiar los objetos religiosos",12]]},
  {q:"Lugares en los que aterrizaría un platillo volador", a:[["En el campo",30],["En una granja",24],["En la Casa Blanca",18],["En el Zócalo",16],["En Teotihuacán",12]]},
  {q:"¿Qué harías para sacar a un espíritu maligno de tu casa?", a:[["Llamar a un sacerdote",30],["Echar agua bendita",24],["Hacer una limpia",20],["Mudarme",16],["Quemar salvia",10]]},
  {q:"Algo que no deberías hacer si estuvieras en una película de terror", a:[["Separarte del grupo",30],["Bajar al sótano",24],["Preguntar “¿hay alguien ahí?”",18],["Jugar la ouija",15],["Esconderte en el clóset",13]]}
 ]},
 {name:"Gran Final", rounds:[
  {q:"Señales de que tu vecino es vampiro", a:[["Nunca sale de día",32],["Está muy pálido",24],["No se refleja en el espejo",18],["Tiene colmillos",16],["Duerme en un ataúd",10]]},
  {q:"Menciona un objeto que, si lo encuentras en una casa abandonada, seguro está maldito", a:[["Muñeca de porcelana",32],["Ouija",22],["Espejo antiguo",18],["Payaso de juguete",16],["Cuadro viejo",12]]},
  {q:"Razones por las que un fantasma sigue en este mundo", a:[["Tiene asuntos pendientes",34],["Quiere venganza",24],["No sabe que está muerto",20],["Cuida a su familia",12],["Lo enterraron mal",10]]},
  {q:"Formas de darte cuenta de que entraste a una secta", a:[["Te piden todo tu dinero",30],["Usan túnicas o se visten igual",24],["No te dejan salir",20],["Intercambio de parejas",14],["Te cambian el nombre",12]]},
  {q:"¿Qué personaje muere primero en una película de terror?", a:[["El negro",30],["El marihuano",24],["La chichona",20],["El incrédulo",15],["El que dice “ahorita vuelvo”",11]]}
 ]}
];
const MULT=[1,1,2,3,4];
/* desempate de 100 Monstruos: cara a cara entre capitanes, gana quien dé la respuesta más alta (no suma puntos) */
const DESEMPATE={q:"Algo que llevarías para pasar la noche en un cementerio", a:[["Linterna",34],["Cobija",22],["Comida",18],["Celular",14],["Un amigo",12]]};

const TRIVIA = [
 ["¿En qué tipo de lugar se aparece La Planchada?",["Escuela","Hospital","Iglesia"],1],
 ["Según la tradición mexica, ¿qué animal guía a las almas al inframundo?",["Jaguar","Águila","Xoloitzcuintle"],2],
 ["¿Cómo se llamaba el inframundo mexica?",["Mictlán","Tlalocan","Aztlán"],0],
 ["¿En qué ciudad está el Callejón del Beso?",["Guanajuato","Puebla","Zacatecas"],0],
 ["¿En qué lugar está la Isla de las Muñecas?",["Pátzcuaro","Xochimilco","Chapala"],1],
 ["¿A qué delito se dedicaba Daniel Arizmendi, “El Mochaorejas”?",["Robo de bancos","Fraude","Secuestro"],2],
 ["El Chupacabras se hizo famoso en México en los noventa, pero ¿dónde se reportó primero?",["Estados Unidos","Puerto Rico","Chile"],1],
 ["Antes de ser detenida, ¿a qué se dedicaba Juana Barraza, “La Mataviejitas”?",["Enfermería","Lucha libre","Cocina"],1],
 ["¿En qué región de México se cuentan historias de los aluxes?",["Península de Yucatán","Sierra Tarahumara","El Bajío"],0],
 ["¿Durante qué evento de 1991 muchos capitalinos dijeron haber grabado ovnis?",["Un terremoto","Un partido del Mundial","Un eclipse total de sol"],2],
 ["En algunas versiones, ¿a qué personaje histórico se asocia la leyenda de La Llorona?",["La Malinche","Sor Juana","La Corregidora"],0],
 ["¿Con qué apodo se conoció a Santiago Meza López, que disolvía cuerpos en Tijuana?",["El Químico","El Pozolero","El Carnicero"],1],
 ["¿En qué estado se ubica principalmente la Zona del Silencio?",["Sonora","Durango","Baja California"],1],
 ["¿En qué ciudad está La Pascualita, el maniquí que según la leyenda es una novia embalsamada?",["Monterrey","Puebla","Chihuahua"],2],
 ["¿En qué estado operaban las hermanas conocidas como “Las Poquianchis”?",["Guanajuato","Jalisco","Michoacán"],0],
 ["¿En qué colonia de la CDMX está la famosa Casa de las Brujas?",["Condesa","Roma","Coyoacán"],1],
 ["En 2023, Jaime Maussan presentó ante el Congreso supuestos cuerpos extraterrestres. ¿De qué país dijo que provenían?",["Chile","Perú","Bolivia"],1],
 ["¿Qué institución ocupa hoy el antiguo Palacio Negro de Lecumberri?",["Archivo General de la Nación","Museo Nacional de Antropología","Senado de la República"],0],
 ["¿Cómo se llamaba el rancho donde operaban Las Poquianchis?",["Rancho Las Ánimas","Rancho El Ángel","Rancho El Diablo"],1],
 ["¿En qué ciudad se descubrió en 1989 el caso de los “narcosatánicos” de Adolfo de Jesús Constanzo?",["Tijuana","Ciudad Juárez","Matamoros"],2],
 ["¿Cuánto tiempo estuvo preso Juan Gabriel en Lecumberri?",["3 meses","18 meses","5 años"],1],
 ["José Luis Calva, “el Caníbal de la Guerrero”, se presentaba como…",["Chef","Escritor y poeta","Médico"],1],
 ["¿A qué se dedicó Gregorio “Goyo” Cárdenas, el Estrangulador de Tacuba, al salir de prisión?",["Abogado","Sacerdote","Actor"],0],
 ["¿A cuántos años de prisión fue sentenciada “La Mataviejitas”?",["99","300","759"],2],
 ["Según la historia, ¿por qué Don Julián Santana empezó a colgar muñecas en su isla de Xochimilco?",["Para calmar el espíritu de una niña ahogada","Por una promesa a la Virgen","Para atraer turistas"],0]
];
const TRIVIA_SECS=10;

const NOTICIAS = [
 ["Durante una lluvia ligera, empezaron a caer peces pequeños del cielo en el patio de una escuela; Protección Civil lo confirmó.","T","Tampico","NPR"],
 ["Un hombre fue arrestado por la Guardia Costera mientras intentaba cruzar el océano Atlántico hasta Londres corriendo dentro de una rueda gigante tipo hámster.","F","","NPR"],
 ["Se organizó la primera reunión de therians (personas que se identifican con un animal) de la ciudad; llegó más público a mirar que participantes: solo se presentó una joven.","T","Ciudad Victoria","Posta"],
 ["Un joven pidió su bebida en el autoservicio de un restaurante de hamburguesas y, cuando le dieron la espalda, aventó un caimán vivo por la ventanilla. El juez le prohibió acercarse a esa cadena.","F","","CBS News"],
 ["Después de horas de beber, un hombre se metió a una jaula llena de cocodrilos para enfrentarlos, y salió ileso.","T","Tampico","Diario de Cuyo"],
 ["El servicio meteorológico tuvo que advertir a la población que, por el frío, podrían caer iguanas de los árboles, pero que no estaban muertas.","F","Miami","NBC Miami"],
 ["Una persona disfrazada de cocodrilo cruzó la calle a cuatro patas, y un transeúnte asustado le dio una patada.","T","Tampico","Posta"],
 ["Atraparon una serpiente pitón de casi 5 metros que se había tragado entero un venado adulto de unos 35 kilos.","F","Everglades","ABC News"],
 ["Las autoridades montaron un operativo de varios días para capturar a un tigre.","T","Reynosa","Milenio"],
 ["La cámara del timbre de una casa captó a un caimán parado en dos patas, “tocando” la puerta; esperó un rato y luego se fue.","F","Lake Mary","Fox News"]
];

const PELIS = [
 ["El exorcista",1973],["Scream",1996],["Chucky, el muñeco diabólico",1988],["Eso (It)",2017],["El aro",2002],
 ["Psicosis",1960],["El resplandor",1980],["El conjuro",2013],["Halloween",1978],["Pesadilla en la calle del infierno",1984],
 ["El juego del miedo (Saw)",2004],["¡Huye! (Get Out)",2017],["Viernes 13",1980],["La masacre de Texas",1974],["El bebé de Rosemary",1968]
];

