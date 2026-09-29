// xrshare.ca: specimen plate, scroll-linked phone, Vision Pro stage, header CTA, document TOC.

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- specimen plate ----------
  const specimens = {
    skin: {
      name: "Skin cross-section",
      alt: "Interactive 3D cross-section of human skin",
      desc: "Epidermis, dermis and the fat beneath, with a hair follicle, sweat gland and nerve endings in place.",
      orbit: "35deg 72deg 135%",
      tags: true,
    },
    neuron: {
      name: "Neuron",
      alt: "Interactive 3D model of a neuron",
      desc: "One nerve cell: branching dendrites, the cell body, and an axon wrapped in myelin.",
      orbit: "20deg 80deg 68%",
      tags: false,
    },
    cell: {
      name: "Eukaryotic cell",
      alt: "Interactive 3D cutaway of a eukaryotic cell",
      desc: "A cutaway through the membrane to the nucleus, mitochondria, Golgi stacks and ribosomes.",
      orbit: "25deg 70deg 215%",
      tags: false,
    },
  };
  const order = Object.keys(specimens);

  const plate = document.getElementById("plate");
  const viewer = document.getElementById("specimen");
  if (plate && viewer) {
    const arBtn = document.getElementById("ar-btn");
    const figNum = document.getElementById("fig-num");
    const figName = document.getElementById("fig-name");
    const figDesc = document.getElementById("fig-desc");

    document.querySelectorAll(".specimens button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.model;
        const s = specimens[key];
        if (!s || btn.getAttribute("aria-pressed") === "true") return;
        document.querySelectorAll(".specimens button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        plate.classList.toggle("show-tags", s.tags);
        viewer.removeAttribute("poster");
        viewer.cameraOrbit = s.orbit;
        viewer.src = `/assets/models/${key}.glb`;
        viewer.setAttribute("ios-src", `/assets/models/${key}.usdz`);
        viewer.alt = s.alt;
        figNum.textContent = String(order.indexOf(key) + 1);
        figName.textContent = s.name;
        figDesc.textContent = s.desc;
      });
    });

    viewer.addEventListener("load", () => {
      viewer.jumpCameraToGoal();
      if (viewer.canActivateAR) arBtn.hidden = false;
    });
    arBtn.addEventListener("click", () => viewer.activateAR());
  }

  // ---------- header: show "Get the app" once the hero badge scrolls away ----------
  const head = document.querySelector(".site-head");
  const heroCta = document.querySelector(".hero .cta");
  if (head && heroCta && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      head.classList.toggle("scrolled", !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe(heroCta);
  } else if (head) {
    head.classList.add("always");
  }

  // ---------- how it works: swap the sticky phone screen as each step comes into view ----------
  const walk = document.getElementById("walk");
  if (walk && "IntersectionObserver" in window) {
    const steps = [...walk.querySelectorAll("li")];
    const screens = [...walk.querySelectorAll(".phone-screen img")];
    walk.classList.add("js");
    const activate = (i) => {
      steps.forEach((s, j) => s.classList.toggle("active", i === j));
      screens.forEach((img, j) => img.classList.toggle("on", i === j));
    };
    activate(0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activate(Number(e.target.dataset.screen)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => io.observe(s));
  }

  // ---------- Vision Pro stage ----------
  const stageImg = document.getElementById("stage-img");
  document.querySelectorAll(".vision-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!stageImg || btn.getAttribute("aria-pressed") === "true") return;
      document.querySelectorAll(".vision-tabs button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const next = new Image();
      next.src = `/assets/img/vision/${btn.dataset.src}.webp`;
      const swap = () => {
        stageImg.src = next.src;
        stageImg.alt = btn.dataset.alt;
        stageImg.classList.remove("fading");
      };
      if (reduceMotion) { next.decode().catch(() => {}).then(swap); return; }
      stageImg.classList.add("fading");
      Promise.all([next.decode().catch(() => {}), new Promise((r) => setTimeout(r, 200))]).then(swap);
    });
  });

  // ---------- document pages: TOC open on wide screens, highlight the current section ----------
  const toc = document.querySelector(".toc");
  if (toc) {
    const wide = window.matchMedia("(min-width: 861px)");
    const sync = () => { toc.open = wide.matches; };
    sync();
    wide.addEventListener("change", sync);

    const links = [...toc.querySelectorAll("a[href^='#']")];
    const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
    if ("IntersectionObserver" in window && targets.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${e.target.id}`)));
        });
      }, { rootMargin: "0px 0px -70% 0px" });
      targets.forEach((t) => io.observe(t));
    }
    // Close the TOC after choosing a section on small screens.
    links.forEach((a) => a.addEventListener("click", () => { if (!wide.matches) toc.open = false; }));
  }

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
