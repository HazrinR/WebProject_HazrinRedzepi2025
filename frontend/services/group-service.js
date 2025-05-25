let GroupService = {
  init: function () {
    // Role-based UI for groups page
    if (window.location.hash === '#groups' || window.location.pathname.endsWith('groups.html')) {
      const token = localStorage.getItem('user_token');
      let user = null;
      try {
        user = Utils.parseJwt(token)?.user;
      } catch (e) {}
      // Hide all group action buttons by default
      setTimeout(function() {
        if (!user) return;
        // Admin can see all buttons
        if (user.role === Constants.ADMIN_ROLE) {
          $("#groups .btn-info, #groups .btn-warning, #groups .btn-danger").show();
        } else {
          $("#groups .btn-info, #groups .btn-warning, #groups .btn-danger").hide();
        }
      }, 300);
    }

    $("#addGroupForm").validate({
      submitHandler: function (form) {
        var group = Object.fromEntries(new FormData(form).entries());
        GroupService.addGroup(group);
        form.reset();
      },
    });

    $("#editGroupForm").validate({
      submitHandler: function (form) {
        var group = Object.fromEntries(new FormData(form).entries());
        GroupService.editGroup(group);
      },
    });

    GroupService.getAllGroups();
  },

  openAddModal: function () {
    $('#addGroupModal').modal('show');
  },

  openEditModal: function () {
    const selected = GroupService.getSelectedGroup();
    if (!selected) {
      toastr.warning("Please select a group to edit");
      return;
    }

    GroupService.getGroupById(selected.id);
    $('#editGroupModal').modal('show');
  },

  closeModal: function () {
    $('#addGroupModal').modal('hide');
    $('#editGroupModal').modal('hide');
  },

  addGroup: function (group) {
    $.blockUI({ message: '<h3>Processing...</h3>' });
    RestClient.post('groups', group, function (response) {
      toastr.success("Group added successfully");
      $.unblockUI();
      GroupService.getAllGroups();
      GroupService.closeModal();
    }, function (response) {
      GroupService.closeModal();
      toastr.error(response.message);
    });
  },

  getAllGroups: function () {
    RestClient.get("groups", function (data) {
      Utils.datatable(
        'groups-table',
        [
          {
            data: null,
            title: '',
            render: function (data, type, row, meta) {
              return `<input type="radio" name="group-select" value="${row.id}">`;
            },
            orderable: false,
            searchable: false,
            width: "20px",
          },
          { data: 'name', title: 'Group Name' },
          { data: 'description', title: 'Description' }
        ],
        data,
        10
      );
    }, function (xhr, status, error) {
      console.error('Error fetching groups:', error);
    });
  },

  getGroupById: function (id) {
    RestClient.get('groups/' + id, function (data) {
      $('#edit_group_id').val(data.id);
      $('#edit_group_name').val(data.name);
      $('#edit_group_description').val(data.description);
      $.unblockUI();
    }, function (xhr, status, error) {
      console.error('Error fetching group data');
      $.unblockUI();
    });
  },

  editGroup: function (group) {
    $.blockUI({ message: '<h3>Processing...</h3>' });
    $.ajax({
      url: Constants.PROJECT_BASE_URL + 'groups/' + group.id,
      type: 'PUT',
      data: JSON.stringify({
        name: group.name,
        description: group.description
      }),
      contentType: 'application/json',
      processData: false,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('user_token')
      },
      success: function (data) {
        $.unblockUI();
        toastr.success("Group edited successfully");
        GroupService.closeModal();
        GroupService.getAllGroups();
      },
      error: function (xhr) {
        let msg = xhr?.responseJSON?.error || 'Error editing group';
        toastr.error(msg);
        $.unblockUI();
      }
    });
  },

  openConfirmationDialog: function (group) {
    group = JSON.parse(group);
    $("#deleteStudentModal").modal("show"); // možeš napraviti svoj delete modal za grupe ili koristi isti modal sa drugim id-jem
    $("#delete-student-body").html("Do you want to delete group: " + group.name + "?");
    $("#delete_student_id").val(group.id);
  },

  deleteSelectedGroups: function () {
    let selected = GroupService.getSelectedGroup();
    if (!selected) {
      toastr.warning("Please select a group to delete");
      return;
    }
    $("#deleteGroupModal").modal("show");
    $("#delete-group-body").html("Do you want to delete group ?");
    $("#delete_group_id").val(selected.id);
  },

  deleteGroup: function () {
    let groupId = $("#delete_group_id").val();
    RestClient.delete('groups/' + groupId, null, function (response) {
      GroupService.closeModal();
      toastr.success(response.message);
      GroupService.getAllGroups();
    }, function (response) {
      GroupService.closeModal();
      toastr.error(response.message);
    });
  },

  getSelectedGroup: function () {
    const selectedId = $('input[name="group-select"]:checked').val();
    if (!selectedId) return null;
    return { id: selectedId };
  }
};
