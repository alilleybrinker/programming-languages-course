let toggle = function (e, time) {
    e.preventDefault();

    $(e.target)
        .toggleClass("collapsed")
        .parent()
        .next()
        .toggle(time);
};

$("h2 a[href^='#']").on("click", function (e) {
    toggle(e, 150);
});

let h3_links = $("#reading h3 a[href^='#']");

h3_links.on("click", function (e) {
    toggle(e, 150);
});

$(h3_links)
    .toggleClass("collapsed")
    .parent()
    .next()
    .toggle();

