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
            $("#Timer").html("Time: " + this.timer);
            if(this.timer <= 0)
            {
                this.submitAns();
            }
        },

        submitAns: function()
        {
            let pointsEarned = this.curQuestion.submit();
            if(pointsEarned > 0)
            {
                ++this.right;
            }
            else
            {
                ++this.wrong;
            }
            this.score += pointsEarned;
            this.getNewQuestion();
            this.draw();
        },

        getNewQuestion: function()
        {
            var q = new question("this is a question", ["yes", "no", "maybe"], ["yes"], 100, 5);
            this.setQuestion(q);
        },

        updateStats: function()
        {
            $("#Stats").html("Right: " + this.right + " Wrong: " + this.wrong + " Score: " + this.score);
        },

        setQuestion: function(question)
        {
            this.curQuestion = question;
            this.timer = this.curQuestion.getTime();
        },

        draw: function()
        {
            this.startTimer();
            $("#Timer").html("Time: " + this.timer);
            this.updateStats();
            this.curQuestion.draw();
            $("#submit").click(function()
            {
                gameInfo.submitAns();
            })
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

        submit()
        {
            let selected = $("input[type='radio']:checked");
            let ans = selected.val();
            return this.checkAns(ans);
        }

        checkAns(ans)
        {
            if(ans == this.answers[0])
            {
                return this.getWorth();
            }
            return 0;
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
            var res = $("#responses")
            res.empty();
            res.append("<form>");
            for(let i in this.possibleResponses)
            {
                res.append("<input type=\"radio\" name=\"choice\" value=\"" + this.possibleResponses[i] + "\">" + this.possibleResponses[i] + "<br>");
            }
            res.append("<input type=\"submit\" value=\"submit\" id=\"submit\">");
            res.append("</form>");
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

        submit()
        {
            let selected = $("input[type='text']");
            let ans = selected.val();
            return this.checkAns(ans);
        }

        checkAns(ans)
        {
            if(ans.toLowerCase() == this.answers[0].toLowerCase())
            {
                return this.getWorth();
            }
            return 0;
        }

        draw()
        {
            $("#qText").html(this.questionText);
            var res = $("#responses")
            res.empty();
            res.append("<form>");
            res.append("<input type=\"text\" name=\"choice\">" + "<br>");
            res.append("<input type=\"submit\" value=\"submit\" id=\"submit\">");
            res.append("</form>");
        }
    }

    class selectAll extends question
    {
        constructor(qText = "", responses = [], correctAns = [], time = 0, score = 1)
        {
            super(qText, responses, correctAns, time, score);
        }

        submit()
        {
            let ansArr = [];
            let selected = $("input[type='text']");
            $.each($("input[name='choice']:checked"), function()
            {            
                ansArr.push($(this).val());
            });
            return this.checkAns(ansArr);
        }
        checkAns(ans)
        {
            if(ans.length != this.answers.length)
            {
                return 0;
            }
            for(let i in this.answers)
            {
                if(!(ans.indexOf(this.answers[i]) > -1))
                {
                    return 0;
                }
            }
            return this.getWorth();
        }

        draw()
        {
            $("#qText").html(this.questionText);
            var res = $("#responses")
            res.empty();
            res.append("<form>");
            for(let i in this.possibleResponses)
            {
                res.append("<input type=\"checkbox\" name=\"choice\" value=\"" + this.possibleResponses[i] + "\">" + this.possibleResponses[i] + "<br>");
            }
            res.append("<input type=\"submit\" value=\"submit\" id=\"submit\">");
            res.append("</form>");
        }
    }
    var request = new XMLHttpRequest()
    request.open("GET", "https://opentdb.com/api.php?amount=10", true)
    request.onload = function () {
        // Begin accessing JSON data here
        var data = JSON.parse(this.response)
        data["results"].forEach(question => 
        {
            console.log(question);
        })
    }

    request.send();
    var q = new question("this is a question", ["yes", "no", "maybe"], ["yes"], 5, 1);
    gameInfo.setQuestion(q);

    gameInfo.draw();

});