$(
    $(document).ready(function () {
        const bookIdfield = $("#book-id").clone().removeClass("d-none");
        $("#section-select").on("change", async function (e) {
            try {
                const sectionId = $(this).val();
                const response = await fetch("/section-students", {
                    method: "POST",
                    body: JSON.stringify({ sectionId }),
                    headers: new Headers({
                        'Content-Type': 'application/json; charset=UTF-8'
                    })
                });
                if (!response.ok) {
                    //TODO: DISPLAY SOMETHING WEN WRONG 
                }
                const serverData = await response.json();
                const students = serverData.data.students;

                const selectElement = $("<select>").attr({
                    id: "student-select",
                    class: "form-select rounded-0 shadow",
                    name: "studentId",
                    required: true
                });
                selectElement.append("<option selected disabled value=''>Select Student</option>");
                $.each(students, function (_, student) {
                    const option = $("<option>").val(student._id).text(student.name);
                    selectElement.append(option);
                });

                const divElement = $("<div>").addClass("invalid-feedback").text("Please select student.");
                const labelElement = $("<label>").attr("for", "student").text("Student");

                $("#select-student").empty().append(selectElement, divElement, labelElement);
                $("#book-id").removeClass("d-none");
                $("#issue-submit").removeClass("d-none");
                $("#btn-group").removeClass("d-none");
            } catch (error) {
                //TODO: DISPLAY SOMETHING WEN WRONG
            }
        });
        $("#add-field").on("click", function () {
            // const bookIdfield = $("#book-id").clone();
            // bookIdfield.children("input[name='uniqueId']").val("");
            console.log(bookIdfield);
            $("#book-id-inputs").append(bookIdfield);
        });
        $("#remove-field").on("click", function () {
            const bookIdInputs = $("#book-id").parent().children();
            if (bookIdInputs.length > 1) {
                bookIdInputs.last().remove();
            }
        });
        $("#book-id-inputs").on("change", "input[name = 'uniqueId']", async function () {
            try {
                const uniqueId = $(this).val();
                const response = await fetch("/check-book-issued", {
                    method: "POST",
                    body: JSON.stringify({ uniqueId }),
                    headers: new Headers({
                        'Content-Type': 'application/json; charset=UTF-8'
                    })
                });
                const responseData = await response.json();
                const data = responseData.data;
                if (data.alert) {
                    //TODO: SHOW SOEMTHING LIKE READ BOX
                    alert("book is already issued");
                    console.log($(this));
                    $(this).addClass("is-invalid");
                    $(this).siblings(".invalid-feedback").text(data.title);
                }
                else {
                    $(this).addClass("is-valid");
                }
            } catch (error) {
                console.log(error);
                //TODO:SHOW SOEMTHING WENT WRONG
            }
        });

        $("#issue-books-form").on("submit", async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const jsonData = {};
            for (const [key, value] of formData.entries()) {
                if (jsonData[key]) {
                    jsonData[key].push(value);
                } else {
                    jsonData[key] = [value];
                }
            }
            try {
                const response = await fetch("/issue-book", {
                    method: "POST",
                    body: JSON.stringify(jsonData),
                    headers: new Headers({
                        'Content-Type': 'application/json; charset=UTF-8'
                    })
                });
                const responseData = await response.json();
                console.log(responseData);
            } catch (error) {

            }
        });
    })
);