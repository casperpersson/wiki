var addSiteTitleNavigation = true; // Add link to Site Title next to Site Logo

function customizeHeader(e) {
  if (addSiteTitleNavigation) {
    var t = e.querySelector("span.subheading");
    t &&
      ((t.style.cssText = "cursor: pointer;"),
      t.addEventListener("click", function () {
        window.location = "/";
      }),
      (addSiteTitleNavigation = !1));
  }
}
