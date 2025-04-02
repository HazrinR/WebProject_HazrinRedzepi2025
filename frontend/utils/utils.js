var Utils = {
    init_spapp: () => {
        var app = $.spapp({
            defaultView: "#home",
            templateDir: "./pages/"
        });

        app.route({ view: "register", load: "register.html" });
        app.route({ view: "login", load: "login.html" });
        app.route({ view: "home", load: "home.html" });
        app.route({ view: "wishlist", load: "wishlist.html", onCreate: Utils.loadWishesData });
        app.route({ view: "groups", load: "groups.html", onCreate: Utils.loadGroupsData });
        app.route({ view: "events", load: "events.html", onCreate: Utils.loadEventsData});
        app.route({ view: "profile", load: "profile.html" });

        app.run();
    },

    loadGroupsData: () => {
        console.log("Loading groups data...");

        $.ajax({
            url: "data/groups.json",
            dataType: "json",
            success: function (data) {
                let tableBody = $("#groupsTable tbody");
                tableBody.empty();

                data.groups.forEach(group => {
                    let row = `
                        <tr>
                            <td><input type="checkbox" class="rowCheckbox" data-id="${group.id}"></td>
                            <td>${group.id}</td>
                            <td>${group.name}</td>
                            <td>${group.description}</td>
                            <td>${group.createdBy}</td>
                            <td>${group.createdAt}</td>
                            <td>${group.updatedAt}</td>
                        </tr>
                    `;
                    tableBody.append(row);
                });

                if ($.fn.DataTable.isDataTable("#groupsTable")) {
                    $("#groupsTable").DataTable().clear().destroy();
                }
                $("#groupsTable").DataTable();
            },
            error: function (xhr, status, error) {
                console.error("Failed to load groups:", error);
            }
        });

        // select all funkcionalnost
        $("#selectAll").on("change", function () {
            $(".rowCheckbox").prop("checked", this.checked);
        });

        // button delete za sada samo prikazuje koje su selektovane
        $("#deleteGroupBtn").on("click", function () {
            let selectedGroups = $(".rowCheckbox:checked").map(function () {
                return $(this).data("id");
            }).get();

            if (selectedGroups.length > 0) {
                alert("Selected IDs for deletion: " + selectedGroups.join(", "));
            } else {
                alert("No groups selected.");
            }
        });

        // button Edit za popunjavanje modala sa podacima selektovane grupe
        $("#editGroupBtn").on("click", function () {
            let selectedGroups = $(".rowCheckbox:checked").map(function () {
                return $(this).data("id");
            }).get();

            if (selectedGroups.length === 1) {
                let groupId = selectedGroups[0];
                // Fetch the group data (replace this with an API call if needed)
                let groupRow = $(`#groupsTable tbody tr input[data-id="${groupId}"]`).closest("tr");
                let groupName = groupRow.find("td:nth-child(3)").text();
                let groupDescription = groupRow.find("td:nth-child(4)").text();

                // Populate the modal fields
                $("#editGroupName").val(groupName);
                $("#editGroupDescription").val(groupDescription);

                // Save the group ID for submission
                $("#editGroupForm").data("groupId", groupId);
            } else if (selectedGroups.length === 0) {
                alert("Please select a group to edit.");
            } else {
                alert("Please select only one group to edit.");
            }
        });

        $("#editGroupForm").on("submit", function (e) {
            e.preventDefault();

            let groupId = $(this).data("groupId");
            let updatedGroup = {
                name: $("#editGroupName").val(),
                description: $("#editGroupDescription").val()
            };

            // Send the updated data to the backend (replace with an API call)
            console.log("Updating group ID:", groupId, "with data:", updatedGroup);

            // Close the modal
            $("#editGroupModal").modal("hide");

            // Update the table row (replace this with a table refresh if needed)
            let groupRow = $(`#groupsTable tbody tr input[data-id="${groupId}"]`).closest("tr");
            groupRow.find("td:nth-child(3)").text(updatedGroup.name);
            groupRow.find("td:nth-child(4)").text(updatedGroup.description);

            alert("Group updated successfully!");
        });
    },

    loadWishesData: () => {
        console.log("Loading wishes data...");

        $.ajax({
            url: "data/wishes.json", // ovo je privremeni json koji cu kasnije zamijeniti sa backend api pozivom
            dataType: "json",
            success: function (data) {
                let tableBody = $("#wishlistTable tbody");
                tableBody.empty();

                data.wishes.forEach(wish => {
                    let row = `
                        <tr>
                            <td><input type="checkbox" class="rowCheckbox" data-id="${wish.id}"></td>
                            <td>${wish.id}</td>
                            <td>${wish.wishName}</td>
                            <td>${wish.description}</td>
                            <td>${wish.userId}</td>
                            <td>${wish.eventId}</td>
                            <td>${wish.groupId}</td>
                            <td>${wish.createdAt}</td>
                            <td>${wish.updatedAt}</td>
                        </tr>
                    `;
                    tableBody.append(row);
                });

                if ($.fn.DataTable.isDataTable("#wishlistTable")) {
                    $("#wishlistTable").DataTable().clear().destroy();
                }
                $("#wishlistTable").DataTable();
            },
            error: function (xhr, status, error) {
                console.error("Failed to load wishes:", error);
            }
        });

        // select sve funkcionalnost
        $("#selectAllWishes").on("change", function () {
            $(".rowCheckbox").prop("checked", this.checked);
        });

        // button Delete za sada samo prikazuje koje su selektovane
        $("#deleteWishBtn").on("click", function () {
            let selectedWishes = $(".rowCheckbox:checked").map(function () {
                return $(this).data("id");
            }).get();

            if (selectedWishes.length > 0) {
                alert("Selected IDs for deletion: " + selectedWishes.join(", "));
            } else {
                alert("No wishes selected.");
            }
        });

        // button Edit za popunjavanje modala sa podacima selektovane želje
        $("#editWishBtn").on("click", function () {
            let selectedWishes = $(".rowCheckbox:checked").map(function () {
                return $(this).data("id");
            }).get();

            if (selectedWishes.length === 1) {
                let wishId = selectedWishes[0];
                // Fetch the wish data (replace this with an API call if needed)
                let wishRow = $(`#wishlistTable tbody tr input[data-id="${wishId}"]`).closest("tr");
                let wishName = wishRow.find("td:nth-child(3)").text();
                let wishDescription = wishRow.find("td:nth-child(4)").text();

                // Populate the modal fields
                $("#editWishName").val(wishName);
                $("#editWishDescription").val(wishDescription);

                // Save the wish ID for submission
                $("#editWishForm").data("wishId", wishId);
            } else if (selectedWishes.length === 0) {
                alert("Please select a wish to edit.");
            } else {
                alert("Please select only one wish to edit.");
            }
        });

        $("#editWishForm").on("submit", function (e) {
            e.preventDefault();

            let wishId = $(this).data("wishId");
            let updatedWish = {
                wishName: $("#editWishName").val(),
                description: $("#editWishDescription").val()
            };

            // Send the updated data to the backend (replace with an API call)
            console.log("Updating wish ID:", wishId, "with data:", updatedWish);

            // Close the modal
            $("#editWishModal").modal("hide");

            // Update the table row (replace this with a table refresh if needed)
            let wishRow = $(`#wishlistTable tbody tr input[data-id="${wishId}"]`).closest("tr");
            wishRow.find("td:nth-child(3)").text(updatedWish.wishName);
            wishRow.find("td:nth-child(4)").text(updatedWish.description);

            alert("Wish updated successfully!");
        });
    },

    loadEventsData: () => {
        console.log("Loading events data...");
    
        $.ajax({
            url: "data/events.json", // Privremeni JSON fajl koji će se kasnije zamijeniti backend API pozivom
            dataType: "json",
            success: function (data) {
                let tableBody = $("#eventsTable tbody");
                tableBody.empty();
    
                data.events.forEach(event => {
                    let row = `
                        <tr>
                            <td><input type="checkbox" class="rowCheckbox" data-id="${event.id}"></td>
                            <td>${event.id}</td>
                            <td>${event.eventName}</td>
                            <td>${event.eventDate}</td>
                            <td>${event.description}</td>
                            <td>${event.budget} $</td>
                            <td>${event.isCanceled ? "On" : "Off"}</td>
                            <td>${event.createdAt}</td>
                            <td>${event.updatedAt}</td>
                        </tr>
                    `;
                    tableBody.append(row);
                });
    
                if ($.fn.DataTable.isDataTable("#eventsTable")) {
                    $("#eventsTable").DataTable().clear().destroy();
                }
                $("#eventsTable").DataTable();
            },
            error: function (xhr, status, error) {
                console.error("Failed to load events:", error);
            }
        });
    
        // select all funkcionalnost
        $("#selectAllEvents").on("change", function () {
            $(".rowCheckbox").prop("checked", this.checked);
        });
    
        // button delete koji prikazuje selektovane događaje
        $("#deleteEventBtn").on("click", function () {
            let selectedEvents = $(".rowCheckbox:checked").map(function () {
                return $(this).data("id");
            }).get();
    
            if (selectedEvents.length > 0) {
                alert("Selected Event IDs for deletion: " + selectedEvents.join(", "));
            } else {
                alert("No events selected.");
            }
        });

        // button Edit za popunjavanje modala sa podacima selektovanog događaja
        $("#editEventBtn").on("click", function () {
            let selectedEvents = $(".rowCheckbox:checked").map(function () {
                return $(this).data("id");
            }).get();

            if (selectedEvents.length === 1) {
                let eventId = selectedEvents[0];
                // Fetch the event data (replace this with an API call if needed)
                let eventRow = $(`#eventsTable tbody tr input[data-id="${eventId}"]`).closest("tr");
                let eventName = eventRow.find("td:nth-child(3)").text();
                let eventDate = eventRow.find("td:nth-child(4)").text();
                let eventDescription = eventRow.find("td:nth-child(5)").text();
                let eventBudget = eventRow.find("td:nth-child(6)").text().replace(" $", "");
                let isCanceled = eventRow.find("td:nth-child(7)").text() === "On";

                // Populate the modal fields
                $("#editEventName").val(eventName);
                $("#editEventDate").val(eventDate);
                $("#editEventDescription").val(eventDescription);
                $("#editEventBudget").val(eventBudget);
                $("#editIsCanceled").prop("checked", isCanceled);

                // Save the event ID for submission
                $("#editEventForm").data("eventId", eventId);
            } else if (selectedEvents.length === 0) {
                alert("Please select an event to edit.");
            } else {
                alert("Please select only one event to edit.");
            }
        });

        $("#editEventForm").on("submit", function (e) {
            e.preventDefault();

            let eventId = $(this).data("eventId");
            let updatedEvent = {
                eventName: $("#editEventName").val(),
                eventDate: $("#editEventDate").val(),
                description: $("#editEventDescription").val(),
                budget: $("#editEventBudget").val(),
                isCanceled: $("#editIsCanceled").is(":checked")
            };

            // Send the updated data to the backend (replace with an API call)
            console.log("Updating event ID:", eventId, "with data:", updatedEvent);

            // Close the modal
            $("#editEventModal").modal("hide");

            // Update the table row (replace this with a table refresh if needed)
            let eventRow = $(`#eventsTable tbody tr input[data-id="${eventId}"]`).closest("tr");
            eventRow.find("td:nth-child(3)").text(updatedEvent.eventName);
            eventRow.find("td:nth-child(4)").text(updatedEvent.eventDate);
            eventRow.find("td:nth-child(5)").text(updatedEvent.description);
            eventRow.find("td:nth-child(6)").text(`${updatedEvent.budget} $`);
            eventRow.find("td:nth-child(7)").text(updatedEvent.isCanceled ? "On" : "Off");

            alert("Event updated successfully!");
        });
    },
};



