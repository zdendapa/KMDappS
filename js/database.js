/*
DB structure:
headerdata - header data of each table
tabledata - first table
tableindex - list of all tables

tables : table1, table2 ...

 */


var database;   // current database

var lastExportDate; // date of export data to file (stored in db)
var modificationDate;   // date of file-modification
var lastSyncDate;   // date of last sync




var db = {
    settings: {
        shortName: 'kmds_e',
        version: '1.0',
        displayName: 'KMD app',
        maxSize: 655367 // in bytes
    }
};

db.init = function(success_callback)
{

    if(testNoDB) return;

    logging("Db si initiating",1);
    try {
        if (!window.openDatabase) {
            alert('not supported');
        } else {
            database = openDatabase(db.settings.shortName, db.settings.version, db.settings.displayName, db.settings.maxSize);
            logging("Db opened",1);
        }
    } catch(e) {
        // Error handling code goes here.
        if (e == "INVALID_STATE_ERR") {
            // Version number mismatch.
            logging("Invalid database version",3);
        } else {
            logging("DB initiating Unknown error "+e,3);
        }
        return;
    }

    db.createTables();
};



db.createTables = function()
{
    database.transaction(function(tx)
    {
        if(testFirst)
        {
            tx.executeSql('DROP TABLE IF EXISTS sheetsheaders');
            tx.executeSql('DROP TABLE IF EXISTS sheetsdata');
            tx.executeSql('DROP TABLE IF EXISTS meta');
            tx.executeSql('DROP TABLE IF EXISTS code');
            tx.executeSql('DROP TABLE IF EXISTS howPaid');
        }


        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsheaders (shid NUMBER,category, code, planSpend TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsdata (shid NUMBER, rowid NUMBER, dater, paid, desc, checkRef, payment TEXT, balance TEXT, synced TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS code (code TEXT, value TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS howPaid (howPaid TEXT)');


        database.transaction(function(tx) {
            tx.executeSql('SELECT count(*) as c FROM sqlite_master WHERE type="table" AND name="meta"', [], function(tx, results) {
                if(results.rows.item(0).c == 0)
                {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS meta (openedSheet NUMBER, lastExport TEXT,lastSyncDate TEXT, FSsummary TEXT)');

                    database.transaction(function(tx)
                    {
                        var dt = new Date();
                        var dtStr = String(dt.getFullYear()) + "-" + String(dt.getMonth()+1) + "-" + dt.getDate() + "-" + dt.getHours() + "-" + dt.getMinutes();
                        tx.executeSql('INSERT INTO meta (openedSheet, lastExport,lastSyncDate) VALUES (0,"","'+dtStr+'")');
                    }, errorCB);

                }
            }, errorCB);
        }, errorCB);


        // check data and if exist generate file
        //db.sheetsdataRowsCount(generateFile);
        initFs();


    //}, errorCB, db.initSheetsData);
    }, errorCB);
};

// fill up category drop-down, if exist sheets show them, if not create new one
db.initSheetsData = function()
{
    logging("db.initSheetsData",1);

    database.transaction(function(tx)
    {
        //fill up code drop-down
        tx.executeSql('SELECT code,value FROM code', [], function(tx, results)
        {
            len = results.rows.length;
            $(".instructions div.pickUp").empty();
            if(len>0)
            {

                $("#code").empty();
                for (var i=0; i<len; i++){
                    $("#code").append($("<option></option>").attr("value", results.rows.item(i).value).text(results.rows.item(i).code));
                }

                var newHtml= "";
                var arr = defaultCodeOptionsHtml.split("</option>");
                for(var i=0; i<arr.length;i ++)
                {

                    var val = arr[i].substring(arr[i].indexOf(">")+1);


                    var isIn = false;
                    for (var j=0; j<len; j++){
                        //console.log(results.rows.item(j).code + "aaaa" + val);
                        if(results.rows.item(j).code==val)
                        {
                            isIn = true;
                        }
                    }

                    var b = "";
                    var classAdd = "";

                    if(!isIn)
                    {
                        b = 'style="background-color:#0000FF"';
                    } else
                    {
                        classAdd = " clickable";
                    }

                    if(val!="") newHtml += '<input id="instCheck'+i+'" class="'+classAdd+'" type="checkbox" value="'+val+'"><label '+b+' class="checkboxFive'+classAdd+'" for="instCheck'+i+'"></label><label for="instCheck'+i+'">'+val+'</label><br>';
                }

                $("div.instruction").append("<div class='checkboxes'>");
                $(".instructions div.pickUp").append("<h1>Pick any choice to create a new page.</h1>"+newHtml);


                /*
                var newHtml= "";
                $("#code option").each(function()
                {
                    newHtml += '<input id="instCheck'+i+'" type="checkbox" value="'+$(this).text()+'"><label class="checkboxFive" for="instCheck'+i+'"></label><label for="instCheck'+i+'">'+$(this).text()+'</label><br>';
                    i++;
                });

                $(".instructions div.pickUp").append(newHtml);
                */


                /*

                $("#code").empty();
                for (var i=0; i<len; i++){
                    $("#code").append($("<option></option>").attr("value", results.rows.item(i).value).text(results.rows.item(i).code));
                    $(".instructions div.pickUp").append('<input type="checkbox" value="'+results.rows.item(i).code+'"><span>'+results.rows.item(i).code+'</span><br>');
                }
                */

            } else
            {
                codesSetDefaults();
            }



        }, errorCB);

        //fill up howPaid

        db.howPaidRead();



//tx.executeSql('SELECT * FROM sheetsheaders JOIN code ON sheetsheaders.category=code.code', [], function(tx, results)
        tx.executeSql('SELECT * FROM sheetsheaders', [], function(tx, results)
        {
            $("#categorySelect").empty();
            $("#categorySelect").append($("<option></option>").attr("value","Instructions").text("Instructions"));

            len = results.rows.length;
            if(len==0)
            {
                //newWTable();
                showInstructions(true);
                //showInstructionsCodes();

                $("#categorySelect").append($("<option></option>").attr("value","1").text("4021, Suspense"));

                db.CreateTableSuspense();

                $("body").css("display","block");

                if(confNewPageAvailable) $("#categorySelect").prepend($("<option></option>").attr("value","New page").text("New page"));
            }
            else
            {
                //fill up category drop-down
                for (var i=0; i<len; i++){
                    $( "#categorySelect" ).append($("<option></option>").attr("value", results.rows.item(i).shid).text(results.rows.item(i).category));
                }
                if(confNewPageAvailable) $("#categorySelect").prepend($("<option></option>").attr("value","New page").text("New page"));
                // load header and table
                // get last opened sheet shid
                database.transaction(function(tx)
                {
                    tx.executeSql('SELECT openedSheet FROM meta', [], function(tx, results)
                    {
                        $("#categorySelect").val(results.rows.item(0).openedSheet);
                        db.loadSheet();
                    }, errorCB);
                }, errorCB);
            }
        }, errorCB);


    }, errorCB);
};


db.CreateNextTable = function()
{
    logging("CreateNextTable",1);
    database.transaction(function(tx)
    {
        tx.executeSql('SELECT max(shid) as lastshid FROM sheetsheaders', [], function(tx, results)
        {
            var shid;


                shid = Number(results.rows.item(0).lastshid) + 1;
                //$("#categorySelect").append($("<option></option>").attr("value", shid).text(""));

                //$("#categorySelect option").eq($("#categorySelect > option").length-1).before($("<option></option>").val(shid).html(""));
                $("#categorySelect").append($("<option></option>").val(shid).html(""));
                $("#categorySelect").val(shid);

            db.setOpenedSheet();

            database.transaction(function(tx){
                tx.executeSql('INSERT INTO sheetsheaders (shid,category, code, planSpend) VALUES ('+Number(shid)+',"", "", "0.00")');
            }, errorCB);

        }, errorCB);
    }, errorCB);
};


db.CreateTableSuspense = function()
{
    logging("CreateNextTable",1);
    database.transaction(function(tx)
    {
        database.transaction(function(tx){
            tx.executeSql('INSERT INTO sheetsheaders (shid,category, code, planSpend) VALUES ('+1+',"", "", "0.00")');
        }, errorCB);
    }, errorCB);
};



db.headerUpdate = function()
{
    if(!lastSyncOK()) return;
    database.transaction(function(tx)
    {
        //var category = $("#category").val();
        var category = $( "#categorySelect option:selected" ).text();
        //category = category.replace("'","\'");
        //category = category.replace(/'/g, "&#39;").replace(/"/g,"&quot;");
        var code = $( "#categorySelect option:selected" ).text();
        var planSpend = $("#planSpend").val();
        var shid = shidCurrentGet();
        //console.log("UPDATE sheetsheaders SET category='"+category+"', code='"+code+"', planSpend='"+planSpend+"' WHERE shid='"+shid+"'");

        tx.executeSql("UPDATE sheetsheaders SET category = ?, code = ?, planSpend =? WHERE shid=?",[category,code,planSpend,shid]);


    }, errorCB);
};


db.rowUpdateInsert = function()
{
    logging("rowUpdateInsert",1);
    logging("rowUpdatedID"+rowUpdatedID,1);
    var shid = shidCurrentGet();
    database.transaction(function(tx) {
        tx.executeSql('SELECT * FROM sheetsdata WHERE rowid='+rowUpdatedID+' and shid='+shid, [], function(tx, results) {
            if(results.rows.length == 0)
            {
                dbUpdateOrInsert(tx,"insert");
            } else
            {
                dbUpdateOrInsert(tx,"update");
            }
        }, errorCB);
    }, errorCB);
};

function dbUpdateOrInsert(tx,type) {
    logging("dbUpdateOrInsert: " + type,1)
    //tx.executeSql('CREATE TABLE IF NOT EXISTS tabledata (id unique, data)');
    var el = $('li[data-id|="'+rowUpdatedID+'"]');
    var rowID = $(el).attr("data-id");
    var dater = $(el).find(".dater input").val();
    //var paid = $(el).find(".paid select").val();
    //var paid = $(el).find(".paid input").val();
    var paid = $(el).find(".paid select")[0].selectedIndex;
    var desc = $(el).find(".description input").val();
    var checkRef = $(el).find(".checkRef input").val();
    var payment = $(el).find(".payment input").val();
    var balance = $(el).find(".last input").val();
    var shid = shidCurrentGet();
    //console.log('UPDATE wt'+currentWtable+' SET dater="'+dater+'", paid="'+paid+'", desc="'+desc+'", checkRef="'+checkRef+'", payment='+payment+', balance='+balance+' WHERE rowid='+rowID);

    //if(type=="update") tx.executeSql('UPDATE sheetsdata SET dater="'+dater+'", paid="'+paid+'", desc="'+desc+'", checkRef="'+checkRef+'", payment="'+String(payment)+'", balance="'+balance+'" WHERE rowid='+rowID+' and shid='+shid);
    if(type=="update") tx.executeSql('UPDATE sheetsdata SET dater=?, paid=?, desc=?, checkRef=?, payment=?, balance=? WHERE rowid=? and shid=?', [dater, paid, desc, checkRef, payment, balance,rowID,shid]);

    //if(type=="insert") tx.executeSql('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES ('+shid+','+rowID+', "'+dater+'", "'+paid+'", "'+desc+'", "'+checkRef+'", "'+payment+'", "'+balance+'")');
    if(type=="insert") tx.executeSql('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES (?,?,?,?,?,?,?,?)',[shid,rowID,dater,paid,desc,checkRef,payment,balance]);
}

db.loadSheet = function()
{

    if($("#categorySelect option:selected").val()=="Instructions")
    {
        showInstructions(true);
        $("body").css("display","block");
        $("#category").val("Instructions");
        return;
    }
    // this code is in newWTable
    if(categorySelectPrev=="Instructions")
    {
        showInstructions(false);
        $("body").css("display","block");
    }
    ulHeightSet();

    var shid = shidCurrentGet();

    database.transaction(function(tx){
        tx.executeSql('SELECT * FROM sheetsheaders WHERE shid="'+shid+'"', [], function(tx, results) {

            if(results.rows.length>0)
            {

                $("#category").val(results.rows.item(0).category);


                $('#code option')
                    .filter(function() { return $.trim( $(this).text() ) == results.rows.item(0).code; })
                    .attr('selected',true);

                $("#planSpend").val(results.rows.item(0).planSpend);
            }


        }, errorCB);
    }, errorCB);

    database.transaction(function(tx){
        tx.executeSql('SELECT * FROM sheetsdata WHERE shid="'+shid+'"', [], function(tx, results) {
                var len = results.rows.length;
                //console.log("tabledata table: " + len + " rows found.");
                $("ul.content").empty();
                lastRowID = 0;
                var defaultHowPaidOptionsArray = defaultHowPaidOptionsHtml.replace(/<option>/g,"").split("</option>");

                for (var i=0; i<len; i++){

                    // change paid index to paid text
                    if(isNaN(results.rows.item(i).paid))
                    {
                        var paid = results.rows.item(i).paid;
                    } else
                    {
                        var paid = defaultHowPaidOptionsArray[results.rows.item(i).paid];
                    }

                    var readonly = "";
                    var disabled = "";
                    var classAdd = "";
                    var tbpStyle ="";
                    if(results.rows.item(i).synced=="x")
                    {
                        readonly = "readonly";
                        disabled = "disabled";
                        classAdd = "colorDisabled";
                    }
                    //console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).payment);
                    $("ul.content").append('<li data-id="'+results.rows.item(i).rowid+'"><span class="dater '+classAdd+'"><input '+readonly+' onchange="dateFormatCheck(this)" onfocus="dateFormatIn(this)" value="'+results.rows.item(i).dater+'"></span><span class="description '+classAdd+'"><input '+readonly+' value="'+ xmlSpecCharEn2(results.rows.item(i).desc)+'" onchange="addRowCheck(this)"></span><span class="paid '+classAdd+'"><input '+readonly+' value="'+paid+'"><select '+disabled+'>'+defaultHowPaidOptionsHtml+'</select></span><span class="checkRef '+classAdd+'"><input '+readonly+' value="'+results.rows.item(i).checkRef+'"></span> <span class="payment '+classAdd+'"><input '+readonly+' value="'+results.rows.item(i).payment+'"></span> <span class="last '+classAdd+'"><input style="color:'+(results.rows.item(i).balance>=0?String("black"):String("red"))+'"  value="'+results.rows.item(i).balance+'" readonly></span> </li>');

                    // select right option on the select

                    var li = $("ul.content").find("li[data-id='"+results.rows.item(i).rowid+"']");
                    if(isNaN(results.rows.item(i).paid))
                    {

                        li.find("select").val(paid);
                        if(li.find("select").text()=="TBP")
                        {
                            li.css("background","yellow");
                            li.find("input").css("background","yellow");
                        }

                    } else
                    {
                        li.find("select").find("option").eq(results.rows.item(i).paid).prop('selected', true);
                        if(paid=="TBP")
                        {
                            li.css("background","yellow");
                            li.find("input").css("background","yellow");
                        }
                    }

                    lastRowID = i + 1;
                }


                addRow();
                lastSyncLock();

            }
            , errorCB);
    }, errorCB);


};


db.recalculateBalance = function(success_callback)
{
    database.transaction(function(tx)
    {
        $(".content li").each(function(){
            var el = this;
            var rowID = $(el).attr("data-id");
            var payment = $(el).find(".payment input").val();
            var balance = $(el).find(".last input").val();
            var shid = shidCurrentGet();

                tx.executeSql('UPDATE sheetsdata SET payment="'+String(payment)+'", balance="'+balance+'" WHERE rowid='+rowID+' and shid='+shid);
        });
    }, errorCB);
};

db.getLastSheetIndex = function(success_callback)
{
    database.transaction(function(tx)
    {
        tx.executeSql('SELECT max(shid) FROM sheetsheaders', [], function(tx, results)
        {
            if(results.rows.length == 0)
            {
                success_callback(0);
            } else
            {
                success_callback();
            }
        }, errorCB);

    }, errorCB);
}

db.setOpenedSheet = function()
{
    if($("#categorySelect option:selected").val()=="Instructions")
    {
        return;
    }
    database.transaction(function(tx)
    {
        var shid = shidCurrentGet();
        tx.executeSql('UPDATE meta SET openedSheet='+shid);
    }, errorCB);
};

db.setLastExport = function()
{
    database.transaction(function(tx)
    {
        //var date = new Date();
        var dateString = String(modificationDate.getFullYear()) + "-" + String(modificationDate.getMonth()+1) + "-" + modificationDate.getDate() + "-" + modificationDate.getHours() + "-" + modificationDate.getMinutes();
        lastExportDate = dateString;
        //alert('UPDATE meta SET lastExport='+String(dateString));
        tx.executeSql('UPDATE meta SET lastExport="'+dateString+'"');
    }, errorCB);
};

db.readLastExport = function(success_callback)
{
    database.transaction(function(tx,success_callback)
    {
        tx.executeSql('SELECT lastExport FROM meta', [], function(tx, results)
        {

            lastExportDate = results.rows.length==0?"":results.rows.item(0).lastExport;
        }, errorCB, success_callback);
    }, errorCB, success_callback);
};

db.setLastSync = function()
{
    database.transaction(function(tx)
    {
        //var date = new Date();
        currentDate = new Date();
        var dateString = String(currentDate.getFullYear()) + "-" + String(currentDate.getMonth()+1) + "-" + currentDate.getDate() + "-" + currentDate.getHours() + "-" + currentDate.getMinutes();
        lastSyncDate = dateString;
        //alert('UPDATE meta SET lastExport='+String(dateString));
        tx.executeSql('UPDATE meta SET lastSyncDate="'+dateString+'"');
    }, errorCB);
};

db.readLastSync = function(success_callback)
{
    database.transaction(function(tx,success_callback)
    {
        tx.executeSql('SELECT lastSyncDate FROM meta', [], function(tx, results)
        {
            lastSyncDate = results.rows.item(0).lastSyncDate;
            if(lastSyncDate==null || lastSyncDate =="")
                db.setLastSync();
        }, errorCB, success_callback);
    }, errorCB, success_callback);
};

db.sheetsdataRowsCount = function(success_callback)
{
    database.transaction(function(tx,success_callback)
    {
        tx.executeSql('SELECT count(*) as count FROM sheetsdata', [], function(tx, results)
        {
            db.sheetsdataRowsCountNum = results.rows.item(0).count;
        }, errorCB, success_callback);
    }, errorCB, success_callback);
};

function errorCB(err) {
    logging("Error processing SQL: "+err,3);
}

db.howPaidRead = function(xml,success_callback)
{
    database.transaction(function(tx) {
    tx.executeSql('SELECT howPaid FROM howPaid', [], function(tx, results)
    {
        len = results.rows.length;
        if(len>0)
        {
            defaultHowPaidOptionsHtml = "";
            for (var i=0; i<len; i++){
                defaultHowPaidOptionsHtml += "<option>" + results.rows.item(i).howPaid + "</option>";
            }
        }



    }, errorCB);
    }, errorCB);
};
db.howPaidUpdate = function(xml,success_callback)
{
    database.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS howPaid');
        tx.executeSql('CREATE TABLE IF NOT EXISTS howPaid (howPaid TEXT)');


        for(var i=0;i<$(".paid select").first().find("option").length;i++)
        {
            // update database
            var optVal = $(".paid select").first().find("option").eq(i).text();
            tx.executeSql('INSERT INTO howPaid (howPaid) VALUES (?)',[optVal]);

        }

        //tx.executeSql('INSERT INTO howPaid (howPaid) VALUES (?)',[]);

    }, errorCB);
};

// --------------- import
db.importSheets = function(xml,success_callback)

{

    database.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS sheetsdata');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsdata (shid NUMBER, rowid NUMBER, dater, paid, desc, checkRef, payment TEXT, balance TEXT, synced TEXT)');

        tx.executeSql('DROP TABLE IF EXISTS sheetsheaders');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sheetsheaders (shid NUMBER,category, code, planSpend TEXT)');

        var sheets = xml.getElementsByTagName("sheet");

        if(sheets.length>0)
        {
            for (var i = 0; i < sheets.length; i++) {
                console.log("sheets.length" + sheets.length);
                //var sheet = sheets[i].firstChild.nodeValue;
                var sheet = sheets[i];
                var category = sheet.getElementsByTagName("category");
                //console.log(category[0].firstChild.nodeValue);
                //tx.executeSql('INSERT INTO sheetsheaders (shid, category, code, planSpend) VALUES ('+sheet.getElementsByTagName("shid")[0].firstChild.nodeValue+','+sheet.getElementsByTagName("category")[0].firstChild.nodeValue+','+Encoder.htmlDecode(sheet.getElementsByTagName("code")[0].firstChild.nodeValue)+', '+sheet.getElementsByTagName("planSpend")[0].firstChild.nodeValue+')');
                //tx.executeSql('INSERT INTO sheetsheaders (shid, category, code, planSpend) VALUES ('+sheet.getElementsByTagName("shid")[0].firstChild.nodeValue+','+getXmlNodeValue(sheet,"category")+','+getXmlNodeValue(sheet,"code")+', '+getXmlNodeValue(sheet,"planSpend")+')');
                tx.executeSql('INSERT INTO sheetsheaders (shid, category, code, planSpend) VALUES (?,?,?,?)', [sheet.getElementsByTagName("shid")[0].firstChild.nodeValue,getXmlNodeValue(sheet,"code"),getXmlNodeValue(sheet,"code"),getXmlNodeValue(sheet,"planSpend")]);
                  //console.log('INSERT INTO sheetsheaders (shid, category, code, planSpend) VALUES ('+sheet.getElementsByTagName("shid")[0].firstChild.nodeValue+','+getXmlNodeValue(sheet,"category")+','+getXmlNodeValue(sheet,"code")+', '+getXmlNodeValue(sheet,"planSpend")+')');

                var rows =  sheet.getElementsByTagName("row");
                console.log(rows.length);
                for (var j = 0; j < rows.length; j++) {
                    var row = rows[j];

                    //tx.executeSql('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES ('+getXmlNodeValue(sheet,"shid")+','+getXmlNodeValue(row,"rowID")+', '+getXmlNodeValue(row,"date")+', '+getXmlNodeValue(row,"paid")+', '+getXmlNodeValue(row,"desc")+', '+getXmlNodeValue(row,"ref")+', '+getXmlNodeValue(row,"payment")+', '+getXmlNodeValue(row,"available")+')');
                    tx.executeSql('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance, synced) VALUES (?,?,?,?,?,?,?,?,?)', [getXmlNodeValue(sheet,"shid"),getXmlNodeValue(row,"rowID"),getXmlNodeValue(row,"date"),getXmlNodeValue(row,"paid"),getXmlNodeValue(row,"desc"),getXmlNodeValue(row,"ref"),getXmlNodeValue(row,"payment"),getXmlNodeValue(row,"available"),getXmlNodeValue(row,"synced")]);
                    //console.log('INSERT INTO sheetsdata (shid, rowid, dater, paid, desc, checkRef, payment, balance) VALUES ('+getXmlNodeValue(sheet,"shid")+','+getXmlNodeValue(row,"rowID")+', '+getXmlNodeValue(row,"date")+', '+getXmlNodeValue(row,"paid")+', '+getXmlNodeValue(row,"desc")+', '+getXmlNodeValue(row,"ref")+', '+getXmlNodeValue(row,"payment")+', '+getXmlNodeValue(row,"available")+')');

                }
            }
        }

        db.initSheetsData();

    }, errorCB);


};


function getXmlNodeValue(obj,TagName)
{
    if(obj.getElementsByTagName(TagName)[0]== undefined)
    return '';
    if(obj.getElementsByTagName(TagName)[0].firstChild==null)
    return '';
    else
        return (IsNumeric(obj.getElementsByTagName(TagName)[0].firstChild.nodeValue)?obj.getElementsByTagName(TagName)[0].firstChild.nodeValue:obj.getElementsByTagName(TagName)[0].firstChild.nodeValue);
        //return (IsNumeric(obj.getElementsByTagName(TagName)[0].firstChild.nodeValue)?obj.getElementsByTagName(TagName)[0].firstChild.nodeValue:getQuoted(obj.getElementsByTagName(TagName)[0].firstChild.nodeValue));
    //return (IsNumeric(obj.getElementsByTagName(TagName)[0].firstChild.nodeValue)?obj.getElementsByTagName(TagName)[0].firstChild.nodeValue:'"'+obj.getElementsByTagName(TagName)[0].firstChild.nodeValue+'"');

}

function getQuoted(txt)
{
    if(txt.indexOf("'") != -1)
    {
        return '"'+txt+'"';
    } else
    {
        return "'"+txt+"'";
    }
}

function IsNumeric(input)
{
    return (input - 0) == input && (''+input).replace(/^\s+|\s+$/g, "").length > 0;
}

db.importHowPaid = function(xml,success_callback)
{
    database.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS howPaid');
        tx.executeSql('CREATE TABLE IF NOT EXISTS howPaid (howPaid TEXT)');

        var howPaidTags = xml.getElementsByTagName("howPaid");
        if(howPaidTags.length>0)
        {
            var howPaidTag = howPaidTags[0];
            var howPaidOptions = howPaidTag.getElementsByTagName("option");

            console.log("howPaidOptions.length"+howPaidOptions.length);

            for (var i = 0; i < howPaidOptions.length; i++) {
                var option = howPaidOptions[i];
                //console.log(option.firstChild.nodeValue);
                tx.executeSql('INSERT INTO howPaid (howPaid) VALUES ("'+option.firstChild.nodeValue+'")');
            }
        }
    }, errorCB);
};

db.importCode = function(xml,success_callback)
{

    database.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS code');
        tx.executeSql('CREATE TABLE IF NOT EXISTS code (code TEXT, value TEXT)');


        var codeTags = xml.getElementsByTagName("code");

        if(codeTags.length>0)
        {
            var codeTag = codeTags[0];
            var codeOptions = codeTag.getElementsByTagName("option");

            //console.log("codeOptions.length"+codeOptions.length);


            for (var i = 0; i < codeOptions.length; i++) {


                var option = codeOptions[i];

                //console.log("opt:" + option.attributes[0].nodeValue);
                //var str = '<option value="'+option.attributes[0].nodeValue+'">'+option.firstChild.nodeValue+'</option>';
                var str = option.firstChild.nodeValue;
                var strVal = option.attributes[0].nodeValue;
                tx.executeSql('INSERT INTO code (code, value) VALUES (?,?)', [str,strVal]);
            }
        }
    }, errorCB);
};

db.importSyncDate = function(xml,success_callback)
{
    database.transaction(function(tx) {
        var FSsummary = getXmlNodeValue(xml,"syncDate");
        tx.executeSql("UPDATE meta SET syncDate = ?",[FSsummary]);
    }, errorCB);
};

db.importLastSyncDate = function(xml,success_callback)
{
    database.transaction(function(tx) {
        lastSyncDate = getXmlNodeValue(xml,"lastSyncDate");
        tx.executeSql("UPDATE meta SET lastSyncDate = ?",[lastSyncDate]);
    }, errorCB);
};

db.metaGet = function(success_callback)
{
    database.transaction(function(tx) {
        tx.executeSql('SELECT * FROM meta', [], function(tx, results) {
            dbData.FSsummary = 0;
            if(results.rows.length > 0)
            {
                //dbData.FSsummary = results.rows.item(0).FSsummary==null?"0":results.rows.item(0).FSsummary;
                var dt = new Date();
                var dtStr = String(dt.getFullYear()) + "-" + String(dt.getMonth()+1) + "-" + dt.getDate() + "-" + dt.getHours() + "-" + dt.getMinutes();
                dbData.lastSyncDate = results.rows.item(0).lastSyncDate==null?dtStr:results.rows.item(0).lastSyncDate;
            }
        }, errorCB);

    }, errorCB,success_callback);
};

db.deleteShid = function(success_callback)
{
    database.transaction(function(tx) {
        var shid = shidCurrentGet();
        tx.executeSql('DELETE FROM sheetsdata WHERE shid='+shid);
        tx.executeSql('DELETE FROM sheetsheaders WHERE shid='+shid);
    }, errorCB, success_callback);

};

db.deleteRow = function(rowid,success_callback)
{
    database.transaction(function(tx) {
        var shid = shidCurrentGet();
        tx.executeSql('DELETE FROM sheetsdata WHERE shid='+shid+' AND rowid='+ rowid);
    }, errorCB, success_callback);

};


db.pieDataGetShid = function(success_callback)
{
    var code = $("#code option:selected").text();
    pieData = [];

    database.transaction(function(tx){
        tx.executeSql('SELECT shid, category from sheetsheaders where code ="'+code+'"', [], function(tx, results) {

            var fun;
            if(results.rows.length>0)
            {
                for(var i=0;i<results.rows.length;i++)
                {
                    // on the last run function
                    if(i==results.rows.length-1) fun = success_callback;
                    db.pieDataGetCount(results.rows.item(i).shid,results.rows.item(i).category,fun);
                }
            } else
            {
                alert("No data");
            }


        }, errorCB);
    }, errorCB);
};


db.tableSummShow = function(success_callback)
{
    pieData = [];

    database.transaction(function(tx){
        tx.executeSql('SELECT sheetsheaders.shid,code.code,sheetsheaders.planSpend from sheetsheaders JOIN code on sheetsheaders.shid=code.value', [], function(tx, results) {

            var fun;
            //console.log(results.rows.item(1).shid);
            if(results.rows.length>0)
            {
                for(var i=0;i<results.rows.length;i++)
                {
                    // on the last run function
                    if(i==results.rows.length-1) fun = success_callback;
                    db.tableSummDataGet(results.rows.item(i).shid, results.rows.item(i).code,results.rows.item(i).planSpend,fun);
                }
            } else
            {
                alert("No data");
            }


        }, errorCB);
    }, errorCB);
};


db.tableSummDataGet = function(sh,shName,planSpend,success_callback)
{
    database.transaction(function(tx){
        tx.executeSql('select payment from sheetsdata where shid ="'+sh+'"', [], function(tx, results) {

            if(results.rows.length>0)
            {
                var total = 0;
                for(var i=0;i<results.rows.length;i++)
                {
                    total += Number(results.rows.item(i).payment);
                    var s = {};
                }
                var s =[shName,planSpend,total];
                pieData.push(s);
            }

            if(success_callback) {
                if(pieData.length>0)
                {
                    //success_callback();
                    db.metaGet(success_callback);
                } else
                    alert("No data to show");
            }

        }, errorCB);
    }, errorCB);
};

db.pieDataGetShid = function(success_callback)
{
    var code = $("#code option:selected").text();
    pieData = [];

    database.transaction(function(tx){
        tx.executeSql('SELECT shid, category from sheetsheaders where code ="'+code+'"', [], function(tx, results) {

            var fun;
            if(results.rows.length>0)
            {
                for(var i=0;i<results.rows.length;i++)
                {
                    // on the last run function
                    if(i==results.rows.length-1) fun = success_callback;
                    db.pieDataGetCount(results.rows.item(i).shid,results.rows.item(i).category,fun);
                }
            } else
            {
                alert("No data");
            }


        }, errorCB);
    }, errorCB);
};

db.pieDataGetCount = function(sh,shName,success_callback)
{
    database.transaction(function(tx){
        tx.executeSql('select payment from sheetsdata where shid ="'+sh+'"', [], function(tx, results) {

            if(results.rows.length>0)
            {
                var total = 0;
                for(var i=0;i<results.rows.length;i++)
                {
                    total += Number(results.rows.item(i).payment);
                    var s = {};
                }
                var s =[shName, total];
                pieData.push(s);
            }

            if(success_callback) {
                if(pieData.length>0)
                {
                    //success_callback();
                    db.metaGet(success_callback);
                } else
                    alert("No data to show");
            }

        }, errorCB);
    }, errorCB);
};
