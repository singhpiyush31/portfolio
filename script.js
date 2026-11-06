(function () {
  var P = window.PORTFOLIO;
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  var ICONS = {
    api: '<path d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2"/>',
    data: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
  };
  function icon(name) {
    return '<svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }
  function addRow(list, label, value) {
    var row = el("div");
    row.appendChild(el("dt", "", label));
    row.appendChild(el("dd", "", value));
    list.appendChild(row);
  }
  var mailto = "mailto:" + P.email;
  var total = P.projects.length;
  var totalEndpoints = P.projects.reduce(function (sum, p) { return sum + (p.endpoints || 0); }, 0);
  var inProgress = P.projects.filter(function (p) { return p.inProgress; }).length;

  /* Name: split into letters for the animation; screen readers get the plain name */
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var heroName = $("hero-name");
  var letterIndex = 0;
  heroName.textContent = "";
  heroName.appendChild(el("span", "sr-only", P.name));
  P.name.split(" ").forEach(function (word) {
    var wordNode = el("span", "word");
    wordNode.setAttribute("aria-hidden", "true");
    word.split("").forEach(function (letter) {
      var node = el("span", "ltr", letter);
      node.style.setProperty("--i", letterIndex++);
      wordNode.appendChild(node);
    });
    heroName.appendChild(wordNode);
    heroName.appendChild(document.createTextNode(" "));
  });
  var lastWord = heroName.querySelector(".word:last-of-type");
  lastWord.insertAdjacentHTML("beforeend", '<svg class="squiggle" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 8 C 28 2, 44 2, 66 7 S 108 11, 132 6 S 176 2, 197 7"/></svg>');

  /* Letters lift towards the pointer */
  var letters = heroName.querySelectorAll(".ltr");
  if (!reduced && finePointer) {
    var pointerFrame = 0;
    var pointer = null;
    var applyPointer = function () {
      pointerFrame = 0;
      var reach = heroName.offsetHeight * 1.4;
      letters.forEach(function (letter) {
        var lift = 0;
        if (pointer) {
          var box = letter.getBoundingClientRect();
          var dx = pointer.x - (box.left + box.width / 2);
          var dy = pointer.y - (box.top + box.height / 2);
          lift = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / reach);
        }
        letter.style.setProperty("--lift", lift.toFixed(3));
      });
    };
    var schedule = function () {
      if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer);
    };
    $("home").addEventListener("pointermove", function (e) {
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    });
    $("home").addEventListener("pointerleave", function () {
      pointer = null;
      schedule();
    });
  }

  /* Subtitle types out each phrase, then deletes it */
  var typed = $("typed");
  var phrases = P.heroWords && P.heroWords.length ? P.heroWords : ["backends that actually work"];
  $("role-static").textContent = "I build " + phrases[0];
  if (reduced || phrases.length === 1) {
    typed.textContent = phrases[0];
  } else {
    var phraseAt = 0;
    var charAt = 0;
    var deleting = false;
    var typeStep = function () {
      var phrase = phrases[phraseAt];
      charAt += deleting ? -1 : 1;
      typed.textContent = phrase.slice(0, charAt);
      var wait = deleting ? 28 : 55;
      if (!deleting && charAt === phrase.length) {
        deleting = true;
        wait = 2000;
      } else if (deleting && charAt === 0) {
        deleting = false;
        phraseAt = (phraseAt + 1) % phrases.length;
        wait = 350;
      }
      setTimeout(typeStep, wait);
    };
    setTimeout(typeStep, 1100);
  }

  /* Hero */
  document.querySelectorAll(".float-tile").forEach(function (tile) {
    tile.innerHTML = icon(tile.dataset.icon);
    tile.appendChild(el("span", "", tile.dataset.label));
  });
  $("hero-sub").textContent = P.education + ". " + P.tagline;
  $("note").textContent = total + " so far" + (inProgress ? ", " + inProgress + " in progress" : "");
  P.stack.reduce(function (all, s) { return all.concat(s.items); }, [])
    .filter(function (name) { return ["JavaScript", "Node.js", "Express", "MongoDB", "Mongoose", "JWT"].indexOf(name) !== -1; })
    .forEach(function (name) { $("built-with").appendChild(el("li", "", name)); });

  /* About */
  $("about-text").textContent = P.about;
  if (P.photo) {
    $("about-photo").src = P.photo;
    $("about-photo").alt = "Photo of " + P.name;
    $("about-photo").hidden = false;
  }
  var numberItems = [
    { value: total, label: "projects, built one after another" },
    { value: totalEndpoints, label: "REST endpoints across 4 of them" },
    { value: 2, suffix: "nd", label: "year at PSIT Kanpur" },
  ];
  numberItems.forEach(function (n) {
    var box = el("div", "reveal");
    box.appendChild(el("dt", "", n.label));
    n.node = el("dd", "", n.value + (n.suffix || ""));
    box.appendChild(n.node);
    $("numbers").appendChild(box);
  });
  if (!reduced && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      countObserver.disconnect();
      var start = performance.now();
      (function frame(now) {
        var t = Math.min((now - start) / 1100, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        numberItems.forEach(function (n) {
          n.node.textContent = Math.round(n.value * eased) + (n.suffix || "");
        });
        if (t < 1) requestAnimationFrame(frame);
      })(start);
    }, { threshold: 0.5 });
    countObserver.observe($("numbers"));
  }

  /* What I build */
  P.services.forEach(function (s) {
    var card = el("article", "service reveal");
    var badge = el("div", "service-icon");
    badge.innerHTML = icon(s.icon);
    card.appendChild(badge);
    card.appendChild(el("h3", "", s.title));
    card.appendChild(el("p", "", s.text));
    $("service-grid").appendChild(card);
  });

  /* Projects: flagship first, then newest to oldest */
  var projects = P.projects.slice().reverse().sort(function (a, b) { return (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0); });
  function chips(items) {
    var ul = el("ul", "chips");
    items.forEach(function (item) { ul.appendChild(el("li", "", item)); });
    return ul;
  }
  function repoLink(p) {
    var a = el("a", "tile-link", "GitHub ↗");
    a.href = p.repo;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }
  function statusOf(p) {
    return p.inProgress ? "In progress" : p.flagship ? "Flagship" : "";
  }
  function countsOf(p) {
    var parts = [];
    if (p.endpoints) parts.push(p.endpoints + " endpoints");
    if (p.models) parts.push(p.models + " models");
    return parts.join(" · ") || p.stack[0] + " API";
  }

  projects.forEach(function (p, i) {
    var size = i === 0 ? " wide" : i === 1 ? " narrow" : "";
    var tile = el("article", "tile reveal" + size);
    var top = el("div", "tile-top");
    top.appendChild(el("span", "", countsOf(p)));
    if (statusOf(p)) top.appendChild(el("span", "tile-flag", statusOf(p)));
    tile.appendChild(top);
    tile.appendChild(el("h3", "", p.title));
    tile.appendChild(el("p", "", p.summary));
    if (p.flagship) {
      var points = el("ul", "points");
      p.highlights.slice(0, 3).forEach(function (h) { points.appendChild(el("li", "", h)); });
      tile.appendChild(points);
    }
    tile.appendChild(chips(p.stack));
    var foot = el("div", "tile-foot");
    var more = el("button", "btn small plain", "View details");
    more.type = "button";
    more.addEventListener("click", function () { openProject(i); });
    foot.append(more, repoLink(p));
    tile.appendChild(foot);
    $("bento").appendChild(tile);
  });

  /* Project details */
  var dialog = $("project");
  var openIndex = 0;
  function fillProject(i) {
    var p = projects[i];
    openIndex = i;
    $("project-badge").textContent = statusOf(p) || "Project";
    $("project-title").textContent = p.title;
    $("project-summary").textContent = p.summary;
    var points = $("project-points");
    points.textContent = "";
    p.highlights.forEach(function (h) { points.appendChild(el("li", "", h)); });
    var meta = $("project-meta");
    meta.textContent = "";
    if (p.endpoints) addRow(meta, "Endpoints", String(p.endpoints));
    if (p.models) addRow(meta, "Models", String(p.models));
    addRow(meta, "Stack", p.stack.join(", "));
    addRow(meta, "Learned", p.learned);
    $("project-repo").href = p.repo;
    dialog.scrollTop = 0;
  }
  function openProject(i) {
    fillProject(i);
    dialog.showModal();
    document.body.classList.add("locked");
  }
  function closeProject() {
    if (reduced) {
      dialog.close();
      return;
    }
    if (dialog.classList.contains("closing")) return;
    dialog.classList.add("closing");
    setTimeout(function () {
      if (dialog.open) dialog.close();
    }, 220);
  }
  function stepProject(direction) {
    var body = document.querySelector(".project-body");
    fillProject((openIndex + direction + projects.length) % projects.length);
    body.style.setProperty("--dir", direction);
    body.classList.remove("swap");
    void body.offsetWidth;
    body.classList.add("swap");
  }
  $("project-close").addEventListener("click", closeProject);
  $("project-prev").addEventListener("click", function () { stepProject(-1); });
  $("project-next").addEventListener("click", function () { stepProject(1); });
  dialog.addEventListener("cancel", function (e) {
    e.preventDefault();
    closeProject();
  });
  dialog.addEventListener("close", function () {
    dialog.classList.remove("closing");
    document.body.classList.remove("locked");
  });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) closeProject();
  });

  /* Path and skills */
  P.projects.forEach(function (p, i) {
    var li = el("li");
    li.appendChild(el("span", "n", String(i + 1)));
    li.appendChild(el("strong", "", p.title));
    li.appendChild(el("span", "", p.learned));
    $("steps").appendChild(li);
  });
  P.stack.forEach(function (s) { addRow($("skills"), s.group, s.items.join(", ")); });
  P.learning.forEach(function (item) { $("learning").appendChild(el("li", "", item)); });

  /* Contact */
  $("talk").textContent = "Happy to talk about " + P.talkAbout;
  $("mail").href = mailto;
  $("github").href = P.github;
  $("linkedin").href = P.linkedin;
  $("motto").textContent = 'git commit -m "' + P.motto + '"';
  if (P.cv) {
    $("cv").href = P.cv;
    $("cv").hidden = false;
  }
  $("copy").addEventListener("click", function () {
    var btn = this;
    var done = function (msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = "Copy email"; }, 1800);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(P.email).then(function () { done("Copied"); }, function () { done("Copy failed"); });
    } else {
      done("Copy failed");
    }
  });

  /* Icon tiles drift gently away from the pointer */
  if (!reduced && finePointer) {
    var tiles = document.querySelectorAll(".float-tile");
    $("home").addEventListener("pointermove", function (e) {
      var x = (e.clientX / innerWidth - 0.5) * -14;
      var y = (e.clientY / innerHeight - 0.5) * -14;
      tiles.forEach(function (tile) {
        tile.style.setProperty("--px", x + "px");
        tile.style.setProperty("--py", y + "px");
      });
    });
  }

  /* On scroll: the hero eases back and a highlight slides to the current section's link */
  var topLinks = $("top-links").querySelectorAll("a");
  var navPill = el("span", "nav-pill");
  navPill.setAttribute("aria-hidden", "true");
  $("top-links").appendChild(navPill);
  var linkedSections = Array.prototype.map.call(topLinks, function (a) { return document.querySelector(a.getAttribute("href")); });
  function updateTopLinks() {
    $("top-links").classList.toggle("scrolled", scrollY > 8);
    $("to-top").classList.toggle("show", scrollY > innerHeight * 0.6);
    var atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    var current = null;
    var bestTop = -Infinity;
    linkedSections.forEach(function (section) {
      var top = section.getBoundingClientRect().top;
      if (top <= innerHeight * 0.45 && top > bestTop) {
        bestTop = top;
        current = section;
      }
    });
    if (atBottom) current = $("contact");
    topLinks.forEach(function (a, i) {
      var isCurrent = linkedSections[i] === current;
      a.classList.toggle("current", isCurrent);
      if (isCurrent) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      if (isCurrent) {
        navPill.style.top = a.offsetTop + "px";
        navPill.style.height = a.offsetHeight + "px";
        navPill.style.width = a.offsetWidth + "px";
        navPill.style.transform = "translateX(" + a.offsetLeft + "px)";
      }
    });
    navPill.style.opacity = current ? "1" : "0";
  }
  var hero = $("home");
  var heroCopy = document.querySelector(".hero-copy");
  var heroTiles = document.querySelectorAll(".float-tile");
  var scrollFrame = 0;
  function applyScroll() {
    scrollFrame = 0;
    updateTopLinks();
    if (reduced) return;
    var p = Math.min(scrollY / hero.offsetHeight, 1);
    heroName.style.transform = p ? "scale(" + (1 - p * 0.18).toFixed(4) + ")" : "";
    heroCopy.style.transform = p ? "translateY(" + (p * 70).toFixed(1) + "px)" : "";
    heroCopy.style.opacity = p ? Math.max(0, 1 - p * 1.15).toFixed(3) : "";
    heroTiles.forEach(function (tile, i) {
      tile.style.setProperty("--sy", (p * (i % 2 ? -70 : -130)).toFixed(1) + "px");
    });
  }
  addEventListener("scroll", function () {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(applyScroll);
  }, { passive: true });
  addEventListener("resize", applyScroll);
  applyScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateTopLinks);

  /* Links inside the page glide to their section. Scrolling yourself takes over straight away. */
  var glideFrame = 0;
  function stopGlide() {
    cancelAnimationFrame(glideFrame);
    glideFrame = 0;
  }
  function glideTo(targetY) {
    stopGlide();
    var startY = scrollY;
    var distance = targetY - startY;
    if (!distance) return;
    var duration = Math.min(1400, 650 + Math.abs(distance) * 0.2);
    var startTime = performance.now();
    function step(now) {
      var t = Math.min((now - startTime) / duration, 1);
      var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      scrollTo(0, startY + distance * eased);
      glideFrame = t < 1 ? requestAnimationFrame(step) : 0;
    }
    glideFrame = requestAnimationFrame(step);
  }
  ["wheel", "touchstart", "keydown"].forEach(function (type) {
    addEventListener(type, stopGlide, { passive: true });
  });
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    var maxY = document.documentElement.scrollHeight - innerHeight;
    var y = Math.min(maxY, Math.max(0, target.getBoundingClientRect().top + scrollY - 12));
    history.pushState(null, "", link.getAttribute("href"));
    if (reduced) scrollTo(0, y);
    else glideTo(y);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* Cards light up where you hover. The spider cursor itself is in spider.js. */
  if (!reduced && finePointer) {
    document.documentElement.classList.add("spotlight");
    addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var card = e.target.closest ? e.target.closest(".card, .about-card, .service, .tile, .numbers > div") : null;
      if (card) {
        var box = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - box.left).toFixed(0) + "px");
        card.style.setProperty("--my", (e.clientY - box.top).toFixed(0) + "px");
      }
    }, { passive: true });
  }

  /* Scroll reveal: everything stays visible if the observer isn't available */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        var delay = batch++ * 90;
        node.style.setProperty("--delay", delay + "ms");
        node.classList.add("seen");
        observer.unobserve(node);
        setTimeout(function () { node.classList.add("settled"); }, delay + 950);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (node) { observer.observe(node); });
  } else {
    reveals.forEach(function (node) { node.classList.add("seen", "settled"); });
  }
})();
