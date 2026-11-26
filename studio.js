const studio = document.querySelector("#instrument");
const stage = document.querySelector(".radio-stage");
const viewer = document.querySelector("#radio-model");
const loader = studio.querySelector(".studio-loading");
const marker = document.querySelector("#part-marker");
const rotation = document.querySelector("#rotation-toggle");
const burst = document.querySelector("#burst-toggle");
const card = document.querySelector("#part-card");
const picker = document.querySelector("#part-picker");
const hint = document.querySelector("#orbit-hint");
const zoomControls = document.querySelector(".zoom-controls");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const phone = matchMedia("(max-width: 700px)");
const offsets = new Map();
let wantsRotation = !motion.matches;
let inView = true;
let live = false;
let selected = null;
let anchor = [0, 0, 0];
let progress = 0;
let frame = 0;
let gesture = null;
let dragged = false;
let portKey = "tx1";

customElements.whenDefined("model-viewer").then(() => {
  // Keep small silkscreen text at native render resolution even while rotating.
  customElements.get("model-viewer").minimumRenderScale = 1;
});
for (const [key, part] of Object.entries(radioParts)) {
  picker.add(new Option(part.title, key));
}
function syncRotation() {
  const active = wantsRotation && !selected;
  viewer.toggleAttribute("auto-rotate", active && inView && !document.hidden);
  rotation.disabled = Boolean(selected);
  const action = selected ? "Rotation paused for inspection" : active ? "Pause rotation" : "Start rotation";
  rotation.setAttribute("aria-label", action);
  rotation.title = action;
  rotation.firstElementChild.textContent = active ? "Ⅱ" : "▶";
}
rotation.addEventListener("click", () => { wantsRotation = !wantsRotation; syncRotation(); });
motion.addEventListener("change", () => {
  wantsRotation = !motion.matches; syncRotation(); animateAssembly(selected ? 1 : 0);
});
new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncRotation(); }).observe(studio);
document.addEventListener("visibilitychange", syncRotation);
syncRotation();

function positionAt(key, point) {
  const shift = offsets.get(key) || [0, 0, 0];
  return point.map((n,i) => (n + shift[i] * progress) + "m").join(" ");
}
function setPose(value) {
  progress = value;
  if (!live) return;
  // Leave the final sample inside the clip so looping players cannot wrap it to zero.
  viewer.currentTime = Math.min(.99999, progress) * viewer.duration;
  if (selected) viewer.updateHotspot({name:"hotspot-selection", position:positionAt(selected,anchor)});
  viewer.updateHotspot({name:"hotspot-port",position:positionAt(portKey, radioParts[portKey].at.map(n=>n/1000))});
}
function animateAssembly(target) {
  cancelAnimationFrame(frame);
  const from = progress, start = performance.now();
  if (!live || motion.matches || from === target) { setPose(target); return; }
  function tick(now) {
    const t = Math.min((now - start) / 680, 1);
    setPose(from + (target - from) * t*t*(3-2*t));
    if (t < 1) frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
}
function frameModel() {
  if (!live) return;
  const {theta,phi} = viewer.getCameraOrbit();
  const radius = selected ? (phone.matches ? 95 : 84) : (phone.matches ? 65 : 62);
  viewer.cameraOrbit = theta+"rad "+phi+"rad "+radius+"%";
  viewer.cameraTarget = selected ? "0m .005m 0m" : "0m .001m .003m";
}
phone.addEventListener("change", frameModel);
function inspect(key, point) {
  const part = radioParts[key];
  if (!part) return;
  const opening = !selected;
  selected = key;
  anchor = point || part.at.map(n=>n/1000);
  picker.value = key;
  marker.textContent = part.title;
  marker.hidden = !live;
  document.querySelector("#part-group").textContent = part.group;
  document.querySelector("#part-description").textContent = part.description;
  const props = document.querySelector("#part-properties");
  props.replaceChildren(...part.properties.map(([name,value]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = name; dd.textContent = value; row.append(dt, dd); return row;
  }));
  const source = document.querySelector("#part-source");
  source.hidden = !part.source;
  if (part.source) source.href = part.source;
  card.hidden = false; stage.classList.add("inspecting");
  burst.setAttribute("aria-expanded","true"); burst.textContent = live ? "Reassemble" : "Close details";
  if (opening) { frameModel(); syncRotation(); }
  setPose(progress); animateAssembly(1);
}
function closeInspection() {
  if (!selected) return;
  selected = null; marker.hidden = true; card.hidden = true;
  stage.classList.remove("inspecting"); burst.setAttribute("aria-expanded","false");
  burst.textContent = live ? "Explode view" : "Inspect parts";
  frameModel(); animateAssembly(0); syncRotation(); burst.focus({preventScroll:true});
}
burst.addEventListener("click", () => {
  if (selected) closeInspection();
  else { inspect("radio"); picker.focus({preventScroll:true}); }
});
document.querySelector("#card-close").addEventListener("click", closeInspection);
picker.addEventListener("change", () => inspect(picker.value));
document.addEventListener("keydown", e => { if (e.key === "Escape" && selected) closeInspection(); });

viewer.addEventListener("pointerdown", e => {
  if (!e.isPrimary || e.button !== 0) {dragged = true; return;}
  gesture = {x:e.clientX,y:e.clientY}; dragged = false;
}, true);
viewer.addEventListener("pointermove", e => {
  if (gesture && Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>6) dragged = true;
}, true);
viewer.addEventListener("pointercancel", () => {dragged = true; gesture = null;}, true);
viewer.addEventListener("click", e => {
  if (!live || dragged || !gesture) return;
  gesture = null;
  const surface = viewer.surfaceFromPoint(e.clientX,e.clientY);
  if (!surface) return;
  const mesh = viewer.originalGltfJson.meshes[Number(surface.split(" ")[0])];
  const key = mesh.extras.component;
  const hit = viewer.positionAndNormalFromPoint(e.clientX,e.clientY);
  if (!hit) return;
  const pos = [hit.position.x,hit.position.y,hit.position.z];
  inspect(key,pos.map((v,i) => v-offsets.get(key)[i]*progress));
});
document.querySelector("#zoom-out").addEventListener("click", () => viewer.zoom(-2));
document.querySelector("#zoom-in").addEventListener("click", () => viewer.zoom(2));

const loadingTimer = setTimeout(() => { if (!live) loader.hidden = false; }, 950);
function ready() {
  if (live) return;
  live = true;
  clearTimeout(loadingTimer); loader.hidden = true; studio.classList.add("ready");
  for (const mesh of viewer.originalGltfJson.meshes) offsets.set(mesh.extras.component, mesh.extras.burstOffset);
  viewer.play({repetitions:1}); viewer.pause();
  rotation.hidden = false; zoomControls.hidden = false; marker.hidden = !selected;
  hint.textContent = "Drag to orbit · Tap a part";
  burst.textContent = selected ? "Reassemble" : "Explode view";
  frameModel(); setPose(selected ? 1 : 0); syncRotation();
}
function showPoster() {
  live = false; clearTimeout(loadingTimer); cancelAnimationFrame(frame);
  loader.hidden = true; studio.classList.remove("ready"); marker.hidden = true;
  rotation.hidden = true; zoomControls.hidden = true;
  burst.textContent = selected ? "Close details" : "Inspect parts"; hint.textContent = "Studio view";
}
viewer.addEventListener("load", ready); viewer.addEventListener("error", showPoster);
if (viewer.loaded) ready();
window.addEventListener("load", () => { if (!customElements.get("model-viewer")) showPoster(); });
for (const button of document.querySelectorAll("[data-mode]")) {
  button.addEventListener("click", () => {
    const tx = button.dataset.mode === "tx";
    document.querySelectorAll("[data-mode]").forEach(other =>
      other.setAttribute("aria-pressed", String(other === button)));
    document.querySelector("#signal-path").textContent = tx ? "Baseband → RF → Antenna" : "Antenna → RF → Baseband";
    portKey = tx ? "tx1" : "rx1";
    viewer.querySelector(".port-tag").textContent = portKey.toUpperCase();
    if (selected) inspect(portKey);
    else setPose(progress);
  });
}
