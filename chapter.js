// Fill in the chapter identity, rosters and publication when supplied.
// Logo and cover can be paths in assets/. Issue links can be local PDFs or HTTPS readers.
const chapter = {
  college: "[College name]",
  chapterLogo: "",
  email: "",
  execom: [
    { role: "Faculty advisor", name: "" }, { role: "Chair", name: "" },
    { role: "Vice chair", name: "" }, { role: "Secretary", name: "" }, { role: "Treasurer", name: "" }
  ],
  volcom: [
    { role: "Technical volunteers", name: "" }, { role: "Editorial volunteers", name: "" },
    { role: "Event volunteers", name: "" }
  ],
  magazine: { issueTitle: "", cover: "", reader: "", reference: "https://nitblit.github.io/Dhwani/" }
};
const get = selector => document.querySelector(selector);
document.querySelectorAll("[data-college]").forEach(label => label.textContent=chapter.college);
if(chapter.chapterLogo) {
  const logo=new Image(); logo.alt=chapter.college+" chapter logo";
  logo.onload=()=>get(".logo-slot").replaceWith(logo); logo.src=chapter.chapterLogo;
}
if(chapter.email) {
  const link=document.createElement("a");link.href="mailto:"+chapter.email;link.textContent=chapter.email;
  get("#contact-line").replaceChildren("Contact the chapter at ",link);
}
for(const group of ["execom","volcom"]) {
  const members=chapter[group].map(member=>{
    const item=document.createElement("li"), name=document.createElement("span");
    name.textContent=member.name || "To be announced";item.append(member.role," ",name);return item;
  });
  get("#"+group).replaceChildren(...members);
}
const issue=chapter.magazine;
if(issue.cover) {
  const image=new Image();image.alt=issue.issueTitle || "Dhwani magazine cover";image.className="cover-image";
  image.onload=()=>get(".cover-stage").replaceChildren(image);image.src=issue.cover;
}
const publication=get("#issue-link");
publication.href=issue.reader || issue.reference;
if(issue.reader) {
  publication.textContent="Read the issue";get("#issue-status").textContent=issue.issueTitle || "Current issue";
  get(".mag-desc").textContent="Read the chapter magazine online.";
}
get("#year").textContent=new Date().getFullYear();
const menu=get("#menu"), primary=get("#primary"), compact=matchMedia("(max-width:810px)");
function setMenu(open) {
  menu.hidden=!compact.matches;primary.hidden=compact.matches&&!open;
  menu.setAttribute("aria-expanded",String(compact.matches&&open));
}
setMenu(false);compact.addEventListener("change",()=>setMenu(false));
menu.addEventListener("click",()=>setMenu(primary.hidden));
primary.addEventListener("click",event=>{if(event.target.closest("a"))setMenu(false);});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape" && compact.matches && !primary.hidden){setMenu(false);menu.focus();}
});
const dialog=get("#search"), query=get("#query"), results=get("#results");
const searchable=[
  ["Radio transceiver · TX and RX","#instrument","radio hardware baseband antenna wireless transmit receive"],
  ["About the chapter","#about","IEEE Communications Society student branch "+chapter.college],
  ["Chapter event archive","#events","calendar workshops events by year"],
  ...Array.from(document.querySelectorAll("[data-archive-entry]"), entry => {
    const title = entry.querySelector("h3, .entry-title").textContent;
    return [title, "#" + entry.id, entry.dataset.archiveEntry + " " + entry.textContent];
  }),
  ["Dhwani · Chapter magazine","#magazine","publication editorial issue cover "+issue.issueTitle],
  ...["execom","volcom"].map((group,i)=>[i?"VolCom · Volunteer committee":"ExeCom · Executive committee","#"+group,chapter[group].map(person=>person.role+" "+person.name).join(" ")]),
  ["Membership and contact","#contact","join volunteer email IEEE ComSoc"]
];
function filterSearch() {
  const terms=query.value.trim().toLowerCase().split(/\s+/);
  const matches=searchable.filter(([name,,words])=>terms.every(word=>(name+" "+words).toLowerCase().includes(word)));
  results.replaceChildren(...matches.map(([name,target])=>{
    const li=document.createElement("li"), a=document.createElement("a");
    a.href=target;a.textContent=name;
    a.addEventListener("click",()=>{
      dialog.close();const found=get(target);
      if(found.tagName==="DETAILS")found.open=true;
      found.tabIndex=-1;found.focus({preventScroll:true});found.scrollIntoView();
    });
    li.append(a);return li;
  }));
  get("#result-count").textContent=matches.length ? matches.length+" results" : "No matches. Try a committee, project or event name.";
}
if(typeof dialog.showModal==="function"){
  get("#search-open").hidden=false;
  get("#search-open").addEventListener("click",()=>{query.value="";filterSearch();dialog.showModal();query.focus();});
  query.addEventListener("input",filterSearch);
}
function revealDestination(){
  const target=document.getElementById(location.hash.slice(1));
  if(target?.tagName==="DETAILS")target.open=true;
}
revealDestination();addEventListener("hashchange",revealDestination);
const cookie=get("#cookie");
get("#cookie-close").hidden=false;get("#cookie-open").hidden=false;
get("#cookie-close").addEventListener("click",()=>{cookie.hidden=true;get("#cookie-open").focus();});
get("#cookie-open").addEventListener("click",()=>{cookie.hidden=false;get("#cookie-close").focus();});
