/**************************************************************************************************/
/*!
* file	TriviaGame.js
* date	3/21/2019
* authors: Alex Poplawski
* brief
The javascript file for the trivia handles all the game logic and drawing
*/
/**************************************************************************************************/

// JavaScript function that wraps everything
$(document).ready(function() 
{
    /*
        Global variables encapsulated in a singleton to protect from idiocy
    */
    var gameInfo = {

    };
    
    /*

    */
    class question 
    {

        constructor(qText = "", responses = [], correctAns = [], time = 0, score = 1) 
        {
            this.questionText = qText;
            this.possibleResponses = shuffle(responses);
            this.answers = correctAns;
            this.qTime = time;
            this.worth = score; 
        }

        shuffle(arr)
        {
            for (let i = arr.length - 1; i > 0; i--) 
            {
                let j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
    }
});