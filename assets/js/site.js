// XRShare site interactions: specimen switcher, AR button, screenshot strip, Vision Pro stage.

(() => {
  const specimens = {
    skin: {
      name: "Skin cross-section",
      alt: "3D cross-section model of human skin",
      desc: "Layered skin cross-section revealing epidermis, dermis, subcutaneous fat, hair follicle, sebaceous gland, and embedded sensory nerve endings.",
    },
    neuron: {
      name: "Neuron",
      alt: "3D model of a neuron",
      desc: "Single neuron model featuring branching dendrites, an axon wrapped in orange myelin segments, and translucent receptor clusters around the soma.",
    },
    cell: {
      name: "Eukaryotic cell",
      alt: "3D cutaway model of a eukaryotic cell",
      desc: "Cutaway of a eukaryotic cell: a translucent membrane surrounds the nucleus, mitochondria, Golgi stacks, and countless ribosomes floating in cytosol.",
    },
  };
  const order = Object.keys(specimens);

  const viewer = document.getElementById("specimen");
  const arBtn = document.getElementById("ar-btn");
  const figNum = document.getElementById("fig-num");
  const figName = document.getElementById("fig-name");
  const figDesc = document.getElementById("fig-desc");

  if (viewer) {
    document.querySelectorAll(".specimens button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.model;
        const s = specimens[key];
        if (!s) return;
        document.querySelectorAll(".specimens button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        viewer.src = `/assets/models/${key}.glb`;
        viewer.setAttribute("ios-src", `/assets/models/${key}.usdz`);
        viewer.alt = s.alt;
        figNum.textContent = String(order.indexOf(key) + 1).padStart(2, "0");
        figName.textContent = s.name;
        figDesc.textContent = s.desc;
      });
    });

    // Show "View in your room" only on devices that can actually do AR.
    viewer.addEventListener("load", () => {
      if (viewer.canActivateAR) arBtn.hidden = false;
    });
    arBtn.addEventListener("click", () => viewer.activateAR());
  }

  // Screenshot strip arrows
  const strip = document.getElementById("strip");
  document.querySelectorAll(".strip-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!strip) return;
      const step = strip.querySelector("figure")?.getBoundingClientRect().width || 240;
      strip.scrollBy({ left: Number(btn.dataset.dir) * (step + 16) * 2, behavior: "smooth" });
    });
  });

  // Vision Pro stage
  const stageImg = document.getElementById("stage-img");
  const stageCap = document.getElementById("stage-cap");
  document.querySelectorAll(".stage-list button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".stage-list button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      stageImg.src = `/assets/img/vision/${btn.dataset.src}.webp`;
      stageImg.alt = btn.dataset.cap;
      stageCap.textContent = btn.dataset.cap;
    });
  });

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
