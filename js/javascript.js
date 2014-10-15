/*
start app
- create tables
- read file for synchronize
    if modification > then db.lastExportDate =  read data from file

- export data
    lastExportDate is set in db by date of saved file


lastSyncDate
    - when read xml si proceed lastSyncDate is set
    - on every focus a input, is get lastSyncDate from db. Value si put to memory inputValue
    - on every change is check if lastSyncDate > 30, then alert is shown and value put back from inputValue

custom app different:
 label: Category/Code #


 */

var lastRowID = 0;
var sheetCurrent = 0;
var rowUpdatedID = 0;
var rowEdited = 0;
var elFocused = 0;
var categorySelectPrev = "Instructions";
var firstInsert = false;
var inputValue;
var focusStop = false;
//var defaultCodeOptionsHtml = "<option>4006 &quot;Auto Expenses&quot;</option> <option>4007 &quot;Food/Sundries&quot;</option> <option>4008 &quot;Home Maintenance&quot;</option> <option>4009 &quot;Insurance&quot;</option> <option>4010 &quot;Medical&quot;</option> <option>4011 &quot;Housing&quot;</option> <option>4012 &quot;Telephone&quot;</option> <option>4013 &quot;Utilities&quot;</option> <option>4014 &quot;Open&quot;</option> <option>4015 &quot;Open&quot;</option> <option>4016 &quot;Unident ified Cash w/d&quot;</option> <option>4017 &quot;Open&quot;</option> <option>4018 &quot;Open&quot;</option> <option>4019 &quot;Oenn</option> <option>4020 &quot;Open&quot;</option> <option>4021 &quot;Open&quot;</option> <option>4517 &quot;Child#1-A&quot;</option> <option>4517 &quot;Child#2-B&quot;</option> <option>4517 &quot;Child#3-C&quot;</option> <option>4517 &quot;Child#4-D&quot;</option> <option>4517 &quot;Child#5-E&quot;</option> <option>4518 &quot;for Primary Wage Earner #1&quot;</option> <option>4519 &quot;for Primary Wage Earner #2&quot;</option> <option>4520 &quot;Pet#1-A&quot;</option> <option>4520 &quot;Pet#2-B&quot;</option> <option>4521 &quot;Open&quot;</option> <option>5023 &quot;Medical Debt / Fees / Charges&quot;</option> <option>5024 &quot;Loans &amp; Notes Payable&quot;</option> <option>5025 &quot;Tax Debt I Estimated Tax&quot;</option> <option>5026 &quot;Open&quot;</option> <option>6028 &quot;Donations/Gifts&quot;</option> <option>6029 &quot;Entertainment&quot;</option> <option>6032 &quot;Savings&quot;</option> <option>6033 &quot;Vacations&quot;</option>";
var defaultCodeOptionsHtml = "";
var defaultHowPaidOptionsHtml = "";

if(appType=="simple")
{
    defaultCodeOptionsHtml = '<option value="0">Auto Expenses</option> <option value="0">Food/Sundries</option><option value="0">Home Maintenance</option><option value="0">Insurance</option><option value="0">Medical</option><option value="0">Housing</option><option value="0">Telephone</option><option value="0">Utilities</option><option value="0">Dependent Expenses</option><option value="0">Personal Expenses</option><option value="0">Spouse/Partner Expenses</option><option value="0">Pet Expenses</option><option value="0">Credit Card Payments</option><option value="0">Loans & Notes Payable</option><option value="0">Taxes</option><option value="0">Donations/Gifts</option><option value="0">Entertainment</option><option value="0">Investments</option><option value="0">Retirement</option><option value="0">Savings</option><option value="0">Vacations</option><option value="0">Open</option>';
    defaultHowPaidOptionsHtml = "<option>CASH</option><option>TBP</option><option>ALLOCATE</option><option>ADJ./MP</option><option>BK#0001</option><option>BK#0002</option><option>BK#0003</option><option>BK#0004</option><option>BK#0005</option><option>BK#0006</option><option>BK#0007</option><option>BK#0008</option><option>BK#0009</option><option>BK#0010</option><option>BK#9999</option><option>CC#0001</option><option>CC#0002</option><option>CC#0003</option><option>CC#0004</option><option>CC#0005</option><option>CC#0006</option><option>CC#0007</option><option>CC#0008</option><option>CC#0009</option><option>CC#9999</option><option>LOC#001</option><option>LOC#002</option><option>LOC#003</option>";

}

if(appType=="tmm")
{
    defaultCodeOptionsHtml = '<option value="100">3001 Primary Wage Earner #1</option><option value="0">3002 Primary Wage Earner #2</option><option value="1">3003 Investment Income</option><option value="2">3004 Other (Source)</option><option value="3">3005 Reserve Transfers</option><option value="0">4006 Auto Expenses</option><option value="0">4007 Food/Sundries</option><option value="0">4008 Home Maintenance</option><option value="0">4009 Insurance</option><option value="0">4010 Medical</option><option value="0">4011 Housing</option><option value="0">4012 Telephone</option><option value="0">4013 Utilities</option><option value="0">4014 Open</option><option value="0">4015 Open</option><option value="0">4016 Unidentified Cash w/d</option><option value="0">4017 Open</option><option value="0">4018 Open</option><option value="0">4019 Open</option><option value="0">4020 Open</option><option value="0">4021 Open</option><option value="0">4517 Child#1-A</option><option value="0">4517 Child#2-B</option><option value="0">4517 Child#3-C</option><option value="0">4517 Child#4-D</option><option value="0">4517 Child#5-E</option><option value="0">4518 for Primary Wage Earner #1</option><option value="0">4519 for Primary Wage Earner #2</option><option value="0">4520 Pet #1-A</option><option value="0">4520 Pet #2-B</option><option value="0">4521 Open</option><option value="0">5023 Medical Debt / Fees / Charges</option><option value="0">5024 Loans & Notes Payable</option><option value="0">5025 Tax Debt / Estimated Tax</option><option value="0">5026 Open</option><option value="0">6028 Donations/Gifts</option><option value="0">6029 Entertainment</option><option value="0">6032 Savings</option><option value="0">6033 Vacations</option>';
    defaultHowPaidOptionsHtml = "<option>CASH</option><option>TBP</option><option>ALLOCATE</option><option>ADJ./MP</option><option>BK#0001</option><option>BK#0002</option><option>BK#0003</option><option>BK#0004</option><option>BK#0005</option><option>BK#0006</option><option>BK#0007</option><option>BK#0008</option><option>BK#0009</option><option>BK#0010</option><option>BK#9999</option><option>CC#0001</option><option>CC#0002</option><option>CC#0003</option><option>CC#0004</option><option>CC#0005</option><option>CC#0006</option><option>CC#0007</option><option>CC#0008</option><option>CC#0009</option><option>CC#9999</option><option>LOC#001</option><option>LOC#002</option><option>LOC#003</option>";
}


var testWritelData = '<data><meta><category><option>4517 &quot;Child#1-A&quot;</option><option>4007 &quot;Food/Sundries&quot;</option><option>4008 &quot;Home Maintenance&quot;</option><option>4009 &quot;Insurance&quot;</option><option>4010 &quot;Medical&quot;</option><option>4011 &quot;Housing&quot;</option><option>4012 &quot;Telephone&quot;</option><option>4013 &quot;Utilities&quot;</option><option>4014 &quot;Open&quot;</option><option>4015 &quot;Open&quot;</option><option>4016 &quot;Unident ified Cash w/d&quot;</option><option>4017 &quot;Open&quot;</option><option>4018 &quot;Open&quot;</option><option>4019 &quot;Oenn</option><option>4020 &quot;Open&quot;</option><option>4021 &quot;Open&quot;</option><option>4517 &quot;Child#1-A&quot;</option><option>4517 &quot;Child#2-B&quot;</option><option>4517 &quot;Child#3-C&quot;</option><option>4517 &quot;Child#4-D&quot;</option><option>4517 &quot;Child#5-E&quot;</option><option>4518 &quot;for Primary Wage Earner #1&quot;</option><option>4519 &quot;for Primary Wage Earner #2&quot;</option><option>4520 &quot;Pet#1-A&quot;</option><option>4520 &quot;Pet#2-B&quot;</option><option>4521 &quot;Open&quot;</option><option>5023 &quot;Medical Debt / Fees / Charges&quot;</option><option>5024 &quot;Loans &amp; Notes Payable&quot;</option><option>5025 &quot;Tax Debt I Estimated Tax&quot;</option><option>5026 &quot;Open&quot;</option><option>6028 &quot;Donations/Gifts&quot;</option><option>6029 &quot;Entertainment&quot;</option><option>6032 &quot;Savings&quot;</option><option>6033 &quot;Vacations&quot;</option><option>4006 &quot;Auto Expenses&quot;</option><option>4007 &quot;Food/Sundries&quot;</option><option>4008 &quot;Home Maintenance&quot;</option><option>4009 &quot;Insurance&quot;</option><option>4010 &quot;Medical&quot;</option><option>4011 &quot;Housing&quot;</option><option>4012 &quot;Telephone&quot;</option><option>4013 &quot;Utilities&quot;</option><option>4014 &quot;Open&quot;</option><option>4015 &quot;Open&quot;</option><option>4016 &quot;Unident ified Cash w/d&quot;</option><option>4017 &quot;Open&quot;</option><option>4018 &quot;Open&quot;</option><option>4019 &quot;Oenn</option><option>4020 &quot;Open&quot;</option><option>4021 &quot;Open&quot;</option><option>4517 &quot;Child#1-A&quot;</option><option>4517 &quot;Child#2-B&quot;</option><option>4517 &quot;Child#3-C&quot;</option><option>4517 &quot;Child#4-D&quot;</option><option>4517 &quot;Child#5-E&quot;</option><option>4518 &quot;for Primary Wage Earner #1&quot;</option><option>4519 &quot;for Primary Wage Earner #2&quot;</option><option>4520 &quot;Pet#1-A&quot;</option><option>4520 &quot;Pet#2-B&quot;</option><option>4521 &quot;Open&quot;</option><option>5023 &quot;Medical Debt / Fees / Charges&quot;</option><option>5024 &quot;Loans &amp; Notes Payable&quot;</option><option>5025 &quot;Tax Debt I Estimated Tax&quot;</option><option>5026 &quot;Open&quot;</option><option>6028 &quot;Donations/Gifts&quot;</option><option>6029 &quot;Entertainment&quot;</option><option>6032 &quot;Savings&quot;</option><option>6033 &quot;Vacations&quot;</option></category><howPaid><option>testHowPaid</option><option>CASH</option> <option>BK#0001</option> <option>BK#0002</option> <option>BK#0003</option> <option>BK#0004</option> <option>BK#0005</option> <option>BK#0006</option> <option>BK#0007</option> <option>BK#0008</option> <option>BK#0009</option> <option>BK#0010</option> <option>BK#9999</option> <option>CC#0001</option> <option>CC#0002</option> <option>CC#0003</option> <option>CC#0004</option> <option>CC#0005</option> <option>CC#0006</option> <option>CC#0007</option> <option>CC#0008</option> <option>CC#0009</option> <option>CC#9999</option> <option>LOC#001</option> <option>LOC#002</option> <option>LOC#003</option></howPaid><code><option>123 &quot;muj test&quot;</option><option>4006 &quot;Auto Expenses&quot;</option> <option>4007 &quot;Food/Sundries&quot;</option> <option>4008 &quot;Home Maintenance&quot;</option> <option>4009 &quot;Insurance&quot;</option> <option>4010 &quot;Medical&quot;</option> <option>4011 &quot;Housing&quot;</option> <option>4012 &quot;Telephone&quot;</option> <option>4013 &quot;Utilities&quot;</option> <option>4014 &quot;Open&quot;</option> <option>4015 &quot;Open&quot;</option> <option>4016 &quot;Unident ified Cash w/d&quot;</option> <option>4017 &quot;Open&quot;</option> <option>4018 &quot;Open&quot;</option> <option>4019 &quot;Oenn</option> <option>4020 &quot;Open&quot;</option> <option>4021 &quot;Open&quot;</option> <option>4517 &quot;Child#1-A&quot;</option> <option>4517 &quot;Child#2-B&quot;</option> <option>4517 &quot;Child#3-C&quot;</option> <option>4517 &quot;Child#4-D&quot;</option> <option>4517 &quot;Child#5-E&quot;</option> <option>4518 &quot;for Primary Wage Earner #1&quot;</option> <option>4519 &quot;for Primary Wage Earner #2&quot;</option> <option>4520 &quot;Pet#1-A&quot;</option> <option>4520 &quot;Pet#2-B&quot;</option> <option>4521 &quot;Open&quot;</option> <option>5023 &quot;Medical Debt / Fees / Charges&quot;</option> <option>5024 &quot;Loans &amp; Notes Payable&quot;</option> <option>5025 &quot;Tax Debt I Estimated Tax&quot;</option> <option>5026 &quot;Open&quot;</option> <option>6028 &quot;Donations/Gifts&quot;</option> <option>6029 &quot;Entertainment&quot;</option> <option>6032 &quot;Savings&quot;</option> <option>6033 &quot;Vacations&quot;</option></code></meta><sheet><header><shid>1</shid><category>t1</category><planSpend>100.00</planSpend><code>4007 "Food/Sundries"</code></header><tableData><row><rowID>1</rowID><date></date><paid>BK#0001</paid><desc>aa</desc><ref>12</ref><payment>12.00</payment><available>-12.00</available></row></tableData></sheet><sheet><header><shid>2</shid><category>t2</category><planSpend>0.00</planSpend><code>4517 "Child#1-A"</code></header><tableData><row><rowID>1</rowID><date></date><paid>BK#0002</paid><desc>neci</desc><ref></ref><payment></payment><available></available></row></tableData></sheet></data>';

var currentDate = new Date();
logging("currentDate:" + currentDate,1);
var syncDate;
syncDate = "";
var datePickerOpen = false; // workaround for datapicker be onepn only once time

var pieData=[];

function onDeviceReady()
{
    //alert("onDeviceReady");
    init();
}

function onDeviceReadyDelay()
{
    //alert("onDeviceReadyDelay");
    init();
}

function init()
{


    if(!pgReady)
    {
        pgReady = true;
    } else
    return;




    // by supported aceleration, prepare classes and view
    transitionInit();

    // set clicks function on buttons, touch or click
    clickInit();



    db.init(); // inside is fileInit();
    setMonth();



    //pieShow();
}





function setMonth()
{
    var date = new Date();
    var monthNames = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];
    $("#month").html("Month Of: "+ monthNames[date.getMonth()]);
    //$("#month").attr("disabled", true);
}

function tableSummShow()
{
    db.tableSummShow(tableSummRender);
    //pieRender();
}
function tableSummRenderHide()
{
    $("div.sheets").css("display","block");
    $("div.topMenu").css("display","block");
    $("div.piePage").css("display","none");
}
function tableSummRender()
{
    var dimension = $(document).width()>$(document).height()?$(document).height():$(document).width();
    $("div.sheets").css("display","none");
    $("div.topMenu").css("display","none");
    $("div.piePage").css("display","block");
    $(".piePage h1").html("How I’m Doing for the Month of " + $("#month").html().toString().substr(10));
    $("#chartdivTable table").css("width",dimension*0.8+"px");

    $("#chartdivTable tbody").empty();
    var htmladd = "";
    htmladd="<tr><th>Description</th><th>MONEY PLAN</th><th>SPENT</th><th>BALANCE AVAILABLE</th></tr>"
    var totalPlan = 0;
    var totalSpend = 0;
    var totalAva = 0;
    var color = "#000000";

    for(var i=0;i<pieData.length;i++)
    {
        var balance = pieData[i][1]-pieData[i][2];

        totalPlan += Number(pieData[i][1]);
        totalSpend += Number(pieData[i][2]);
        console.log("pro" + i +" je to:" + totalSpend);
        totalAva += Number(balance);

        color = "#000000";
        if(balance<0)
        {
            color = "#FF0000";
        }
        balance = Math.abs(balance);
        htmladd += "<tr><td>"+pieData[i][0]+"</td><td>$"+Number(pieData[i][1])+"</td><td><"+numDecimalCorrection(Number(pieData[i][2]),2)+"></td><td style='color:"+color+"'>$<"+numDecimalCorrection(balance,2)+"></td></tr>";
        //total += Number(pieData[i][1]);
    }
    if(totalAva<0)
    {
        color = "#FF0000";
    }
    htmladd += "<tr><td>Total:</td><td>$"+numDecimalCorrection(totalPlan,2)+"</td><td><"+numDecimalCorrection(totalSpend,2)+"></td><td style='color:"+color+"'>$<"+numDecimalCorrection(totalAva,2)+"></td><tr>";
    //htmladd += "<tr><td>Available to Spend:</td><td>"+numDecimalCorrection(Number(dbData.FSsummary) - total,2)+"</td></tr>";
    $("#chartdivTable table.num tbody").append(htmladd);
    //$("#chartdivTable table.avialable tbody").append("<tr><td>Available to Spend:</td><td>"+numDecimalCorrection(Number($("#code option:selected").val()) - total,2)+"</tbody></table>");

}

// --------------------------------- pie show

function pieShow()
{
    db.pieDataGetShid(pieRender);
    //pieRender();
}



function pieHide()
{
    $("div.sheets").css("display","block");
    $("div.topMenu").css("display","block");
    $("div.piePage").css("display","none");
}


function pieRender()
{
    $("div.sheets").css("display","none");
    $("div.topMenu").css("display","none");
    $("div.piePage").css("display","block");
    $(".piePage h1").html($("#code option:selected").text() + " summary " + $("#code option:selected").val());


    var dimension = $(document).width()>$(document).height()?$(document).height():$(document).width();
    $("#chartdiv").css("width",dimension/1.5 +"px");
    $("#chartdiv").css("height",dimension/1.5 +"px");


    var s1 = [['Sony',7], ['Samsumg',13.3], ['LG',14.7], ['Vizio',5.2], ['Insignia', 1.2]];
    s1 = pieData;
    console.log(pieData);


    var plot8 = $.jqplot('chartdiv', [s1], {
        grid: {
            drawBorder: false,
            drawGridlines: false,
            background: '#ffffff',
            shadow:false
        },
        axesDefaults: {

        },
        seriesDefaults:{
            renderer:$.jqplot.PieRenderer,
            rendererOptions: {
                showDataLabels: false
            }
        },
        legend: {
            show: true,
            rendererOptions: {
                numberColumns: 1
            },
            location: 'e'
        }
    });

    $("#chartdivTable table").css("width",dimension*0.8+"px");

    $("#chartdivTable tbody").empty();
    var htmladd = "";
    var total = 0;
    for(var i=0;i<pieData.length;i++)
    {
        htmladd += "<tr><td>"+pieData[i][0]+"</td><td>"+numDecimalCorrection(pieData[i][1],2)+"</td></tr>";
        total += Number(pieData[i][1]);
    }
    htmladd += "<tr><td>Total:</td><td>"+numDecimalCorrection(total,2)+"</td><tr>";
    //htmladd += "<tr><td>Available to Spend:</td><td>"+numDecimalCorrection(Number(dbData.FSsummary) - total,2)+"</td></tr>";
    $("#chartdivTable table.num tbody").append(htmladd);
    $("#chartdivTable table.avialable tbody").append("<tr><td>Available to Spend:</td><td>"+numDecimalCorrection(Number($("#code option:selected").val()) - total,2)+"</tbody></table>");





    //$("table.jqplot-table-legend").css("width","200px");


}

function transitionInit()
{
    if(fileSupportOff)
    {
        $("#buttonSave").css("visibility","hidden");
    }

    // zoom set up
    var dimeWidth = $(document).width()>$(document).height()?$(document).height():$(document).width();
    var dimeHeight = $(document).height()>$(document).width()?$(document).height():$(document).width();
    $("body").css("min-width",dimeWidth +"px");
    //$("body").css("min-height",dimeHeight +"px");

    if (typeof cordova !== 'undefined') {
        if (typeof cordova.plugins !== 'undefined') {
            if (typeof cordova.plugins.ZoomControl !== 'undefined') {
                cordova.plugins.ZoomControl.ZoomControl("true");
                // enabling built in zoom control
                //cordova.plugins.ZoomControl.setBuiltInZoomControls("true");
                // enabling display zoom control
                //cordova.plugins.ZoomControl.setDisplayZoomControls("true");
            }

        }


    }


    /*
    window.addEventListener('orientationchange', function(){
        $("ul.content").css("height",$("body").height()-$("ul.content").offset().top+"px");
    });
    */
}

function ulHeightSet()
{
    $("ul.content").css("height",$("body").height()-$("ul.content").offset().top+"px");
}

function clickInit()
{

    if(menuButtonWork){
        enableMenuButton();
    }




    // save to databse content of sheet
    // add row on conent input change
    $(document).on('change', '.content input, .content select', function() {

        var el = this;
        if(this.nodeName=="SELECT")
        {
            $(this).prev().val($(this).val());
            el = $(this).prev();
        }

        if($(this).closest('span').hasClass("paid"))
        {
            if(this.nodeName == "INPUT")
            {
                howPaidCheck(this);
                return;
            }
        }

        if(dbUpdater2(el))
        {
            addRowCheck(el);
            //focusSetNext(this); // is set on keypress event
        }
    });

    // instructions check-box
    $(document).on('click', '.instructions input.clickable', function() {
        var el = $(this);

        setTimeout(function(){
            $('#categorySelect option')
                .filter(function() { return $.trim( $(this).text() ) == el.val() })
                .attr('selected',true);
            showInstructions(false);
            categorySelectonchange();
            el.prop('checked', false);

        },50)

    });


    $(document).on('focus', '.content .payment input', function() {
        this.value='';
    });

    $(document).on('focus', '.content li', function() {
        elFocused = this;
    });

    $(document).on('focusout', '.content .payment input', function() {
        var mustBePositive = false;
        priceFormatCheck(this,mustBePositive);
    });

    // read date of sync from db.
    //  its because is asynchronous. So user in meanwhile user can modified and after enter it will check if is sync < 30 days
    $(document).on("click","input, select",function() {
        if ($(this).is(":focus")) {
            db.readLastSync();
            inputValue = $(this).val();

            if($(this).prop("tagName")=="SELECT")
            {
                inputValue = el = $(this).prev().val();
                console.log("inputValue:"+ inputValue);
            } else
            {
                inputValue = $(this).val();
            }

        }
    });


    $(function() {
        FastClick.attach(document.body);
    });


    // focus next field in table enter key
    $(document).on("keypress",".content input, #planSpend",function(e) {
        if (e.which == 13) {

            if($(this).attr("id")=="planSpend")
            {
                this.blur();
                return;
            }

            if($(this).closest('span').hasClass("payment") || $(this).closest('span').hasClass("checkRef"))
            {
                this.blur();
            } else if($(this).closest('span').hasClass("description"))
            {
                var elNext = $(this).closest('span').next().find('select');
                $(elNext).focus();
                $(elNext).click();
            } else
            {
                var elNext = $(this).closest('span').next().find('input');
                $(elNext).focus();
                $(elNext).click();
            }
        }
    });



// ---------- right button
    $('#categorySelectNext').on('click', function() {
        if($('#categorySelect option:selected').next().val()==null) return;
        if($('#categorySelect option:selected').next().val() == "New page") return;

        $("#categorySelect > option:selected")
            .prop("selected", false)
            .next()
            .prop("selected", true);

        categorySelectonchange();
    });
// ---------- left button
    $('#categorySelectPrev').on('click', function() {
        if($('#categorySelect option:selected').prev().val() == "New page")
        {
            return;
        }
        $("#categorySelect > option:selected")
            .prop("selected", false)
            .prev()
            .prop("selected", true);

        categorySelectonchange();
    });

}

function newWTable()
{
    logging("newWTable",1);

    // hide instruction if you tap new Page on that
    // this code is in db.loadSheet
    if(categorySelectPrev=="Instructions")
    {
        showInstructions(false);
        $("body").css("display","block");
    }
    //newWTableRender();
    db.CreateNextTable();
    //currentWtable = lastWtable;

    $("#category").val("");
    //$("#code").val('4011 "Housing"');
    $("#code").val($("#code option:first").val());

    // when is on instructions, then is disabled
    $('#category').attr("disabled", false);
    $("#planSpend").val("0.00");
    $("ul.content").empty();
    lastRowID  =0;
    addRow();
}

function newWTableRender()
{
    var newWtable = $("#first").html();
    newWtable = ('<div id="'+currentWtable+'" style="disply:block">'+newWtable+'</div>');
    $(".main").append(newWtable);
}

function recalculateBalance()
{
    var total = document.getElementById("planSpend").value;
    var underValue = false;
    $(".content li").each(function(){
        var payment = $(this).find(".payment input").val();

        /* negative number allowed
        if(payment > 0)
        {

        } else
        {
            $(this).find(".payment input").val("0.00");
            payment = 0;
        }
        */
        total = parseFloat(Math.round((total-payment) * 100) / 100).toFixed(2);
        var aviableAmountEl = $(this).find(".last input");
        $(aviableAmountEl).val(total);
        $(this).find(".last input").val(total);
        if(total>=0)
        {
            $(aviableAmountEl).css("color","black");
        } else
        {
            $(aviableAmountEl).css("color","red");
            underValue= true;
        }
//        dbUpdater2($(this).find(".payment input"));
    });
    if(underValue) alert("Available balance is under $0");
    db.recalculateBalance();


}

function priceFormatCheck(el,mustBePositive)
{
    value = el.value;
    var proceedUpdate = true;

    if(el.value == "")
    {
        $(el).val("0.00");
        proceedUpdate = false;
    } else
    if(mustBePositive)
    {
        // planToSpend
        if(isNaN(Number(value)) || Number(value)<0)
        {
            alert("This value must be positive real number");
            //$("#planSpend").val("0");
            $(el).val("0.00");
            proceedUpdate = false;
        }
    } else
    {
        // payment amount...
        if(isNaN(Number(value)))
        {
            alert("This value must be a real number");
            //$("#planSpend").val("0");
            $(el).val("0.00");
            proceedUpdate = false;
        }
    }


    // has this number ".00" ?
    var elSlinc = value.split(".");
    if(elSlinc.length == 1 && proceedUpdate)
    {

        value = value + ".00";
        el.value = value;
    }

    recalculateBalance();
    db.headerUpdate();

}

function dateFormatIn(el)
{
    if (typeof datePicker === 'undefined') {
        return;
    }

    if(datePickerOpen)
    {
        return;
    } else
    {
        datePickerOpen = true;
    }

    var options = {
        date: new Date(),
        mode: 'date'
    };

    inputValue = $(el).val();
    el.blur();
    datePicker.show(options, function(date){
        if(date)
        {
            datePickerOpen = false;
            // happend when is cancel button press
            if(date=="Invalid Date") return;

            // fill date in input
            var newDate = new Date(date);


            el.value = (Number(newDate.getMonth()) + 1) + "/" + newDate.getDate() + "/" + newDate.getFullYear().toString().substr(2,2);

            dbUpdater2(el);

            // focus next field
            var elNext = $(el).closest('span').next().find('input');
            $(elNext).focus();
            $(elNext).click();
        }
    });

}

function howPaidCheck(el)
{
    // check if you edit last 4digits (if 3 from start are same)
    // compare it with selected value

    var inputPrefix = el.value.substr(0,el.value.indexOf("#")+1);
    var selectPrefix = $(el).next().val().toString().substr(0,$(el).next().val().toString().indexOf("#")+1);

    // canot edit CASH
    if($(el).next().val().toString() == "CASH")
    {
        alert("CASH canot be edited");
        el.value = "CASH";
        return;
    }
    if($(el).next().val().toString() == "TBP")
    {
        alert("TBP canot be edited");
        el.value = "TBP";
        return;
    }
    if($(el).next().val().toString() == "ALLOCATE")
    {
        alert("ALLOCATE canot be edited");
        el.value = "ALLOCATE";
        return;
    }
    if($(el).next().val().toString() == "ADJ./MP")
    {
        alert("ADJ./MP canot be edited");
        el.value = "ADJ./MP";
        return;
    }

    // at least some digits after # must be!
    console.log("e"+el.value.length+el.value);
    console.log("e"+inputPrefix.length + inputPrefix);
    if(el.value.length==inputPrefix.length)
    {
        alert("Please provide at least one digits");
        el.value = $(el).next().val();
        return;
    }



    if(inputPrefix!=selectPrefix)
    {
        alert("Prefix canot be changed");
        el.value = $(el).next().val();

    } else
    if(el.value.length > 7)
    {
        alert("Code canot be larged");
        el.value = $(el).next().val();

    } else
    {
        // update input value in db
        dbUpdater2(el);

        // update select of input you edit
        $(el).next().find("option:selected").text(el.value);

        // copy new options to all selects and keep selected position same
        defaultHowPaidOptionsHtml = $(el).next().html();
        $(".paid select").each(function(){
            var index = $(this)[0].selectedIndex;
           $(this).html(defaultHowPaidOptionsHtml);
           $(this).find("option").eq(index).prop('selected', true);

        });

        db.howPaidUpdate();

    }

}

function dateFormatCheck(el)
{

    value = el.value;
    if(value.length>0)
    {
        elSlinc = value.split("/");
        if(elSlinc.length < 2 || elSlinc.length > 3)
        {
            alert("Date format must be: 'M/D' or M/D/YY");
            $(el).val("");
            $(el).focus();
            return;
        }
    }
    $(el).closest('span').next().find('input').focus();
}

function addRowCheck(el)
{
    var thisRowID = $(el).parent().parent().attr("data-id");
    if(thisRowID == lastRowID)
    {
        addRow();
    }

}

function addRow()
{
    logging("addRow",1);
    lastRowID ++;
    $("ul.content").append('<li data-id="'+lastRowID+'"> <span class="dater"><input onchange="dateFormatCheck(this)" onfocus="dateFormatIn(this)"></span><span class="description"><input></span><span class="paid"><input><select>'+defaultHowPaidOptionsHtml+'</select></span><span class="checkRef"><input></span> <span class="payment"><input></span> <span class="last"><input readonly></span> </li>');

    // set how Paid input
    var firstSelectOption = $("ul.content").find("select").last().find("option").first().text();

    $("ul.content .paid input").last().val(firstSelectOption);
}

function updateHeader()
{
    var proceedUpdate = true;
    var category = $("#category").val();
    var code = $("#code option:selected").text();
    var planSpend = $("#planSpend").val();

    // fields validation
    if(isNaN(Number(planSpend)))
    {
        alert("Plan to spend must be positive real number");
        $("#planSpend").val("0.00");
        proceedUpdate = false;
    }

    if(proceedUpdate) dbUpdateHeader();
}


function categorySelectonchange()
{
    if($("#categorySelect").val()=="New page")
    {
        newWTable();
    }
        else
    {
        db.loadSheet();db.setOpenedSheet();memPrev();
    }
    if($("#categorySelect").val()=="Instructions")
    {
        $('#category').attr("disabled", true);
    } else
    {
        $('#category').attr("disabled", false);
    }

}
function categorySelectUpdate()
{
    $( "#categorySelect option:selected" ).text($('#category').val());
}

function buttonDelete()
{

    if(elFocused == 0)
    {
        alert("Please select row and then tap Delete Line");
        return;
    }
    else
    {

        db.deleteRow($(elFocused).attr("data-id"));
        $(elFocused).remove();

    }

    return;

    if($("#categorySelect option:selected").val()=="Instructions")
        return;

    var r = confirm("Do you want to delete this page and all data?");
    if (r == true) {
        db.deleteShid(deleteAfterSelectCategory);
    } else {
        return;
    }
}

function deleteAfterSelectCategory()
{
    $("#categorySelect option[value="+shidCurrentGet()+"]").remove();
    if($('#categorySelect > option').length<3){
        //$("categorySelect").prop('selectedIndex', 1);
        $('#categorySelect :nth-child(2)').prop('selected', true);

    } else
    {
        $('#categorySelect :nth-child(3)').prop('selected', true);
    }

    db.loadSheet();memPrev();
}

function buttonSave()
{
    //alert("I will preform save");
    manualySave= true;
    xmlExportAndSave();

}

function shidCurrentGet()
{
    return $("#categorySelect option:selected").val();
}

function dbUpdater2(el)
{
    var run = true;
    if(!lastSyncOK())
    {

        // if restore input "paid" then restore select too
        if($(el).closest('span').hasClass("paid"))
        {
            if($(el).prop("tagName")=="INPUT")
            {
                var elSelect = $(el).next();
                $(elSelect).find("option")
                    .filter(function() { return $.trim( $(this).text() ) == inputValue })
                    .attr('selected',true);
            }
        }

        $(el).val(inputValue);
        run = false;
    } else
    {

        rowUpdatedID = $(el).parent().parent().attr("data-id");
        db.rowUpdateInsert();

        if($(el).closest('span').hasClass("paid"))
        {
            var a = $(el).closest('li');
            if($(el).val()=="TBP")
            {
                //$(el).attr("readonly",true);
                a.css("background","yellow");
                a.find("input").css("background","yellow");
            } else
            {
                //$(el).attr("readonly",false);
                a.css("background","white");
                a.find("input").css("background","white");
            }
        }

        //db.transaction(dbUpdateQ, errorCB);
    }
    return run;
}

function startTable(el)
{
    $(el).prop('checked', false);
    var code = $(el).next().next().html();
    //$(".instructions div.pickUp").html("");
    showInstructions(false);

    newWTable();

    $("#code option:contains(" + code + ")").attr('selected', 'selected');
    //$("#code option:selected").text(code);

    //db.transaction(dbUpdateQ, errorCB);
}

function showInstructions(yesnNo)
{
    logging("showInstructions: "+yesnNo,1);
    if(yesnNo)
    {
        // show instructions
        //$("div.topMenu").css("display","none");
        $("div.sheets").css("display","none");
        $("div.instructions").css("display","block");
    } else
    {
        $("div.topMenu").css("display","block");
        $("div.sheets").css("display","block");
        $("div.instructions").css("display","none");
    }

}
function showInstructionsCodes()  // zruseno
{
    $("div.instruction").append("<div class='checkboxes'>");
    $("#code option").each(function()
    {
        $(".instructions div.pickUp").append('<input type="checkbox" value="'+$(this).text()+'"><span>'+$(this).text()+'</span><br>');

    });
}

function codesSetDefaults()
{
    var i =0;
    $("#code").append(defaultCodeOptionsHtml);

    $("div.instruction").append("<div class='checkboxes'>");
    $("#code option").each(function()
    {
        $(".instructions div.pickUp").append('<input id="instCheck'+i+'" type="checkbox" value="'+$(this).text()+'"><label class="checkboxFive" for="instCheck'+i+'"></label><label for="instCheck'+i+'">'+$(this).text()+'</label><br>');
        i++;
    });
}

function memPrev()
{
    categorySelectPrev = $("#categorySelect option:selected").val();
}

function lastSyncOK(showAlert)
{
    if(showAlert==null) showAlert = true;

    var state = true;
    if(lastSyncDate!=null)
    {
        currentDate = new Date();
        var ar = lastSyncDate.split("-");
        d_lastExportDate = new Date(ar[0],ar[1]-1,ar[2],ar[3],ar[4]);
        logging("last export month: " + Number(d_lastExportDate.getMonth()+1));
        logging("current month: " + Number(currentDate.getMonth()+1));

        var oneDay = 24*60*60*1000;
        var diffDays = Math.round(Math.abs((currentDate.getTime() - d_lastExportDate.getTime())/(oneDay)));
        //diffDays = 50;
        //logging("diff days: " + diffDays);
        var maxDays;
        if(appType=="simple")
        {
            maxDays = 45;
        } else
        {
            maxDays = 30;
        }
        //if(diffDays>45)
        if(currentDate.getMonth()!=d_lastExportDate.getMonth())
        {
            if(showAlert)
            {
                if(appType=="simple")
                {
                    alert('This app stops after 45 days. You cannot make any further changes. Please answer some questions about how the app worked for you.');
                    setTimeout(function(){
                        //http://community.phonegap.com/nitobi/topics/open_external_links_in_system_browser_phonegap_build_3_1_iphone_android_windows
                        window.open("http://www.kmdfinancial.com/SA/SimpleAppFeedback.htm", '_system', 'location=no')
                    }, 300);
                } else
                {
                    alert('This app stops after 30 days. You cannot make any further changes');
                }
            }


            state = false;

        }
    }



    firstInsert = true;
    return state;

}

function lastSyncLock()
{
    if(!lastSyncOK(false))
    {
        $("input").attr("readonly",true);
        $("ul.content").css("background-color","#f5f5f5");
        $("ul input").css("background-color","#f5f5f5");
    }
}

function focusSetNext(el)
{
    // if you in table, set focus on next field
    // $(el).parent().siblings('div.bottom').find("input.post").focus();
}

function showMenu()
{
    //$("#menu").css("display","block");
    $("#menu").toggle();
}


//-------------------------------------------------------------------
// level: 1=INFO, 2=WARNING, 3=ERROR
// v2
function logging(str, level) {
    if (level == 1 || level == null) console.log("INFO:" + str);
    if (level == 2) console.log("WARN:" + str);
    if (level == 3) alert("ERROR:" + str);
    if(loggingAlert) alert(str);

    var elLog = $("#log");
    if(elLog.length>0)
    {
        var elTextarea = $("#log").find("textarea");
        var text= $(elTextarea).val();
        text += str + "\n";
        $(elTextarea).val(text);
        $(elTextarea).scrollTop($(elTextarea)[0].scrollHeight);
    }
};

function StringtoXML(text)
{
    var xmlDoc;
    try {
        var xmlDoc = jQuery.parseXML(text);

    } catch(e) {
        logging("Invalid import xml!",3);
    }

    return xmlDoc;

}

function StringtoXML_old(text){
    if (window.ActiveXObject){
        var doc=new ActiveXObject('Microsoft.XMLDOM');
        doc.async='false';
        doc.loadXML(text);
    } else {
        var parser=new DOMParser();
        var doc=parser.parseFromString(text,'text/xml');
    }

    return doc;
}

// ---- menu button
function enableMenuButton()
{
    document.addEventListener("menubutton", menuButton, true);
}

function menuButton() {
    $("#log").toggle();
    if($("#log").css("display")=="block")
    {
        $(elTextarea).scrollTop($(elTextarea)[0].scrollHeight);
    }
}

// it works just for 2 decimals now
function numDecimalCorrection(numr,decimals)
{
    var ar = numr.toString().split(".");
    if(ar.length==1) return numr + ".00";
    numr = numr + "00";
    return numr.substring(0,numr.indexOf(".")+3);
}

function xmlSpecCharEn(str)
{
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function xmlSpecCharEn2(str)
{
    return str
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}