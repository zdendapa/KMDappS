/*
1. get date of last modification
    if same like in db - export db (and save new modification date to dob)
    if not same like in db - load whole data (and save new modification date)
 */

var fs = null;		// filesystem
var dir = null;		// dir
var xmlString = "";
var manualySave = false;
var fe;
var dbData = {
    FSsummary : "",
    lastSyncDate : "1900-1-1-00-00"
};

function fileInit()
{
    generateXML();
}

function initFs() {
    if(fileSupportOff) return;
    logging("initFs start",1);

    var s = location.origin + location.pathname;
    var pi = s.lastIndexOf("/");
    s = s.substring(0,pi);
    appBaseURL = s.substring(0, pi + 1);
    logging("appBaseURL:" + appBaseURL,1);

    if (is_cordova()) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem, onError);
    } else {
        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        if(navigator.webkitTemporaryStorage == undefined) {
            logging("File system si not supported!",3);
            return;
        }
        window.requestFileSystem(navigator.webkitTemporaryStorage.TEMPORARY, 5*1024*1024, gotFileSystem, onError);
    }
}

function gotFileSystem(lfs) {
    fs = lfs;
    var path;
    // if android made special path
    if (!workLocal && device && device.platform && device.platform.indexOf('Android') == 0) {
        path = "Android/data/cz.initedsolutions.kmdTMM/files";
    } else
    {
        if(workLocal) path = "kmd";
        else
        path = "";
    }

    fs.root.getDirectory(path, {create: true, exclusive: false}, gotDirectory, onError);
}
function gotDirectory(ldir) {
    dir = ldir;
    //dir.getFile("kmdExport.xml", {create: true}, gotFileEntry);

    if(fileLoadOnStart) workOn(dir,"read");


}

function workOn(dir,type) {
    // get modification date of file for recognize software update
    if(type=="meta")
    {
        dir.getFile("TMMHExport.xml", {create:true}, function(f) {
            //f.getMetadata(metadataFile,onError);

            f.file(function(file){
                modificationDate = new Date(file.lastModifiedDate);
                db.readLastExport(importExport);

            },function(){});

        },noFile);
    }
    // after write, read modification date
    if(type=="metaSave")
    {
        dir.getFile("TMMHExport.xml", {create:false}, function(f) {
            //f.getMetadata(metadataFileSave,onError);
            f.file(function(file){
                //console.log("uuuu"+ file.lastModifiedDate);
                modificationDate = new Date(file.lastModifiedDate);
                db.setLastExport();
            },function(){});



        }, onError);
    }
    if(type=="write")
    {
        dir.getFile("TMMHExport.xml", {create:true}, writeFile, onError);
    }
    if(type=="read")
    {
        dir.getFile("TMMHExport.xml", {create:false}, readFile, onErrorRead);
    }

}

function noFile()
{
    db.sheetsdataRowsCount(function(){
        if(db.sheetsdataRowsCountNum>0) workOn(dir,"write");
    });
}

/*
function metadataFile(m) {
    modificationDate = new Date(m.modificationTime);
    db.readLastExport(importExport);
}
function metadataFileSave(m) {
    //alert("File was last modified "+m.modificationTime);
    modificationDate = new Date(m.modificationTime);
    db.setLastExport();
    //workOn(dir,"write");
}
*/
var importExport = function()
{

    if(testFileModifiedByExter=="")
        var d_modificationDate = String(modificationDate.getFullYear()) + "-" + String(modificationDate.getMonth()+1) + "-" + modificationDate.getDate() + "-" + modificationDate.getHours() + "-" + modificationDate.getMinutes();
    else
        var d_modificationDate = testFileModifiedByExter;

    logging("modificationDate of file: " + d_modificationDate, 1);
    logging("lastExportDate of file: " + lastExportDate, 1);

    if(lastExportDate==d_modificationDate || lastExportDate == "")
    {
        if(exportAutomatic)
        {
            logging("Dates are same (or lastExportDate is empty), start to export data", 1);

            xmlExportAndSave();
        }



        //workOn(dir,"read");

    }else
    {
        //export data from db
        logging("Dates are not same, modification by software occured, start to read data", 1);
        workOn(dir,"read");
    }

};

function xmlExportAndSave()
{
    dataFromDBget(function(){

        generateXML("write");

    });
}


/*
<data>
    <meta>
        <category>
             <option>4006 "Auto Expenses"</option>
             <option>4007 "Food/Sundries"</option>
             <option>4008 "Home Maintenance"</option>
             <option>4009 "Insurance"</option>
             <option>4010 "Medical"</option>
             <option>4011 "Housing"</option>
             <option>4012 "Telephone"</option>
             <option>4013 "Utilities"</option>
             <option>4014 "Open"</option>
             <option>4015 "Open"</option>
             <option>4016 "Unident ified Cash w/d"</option>
             <option>4017 "Open"</option>
             <option>4018 "Open"</option>
             <option>4019 "Oenn</option>
             <option>4020 "Open"</option>
             <option>4021 "Open"</option>
             <option>4517 "Child#1-A"</option>
             <option>4517 "Child#2-B"</option>
             <option>4517 "Child#3-C"</option>
             <option>4517 "Child#4-D"</option>
             <option>4517 "Child#5-E"</option>
             <option>4518 "for Primary Wage Earner #1"</option>
             <option>4519 "for Primary Wage Earner #2"</option>
             <option>4520 "Pet#1-A"</option>
             <option>4520 "Pet#2-B"</option>
             <option>4521 "Open"</option>
             <option>5023 "Medical Debt / Fees / Charges"</option>
             <option>5024 "Loans & Notes Payable"</option>
             <option>5025 "Tax Debt I Estimated Tax"</option>
             <option>5026 "Open"</option>
             <option>6028 "Donations/Gifts"</option>
             <option>6029 "Entertainment"</option>
             <option>6032 "Savings"</option>
             <option>6033 "Vacations"</option>
        </category>
     </meta>
 </data>
*/

function readFile(fileEntry)
{

    fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
            var xml = StringtoXML(this.result);
            if(xml == null)
            {
                return;
            }

            noFileForInport = false;
            // ---- read code drop-down list


            /*
            var options = xml.getElementsByTagName("option");
            if(options.length>2)
            {
                $( "#code" ).empty();
                for (var i = 0; i < options.length; i++) {
                    var option = options[i].firstChild.nodeValue;
                    $( "#code" ).append($("<option></option>").attr("value", option).text(option));
                }
            }
            */

            // ---- end read category drop-down list
            db.importCode(xml);
            db.importSheets(xml);
            db.importHowPaid(xml);
            //db.FSsummaryImport(xml);
            db.importLastSyncDate(xml);


        };
        reader.readAsText(file);
        workOn(dir,"metaSave");
        db.setLastSync();
    });
}

function writeFile(fileEntry)
{

    fe = fileEntry;
    fileEntry.createWriter(gotFileWriter);



    fileEntry.file(function(file){

    },function(){});
}

function gotFileWriter(writer) {

    writer.truncate(0);
    writer.onwriteend = function(evt) {
        logging("shorten file",1);

        if(writer.length ===0)
        {
            if(workLocal)
            {
                // write blob
                if(testXMLSave)
                    var blob = new Blob([testWritelData], {type: 'text/plain'});
                else
                    var blob = new Blob([xmlString], {type: "text/plain"});

                writer.write(blob);
            } else
            {
                // write xmlString
                writer.write(xmlString);
            }

            writer.onwriteend = function(evt) {
                logging("write success",1);
                if(manualySave) {
                    alert("Saved to:" + fe.fullPath);
                    // fe.fullPath "/kmd/TMMHExport.xml"
                    // fe.toURL() "cdvfile://localhost/persistent/kmd/TMMHExport.xml"

                    console.log(fs);
                    manualySave = false;
                }
                workOn(dir,"metaSave");
            }
        }
        else
        {
            return;
        }
    };
}

function dataFromDBget(success_callback)
{
    db.metaGet(success_callback);
}

function generateXML(writeIt)
{
    database.transaction(function(tx)
    {
        tx.executeSql('select * from sheetsdata JOIN sheetsheaders ON sheetsdata.shid=sheetsheaders.shid ORDER BY shid', [], function(tx, results)
        {
            xmlString = "<data>";
            len = results.rows.length;
            if(len==0)
            {
                xmlString += "no data in db";
            }
            else
            {


/*
             <?xml version="1.0"?>
            <data>
                <meta>
                    <category>
                        <option>4006 "Auto Expenses"</option>
                        <option>4007 "Food/Sundries"</option>
                        <option>4008 "Home Maintenance"</option>
                        <option>4009 "Insurance"</option>
                        <option>4010 "Medical"</option>
                        <option>4011 "Housing"</option>
                        <option>4012 "Telephone"</option>
                        <option>4013 "Utilities"</option>
                        <option>4014 "Open"</option>
                        <option>4015 "Open"</option>
                        <option>4016 "Unident ified Cash w/d"</option>
                        <option>4017 "Open"</option>
                        <option>4018 "Open"</option>
                        <option>4019 "Oenn</option>
                        <option>4020 "Open"</option>
                        <option>4021 "Open"</option>
                        <option>4517 "Child#1-A"</option>
                        <option>4517 "Child#2-B"</option>
                        <option>4517 "Child#3-C"</option>
                        <option>4517 "Child#4-D"</option>
                        <option>4517 "Child#5-E"</option>
                        <option>4518 "for Primary Wage Earner #1"</option>
                        <option>4519 "for Primary Wage Earner #2"</option>
                        <option>4520 "Pet#1-A"</option>
                        <option>4520 "Pet#2-B"</option>
                        <option>4521 "Open"</option>
                        <option>5023 "Medical Debt / Fees / Charges"</option>
                        <option>5024 "Loans & Notes Payable"</option>
                        <option>5025 "Tax Debt I Estimated Tax"</option>
                        <option>5026 "Open"</option>
                        <option>6028 "Donations/Gifts"</option>
                        <option>6029 "Entertainment"</option>
                        <option>6032 "Savings"</option>
                        <option>6033 "Vacations"</option>
                    </category>
                </meta>
                <sheet>
                    <header>
                         <category></category>
                         <planSpend></planSpend>
                         <code></code>
                    </header>
                    <tableData>
                        <date></date>
                         <paid></paid>
                         <desc></desc>
                         <ref></ref>
                         <payment></payment>
                         <available></available>
                    <tableData>
                </sheet>
            </data>

             */




                xmlString += "<meta>";

                //xmlString += "<FSsummary>"+dbData.FSsummary+"</FSsummary>";
                xmlString += "<lastSyncDate>"+dbData.lastSyncDate+"</lastSyncDate>";

                // ---------------------------- category drop-down list
                /*
                    xmlString += "<category>";

                    $("#categorySelect option").each(function()
                    {
                        var encoded = xmlSpecCharEn($(this).val());
                        //console.log(encoded);
                        //xmlString += "<option>"+$(this).val()+"</option>";
                        xmlString += "<option>"+encoded+"</option>";
                    });

                    xmlString += "</category>";
                    */
                // ---------------------------- end category drop-down list


                // ---------------------------- howPaid
                xmlString += "<howPaid>";
                //xmlString += defaultHowPaidOptionsHtml;
                $(".paid select").first().find("option").each(function()
                {
                    //var encoded = Encoder.htmlEncode($(this).val());
                    var encoded = encodeURI($(this).val());
                    //console.log(encoded);
                    //xmlString += "<option>"+$(this).val()+"</option>";
                    xmlString += "<option>"+encoded+"</option>";
                });
                xmlString += "</howPaid>";
                // ---------------------------- howPaid

                // ---------------------------- code
                xmlString += "<code>";
                //xmlString += defaultCodeOptionsHtml;
                $("#categorySelect option").each(function()
                {
                    var encoded = Encoder.htmlEncode($(this).text());
                    //console.log(encoded);
                    //xmlString += "<option>"+$(this).val()+"</option>";
                    xmlString += '<option value="'+$(this).val()+'">'+encoded+'</option>';
                });


                xmlString += "</code>";
                // ---------------------------- code


                xmlString += "</meta>";

                var shid = "";
                var shidBefore = false;
                //fill up category drop-down
                for (var i=0; i<len; i++){
                    if(results.rows.item(i).shid!=shid)
                    {
                        if(shidBefore)
                        {
                            xmlString += "</tableData></sheet>";
                        }
                        xmlString += "<sheet><header><shid>"+results.rows.item(i).shid+"</shid><category>" + xmlSpecCharEn(results.rows.item(i).category) + "</category><planSpend>"+results.rows.item(i).planSpend+"</planSpend><code>"+results.rows.item(i).code+"</code></header><tableData>";
                        shidBefore = true;
                        shid = results.rows.item(i).shid;
                    }
                    xmlString += "<row>";
                    xmlString += "<rowID>"+results.rows.item(i).rowid+"</rowID><date>"+results.rows.item(i).dater+"</date><paid>"+results.rows.item(i).paid+"</paid><desc>"+xmlSpecCharEn(results.rows.item(i).desc)+"</desc><ref>"+xmlSpecCharEn(results.rows.item(i).checkRef)+"</ref>"
                    xmlString += "<payment>"+results.rows.item(i).payment+"</payment><available>"+results.rows.item(i).balance+"</available>";
                    xmlString += "<synced>"+results.rows.item(i).synced+"</synced>";
                    xmlString += "</row>";
                }
                xmlString += "</tableData></sheet>";

            }

            xmlString += "</data>";
            if(writeIt=="write") workOn(dir,"write");

        }, errorCB);
    }, errorCB);
}











function generateFile()
{
    if(db.sheetsdataRowsCountNum>0) fileInit();
    logging("generateFile()",1);
}


// chyba pri inicializaci filesystemu
function onError(e) {
    alert("chyba:" + e);
}
function onErrorRead(e) {
    noFileForInport = true;
    db.initSheetsData();
    //alert("Application cannot find xml file!\nPlease import file to the device and run again");
}



// chyba pri nacitani obrazku
function error_callback(e) {
    alert("chyba:" + e);
}


var is_cordova = function() {
    return (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
};

/*

function fileInit()
{


    ImgCache.options.debug = true;
    ImgCache.options.usePersistentCache = true;
    ImgCache.options.chromeQuota = 50*1024*1024;

    //console.log("cacheInit");

    ImgCache.init(function(){
        console.log('cache space ready');
        //cacheListShaFileNameGet();
        cachePreffix=ImgCache.getCacheFolderURI();
        test();
    }, function(){
        alert('cache problem');
        console.log('cache space problem!');
        //init();
    });
}

function test()
{
    //ImgCache.clearCache();
    //http://www.intelligrape.com/images/logo.png
    //ImgCache.cacheFile("http://www.intelligrape.com/images/logo.png", function(){

    //cacheFile
return;
    ImgCache.read("http://www.urias.cz/tmp/t.xml", function(){
        ImgCache.useCachedFile(target);
        console.log("cached");
    });
}

    */