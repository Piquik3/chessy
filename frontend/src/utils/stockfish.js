let engine = null;
let currentFen = "";

let callbackFunction = null;


export function initStockfish(){

    if(engine)
        return engine;


    engine = new Worker(
        new URL(
            "stockfish.js/stockfish.js",
            import.meta.url
        )
    );


    engine.postMessage("uci");


    return engine;
}



export function analyzeStockfish(fen, callback){

    if(!engine)
        initStockfish();


    currentFen = fen;
    callbackFunction = callback;


    engine.postMessage("stop");

    engine.postMessage("ucinewgame");


    // 3 meilleurs coups
    engine.postMessage(
        "setoption name MultiPV value 3"
    );


    engine.postMessage(
        `position fen ${fen}`
    );


    engine.postMessage(
        "go depth 18"
    );



    engine.onmessage = (event)=>{


        const msg = event.data;


        console.log(msg);



        /*
            Informations pendant le calcul
        */

        if(msg.startsWith("info depth")){


            const parts = msg.split(" ");

            const data = {};



            // profondeur

            const depthIndex =
                parts.indexOf("depth");


            if(depthIndex !== -1){

                data.depth =
                    Number(parts[depthIndex + 1]);

            }




            // numéro du meilleur coup

            const multiIndex =
                parts.indexOf("multipv");


            if(multiIndex !== -1){

                data.rank =
                    Number(parts[multiIndex + 1]);

            }





            // évaluation

            const scoreIndex =
                parts.indexOf("score");



            if(scoreIndex !== -1){


                const type =
                    parts[scoreIndex + 1];


                const value =
                    parts[scoreIndex + 2];



                if(type === "cp"){


                    let score =
                        Number(value);



                    /*
                       Stockfish donne toujours
                       le score du point de vue des blancs.

                       Si c'est aux noirs de jouer,
                       on inverse.
                    */

                    const turn =
                        currentFen.split(" ")[1];



                    if(turn === "b"){

                        score = -score;

                    }



                    data.score = score;

                    data.evaluation = score;


                }



                if(type === "mate"){


                    let mate =
                        Number(value);



                    const turn =
                        currentFen.split(" ")[1];


                    if(turn === "b"){

                        mate = -mate;

                    }


                    data.score =
                        "M" + mate;


                    data.evaluation =
                        "M" + mate;


                }

            }





            // premier coup de la variante PV

            const pvIndex =
                parts.indexOf("pv");



            if(pvIndex !== -1){


                data.move =
                    parts[pvIndex + 1];

            }





            data.fen = currentFen;



            if(callbackFunction){

                callbackFunction(data);

            }

        }





        /*
            Coup final choisi par Stockfish
        */

        if(msg.startsWith("bestmove")){


            const move =
                msg.split(" ")[1];



            if(callbackFunction){

                callbackFunction({

                    bestMove: move,

                    fen: currentFen

                });

            }

        }


    };


}