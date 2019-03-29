/**************************************************************************************************/
/*!
* file	TriviaGame.js
* date	3/21/2019
* authors: Alex Poplawski
* brief
The javascript file for the trivia handles all the game logic and drawing for trivia game
*/
/**************************************************************************************************/

// JavaScript function that wraps everything
$(document).ready(function() 
{
    //time per question constant
    const timePerQ = 30;
    /*
        the game object singleton
    */
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

        /*
        * Starts the timer and sets that it is running sets the interval as well
        */
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

        /*
        * Stops the timer and clears the interval/switch
        */
        stopTimer: function() 
        {
            clearInterval(this.intervalId);
            this.clockRunning = false;
        },

        /*
        * decreases the timer and runs the logic if timer is 0
        */
        decTimer: function() 
        {
            --this.timer;
            $("#Timer").html("Time: " + this.timer);
            if(this.timer <= 0)
            {
                this.submitAns();
            }
        },

        /*
        * handles the logic for checking answer
        */
        submitAns: function()
        {
            let selected = $("input[type='radio']:checked"); //button pressed
            let ans = selected.val(); //value of button pressed
            if(ans || this.timer == 0) // if an answer was pressed or timer is 0
            {
                //check the answer
                let pointsEarned = this.curQuestion.submit(ans);
                if(pointsEarned > 0) //increment number of questions right or wrong
                {
                    ++this.right;
                }
                else
                {
                    ++this.wrong;
                }
                this.score += pointsEarned;
                //if all the questions are used
                if(this.questions == this.right + this.wrong && this.questions != 0)
                {
                    this.endQuiz();
                    return;
                }
                this.getNewQuestion();
                this.draw();
            }
        },

        /*
        * creates an api string based on the inputs given when the button is pressed

        * return: a string of the given parameters set for the api call
        */
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

        /*
        * populates the question array based on the response from the api call
        */
        populateQuestionArray: function()
        {            
            let request = new XMLHttpRequest();
            let apiString = "https://opentdb.com/api.php?" + this.createApiCallString();
            
            request.open("GET", apiString, true);
            //doesnt matter that this isnt async since the quiz cant start till this is received anyways
            request.onload = function () {
                // Begin accessing JSON data here
                var data = JSON.parse(this.response)
                data["results"].forEach(ques => 
                {
                    let arr = ques["incorrect_answers"]; 
                    let cat = ques["category"]
                    let value = 0;
                    arr.push(ques["correct_answer"]); // add the correct answer to the incorrect answers so we have all possible selections
                    //sets point value of question based on how difficult the api considers it
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
                    // use the truefalse class instead of question if its a boolean
                    if(ques["type" == "boolean"])
                    {
                        var q = new trueFalse(ques["question"], arr, ques["correct_answer"], timePerQ, value, cat);
                    }
                    else
                    {
                        var q = new question(ques["question"], arr, ques["correct_answer"], timePerQ, value, cat);
                    }
                    gameInfo.questionArray.push(q); //add question to the array
                })
                gameInfo.getNewQuestion()
                gameInfo.draw();
               
            }
            
            request.send();
            
        },
        /*
        * ends of the quiz screen draw
        */
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

        /*
        * restarts the game
        */
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

        /*
        * gets a next question from the array

        * return: if there is a next question or not
        */
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

        /*
        * updates the stats table
        */
        updateStats: function()
        {
            $("#Stats").html("Right: " + this.right + " Wrong: " + this.wrong + " Score: " + this.score);
        },

        /*
        * draws the main game state
        */
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

    /*
        * object containing the logic for the default screen
    */
    var defaultScreen = {
        /*
        * draws the initial screen gets the possible categories and inserts into the list
        */
        draw: function()
        {
            let categories = new XMLHttpRequest();
            $("#Intro").show();
            $("#end").hide();
            //doesnt matter that this isnt async since the quiz cant start till this is received anyways
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
    * The question class handles all logic for the question
    */
    class question 
    {
        /*
        * question object contructor

        * params:
        * qText - The question string
        * responses - array of strings containing possible responses
        * correctAns - the string containing the right answer
        * time - time for question
        * score - how much question is worth based on difficulty
        * cat - the category string
        */
        constructor(qText, responses, correctAns, time, score, cat) 
        {
            this.questionText = qText;
            this.possibleResponses = this.shuffle(responses);
            this.answers = correctAns;
            this.qTime = time;
            this.worth = score;
            this.category = cat;
        }

        /*
        * shuffle a given array

        * params:
        * arr - array that needs to be shuffles

        * return:
        * return the array
        */
        shuffle(arr)
        {
            for (let i = arr.length - 1; i > 0; i--) 
            {
                let j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        /*
        * submits a given question

        * params:
        * ans - the answer to check

        * return:
        * the points earned or 0 if its wrong
        */
        submit(ans)
        {
            if(ans)
            {
                return this.checkAns(ans);
            }
            return 0;
                        
        }


        /*
        * checks a given answer if its correct

        * params:
        * ans - the answer to check

        * return:
        * the points earned or 0 if its wrong
        */
        checkAns(ans)
        {
            // why cant i use == here? this works but could potentially cause false positives
            if(ans.includes(this.answers[0]))
            {
                return this.getWorth();
            }
            return 0;
        }

        /*
        * getter for time

        * return: time of question
        */
        getTime()
        {
            return this.qTime;
        }

        /*
        * getter for value of question

        * return: worth of the question
        */
        getWorth()
        {
            return this.worth;
        }

        /*
        * draws the question part of the screen
        */
        draw()
        {
            
            $("#qText").html("Category: " + this.category +  "<br>" + this.questionText );
            var res = $("#responses")
            res.empty();
            
            res.append("<form>");
            for(let i in this.possibleResponses)
            {
                res.append("<input type=\"radio\" name=\"choice\" value=\"" + this.possibleResponses[i] + "\" required>" + this.possibleResponses[i] + "<br>");
            }
            res.append("<input class=\"btn btn-primary\" type=\"submit\" value=\"Submit\" id=\"submit\">");
            res.append("</form>");
        }
    }

    /*
    * true or false question that inherits from question not really necessary anymore since the api doesnt do a good job of sorting the questions
    */
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