var restURL = "http://fairmarketing.cloudapp.net/rest1.0/kh_endpoint.jsp?"
//var downloadURL = "http://fairmarketing.cloudapp.net/rest1.0/servlet/ssd.DownloadInventoryReport?"
//var restURL = "http://localhost:8084/rest1.0/kh_endpoint.jsp?"
//var downloadURL = "http://localhost:8084/rest1.0/servlet/ssd.DownloadInventoryReport"

var sort_by = function(field, reverse, primer){
   var key = function (x) {return primer ? primer(x[field]) : x[field]};

   return function (a,b) {
	  var A = key(a), B = key(b);
	  return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];                  
   }
}

function date_sort_asc(a, b) {
    return new Date(a.runDateRaw).getTime() - new Date(b.runDateRaw).getTime();
}

function date_sort_desc(a, b) {
    return new Date(b.runDateRaw).getTime() - new Date(a.runDateRaw).getTime();
}

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

function createKeywordHackerProject()
{
    var projectURL = $('#project-url').val();
    var projectLocation = $('#project-location').val();
    var currentKeywordCount = parseInt($('#keyword-count').val());
    
    var username = getCookie("username");
    if(username == "")
    {
        window.location = 'index.html';
    }
    else if(projectURL.trim() == '')
    {
        showAlert("Please enter the project URL.");
    }
    else if(projectLocation.trim() == '')
    {
        showAlert("Please enter the project location.");
    }
    else if(currentKeywordCount == 0)
    {
        showAlert("Please enter at least one keyword phrase.");
    }
    else
    {
        //Show the spinner
        $("#submit-button-block").html("<div class='three-quarters-loader-small' style='float:right;margin-right:60px;'></div>");
        //projectURL = encodeURI(projectURL);
        
        //Build the keywords list
        var keywordsList = "";
        for(var i=1; i<=currentKeywordCount; i++)
        {
            var keywordString = $('#keyword'+i).html();
            var keywordEndLoc = keywordString.indexOf("<span");
            var keyword = keywordString.substring(0,keywordEndLoc);
            if(keywordsList == "")
            {
                //keywordsList = i+"="+keyword;
                keywordsList = keyword;
            }
            else
            {
                //keywordsList += ";"+i+"="+keyword;
                keywordsList += ";"+keyword;
            }
        }
        //keywordsList = encodeURI(keywordsList);
        
        var monthlyVisitors = $('#ex6SliderVal').val();
        var payingCustomers = $('#ex7SliderVal').val();
        var customerValue = $('#ex8SliderVal').val();
        var costPerLevel = $('#ex9SliderVal').val();
        
        /*console.log("proj url  = "+projectURL);
        console.log("location  = "+projectLocation);
        console.log("keywords  = "+keywordsList);
        console.log("visitors  = "+monthlyVisitors);
        console.log("customers = "+payingCustomers);
        console.log("custvalue = "+customerValue);*/
        
        
        //Once you have required info, create the project
        $.ajax({url: restURL, data: {'command':'createKHProject','username':username,'projectURL':projectURL,'projectLocation':projectLocation,'keywords':keywordsList,'monthlyVisitors':monthlyVisitors,'payingCustomers':payingCustomers,'customerValue':customerValue,'costPerLevel':costPerLevel}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    window.location = "dashboard.html";
                }
                else
                {
                    $("#submit-button-block").html("<a class=\"orange-btn btn pull-right\" onclick=\"createKeywordHackerProject();\">FINISH</a>");
                    showAlert(info.message);
                }
            }
        });
    }
}

function loadProjectDashboard(flip)
{
    var username = getCookie("username");
    if(username != '')
    {
        $.ajax({url: restURL, data: {'command':'getProjectDashboardData','username':username}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    //Save this to local storage so that it can be used to populate the HTML using any sort method
                    $('#json').val(returnData);
                    var sortMethod = $('#curr_sort').val();
                    //var reversed = $('#curr_sort_reversed').val();
                    
                    //$('#curr_sort').val("runDate");
                    //$('#curr_sort_reversed').val("false");
                    
                    var userFullName = info.userFullName;
                    
                    //Set the welcome message
                    $('#dashboard-user-full-name').html("welcome <strong>"+userFullName+"</strong> <strong>[</strong> manage your missions below <strong>]</strong>");
                    
                    //Populate the cards based on a default sort of create date
                    displayDashboardCards(sortMethod,flip);
                }
            }
        });
    }
    else
    {
        window.location = "index.html";
    }
}

function displayDashboardCards(sortMethod,flip)
{
    var returnData = $('#json').val();
    //console.log(returnData);
    var currSortMethod = $('#curr_sort').val();
    var sortMethodReversed = $('#curr_sort_reversed').val();
    
    var reversed;
    
    var info = JSON.parse(returnData);
    var data = info.data;
    
    
    if(sortMethod == 'runDate')
    {
        if(sortMethod == currSortMethod)
        {
            if(sortMethodReversed == "true" && flip)
            {
                reversed = false;
                data.sort(date_sort_asc);
            }
            else
            {
                reversed = true;
                data.sort(date_sort_desc);
            }
        }
    }
    else if(sortMethod == 'project')
    {
        if(sortMethod == currSortMethod)
        {
            if(sortMethodReversed == "true" && flip)
            {
                reversed = false;
            }
            else
            {
                reversed = true;
            }
        }
        data.sort(sort_by('projectID', reversed, parseInt));
    }
    else if(sortMethod == 'status')
    {
        if(sortMethod == currSortMethod)
        {
            if(sortMethodReversed == "true" && flip)
            {
                reversed = false;
            }
            else
            {
                reversed = true;
            }
        }
        data.sort(sort_by('completed', reversed, parseInt));
    }
    
    //Save the new sort method and reversed status
    $('#curr_sort').val(sortMethod);
    $('#curr_sort_reversed').val(reversed);
    
    
    
    var finalOutput = "";
    var cardHTML = "<ul class=\"row grid\">";
    
    var numProjects = info.projectsCount;
    
    for(var i=0; i<numProjects; i++)
    {
        var entry = info.data[i];

        var projectID = entry.projectID;
        var runDate = entry.runDate;
        var numberOfKeywords = entry.keywordCount;
        var completed = entry.completed;
        var active = entry.active;
        var monthlyVisitors = entry.monthlyVisitors;
        var payingCustomers = entry.payingCustomers;
        var valuePerCustomer = entry.valuePerCustomer;
        var costPerLevel = entry.costPerLevel;
        var totalPowerLevel = entry.totalPowerLevel;
        var incomingTraffic = Math.round(entry.incomingTraffic,0);
        var projectTitle = entry.projectTitle;

        var activeString = "ACTIVE";
        
        var monthlyCustomers = Math.round(incomingTraffic * (payingCustomers / monthlyVisitors),0);
        var monthlySales = Math.round(monthlyCustomers * valuePerCustomer,0);
        var marketingCosts = numberWithCommas(Math.round((totalPowerLevel * costPerLevel),0)) + "/mo.";
        var costPerMonth = Math.round((totalPowerLevel * costPerLevel),0);
        var keywordNetWorth = numberWithCommas(monthlySales - costPerMonth);

        var keywordNetWorthString = "";
        var anchorAhref = "";
        if(completed != 1)
        {
            keywordNetWorthString = "<span style=\"color:red;display:block;\" class=\"loader__dot\">calculating...</span>";
            anchorAhref = "onclick=\"'';\"";
        }
        else
        {
            keywordNetWorthString = "$"+keywordNetWorth;
            anchorAhref = "onclick=\"window.location='keywordhacker.html?pid="+projectID+"';\"";
        }

        if(active != '1')
        {
            activeString = "INACTIVE";
        }


        //Create a card and add it to the div
        //if(completed == '1')
        if(true)
        {
            cardHTML += "<li class=\"col-lg-4 matchheight element-item\">";
            cardHTML += "<div class=\"project-cart-box box-shadow-ot\">";
            cardHTML += "<div class=\"card-header\">";
            cardHTML += "<h2 style=\"clear:both;text-align:right;margin-top:-10px;\"><a style=\"cursor:pointer;\" class=\"edit-icon\" title=\"Edit Project\" onclick=\"displayProjectEditWindow('"+projectID+"');\"></a><a style=\"cursor:pointer;color:rgba(61,61,61,.25);\" title=\"Download\" class=\"download-icon\" onclick=\"javascript:void(0);\"></a><a style=\"cursor:pointer;\" class=\"delete-icon\" title=\"Delete Project\" onclick=\"displayProjectDeleteWindow('"+projectID+"');\"></a></h2>";
            cardHTML += "<h1 class=\"project_name_sort\"><label for=\"chk-content-all1\"></label><a style=\"cursor:pointer;\" "+anchorAhref+">"+projectTitle+"</a></h1>";
            cardHTML += "</div>";
            cardHTML += "<a style=\"cursor:pointer;\" "+anchorAhref+" class=\"module-link keyword-hacker-module\">";
            cardHTML += "<h2 class=\"module-heading text-left\">KEYWORD HACKER MODULE</h2>";
            cardHTML += "<div class=\"module-detail-section\">";
            cardHTML += "<div class=\"row\">";
            cardHTML += "<div class=\"col-lg-2 project-icon\"><i class=\"black-box-rh\"> </i></div>";
            cardHTML += "<div class=\"col-lg-10 module-details-outer\">";
            cardHTML += "<div class=\"col-lg-6  module-details-left\">";
            cardHTML += "<h2 class=\"module-heading\"># of keywords<span>"+numberOfKeywords+"</span></h2>";
            cardHTML += "<h2 class=\"module-heading\">Power level sum<span>"+totalPowerLevel+"</span></h2>";
            cardHTML += "</div>";
            cardHTML += "<div class=\"col-lg-6 module-details-right\">";
            cardHTML += "<h2 class=\"module-heading\">Keyword net worth<span>"+keywordNetWorthString+"</span></h2>";
            cardHTML += "<h2 class=\"module-heading\">Marketing costs<span>$"+marketingCosts+"</span></h2>";
            cardHTML += "</div>";
            cardHTML += "</div>";
            cardHTML += "</div>";
            cardHTML += "</div>";
            cardHTML += "</a>";
            cardHTML += "<a style=\"cursor:default;\" class=\"module-link content-hacker-module\">";
            cardHTML += "<h2 class=\"module-heading text-left\">Content Hacker Module</h2>";
            cardHTML += "<div class=\"module-detail-section\">";
            cardHTML += "<div class=\"row\">";
            cardHTML += "<div class=\"col-lg-2 project-icon\"><i class=\"black-box-rh\"> <span class=\"notification-count\"></span></i></div>";
            cardHTML += "<div class=\"col-lg-10 module-details-outer\">";
            cardHTML += "<div class=\"col-lg-6  module-details-left\">";
            cardHTML += "<h2 class=\"module-heading\"># of blueprints<span>--</span></h2>";
            cardHTML += "<h2 class=\"module-heading\">Content Goal<span>--</span></h2>";
            cardHTML += "</div>";
            cardHTML += "<div class=\"col-lg-6 module-details-right\">";
            cardHTML += "<h2 class=\"module-heading\">PG one rankings<span>--</span></h2>";
            cardHTML += "<h2 class=\"module-heading\">Content Budget<span>--</span></h2>";
            cardHTML += "</div>";
            cardHTML += "</div>";
            cardHTML += "</div>";
            cardHTML += "</div>";
            cardHTML += "</a>";
            cardHTML += "<div class=\"card-box-bottom\">";
            cardHTML += "<div class=\"project-date-card date_sort\"><i class=\"eagle-icon\"></i>"+runDate+"</div>";
            cardHTML += "<a style=\"cursor:pointer;\" "+anchorAhref+" class=\"project-status-card  project_status_sort \" href=\"javascript:void(0);\"> "+activeString+" </a>";
            cardHTML += "</div>";
            cardHTML += "</div>";
            cardHTML += "</li>";
        }
    }

    var addMoreHTML = "<li class=\"col-lg-4 matchheight\">" +
                        "<div class=\"active-link-outer\"><span class=\"active-new-project-link\"> <a style=\"cursor:pointer;\" onclick=\"gotoCreateProject();\">[ Activate New Project ]</a> </span></div>" +
                        "</li>" +
                    "</ul>";

    finalOutput = cardHTML+addMoreHTML;

    $('#card-container').html(finalOutput);
}

function loadProjectData()
{
    var projectID = getURLParameter("pid");
    if(projectID != '')
    {
        $.ajax({url: restURL, data: {'command':'getProjectData','projectid':projectID}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    //Save this to local storage so that it can be sent to the PDF printer service
                    $('#json').val(returnData);
                    displayProjectInfo();
                }
            }
        });
    }
    else
    {
        window.location = "dashboard.html";
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

function addKeyword(e)
{
    if(e.keyCode == 13)
    {
        var keyword = $('#new-keyword').val();
        var currentKeywordCount = $('#keyword-count').val();

        if(keyword.trim() !== '')
        {
            var existingKeywords = $('#ctc').html();
            var newKeywordCount = parseInt(currentKeywordCount)+1;
            var newKeywords = existingKeywords + "<li id=\"keyword"+newKeywordCount+"\">"+keyword+"<span style=\"padding:5px;color:#ec1c24;font-weight:bold;cursor:pointer;\" id=\"remove-keyword"+newKeywordCount+"\" title=\"Remove\" onclick=\"removeKeyword(this);\">X</span></li>";
            $('#ctc').html(newKeywords);
            
            $('#new-keyword').val('');
            $('#keyword-count').val(newKeywordCount);
        }
    }
}

function removeKeyword(element)
{
    var currentKeywordCount = parseInt($('#keyword-count').val());
    var id = element.getAttribute('id').replace('remove-keyword','');
    var idValue = parseInt(id);
    
    $('#keyword'+idValue).remove();
    
    if(idValue < currentKeywordCount)
    {
        var startingVal = idValue + 1;
        //Re-number the items behind this one so that we have an accurate count
        for(var i=startingVal; i<=currentKeywordCount; i++)
        {
            var newIDString = "keyword"+(i-1);
            var newRemoveString = "remove-keyword"+(i-1);
            $('#keyword'+i).attr("id",newIDString);
            $('#remove-keyword'+i).attr("id",newRemoveString);
        }
    }
    
    $('#keyword-count').val(currentKeywordCount-1);
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

function displayProjectInfo()
{
    var returnData = $('#json').val();
    var info = JSON.parse(returnData);
    
    //Fill in the project data here
    var projectInfo = info.projectSummary;
        var projectID = projectInfo.projectID;
        var runDate = projectInfo.runDate;
        var costPerLevel = projectInfo.costPerLevel;
        var searchVolume = projectInfo.searchVolume;
        var clientURL = projectInfo.clientURL;
        var valuePerCustomer = projectInfo.valuePerCustomer;
        var active = projectInfo.active;
        var completed = projectInfo.completed;
        var clientDA = projectInfo.clientDA;
        var clientPA = projectInfo.clientPA;
        var clientPowerLevel = Math.max(1,Math.round((clientDA+clientPA)/2/10,0));
        var totalPowerLevel = projectInfo.totalPowerLevel
        var incomingTraffic = Math.round(projectInfo.incomingTraffic,0);
        var runDateRaw = projectInfo.runDateRaw;
        var keywordCount = projectInfo.keywordCount;
        var geoLocation = projectInfo.geoLocation;
        var monthlyVisitors = projectInfo.monthlyVisitors;
        var payingCustomers = projectInfo.payingCustomers;
        
        var monthlyCustomers = Math.round(incomingTraffic * (payingCustomers / monthlyVisitors),0);
        var monthlySales = Math.round(monthlyCustomers * valuePerCustomer,0);
        var costPerMonth = Math.round((totalPowerLevel * costPerLevel),0);
        var keywordNetWorth = (monthlySales - costPerMonth);
        
        var customerConversionRate = (payingCustomers / monthlyVisitors);
            
            
        var netWorthStyle = "green-text";
        if(keywordNetWorth < 0 || completed != 1)
        {
            netWorthStyle = "red-text";
        }
        
        var keywordNetWorthString = "";
        if(completed != 1)
        {
            keywordNetWorthString = "<span style=\"font-size:15px;color:red;\">calculating...</span>";
        }
        else
        {
            keywordNetWorthString = "$"+numberWithCommas(keywordNetWorth);
        }
        
        var activeString = "";
        if(active == 1)
        {
            activeString = "ACTIVE";
        }
        else
        {
            activeString = "INACTIVE";
        }
        
        $('#projectTitle').html(clientURL);
        $('#numKeywords').html(keywordCount);
        $('#geoLocation').html("<h2>"+geoLocation+"<!--<a class=\"edit-icon\" title=\"Edit Location\"></a>--></h2>");
        $('#searchVolume').html("<h2>"+numberWithCommas(searchVolume)+"<span>MO,SEARCH VOLUME<a class=\"info-icon\" title=\"This is the total sum of monthly search volume for all selected keywords in this project.\"></a></span></h2>");
        $('#projectedVisitors').html("<h2>"+numberWithCommas(incomingTraffic)+"<span>PROJECTED MO. VISITORS<a class=\"info-icon\" title=\"Calculated by applying the average CTR for your competitors to Mo. Search Volume.\"></a></span></h2>");
        $('#projectedCustomers').html("<h2>"+numberWithCommas(Math.round(incomingTraffic * (payingCustomers / monthlyVisitors),0))+"<span>PROJECTED MO. CUSTOMERS<a class=\"info-icon\" title=\"Calculated based on your conversion rate.\"></a></span></h2>");
        $('#projectedSales').html("<h2>$"+numberWithCommas(monthlySales)+"<span>PROJECTED MO. SALES<a class=\"info-icon\" title=\"Calculated based on your conversion rate and customer value.\"></a></span></h2>");
        $('#costPerMonth').html("<h2>$"+numberWithCommas(costPerMonth)+"<a class=\"edit-icon\" title=\"Edit Costs\"></a><span>COST PER MONTH<a class=\"info-icon\" title=\"This is the total sum of monthly costs for all selected keywords in this project.\"></a></span></h2>");
        $('#kwNetWorth').html("<h2 class=\""+netWorthStyle+"\">"+keywordNetWorthString+"<span>KEYWORD NET-WORTH<a class=\"info-icon\" title=\"This is the projected return on your invested marketing dollars for all selected keywords in this project.\"></a></span></h2>");
        $('#dateDivBottom').html("<div class=\"project-date-card date_sort\"><i class=\"eagle-icon\"></i>"+runDate+"</div><a class=\"project-status-card  project_status_sort\" href=\"javascript:void(0);\">"+activeString+"</a>");

    //Fill in the keyword data here
    var accordianHTML = "";
    var keywordInfo = info.keywordData;
    for(var i=0; i<keywordInfo.length; i++)
    {
        var thisEntry = keywordInfo[i];
        var thisCompetitorArray = thisEntry.competitorData;
        
        var keywordID = thisEntry.keywordID;
        var searchVolume = thisEntry.searchVolume;
        var clientRanking = thisEntry.clientRanking;
        var keywordActive = thisEntry.active;
        var avgCTR = thisEntry.avgCTR;
        var totalPowerLevel = thisEntry.totalPowerLevel;     //Add back the client power level to the total power level for this keyword
        var keyword = thisEntry.keyword;
        
        var monthlyVisitors = Math.round(searchVolume * avgCTR,0);
        var monthlyCustomers = Math.round(monthlyVisitors * customerConversionRate,0);
        var monthlySales = Math.round(monthlyCustomers * valuePerCustomer,0);
        var costPerMonth = Math.round((totalPowerLevel - clientPowerLevel) * costPerLevel, 0);
        var keywordNetWorth = (monthlySales - costPerMonth);
        
        var powerLevelGoal = Math.max(1,(totalPowerLevel - clientPowerLevel));
        
        var keywordCheckboxStatus = "";
        if(keywordActive == 1)
        {
            keywordCheckboxStatus = "checked";
        }
        
        //Add the header info for the accordian HTML
        accordianHTML += "<div class=\"panel panel-default keyword-phraser-row\">"+
                            "<ul role=\"tab\" id=\"keyword-phraser-heading"+i+"\">"+
                                "<li class=\"checkbox-outer width-2-5\">"+
                                    "<h2>"+
                                        "<input type=\"checkbox\" "+keywordCheckboxStatus+" id=\"chk-content-all-kw"+keywordID+"\" onchange=\"toggleKeyword('"+keywordID+"',this.checked);\">"+
                                        "<label for=\"chk-content-all-kw"+keywordID+"\"></label>"+
                                    "</h2>"+
                                "</li>"+
                                "<li class=\"keyword-phraser-tittle width-20\">"+
                                    "<h2><a data-toggle=\"collapse\" data-parent=\"#keyword-phraser-accordion\" href=\"#keyword-phraser-collapse"+i+"\" aria-expanded=\"true\" aria-controls=\"keyword-phraser-collapse"+i+"\">"+keyword+"</a></h2>"+
                                "</li>"+
                                "<li class=\"power-goal-info width-7\" id=\"kwid-"+keywordID+"-plg-1\">"+
                                    "<h2>"+powerLevelGoal+"<a data-toggle=\"collapse\" data-parent=\"#keyword-phraser-accordion\" href=\"#keyword-phraser-collapse"+i+"\" aria-expanded=\"true\" aria-controls=\"keyword-phraser-collapse"+i+"\" class=\"rh-view-icon\"> </a></h2>"+
                                "</li>"+
                                "<li class=\"monthly-organic-info width-10\" id=\"kwid-"+keywordID+"-search-volume\">"+
                                    "<h2>"+numberWithCommas(searchVolume)+"</h2>"+
                                "</li>"+
                                "<li class=\"monthly-visitors-info width-10\" id=\"kwid-"+keywordID+"-monthly-visitors\">"+
                                    "<h2>"+numberWithCommas(monthlyVisitors)+"</h2>"+
                                "</li>"+
                                "<li class=\"monthly-customers-info width-12\" id=\"kwid-"+keywordID+"-monthly-customers\">"+
                                    "<h2>"+numberWithCommas(monthlyCustomers)+"</h2>"+
                                "</li>"+
                                "<li class=\"monthly-sales-info width-10\" id=\"kwid-"+keywordID+"-monthly-sales\">"+
                                    "<h2>$"+numberWithCommas(monthlySales)+"</h2>"+
                                "</li>"+
                                "<li class=\"cost-monthly-info width-7\" id=\"kwid-"+keywordID+"-cost-per-month\">"+
                                    "<h2>$"+numberWithCommas(costPerMonth)+"</h2>"+
                                "</li>"+
                                "<li class=\"keyword-net-worth-info width-7\" id=\"kwid-"+keywordID+"-kw-net-worth\">"+
                                    "<h2 class=\"\">$"+numberWithCommas(keywordNetWorth)+"</h2>"+
                                "</li>"+
                                "<li class=\"content-blueprint-info width-10\">"+
                                    "<h2><a class=\"blueprint-links\">CREATE BLUEPRINT </a></h2>"+
                                "</li>"+
                                "<li class=\"delete-row width-2-5\">"+
                                    "<h2><span class=\"delete-icon\"></span></h2>"+
                                "</li>"+
                            "</ul>";
        
        //Let's first build the "THEM" table so that we can determine if they hav a power level goal of 9 (need to know whether to show the warning message)
        var competitorHTML = "<div class=\"col-lg-6 them-power-summary-section\">" +
                "<h2 class=\"power-summary-heading\"><span class=\"tag-label\">them</span> COMPETITOR AVERAGE RANKING POWER LEVEL IS <span class=\"total-power-summery\" id=\"kwid-"+keywordID+"-total-power-summary\">"+totalPowerLevel+"</span></h2>"+
                "<div class=\"divider\"></div>"+
                "<ul class=\"power-summary-row power-summary-heading-row\">"+
                    "<li class=\"checkbox-outer col-lg-1\"> &nbsp; </li>"+
                    "<li class=\"keyword-phraser-tittle col-lg-2\">"+
                        "<h2>Google Rank</h2>"+
                    "</li>"+
                    "<li class=\"power-goal-info col-lg-6\">"+
                        "<h2>Their URL</h2>"+
                    "</li>"+
                    "<li class=\"power-goal-info col-lg-1\">"+
                        "<h2>CTR<a class=\"info-icon\" title=\"Click Through Rate for the ranking position and current keyword.\"> </a></h2>"+
                    "</li>"+
                    "<li class=\"monthly-organic-info col-lg-1\">"+
                        "<h2>Power Level<a class=\"info-icon\" title=\"Represents the level of marketing effort required for each keyword.\"></a></h2>"+
                    "</li>"+
                "</ul>";
        
        var showWarning = false;
        
        for(var j=0; j<thisCompetitorArray.length; j++)
        {
            var thisCompetitor = thisCompetitorArray[j];
            
            var competitorID = thisCompetitor.competitorID;
            var competitorActive = thisCompetitor.active;
            var competitorPositionRank = thisCompetitor.positionRank;
            var competitorURL = thisCompetitor.url;
                var competitorURLShort = competitorURL.substring(0,35)+"...";
            var competitorCTR = Math.round(thisCompetitor.traffic);
            var competitorPowerLevel = Math.round((thisCompetitor.DA+thisCompetitor.PA)/2/10);
            
            if(competitorPowerLevel > 9)
            {
                showWarning = true;
            }
            var competitorCheckboxStatus = "";
            if(competitorActive == 1)
            {
                competitorCheckboxStatus = "checked";
            }
            
            competitorHTML += "<ul class=\"power-summary-row\">"+
                                "<li class=\"checkbox-outer col-lg-1\">"+
                                    "<h2>"+
                                        "<input type=\"checkbox\" "+competitorCheckboxStatus+" id=\"chk-content-all-c"+competitorID+"\" onchange=\"toggleCompetitor('"+competitorID+"',this.checked);\">"+
                                        "<label for=\"chk-content-all-c"+competitorID+"\"></label>"+
                                    "</h2>"+
                                "</li>"+
                                "<li class=\"col-lg-2\">"+
                                    "<h2>"+competitorPositionRank+"</h2>"+
                                "</li>"+
                                "<li class=\"power-goal-info col-lg-6\">"+
                                    "<h2 title=\""+competitorURL+"\">"+competitorURLShort+"</h2>"+
                                "</li>"+
                                "<li class=\"power-goal-info col-lg-1\">"+
                                    "<h2>"+competitorCTR+"%</h2>"+
                                "</li>"+
                                "<li class=\"col-lg-1\">"+
                                    "<h2>"+competitorPowerLevel+"</h2>"+
                                "</li>"+
                            "</ul>";
        }
        competitorHTML += "</div>";
        
        //Now put the info for client ranking power
        accordianHTML += "<div id=\"keyword-phraser-collapse"+i+"\" class=\"panel-collapse collapse \" role=\"tabpanel\" aria-labelledby=\"keyword-phraser-heading"+i+"\">"+
                            "<div class=\"power-level-summary\">"+
                                "<div class=\"col-lg-6 you-power-summary-section\">"+
                                    "<h2 class=\"power-summary-heading\"><span class=\"tag-label\">YOU</span> YOUR RANKING POWER IS <span class=\"total-power-summery\">"+clientPowerLevel+"</span></h2>"+
                                    "<div class=\"divider\"></div>"+
                                    "<ul class=\"power-summary-row power-summary-heading-row\">"+
                                        "<li class=\"checkbox-outer col-lg-1\"> &nbsp; </li>"+
                                        "<li class=\"keyword-phraser-tittle col-lg-2\">"+
                                            "<h2>Google Rank</h2>"+
                                        "</li>"+
                                        "<li class=\"power-goal-info col-lg-7\">"+
                                            "<h2>Your URL</h2>"+
                                        "</li>"+
                                        "<li class=\"monthly-organic-info col-lg-2\">"+
                                            "<h2>Power Level</h2>"+
                                        "</li>"+
                                    "</ul>"+
                                    "<ul class=\"power-summary-row\">"+
                                        "<li class=\"checkbox-outer col-lg-1\">"+
                                            "<h2>"+
                                                "<input type=\"checkbox\" checked disabled id=\"chk-content-all2\">"+
                                                "<label for=\"chk-content-all2\"></label>"+
                                            "</h2>"+
                                        "</li>"+
                                        "<li class=\"col-lg-2\">"+
                                            "<h2>"+clientRanking+"</h2>"+
                                        "</li>"+
                                        "<li class=\"col-lg-7\">"+
                                            "<h2>"+clientURL+"</h2>"+
                                        "</li>"+
                                        "<li class=\"col-lg-2\">"+
                                            "<h2>"+clientPowerLevel+"</h2>"+
                                        "</li>"+
                                    "</ul>"+
                                    "<div class=\"power-goal-section\">"+
                                        "<div class=\"col-lg-3 goal-img\"><img src=\"images/goal-img.png\" alt=\"\"></div>"+
                                        "<div class=\"goal-details col-lg-9\">"+
                                            "<h1>Power Level Goal is <span id=\"kwid-"+keywordID+"-plg-2\">"+powerLevelGoal+"</span></h1>"+
                                            "<h3>We've subtracted your power level from the average of your competitors' to determine your Power Level Goal.</h3>"+
                                            "<p>This number is derrived from both domain and page authority scores and is best used as a guide to determine your SEO marketing agression. For example if your PLG=3, then you may consider creating 3 pieces of content per month (or build 3 backlinks per month).</p>"+
                                        "</div>"+
                                    "</div>";
            if(showWarning === true)
            {
                accordianHTML += "<div class=\"warrining-message\">"+
                                        "<div class=\"col-lg-2 warrining-icon\"><img src=\"images/warning-sign.png\" alt=\"\"></div>"+
                                        "<div class=\"col-lg-10\">"+
                                            "<h2>You have some tricky competitors</h2>"+
                                            "<ul>"+
                                                "<li>Uncheck competitor urls whose power level exceedes 9</li>"+
                                            "</ul>"+
                                        "</div>"+
                                    "</div>";
            }
        
            accordianHTML += "</div>";
            
            //Add in the competitorHTML we already built, and finish off the div
            accordianHTML += competitorHTML + "</div>" +
                                                "</div>" +
                                            "</div>";
    }
    
    $('#keyword-phraser-accordion').html(accordianHTML);
    
    var suggestedKeywordsHTML = "";
    var suggestedKeywords = info.suggestedKeywords;
    for(var i=0; i<suggestedKeywords.length; i++)
    {
        if(i<25)
        {
            suggestedKeywordsHTML += "<li>"+suggestedKeywords[i]+"</li>";
        }
        else
        {
            suggestedKeywordsHTML += "<li class=\"read-more-target\">"+suggestedKeywords[i]+"</li>";
        }
    }
    $("#suggestedKeywordsList").html(suggestedKeywordsHTML);
}

function toggleCompetitor(competitorID,checked)
{
    var projectID = getURLParameter("pid");
    var active = "";
    if(checked)
    {
        active = "1";
    }
    else
    {
        active = "0";
    }
    
    if(competitorID != '' && projectID != '')
    {
        $.ajax({url: restURL, data: {'command':'toggleCompetitorActive','projectid':projectID,'competitorid':competitorID,'active':active}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    refreshProjectData();
                }
            }
        });
    }
}

function toggleKeyword(keywordID,checked)
{
    var projectID = getURLParameter("pid");
    var active = "";
    if(checked)
    {
        active = "1";
    }
    else
    {
        active = "0";
    }
    
    if(keywordID != '' && projectID != '')
    {
        $.ajax({url: restURL, data: {'command':'toggleKeywordActive','projectid':projectID,'keywordid':keywordID,'active':active}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    refreshProjectData();
                }
            }
        });
    }
}

function addKeywordToProject(keyword)
{
    var projectID = getURLParameter("pid");
    if(projectID != '' && keyword.trim() != '')
    {
        $.ajax({url: restURL, data: {'command':'addProjectKeyword','projectid':projectID,'keyword':keyword}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    //loadProjectData();
                    window.location.reload();
                }
            }
        });
    }
}

function refreshProjectData()
{
    var projectID = getURLParameter("pid");
    if(projectID != '')
    {
        $.ajax({url: restURL, data: {'command':'getProjectData','projectid':projectID}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    //Save this to local storage so that it can be sent to the PDF printer service
                    $('#json').val(returnData);
                    refreshProjectInfo();
                }
            }
        });
    }
    else
    {
        window.location = "dashboard.html";
    }
}

function refreshProjectInfo()
{
    var returnData = $('#json').val();
    var info = JSON.parse(returnData);
    
    //Fill in the project data here
    var projectInfo = info.projectSummary;
        var projectID = projectInfo.projectID;
        var runDate = projectInfo.runDate;
        var costPerLevel = projectInfo.costPerLevel;
        var searchVolume = projectInfo.searchVolume;
        var clientURL = projectInfo.clientURL;
        var valuePerCustomer = projectInfo.valuePerCustomer;
        var active = projectInfo.active;
        var completed = projectInfo.completed;
        var totalPowerLevel = projectInfo.totalPowerLevel;
        var clientDA = projectInfo.clientDA;
        var clientPA = projectInfo.clientPA;
        var incomingTraffic = Math.round(projectInfo.incomingTraffic,0);
        var runDateRaw = projectInfo.runDateRaw;
        var keywordCount = projectInfo.keywordCount;
        var geoLocation = projectInfo.geoLocation;
        var monthlyVisitors = projectInfo.monthlyVisitors;
        var payingCustomers = projectInfo.payingCustomers;
        
        var monthlyCustomers = Math.round(incomingTraffic * (payingCustomers / monthlyVisitors),0);
        var monthlySales = Math.round(monthlyCustomers * valuePerCustomer,0);
        var costPerMonth = Math.round((totalPowerLevel * costPerLevel),0);
        var keywordNetWorth = (monthlySales - costPerMonth);
        
        var customerConversionRate = (payingCustomers / monthlyVisitors);
        var clientPowerLevel = Math.max(1,Math.round((clientDA+clientPA)/2/10,0));
        
        var netWorthStyle = "green-text";
        if(keywordNetWorth < 0 || completed != 1)
        {
            netWorthStyle = "red-text";
        }
        
        var keywordNetWorthString = "";
        if(completed != 1)
        {
            keywordNetWorthString = "<span style=\"font-size:15px;color:red;\">calculating...</span>";
        }
        else
        {
            keywordNetWorthString = "$"+numberWithCommas(keywordNetWorth);
        }
        
        var activeString = "";
        if(active == 1)
        {
            activeString = "ACTIVE";
        }
        else
        {
            activeString = "INACTIVE";
        }
        
        $('#projectTitle').html(clientURL);
        $('#numKeywords').html(keywordCount);
        $('#geoLocation').html("<h2>"+geoLocation+"<!--<a class=\"edit-icon\" title=\"Edit Location\"></a>--></h2>");
        $('#searchVolume').html("<h2>"+numberWithCommas(searchVolume)+"<span>MO,SEARCH VOLUME<a class=\"info-icon\" title=\"This is the total sum of monthly search volume for all selected keywords in this project.\"></a></span></h2>");
        $('#projectedVisitors').html("<h2>"+numberWithCommas(incomingTraffic)+"<span>PROJECTED MO. VISITORS<a class=\"info-icon\" title=\"Calculated by applying the average CTR for your competitors to Mo. Search Volume.\"></a></span></h2>");
        $('#projectedCustomers').html("<h2>"+numberWithCommas(Math.round(incomingTraffic * (payingCustomers / monthlyVisitors),0))+"<span>PROJECTED MO. CUSTOMERS<a class=\"info-icon\" title=\"Calculated based on your conversion rate.\"></a></span></h2>");
        $('#projectedSales').html("<h2>$"+numberWithCommas(monthlySales)+"<span>PROJECTED MO. SALES<a class=\"info-icon\" title=\"Calculated based on your conversion rate and customer value.\"></a></span></h2>");
        $('#costPerMonth').html("<h2>$"+numberWithCommas(costPerMonth)+"<a class=\"edit-icon\" title=\"Edit Costs\"></a><span>COST PER MONTH<a class=\"info-icon\" title=\"This is the total sum of monthly costs for all selected keywords in this project.\"></a></span></h2>");
        $('#kwNetWorth').html("<h2 class=\""+netWorthStyle+"\">"+keywordNetWorthString+"<span>KEYWORD NET-WORTH<a class=\"info-icon\" title=\"This is the projected return on your invested marketing dollars for all selected keywords in this project.\"></a></span></h2>");
        $('#dateDivBottom').html("<div class=\"project-date-card date_sort\"><i class=\"eagle-icon\"></i>"+runDate+"</div><a class=\"project-status-card  project_status_sort\" href=\"javascript:void(0);\">"+activeString+"</a>");

    //Fill in the keyword data here
    var accordianHTML = "";
    var keywordInfo = info.keywordData;
    for(var i=0; i<keywordInfo.length; i++)
    {
        var thisEntry = keywordInfo[i];
        var thisCompetitorArray = thisEntry.competitorData;
        
        var keywordID = thisEntry.keywordID;
        var searchVolume = thisEntry.searchVolume;
        var keywordActive = thisEntry.active;
        var avgCTR = thisEntry.avgCTR;
        var totalPowerLevel = thisEntry.totalPowerLevel;     //Add back the client power level to the total power level for this keyword
        var keyword = thisEntry.keyword;
        
        var monthlyVisitors = Math.round(searchVolume * avgCTR,0);
        var monthlyCustomers = Math.round(monthlyVisitors * customerConversionRate,0);
        var monthlySales = Math.round(monthlyCustomers * valuePerCustomer,0);
        var costPerMonth = Math.round((totalPowerLevel - clientPowerLevel) * costPerLevel, 0);
        var keywordNetWorth = (monthlySales - costPerMonth);
        
        var powerLevelGoal = Math.max(1,(totalPowerLevel - clientPowerLevel));
        
        $('#kwid-'+keywordID+'-plg-1').html("<h2>"+powerLevelGoal+"<a data-toggle=\"collapse\" data-parent=\"#keyword-phraser-accordion\" href=\"#keyword-phraser-collapse"+i+"\" aria-expanded=\"true\" aria-controls=\"keyword-phraser-collapse"+i+"\" class=\"rh-view-icon\"> </a></h2>");
        $('#kwid-'+keywordID+'-search-volume').html("<h2>"+numberWithCommas(searchVolume)+"</h2>");
        $('#kwid-'+keywordID+'-monthly-visitors').html("<h2>"+numberWithCommas(monthlyVisitors)+"</h2>");
        $('#kwid-'+keywordID+'-monthly-customers').html("<h2>"+numberWithCommas(monthlyCustomers)+"</h2>");
        $('#kwid-'+keywordID+'-monthly-sales').html("<h2>$"+numberWithCommas(monthlySales)+"</h2>");
        $('#kwid-'+keywordID+'-cost-per-month').html("<h2>$"+numberWithCommas(costPerMonth)+"</h2>");
        $('#kwid-'+keywordID+'-kw-net-worth').html("<h2 class=\"\">$"+numberWithCommas(keywordNetWorth)+"</h2>");
        $('#kwid-'+keywordID+'-plg-2').html(powerLevelGoal);
        $('#kwid-'+keywordID+'-total-power-summary').html(totalPowerLevel);
    }
}

function displayProjectEditWindow(projectID)
{
    if(projectID != '')
    {
        //Set the id of the project we're working with
        $('#edit-project-id').val(projectID);

        //Get the project summary info and set the values
        $.ajax({url: restURL, data: {'command':'getProjectSetupData','projectid':projectID}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    var projectInfo = info.projectSummary;
                    
                    var projectURL = projectInfo.clientURL;
                    var geoLocation = projectInfo.geoLocation;
                    var monthlyVisitors = parseInt(projectInfo.monthlyVisitors);
                    var payingCustomers = parseInt(projectInfo.payingCustomers);
                    var valuePerCustomer = parseInt(projectInfo.valuePerCustomer);
                    var costPerLevel = parseInt(projectInfo.costPerLevel);
                    
                    //Update the inputs with the appropriate values
                    $('#project-url').html(projectURL);
                    $('#project-location').html(geoLocation);
                    /*$('#ex6SliderVal').val(numberWithCommas(monthlyVisitors));
                    $('#ex7SliderVal').val(numberWithCommas(payingCustomers));
                    $('#ex8SliderVal').val(numberWithCommas(valuePerCustomer));
                    $('#ex9SliderVal').val(numberWithCommas(costPerLevel));*/
                    
                    $("#ex6").slider();
                    var sliderVal = monthlyVisitors;
                    if(isNaN(sliderVal) || sliderVal < 0){ sliderVal = 0; }
                    $("#ex6").slider({
                        value: sliderVal
                        });
                    $("#ex6").slider('refresh');
                    $("#ex6SliderVal").val(numberWithCommas(sliderVal));
                    
                    $("#ex7").slider();
                    var sliderVal = payingCustomers;
                    if(isNaN(sliderVal) || sliderVal < 0){ sliderVal = 0; }
                    $("#ex7").slider({
                        value: sliderVal
                        });
                    $("#ex7").slider('refresh');
                    $("#ex7SliderVal").val(numberWithCommas(sliderVal));
                    
                    $("#ex8").slider();
                    var sliderVal = valuePerCustomer;
                    if(isNaN(sliderVal) || sliderVal < 0){ sliderVal = 0; }
                    $("#ex8").slider({
                        value: sliderVal
                        });
                    $("#ex8").slider('refresh');
                    $("#ex8SliderVal").val(numberWithCommas(sliderVal));
                    
                    $("#ex9").slider();
                    var sliderVal = costPerLevel;
                    if(isNaN(sliderVal) || sliderVal < 0){ sliderVal = 0; }
                    $("#ex9").slider({
                        value: sliderVal
                        });
                    $("#ex9").slider('refresh');
                    $("#ex9SliderVal").val(numberWithCommas(sliderVal));
                    
                    //Show the modal
                    showEditProject();
                }
            }
        });
    }
}

function editKeywordHackerProject()
{
    //Show the spinner
    $("#edit-project-response").html("<div class='three-quarters-loader-small'></div>");
    
    //Get the new values to update with
    var projectID = $('#edit-project-id').val();
    if(projectID != '')
    {
        var monthlyVisitors = $('#ex6SliderVal').val();
        var payingCustomers = $('#ex7SliderVal').val();
        var customerValue = $('#ex8SliderVal').val();
        var costPerLevel = $('#ex9SliderVal').val();

        //Make the AJAX call
        $.ajax({url: restURL, data: {'command':'editKHProject','projectid':projectID,'monthlyVisitors':monthlyVisitors,'payingCustomers':payingCustomers,'customerValue':customerValue,'costPerLevel':costPerLevel}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    //On success, hide the window
                    $("#edit-project-response").html("");
                    hideEditProject();
                    loadProjectDashboard(false);
                }
            }
        });
    }
}

function hideEditProject()
{
    document.getElementById("dimmer").style.display = "none";
    document.getElementById("edit-project-window").style.display = "none";
}

function showEditProject()
{
    document.getElementById("edit-project-window").style.display = "block";
    document.getElementById("dimmer").style.display = "block";
}

function cancelEditKeywordHackerProject()
{
    //Set the id of the project back to 0
    $('#edit-project-id').val(0);
    $("#edit-project-response").html("");
    
    //Hide the modal
    hideEditProject();
}

function displayProjectDeleteWindow(projectID)
{
    if(projectID != '')
    {
        //Set the id of the project we're working with
        $('#delete-project-id').val(projectID);
        showDeleteProject();
    }
}

function deleteKeywordHackerProject()
{
    //Show the spinner
    $("#delete-project-response").html("<div class='three-quarters-loader-small'></div>");
    
    //Get the new values to update with
    var projectID = $('#delete-project-id').val();
    if(projectID != '')
    {
        //Make the AJAX call
        $.ajax({url: restURL, data: {'command':'deleteKHProject','projectid':projectID}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    //On success, hide the window
                    $("#delete-project-response").html("");
                    hideDeleteProject();
                    loadProjectDashboard(false);
                }
            }
        });
    }
}

function cancelDeleteKeywordHackerProject()
{
    //Set the id of the project back to 0
    $('#delete-project-id').val(0);
    $("#delete-project-response").html("");
    
    //Hide the modal
    document.getElementById("dimmer").style.display = "none";
    document.getElementById("delete-project-window").style.display = "none";
}

function hideDeleteProject()
{
    document.getElementById("dimmer").style.display = "none";
    document.getElementById("delete-project-window").style.display = "none";
}

function showDeleteProject()
{
    document.getElementById("delete-project-window").style.display = "block";
    document.getElementById("dimmer").style.display = "block";
}

$(".show-more a").each(function() {
    var $link = $(this);
    var $content = $link.parent().prev("div.text-content");

    var visibleHeight = $content[0].clientHeight;
    var actualHide = $content[0].scrollHeight - 1;

    if (actualHide > visibleHeight) {
        $link.show();
    } else {
        $link.hide();
    }
});

$(".show-more a").on("click", function() {
    var $link = $(this);
    var $content = $link.parent().prev("div.text-content");
    var linkText = $link.text();

    $content.toggleClass("short-text, full-text");

    $link.text(getShowLinkText(linkText));

    return false;
});

function getShowLinkText(currentText) {
    var newText = '';

    if (currentText.toUpperCase() === "SHOW MORE") {
        newText = "Show less";
    } else {
        newText = "Show more";
    }

    return newText;
}

function toggleReadMore()
{
    var content = $('#read-more-button-label').html();
    if(content == "SHOW MORE KEYWORDS")
    {
        $('#read-more-button-label').html("SHOW FEWER KEYWORDS");
    }
    else
    {
        $('#read-more-button-label').html("SHOW MORE KEYWORDS");
    }
}

function addKeywordInReport(keyword)
{
    var currentKeywordCount = $('#keyword-count').val();

    if(keyword.trim() !== '')
    {
        var kwArray = keyword.split(",");
        for(var i=0; i<kwArray.length; i++)
        {
            var existingKeywords = $('#ctc').html();
            var newKeywordCount = parseInt(currentKeywordCount)+1;
            var newKeywords = existingKeywords + "<li id=\"keyword"+newKeywordCount+"\">"+kwArray[i].trim()+"<span style=\"padding:5px;color:#ec1c24;font-weight:bold;cursor:pointer;\" id=\"remove-keyword"+newKeywordCount+"\" title=\"Remove\" onclick=\"removeKeywordInReport(this);\">X</span></li>";
            $('#ctc').html(newKeywords);

            $('#keyword-count').val(newKeywordCount);
        }
    }
}

function removeKeywordInReport(element)
{
    var currentKeywordCount = parseInt($('#keyword-count').val());
    var id = element.getAttribute('id').replace('remove-keyword','');
    var idValue = parseInt(id);
    
    var keywordContent = $('#keyword'+idValue).html();
        keywordContent = keywordContent.replace("<span style=\"padding:5px;color:#ec1c24;font-weight:bold;cursor:pointer;\" id=\"remove-keyword"+idValue+"\" title=\"Remove\" onclick=\"removeKeywordInReport(this);\">X</span>","");
        keywordContent = keywordContent.trim();
    $('#keyword'+idValue).remove();
    //Add it to the list of suggested in case they want it back
    var suggestedList = $('#suggestedKeywordsList').html();
    var stringToAdd = "<li class=\"read-more-target\">"+keywordContent+"</li>"
    $('#suggestedKeywordsList').html(suggestedList+stringToAdd);
    
    if(idValue < currentKeywordCount)
    {
        var startingVal = idValue + 1;
        //Re-number the items behind this one so that we have an accurate count
        for(var i=startingVal; i<=currentKeywordCount; i++)
        {
            var newIDString = "keyword"+(i-1);
            var newRemoveString = "remove-keyword"+(i-1);
            $('#keyword'+i).attr("id",newIDString);
            $('#remove-keyword'+i).attr("id",newRemoveString);
        }
    }
    
    $('#keyword-count').val(currentKeywordCount-1);
}

function recalculateProject()
{
    var projectID = getURLParameter("pid");
    if(projectID != '')
    {
        var currentKeywordCount = parseInt($('#keyword-count').val());
        var keywordsList = "";
        for(var i=1; i<=currentKeywordCount; i++)
        {
            var keywordString = $('#keyword'+i).html();
            var keywordEndLoc = keywordString.indexOf("<span");
            var keyword = keywordString.substring(0,keywordEndLoc);
            if(keywordsList == "")
            {
                //keywordsList = i+"="+keyword;
                keywordsList = keyword;
            }
            else
            {
                //keywordsList += ";"+i+"="+keyword;
                keywordsList += ";"+keyword;
            }
        }
        
        $.ajax({url: restURL, data: {'command':'addKeywordsToExistingProject','projectid':projectID,'keywords':keywordsList}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    window.location = "dashboard.html";
                }
            }
        });
    }
    else
    {
        window.location = "dashboard.html";
    }
}