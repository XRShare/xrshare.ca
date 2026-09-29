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

  // Simulated two-person SharePlay session.
  // Model transform, pins and notes are shared state; each viewer's camera stays personal.
  const session = document.querySelector(".session");
  if (session) {
    const peers = {
      a: { name: "Maya", device: "iPhone", color: "#c8372a", el: session.querySelector('[data-peer="a"]') },
      b: { name: "Sam", device: "Vision Pro", color: "#2f6fd6", el: session.querySelector('[data-peer="b"]') },
    };
    Object.values(peers).forEach((p) => { p.view = p.el.querySelector("model-viewer"); });

    const state = { model: "skin", yaw: 0, scale: 1, pins: [] };
    const feed = document.getElementById("feed");
    const modelSelect = document.getElementById("demo-model");
    const t0 = Date.now();
    const LATENCY = 160;

    const stamp = () => {
      const sec = Math.floor((Date.now() - t0) / 1000);
      return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    };

    const log = (peer, text, msg) => {
      const li = document.createElement("li");
      const time = document.createElement("time");
      time.textContent = stamp();
      const who = document.createElement("b");
      who.style.setProperty("--c", peer.color);
      who.textContent = peer.name;
      const body = document.createElement("span");
      body.append(who, ` ${text} `);
      if (msg) {
        const m = document.createElement("span");
        m.className = "msg";
        m.textContent = `→ ${msg}`;
        body.append(m);
      }
      li.append(time, body);
      feed.append(li);
      feed.scrollTop = feed.scrollHeight;
    };

    const other = (key) => (key === "a" ? peers.b : peers.a);

    const renderTransform = (peer) => {
      peer.view.orientation = `0deg 0deg ${state.yaw}deg`;
      peer.view.scale = `${state.scale} ${state.scale} ${state.scale}`;
    };

    const renderPins = (peer) => {
      peer.view.querySelectorAll(".pin").forEach((n) => n.remove());
      state.pins.forEach((pin, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "pin";
        b.slot = `hotspot-${pin.id}`;
        b.dataset.surface = pin.surface;
        b.style.setProperty("--c", pin.color);
        b.setAttribute("aria-label", `Pin ${i + 1} by ${pin.author}${pin.note ? `: ${pin.note}` : ""}`);
        const n = document.createElement("span");
        n.textContent = String(i + 1);
        b.append(n);
        if (pin.note) {
          const note = document.createElement("span");
          note.className = "pin-note";
          note.textContent = pin.note;
          b.append(note);
        }
        peer.view.append(b);
      });
    };

    const renderModel = (peer) => {
      peer.view.src = `/assets/models/${state.model}.glb`;
      renderPins(peer);
    };

    // Apply locally right away, then on the other device after simulated network latency.
    const broadcast = (key, render) => {
      render(peers[key]);
      const remote = other(key);
      setTimeout(() => {
        render(remote);
        remote.el.classList.add("synced");
        setTimeout(() => remote.el.classList.remove("synced"), 450);
      }, LATENCY);
    };

    const renderAll = (peer) => { renderTransform(peer); renderPins(peer); };

    Object.entries(peers).forEach(([key, peer]) => {
      const pinBtn = peer.el.querySelector('[data-act="pin"]');

      peer.el.querySelectorAll('[data-act="rot"], [data-act="scale"]').forEach((btn) => {
        btn.addEventListener("click", () => {
          const v = Number(btn.dataset.v);
          if (btn.dataset.act === "rot") {
            state.yaw = (state.yaw + v + 360) % 360;
            log(peer, `rotated the model to ${state.yaw}°`, `${other(key).name}`);
          } else {
            state.scale = Math.min(2, Math.max(0.4, Math.round((state.scale + v) * 100) / 100));
            log(peer, `scaled the model to ${state.scale.toFixed(2)}×`, `${other(key).name}`);
          }
          broadcast(key, renderTransform);
        });
      });

      pinBtn.addEventListener("click", () => {
        const on = pinBtn.getAttribute("aria-pressed") !== "true";
        pinBtn.setAttribute("aria-pressed", String(on));
        peer.el.classList.toggle("pinning", on);
      });

      peer.view.addEventListener("click", (e) => {
        if (pinBtn.getAttribute("aria-pressed") !== "true") return;
        const surface = peer.view.surfaceFromPoint(e.clientX, e.clientY);
        if (!surface) return;
        state.pins.push({ id: `${Date.now()}`, surface, color: peer.color, author: peer.name, note: "" });
        pinBtn.setAttribute("aria-pressed", "false");
        peer.el.classList.remove("pinning");
        log(peer, `dropped pin ${state.pins.length}`, `${other(key).name}`);
        broadcast(key, renderPins);
      });

      peer.el.querySelector(".note-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector("input");
        const text = input.value.trim();
        if (!text) return;
        input.value = "";
        const mine = [...state.pins].reverse().find((p) => p.author === peer.name && !p.note);
        if (mine) {
          mine.note = text;
          log(peer, `noted pin ${state.pins.indexOf(mine) + 1}: “${text}”`, `${other(key).name}`);
          broadcast(key, renderPins);
        } else {
          log(peer, `said: “${text}”`, `${other(key).name}`);
        }
      });
    });

    modelSelect.addEventListener("change", () => {
      state.model = modelSelect.value;
      state.pins = [];
      const label = modelSelect.options[modelSelect.selectedIndex].text;
      log(peers.a, `placed ${label}`, "everyone");
      broadcast("a", renderModel);
    });

    Object.values(peers).forEach(renderAll);
    log(peers.a, "started a SharePlay session");
    setTimeout(() => log(peers.b, "joined from Apple Vision Pro", "received the scene"), 600);
    setTimeout(() => log(peers.a, "placed Skin cross-section", "everyone"), 1100);
  }

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
