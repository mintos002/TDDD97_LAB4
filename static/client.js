// VARIABLES
var ws;

//END VARIABLES

// AJAX
function post(route, request, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", route, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            //console.log(">> Inside post method, response: " + response)
            callback(response);
        }
        else if (xmlhttp.status) {
            //console.log('>> Inside post method, ERROR: ' + xmlhttp.status);
        }   
    }

    
    xmlhttp.send(request);
}

function elimina(route, request, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("DELETE", route, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            //console.log(">> Inside elimina method, response: " + response)
            callback(response);
        }
        else if (xmlhttp.status) {
            //console.log('>> Inside elimina method, ERROR: ' + xmlhttp.status);
        }
    }


    xmlhttp.send(request);
}

function get(route, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            //console.log(">> Inside post method, response: " + response)
            callback(response);
        }
        else if (xmlhttp.status) {
            //console.log('>> Inside post method, ERROR: ' + xmlhttp.status);
        }
    }

    xmlhttp.open("GET", "https://localhost" + route, true);
    xmlhttp.send();
}

// END AJAX 


// WEBSOCKET
var wsURL = "ws://localhost:5000/websocket";


ws = new WebSocket(wsURL);

ws.onopen = function () {
    var ws_start = new Object();
    ws_start.id = "start";
    console.log("WebSocket ONOPEN " + JSON.stringify(ws_start));
    sendMessage(ws_start);
};

ws.onmessage = function (response) {
    var message = JSON.parse(response.data);

    //alert(data.message);
    if (message.id == "sign_out") {
        console.log("WebSocket BYE BYE");
        sign_out();
    }

    else if (message.id == "update_chart") {
        console.log("WebSocket Chart updating");
        update_chart(message.sent, message.received, message.online);
    }

};

ws.onclose = function () {
    console.log("WebSocket closed");
};

ws.onerror = function (error) {
    console.log("ERROR! " + JSON.stringify(error));
};


var sendMessage = function (message) {
    if (ws.readyState === 1) {
        ws.send(JSON.stringify(message));
    } else {
        // Set interval of 500 ms to try again
        setTimeout(function () {
            sendMessage(message);
        }, 500);
    }
};

//END WEBSOCKET




displayView = function(){
	// the code required to display a view
	var welcome_view = document.getElementById("welcomeview");
	var profile_view = document.getElementById("profileview");
	
	var place_to_display = document.getElementById("displayView");

	dataObject0 = "token=" + sessionStorage.getItem("token");
    
	//if there is a token stored, the view shown must be the profile_view
	if (sessionStorage.getItem("token")) {
		place_to_display.innerHTML = profile_view.innerHTML;
		//select home for default value
		profile_display("nav_home");
	} else {
	    sessionStorage.removeItem("token");
	    place_to_display.innerHTML = welcome_view.innerHTML;
	}
};

window.onload = function(){
	//code that is executed as the page is loaded.
	//You shall put your own custom code here.
	//window.alert("Hello TDDD97!");
	displayView();
};

// ===============================================================
// .....................Welcome view
// ===============================================================

function password(psw, confirm_psw) {
    console.log("INTO method password");
	if(psw.value.length <4) {
		//show_errmessage("Password must have at least 4 characters");
		//dity("Password must have at least 4 characters");
		//confirm_psw.setCustomValidity("Password must have at least 4 characters");
		return {"success": false, "err": 1};
	} else {
	
		if (psw.value != confirm_psw.value){
			//show_errmessage("Passwords Don't Match");
			//confirm_psw.setCustomValidity("Passwords Don't Match");
			return {"success": false, "err": 2};
			
		} else {
			//confirm_psw.setCustomValidity("");
			//show_errmessage();
			return {"success": true};;
		}
	}
}
// NOTE: ojo, no se como pasa los datos el servidor, texto tipo JSON?, aquí está como si fuera objeto
function validatePassword() {
    console.log("INTO method validatePassword");
	var first_name = document.getElementById("signup_firstname");
	var family_name = document.getElementById("signup_familyname");
	var gender = document.getElementById("signup_gender");
	var city = document.getElementById("signup_city");
	var country = document.getElementById("signup_country");
	var email = document.getElementById("signup_email");
	
	var psw = document.getElementById("signup_psw");
	var confirm_psw = document.getElementById("signup_rpsw");
	
	var ok = password(psw,confirm_psw);
	
	if (ok.err==1){
		show_errmessage("Password must have at least 4 characters");
	}
	if (ok.err==2){
		show_errmessage("Passwords Don't Match");
	}
	
	//ones the validation is passed, we send the sugnUp data
	if (ok.success == true) {
		show_errmessage();
		
		var dataObject = "email=" + email.value + "&password=" + psw.value + "&firstname=" + first_name.value + "&familyname=" + family_name.value + "&gender=" + gender.value + "&city=" + city.value + "&country=" + country.value;
		
		// we need to know if the email to signUp is already used and send a feedback to the client

		post("/signup", dataObject, function (feedback) {
		    if (feedback) {
		        //console.log(">> validatePassword()>> signup feedback recived.");

		        // if the signUp succeeds the user directly logged in !
		        // we ned to refresh the site after the signUp to call signIn method

		        if (feedback.success) {
		            console.log(">> validatePassword()>> SIGN UP OK");

		            var e = email.value;
		            var p = psw.value;

		            //location.reload(true);

		            sign_in(e,p);

		        } else {
		            show_errmessage("ERR: " + feedback.message);
		        }

		        //console.log(">> validatePassword()>> feedback: " + "SUCCESS: " + feedback.success + ", MESSAGE: " + feedback.message);
		    }// END of feedback == true
		    else {
		        console.log(">> validatePassword()>> signup NO feedback recived.");
		    }
		}); // END of post

	} //END of ok.success
}

function sign_in(email,psw) { 
	if (email==null || psw==null ){
		var email = document.getElementById("signin_email").value;
		var psw = document.getElementById("signin_psw").value;
		//console.log("sign in input null");
		//console.log("" + email + "&" + psw);
	}

	dataObject3 = "email=" + email + "&password=" + psw;
	//console.log("" + dataObject3);
	post("/signin", dataObject3, function (feedback) {
	    if (feedback) {
	        //console.log(">> sign_in()>> signin feedback recived.");
	        // if the signIn succeed, the view will change, 
	        // if the signIn fails, we should display a message
	        if (feedback.success == false) {
	            show_errmessage(feedback.message);
	            console.log(email);
	            if (feedback.message == "You are already signed in.") {
	                elimina("/deleteOnlineUser", "email=" + email, function (callback) {
	                    if (callback.success) {
	                        console.log("Already SccsT");
	                        sessionStorage.removeItem("token");
	                        show_errmessage(feedback.message + " Push logIn again to logIn.");
	                    } else {
	                        console.log("Already SccsF");
	                    }
	                });
	            }
	            //return;
	        } else {
//                connect_socket(email);
	            if (typeof (Storage) !== "undefined") {
	                var ws_email = new Object();
	                ws_email.id = "email";
	                ws_email.email = email;
	                sendMessage(ws_email);

	                window.sessionStorage.token = feedback.data;
	                //location.reload(true);
	                console.log("LOGGED IN");
	                displayView();
	                //return;

	            } else {
	                show_errmessage(">> sign_in()>> Sorry! No Web Storage support...");

	            }
	        }// else
	    }
	}); // END post
    
	
}


// ===============================================================
// .....................Profile view
// ===============================================================

function profile_display(clicked_id) {
    var ss = "token=" + sessionStorage.getItem("token");
    post("/getEmailByToken", ss, function (callback) {
        if (callback) {
            if (callback.success) {
                console.log("profile display >> there is still a token.");
                console.log(callback.data + ":::" + sessionStorage.getItem("token"));
            } else {
                sign_out();
                show_errmessage("You have been logged out.");
                return;
            }
        } else {
            sign_out();
            show_errmessage("You have been logged out.");
            return;
        }
    });

    endChart();

	if (clicked_id == "nav_home") {
		document.getElementById("Browse_display").style.display = "none";
		document.getElementById("Account_display").style.display = "none";
		document.getElementById("Home_display").style.display = "block";
		
		document.getElementById("nav_home").className = "active";
		document.getElementById("nav_browse").className = "noactive";
		document.getElementById("nav_account").className = "noactive";
		
		document.getElementById("sign_out").className = "noactive";
		document.getElementById("reload").style.display = "block";

        // Get info of the user and messages and load the wall
		getInfo();
		loadWall ();
		
	} else if (clicked_id == "nav_browse") {
		document.getElementById("Home_display").style.display = "none";
		document.getElementById("Account_display").style.display = "none";
		document.getElementById("Browse_display").style.display = "block";
		
		document.getElementById("nav_browse").className = "active";
		document.getElementById("nav_account").className = "noactive";
		document.getElementById("nav_home").className = "noactive";
		
		document.getElementById("sign_out").className = "noactive";
		document.getElementById("reload").style.display = "block";
		
	    // Get info of the user and messages and load the wall
		getInfoUser();
		loadWall_browse();
		
	} else {
		document.getElementById("Home_display").style.display = "none";
		document.getElementById("Browse_display").style.display = "none";
		document.getElementById("Account_display").style.display = "block";
		
		document.getElementById("nav_browse").className = "noactive";
		document.getElementById("nav_account").className = "active";
		document.getElementById("nav_home").className = "noactive";
		
		document.getElementById("sign_out").className = "active";
		document.getElementById("reload").style.display = "none";

	    // Iniciate the chart in account view
		initChart();

	}
}

function sign_out() {
	var token = sessionStorage.getItem("token");
		dataObject4="token="+token;
		elimina("/signout", dataObject4, function (result) {
		    if (!result) {
		        console.log(">> sign_out>> there is no feedback from server.");
		        return;
		    }
            // if result success
		    if (result.success) {
		        endChart();
		        sessionStorage.removeItem("token");
		        displayView();

		        console.log(">> sign_out>> " + result.message);
		    } else {
		        console.log(">> sign_out>> " + result.message);
		        sessionStorage.removeItem("token");
		        displayView();
		    }
		});// END post

}

// ===============================================================
// .....................Account
// ===============================================================

function password_changer() {
	var old_psw = document.getElementById("old_psw");
	var new_psw = document.getElementById("new_psw");
	var rnew_psw = document.getElementById("rnew_psw");
	
	var token = sessionStorage.getItem("token");
	var ok = password(new_psw,rnew_psw);
	
	if (ok.success){
	    //////////		var feedback = serverstub.changePassword(token, old_psw.value, new_psw.value);
	    dataObject5 = "token=" + token + "&oldpassword=" + old_psw.value + "&newpassword=" + new_psw.value;
	    post("/changePassword", dataObject5, function (feedback) {
	        // if we got a feedback
	        if (feedback) {
	            if (feedback.success) {
	                refreshWall();
	            }
                //  if !success error message will show up
	            show_errmessage(feedback.message, "div_error_account");
	        }// END feedback
	    });// END post
	
	} else {
		if (ok.err==1) {
			show_errmessage("Password must have at least 4 characters.","div_error_account");
		}
		
		if (ok.err==2) {
			show_errmessage("Passwords Don't Match.","div_error_account");
		}	
	}
}


// ===============================================================
// .....................Home
// ===============================================================

function postToWall() {
	var content = document.getElementById("text_to_post").value;
//////////	var toEmail = serverstub.getUserDataByToken(sessionStorage.token).data.email;
	if (content == "") {
	    show_errmessage("You must write something before post it.", "div_error_home");
	    return;
	}
	
	if (!content.replace(/\s/g, '').length) {
	    document.getElementById("text_to_post").value = "";
	    show_errmessage("Text only contained whitespace (ie. spaces, tabs or line breaks)", "div_error_home");
	    return;
	}

	toEmail = "";
	dataObject6 = "token=" + sessionStorage.getItem("token");
	//console.log("" + dataObject6);
	post("/getEmailByToken", dataObject6, function (r) {
	    if (r.success) {
	        dataObject7 = "token=" + sessionStorage.getItem("token") + "&message=" + content + "&email=" + r.data;
	        post("/postMessage", dataObject7, function (result){
	            if (result.success) {
	                refreshWall();
	                //console.log("into postToWall(): result.success = True");
	            } else {
	                show_errmessage(result.message, "div_error_home");
	            }
	            
	        });
	    } else {
	        show_errmessage("The server cudn't find your email.", "div_error_home");
	    }
	});
}


function loadWall () {
    //////////	var result = serverstub.getUserMessagesByToken(sessionStorage.token);	
   // console.log("loadWall()>>>>>>>>>>>>>>")
    dataObject8 = "token=" + sessionStorage.getItem("token");
    post("/getUserMessagesByToken", dataObject8, function (result) {
        if (result) {
            var place_to_post = document.getElementById("messagesWall");
            //reset Posts
            place_to_post.innerHTML = "";

            if (result.success) {
                for (i = 0; i < result.data.length ; i++) {
                    place_to_post.innerHTML += '<div class="well well-sm" draggable="true" ondragstart="drag(event)" id="HV_' + i + '"><h4>Post by: ' + result.data[i][0] + '</h4><p>' + result.data[i][1] + '</p></div>';
                }
            } else {
                show_errmessage(result.message, "div_error_home");
            }
        }
    });
	//console.log("LOAD WALL HOME");
	
	
}

function getInfo(){
//////////	var info = serverstub.getUserDataByToken(sessionStorage.token);
    dataObject9 = "token=" + sessionStorage.getItem("token");
    post("/getUserDataByToken", dataObject9, function (info) {
        if (info) {
            //console.log("getInfo into");
            if (info.success) {

                var email = document.getElementById("pemail");
                var fname = document.getElementById("pfname");
                var lname = document.getElementById("plname");
                var gender = document.getElementById("pgender");
                var city = document.getElementById("pcity");
                var country = document.getElementById("pcountry");

                email.innerHTML = " " + info.data.email;
                fname.innerHTML = " " + info.data.firstname;
                lname.innerHTML = " " + info.data.familyname;
                gender.innerHTML = " " + info.data.gender;
                city.innerHTML = " " + info.data.city;
                country.innerHTML = " " + info.data.country;
            } else {
                show_errmessage(info.message);
            }
        }
        else {
            console.log("getInfo out");
        }
    });

}




// ===============================================================
// .....................Browse
// ===============================================================
var email_friend = "";

function search_clicked(){
	getInfoUser();
	refreshWall();
}

function getInfoUser() {
	show_errmessage(null,"div_error_browse");
	//console.log("000000000000000000000000000000000000000");
	var email = document.getElementById("email_browse").value;
	
	if ((email != "") && (email_friend == "")) {
	    email_friend = email;
	}

	if ((email != "") && (email_friend != "") && (email != email_friend)) {
	    email_friend = email;
	}

	if (email == "" && email_friend == "") {
		show_errmessage("You must enter an email to search it.","div_error_browse");
		
		document.getElementById("id_personal_browse").style.display = "none";
		document.getElementById("id_post_area_browse").style.display = "none";
		document.getElementById("id_messages_browse").style.display = "none";
		
		return;
		//console.log("11111111111111111111111111111111111111111");
	} else {
		document.getElementById("id_personal_browse").style.display = "block";
		document.getElementById("id_post_area_browse").style.display = "block";
		document.getElementById("id_messages_browse").style.display = "block";
	}
	
	if (email == "" && email_friend != "") {
		document.getElementById("email_browse").setAttribute("value",email_friend);
		email = document.getElementById("email_browse").value;
		//console.log("Email getInfoUser(): " + email+"; Email friend: " + email_friend);
		//console.log("2222222222222222222222222222222222222222222");
		if (email == ""){
			//console.log("255555555555555555555555555555555555555");
		} else {
			//console.log("26666666666666666666666666666666666666");
		}
	} 
	
//////////	var info = serverstub.getUserDataByEmail(sessionStorage.token,email);	
	dataObject10 = "token=" + sessionStorage.getItem("token") + "&email=" + email;
	post("/getUserDataByEmail", dataObject10, function (info) {
	    if (info) {
	        //console.log("getInfoUser into");
	        if (info.success) {
	            var emailS = document.getElementById("browse_pemail");
	            var fname = document.getElementById("browse_pfname");
	            var lname = document.getElementById("browse_plname");
	            var gender = document.getElementById("browse_pgender");
	            var city = document.getElementById("browse_pcity");
	            var country = document.getElementById("browse_pcountry");

	            emailS.innerHTML = " " + info.data.email;
	            fname.innerHTML = " " + info.data.firstname;
	            lname.innerHTML = " " + info.data.familyname;
	            gender.innerHTML = " " + info.data.gender;
	            city.innerHTML = " " + info.data.city;
	            country.innerHTML = " " + info.data.country;

	            email_friend = email;

	            //console.log("33333333333333333333333333333333333333333");
	        } else {
	            show_errmessage(info.message, "div_error_browse");
                // Don't show page
	            document.getElementById("id_personal_browse").style.display = "none";
	            document.getElementById("id_post_area_browse").style.display = "none";
	            document.getElementById("id_messages_browse").style.display = "none";

	            //console.log("getInfoUser: getUserDataByEmail NO success");
	            //console.log("44444444444444444444444444444444444444444444");
	        }

	        //console.log("Success in getInfoUser? " + info.success);

	        //console.log("Email_friend: " + email_friend + "; email: " + email);  
	    }
	    else {
	        console.log("getInfoUser out");
	    }
	});
}


function postToWall_browse() {
	var content = document.getElementById("text_to_post_browse").value;
	var toEmail = email_friend;
	
	if (content == ""){
		show_errmessage("You must write something before post it.", "div_error_browse");
		return;
	}
    //This is to prevent posting blank text
	if (!content.replace(/\s/g, '').length) {
	    document.getElementById("text_to_post_browse").value = "";
	    show_errmessage("Text only contained whitespace (ie. spaces, tabs or line breaks)", "div_error_browse");
	    return;
	}
	
//////////	var result = serverstub.postMessage(sessionStorage.token, content, toEmail);
	dataObject11 = "token=" + sessionStorage.getItem("token") + "&message=" + content + "&email=" + toEmail;
	post("/postMessage", dataObject11, function (result) {
	    //////////	var result = serverstub.postMessage(sessionStorage.token, content, toEmail);
        if (result) {
            if (result.success) {
                refreshWall();
            } else {
                show_errmessage(result.message, "div_error_browse");
            }
            //console.log("postToWall: " + result.success + "; Email and content: " + toEmail + " :::: " + content);
        }
	});
}


function loadWall_browse () {
	
	if (email_friend == "") {
		show_errmessage("No friend serched.", "div_error_browse");
		return;
	}
	
//////////	var result = serverstub.getUserMessagesByEmail(sessionStorage.token,email_friend);
	dataObjectEE = "token=" + sessionStorage.getItem("token") + "&email=" + email_friend;
	post("/getUserMessagesByEmail", dataObjectEE, function (result) {
	    if (result) {
	        var place_to_post = document.getElementById("browse_messagesWall");

	        //reset Posts
	        place_to_post.innerHTML = "";

	        if (result.success) {
	            for (i = 0; i < result.data.length ; i++) {
	                place_to_post.innerHTML += '<div class="well well-sm"  draggable="true" ondragstart="drag(event)" id="BV_' + i + '"><h4>Post by: ' + result.data[i][0] + '</h4><p >' + result.data[i][1] + '</p></div>';
	            }
	        } else {
	            show_errmessage(result.message, "div_error_browse");
	        }
	    }
	});
	//console.log("LOAD WALL BROWSE");
	
}


// ===============================================================
// .....................Other Methods
// ===============================================================
function refreshWall(){
	if(document.getElementById("nav_browse").className == "active"){
		displayView();
		profile_display("nav_browse");
		//console.log("REFRESH WALL: nav_browse");
		return;
	}
	
	if(document.getElementById("nav_account").className == "active"){
		displayView();
		profile_display("nav_account");
		return;
	}
	
	displayView();
	//console.log("REFRESH WALL: nav_home");
}


function show_errmessage(message, errId) {
	if (errId == null) {
		var errId = "div_error";
	}
	
	var err = document.getElementById(errId);

	if (message == null) {
		err.innerHTML = "";
		document.getElementById(errId).style.display = "none";
	} else {
		//err.innerHTML = "";
		err.innerHTML = message;
		document.getElementById(errId).style.display = "block";;
	}
}

// LAB4 FUNCTIONS

// CHART
var chartInterval = null;

function initChart() {
    // Get the context
    var ctx = document.getElementById("mycanvas").getContext("2d");

    // Load initial data
    dto = "token=" + sessionStorage.getItem("token");
    post("/getchart", dto, function (result) {
        if (result.success) {
            var data = {
                labels: ["Messages posted", "Messages received", "Users Online"],
                
                datasets: [
                    {
                        label: "User statistics",
                        fillColor: "rgba(76, 175, 80,0.5)",
                        strokeColor: "rgba(220,220,220,0.8)",
                        highlightFill: "rgba(76, 175, 80,0.75)",
                        highlightStroke: "rgba(220,220,220,1)",
                        data: [result.data["sent"], result.data["received"], result.data["online"]]
                    }
                ]
            };

            var options = {
                scaleLineColor: "rgba(20,20,31,0.5)",
                scaleFontColor: "#14141f",
                scaleFontSize: 14,
            }

            // Get the context of the canvas element we want to select
            chart = new Chart(ctx).Bar(data, options);

            // to update the chart automatically
            chartInterval = setInterval(function () {
                // Request data from the database with websockets
                var update_chart = new Object();
                update_chart.id = "update_chart";
                update_chart.token = sessionStorage.getItem("token");
                //sendMessage(JSON.stringify(update_chart));
                ws.send(JSON.stringify(update_chart));
            }, 5000);

        } else {
            console.log("Can't initChart.")
        }
    });

}


// this function stops the chart updating
function endChart() {
    if (chartInterval == null) {
        console.log("Chart is null");
        return
    }
    else {
        clearInterval(chartInterval);
        console.log("Chart interval cleared");
        chartInterval = null;
        return
    }
}

function update_chart(sent, received, users) {
    // Updates the bar values
    chart.datasets[0].bars[0].value = sent;
    chart.datasets[0].bars[1].value = received;
    chart.datasets[0].bars[2].value = users;
    chart.update();
}
// END CHART

// DRAG&DROP

// Prevent default behaviour of drop zone
function allowDrop(ev) {
    /* The default handling is to not allow dropping elements. */
    /* Here we allow it by preventing the default behaviour. */
    ev.preventDefault();
    console.log("allowDrop")
}

function drag(ev) {
    /* Here is specified what should be dragged. */
    /* This data will be dropped at the place where the mouse button is released */
    /* Here, we want to drag the element itself, so we set it's ID. */
    ev.dataTransfer.setData("text", ev.target.id);
    console.log("drag(ev)")
}


function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    /* If you use DOM manipulation functions, their default behaviour it not to 
       copy but to alter and move elements. By appending a ".cloneNode(true)", 
       you will not move the original element, but create a copy. */
    var str = document.getElementById(data).innerHTML;
    res = str.replace(/<h4>|:|<\/p>/g, "").replace(/<\/h4><p>/g,": \r");

    ev.target.value = res;
    console.log(res)
    console.log("drop(ev)")
}

//END DRAG&DROP