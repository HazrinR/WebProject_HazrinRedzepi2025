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

    // Add Wish form validation
    $("#addWishForm").validate({
      rules: {
        wishName: {
          required: true,
          minlength: 2,
          maxlength: 50
        },
        wishDescription: {
          maxlength: 200
        }
      },
      messages: {
        wishName: {
          required: "Wish name is required",
          minlength: "Wish name must be at least 2 characters",
          maxlength: "Wish name cannot exceed 50 characters"
        },
        wishDescription: {
          maxlength: "Description cannot exceed 200 characters"
        }
      },
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

    // Edit Wish form validation
    $("#editWishForm").validate({
      rules: {
        wishName: {
          required: true,
          minlength: 2,
          maxlength: 50
        },
        wishDescription: {
          maxlength: 200
        }
      },
      messages: {
        wishName: {
          required: "Wish name is required",
          minlength: "Wish name must be at least 2 characters",
          maxlength: "Wish name cannot exceed 50 characters"
        },
        wishDescription: {
          maxlength: "Description cannot exceed 200 characters"
        }
      },
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

    WishService.populateEventDropdown('#wishEventId');
    WishService.populateGroupDropdown('#wishGroupId');
    WishService.populateEventDropdown('#editWishEventId');
    WishService.populateGroupDropdown('#editWishGroupId');

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
    // Only open modal if selected (done in getWishById)
    WishService.getWishById(selected.id);
  },

  closeModal: function () {
    $('#addWishModal').modal('hide');
    $('#editWishModal').modal('hide');
  },

  addWish: function (wish) {
    wish.wishName = (wish.wishName || '').trim();
    wish.description = (wish.description || '').trim();
    if (!wish.wishName || wish.wishName.length < 2 || wish.wishName.length > 50) {
      toastr.error('Wish name is required (2-50 characters).');
      return;
    }
    if (wish.description && wish.description.length > 200) {
      toastr.error('Description can be max 200 characters.');
      return;
    }
    $.blockUI({ message: '<h3>Processing...</h3>' });
    RestClient.post('wishes', wish, function (response) {
      toastr.success("Wish added successfully");
      $.unblockUI();
      WishService.getAllWishes();
      WishService.closeModal();
    }, function (response) {
      $.unblockUI(); // Always unblock on error
      WishService.closeModal();
      let msg = response?.responseJSON?.error || response?.responseJSON?.message || 'Error adding wish';
      toastr.error(msg);
    });
  },

  getAllWishes: function () {
    $('#wishlistCardsWrapper').hide().empty();
    $('#wishlistTableWrapper').hide();
    RestClient.get("wishes", function (data) {
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
          let role = localStorage.getItem('role') || (Utils.parseJwt(localStorage.getItem('user_token'))?.user?.role || '').toUpperCase();
          if (role === 'USER') {
            // Render cards for USER
            let cardsHtml = '';
            if (tableData.length === 0) {
              cardsHtml = '<div class="col"><div class="alert alert-info">No wishes found.</div></div>';
            } else {
              cardsHtml = tableData.map(wish => `
                <div class="col">
                  <div class="card h-100 shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title">${wish.wishName}</h5>
                      <p class="card-text mb-1"><strong>Description:</strong> ${wish.description}</p>
                      <p class="card-text mb-1"><strong>Event:</strong> ${wish.eventName}</p>
                      <p class="card-text mb-1"><strong>Group:</strong> ${wish.groupName}</p>
                      <p class="card-text mb-1"><strong>Created:</strong> ${wish.createdAt ? wish.createdAt.split('T')[0] : ''}</p>
                      <p class="card-text mb-1"><strong>Updated:</strong> ${wish.updatedAt ? wish.updatedAt.split('T')[0] : ''}</p>
                    </div>
                  </div>
                </div>
              `).join('');
            }
            $('#wishlistCardsWrapper').html(cardsHtml).show();
            $('#wishlistTableWrapper').hide();
          } else {
            // Render table for ADMIN
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
            $('#wishlistTableWrapper').show();
            $('#wishlistCardsWrapper').hide();
          }
        });
      });
    }, function (xhr, status, error) {
      $('#wishlistCardsWrapper').hide();
      $('#wishlistTableWrapper').hide();
      toastr.error('Error fetching wishes.');
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
      $('#editWishModal').modal('show'); // Modal opens only here
    }, function (xhr, status, error) {
      console.error('Error fetching wish data');
      $.unblockUI();
    });
  },

  editWish: function (id, wish) {
    wish.wishName = (wish.wishName || '').trim();
    wish.description = (wish.description || '').trim();
    if (!wish.wishName || wish.wishName.length < 2 || wish.wishName.length > 50) {
      toastr.error('Wish name is required (2-50 characters).');
      return;
    }
    if (wish.description && wish.description.length > 200) {
      toastr.error('Description can be max 200 characters.');
      return;
    }
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
        $.unblockUI(); // Always unblock on error
        let msg = xhr?.responseJSON?.error || xhr?.responseJSON?.message || 'Error editing wish';
        toastr.error(msg);
      }
    });
  },

  deleteSelectedWishes: function () {
    const selected = WishService.getSelectedWish();
    if (!selected) {
      toastr.warning("Please select a wish to delete");
      return;
    }
    // Only open modal if selected
    $('#deleteWishModal').modal('show');
    $('#delete_wish_id').val(selected.id);
  },

  deleteWish: function () {
    let wishId = $('#delete_wish_id').val();
    RestClient.delete('wishes/' + wishId, null, function (response) {
      WishService.closeModal();
      $('.modal').modal('hide'); 
      toastr.success(response.message);
      WishService.getAllWishes();
    }, function (response) {
      WishService.closeModal();
      $('.modal').modal('hide');
      toastr.error(response.message);
    });
  },

  getSelectedWish: function () {
    const selectedId = $('input[name="wish-select"]:checked').val();
    if (!selectedId) return null;
    return { id: selectedId };
  }
};
