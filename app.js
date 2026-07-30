(function () {
  const LOGIN_KEY = "drainageSystemLoggedIn";
  const COLLAPSE_KEY = "drainageSidebarCollapsed";

  const current =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();

  // const isLoginPage =
  //   current === "index.html" ||
  //   current === "";
  const isLoginPage =
  current === "index.html";

const isPublicPage =
  current === "publichomepage.html";

  function isLoggedIn() {
    return (
      localStorage.getItem(
        LOGIN_KEY
      ) === "true"
    );
  }

  // if (
  //   !isLoginPage &&
  //   !isLoggedIn()
  // ) {
  //   window.location.href =
  //     "index.html";

  //   return;
  // }

if (
  !isLoginPage &&
  !isPublicPage &&
  !isLoggedIn()
) {
  window.location.href =
    "index.html";

  return;
}

  if (
    isLoginPage &&
    isLoggedIn()
  ) {
    window.location.href =
      "home.html";

    return;
  }

  function updateClock() {
    const clock =
      document.getElementById(
        "clock"
      );

    if (!clock) return;

    clock.textContent =
      new Intl.DateTimeFormat(
        "en-PH",
        {
          timeZone:
            "Asia/Manila",

          hour:
            "2-digit",

          minute:
            "2-digit",

          second:
            "2-digit",

          hour12:
            false
        }
      ).format(
        new Date()
      );
  }

  function initClock() {
    updateClock();

    setInterval(
      updateClock,
      1000
    );
  }

  function initShell() {
    const toggle =
      document.getElementById(
        "sidebar-toggle"
      );

    const logout =
      document.getElementById(
        "logout-btn"
      );

    const collapsed =
      localStorage.getItem(
        COLLAPSE_KEY
      );

    if (
      collapsed ===
      "true"
    ) {
      document.body.classList.add(
        "sidebar-collapsed"
      );
    }

    if (
      toggle
    ) {

      toggle.addEventListener(
        "click",
        () => {

          const mobile =
            window.matchMedia(
              "(max-width:820px)"
            ).matches;

          if (
            mobile
          ) {

            document.body.classList.toggle(
              "sidebar-open"
            );

            return;
          }

          document.body.classList.toggle(
            "sidebar-collapsed"
          );

          localStorage.setItem(
            COLLAPSE_KEY,
            document.body.classList.contains(
              "sidebar-collapsed"
            )
          );

        }
      );

    }

    document
      .querySelectorAll(
        ".nav-link"
      )
      .forEach(
        (
          link
        ) => {

          link.addEventListener(
            "click",
            () => {

              document.body.classList.remove(
                "sidebar-open"
              );

            }
          );

        }
      );

    if (
      logout
    ) {

      logout.addEventListener(
        "click",
        () => {

          localStorage.removeItem(
            LOGIN_KEY
          );

          window.location.href =
            "publichomepage.html";

        }
      );

    }

  }

  function initLogin() {

    const form =
      document.getElementById(
        "login-form"
      );

    const error =
      document.getElementById(
        "login-error"
      );

    if (
      !form
    ) return;

    form.addEventListener(
      "submit",
      (
        e
      ) => {

        e.preventDefault();

        const username =
          document
          .getElementById(
            "username"
          )
          .value
          .trim();

        const password =
          document
          .getElementById(
            "password"
          )
          .value
          .trim();

        if (
          username ===
            "admin" &&
          password ===
            "admin123"
        ) {

          localStorage.setItem(
            LOGIN_KEY,
            "true"
          );

          window.location.href =
            "home.html";

          return;

        }

        if (
          error
        ) {

          error.textContent =
            "Invalid username or password.";

          error.classList.remove(
            "hidden"
          );

        }

      }
    );

  }

  initClock();

  initShell();

  initLogin();

})();