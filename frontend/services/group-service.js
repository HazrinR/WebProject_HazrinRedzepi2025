let GroupService = {
  init: function () {
  $(document).ready(function () {
    if (window.location.hash === '#groups' || window.location.pathname.endsWith('groups.html')) {
      const token = localStorage.getItem('user_token');
      let user = null;

    
      $("#groups .btn-info, #groups .btn-warning, #groups .btn-danger").hide();

      try {
        user = Utils.parseJwt(token)?.user;
      } catch (e) {}

  
      if (user && user.role === Constants.ADMIN_ROLE) {
        $("#groups .btn-info, #groups .btn-warning, #groups .btn-danger").show();
      }
    }
  });

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
      $.unblockUI(); 
      GroupService.closeModal();
      toastr.error(response.message);
    });
  },

  getAllGroups: function () {
    // Hide both wrappers before rendering
    $('#groupsCardsWrapper').hide().empty();
    $('#groupsTableWrapper').hide();
    RestClient.get("groups", function (data) {
      let role = localStorage.getItem('role') || (Utils.parseJwt(localStorage.getItem('user_token'))?.user?.role || '').toUpperCase();
      if (role === 'USER') {
        // Render cards for USER
        let cardsHtml = '';
        if (data.length === 0) {
          cardsHtml = '<div class="col"><div class="alert alert-info">No groups found.</div></div>';
        } else {
          cardsHtml = data.map(group => `
            <div class="col">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${group.name}</h5>
                  <p class="card-text mb-1"><strong>Description:</strong> ${group.description}</p>
                </div>
              </div>
            </div>
          `).join('');
        }
        $('#groupsCardsWrapper').html(cardsHtml).show();
        $('#groupsTableWrapper').hide();
      } else {
        // Render table for ADMIN
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
        $('#groupsTableWrapper').show();
        $('#groupsCardsWrapper').hide();
      }
    }, function (xhr, status, error) {
      $('#groupsCardsWrapper').hide();
      $('#groupsTableWrapper').hide();
      toastr.error('Error fetching groups.');
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
        $.unblockUI(); 
        let msg = xhr?.responseJSON?.error || 'Error editing group';
        toastr.error(msg);
      }
    });
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
      $('.modal').modal('hide'); 
      toastr.success(response.message);
      GroupService.getAllGroups();
    }, function (response) {
      GroupService.closeModal();
      $('.modal').modal('hide'); 
      toastr.error(response.message);
    });
  },

  getSelectedGroup: function () {
    const selectedId = $('input[name="group-select"]:checked').val();
    if (!selectedId) return null;
    return { id: selectedId };
  }
};
