const GITHUB_USER = "AhmedOmarDarwish";

const CONTACT_EMAIL = "Ahmedomar.d.t@gmail.com";
const FORM_SUBMIT_URL = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`;

const REPO_DESCRIPTIONS = {
  STORIX: "Smart POS & multi-branch retail management",
  SurveyBasket: "Online surveys REST API system",
  Bookify: "Online book rental management",
  CallExternalApi: "External API integration with Refit",
  "Tech-Mart": "Premium eCommerce web application",
  Storeify: "E-commerce store management platform",
  "Ahmed-omar-Profile-Landing-page": "Personal profile landing page",
  ToyLand: "Toy store e-commerce website",
  Trafalgar: "Healthcare landing page UI",
  Calculator: "Calculator built with HTML, CSS & JavaScript",
  "Maze-Game": "Console maze game in C#",
};

const SKIP_REPOS = new Set([
  GITHUB_USER,
  "profile-readme-generator",
  "Nova-Tech",
  "Portfolio",
]);

function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const overlay = document.querySelector(".nav-overlay");
  const mobileQuery = window.matchMedia("(max-width: 1024px)");

  if (!toggle || !links) return;

  function setNavOpen(isOpen) {
    const wasOpen = links.classList.contains("open");
    if (wasOpen === isOpen) return;

    links.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", isOpen);
    if (overlay) {
      overlay.classList.toggle("visible", isOpen);
      overlay.setAttribute("aria-hidden", String(!isOpen));
    }

    if (isOpen) {
      links.querySelector("a")?.focus();
    } else if (wasOpen) {
      toggle.focus();
    }
  }

  function closeNavIfDesktop() {
    if (!mobileQuery.matches && links.classList.contains("open")) {
      setNavOpen(false);
    }
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setNavOpen(!links.classList.contains("open"));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  overlay?.addEventListener("click", () => setNavOpen(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("open")) {
      setNavOpen(false);
    }
  });

  mobileQuery.addEventListener("change", closeNavIfDesktop);
  window.addEventListener("resize", closeNavIfDesktop, { passive: true });
}

function initActiveNav() {
  const sections = document.querySelectorAll("section, hr[id]");
  const links = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        if (!id) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => {
    if (section.id) observer.observe(section);
  });
}

let revealObserver = null;

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
}

function observeRevealElements(elements) {
  if (!revealObserver) return;
  elements.forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
}

function initScrollReveal() {
  observeRevealElements(
    document.querySelectorAll(
      ".skill-category, .timeline-item, .project-section, .repo-card, .highlight-card"
    )
  );
}

function setFormStatus(form, type, text, { email } = {}) {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.className = `form-status form-status--${type}`;
  status.hidden = !text;

  if (email && text.includes(email)) {
    const [before, after] = text.split(email);
    status.replaceChildren(
      before,
      Object.assign(document.createElement("a"), {
        href: `mailto:${email}`,
        textContent: email,
      }),
      after
    );
    return;
  }

  status.textContent = text;
}

function initContactForm() {
  const form = document.querySelector(".lets-connect form");
  if (!form) return;

  const submitBtn = form.querySelector(".form-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector("#name")?.value.trim() || "";
    const email = form.querySelector("#email")?.value.trim() || "";
    const subject = form.querySelector("#subject")?.value.trim() || "Portfolio Contact";
    const message = form.querySelector("#message")?.value.trim() || "";

    if (form.querySelector("[name=botcheck]")?.checked) {
      return;
    }

    setFormStatus(form, "loading", "Sending your message…");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const response = await fetch(FORM_SUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio — ${subject}`,
          _template: "table",
          _captcha: "false",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message");
      }

      form.reset();
      setFormStatus(form, "success", "Message sent! I'll get back to you soon.");
    } catch {
      setFormStatus(
        form,
        "error",
        `Something went wrong. Please email me directly at ${CONTACT_EMAIL}.`,
        { email: CONTACT_EMAIL }
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
      }
    }
  });
}

function getRepoDescription(repo) {
  if (repo.description) return repo.description;
  return REPO_DESCRIPTIONS[repo.name] || "Open-source project on GitHub";
}

function renderRepoCard(repo) {
  const card = document.createElement("a");
  card.href = repo.html_url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  card.className = "repo-card reveal";

  const title = document.createElement("h4");
  title.textContent = repo.name;

  const desc = document.createElement("p");
  desc.textContent = getRepoDescription(repo);

  const meta = document.createElement("div");
  meta.className = "repo-meta";

  if (repo.language) {
    const lang = document.createElement("span");
    lang.className = "repo-lang";
    lang.textContent = repo.language;
    meta.appendChild(lang);
  }

  if (repo.stargazers_count > 0) {
    const stars = document.createElement("span");
    stars.className = "repo-stars";
    stars.textContent = `★ ${repo.stargazers_count}`;
    meta.appendChild(stars);
  }

  if (repo.fork) {
    const fork = document.createElement("span");
    fork.className = "repo-lang";
    fork.textContent = "Fork";
    meta.appendChild(fork);
  }

  card.append(title, desc, meta);
  return card;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderLanguageBars(repos) {
  const container = document.getElementById("lang-bars");
  if (!container) return;

  const counts = {};
  repos
    .filter((repo) => !SKIP_REPOS.has(repo.name) && repo.language)
    .forEach((repo) => {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);

  if (!total) {
    container.innerHTML = '<p class="stats-loading">No language data available.</p>';
    return;
  }

  container.replaceChildren(
    ...sorted.slice(0, 6).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      const row = document.createElement("div");
      row.className = "lang-row";

      const header = document.createElement("div");
      header.className = "lang-row-header";
      header.innerHTML = `<span class="lang-row-name">${name}</span><span class="lang-row-pct">${pct}%</span>`;

      const track = document.createElement("div");
      track.className = "lang-bar-track";
      const fill = document.createElement("div");
      fill.className = "lang-bar-fill";
      fill.style.width = `${pct}%`;
      track.appendChild(fill);

      row.append(header, track);
      return row;
    })
  );
}

function updateGitHubStats(user, repos) {
  const publicRepos = user.public_repos ?? repos.length;
  const followers = user.followers ?? 0;
  const following = user.following ?? 0;
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const memberSince = user.created_at
    ? new Date(user.created_at).getFullYear()
    : "—";

  setText("repo-count", publicRepos);
  setText("follower-count", followers);
  setText("github-repo-total", publicRepos);
  setText("github-followers", followers);
  setText("github-following", following);

  setText("stat-repos", publicRepos);
  setText("stat-stars", totalStars);
  setText("stat-forks", totalForks);
  setText("stat-since", memberSince);

  if (user.bio) setText("github-tagline", user.bio);

  renderLanguageBars(repos);
}

function showGitHubError(container) {
  if (container) {
    container.innerHTML =
      '<p class="stats-loading">Could not load GitHub data. <a href="https://github.com/' +
      GITHUB_USER +
      '" target="_blank" rel="noopener noreferrer">View profile</a></p>';
  }

  const langBars = document.getElementById("lang-bars");
  if (langBars) {
    langBars.innerHTML = '<p class="stats-loading">Language data unavailable.</p>';
  }

  ["repo-count", "follower-count", "github-repo-total", "stat-repos", "stat-stars", "github-followers", "github-following", "stat-forks", "stat-since"].forEach(
    (id) => setText(id, "—")
  );
}

async function loadGitHubData() {
  const reposContainer = document.getElementById("github-repos");
  if (!reposContainer) return;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`),
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API request failed");

    const user = await userRes.json();
    const repos = await reposRes.json();

    updateGitHubStats(user, repos);

    const featured = repos
      .filter((repo) => !SKIP_REPOS.has(repo.name))
      .sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count ||
          new Date(b.pushed_at) - new Date(a.pushed_at)
      )
      .slice(0, 8);

    const cards = featured.map(renderRepoCard);
    reposContainer.replaceChildren(...cards);
    observeRevealElements(cards);
  } catch {
    showGitHubError(reposContainer);
  }
}

initActiveNav();
initScrollReveal();
initContactForm();
initMobileNav();
initNavbarScroll();
loadGitHubData();
