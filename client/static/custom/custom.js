var collapsibleMenu = false; // Enable or disable collapsible menu
var slidingMenu = false; // Enable or disable sliding menu
var hideDivider = false; // Enable or disable 'Divider' element in navigation
var addSiteTitleNavigation = true; // Add link to Site Title next to Site Logo
var removeBreadcrumbs = false; // Enable or disable Breadcrumbs
var removeTocCard = false; // Enable or disable 'Table of Contents' Card
var removeTagCard = false; // Enable or disable 'Tags' Card
var removeHistoryCard = false; // Enable or disable 'Last Edited By' Card
var customizeVideoPlayer = false; // Enable or disable video player customization
var removeBookmarkCard = false; // Enable or disable Bookmark/Share/Print Card
var sideColumnPosition = "left"; // Side column position. Options: 'left'|'right'|false



const CM_LNK_ACTIVE = "mad-cm-lnk-active",
  CM_LNK_ACTIVE2 = "mad-cm-lnk-active2"

var menuItemType,
  header,
  navigation,
  main,
  footer,
  btnToTop,
  sideColumn,
  pageTitle,
  breadcrumbs,
  hideSideColumn,
  headerProcessed = (navProcessed = mainProcessed = footerProcessed = !1),
  breadcrumbsHidden = !1,
  btnToTopProcessed = !1,
  btnToTopVisible = !1,
  curPathRel = window.location.pathname,
  curPathAbs = window.location.href,
  mo = new MutationObserver(moCallback),
  moConfig = {
    attributes: !0,
    childList: !0,
    subtree: !0,
    characterDataOldValue: !0,
    attributeOldValue: !0,
  },
  moTarget = document;
if (slidingMenu) {
  var icon_pinOff = "mdi-pin-off-outline",
    icon_pinOn = "mdi-pin-outline",
    icon_menu = "mdi-menu",
    pmb = null,
    pmbHolder = null,
    mb = null,
    mbHolder = null,
    contentHolder = null,
    backToTopHolder = null,
    menuOpening = (menuClosing = menuClosed = menuOpened = !1);
  "" == (pinMenu = getCookie(COOKIE_NAME))
    ? ((pinMenu = !1), setCookie(COOKIE_NAME, pinMenu, COOKIE_DAYS))
    : (pinMenu = "false" !== pinMenu);
} else var pinMenu = !0;
var mouseLeftEdgeOpensMenu,
  sideColumnHidden = !1,
  isMouseOverNav = !1,
  menuFirstHover = !0,
  mobileDevice = isMobileDevice();
function isMobileDevice() {
  return !!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
function fixMobileDeviceNodeValue(e) {
  var t = e.nodeValue;
  if (t) {
    if ((o = t.split("#")).length > 1) {
      if (isNumeric(o[1])) {
        level = parseInt(o[1]);
        var n = t.replace("#" + o[1] + "#", "");
      }
    } else n = t;
    var o = n.split("#");
    e.nodeValue = o[0];
  }
}
function moStart() {
  mo.observe(moTarget, moConfig);
}
function moStop() {
  mo.disconnect();
}
function moCallback(e, t) {
  for (const { addedNodes: t } of e)
    for (const e of t)
      e.tagName &&
        e.matches("NAV") &&
        e.style &&
        e.style.getPropertyValue("transform") &&
        (e.style.removeProperty
          ? e.style.removeProperty("transform")
          : e.style.removeAttribute("transform"));
  (header = document.querySelector("header[data-booted='true']")),
    (navigation = document.querySelector("nav[data-booted='true']")),
    (main = document.querySelector("main[data-booted='true']")),
    (footer = document.querySelector("footer[data-booted='true']")),
    (btnToTop = document.querySelector("i.mdi-arrow-up")),
    (btnToTopVisible = !1),
    btnToTop &&
      ((btnToTopVisible = !0),
      (btnToTop = btnToTop.closest("button")),
      pinMenu || "5px" == btnToTop.style.left || (btnToTop.style.left = "5px")),
    header &&
      !headerProcessed &&
      (customizeHeader(header), (headerProcessed = !0)),
    mouseLeftEdgeOpensMenu && (document.onmousemove = handleMouseMove);
}

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
moStart(),
  (Array.prototype.wrapGroup = function (e) {
    const t = document.createElement("div");
    "" != e && (t.className = e),
      this.forEach((e) => {
        e.parentNode.insertBefore(t, e), t.appendChild(e);
      }),
      this.forEach((e) => {
        if (
          ((e.childNodes[1].childNodes[0].nodeValue = getMenuItemInfo(
            e,
            "text"
          )),
          e.href == curPathAbs)
        ) {
          for (
            e.classList.add(CM_LNK_ACTIVE), parent = e.parentNode;
            parent && parent.classList.contains(CM_SECTION);

          ) {
            parent.classList.add(CM_SECTION_EXPANDED);
            var t = parent;
            parent = parent.parentNode;
          }
          t.previousElementSibling.classList.toggle(CM_COLLAPSIBLE_ACTIVE);
        }
      });
  });
function pmbEvent() {
  "mouseup" === event.type
    ? toggleMenuPin()
    : main.contains(event.relatedTarget) &&
      "mouseleave" === event.type &&
      (pinMenu ? pmbHide() : menuClose());
}
function jsSleep(e) {
  return new Promise((t) => setTimeout(t, e));
}
async function sleep(e) {
  await jsSleep(e);
}
function isDescendant(e, t)
{
	if (!t)
	{
		for (var n = t.parentNode; null != n; )
		{
			if (n == e) return !0;
			n = n.parentNode;
		}
	}
	return !1;
}


const rxYoutube = /^.*^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/|shorts\/)?)([\w\-]+)(\S+)?$/;
const rxgooglemaps = /^.*^((?:https?:)?\/\/)?((?:maps)\.)?(?:google\.com)[\\w?%&=\/]*q=(?<question>[^&|$]+)$/im;

  window.boot.register('vue', () =>
	  {
		window.onload = () =>
		{
			document.querySelectorAll('.contents oembed, .contents a').forEach(elm =>
			{
				const url = elm.hasAttribute('url') ? elm.getAttribute('url') : elm.getAttribute('href')
				let newElmHtml = null
				const ytMatch = url.match(rxYoutube)
				const gmMatch = url.match(rxgooglemaps)
				if (ytMatch)
				{
					newElmHtml = `<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube-nocookie.com/embed/${ytMatch[5]}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
				}
				else if(rxgooglemaps && gmMatch && gmMatch[3] != null)
				{
					newElmHtml = `<iframe width="100%" height="600" src="https://maps.google.com/maps?width=100%&height=600&hl=en&output=embed&q=${gmMatch[3]}" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>`
				}
				else if (url.endsWith('.mp4'))
				{
					newElmHtml = `<video controls autostart="0" name="media" width="640" height="360"><source src="${url}" type="video/mp4"></video>`
				}
				else
				{
					return;
				}
				const newElm = document.createElement('div')
				newElm.classList.add('responsive-embed')
				newElm.insertAdjacentHTML('beforeend', newElmHtml)
				elm.replaceWith(newElm)
			})
		}
	});
