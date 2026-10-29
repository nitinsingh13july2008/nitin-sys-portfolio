
/* ======================================
   NITIN.SYS — PORTFOLIO INTERACTIONS
====================================== */

document.addEventListener("DOMContentLoaded", () => {
    const introScreen = document.getElementById("introScreen");
    const exploreBtn = document.getElementById("exploreBtn");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const backToTop = document.querySelector(".back-to-top");

    // INTRO SCREEN
    if (introScreen && exploreBtn) {
        exploreBtn.addEventListener("click", () => {
            introScreen.classList.add("hidden");

            // Remember that intro was opened during this page session.
            try {
                sessionStorage.setItem("nitinSysIntroSeen", "yes");
            } catch (_) {}

            // Scroll to video when Explore is clicked.
            const videoSection = document.getElementById("explore-video");

            if (videoSection) {
                setTimeout(() => {
                    videoSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    const video = document.getElementById("hackerVideo");

                    if (video) {
                        video.play().catch(() => {
                            const status = document.getElementById("videoStatus");
                            if (status) {
                                status.textContent =
                                    "Tap the video play button to start playback.";
                            }
                        });
                    }
                }, 400);
            }
        });

        // Skip the intro if it has already been opened in this tab.
        try {
            if (sessionStorage.getItem("nitinSysIntroSeen") === "yes") {
                introScreen.classList.add("hidden");
            }
        } catch (_) {}
    }

    // MOBILE NAVIGATION
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            });
        });
    }

    // ACTIVE NAV LINK
    const currentPage = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-links a").forEach(link => {
        const href = link.getAttribute("href");

        if (href && href.split("#")[0] === currentPage) {
            link.classList.add("active");
        }
    });

    // MATRIX BACKGROUND
    const canvas = document.getElementById("matrixCanvas");
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (canvas && !reducedMotion) {
        const ctx = canvas.getContext("2d");

        if (ctx) {
            let width = 0;
            let height = 0;
            let columns = 0;
            let drops = [];
            let animationId;
            let lastFrame = 0;

            const fontSize = 15;
            const characters = "01アイウエオカキクケコ<>/{}[]";

            function resizeCanvas() {
                const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

                width = window.innerWidth;
                height = window.innerHeight;

                canvas.width = Math.floor(width * dpr);
                canvas.height = Math.floor(height * dpr);

                canvas.style.width = width + "px";
                canvas.style.height = height + "px";

                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                columns = Math.ceil(width / fontSize);
                drops = Array.from(
                    { length: columns },
                    () => Math.random() * (height / fontSize)
                );
            }

            function drawMatrix(timestamp) {
                if (timestamp - lastFrame < 55) {
                    animationId = requestAnimationFrame(drawMatrix);
                    return;
                }

                lastFrame = timestamp;

                ctx.fillStyle = "rgba(7, 11, 20, 0.13)";
                ctx.fillRect(0, 0, width, height);

                ctx.font = fontSize + "px monospace";
                ctx.fillStyle = "#66d9ff";

                for (let i = 0; i < drops.length; i++) {
                    const character = characters[
                        Math.floor(Math.random() * characters.length)
                    ];

                    ctx.fillText(
                        character,
                        i * fontSize,
                        drops[i] * fontSize
                    );

                    if (
                        drops[i] * fontSize > height &&
                        Math.random() > 0.975
                    ) {
                        drops[i] = 0;
                    }

                    drops[i] += 0.55;
                }

                animationId = requestAnimationFrame(drawMatrix);
            }

            resizeCanvas();
            animationId = requestAnimationFrame(drawMatrix);

            window.addEventListener("resize", resizeCanvas, {
                passive: true
            });

            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    cancelAnimationFrame(animationId);
                } else {
                    lastFrame = 0;
                    animationId = requestAnimationFrame(drawMatrix);
                }
            });
        }
    }

    // REVEAL ELEMENTS ON SCROLL
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window && !reducedMotion) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12
        });

        revealElements.forEach(element => observer.observe(element));
    } else {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    }

    // BACK TO TOP BUTTON
    if (backToTop) {
        const updateBackToTop = () => {
            backToTop.classList.toggle("visible", window.scrollY > 400);
        };

        window.addEventListener("scroll", updateBackToTop, {
            passive: true
        });

        updateBackToTop();

        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });
        });
    }

    // VIDEO CONTROLS
    const video = document.getElementById("hackerVideo");
    const videoStatus = document.getElementById("videoStatus");

    if (video) {
        video.addEventListener("playing", () => {
            if (videoStatus) videoStatus.textContent = "Video playing";
        });

        video.addEventListener("pause", () => {
            if (videoStatus) videoStatus.textContent = "Video paused";
        });

        video.addEventListener("error", () => {
            if (videoStatus) {
                videoStatus.textContent =
                    "Video could not load. Check hacker-turn.mp4 is in the portfolio folder.";
            }
        });
    }

    // CONTACT FORM: opens the visitor's email application.
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = document.getElementById("name")?.value.trim();
            const email = document.getElementById("email")?.value.trim();
            const message = document.getElementById("message")?.value.trim();

            if (!name || !email || !message) {
                alert("Please fill in all fields.");
                return;
            }

            const recipient = contactForm.dataset.email;

            if (!recipient || recipient === "your-email@example.com") {
                alert(
                    "Please add your real email address to contactForm's data-email attribute in contact.html."
                );
                return;
            }

            const subject = encodeURIComponent(
                "Portfolio message from " + name
            );

            const body = encodeURIComponent(
                "Name: " + name +
                "\nEmail: " + email +
                "\n\nMessage:\n" + message
            );

            window.location.href =
                "mailto:" + recipient +
                "?subject=" + subject +
                "&body=" + body;
        });
    }

    // FOOTER YEAR
    document.querySelectorAll("[data-current-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });
});
