$(
  $(document).ready(function () {
    const weekChart = $("#weekchart");
    if (weekChart.length) {
      new Chart(weekChart, {
        type: "line",
        data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [
            {
              label: "# of Votes",
              data: [12, 19, 3, 5, 2, 3],
              borderWidth: 1,
            },
          ],
        },
      });
    }

    const bookChart = $("#bookchart");
    if (bookChart.length) {
      new Chart(bookChart, {
        type: "line",
        data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [
            {
              label: "# of Votes",
              data: [12, 19, 3, 5, 2, 3],
              borderWidth: 1,
            },
          ],
        },
      });
    }
    createDataTable("#myTable");
    createDataTable("#list");
    createDataTable("#classTable");

    function createDataTable(tableId) {
      const dataTable = $(tableId);
      if (dataTable.length) {
        dataTable.DataTable({
          responsive: true,
        });
      }
    }

    const forms = $(".needs-validation");
    Array.from(forms).forEach((form) => {
      form.addEventListener(
        "submit",
        (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add("was-validated");
        },
        false
      );
    });

    const profileEditBtn = $("#profileEditBtn");

    profileEditBtn.on("click", function () {
      if (profileEditBtn[0].innerHTML === "Edit") {
        profileEditBtn[0].innerHTML = "Cancel";
        $("#profileEditForm input, #updateProfile").prop("disabled", false);
      } else {
        profileEditBtn[0].innerHTML = "Edit";
        $("#profileEditForm input, #updateProfile").prop("disabled", true);
      }
    });
  })
);
