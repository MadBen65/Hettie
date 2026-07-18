(function () {
    const root = document.documentElement;
    const body = document.body;
    if (!body) {
        return;
    }

    const supportsViewTransition = "startViewTransition" in document;

    if (supportsViewTransition) {
        body.classList.add("page-fade-ready");
        root.classList.remove("page-fade-exit");
        body.classList.remove("page-fade-exit");
        return;
    }

    root.classList.add("page-fade-fallback");
    body.classList.add("page-fade-fallback");

    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function parseDurationMs(value) {
        if (!value) {
            return 1320;
        }
        const trimmed = value.trim();
        if (trimmed.endsWith("ms")) {
            return Number.parseFloat(trimmed);
        }
        if (trimmed.endsWith("s")) {
            return Number.parseFloat(trimmed) * 1000;
        }
        const numeric = Number.parseFloat(trimmed);
        return Number.isFinite(numeric) ? numeric : 1320;
    }

    const cssDuration = getComputedStyle(root).getPropertyValue("--page-fade-ms");
    const transitionMs = reducedMotion ? 0 : parseDurationMs(cssDuration);

    function revealPage() {
        requestAnimationFrame(function () {
            root.classList.add("page-fade-ready");
            root.classList.remove("page-fade-exit");
            body.classList.add("page-fade-ready");
            body.classList.remove("page-fade-exit");
        });
    }

    revealPage();
    window.addEventListener("pageshow", revealPage);

    document.addEventListener("click", function (event) {
        const link = event.target.closest("a[href]");
        if (!link) {
            return;
        }

        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        if (link.target && link.target !== "_self") {
            return;
        }

        if (link.hasAttribute("download")) {
            return;
        }

        const targetUrl = new URL(link.href, window.location.href);
        if (targetUrl.origin !== window.location.origin) {
            return;
        }

        if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search && targetUrl.hash) {
            return;
        }

        event.preventDefault();

        let navigated = false;
        function go() {
            if (navigated) {
                return;
            }
            navigated = true;
            window.location.href = targetUrl.href;
        }

        root.classList.add("page-fade-exit");
        body.classList.add("page-fade-exit");

        if (transitionMs === 0) {
            go();
            return;
        }

        const onEnd = function (e) {
            if (e.target !== body) {
                return;
            }
            body.removeEventListener("transitionend", onEnd);
            go();
        };

        body.addEventListener("transitionend", onEnd);
        window.setTimeout(go, transitionMs + 100);
    }, true);
})();
