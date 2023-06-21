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
/* Creamos un contexto para axceder a los metodos y comensar a dibujar el canvas*/
const game = canvas.getContext("2d");
/* Para cuando termine de cargar nuestro documento html ejecute la funcion, se hace con load*/
window.addEventListener("load", setCanvasSize);
window.addEventListener("resize", setCanvasSize); //Para que la pagina se actualice cada  vez que se modifica el tamaño de la pantalla

let canvasSize;
let elementsSize;
let nivel = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeIntervale;

const playerPosition = {
    x: undefined,
    y: undefined,
};
const gitPosition = {
    x: undefined,
    y: undefined,
};
let enemiePositions = [];

function fixNumber(n) {
    return Number(n.toFixed(0));
}

function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.6;
    } else {
        canvasSize = window.innerHeight * 0.6;
    }

    canvasSize = fixNumber(canvasSize);

    canvas.setAttribute("width", canvasSize);
    canvas.setAttribute("height", canvasSize);

    elementsSize = canvasSize / 10;
    elementsSize = fixNumber(elementsSize);
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}

function startGame() {
    game.font = elementsSize + "px Verdana";
    game.textAlign = "end";

    const map = maps[nivel];

    if (!map) {
        gameWin();
        return;
    }

    if (!timeStart) {
        timeStart = Date.now();
        timeIntervale = setInterval(showTime, 100);
        showRecord();
    }

    /* Con trim() le quitamos los espacios al comienzo y al final de un string  y con split(\n) generamos un array con string*/
    const mapRows = map.trim().split("\n");
    /* Creamos un nuevo arreglo con map(function ) por cada estring de mapRow en mapCol, limpiamos los espacios y los separamos por cada elemento con split("")  en donde cada fila es un arreglo*/
    const mapCol = mapRows.map((row) => row.trim().split(""));

    showLives();

    enemiePositions = [];
    game.clearRect(0, 0, canvasSize, canvasSize);
    /* cambiamos el ciclo for anidado por un for each */
    mapCol.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
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

    movePlayer();
}

function movePlayer() {
    const giftColisionX = playerPosition.x == gitPosition.x;
    const giftColisionY = playerPosition.y == gitPosition.y;

    const giftColision = giftColisionX && giftColisionY;

    if (giftColision) {
        // console.log("Subiste de nivel");
        nuevoNivel();
    }
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
        timeStart = undefined;
    }
    playerPosition.x = undefined;
    playerPosition.y = undefined;

    startGame();
}

function gameWin() {
    console.log("Terminaste el juego");
    clearInterval(timeIntervale);

    const recordTime = localStorage.getItem("record-time");
    const playerTime = Date.now() - timeStart;

    if (recordTime) {
        if (recordTime >= playerTime) {
            localStorage.setItem("record-time", playerTime);
            pResult.innerHTML = "SUPERASTE EL RECORD ANTERIOR :)";
        } else {
            pResult.innerHTML = "Lo siento no superaste el record :(";
        }
    } else {
        localStorage.setItem("record-time", playerTime);
        pResult.innerHTML = "Primera vez que juegas? Exelente";
    }
    // console.log({ recordTime, playerTime });
}
/*    Funsion  para agregar los corazone */
function showLives() {
    const heartsArray = Array(lives).fill(emojis["HEART"]);
    // console.log(heartsArray);
    spanLives.innerHTML = "";
    for (let i = 0; i < heartsArray.length; i++) {
        spanLives.innerHTML += heartsArray[i];
    }
}
/* para controlar el tiempo */
function showTime() {
    spanTime.innerHTML = Date.now() - timeStart;
}
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

    // prettier-ignore

    // prettier-ignore
    if (playerPosition.y - elementsSize < elementsSize) {
        console.log("OUT");
    }
    else {
        playerPosition.y -= elementsSize;
        startGame();
    }
    /*   if (
        playerPosition.x == gitPosition.x &&
        playerPosition.y == gitPosition.y
    ) {
        console.log("PUN se encontraron");
    } */
}
function moveLeft() {
    // console.log("Izquierda");
    // console.log(elementsSize);
    // prettier-ignore
    if ((playerPosition.x - elementsSize) < elementsSize) {
        console.log("OUT");
    } else {
        playerPosition.x -= elementsSize;
        startGame();
       
    }
    /*    if (
        playerPosition.x == gitPosition.x &&
        playerPosition.y == gitPosition.y
    ) {
        console.log("PUN se encontraron");
    } */
}
function moveRight() {
    // console.log("Derecha");
    // console.log(canvasSize);
    // prettier-ignore
    if ((playerPosition.x + elementsSize) > canvasSize) {
        console.log("OUT");
    } else {
        playerPosition.x += elementsSize;
        startGame();
    
    }
    /*     if (
        playerPosition.x == gitPosition.x &&
        playerPosition.y == gitPosition.y
    ) {
        console.log("PUN se encontraron");
    } */
}
function moveDown() {
    // console.log("Abajo");

    // prettier-ignore
    if ((playerPosition.y + elementsSize) > canvasSize) {
        console.log("OUT");
    } else {
        playerPosition.y += elementsSize;
        startGame();
    }
    /*    if (
        playerPosition.x == gitPosition.x &&
        playerPosition.y == gitPosition.y
    ) {
        console.log("PUN se encontraron");
    } */
}

// Asociar evento keydown al documento
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
    }
}
