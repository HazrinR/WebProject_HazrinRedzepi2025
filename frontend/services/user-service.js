var UserService = {
  init: function () {
    const path = window.location.pathname;
    if (path.endsWith("login.html")) {
      var token = localStorage.getItem("user_token");
      if (token) {
        window.location.replace("index.html");
        return;
      }
      $("#login-form").validate({
        rules: {
          email: { required: true, email: true },
          password: { required: true, minlength: 6 }
        },
        messages: {
          email: {
            required: "Email is required.",
            email: "Please enter a valid email address."
          },
          password: {
            required: "Password is required.",
            minlength: "Password must be at least 6 characters."
          }
        },
        submitHandler: function (form) {
          var entity = Object.fromEntries(new FormData(form).entries());
          UserService.login(entity);
        },
      });
      return;
    }
    if (path.endsWith("register.html")) {
      var token = localStorage.getItem("user_token");
      if (token) {
        window.location.replace("index.html");
        return;
      }
      $("#register-form").validate({
        rules: {
          name: { required: true, minlength: 2, lettersonly: true },
          surname: { required: true, minlength: 2, lettersonly: true },
          age: { required: true, number: true, min: 18, max: 100 },
          email: { required: true, email: true },
          password: { required: true, minlength: 6, pwcheck: true }
        },
        messages: {
          name: {
            required: "First name is required.",
            minlength: "First name must be at least 2 characters.",
            lettersonly: "First name must contain only letters."
          },
          surname: {
            required: "Last name is required.",
            minlength: "Last name must be at least 2 characters.",
            lettersonly: "Last name must contain only letters."
          },
          age: {
            required: "Age is required.",
            number: "Age must be a number.",
            min: "Age must be at least 18.",
            max: "Age must be at most 100."
          },
          email: {
            required: "Email is required.",
            email: "Please enter a valid email address."
          },
          password: {
            required: "Password is required.",
            minlength: "Password must be at least 6 characters.",
            pwcheck: "Password must contain at least one letter and one number."
          }
        },
        submitHandler: function (form) {
          var entity = Object.fromEntries(new FormData(form).entries());
          UserService.register(entity);
        },
      });
      // Custom validator for letters only
      $.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-zA-ZčćžšđČĆŽŠĐ ]+$/.test(value);
      }, "Only letters are allowed.");
      // Custom validator for password strength
      $.validator.addMethod("pwcheck", function(value) {
        return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value);
      }, "Password must contain at least one letter and one number.");
      return;
    }
    // Show menu and main sections if logged in
    if (typeof UserService.generateMenuItems === 'function') {
      UserService.generateMenuItems();
    }
    // Logout button handler
    $(document).on("click", "#logoutButton", function (e) {
      e.preventDefault();
      if (UserService.logout) {
        UserService.logout();
      } else {
        localStorage.clear();
        window.location.replace("login.html");
      }
    });
  },

  login: function (entity) {
    $.ajax({
      url: Constants.PROJECT_BASE_URL + "auth/login",
      type: "POST",
      data: JSON.stringify(entity),
      contentType: "application/json",
      dataType: "json",
      success: function (result) {
        localStorage.setItem("user_token", result.data.token);
        toastr.success("Login successful!");
        window.location.replace("index.html");
      },
      error: function (xhr) {
        let message = xhr.responseJSON?.message || "Login failed!";
        toastr.error(message);
      },
    });
  },

  register: function (entity) {
  
    entity.firstName = entity.name;
    entity.lastName = entity.surname;
    delete entity.name;
    delete entity.surname;
    $.ajax({
      url: Constants.PROJECT_BASE_URL + "auth/register",
      type: "POST",
      data: JSON.stringify(entity),
      contentType: "application/json",
      dataType: "json",
      success: function () {
        toastr.success("Registration successful! You can now login.");
        window.location.replace("login.html");
      },
      error: function (xhr) {
        let message = xhr.responseJSON?.message || "Registration failed!";
        toastr.error(message);
      },
    });
  },

  logout: function () {
     console.log("Clearing token and redirecting");
    localStorage.clear();
    window.location.replace("login.html");
  },

  generateMenuItems: function () {
    const token = localStorage.getItem("user_token");
    let user = null;
    try {
      user = Utils.parseJwt(token).user;
    } catch (e) {
      UserService.logout();
      return;
    }

    if (user && user.role) {
      let nav = "";
      let main = "";
      switch (user.role) {
        case Constants.USER_ROLE:
          nav = `
            <li class="nav-item">
              <a class="nav-link fs-5" aria-current="page" href="#home">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#wishlist">Wishlist</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#groups">Groups</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#events">Events</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#profile">Profile</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#" id="logoutButton">Logout</a>
            </li>`;
          main = `
            <section id="home" data-load="home.html"></section>
            <section id="wishlist" data-load="wishlist.html"></section>
            <section id="groups" data-load="groups.html"></section>
            <section id="events" data-load="events.html"></section>
            <section id="profile" data-load="profile.html"></section>`;
          break;
        case Constants.ADMIN_ROLE:
          nav = `
            <li class="nav-item">
              <a class="nav-link fs-5" aria-current="page" href="#home">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#wishlist">Wishlist</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#groups">Groups</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#events">Events</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#profile">Profile</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fs-5" href="#" id="logoutButton">Logout</a>
            </li>`;
          main = `
            <section id="home" data-load="home.html"></section>
            <section id="wishlist" data-load="wishlist.html"></section>
            <section id="groups" data-load="groups.html"></section>
            <section id="events" data-load="events.html"></section>
            <section id="profile" data-load="profile.html"></section>`;
          break;
        default:
          UserService.logout();
          return;
      }
      $("#menuTabs").html(nav);
      $("#spapp").html(main);
    } else {
      UserService.logout();
    }
  },
};

// Auto-init on page load
$(document).ready(function () {
  UserService.init(); // Call the unified init function

  // Logout button handler
  $(document).on("click", "#logoutButton", function (e) {
    e.preventDefault();
     console.log("Logout clicked"); 
    if (UserService.logout) {
      UserService.logout();
    } else {
      localStorage.clear();
      window.location.replace("login.html");
    }
  });
});

