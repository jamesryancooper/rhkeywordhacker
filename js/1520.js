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
        
        /*console.log("proj url  = "+projectURL);
        console.log("location  = "+projectLocation);
        console.log("keywords  = "+keywordsList);
        console.log("visitors  = "+monthlyVisitors);
        console.log("customers = "+payingCustomers);
        console.log("custvalue = "+customerValue);*/
        
        
        //Once you have required info, create the project
        $.ajax({url: restURL, data: {'command':'createKHProject','username':username,'projectURL':projectURL,'projectLocation':projectLocation,'keywords':keywordsList,'monthlyVisitors':monthlyVisitors,'payingCustomers':payingCustomers,'customerValue':customerValue}, type: 'post', async: true, success: function postResponse(returnData){
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

function loadProjectDashboard()
{
    var username = getCookie("username");
    if(username != '')
    {    
        $.ajax({url: restURL, data: {'command':'getProjectDashboardData','username':username}, type: 'post', async: true, success: function postResponse(returnData){
                var info = JSON.parse(returnData);

                if(info.status == "success")
                {
                    
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
                //$('#json').val(returnData);

                if(info.status == "success")
                {
                    //Fill in the project data here
                    //var entry = info.data[0];
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