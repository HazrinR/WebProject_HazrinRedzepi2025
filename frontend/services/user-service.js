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
    // Ensure profile page logic is always initialized if loaded via SPApp
    if (window.location.hash === '#profile' || path.endsWith('profile.html')) {
      setTimeout(function() { UserService.initProfilePage(); }, 200);
    }
  },

  login: function (entity) {
    // Extra frontend validation before AJAX
    entity.email = (entity.email || '').trim();
    entity.password = (entity.password || '').trim();
    if (!entity.email || !entity.password) {
      toastr.error("Email and password are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(entity.email)) {
      toastr.error("Please enter a valid email address.");
      return;
    }
    if (entity.password.length < 6 || entity.password.length > 50) {
      toastr.error("Password must be between 6 and 50 characters.");
      return;
    }
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
    // Extra frontend validation before AJAX
    entity.name = (entity.name || '').trim();
    entity.surname = (entity.surname || '').trim();
    entity.email = (entity.email || '').trim();
    entity.password = (entity.password || '').trim();
    if (!entity.name || !entity.surname || !entity.age || !entity.email || !entity.password) {
      toastr.error("All fields are required.");
      return;
    }
    if (entity.name.length < 2 || entity.name.length > 30) {
      toastr.error("First name must be 2-30 characters.");
      return;
    }
    if (entity.surname.length < 2 || entity.surname.length > 30) {
      toastr.error("Last name must be 2-30 characters.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(entity.email)) {
      toastr.error("Please enter a valid email address.");
      return;
    }
    if (isNaN(entity.age) || entity.age < 18 || entity.age > 100) {
      toastr.error("Age must be a number between 18 and 100.");
      return;
    }
    if (entity.password.length < 6 || entity.password.length > 50) {
      toastr.error("Password must be 6-50 characters.");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(entity.password)) {
      toastr.error("Password must contain at least one letter and one number.");
      return;
    }
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
            $("#menuTabs").html(nav);
          main = `
            <section id="home" data-load="home.html"></section>
            <section id="wishlist" data-load="wishlist.html"></section>
            <section id="groups" data-load="groups.html"></section>
            <section id="events" data-load="events.html"></section>
            <section id="profile" data-load="profile.html"></section>`;
            $("#spapp").html(main);
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
            $("#menuTabs").html(nav);
          main = `
            <section id="home" data-load="home.html"></section>
            <section id="wishlist" data-load="wishlist.html"></section>
            <section id="groups" data-load="groups.html"></section>
            <section id="events" data-load="events.html"></section>
            <section id="profile" data-load="profile.html"></section>`;
            $("#spapp").html(main);
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

  // --- ADMIN USER MANAGEMENT ---
  loadUsersTable: function() {
    // Hide table before loading
    $('#users-table').hide();
    RestClient.get('users', function(data) {
      Utils.datatable(
        'users-table',
        [
          {
            data: null,
            title: '',
            render: function (data, type, row, meta) {
              return `<input type=\"radio\" name=\"user-select\" value=\"${row.id}\">`;
            },
            orderable: false,
            searchable: false,
            width: "20px",
          },
          { data: 'firstName', title: 'First Name' },
          { data: 'lastName', title: 'Last Name' },
          { data: 'age', title: 'Age' },
          { data: 'email', title: 'Email' },
          { data: 'role', title: 'Role' }
        ],
        data,
        10
      );
      $('#users-table').show();
    }, function() {
      $('#users-table').hide();
      toastr.error('Error fetching users.');
    });
  },

  openAddUserModal: function() {
    document.getElementById('addEditUserForm').reset();
    document.getElementById('editUserId').value = '';
    document.getElementById('addEditUserModalTitle').textContent = 'Add User';
    document.getElementById('addPassword').required = true;
    document.getElementById('passwordHelp').style.display = 'none';
    // Set password required for add
    $("#addPassword").rules('add', { required: true, minlength: 6, maxlength: 50 });
    $('#addEditUserModal').modal('show');
  },

  openEditUserModal: function(user) {
    document.getElementById('addEditUserForm').reset();
    document.getElementById('editUserId').value = user.id;
    document.getElementById('addFirstName').value = user.firstName;
    document.getElementById('addLastName').value = user.lastName;
    document.getElementById('addAge').value = user.age;
    document.getElementById('addEmail').value = user.email;
    document.getElementById('addRole').value = user.role;
    document.getElementById('addPassword').value = '';
    document.getElementById('addPassword').required = false;
    document.getElementById('passwordHelp').style.display = '';
    document.getElementById('addEditUserModalTitle').textContent = 'Edit User';
    // Set password optional for edit
    $("#addPassword").rules('remove', 'required');
    $("#addPassword").rules('add', { minlength: 6, maxlength: 50 });
    $('#addEditUserModal').modal('show');
  },

  handleUserForm: function() {
    // jQuery Validation for Add/Edit User Form
    $("#addEditUserForm").validate({
      rules: {
        firstName: { required: true, minlength: 2, maxlength: 30 },
        lastName: { required: true, minlength: 2, maxlength: 30 },
        age: { required: true, number: true, min: 18, max: 100 },
        email: { required: true, email: true },
        password: { required: true, minlength: 6, maxlength: 50 }, // default, will be overridden in modal openers
        role: { required: true }
      },
      messages: {
        firstName: {
          required: "First name is required",
          minlength: "First name must be at least 2 characters",
          maxlength: "First name cannot exceed 30 characters"
        },
        lastName: {
          required: "Last name is required",
          minlength: "Last name must be at least 2 characters",
          maxlength: "Last name cannot exceed 30 characters"
        },
        age: {
          required: "Age is required",
          number: "Age must be a number",
          min: "Age must be at least 18",
          max: "Age must be at most 100"
        },
        email: {
          required: "Email is required",
          email: "Please enter a valid email address"
        },
        password: {
          required: "Password is required",
          minlength: "Password must be at least 6 characters",
          maxlength: "Password cannot exceed 50 characters"
        },
        role: {
          required: "Role is required"
        }
      },
      errorClass: 'is-invalid',
      validClass: 'is-valid',
      errorPlacement: function(error, element) {
        error.addClass('invalid-feedback');
        if (element.parent('.input-group').length) {
          error.insertAfter(element.parent());
        } else {
          error.insertAfter(element);
        }
      },
      highlight: function(element) {
        $(element).addClass('is-invalid').removeClass('is-valid');
      },
      unhighlight: function(element) {
        $(element).removeClass('is-invalid').addClass('is-valid');
      },
      submitHandler: function(form) {
        var id = document.getElementById('editUserId').value;
        var user = {
          firstName: document.getElementById('addFirstName').value,
          lastName: document.getElementById('addLastName').value,
          age: parseInt(document.getElementById('addAge').value),
          email: document.getElementById('addEmail').value,
          role: document.getElementById('addRole').value
        };
        var password = document.getElementById('addPassword').value;
        if (password) user.password = password;
        $.blockUI({ message: '<h3>Processing...</h3>' });
        if (id) {
          // Edit user
          RestClient.put('users/' + id, user, function(response) {
            toastr.success('User updated successfully');
            $('#addEditUserModal').modal('hide');
            UserService.loadUsersTable();
            $.unblockUI();
          }, function(response) {
            toastr.error(response?.responseJSON?.error || response?.responseJSON?.message || 'Error updating user');
            $.unblockUI();
          });
        } else {
          // Add user
          if (!user.password) {
            toastr.error('Password is required');
            $.unblockUI();
            return;
          }
          RestClient.post('users', user, function(response) {
            toastr.success('User added successfully');
            $('#addEditUserModal').modal('hide');
            UserService.loadUsersTable();
            $.unblockUI();
          }, function(response) {
            toastr.error(response?.responseJSON?.error || response?.responseJSON?.message || 'Error adding user');
            $.unblockUI();
          });
        }
      }
    });
  },

  setUserInfo: function(firstName, lastName, age, email, role) {
    document.getElementById('user-name').textContent = firstName + ' ' + lastName;
    document.getElementById('user-email').textContent = email;
    document.getElementById('user-age').textContent = 'Age: ' + age;
    document.getElementById('user-role').textContent = 'Role: ' + (role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : 'N/A');
    document.getElementById('user-role').className = 'badge ' + (role === 'ADMIN' ? 'bg-danger' : 'bg-secondary') + ' mt-2';
  },

  initProfilePage: function() {
    let token = localStorage.getItem('user_token');
    if (!token) return;
    let user = null;
    try {
      user = Utils.parseJwt(token)?.user;
    } catch (e) {}
    if (user) {
      UserService.setUserInfo(user.firstName || '', user.lastName || '', user.age || 'N/A', user.email || '', user.role || 'N/A');
      if ((user.role || '').toUpperCase() === 'ADMIN') {
        document.getElementById('adminUserSection').style.display = '';
        UserService.loadUsersTable();
        // Button handlers
        document.getElementById('addUserBtn').onclick = function() {
          UserService.openAddUserModal();
        };
        document.getElementById('editUserBtn').onclick = function() {
          const selectedId = document.querySelector('input[name="user-select"]:checked')?.value;
          if (!selectedId) {
            toastr.warning('Please select a user to edit');
            return;
          }
          RestClient.get('users/' + selectedId, function(user) {
            UserService.openEditUserModal(user);
          }, function() {
            toastr.error('Could not fetch user data');
          });
        };
        document.getElementById('deleteUserBtn').onclick = function() {
          const selectedId = document.querySelector('input[name="user-select"]:checked')?.value;
          if (!selectedId) {
            toastr.warning('Please select a user to delete');
            return;
          }
          if (!confirm('Are you sure you want to delete this user?')) return;
          RestClient.delete('users/' + selectedId, null, function(response) {
            toastr.success('User deleted successfully');
            UserService.loadUsersTable();
          }, function(response) {
            toastr.error(response?.responseJSON?.error || response?.responseJSON?.message || 'Error deleting user');
          });
        };
        UserService.handleUserForm();
      } else {
        document.getElementById('adminUserSection').style.display = 'none';
      }
    }
  },
};

// Auto-init on page load
$(document).ready(function () {
  UserService.init(); // Call the unified init function

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

  // Always re-initialize profile logic on hash/page change (SPApp navigation)
  $(window).on('hashchange', function() {
    if (window.location.hash === '#profile') {
      setTimeout(function() { UserService.initProfilePage(); }, 200);
    }
  });
});

