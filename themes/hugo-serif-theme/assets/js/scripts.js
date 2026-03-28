var body = document.body;
var menuTrigger = document.querySelector("#toggle-main-menu-mobile");
var menuContainer = document.querySelector("#main-menu-mobile");
var menuLinks = document.querySelectorAll("#main-menu-mobile a");
var header = document.getElementById("stickyHeader");
var revealNodes = document.querySelectorAll("[data-reveal]");

function setMenuState(isOpen) {
  if (!menuTrigger || !menuContainer) {
    return;
  }

  menuContainer.classList.toggle("open", isOpen);
  menuTrigger.classList.toggle("is-active", isOpen);
  menuTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menuContainer.setAttribute("aria-hidden", isOpen ? "false" : "true");
  body.classList.toggle("lock-scroll", isOpen);
}

if (menuTrigger && menuContainer) {
  menuTrigger.setAttribute("aria-expanded", "false");

  menuTrigger.addEventListener("click", function () {
    var shouldOpen = !menuContainer.classList.contains("open");
    setMenuState(shouldOpen);
  });

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenuState(false);
    });
  });

  menuContainer.addEventListener("click", function (event) {
    if (event.target === menuContainer) {
      setMenuState(false);
    }
  });
}

if (header) {
  var toggleHeaderState = function () {
    var isScrolled = window.scrollY > 12;
    header.classList.toggle("sticky", isScrolled);
    header.classList.toggle("is-scrolled", isScrolled);
  };

  toggleHeaderState();
  document.addEventListener("scroll", toggleHeaderState, { passive: true });
}

if (revealNodes.length > 0) {
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px"
    });

    revealNodes.forEach(function (node) {
      revealObserver.observe(node);
    });
  } else {
    revealNodes.forEach(function (node) {
      node.classList.add("is-visible");
    });
  }
}
