let EventService = {
  init: function () {
  $(document).ready(function () {
    // Role-based UI for events page
    if (window.location.hash === '#events' || window.location.pathname.endsWith('events.html')) {
      const token = localStorage.getItem('user_token');
      let user = null;
      $("#events .btn-info, #events .btn-warning, #events .btn-danger").hide();

      try {
        user = Utils.parseJwt(token)?.user;
      } catch (e) {}
      if (user && user.role === Constants.ADMIN_ROLE) {
        $("#events .btn-info, #events .btn-warning, #events .btn-danger").show();
      }
    }
  });


    $("#addEventForm").validate({
      submitHandler: function (form) {
        var event = {
          eventName: $("#eventName").val(),
          eventDate: $("#eventDate").val(),
          description: $("#eventDescription").val(),
          budget: $("#eventBudget").val(),
          isCanceled: $("#isCanceled").is(":checked")
        };
        EventService.addEvent(event);
        form.reset();
      },
    });

    $("#editEventForm").validate({
      submitHandler: function (form) {
        var event = {
          eventName: $("#editEventName").val(),
          eventDate: $("#editEventDate").val(),
          description: $("#editEventDescription").val(),
          budget: $("#editEventBudget").val(),
          isCanceled: $("#editIsCanceled").is(":checked")
        };
        var id = $("#editEventForm").data("id");
        EventService.editEvent(id, event);
      },
    });

    EventService.getAllEvents();
  },

  openAddModal: function () {
    EventService.populateGroupDropdown('#eventGroupId');
    $('#addEventModal').modal('show');
  },

  openEditModal: function () {
    const selected = EventService.getSelectedEvent();
    if (!selected) {
      toastr.warning("Please select an event to edit");
      return;
    }
    EventService.getEventById(selected.id, function(event) {
      EventService.populateGroupDropdown('#editEventGroupId', event.groupId);
      $('#editEventModal').modal('show');
    });
  },

  populateGroupDropdown: function(selector, selectedId) {
    RestClient.get('groups', function(groups) {
      let options = groups.map(g => `<option value="${g.id}" ${selectedId == g.id ? 'selected' : ''}>${g.name}</option>`).join('');
      $(selector).html(options);
    });
  },

  closeModal: function () {
    $('#addEventModal').modal('hide');
    $('#editEventModal').modal('hide');
  },

  addEvent: function (event) {
    event.groupId = parseInt($('#eventGroupId').val());
    let budgetVal = $('#eventBudget').val();
    event.budget = budgetVal !== '' ? parseFloat(budgetVal) : undefined;
    if (event.budget === undefined) delete event.budget;
    event.isCanceled = $('#isCanceled').is(':checked');
    $.blockUI({ message: '<h3>Processing...</h3>' });
    RestClient.post('events', event, function (response) {
      toastr.success("Event added successfully");
      $.unblockUI();
      EventService.getAllEvents();
      EventService.closeModal();
    }, function (response) {
      $.unblockUI(); 
      EventService.closeModal();
      let msg = response?.responseJSON?.error || response?.responseJSON?.message || 'Error adding event';
      toastr.error(msg);
    });
  },

  getAllEvents: function () {
    // Hide both wrappers before rendering
    $('#eventsCardsWrapper').hide().empty();
    $('#eventsTableWrapper').hide();
    RestClient.get("events", function (data) {
      let role = localStorage.getItem('role') || (Utils.parseJwt(localStorage.getItem('user_token'))?.user?.role || '').toUpperCase();
      if (role === 'USER') {
        // Render cards for USER
        let cardsHtml = '';
        if (data.length === 0) {
          cardsHtml = '<div class="col"><div class="alert alert-info">No events found.</div></div>';
        } else {
          cardsHtml = data.map(event => `
            <div class="col">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${event.eventName}</h5>
                  <p class="card-text mb-1"><strong>Date:</strong> ${event.eventDate || ''}</p>
                  <p class="card-text mb-1"><strong>Description:</strong> ${event.description || ''}</p>
                  <p class="card-text mb-1"><strong>Budget:</strong> ${event.budget || ''}</p>
                  <p class="card-text mb-1"><strong>Is Canceled:</strong> ${event.isCanceled ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          `).join('');
        }
        $('#eventsCardsWrapper').html(cardsHtml).show();
        $('#eventsTableWrapper').hide();
      } else {
        // Render table for ADMIN
        let tableData = data.map(event => ({
          ...event,
          isCanceled: event.isCanceled ? 'Yes' : 'No'
        }));
        Utils.datatable(
          'eventsTable',
          [
            {
              data: null,
              title: '',
              render: function (data, type, row, meta) {
                return `<input type=\"radio\" name=\"event-select\" value=\"${row.id}\">`;
              },
              orderable: false,
              searchable: false,
              width: "20px",
            },
            { data: 'eventName', title: 'Event Name' },
            { data: 'eventDate', title: 'Date' },
            { data: 'description', title: 'Description' },
            { data: 'budget', title: 'Budget' },
            { data: 'isCanceled', title: 'Is Canceled' }
          ],
          tableData,
          10
        );
        $('#eventsTableWrapper').show();
        $('#eventsCardsWrapper').hide();
      }
    }, function (xhr, status, error) {
      $('#eventsCardsWrapper').hide();
      $('#eventsTableWrapper').hide();
      toastr.error('Error fetching events.');
    });
  },

  getEventById: function (id, cb) {
    RestClient.get('events/' + id, function (data) {
      $('#editEventName').val(data.eventName);
      $('#editEventDate').val(data.eventDate);
      $('#editEventDescription').val(data.description);
      $('#editEventBudget').val(data.budget);
      $('#editIsCanceled').prop('checked', data.isCanceled);
      $('#editEventForm').data('id', data.id);
      if(cb) cb(data);
      $.unblockUI();
    }, function (xhr, status, error) {
      console.error('Error fetching event data');
      $.unblockUI();
    });
  },

  editEvent: function (id, event) {
    event.groupId = parseInt($('#editEventGroupId').val());
    let budgetVal = $('#editEventBudget').val();
    event.budget = budgetVal !== '' ? parseFloat(budgetVal) : undefined;
    if (event.budget === undefined) delete event.budget;
    event.isCanceled = $('#editIsCanceled').is(':checked');
    $.blockUI({ message: '<h3>Processing...</h3>' });
    $.ajax({
      url: Constants.PROJECT_BASE_URL + 'events/' + id,
      type: 'PUT',
      data: JSON.stringify(event),
      contentType: 'application/json',
      processData: false,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('user_token')
      },
      success: function (data) {
        $.unblockUI();
        toastr.success("Event edited successfully");
        EventService.closeModal();
        EventService.getAllEvents();
      },
      error: function (xhr) {
        $.unblockUI(); // Always unblock on error
        let msg = xhr?.responseJSON?.error || xhr?.responseJSON?.message || 'Error editing event';
        toastr.error(msg);
      }
    });
  },

  deleteSelectedEvents: function () {
    const selected = EventService.getSelectedEvent();
    if (!selected) {
      toastr.warning("Please select an event to delete");
      return;
    }
    $('#deleteEventModal').modal('show');
    $('#delete_event_id').val(selected.id);
  },

  deleteEvent: function () {
    let eventId = $('#delete_event_id').val();
    RestClient.delete('events/' + eventId, null, function (response) {
      EventService.closeModal();
      $('.modal').modal('hide'); 
      toastr.success(response.message);
      EventService.getAllEvents();
    }, function (response) {
      EventService.closeModal();
      $('.modal').modal('hide'); 
      toastr.error(response.message);
    });
  },

  getSelectedEvent: function () {
    const selectedId = $('input[name="event-select"]:checked').val();
    if (!selectedId) return null;
    return { id: selectedId };
  }
};