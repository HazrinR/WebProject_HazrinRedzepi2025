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
    },
    



};



