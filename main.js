(function () {
    'use strict';

    $("section").each(function (index, section) {
        var section = $(section);
        var content = section.find(".content");
        var link = section.find("h2 a");

        link.on("click", function (e) {
            section.toggleClass("collapsed");
            content.toggle("slow");
            e.preventDefault();
        });
    });
}());
