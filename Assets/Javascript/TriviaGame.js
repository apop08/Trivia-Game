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
    const timePerQ = 30;
    var gameInfo = {
        timer: 0,
        gameState: "",
        curQuestion: null,
        questions: 0,
        right: 0,
        wrong: 0,
        score: 0,
        intervalId: null,
        clockRunning: false,
        questionArray: [],
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
            $('#hands').css( {"transform": "rotate(" + gameInfo.timer * 12 + "deg)"});
            if(this.timer <= 0)
            {
                this.submitAns();
            }
        },

        submitAns: function()
        {
            let selected = $("input[type='radio']:checked");
            let ans = selected.val();
            if(ans || this.timer == 0)
            {
                let pointsEarned = this.curQuestion.submit(ans);
                if(pointsEarned > 0)
                {
                    ++this.right;
                }
                else
                {
                    ++this.wrong;
                }
                this.score += pointsEarned;

                if(this.questions == this.right + this.wrong && this.questions != 0)
                {
                    this.endQuiz();
                    return;
                }
                this.getNewQuestion();
                this.draw();
            }
        },

        createApiCallString: function()
        {
            var amount = $("#trivia_amount").val();
            var cat = $("#trivia_category").val();
            var diff = $("#trivia_difficulty").val();
            var type = $("#trivia_type").val();
            gameInfo.questions = parseInt(amount);
            var apiString = "amount=" + amount;
            if(cat != "any")
            {
                apiString += "&category=" + cat;
            }
            if(diff != "any")
            {
                apiString += "&difficulty=" + diff;
            }
            if(type != "any")
            {
                apiString += "&type=" + type;
            }
            return apiString;
        },

        populateQuestionArray: function()
        {            
            let request = new XMLHttpRequest();
            var apiString = "https://opentdb.com/api.php?" + this.createApiCallString();
            
            request.open("GET", apiString, true);
            
            request.onload = function () {
                // Begin accessing JSON data here
                var data = JSON.parse(this.response)
                data["results"].forEach(ques => 
                {
                    let arr = ques["incorrect_answers"];
                    let cat = ques["category"]
                    let value = 0;
                    arr.push(ques["correct_answer"]);
                    if(ques["difficulty"] == "easy")
                    {
                        value = 1;
                    }
                    else if(ques["difficulty"] == "medium")
                    {
                        value = 2;
                    }
                    else
                    {
                        value = 3;
                    }
                    
                    if(ques["type" == "boolean"])
                    {
                        var q = new trueFalse(ques["question"], arr, ques["correct_answer"], timePerQ, value, cat);
                    }
                    else
                    {
                        var q = new question(ques["question"], arr, ques["correct_answer"], timePerQ, value, cat);
                    }
                    gameInfo.questionArray.push(q);
                })

                gameInfo.getNewQuestion()
                gameInfo.draw();
               
            }
            
            request.send();
            
        },

        endQuiz: function()
        {
            this.stopTimer();
            $("#end").show();
            $("#game").hide();
            $("#endGame").text("End of Quiz, You got " + this.right + " questions right out of " + (this.right + this.wrong) + " for a total score of: " + this.score);
        
            $("#Restart").click(function()
            {
                gameInfo.reset();
                defaultScreen.draw();
            })
        },

        reset: function()
        {
            this.timer = 0;
            this.curQuestion = null;
            this.questions = 0;
            this.right = 0;
            this.wrong = 0;
            this.score = 0;
            this.intervalId = null;
            this.clockRunning = false;
            this.questionArray = [];
        },

        getNewQuestion: function()
        {
            this.curQuestion = this.questionArray.pop();
            if(this.curQuestion)
            {
                this.timer = this.curQuestion.getTime();
                return false;
            }
            return true;
            
        },

        updateStats: function()
        {
            $("#Stats").html("Right: " + this.right + " Wrong: " + this.wrong + " Score: " + this.score);
        },

        draw: function()
        {
            $("#Intro").hide();
            $("#game").show();
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
    var defaultScreen = {
        draw: function()
        {
            let categories = new XMLHttpRequest();
            $("#Intro").show();
            $("#end").hide();
            categories.open("GET", "https://opentdb.com/api_category.php", true);
            categories.onload = function () {
                // Begin accessing JSON data here
                var data = JSON.parse(this.response);
                $("#trivia_category").empty();

                $("#trivia_category").append("<option value=\"any\">Any Category</option>");
                for(i in data["trivia_categories"]) 
                {
                    $("#trivia_category").append("<option value=\"" + data["trivia_categories"][i].id + "\">" + data["trivia_categories"][i].name + "</option>")
                }
            }
        
            categories.send();

            $("#submitQ").click(function()
            {
                gameInfo.populateQuestionArray();
            })
        }


    }
    /*

    */
    class question 
    {

        constructor(qText, responses, correctAns, time, score, cat) 
        {
            this.questionText = qText;
            this.possibleResponses = this.shuffle(responses);
            this.answers = correctAns;
            this.qTime = time;
            this.worth = score;
            this.category = cat;
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

        submit(ans)
        {
            if(ans)
            {
                return this.checkAns(ans);
            }
            return 0;
                        
        }

        checkAns(ans)
        {
            // why cant i use == here? this works but could potentially cause false positives
            if(ans.includes(this.answers[0]))
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
            
            $("#qText").html("Category: " + this.category +  "<br>" + this.questionText);
            var res = $("#responses")
            res.empty();
            
            res.append("<form>");
            for(let i in this.possibleResponses)
            {
                res.append("<input type=\"radio\" name=\"choice\" value=\"" + this.possibleResponses[i] + "\" required>" + this.possibleResponses[i] + "<br>");
            }
            res.append("<input class=\"btn btn-primary\" type=\"submit\" value=\"submit\" id=\"submit\">");
            res.append("</form>");
        }
    }

    class trueFalse extends question
    {
        constructor(qText, responses, correctAns, time, score, cat)
        {
            super(qText, responses, correctAns, time, score, cat);
            this.possibleResponses = ["True", "False"];
        }
    }

    defaultScreen.draw();
});