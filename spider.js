/*
 * Spider cursor: a field of stars, and spiders that chase the mouse and wander around it.
 * Each leg grabs a nearby star and holds on, then steps to a new star when it can't reach any more.
 * Mouse only. It stays off on touch screens and when reduced motion is requested.
 */
(function () {
  var CONFIG = {
    spiders: 1,                // how many spiders there are
    legs: 6,                   // legs on each spider
    strands: 8,                // lines that make up each leg
    reach: 130,                // how far a leg can stretch, in px
    maxSpeed: 760,             // top chase speed in px per second; a faster mouse pulls ahead of them
    wander: 1,                 // how far they roam around the mouse: 0 keeps them on it
    stickToCursor: false,      // true puts the first spider exactly on the mouse, with no chasing
    glowRadius: 270,           // stars within this distance of a spider light up
    legColor: "255, 138, 76",
    starColor: "242, 241, 237",
    starSpacing: 2600,         // screen area per star: lower means more stars
    maxStars: 900,
  };

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  function makeCanvas(className) {
    var canvas = document.createElement("canvas");
    canvas.className = className;
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    return canvas;
  }
  var backCanvas = makeCanvas("spider-stars"); // sits behind the page content
  var frontCanvas = makeCanvas("spider-layer"); // sits above it, and never blocks clicks
  var back = backCanvas.getContext("2d");
  var front = frontCanvas.getContext("2d");
  var dialog = document.getElementById("project");

  var width = 0, height = 0, ratio = 1;
  var stars = [];
  var spiders = [];
  var mouse = { x: 0, y: 0, inside: false, seen: false };
  var opacity = 0;
  var running = false;
  var frameCount = 0;
  var lastFrame = 0;

  function resize() {
    width = innerWidth;
    height = innerHeight;
    ratio = Math.min(devicePixelRatio || 1, 2);
    [backCanvas, frontCanvas].forEach(function (canvas) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    });
    var count = Math.min(CONFIG.maxStars, Math.round((width * height) / CONFIG.starSpacing));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({ x: Math.random() * width, y: Math.random() * height, r: 0.5 + Math.random() * 0.8, a: 0.1 + Math.random() * 0.24 });
    }
    back.setTransform(ratio, 0, 0, ratio, 0, 0);
    back.clearRect(0, 0, width, height);
    back.fillStyle = "rgb(" + CONFIG.starColor + ")";
    stars.forEach(function (star) {
      back.globalAlpha = star.a;
      back.beginPath();
      back.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      back.fill();
    });
    back.globalAlpha = 1;
    spiders.forEach(function (spider) {
      spider.legs.forEach(function (leg) { leg.star = -1; });
    });
  }

  function createSpiders(x, y) {
    spiders = [];
    for (var s = 0; s < CONFIG.spiders; s++) {
      var legs = [];
      for (var i = 0; i < CONFIG.legs; i++) {
        legs.push({ star: -1, x: x, y: y, vx: 0, vy: 0, angle: ((i + Math.random() * 0.5) / CONFIG.legs) * Math.PI * 2, phase: Math.random() * 10 });
      }
      spiders.push({
        x: x, y: y, vx: 0, vy: 0,
        locked: CONFIG.stickToCursor && s === 0,
        /* Evenly spaced starting points, so the spiders roam in different places */
        wanderPhase: (s / CONFIG.spiders) * Math.PI * 2 + Math.random() * 0.6,
        legs: legs,
      });
    }
  }

  /* Find the free star closest to where this leg wants to reach, leaning the way the spider is going */
  function chooseStar(spider, leg) {
    var ideal = CONFIG.reach * 0.72;
    var wantX = spider.x + Math.cos(leg.angle) * ideal + spider.vx * 0.1;
    var wantY = spider.y + Math.sin(leg.angle) * ideal + spider.vy * 0.1;
    var best = -1;
    var bestScore = Infinity;
    for (var i = 0; i < stars.length; i++) {
      var star = stars[i];
      var bodyDx = star.x - spider.x, bodyDy = star.y - spider.y;
      var fromBody = bodyDx * bodyDx + bodyDy * bodyDy;
      if (fromBody > CONFIG.reach * CONFIG.reach * 0.9 || fromBody < 900) continue;
      var dx = star.x - wantX, dy = star.y - wantY;
      var score = dx * dx + dy * dy;
      if (score < bestScore && !spider.legs.some(function (other) { return other !== leg && other.star === i; })) {
        bestScore = score;
        best = i;
      }
    }
    leg.star = best;
  }

  /* Critically damped spring: legs move and stop gently, with no bounce */
  function spring(item, goalX, goalY, strength, step) {
    item.vx += (strength * strength * (goalX - item.x) - 2 * strength * item.vx) * step;
    item.vy += (strength * strength * (goalY - item.y) - 2 * strength * item.vy) * step;
    item.x += item.vx * step;
    item.y += item.vy * step;
  }

  function updateSpider(spider, dt, time) {
    var steps = Math.max(1, Math.ceil(dt / 0.012));
    var step = dt / steps;

    /* Where this spider is heading: a slowly wandering spot around the mouse */
    var goalX = mouse.x, goalY = mouse.y;
    if (!spider.locked) {
      goalX += (Math.cos(time * 0.31 + spider.wanderPhase) * 70 + Math.cos(time * 0.73 + spider.wanderPhase * 2) * 35) * CONFIG.wander;
      goalY += (Math.sin(time * 0.27 + spider.wanderPhase) * 70 + Math.sin(time * 0.67 + spider.wanderPhase * 2) * 35) * CONFIG.wander;
    }

    /* Legs that can't reach their star any more take a step. Only a couple per frame, so it walks. */
    var budget = 2;
    spider.legs.forEach(function (leg) {
      var star = stars[leg.star];
      if (budget > 0 && (!star || Math.hypot(star.x - spider.x, star.y - spider.y) > CONFIG.reach)) {
        chooseStar(spider, leg);
        budget--;
      }
    });
    if (frameCount % 70 === 0) {
      var idle = spider.legs[Math.floor(Math.random() * spider.legs.length)];
      idle.angle += (Math.random() - 0.5) * 0.8;
      chooseStar(spider, idle);
    }

    var turn = 1 - Math.exp(-step * 9);
    var maxLength = CONFIG.reach * 1.25;
    var startX = spider.x, startY = spider.y;
    for (var i = 0; i < steps; i++) {
      if (spider.locked) {
        spider.x = startX + (mouse.x - startX) * ((i + 1) / steps);
        spider.y = startY + (mouse.y - startY) * ((i + 1) / steps);
        spider.vx = (mouse.x - startX) / dt;
        spider.vy = (mouse.y - startY) / dt;
      } else {
        /* Runs at up to top speed, then eases in once it's close */
        var dx = goalX - spider.x, dy = goalY - spider.y;
        var distance = Math.hypot(dx, dy) || 1;
        var speed = Math.min(CONFIG.maxSpeed, distance * 5.5);
        spider.vx += ((dx / distance) * speed - spider.vx) * turn;
        spider.vy += ((dy / distance) * speed - spider.vy) * turn;
        spider.x += spider.vx * step;
        spider.y += spider.vy * step;
      }
      spider.legs.forEach(function (leg) {
        var target = stars[leg.star];
        var tipX = target ? target.x : spider.x + Math.cos(leg.angle) * CONFIG.reach * 0.6;
        var tipY = target ? target.y : spider.y + Math.sin(leg.angle) * CONFIG.reach * 0.6;
        spring(leg, tipX, tipY, 24, step);

        /* A leg can't stretch further than this */
        var legDx = leg.x - spider.x, legDy = leg.y - spider.y;
        var length = Math.hypot(legDx, legDy);
        if (length > maxLength) {
          var pull = (length - maxLength) / length;
          leg.x -= legDx * pull;
          leg.y -= legDy * pull;
          leg.vx += (spider.vx - leg.vx) * 0.25;
          leg.vy += (spider.vy - leg.vy) * 0.25;
        }
      });
    }
  }

  function drawLitStars() {
    var radius = CONFIG.glowRadius;
    front.fillStyle = "rgb(" + CONFIG.starColor + ")";
    for (var i = 0; i < stars.length; i++) {
      var star = stars[i];
      var closeness = 0;
      for (var s = 0; s < spiders.length; s++) {
        var dx = star.x - spiders[s].x, dy = star.y - spiders[s].y;
        if (dx > radius || dx < -radius || dy > radius || dy < -radius) continue;
        closeness = Math.max(closeness, 1 - Math.sqrt(dx * dx + dy * dy) / radius);
      }
      if (closeness <= 0) continue;
      front.globalAlpha = opacity * Math.min(1, closeness * closeness * 1.6);
      front.beginPath();
      front.arc(star.x, star.y, star.r + closeness * 1.3, 0, Math.PI * 2);
      front.fill();
    }
  }

  function drawSpider(spider, time) {
    var segments = 16;
    var color = "rgb(" + CONFIG.legColor + ")";
    spider.legs.forEach(function (leg) {
      var dx = leg.x - spider.x, dy = leg.y - spider.y;
      var length = Math.hypot(dx, dy) || 1;
      var normalX = -dy / length, normalY = dx / length;
      front.beginPath();
      for (var s = 0; s < CONFIG.strands; s++) {
        var spread = s - (CONFIG.strands - 1) / 2;
        for (var i = 0; i <= segments; i++) {
          var t = i / segments;
          /* The bundle fans out near the body and narrows to a point at the tip */
          var fan = (t < 0.14 ? t / 0.14 : Math.pow((1 - t) / 0.86, 1.2)) * 1.5;
          var wave = Math.sin(t * 9 + time * 3 + leg.phase + s * 0.22) * 3.2 * t * (1 - t) * 4 * 0.7;
          var offset = wave + spread * fan;
          var x = spider.x + dx * t + normalX * offset;
          var y = spider.y + dy * t + normalY * offset;
          if (i === 0) front.moveTo(x, y);
          else front.lineTo(x, y);
        }
      }
      front.globalAlpha = opacity * 0.75;
      front.lineWidth = 0.7;
      front.strokeStyle = color;
      front.stroke();
      front.globalAlpha = opacity;
      front.fillStyle = color;
      front.beginPath();
      front.arc(leg.x, leg.y, 2.6, 0, Math.PI * 2);
      front.fill();
    });
    front.globalAlpha = opacity;
    front.fillStyle = color;
    front.beginPath();
    front.arc(spider.x, spider.y, 3, 0, Math.PI * 2);
    front.fill();
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - lastFrame) / 1000) || 0.016;
    lastFrame = now;
    var wanted = mouse.inside && !(dialog && dialog.open) ? 1 : 0;
    opacity += (wanted - opacity) * (1 - Math.exp(-dt * 8));
    frameCount++;
    front.setTransform(ratio, 0, 0, ratio, 0, 0);
    front.clearRect(0, 0, width, height);
    if (!wanted && opacity < 0.01) {
      opacity = 0;
      running = false;
      return;
    }
    var time = now / 1000;
    spiders.forEach(function (spider) { updateSpider(spider, dt, time); });
    drawLitStars();
    spiders.forEach(function (spider) { drawSpider(spider, time); });
    front.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    requestAnimationFrame(frame);
  }

  addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.inside = true;
    if (!mouse.seen) {
      mouse.seen = true;
      createSpiders(mouse.x, mouse.y);
    }
    start();
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", function () { mouse.inside = false; });
  if (dialog) dialog.addEventListener("close", function () { if (mouse.inside) start(); });
  addEventListener("resize", resize);
  resize();
})();
