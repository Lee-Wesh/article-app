$(document).ready(function () {
    console.log("Script loaded!");


    // Typing Text Animation
    var typed = new Typed(".typing", {
        strings: ["Writers", "Creatives", "Photographers", "Artists"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
    });

    var typed2 = new Typed(".typing-2", {
        strings: ["Innovators", "Storytellers", "Collaborators", "Artists"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
    });
});

