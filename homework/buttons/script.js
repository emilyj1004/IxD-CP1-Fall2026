const mainImage = document.getElementById("mainImage");
const thumbnails = document.querySelectorAll(".thumb");

thumbnails.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
        mainImage.src = thumb.src;
        mainImage.alt = thumb.alt;

        thumbnails.forEach(function (t) {
            t.classList.remove("active");
        });
        thumb.classList.add("active");
    });
});