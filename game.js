/* 
METODOS:
**game.fillRect(0,0,0,0):Donde inicia nuestro traso, asta donde va a llegar.
**game.clearRect(0,0,0,0);Para borrar parte de lo que emos creado.
++game.font = "25px Verdana"; le damos el tamaño del texto y el tipo de fuente a utilizar.
**game.fillStyle  = "Blub";le podemos dar color.
**game.textAlign = "end"; //left=start, right=end,center, se ubica teniendo encuenta  los valores suministrados en fillText
**game.fillText("texto", 0,0); Nos permite insertar texto, y ademas debemos desirle donde inicia y donde termina
*/

const canvas = document.querySelector("#game");
const btnUp = document.querySelector("#up");
const btnLeft = document.querySelector("#left");
const btnRight = document.querySelector("#right");
const btnDown = document.querySelector("#down");
const spanLives = document.querySelector("#lives");
const spanTime = document.querySelector("#time");
const spanRecord = document.querySelector("#record");
const pResult = document.querySelector("#result");
const btnReset = document.querySelector("#reset-btn");

btnReset.addEventListener("click", resetGame);

function resetGame() {
    location.reload();
}
/* Creamos un contexto para axceder a los metodos y comensar a dibujar el canvas*/
const game = canvas.getContext("2d");
/* Para cuando termine de cargar nuestro documento html ejecute la funcion, se hace con load*/
window.addEventListener("load", setCanvasSize);
window.addEventListener("resize", setCanvasSize); //Para que la pagina se actualice cada  vez que se modifica el tamaño de la pantalla "resize", llamamos denuevo setCanvasSize

let canvasSize;
let elementsSize;
let nivel = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeIntervale;

//Ubicacion inicial del jugador playerPosition
const playerPosition = {
    x: undefined,
    y: undefined,
};
//ubicacion inicial del regalito, gitPosition
const gitPosition = {
    x: undefined,
    y: undefined,
};

//Ubicacion de las bombas, en sus coordenadas X,Y.
let enemiePositions = [];

function fixNumber(n) {
    return Number(n.toFixed(0));
}

/*setCanvasSize() funcion para calcular el width y el height del canvas en canvasSize y luego dividirlo en 10*10 en el elementSize que serian los elementos que ocuparian el canvas */
function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.6;
    } else {
        canvasSize = window.innerHeight * 0.6;
    }
    //con canvasSize = fixNumber(canvasSize);estoy reduciendo los decimales de las medidas para evitar posibles problemas en el futuro, de no coincidencia por  decimales.
    canvasSize = fixNumber(canvasSize);

    canvas.setAttribute("width", canvasSize);
    canvas.setAttribute("height", canvasSize);

    elementsSize = canvasSize / 10;
    elementsSize = fixNumber(elementsSize);

    /* playerPosition.x = undefined;  playerPosition.y =undefined; No se definen para que cada vez que renderizamos el juego la calaverita o el jugador se mantenga en su posicion y no desenfoque o se mantenga acomodandose con respecto al resto de elementos*/
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    //si nesecito renderizar de nuevo

    startGame();
}
/*  con startGame  rederiza los elementos de nuestro mapa*/
function startGame() {
    /* con game.font: le asignamos el tamaño del elemento con el tipo de fuente a utilizar */
    game.font = elementsSize + "px Verdana";
    /*  game.textAlign = end, ubicamos el elemento al final del canvas  quedando en la primera posicion*/
    game.textAlign = "end";

    /*  map representa el mapa que se recorrera dependiendo del nivel o posicion que tenga en maps[] */
    const map = maps[nivel];

    //Cuando se acaban los mapas llamamos la funcion gameWin
    if (!map) {
        /* Cuando terminamos el juego guardamos los tiempos y comparamos */
        gameWin();
        return;
    }
    //cuando llamamos o inicializamos preguntamos si timeStart tiene algun valor y si no lo tiene lo inicializamos
    if (!timeStart) {
        /*  sino existe lo creamos */
        timeStart = Date.now();
        //llamamos la funcion showTime cada 100ms, con setInterval y la guardamos en la variable timeInterval
        timeIntervale = setInterval(showTime, 100);

        showRecord();
    }

    /* Con trim() le quitamos los espacios al comienzo y al final de un string  y con split(\n) generamos un array con string*/
    const mapRows = map.trim().split("\n");
    /* Creamos un nuevo arreglo con map(function ) por cada estring de mapRow en mapCol, limpiamos los espacios y los separamos por cada elemento con split("")  en donde cada fila es un arreglo*/
    const mapRowCol = mapRows.map((row) => row.trim().split(""));

    /*    Funsion  para agregar los corazone */
    showLives();

    //Llamamos denuevo a enmiePosition = [], basia cada vez que renderizamos para no llenarnos  o duplicar o triplicar la informacion en esa array,
    enemiePositions = [];

    game.clearRect(0, 0, canvasSize, canvasSize);
    /* Recorremos el mapRowCol con  un forEach */
    mapRowCol.forEach((row, rowI) => {
        //Por cada fila recorremos y sacamos las columnas
        row.forEach((col, colI) => {
            // En emoji guardamos cada uno de los elementos del arreglo
            const emoji = emojis[col];
            //En posX y posY esta la posicion o coordenadas de cada uno de los elelmentos
            const posX = elementsSize * (colI + 1);
            const posY = elementsSize * (rowI + 1);

            if (col == "O") {
                if (!playerPosition.x && !playerPosition.y) {
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                }
            } else if (col == "I") {
                gitPosition.x = posX;
                gitPosition.y = posY;
            } else if (col == "X") {
                enemiePositions.push({
                    x: posX,
                    y: posY,
                });
            }

            game.fillText(emoji, posX, posY);
        });
    });
    //Cuando se renderiza el map se ubica denuevo el jugador ,dando el efecto de movimiento
    movePlayer();
}
/* ************************** */
//para remplazar la bombita por la explosion, utilizamos las posiciones de las bombitas y las remplazamos en el momento de la colicion en la function levelFail()
function remplazo() {
    enemiePositions.forEach((pos) => {
        game.fillText(emojis["BOMB_COLLISION2"], pos.x, pos.y);
    });
}

/* ************************** */
//Cada vez que ejecutamos movePleyer, estamos cambiando la posicion del jugador
function movePlayer() {
    //Creamos variable para saber las posibles colisiones en X y en Y, comparamos la posicion del regalito(gitPosition), con la posicion del jugador(peyerPosition)
    const giftColisionX = playerPosition.x == gitPosition.x;
    const giftColisionY = playerPosition.y == gitPosition.y;
    //Si hay colision en ambas, true y true, entonces gitColision es positivo
    const giftColision = giftColisionX && giftColisionY;

    if (giftColision) {
        // console.log("Subiste de nivel");
        nuevoNivel();
    }

    //Creamos esta variable (enemiColition) para guardar true o false, si encuentra o choca contra una bomba, (enemiePositions)es la array donde estan guardadas las coordenadas de las bombas, compara la posicion del jugador(playerPosition.x)en X, en Y, con las posiciones de las bombas
    const enemiColition = enemiePositions.find((enemy) => {
        const enemyColitionX = enemy.x == playerPosition.x;
        const enemyColitionY = enemy.y == playerPosition.y;

        return enemyColitionX && enemyColitionY;
    });

    if (enemiColition) {
        // console.log("Chocaste contra un enemigo");

        levelFail();
    }

    game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);
}

function nuevoNivel() {
    console.log("Subiste de nivel");
    nivel++;
    startGame();
}
function levelFail() {
    console.log("Colisionaste con un enemigo");

    lives--;

    if (lives <= 0) {
        nivel = 0;
        lives = 3;
        //Al perder las 3 vidas reiniciamos el tiempo
        timeStart = undefined;
    }
    //la ubicacion del jugador en pleyerPosition la igualamos a undefined para que cuando choque con una bomba buenva a la posicion inicial, despues de reiniciar el juego llamando a startGame().
    playerPosition.x = undefined;
    playerPosition.y = undefined;

    startGame();
    /* Colision con la bomba y explosion de todas */
    // Definir una variable para almacenar el identificador del timeout
    let timeoutId;

    // Función que se ejecutará después de un cierto tiempo es :remplazo()

    // Iniciar el timeout
    timeoutId = setTimeout(remplazo, 5); // Ejecutar después de 5 segundos

    // Detener el timeout después de 100 mili segundos
    setTimeout(function () {
        clearTimeout(timeoutId);
        console.log("Se ha detenido el setTimeout.");
        startGame();
    }, 100);

    // clearTimeout(idTemporizador); // Cancela la ejecución de la función programada
} /* ******************************** */

/* ********************************** */
/* Cuando terminamos el juego guardamos los tiempos y comparamos */
function gameWin() {
    console.log("Terminaste el juego");

    // Con clearInterval(timeIntervale) estamos deteniendo el tiempo al terminar el juego
    clearInterval(timeIntervale);

    //Leemos en  localStorege que tiempo hay guardado y lo guardamos en recortTime
    const recordTime = localStorage.getItem("record-time");
    //en payerTime guardamos el tiempo que gasto el jugador de completar el juego
    const playerTime = Date.now() - timeStart;

    if (recordTime) {
        if (recordTime >= playerTime) {
            //Si el tiempo fue superado al anterior , guardamos el nuevo record en localStore
            localStorage.setItem("record-time", playerTime);
            pResult.innerHTML = "SUPERASTE EL RECORD ANTERIOR :)";

            /* Colision con la bomba y explosion de todas */
            // Definir una variable para almacenar el identificador del timeout
            let timeoutId;

            // Función que se ejecutará después de un cierto tiempo es :final()
            function final() {
                enemiePositions.forEach((pos) => {
                    game.fillText(emojis["PARTY_1"], pos.x, pos.y);
                });
            }
            // Iniciar el timeout
            timeoutId = setTimeout(final, 5); // Ejecutar después de 5 segundos

            // Detener el timeout después de 100 mili segundos
            setTimeout(function () {
                clearTimeout(timeoutId);
                console.log("Se ha detenido el setTimeout.");
                //startGame();
            }, 100);
        } else {
            pResult.innerHTML = "Lo siento no superaste el record :(";
            /* Colision con la bomba y explosion de todas */
            // Definir una variable para almacenar el identificador del timeout
            let timeoutId;

            // Función que se ejecutará después de un cierto tiempo es :final()
            function final() {
                enemiePositions.forEach((pos) => {
                    game.fillText(emojis["GAME_OVER"], pos.x, pos.y);
                });
            }
            // Iniciar el timeout
            timeoutId = setTimeout(final, 5); // Ejecutar después de 5 segundos

            // Detener el timeout después de 100 mili segundos
            setTimeout(function () {
                clearTimeout(timeoutId);
                console.log("Se ha detenido el setTimeout.");
                //startGame();
            }, 100);
        }
    } else {
        localStorage.setItem("record-time", playerTime);
        pResult.innerHTML = "Primera vez que juegas? Exelente";
    }
}
/*    Funsion  para agregar los corazone */
function showLives() {
    //Con Array()Creamos un array con la cantidad de elementos que tenga lives, y con .fill le desimos que incerte en cada uno de los espacios un corrazon
    const heartsArray = Array(lives).fill(emojis["HEART"]);
    // con spanLives.innerHTML = "" , cada vez que recarguemos limpiamos los 3 corazoncitos y si pierdo me los descuenta
    spanLives.innerHTML = "";
    for (let i = 0; i < heartsArray.length; i++) {
        spanLives.innerHTML += heartsArray[i];
    }
}
/* para controlar el tiempo  y mostrar el tiempo que se lleva jugando*/
function showTime() {
    spanTime.innerHTML = Date.now() - timeStart;
}
//Mostramos el record que se encuentra guardado en localStore
function showRecord() {
    spanRecord.innerHTML = localStorage.getItem("record-time");
}

/* ******Movimientos por los botones******* */
btnUp.addEventListener("click", moveUp);
btnLeft.addEventListener("click", moveLeft);
btnRight.addEventListener("click", moveRight);
btnDown.addEventListener("click", moveDown);

function moveUp() {
    // console.log("Arriba");
    //Este elemento se mueve en el eje  y , estando abajo para arriba
    //Con  el if hacemos la validacion si al pleyerPositio menos el elemento nos daria un numero negativo o mayor al ancho y alto de nuestro canvas, si lo es se estaria saliendo y no hariamos la nueva asignacion, la comparacion se hace contra el elementsSize por que es el punto de inicio del juego.
    // prettier-ignore
    if ((playerPosition.y - elementsSize) < elementsSize) {
        console.log("OUT");
    }
    else {
        //Si le restamos a pleyerPosition.y, el tamaño del elemento, lo desplazamos una posicion.
        playerPosition.y -= elementsSize;
        //se llama de nuevo starGame(), para renderizar de nuevo el mapa en su nueva posicion
        startGame();
    }
}
function moveLeft() {
    // console.log("Izquierda");
    //Este elemento se mueve en el eje  X , estando en la derecha para la izquierda
    //Con  el if hacemos la validacion si al pleyerPositio menos el elemento nos daria un numero negativo o mayor al ancho y alto de nuestro canvas, si lo es se estaria saliendo y no hariamos la nueva asignacion, la comparacion se hace contra el elementsSize por que es el punto de inicio del juego.
    // prettier-ignore
    if ((playerPosition.x - elementsSize) < elementsSize) {
        console.log("OUT");
    } else {
        playerPosition.x -= elementsSize;
        startGame();
       
    }
}
function moveRight() {
    // console.log("Derecha");
    //Este elemento se mueve en el eje  X , estando en la izquierda para la derecha
    //Con  el if hacemos la validacion si al pleyerPositio menos el elemento nos daria un numero negativo o mayor al ancho y alto de nuestro canvas, si lo es se estaria saliendo y no hariamos la nueva asignacion, cuando se esta sumando en X o en Y ,nuestra barrera es el canvasSize.
    // prettier-ignore
    if ((playerPosition.x + elementsSize) > canvasSize) {
        console.log("OUT");
    } else {
        playerPosition.x += elementsSize;
        startGame();
    
    }
}
function moveDown() {
    // console.log("Abajo");
    //Este elemento se mueve en el eje  y , estando arriba para abajo
    //Con  el if hacemos la validacion si al pleyerPositio menos el elemento nos daria un numero negativo o mayor al ancho y alto de nuestro canvas, si lo es se estaria saliendo y no hariamos la nueva asignacion, cuando se esta sumando en X o en Y ,nuestra barrera es el canvasSize.
    // prettier-ignore
    if ((playerPosition.y + elementsSize) > canvasSize) {
        console.log("OUT");
    } else {
        playerPosition.y += elementsSize;
        startGame();
    }
}

// Asociar evento keydown al documento , movimiento con las flechitas, keydown es cuando presionamos la tecla.
window.addEventListener("keydown", moveByKeys);

function moveByKeys(event) {
    // console.log(event);
    switch (event.key) {
        case "ArrowUp":
            // Acción cuando se presiona la tecla de flecha hacia arriba
            // console.log("Arriba Arrow");
            // Aquí puedes realizar la acción que desees
            moveUp();
            break;
        case "ArrowLeft":
            // Acción cuando se presiona la tecla de flecha hacia la izquierda
            // console.log("Izquierda");
            // Aquí puedes realizar la acción que desees
            moveLeft();
            break;
        case "ArrowRight":
            // Acción cuando se presiona la tecla de flecha hacia la derecha
            // console.log("Derecha");
            // Aquí puedes realizar la acción que desees
            moveRight();
            break;
        case "ArrowDown":
            // Acción cuando se presiona la tecla de flecha hacia abajo
            // console.log("Abajo");
            // Aquí puedes realizar la acción que desees
            moveDown();
            break;
        case " ":
            // Acción cuando se presiona la tecla de flecha hacia abajo
            // console.log("Abajo");
            // Aquí puedes realizar la acción que desees
            resetGame();
            break;
    }
}
