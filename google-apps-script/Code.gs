/*
RUANG BELAJAR LITE — GOOGLE APPS SCRIPT BACKEND
Spreadsheet tabs:
Students, Attendance, Materials, Assignments, Announcements, Submissions

Set Script Properties:
SPREADSHEET_ID = ID Google Sheet
DRIVE_FOLDER_ID = ID folder Drive untuk bukti foto

Deploy as Web App:
Execute as: Me
Who has access: Anyone
*/

const props = PropertiesService.getScriptProperties();
const SS_ID = props.getProperty("SPREADSHEET_ID");
const DRIVE_FOLDER_ID = props.getProperty("DRIVE_FOLDER_ID");

function doGet(e) {
  return json({ok:true, app:"Ruang Belajar API", time:new Date().toISOString()});
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;
    if (action === "login") return json(login(body));
    if (action === "attendance") return json(saveAttendance(body));
    if (action === "material") return json(addRow("Materials", body));
    if (action === "assignment") return json(addRow("Assignments", body));
    if (action === "announcement") return json(addRow("Announcements", body));
    if (action === "submission") return json(saveSubmission(body));
    if (action === "data") return json(getData(body));
    return json({ok:false,error:"Action tidak dikenal"});
  } catch(err) {
    return json({ok:false,error:String(err)});
  }
}

function sheet(name) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(name);
}
function rows(name) {
  const s=sheet(name); if(!s) return [];
  const v=s.getDataRange().getValues(); if(v.length<2)return [];
  const h=v[0]; return v.slice(1).filter(r=>r.join("")!=="").map(r=>Object.fromEntries(h.map((x,i)=>[String(x),r[i]])));
}
function login(b) {
  const list=rows("Students");
  const all=[...list,{Name:"Guru",PIN:props.getProperty("TEACHER_PIN")||"1234",Role:"teacher",Id:"teacher"}];
  const u=all.find(x=>String(x.PIN)===String(b.pin) && (!b.name || String(x.Name).toLowerCase()===String(b.name).toLowerCase()));
  return u?{ok:true,user:{name:u.Name,role:u.Role||"student",id:u.Id||u.Name}}:{ok:false,error:"Nama atau PIN salah"};
}
function addRow(name,b) {
  const s=sheet(name); if(!s) throw new Error("Sheet "+name+" belum dibuat");
  const h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];
  const obj={...b}; delete obj.action;
  s.appendRow(h.map(k=>obj[k]??""));
  return {ok:true};
}
function saveAttendance(b) {
  const s=sheet("Attendance"); if(!s) throw new Error("Sheet Attendance belum dibuat");
  const h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];
  const id=Utilities.getUuid();
  let proof="";
  if(b.photo && DRIVE_FOLDER_ID) {
    const folder=DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const bytes=Utilities.base64Decode(b.photo.data);
    const blob=Utilities.newBlob(bytes,b.photo.type,b.photo.name||("bukti-"+Date.now()));
    proof=folder.createFile(blob).getUrl();
  }
  const obj={Id:id,Name:b.name,Date:b.date||new Date(),Status:b.status,Note:b.note||"",Proof:proof};
  s.appendRow(h.map(k=>obj[k]??""));
  return {ok:true,id,proof};
}
function saveSubmission(b) { return addRow("Submissions",b); }
function getData(b) {
  return {
    ok:true,
    students:rows("Students"),
    attendance:rows("Attendance"),
    materials:rows("Materials"),
    assignments:rows("Assignments"),
    announcements:rows("Announcements"),
    submissions:rows("Submissions")
  };
}
function json(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON)}