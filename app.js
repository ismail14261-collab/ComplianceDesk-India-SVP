(() => {
  "use strict";
  const STORE_KEY = "complianceDeskIndia.v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const today = new Date();
  const isoToday = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const addDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const uid = () => (crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const seed = {
    entities: [],
    tasks: [
      {id:"sample-1",title:"Review annual ROC filing requirements",entity:"",dueDate:addDays(8),category:"Companies Act / MCA",priority:"High",status:"Open",verification:"Illustrative only",notes:"Illustrative task only. Confirm financial year, applicable forms, statutory timelines, any extensions and current MCA instructions before using."},
      {id:"sample-2",title:"Prepare board meeting action checklist",entity:"",dueDate:addDays(14),category:"Companies Act / MCA",priority:"Medium",status:"In progress",verification:"Not verified",notes:"Check the Act, applicable rules, articles, Secretarial Standards and company-specific facts."},
      {id:"sample-3",title:"Review LLP agreement and event-based filings",entity:"",dueDate:addDays(21),category:"LLP Act / MCA",priority:"Medium",status:"Open",verification:"Illustrative only",notes:"Illustrative task only. Determine whether an event occurred and verify the applicable filing deadline from current rules."},
      {id:"sample-4",title:"Collect pending client documents",entity:"",dueDate:addDays(-3),category:"Internal / other",priority:"Low",status:"Open",verification:"Not verified",notes:"Internal follow-up date, not a statutory deadline."}
    ]
  };
  let state = loadState();
  let activeView = "overview";
  let toastTimer;

  function loadState() {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.entities) && Array.isArray(parsed.tasks)) return parsed;
      }
    } catch (error) { console.warn("Local workspace data could not be read.", error); }
    return structuredClone(seed);
  }
  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      showToast("Could not save to this browser. Export your work and check browser storage settings.");
      return false;
    }
  }
  function showToast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
  }
  function formatDate(dateString, options = {day:"numeric",month:"short",year:"numeric"}) {
    if (!dateString) return "Not set";
    const d = new Date(dateString + "T12:00:00");
    return Number.isNaN(d.getTime()) ? "Invalid date" : new Intl.DateTimeFormat("en-IN", options).format(d);
  }
  function dateDiff(dateString) {
    if (!dateString) return null;
    return Math.round((new Date(dateString + "T00:00:00") - new Date(isoToday() + "T00:00:00")) / 86400000);
  }
  function isCompleted(task) { return task.status === "Completed"; }
  function isOverdue(task) { const diff = dateDiff(task.dueDate); return !isCompleted(task) && diff !== null && diff < 0; }
  function entityName(id) { return state.entities.find(e => e.id === id)?.name || (id ? "Unknown entity" : "General / unassigned"); }
  function statusClass(status) { return status === "Completed" ? "completed" : status === "In progress" ? "progress" : status === "Under review" ? "review" : "open"; }
  function taskSort(a,b) {
    const da = a.dueDate || "9999-12-31", db = b.dueDate || "9999-12-31";
    return da.localeCompare(db) || (a.title || "").localeCompare(b.title || "");
  }
  function renderMetrics() {
    const open = state.tasks.filter(t => !isCompleted(t));
    $("#metricEntities").textContent = state.entities.length;
    $("#metricOpen").textContent = open.length;
    $("#metricDue").textContent = open.filter(t => { const d = dateDiff(t.dueDate); return d !== null && d >= 0 && d <= 30; }).length;
    $("#metricOverdue").textContent = open.filter(isOverdue).length;
    $("#entityNavCount").textContent = state.entities.length;
  }
  function renderTasks() {
    const query = ($("#taskSearch")?.value || "").trim().toLowerCase();
    const status = $("#statusFilter")?.value || "all";
    const tasks = [...state.tasks].filter(t => {
      const searchable = [t.title,t.category,t.notes,entityName(t.entity),t.verification].join(" ").toLowerCase();
      return (!query || searchable.includes(query)) && (status === "all" || t.status === status);
    }).sort(taskSort);
    const tbody = $("#taskRows");
    tbody.innerHTML = tasks.slice(0, activeView === "overview" ? 7 : 1000).map(t => {
      const diff = dateDiff(t.dueDate);
      const dateClass = isOverdue(t) ? "date-cell overdue" : "date-cell";
      return '<tr><td><div class="task-title">'+escapeHtml(t.title)+'</div><div class="task-subtitle">'+escapeHtml(t.category)+' · '+escapeHtml(t.verification || "Not verified")+'</div></td>'+
        '<td><div class="entity-cell">'+escapeHtml(entityName(t.entity))+'</div></td>'+
        '<td><span class="'+dateClass+'">'+escapeHtml(formatDate(t.dueDate,{day:"numeric",month:"short",year:"2-digit"}))+'</span></td>'+
        '<td><select class="inline-status pill '+statusClass(t.status)+'" data-status-id="'+escapeHtml(t.id)+'" aria-label="Change status for '+escapeHtml(t.title)+'">'+["Open","In progress","Under review","Completed"].map(s=>'<option'+(s===t.status?' selected':'')+'>'+s+'</option>').join("")+'</select></td>'+
        '<td><span class="priority '+escapeHtml((t.priority||"Medium").toLowerCase())+'">'+escapeHtml(t.priority||"Medium")+'</span></td>'+
        '<td><button class="row-menu" data-edit-task="'+escapeHtml(t.id)+'" aria-label="Edit '+escapeHtml(t.title)+'">•••</button></td></tr>';
    }).join("");
    $("#taskEmpty").hidden = tasks.length !== 0;
    $("#taskCountLabel").textContent = tasks.length + (tasks.length === 1 ? " task" : " tasks") + (activeView === "overview" && tasks.length > 7 ? " · showing 7" : "");
  }
  function renderUpcoming() {
    const tasks = state.tasks.filter(t => !isCompleted(t) && t.dueDate && dateDiff(t.dueDate) !== null).sort(taskSort).slice(0,5);
    const list = $("#upcomingList");
    if (!tasks.length) {
      list.innerHTML = '<div class="empty-state"><span>✓</span><strong>No upcoming dates</strong><p>Add due dates to your compliance tasks.</p></div>';
      return;
    }
    list.innerHTML = tasks.map(t => {
      const diff = dateDiff(t.dueDate);
      const day = formatDate(t.dueDate,{day:"2-digit"});
      const month = formatDate(t.dueDate,{month:"short"}).toUpperCase();
      const label = diff < 0 ? Math.abs(diff)+"d overdue" : diff === 0 ? "Due today" : diff === 1 ? "Tomorrow" : "In "+diff+" days";
      return '<div class="upcoming-item"><div class="date-tile"><strong>'+escapeHtml(day)+'</strong><small>'+escapeHtml(month)+'</small></div><div class="upcoming-copy"><strong>'+escapeHtml(t.title)+'</strong><small>'+escapeHtml(entityName(t.entity))+'</small></div><span class="due-tag">'+escapeHtml(label)+'</span></div>';
    }).join("");
  }
  function renderEntityOptions() {
    const select = $("#taskEntitySelect");
    const old = select.value;
    select.innerHTML = '<option value="">General / unassigned</option>'+state.entities.map(e=>'<option value="'+escapeHtml(e.id)+'">'+escapeHtml(e.name)+'</option>').join("");
    if (state.entities.some(e=>e.id===old)) select.value=old;
  }
  function renderEntities() {
    const root = $("#viewContent");
    if (!root) return;
    root.innerHTML = '<div class="view-heading"><h2>Entity register</h2><p class="page-subtitle">Maintain a working list of companies and LLPs.</p></div><div class="welcome-actions" style="margin-bottom:16px"><button class="button button-primary" id="addEntityView">＋ Add entity</button></div>';
    if (!state.entities.length) {
      root.innerHTML += '<div class="panel empty-state" style="padding:42px 20px"><span>▤</span><strong>No entities added yet</strong><p>Add a company or LLP to organise your compliance tasks.</p></div>';
    } else {
      root.innerHTML += '<div class="entity-card-grid">'+state.entities.map(e=>'<article class="entity-card"><span class="entity-type">'+escapeHtml(e.type)+'</span><h3>'+escapeHtml(e.name)+'</h3><p>'+(e.identifier?'CIN / LLPIN: '+escapeHtml(e.identifier):'Identifier not entered')+'</p><p>'+(e.state?'State: '+escapeHtml(e.state):'State not entered')+'</p><p>'+state.tasks.filter(t=>t.entity===e.id&&!isCompleted(t)).length+' open tasks</p><button class="text-button" data-remove-entity="'+escapeHtml(e.id)+'">Remove entity</button></article>').join("")+'</div>';
    }
    $("#addEntityView")?.addEventListener("click",()=>openDialog("entityDialog"));
  }
  function renderCalendar() {
    const root = $("#viewContent");
    if (!root) return;
    const tasks = state.tasks.filter(t=>t.dueDate).sort(taskSort);
    root.innerHTML = '<div class="view-heading"><h2>Due date view</h2><p class="page-subtitle">Dates below come from the task register. They are not independently verified statutory deadlines.</p></div>';
    if (!tasks.length) { root.innerHTML += '<div class="panel empty-state"><strong>No dated tasks</strong><p>Add a task with a due date.</p></div>'; return; }
    root.innerHTML += '<div class="calendar-list">'+tasks.map(t=>'<div class="calendar-row"><div class="date-tile"><strong>'+escapeHtml(formatDate(t.dueDate,{day:"2-digit"}))+'</strong><small>'+escapeHtml(formatDate(t.dueDate,{month:"short"}).toUpperCase())+'</small></div><div class="calendar-row-copy"><strong>'+escapeHtml(t.title)+'</strong><p>'+escapeHtml(entityName(t.entity))+' · '+escapeHtml(t.category)+' · '+escapeHtml(formatDate(t.dueDate))+'</p></div><span class="pill '+statusClass(t.status)+'">'+escapeHtml(t.status)+'</span></div>').join("")+'</div>';
  }
  function renderLegal() {
    const root = $("#viewContent");
    if (!root) return;
    root.innerHTML = '<div class="view-heading"><h2>Legal library & official sources</h2><p class="page-subtitle">Use primary sources. Always check amendments, commencement, rules and applicability.</p></div><div class="legal-grid">'+[
      ["Ministry of Corporate Affairs (MCA)","Company and LLP filings, MCA services, circulars, notifications and forms.","https://www.mca.gov.in/","Open MCA portal ↗"],
      ["India Code","Official central legislation repository. Check the current Act text and amendments.","https://www.indiacode.nic.in/","Search legislation ↗"],
      ["e-Gazette of India","Official Gazette notifications, rules, commencement notifications and amendments.","https://egazette.gov.in/","Open e-Gazette ↗"],
      ["GST Portal","GST registration, returns, notices and taxpayer services.","https://www.gst.gov.in/","Open GST portal ↗"],
      ["Income Tax Department","Income-tax legislation, rules, notifications, circulars and e-filing services.","https://www.incometax.gov.in/","Open tax portal ↗"],
      ["Ministry of Labour & Employment","Central labour-law resources and official ministry updates; state-level requirements may also apply.","https://labour.gov.in/","Open ministry site ↗"],
      ["SEBI","Regulations and circulars for listed entities and regulated market participants, where applicable.","https://www.sebi.gov.in/","Open SEBI ↗"],
      ["Reserve Bank of India","Directions and regulatory materials relevant to RBI-regulated entities and applicable FEMA matters.","https://www.rbi.org.in/","Open RBI ↗"]
    ].map(x=>'<article class="legal-card"><h3>'+escapeHtml(x[0])+'</h3><p>'+escapeHtml(x[1])+'</p><a href="'+escapeHtml(x[2])+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(x[3])+'</a></article>').join("")+'</div><p class="form-hint">A link to an official portal does not itself verify a specific compliance deadline. Record the exact provision, effective date, source version and reviewer for each production rule.</p>';
  }
  function renderDocuments() {
    const root = $("#viewContent");
    if (!root) return;
    root.innerHTML = '<div class="view-heading"><h2>Document centre</h2><p class="page-subtitle">A starting point for structured drafting and document control.</p></div><div class="legal-grid">'+[
      ["Board meeting pack","Notice, agenda, attendance sheet, minutes and action tracker.","Planned module"],
      ["Annual compliance pack","Entity-specific checklist, approvals, filing tracker and supporting-document list.","Planned module"],
      ["Director / partner changes","Appointment, resignation, consent, declarations and event-based filing checklist.","Planned module"],
      ["LLP agreement workflow","Initial agreement, supplementary agreement, amendments and partner-change documentation.","Planned module"],
      ["Statutory registers","Structured register templates and change history.","Planned module"],
      ["Filing evidence vault","Acknowledgements, challans, filed forms and source documents with access controls.","Planned module"]
    ].map(x=>'<article class="legal-card"><h3>'+escapeHtml(x[0])+'</h3><p>'+escapeHtml(x[1])+'</p><span class="pill review">'+escapeHtml(x[2])+'</span></article>').join("")+'</div><div class="notice" style="margin-top:16px"><span class="notice-icon">i</span><div><strong>Drafting safeguards</strong><p>Generated legal documents should be reviewed against current law, the entity's constitutional documents and actual facts before signature or filing.</p></div></div>';
  }
  function renderSettings() {
    const root = $("#viewContent");
    if (!root) return;
    root.innerHTML = '<div class="view-heading"><h2>Settings & workspace data</h2><p class="page-subtitle">Manage your local prototype data.</p></div><section class="settings-copy"><h3>Browser storage</h3><p>This prototype saves its entities and tasks in localStorage on this browser profile. It is not a secure multi-user database and does not synchronise across devices. Clearing browser data may delete this workspace.</p><div class="settings-actions"><button class="button button-secondary" id="exportJson">Export backup (JSON)</button><button class="button button-secondary" id="importJson">Import backup (JSON)</button><input type="file" id="importFile" accept="application/json,.json" hidden><button class="button button-secondary" id="resetDemo">Reset demo data</button></div><h3 style="margin-top:24px">Production readiness checklist</h3><ul><li>Authentication and role-based access control</li><li>Server-side database, encryption and backups</li><li>Audit trail for changes and document versions</li><li>Privacy notice, retention rules and incident response</li><li>Reviewed and versioned legal rules engine</li><li>Automated tests and deployment monitoring</li></ul><p><strong>Security:</strong> Do not store passwords, DSC PINs, Aadhaar/PAN scans, bank information or confidential client records in this prototype.</p></section>';
    $("#exportJson")?.addEventListener("click",exportBackup);
    $("#importJson")?.addEventListener("click",()=>$("#importFile").click());
    $("#importFile")?.addEventListener("change",importBackup);
    $("#resetDemo")?.addEventListener("click",()=>{
      if(!confirm("Replace the current local workspace with the original demo tasks? Export a backup first if needed."))return;
      state=structuredClone(seed);saveState();refresh();showToast("Demo data restored in this browser.");
    });
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
    downloadBlob(blob,"compliance-desk-backup-"+isoToday()+".json");
    showToast("Workspace backup exported.");
  }
  function importBackup(event) {
    const file=event.target.files?.[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(String(reader.result));
        if(!parsed||!Array.isArray(parsed.entities)||!Array.isArray(parsed.tasks))throw new Error("Invalid backup structure");
        if(!confirm("Import will replace the current workspace data. Continue?"))return;
        state={entities:parsed.entities,tasks:parsed.tasks};saveState();refresh();showToast("Workspace backup imported.");
      }catch(error){showToast("Could not import this file. Choose a valid ComplianceDesk JSON backup.");}
      finally{event.target.value="";}
    };
    reader.readAsText(file);
  }
  function downloadBlob(blob,filename) {
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  function exportCsv() {
    const header=["Task","Entity","Due date","Category","Priority","Status","Legal verification","Notes"];
    const rows=state.tasks.map(t=>[t.title,entityName(t.entity),t.dueDate||"",t.category,t.priority,t.status,t.verification,t.notes||""]);
    const csv=[header,...rows].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
    downloadBlob(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}),"compliance-desk-tasks-"+isoToday()+".csv");
    showToast("Task register exported to CSV.");
  }
  function openDialog(id) {
    const dialog=$("#"+id);
    if(id==="taskDialog") {
      renderEntityOptions();
      const form=$("#taskForm");form.reset();form.elements.status.value="Open";form.elements.priority.value="Medium";form.elements.verification.value="Not verified";
    }
    if(id==="entityDialog") $("#entityForm").reset();
    dialog.showModal();
  }
  function closeDialog(id) { $("#"+id).close(); }
  function refresh() {
    saveState();renderMetrics();renderTasks();renderUpcoming();renderEntityOptions();
    if(activeView==="entities")renderEntities();
    if(activeView==="calendar")renderCalendar();
    if(activeView==="legal")renderLegal();
    if(activeView==="documents")renderDocuments();
    if(activeView==="settings")renderSettings();
  }
  const viewMeta={
    overview:["Overview","Good to see you.","A clear view of your entities, obligations and upcoming work."],
    entities:["Entities","Entity register","Keep company and LLP master details organised."],
    compliance:["Compliance tracker","Compliance tracker","Track tasks, review status and due dates."],
    calendar:["Due dates","Due date view","See dated tasks in chronological order."],
    documents:["Document centre","Document centre","Organise statutory drafting and supporting evidence."],
    legal:["Legal library","Legal library","Start with primary legislation and official regulatory sources."],
    settings:["Settings & data","Workspace settings","Manage prototype data and review production readiness."]
  };
  function navigate(view) {
    activeView=view;
    const meta=viewMeta[view]||viewMeta.overview;
    $("#breadcrumbCurrent").textContent=meta[0];$("#pageTitle").textContent=meta[1];$("#pageSubtitle").textContent=meta[2];
    $$(".nav-item[data-view]").forEach(btn=>btn.classList.toggle("active",btn.dataset.view===view));
    const overview= view==="overview";
    $("#overviewMetrics")?.remove();
    $(".notice").hidden=!overview;
    $(".metrics").hidden=!overview;
    $(".content-grid").hidden=!overview;
    $("#viewContent")?.remove();
    if(!overview){
      const root=document.createElement("section");root.id="viewContent";root.className="view-content";
      $(".page-content").insertBefore(root,$(".footer"));
      if(view==="entities")renderEntities();
      else if(view==="calendar")renderCalendar();
      else if(view==="legal")renderLegal();
      else if(view==="documents")renderDocuments();
      else if(view==="settings")renderSettings();
      else if(view==="compliance") {
        root.innerHTML='<section class="panel task-panel"><div class="panel-heading"><div><h2>All compliance tasks</h2><p>Change a task status directly in the table, or open the row menu to edit.</p></div><button class="button button-primary" id="addTaskView">＋ Add task</button></div><div class="toolbar"><label class="search-box"><span>⌕</span><input id="taskSearchView" type="search" placeholder="Search tasks or entities…"></label><select id="statusFilterView" aria-label="Filter by status"><option value="all">All statuses</option><option>Open</option><option>In progress</option><option>Under review</option><option>Completed</option></select></div><div class="table-wrap"><table><thead><tr><th>COMPLIANCE ITEM</th><th>ENTITY</th><th>DUE DATE</th><th>STATUS</th><th>PRIORITY</th><th></th></tr></thead><tbody id="allTaskRows"></tbody></table><div class="empty-state" id="allTaskEmpty" hidden><strong>No tasks found</strong></div></div></section>';
        renderAllTasks();
        $("#addTaskView")?.addEventListener("click",()=>openDialog("taskDialog"));
        $("#taskSearchView")?.addEventListener("input",renderAllTasks);
        $("#statusFilterView")?.addEventListener("change",renderAllTasks);
      }
    }
    $("#sidebar").classList.remove("open");
  }
  function renderAllTasks() {
    const root=$("#allTaskRows");if(!root)return;
    const q=($("#taskSearchView")?.value||"").trim().toLowerCase();const s=$("#statusFilterView")?.value||"all";
    const tasks=[...state.tasks].filter(t=>(!q||[t.title,t.category,t.notes,entityName(t.entity)].join(" ").toLowerCase().includes(q))&&(s==="all"||t.status===s)).sort(taskSort);
    root.innerHTML=tasks.map(t=>'<tr><td><div class="task-title">'+escapeHtml(t.title)+'</div><div class="task-subtitle">'+escapeHtml(t.category)+' · '+escapeHtml(t.verification)+'</div></td><td><div class="entity-cell">'+escapeHtml(entityName(t.entity))+'</div></td><td><span class="'+(isOverdue(t)?"date-cell overdue":"date-cell")+'">'+escapeHtml(formatDate(t.dueDate,{day:"numeric",month:"short",year:"2-digit"}))+'</span></td><td><select class="inline-status pill '+statusClass(t.status)+'" data-status-id="'+escapeHtml(t.id)+'" aria-label="Change status">'+["Open","In progress","Under review","Completed"].map(v=>'<option'+(v===t.status?" selected":"")+'>'+v+'</option>').join("")+'</select></td><td><span class="priority '+escapeHtml(t.priority.toLowerCase())+'">'+escapeHtml(t.priority)+'</span></td><td><button class="row-menu" data-edit-task="'+escapeHtml(t.id)+'" aria-label="Edit task">•••</button></td></tr>').join("");
    $("#allTaskEmpty").hidden=tasks.length>0;
  }
  function editTask(id) {
    const task=state.tasks.find(t=>t.id===id);if(!task)return;
    const form=$("#taskForm");renderEntityOptions();
    for(const key of ["title","entity","dueDate","category","priority","status","verification","notes"]) if(form.elements[key])form.elements[key].value=task[key]??"";
    form.dataset.editId=id;
    $(".modal-header h2",$("#taskDialog")).textContent="Edit compliance task";
    $("#taskDialog").showModal();
  }

  $("#taskForm").addEventListener("submit",event=>{
    event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
    const fd=new FormData(form);const oldId=form.dataset.editId;
    const task={id:oldId||uid(),title:String(fd.get("title")).trim(),entity:String(fd.get("entity")||""),dueDate:String(fd.get("dueDate")||""),category:String(fd.get("category")),priority:String(fd.get("priority")),status:String(fd.get("status")),verification:String(fd.get("verification")),notes:String(fd.get("notes")||"").trim()};
    if(oldId){state.tasks=state.tasks.map(t=>t.id===oldId?task:t);delete form.dataset.editId;}else state.tasks.push(task);
    closeDialog("taskDialog");$(".modal-header h2",$("#taskDialog")).textContent="Add compliance task";refresh();if(activeView==="compliance")renderAllTasks();showToast(oldId?"Task updated.":"Task added.");
  });
  $("#entityForm").addEventListener("submit",event=>{
    event.preventDefault();const fd=new FormData(event.currentTarget);
    state.entities.push({id:uid(),name:String(fd.get("name")).trim(),type:String(fd.get("type")),identifier:String(fd.get("identifier")||"").trim(),fyEnd:String(fd.get("fyEnd")||""),state:String(fd.get("state")||"").trim()});
    closeDialog("entityDialog");refresh();if(activeView==="entities")renderEntities();showToast("Entity added to this browser workspace.");
  });
  document.addEventListener("click",event=>{
    const nav=event.target.closest("[data-view]");if(nav){navigate(nav.dataset.view);return;}
    const goto=event.target.closest("[data-goto]");if(goto){navigate(goto.dataset.goto);return;}
    const close=event.target.closest("[data-close]");if(close){closeDialog(close.dataset.close);return;}
    const edit=event.target.closest("[data-edit-task]");if(edit){editTask(edit.dataset.editTask);return;}
    const remove=event.target.closest("[data-remove-entity]");if(remove){
      const id=remove.dataset.removeEntity;
      if(!confirm("Remove this entity? Its tasks will remain but become unassigned to a known entity."))return;
      state.entities=state.entities.filter(e=>e.id!==id);state.tasks=state.tasks.map(t=>t.entity===id?{...t,entity:""}:t);refresh();if(activeView==="entities")renderEntities();showToast("Entity removed; related tasks retained.");return;
    }
    if(event.target.id==="quickAdd"||event.target.id==="quickAddTop"||event.target.id==="shortcutTask"){openDialog("taskDialog");return;}
    if(event.target.id==="shortcutEntity"){openDialog("entityDialog");return;}
    if(event.target.id==="exportButton"){exportCsv();return;}
    if(event.target.id==="helpButton"){showToast("Use official legal sources and independently verify all statutory dates before relying on them.");return;}
    if(event.target.id==="mobileMenu")$("#sidebar").classList.toggle("open");
  });
  document.addEventListener("change",event=>{
    const el=event.target;
    if(el.matches("[data-status-id]")){
      const task=state.tasks.find(t=>t.id===el.dataset.statusId);if(task){task.status=el.value;saveState();renderMetrics();renderTasks();renderUpcoming();if(activeView==="compliance")renderAllTasks();showToast("Task status updated.");}
    }
  });
  $("#taskSearch").addEventListener("input",renderTasks);
  $("#statusFilter").addEventListener("change",renderTasks);
  $("#exportButton").addEventListener("click",exportCsv);
  $("#todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(today);
  $("#yearLabel").textContent=today.getFullYear();
  refresh();
})();