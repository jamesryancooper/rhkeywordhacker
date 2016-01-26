//var restURL = "http://fairmarketing.cloudapp.net/rest1.0/kh_endpoint.jsp?"
//var downloadURL = "http://fairmarketing.cloudapp.net/rest1.0/servlet/ssd.DownloadInventoryReport?"
var restURL = "http://localhost:8084/rest1.0/kh_endpoint.jsp?"
//var downloadURL = "http://localhost:8084/rest1.0/servlet/ssd.DownloadInventoryReport"

function getURLParameter(name)
{
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCookie(paramName)
{
    var name = paramName + "=";
    var ca = document.cookie.split('; ');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

function logout()
{
    //Expire the cookies
    document.cookie = 'session_id=';
    document.cookie = 'project_id=';
    document.cookie = 'username=';
    document.cookie = 'email=';
    
    window.location = "index.html";
}

function loginAccount()
{
    var email = $('#user-email').val().trim();
    var password = $('#user-password').val().trim();

    if(email == '' || email.indexOf("@") == -1)
    {
        $("#login-response").html("Error: Please provide a valid email address.");
    }
    else if(password == '')
    {
        $("#login-response").html("Error: Please enter your password.");
    }
    else
    {
        //Show the spinner
        $("#login-response").html("<div class='three-quarters-loader-small'></div>");
        
        $.ajax({url: restURL, data: {'command':'loginAccount','username':email,'password':password}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    document.cookie = "username="+email;
                    document.cookie = "userFullName="+info.userfullname;
                    window.location = "dashboard.html";
                }
                else if(info.status == "error")
                {
                    $("#login-response").html(info.message);
                }
            }
        });
    }
}

function hideLogin()
{
    document.getElementById("dimmer").style.display = "none";
    document.getElementById("login-window").style.display = "none";
}

function showLogin()
{
    document.getElementById("login-window").style.display = "block";
    document.getElementById("dimmer").style.display = "block";
}

function hideAlert()
{
    document.getElementById("dimmer").style.display = "none";
    document.getElementById("alert-window").style.display = "none";
}

function showAlert(msgContent)
{
    $('#alert-msg-body').html(msgContent);
    document.getElementById("alert-window").style.display = "block";
    document.getElementById("dimmer").style.display = "block";
}

function remindPassword()
{
    var email = $('#user-email').val();
    
    if(email.trim() == '')
    {
        $("#login-response").html("Error: Please provide a valid email address.");
    }
    else
    {
        //Show the spinner
        $("#login-response").html("<div class='three-quarters-loader-small'></div>");
        
        $.ajax({url: restURL, data: {'command':'remindPassword','username':email}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    $("#login-response").html("Please check your email for a message from SSD Fair Marketing containing a new password for your account.");
                }
                else if(info.status == "error")
                {
                    $("#login-response").html("Error: We were unable to find an account under that email address.");
                }
            }
        });
    }
}

function getSessionID(callback)
{
    var sessionID = getCookie("session_id");
    if(sessionID == '' || sessionID == null)
    {
        $.ajax({url: restURL, data: {'command':'getSession'}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    sessionID = info.sessionid;
                    callback(sessionID);
                }
            }
        });
    }
    else
    {
        callback(sessionID);
    }
    
}

function createKeywordHackerProject(competitorURL)
{
    competitorURL = encodeURI(competitorURL);
    
    /*var username = getCookie("username");
    if(username == "")
    {
        username = "guest";
    }*/
    var username = "guest";
    
    getSessionID(function(sessionID){
        
        document.cookie = "session_id="+sessionID;
        //Once you have a valid session, create the project
        $.ajax({url: restURL, data: {'command':'createProject','username':username,'sessionID':sessionID,'competitorURL':competitorURL}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    var projectID = info.projectid;
                    document.cookie = "project_id="+projectID;
                    window.location = "gather.html";
                }
            }
        });
    });
}

function checkProjectDone()
{
    var projectID = getCookie("project_id");
    
    if(projectID != '')
    {
        setInterval(function(){
            
            $.ajax({url: restURL, data: {'command':'checkProjectDone','projectid':projectID}, type: 'post', async: true, success: function postResponse(returnData){
                    var info = JSON.parse(returnData);

                    if(info.status == "success")
                    {
                        if(info.completed == "yes")
                        {
                            window.location = "verify.html";
                        }
                    }
                }
            });
            
        },15000);
    }
}

function loadProjectDashboard()
{
    var username = getCookie("username");
    if(username != '')
    {    
        $.ajax({url: restURL, data: {'command':'getProjectDashboardData','username':username}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    var numProjects = parseInt(info.projectsCount);
                    var userFullName = info.userFullName;
                    
                    //Set the welcome message
                    $('#dashboard-user-full-name').html(userFullName);
                    
                    var finalOutput = "";
                    var colCounter = 0;
                    for(var i=0; i<numProjects; i++)
                    {
                        var entry = info.data[i];
                        
                        var projectID = entry.projectID;
                        var runDate = entry.runDate;
                        var percentComplete = parseFloat(entry.percentComplete);
                        var projectTitle = entry.projectTitle;
                        var completionEstimate = entry.completionEstimate;
                        
                        var cardHTML = "";
                        var ulHTMLBefore = "";
                        var ulHTMLAfter = "";
                        if(colCounter == 0)
                        {
                            //Create a new row
                            ulHTMLBefore = "<ul class=\"row\">\n";
                            ulHTMLAfter = "";
                        }
                        else if(colCounter == 2)
                        {
                            //terminate the row
                            ulHTMLBefore = "";
                            ulHTMLAfter = "</ul>\n";
                        }
                        else
                        {
                            //No row HTML needed
                            ulHTMLBefore = "";
                            ulHTMLAfter = "";
                        }
                        
                        //Create a card and add it to the div
                        if(percentComplete == 100)
                        {
                            cardHTML += "<li class=\"col-lg-4 matchheight\">\n";
                            cardHTML += "<div class=\"project-cart-box box-shadow-ot\">\n";
                            cardHTML += "<div class=\"card-header\">\n";
                            cardHTML += "<h1 class=\"project_name_sort\"><a href=\"report.html?pid="+projectID+"\">"+projectTitle+"</a></h1><br/><br/><div style='text-align:right;float:right;'><a style='cursor:pointer;color:#ec1c24;' onclick=\"confirmDelete('"+projectID+"');\">Delete</a></div>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "<div class=\"card-box-detail card-box-detail-outer\">\n";
                            cardHTML += "<ul class=\"you-v-them\">\n";
                            cardHTML += "<li class=\"col-lg-5 text-right\">YOU</li>\n";
                            cardHTML += "<li class=\"col-lg-2 text-center\">vs</li>\n";
                            cardHTML += "<li class=\"col-lg-5 text-left\">THEM</li>\n";
                            cardHTML += "</ul>\n";
                            cardHTML += "<h2>REVEALED</h2>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "<div class=\"card-box-bottom\">\n";
                            cardHTML += "<div style=\"color:#ffffff;\">&nbsp;</div>";
                            cardHTML += "<div class=\"project-date-card date_sort\"><i class=\"eagle-icon\"></i>"+runDate+"</div>\n";
                            cardHTML += "<a href=\"report.html?pid="+projectID+"\" class=\"project-status-card  project_status_sort\"> VIEW REPORT </a>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "</li>\n";
                        }
                        else
                        {
                            cardHTML += "<li class=\"col-lg-4 matchheight\">\n";
                            cardHTML += "<div class=\"project-cart-box box-shadow-ot\">\n";
                            cardHTML += "<div class=\"card-header\">\n";
                            cardHTML += "<h1 class=\"project_name_sort\"><a href=\"#\">"+projectTitle+"</a></h1><br/><br/><div style='text-align:right;float:right;'><a style='cursor:pointer;color:#ec1c24;' onclick=\"confirmDelete('"+projectID+"');\">Delete</a></div>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "<div class=\"report-processing card-box-detail card-box-detail-outer\">\n";
                            cardHTML += "<div class=\"blink\">\n";
                            cardHTML += "<img src=\"images/eagle-holder.png\" alt=\"\">\n";
                            cardHTML += "<h2> PROCESSING</h2>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "<div class=\"card-box-bottom\">\n";
                            cardHTML += "<div style=\"color:#242021;margin-top:5px;\">"+completionEstimate+"&nbsp;&nbsp;&nbsp;&nbsp;<font class=\"footnote\">?<span class=\"footnotetooltip\">Why does this take so long? Our system is currently crawling the web in real-time to ensure that we are gathering the freshest, most accurate and most complete data.</span></font></div>";
                            cardHTML += "<div class=\"progress\">\n";
                            cardHTML += "<div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\""+percentComplete+"\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:"+percentComplete+"%\">\n";
                            cardHTML += "<span class=\"sr-only\">"+percentComplete+"% Complete</span>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "</div>\n";
                            cardHTML += "</li>";
                        }
                        
                        finalOutput += ulHTMLBefore+cardHTML+ulHTMLAfter;
                        
                        colCounter++;
                        if(colCounter == 3)
                        {
                            colCounter = 0;
                        }
                        
                        if(i == (numProjects-1) && colCounter != 0)
                        {
                            //If it's the last project and you haven't finished the row, terminate the UL
                            finalOutput += "</ul>";
                        }
                    }
                    $('#card-container').html(finalOutput);
                }
            }
        });
    }
    else
    {
        window.location = "index.html";
    }
}

function loadProjectData()
{
    var projectID = getURLParameter("pid");
    if(projectID != '')
    {
        $.ajax({url: restURL, data: {'command':'getProjectData','projectid':projectID}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                //Save this to local storage so that it can be sent to the PDF printer service
                $('#json').val(returnData);

                if(info.status == "success")
                {
                    //Fill in the project data here
                    var entry = info.data[0];
                    
                    var userFullName = entry.userFullName;
                    var runDate = entry.runDate;
                    var projectTitle = entry.projectTitle;
                    var competitor1ID = entry.competitor1ID;
                    var competitor1URL = entry.competitor1URL;
                    var competitor2ID = entry.competitor2ID;
                    var competitor2URL = entry.competitor2URL;
                    var competitor3ID = entry.competitor3ID;
                    var competitor3URL = entry.competitor3URL;
                    var competitor4ID = entry.competitor4ID;
                    var competitor4URL = entry.competitor4URL;
                    var competitor5ID = entry.competitor5ID;
                    var competitor5URL = entry.competitor5URL;
                    var monthsList = entry.monthsList;
                        var monthsArray = monthsList.split(",");
                    var clientCounts = entry.clientCounts;
                    var competitorCounts = entry.competitorCounts;
                    
                        var clientMonthlyNumbers = clientCounts.split(",");
                        var clientTotalNum = 0;
                        for(var i=0; i<clientMonthlyNumbers.length; i++)
                        {
                            clientTotalNum += parseInt(clientMonthlyNumbers[i]);
                        }
                        var clientMonthlyNum = Math.ceil(clientTotalNum/12);
                        var clientWeeklyNum = Math.ceil(clientMonthlyNum/4);
                    
                        var competitorMonthlyNumbers = competitorCounts.split(",");
                        var competitorTotalNum = 0;
                        for(var i=0; i<competitorMonthlyNumbers.length; i++)
                        {
                            competitorTotalNum += parseInt(competitorMonthlyNumbers[i]);
                        }
                        var competitorMonthlyNum = Math.ceil(competitorTotalNum/12);
                        var competitorWeeklyNum = Math.ceil(competitorMonthlyNum/4);
                    
                    //Update the URLs list
                    $('#initialCompetitorURL').html(competitor1URL);
                    
                    //Add each additional URL if it's not NA
                    var competitorCount = 1;
                    
                    if(competitor2ID != "NA")
                    {
                        var htmlToAdd = "<li class=\"url-box\">" +
                                        "    <div class=\"url-label\"><span id=\"url-2\">"+competitor2URL+"</span><a href=\"#delete-url\" class=\"url-delete\" id=\""+competitor2ID+"\">X</a></div>" +
                                        //"    <input class=\"url-input\" value=\""+competitor2URL+"\" type=\"url\" placeholder=\"\" style=\"display:none;\">" +
                                        "</li>";
                        $('#url-list').append(htmlToAdd);
                        competitorCount++;
                    }
                    if(competitor3ID != "NA")
                    {
                        var htmlToAdd = "<li class=\"url-box\">" +
                                        "    <div class=\"url-label\"><span id=\"url-3\">"+competitor3URL+"</span><a href=\"#delete-url\" class=\"url-delete\" id=\""+competitor3ID+"\">X</a></div>" +
                                        //"    <input class=\"url-input\" value=\""+competitor3URL+"\" type=\"url\" placeholder=\"\" style=\"display:none;\">" +
                                        "</li>";
                        $('#url-list').append(htmlToAdd);
                        competitorCount++;
                    }
                    if(competitor4ID != "NA")
                    {
                        var htmlToAdd = "<li class=\"url-box\">" +
                                        "    <div class=\"url-label\"><span id=\"url-4\">"+competitor4URL+"</span><a href=\"#delete-url\" class=\"url-delete\" id=\""+competitor4ID+"\">X</a></div>" +
                                        //"    <input class=\"url-input\" value=\""+competitor4URL+"\" type=\"url\" placeholder=\"\" style=\"display:none;\">" +
                                        "</li>";
                        $('#url-list').append(htmlToAdd);
                        competitorCount++;
                    }
                    if(competitor5ID != "NA")
                    {
                        var htmlToAdd = "<li class=\"url-box\">" +
                                        "    <div class=\"url-label\"><span id=\"url-5\">"+competitor5URL+"</span><a href=\"#delete-url\" class=\"url-delete\" id=\""+competitor5ID+"\">X</a></div>" +
                                        //"    <input class=\"url-input\" value=\""+competitor5URL+"\" type=\"url\" placeholder=\"\" style=\"display:none;\">" +
                                        "</li>";
                        $('#url-list').append(htmlToAdd);
                        competitorCount++;
                    }
                    
                    var filename = window.location.href.substr(window.location.href.lastIndexOf("/")+1);
                    
                    if(competitorCount < 5 && filename.indexOf("print-report.html") == -1)
                    {
                        var htmlToAdd = "<li><a href=\"#add-more-url\" class=\"add-more-url\" id=\"button-add-url\"> + Add more</a></li>";
                        $('#url-list').append(htmlToAdd);
                    }
                    
                    //Monthly content types count
                    var blogCount = Math.ceil(parseFloat(entry.blog)/1);
                    var pressReleaseCount = Math.ceil(parseFloat(entry.pressRelease)/1);
                    var directoryCount = Math.ceil(parseFloat(entry.directory)/1);
                    var forumCount = Math.ceil(parseFloat(entry.forum)/1);
                    var imageCount = Math.ceil(parseFloat(entry.image)/1);
                    var ecommerceCount = Math.ceil(parseFloat(entry.ecommerce)/1);
                    var wikiCount = Math.ceil(parseFloat(entry.wiki)/1);
                    var socialCount = Math.ceil(parseFloat(entry.socialNetwork)/1);
                    var searchEngineCount = Math.ceil(parseFloat(entry.searchEngine)/1);
                    var portalCount = Math.ceil(parseFloat(entry.portal)/1);
                    var newsCount = Math.ceil(parseFloat(entry.newsSite)/1);
                    var genericCount = Math.ceil(parseFloat(entry.generic)/1);
                    var adultCount = Math.ceil(parseFloat(entry.adult)/1);
                    var gamblingCount = Math.ceil(parseFloat(entry.gambling)/1);
                    var warezCount = Math.ceil(parseFloat(entry.warez)/1);
                    var govCount = Math.ceil(parseFloat(entry.gov)/1);
                    var universityCount = Math.ceil(parseFloat(entry.university)/1);
                    var personalSiteCount = Math.ceil(parseFloat(entry.personalSite)/1);
                    var corporateCount = Math.ceil(parseFloat(entry.corporate)/1);
                    var infographicsCount = 0;
                        //Instead of infographics, we're going to take the monthly competitor count, subtract the categorized content, and set unclassified equal to the result
                        infographicsCount = Math.max(0,competitorMonthlyNum-(blogCount+pressReleaseCount+directoryCount+forumCount+imageCount+ecommerceCount+wikiCount+socialCount+searchEngineCount+portalCount+newsCount+genericCount+adultCount+gamblingCount+warezCount+govCount+universityCount+personalSiteCount+corporateCount));
                    
                    
                    //Update the elements on the report
                    if( $('#reportTitleSmall').length ) { $('#reportTitleSmall').html('> '+projectTitle); }
                    if( $('#welcomeUser').length ) { $('#welcomeUser').html(userFullName); }
                    
                    $('#preparedFor').html(userFullName);
                    $('#reportDate').html(runDate);
                    $('#reportTitleLarge').html(projectTitle);
                    $('#competitorCountAnnual').html(numberWithCommas(competitorTotalNum));
                    $('#competitorCountMonthly').html(numberWithCommas(competitorMonthlyNum));
                    $('#competitorCountWeekly').html(numberWithCommas(competitorWeeklyNum));
                    $('#clientCountAnnual').html(numberWithCommas(clientTotalNum));
                    $('#clientCountMonthly').html(numberWithCommas(clientMonthlyNum));
                    $('#clientCountWeekly').html(numberWithCommas(clientWeeklyNum));
                    
                        var clientDeficiencyAnnual = clientTotalNum - competitorTotalNum;
                        var annualSign = "";
                        if(clientDeficiencyAnnual > 0)
                        {
                            annualSign = "+";
                        }
                        var clientDeficiencyMonthly = clientMonthlyNum - competitorMonthlyNum;
                        var monthlySign = "";
                        if(clientDeficiencyMonthly > 0)
                        {
                            monthlySign = "+";
                        }
                        var clientDeficiencyWeekly = clientWeeklyNum - competitorWeeklyNum;
                        var weeklySign = "";
                        if(clientDeficiencyWeekly > 0)
                        {
                            weeklySign = "+";
                        }
                    $('#clientDeficiencyAnnual').html(annualSign+numberWithCommas(clientDeficiencyAnnual));
                    $('#clientDeficiencyMonthly').html(monthlySign+numberWithCommas(clientDeficiencyMonthly));
                    $('#clientDeficiencyWeekly').html(weeklySign+numberWithCommas(clientDeficiencyWeekly));
                    
                    
                    $('#blogCount').html(numberWithCommas(blogCount));
                    $('#pressReleaseCount').html(numberWithCommas(pressReleaseCount));
                    $('#directoryCount').html(numberWithCommas(directoryCount));
                    $('#forumCount').html(numberWithCommas(forumCount));
                    $('#imageCount').html(numberWithCommas(imageCount));
                    $('#infographicsCount').html(numberWithCommas(infographicsCount));
                    $('#ecommerceCount').html(numberWithCommas(ecommerceCount));
                    $('#wikiCount').html(numberWithCommas(wikiCount));
                    $('#socialCount').html(numberWithCommas(socialCount));
                    $('#searchEngineCount').html(numberWithCommas(searchEngineCount));
                    $('#portalCount').html(numberWithCommas(portalCount));
                    $('#newsCount').html(numberWithCommas(newsCount));
                    $('#genericCount').html(numberWithCommas(genericCount));
                    $('#adultCount').html(numberWithCommas(adultCount));
                    $('#gamblingCount').html(numberWithCommas(gamblingCount));
                    $('#warezCount').html(numberWithCommas(warezCount));
                    $('#govCount').html(numberWithCommas(govCount));
                    $('#universityCount').html(numberWithCommas(universityCount));
                    $('#personalSiteCount').html(numberWithCommas(personalSiteCount));
                    $('#corporateCount').html(numberWithCommas(corporateCount));
                    
                    //Draw the chart
                    var data = google.visualization.arrayToDataTable([
                        ['Year', 'THEM', 'YOU'],
                        [monthsArray[11], parseInt(competitorMonthlyNumbers[11]), parseInt(clientMonthlyNumbers[11])],
                        [monthsArray[10], parseInt(competitorMonthlyNumbers[10]), parseInt(clientMonthlyNumbers[10])],
                        [monthsArray[9], parseInt(competitorMonthlyNumbers[9]), parseInt(clientMonthlyNumbers[9])],
                        [monthsArray[8], parseInt(competitorMonthlyNumbers[8]), parseInt(clientMonthlyNumbers[8])],
                        [monthsArray[7], parseInt(competitorMonthlyNumbers[7]), parseInt(clientMonthlyNumbers[7])],
                        [monthsArray[6], parseInt(competitorMonthlyNumbers[6]), parseInt(clientMonthlyNumbers[6])],
                        [monthsArray[5], parseInt(competitorMonthlyNumbers[5]), parseInt(clientMonthlyNumbers[5])],
                        [monthsArray[4], parseInt(competitorMonthlyNumbers[4]), parseInt(clientMonthlyNumbers[4])],
                        [monthsArray[3], parseInt(competitorMonthlyNumbers[3]), parseInt(clientMonthlyNumbers[3])],
                        [monthsArray[2], parseInt(competitorMonthlyNumbers[2]), parseInt(clientMonthlyNumbers[2])],
                        [monthsArray[1], parseInt(competitorMonthlyNumbers[1]), parseInt(clientMonthlyNumbers[1])],
                        [monthsArray[0], parseInt(competitorMonthlyNumbers[0]), parseInt(clientMonthlyNumbers[0])]
                    ]);
                    var options = {
                        //chartArea:{ backgroundColor : {stroke:'#000',strokeWidth:10} },
                        chartArea: {left: 0, width: '100%'},
                        legend: {position: 'none'},
                        hAxis: {textPosition: 'none'},
                        vAxis: {textPosition: 'none', baselineColor: '#000', gridlines: {count: 0}},
                        series: {
                            0: {color: '#a9abaf', areaOpacity: 0.6},
                            1: {color: '#EB1C24', areaOpacity: 0.6},
                        }
                    };
                    var chart = new google.visualization.AreaChart(document.getElementById('chart_div2'));
                    chart.draw(data, options);
                    
                    //hide url-label and show url-input  <-- DON'T DO THIS; WE CAN'T JUST OVERWRITE AN EXISTING COMPETITOR; THEY HAVE TO BE DELETED AND A NEW ONE HAS TO BE ENTERED
                    /*$('#url-list').on('click', '.url-label', function () {
                        $(this).hide();
                        $(this).next('.url-input').show().focus();
                    });*/

                    //hide url-input and show url-label
                    $('#url-list').on('focusout', '.url-input', function () {
                        var url_val = $(this).val();
                        $(this).hide();
                        $(this).parents('li').find('.url-label').show();
                        
                        var addListValue = $('#add-url-list').val();
                        if(addListValue == "")
                        {
                            addListValue = url_val;
                        }
                        else
                        {
                            addListValue += "," + url_val;
                        }
                        $('#add-url-list').val(addListValue);
                    });

                    //put  url-input value in url-label
                    $('#url-list').on('keyup', '.url-input', function () {
                        var url_val = $(this).val();
                        $(this).parents('li').find('.url-label span').html(url_val);
                    });
                    
                    // Delete parent li on click
                    $("#url-list").on('click', '.url-delete', function (event) {
                        event.preventDefault();
                        var deleteListValue = $('#delete-url-list').val();
                        if(deleteListValue == "")
                        {
                            deleteListValue = $(this).attr("id");
                        }
                        else
                        {
                            deleteListValue += "," + $(this).attr("id");
                        }
                        $('#delete-url-list').val(deleteListValue);
                        
                        $(this).parents('li').remove();
                        toggle_add_more();
                    });

                    $("a#button-add-url").click(function (event) {
                        event.preventDefault();
                        var url_box = $("#url-box-template").html();
                        $(this).parent().before(url_box);
                        toggle_add_more();
                    });

                    // show or hide add more button
                    function toggle_add_more() {
                        var url_boxes = $(".url-box").length;

                        if (url_boxes >= 5) {
                            $("a#button-add-url").hide();
                        } else {
                            $("a#button-add-url").show();
                        }
                    }

                    // Select all elements with data-toggle="popover" in the document
                    $('[data-toggle="popover"]').popover();
                }
            }
        });
    }
    else
    {
        window.location = "dashboard.html";
    }
}

function deleteProject(projectID)
{
    if(projectID != '')
    {   
        $.ajax({url: restURL, data: {'command':'deleteProject','projectid':projectID}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    window.location = "dashboard.html";
                }
            }
        });
    }
}

function validateURL(url)
{
    var validTLDs = [".com",".org",".net",".int",".edu",".gov",".mil",".arpa",".ac",".ad",".ae",".af",".ag",".ai",".al",".am",".an",".ao",".aq",".ar",".as",".at",".au",".aw",".ax",".az",".ba",".bb",".bd",".be",".bf",".bg",".bh",".bi",".bj",".bm",".bn",".bo",".bq",".br",".bs",".bt",".bv",".bw",".by",".bz",".ca",".cc",".cd",".cf",".cg",".ch",".ci",".ck",".cl",".cm",".cn",".co",".cr",".cu",".cv",".cw",".cx",".cy",".cz",".de",".dj",".dk",".dm",".do",".dz",".ec",".ee",".eg",".eh",".er",".es",".et",".eu",".fi",".fj",".fk",".fm",".fo",".fr",".ga",".gb",".gd",".ge",".gf",".gg",".gh",".gi",".gl",".gm",".gn",".gp",".gq",".gr",".gs",".gt",".gu",".gw",".gy",".hk",".hm",".hn",".hr",".ht",".hu",".id",".ie",".il",".im",".in",".io",".iq",".ir",".is",".it",".je",".jm",".jo",".jp",".ke",".kg",".kh",".ki",".km",".kn",".kp",".kr",".krd",".kw",".ky",".kz",".la",".lb",".lc",".li",".lk",".lr",".ls",".lt",".lu",".lv",".ly",".ma",".mc",".md",".me",".mg",".mh",".mk",".ml",".mm",".mn",".mo",".mp",".mq",".mr",".ms",".mt",".mu",".mv",".mw",".mx",".my",".mz",".na",".nc",".ne",".nf",".ng",".ni",".nl",".no",".np",".nr",".nu",".nz",".om",".pa",".pe",".pf",".pg",".ph",".pk",".pl",".pm",".pn",".pr",".ps",".pt",".pw",".py",".qa",".re",".ro",".rs",".ru",".rw",".sa",".sb",".sc",".sd",".se",".sg",".sh",".si",".sj",".sk",".sl",".sm",".sn",".so",".sr",".ss",".st",".su",".sv",".sx",".sy",".sz",".tc",".td",".tf",".tg",".th",".tj",".tk",".tl",".tm",".tn",".to",".tp",".tr",".tt",".tv",".tw",".tz",".ua",".ug",".uk",".us",".uy",".uz",".va",".vc",".ve",".vg",".vi",".vn",".vu",".wf",".ws",".ye",".yt",".za",".zm",".zw"];
    var isValid = false;
    for(var i=0; i<validTLDs.length; i++)
    {
        if(url.indexOf(validTLDs[i]) > -1)
        {
            isValid = true;
        }
    }
    return isValid;
}

function gotoCreateProject()
{
    window.location = "createproject.html";
}

function unitTest()
{
    /*var projectID = "227";
    
    //Hide the button so users don't hit it more than once
    $('#refresh-div').html("Working...");
    var deleteList = '';
    var addList = '';
    
    if(projectID != '' && getCookie("username") == 'hkpatel187@hotmail.com')
    {
        confirm("refreshing project: "+projectID+" without adding/removing urls");
        
        $.ajax({url: restURL, data: {'command':'refreshProject','projectid':projectID,'deleteList':deleteList,'addList':addList}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    window.location = "dashboard.html";
                }
            }
        });
    }*/
}