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
        the game object singleton
    */
    var gameInfo = {
        timer: 0,
        gameState: "",
        curQuestion: null,
        right: 0,
        wrong: 0,
        score: 0,
        intervalId: null,
        clockRunning: false,
        startTimer: function()
        {
            if (!this.clockRunning) 
            {
                this.intervalId = setInterval(function()
                {
                    gameInfo.decTimer();
                }, 1000);
                this.clockRunning = true;
            }          
        },

        stopTimer: function() 
        {
            clearInterval(this.intervalId);
            this.clockRunning = false;
        },

        decTimer: function() 
        {
            --this.timer;
        }

    };
    
    /*

    */
    class question 
    {

        constructor(qText = "", responses = [], correctAns = [], time = 0, score = 1) 
        {
            this.questionText = qText;
            this.possibleResponses = this.shuffle(responses);
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
            return arr;
        }

        checkAns(ans)
        {
            if(ans == correctAns[0])
            {
                return true;
            }
            return false;
        }

        getTime()
        {
            return this.qTime;
        }
        getWorth()
        {
            return this.worth;
        }

        draw()
        {
            $("#qText").html(this.questionText);
            var hook = $("#responses")
            hook.empty();
            hook.append("<form>");
            for(let i in this.possibleResponses)
            {
                hook.append("<input type=\"radio\" name=\"choice\" value=\"" + this.possibleResponses[i] + "\" required>" + this.possibleResponses[i] + "<br>");
            }
            hook.append("<input type=\"submit\" value=\"submit\" onclick=\"validate()\">");
            hook.append("</form>");
        }
    }

    class trueFalse extends question
    {
        constructor(qText = "", responses = [], correctAns = [], time = 0, score = 1)
        {
            super(qText, responses, correctAns, time, score);
            this.possibleResponses = ["True", "False"];
        }
    }

    class openResponse extends question
    {
        constructor(qText = "", responses = [], correctAns = [], time = 0, score = 1)
        {
            super(qText, responses, correctAns, time, score);
        }

        checkAns(ans)
        {
            if(ans.toLowerCase() == correctAns[0].toLowerCase())
            {
                return true;
            }
            return false;
        }

        draw()
        {
            $("#qText").html(this.questionText);
            var hook = $("#responses")
            hook.empty();
            hook.append("<form>");
            hook.append("<input type=\"text\" name=\"choice\" required>" + "<br>");
            hook.append("<input type=\"submit\" value=\"submit\" onclick=\"validate()\">");
            hook.append("</form>");
        }
    }

    class selectAll extends question
    {
        constructor(qText = "", responses = [], correctAns = [], time = 0, score = 1)
        {
            super(qText, responses, correctAns, time, score);
        }

        checkAns(ans)
        {
            if(ans.length != correctAns.length)
            {
                return false;
            }
            for(let i in correctAns)
            {
                if(!(ans.indexOf(correctAns[i]) > -1))
                {
                    return false;
                }
            }
            return true;
        }

        draw()
        {
            $("#qText").html(this.questionText);
            var hook = $("#responses")
            hook.empty();
            hook.append("<form>");
            for(let i in this.possibleResponses)
            {
                hook.append("<input type=\"checkbox\" name=\"choice\" value=\"" + this.possibleResponses[i] + "\" required>" + this.possibleResponses[i] + "<br>");
            }
            hook.append("<input type=\"submit\" value=\"submit\" onclick=\"validate()\">");
            hook.append("</form>");
        }
    }

    var q = new openResponse("this is a question", ["yes", "no", "maybe"]);
    q.draw();
});