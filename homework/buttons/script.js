const mainImage = document.getElementById("mainImage");
const thumbnails = document.querySelectorAll(".thumb");
const navLinks = document.querySelectorAll("nav a");

// Click a thumbnail to show it
thumbnails.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
        mainImage.src = thumb.src;
    });
});

// Click a nav link to show its image
navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        mainImage.src = link.dataset.image;
    });
});