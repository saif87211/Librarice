$(
    $(document).ready(function () {
        const bookIdfield = $("#book-id").clone().removeClass("d-none");
        //STUDENT-SECTION
        $("#section-select").on("change", async function (e) {
            try {
                const sectionId = $(this).val();
                const response = await fetch("/transaction/section-students", {
                    method: "POST",
                    body: JSON.stringify({ sectionId }),
                    headers: new Headers({
                        'Content-Type': 'application/json; charset=UTF-8'
                    })
                });
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
                if (error) {
                    Swal.fire({
                        title: "Something went wrong",
                        text: "Please refresh the page or try agian later.",
                        icon: "error"
                    });
                }
            }
        });

        //ADD BOOK ID FIELD & REMOVE BOOK ID FIELD
        $("#add-field").on("click", function () {
            bookIdfield.clone().appendTo("#book-id-inputs");
        });
        $("#remove-field").on("click", function () {
            const bookIdInputs = $("#book-id").parent().children();
            if (bookIdInputs.length > 1) {
                bookIdInputs.last().remove();
            }
        });

        //CHECK BOOK IS ISSUED OR NOT
        // $("#book-id-inputs").on("change", "input[name = 'uniqueId']", async function () {
        //     const uniqueId = $(this).val();
        //     const otherInputs = $('input[type="uniqueId"]').not(this);
        //     otherInputs.each(function () {
        //         if ($(this).val() === uniqueId) {
        //             $(this).addClass('is-invalid');
        //             $(this).val(''); // Clear the duplicate value
        //             $(this).siblings(".invalid-feedback").text('Duplicate value entered.');
        //         } else {
        //             $(this).removeClass('is-invalid')
        //             $(this).siblings(".invalid-feedback").text("");
        //         }
        //     });
        //     try {
        //         const response = await fetch("/transaction/check-book-issued", {
        //             method: "POST",
        //             body: JSON.stringify({ uniqueId }),
        //             headers: new Headers({
        //                 'Content-Type': 'application/json; charset=UTF-8'
        //             })
        //         });
        //         const responseData = await response.json();
        //         const data = responseData.data;
        //         if (data.alert) {
        //             //TODO: SHOW SOEMTHING LIKE READ BOX
        //             alert("book is already issued");
        //             console.log($(this));
        //             $(this).addClass("is-invalid");
        //             $(this).siblings(".invalid-feedback").text(data.title);
        //         }
        //         else {
        //             $(this).removClass("is-invalid").addClass("is-valid");
        //         }
        //     } catch (error) {
        //         console.log(error);
        //         //TODO:SHOW SOEMTHING WENT WRONG
        //     }
        // });

        //HANDLING FORM SUBMISSION
        $("#issue-books-form").on("submit", async function (e) {
            e.preventDefault();
            if (this.checkValidity() === false) {
                return;
            }
            const inputValues = [];
            const duplicateValues = [];
            const bookIdInputs = $("input[name='uniqueId']");
            bookIdInputs.each(function () {
                const value = $(this).val().trim();
                if (inputValues.includes(value)) {
                    duplicateValues.push(value);
                    $(this).val("");
                } else {
                    inputValues.push(value);
                }
            });
            if (duplicateValues.length > 0) {
                Swal.fire({
                    title: "Duplicate values found",
                    text: duplicateValues.join(', '),
                    icon: "error"
                });
                return;
            }
            const formData = new FormData(this);
            const jsonData = {};
            for (const key of formData.keys()) {
                const data = formData.getAll(key);
                jsonData[key] = data.length === 1 ? data[0] : data;
            }
            try {
                const response = await fetch("/transaction/issue-book", {
                    method: "POST",
                    body: JSON.stringify(jsonData),
                    headers: new Headers({
                        'Content-Type': 'application/json; charset=UTF-8'
                    })
                });
                const responseData = await response.json();

                if (!responseData.success && responseData.data.invalidIds) {
                    const data = responseData.data;
                    let messageText = "";
                    if (typeof (jsonData.uniqueId) === "object") {
                        for (let i = 0; i < data.invalidIds.length; i++) {
                            const invliadidObj = data.invalidIds[i];
                            messageText += `${invliadidObj.uniqueId} : ${invliadidObj.message}<br/>`;

                            const bookInputIndex = jsonData.uniqueId.findIndex(id => invliadidObj.uniqueId === id);
                            if (bookInputIndex != -1) {
                                bookIdInputs[bookInputIndex].value = "";
                            }
                        }
                    } else {
                        const invliadidObj = data.invalidIds[0];
                        messageText = `${invliadidObj.uniqueId} : ${invliadidObj.message}`;
                        bookIdInputs[0].value = "";
                    }
                    Swal.fire({
                        title: data.title,
                        html: messageText,
                        icon: "error"
                    });
                }
                else {
                    Swal.fire({
                        title: responseData.data.title,
                        text: responseData.data.message,
                        icon: responseData.success ? "success" : "error"
                    });

                    if (responseData.success) this.reset();
                }
            } catch (error) {
                console.log(error);
                Swal.fire({
                    title: "Something went wrong",
                    text: "Please refresh the page or try agian later.",
                    icon: "error"
                });
            }
        });
    })
);