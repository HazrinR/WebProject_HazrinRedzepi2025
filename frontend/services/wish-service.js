let WishService = {
  init: function () {
    $(document).ready(function () {
      // Role-based UI for wishlist page
      if (window.location.hash === '#wishlist' || window.location.pathname.endsWith('wishlist.html')) {
        const token = localStorage.getItem('user_token');
        let user = null;
        $("#wishlist .btn-info, #wishlist .btn-warning, #wishlist .btn-danger").hide();
        try {
          user = Utils.parseJwt(token)?.user;
        } catch (e) {}
        if (user && user.role === Constants.ADMIN_ROLE) {
          $("#wishlist .btn-info, #wishlist .btn-warning, #wishlist .btn-danger").show();
        }
      }
    });

    WishService.populateEventDropdown('#wishEventId');
    WishService.populateGroupDropdown('#wishGroupId');
    WishService.populateEventDropdown('#editWishEventId');
    WishService.populateGroupDropdown('#editWishGroupId');

    $("#addWishForm").validate({
      submitHandler: function (form) {
        var wish = {
          wishName: $("#wishName").val(),
          description: $("#wishDescription").val(),
          eventId: parseInt($('#wishEventId').val()),
          groupId: parseInt($('#wishGroupId').val())
        };
        WishService.addWish(wish);
        form.reset();
      },
    });

    $("#editWishForm").validate({
      submitHandler: function (form) {
        var wish = {
          wishName: $("#editWishName").val(),
          description: $("#editWishDescription").val(),
          eventId: parseInt($('#editWishEventId').val()),
          groupId: parseInt($('#editWishGroupId').val())
        };
        var id = $("#editWishForm").data("id");
        WishService.editWish(id, wish);
      },
    });

    WishService.getAllWishes();
  },

  populateEventDropdown: function(selector, selectedId) {
    RestClient.get('events', function(events) {
      let options = events.map(e => `<option value="${e.id}" ${selectedId == e.id ? 'selected' : ''}>${e.eventName}</option>`).join('');
      $(selector).html(options);
    });
  },

  populateGroupDropdown: function(selector, selectedId) {
    RestClient.get('groups', function(groups) {
      let options = groups.map(g => `<option value="${g.id}" ${selectedId == g.id ? 'selected' : ''}>${g.name}</option>`).join('');
      $(selector).html(options);
    });
  },

  openAddModal: function () {
    $('#addWishModal').modal('show');
  },

  openEditModal: function () {
    const selected = WishService.getSelectedWish();
    if (!selected) {
      toastr.warning("Please select a wish to edit");
      return;
    }
    WishService.getWishById(selected.id);
    $('#editWishModal').modal('show');
  },

  closeModal: function () {
    $('#addWishModal').modal('hide');
    $('#editWishModal').modal('hide');
  },

  addWish: function (wish) {
    $.blockUI({ message: '<h3>Processing...</h3>' });
    RestClient.post('wishes', wish, function (response) {
      toastr.success("Wish added successfully");
      $.unblockUI();
      WishService.getAllWishes();
      WishService.closeModal();
    }, function (response) {
      WishService.closeModal();
      let msg = response?.responseJSON?.error || response?.responseJSON?.message || 'Error adding wish';
      toastr.error(msg);
    });
  },

  getAllWishes: function () {
    RestClient.get("wishes", function (data) {
      // Fetch event and group names for display
      RestClient.get('events', function(events) {
        RestClient.get('groups', function(groups) {
          let eventMap = {};
          let groupMap = {};
          events.forEach(e => eventMap[e.id] = e.eventName);
          groups.forEach(g => groupMap[g.id] = g.name);
          let tableData = data.map(wish => ({
            ...wish,
            eventName: eventMap[wish.eventId] || '',
            groupName: groupMap[wish.groupId] || ''
          }));
          Utils.datatable(
            'wishlistTable',
            [
              {
                data: null,
                title: '',
                render: function (data, type, row, meta) {
                  return `<input type=\"radio\" name=\"wish-select\" value=\"${row.id}\">`;
                },
                orderable: false,
                searchable: false,
                width: "20px",
              },
              { data: 'wishName', title: 'Wish Name' },
              { data: 'description', title: 'Description' },
              { data: 'eventName', title: 'Event' },
              { data: 'groupName', title: 'Group' },
              { data: 'createdAt', title: 'Created' },
              { data: 'updatedAt', title: 'Updated' }
            ],
            tableData,
            10
          );
        });
      });
    }, function (xhr, status, error) {
      console.error('Error fetching wishes:', error);
    });
  },

  getWishById: function (id) {
    RestClient.get('wishes/' + id, function (data) {
      $('#editWishName').val(data.wishName);
      $('#editWishDescription').val(data.description);
      $('#editWishForm').data('id', data.id);
      $('#editWishEventId').val(data.eventId);
      $('#editWishGroupId').val(data.groupId);
      $.unblockUI();
    }, function (xhr, status, error) {
      console.error('Error fetching wish data');
      $.unblockUI();
    });
  },

  editWish: function (id, wish) {
    $.blockUI({ message: '<h3>Processing...</h3>' });
    $.ajax({
      url: Constants.PROJECT_BASE_URL + 'wishes/' + id,
      type: 'PUT',
      data: JSON.stringify(wish),
      contentType: 'application/json',
      processData: false,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('user_token')
      },
      success: function (data) {
        $.unblockUI();
        toastr.success("Wish edited successfully");
        WishService.closeModal();
        WishService.getAllWishes();
      },
      error: function (xhr) {
        let msg = xhr?.responseJSON?.error || xhr?.responseJSON?.message || 'Error editing wish';
        toastr.error(msg);
        $.unblockUI();
      }
    });
  },

  deleteSelectedWishes: function () {
    const selected = WishService.getSelectedWish();
    if (!selected) {
      toastr.warning("Please select a wish to delete");
      return;
    }
    $('#deleteWishModal').modal('show');
    $('#delete_wish_id').val(selected.id);
  },

  deleteWish: function () {
    let wishId = $('#delete_wish_id').val();
    RestClient.delete('wishes/' + wishId, null, function (response) {
      WishService.closeModal();
      toastr.success(response.message);
      WishService.getAllWishes();
    }, function (response) {
      WishService.closeModal();
      toastr.error(response.message);
    });
  },

  getSelectedWish: function () {
    const selectedId = $('input[name="wish-select"]:checked').val();
    if (!selectedId) return null;
    return { id: selectedId };
  }
};
