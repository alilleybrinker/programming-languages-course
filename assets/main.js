// Set an event on header link clicks.
$("h2 a[href^='#']").on("click", function (e) {
    e.preventDefault();

    // When the button is clicked, toggle the collapsed state of the
    // associated content.
    $(e.target)
        .toggleClass("collapsed")
        .parent()
        .next()
        .toggle(150);
});
