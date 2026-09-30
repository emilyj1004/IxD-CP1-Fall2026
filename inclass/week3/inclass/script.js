   let thisPage = document.getElementById("docBody")
    let colorBtn = document.getElementById("colorChange")
    let toggleBtn = document.getElementById("toggleBtn")
    let textBtn = document.getElementById("addText")

    let changingColor = () => {
        let redC = Math.random() * 255
        let greenC = Math.random() * 255
        let blueC = Math.random() * 255

        thisPage.style.backgroundColor = "rgb(" + redC + "," + greenC + "," + blueC + ")";
    }

    colorBtn.addEventListener("click",() => {
        thisPage.style.backgroundColor = "coral";
    });

    let addingText = () => {
        console.log("Firing!");
        let textRecepticle = document.getElementById("textArea");
        
        let newElem = document.createElement("p");
        console.log(newElem)
        newElem.innerHTML = "Lorem ipsum dolor sit amet.";
        textRecepticle.appendChild(newElem);
    }

    let togglingImage = (event) => {
        console.log(event);
        let imgTT = document.getElementById("imageToToggle");
        
        if(imgTT.alt === "First Quokka Image") {
            imgTT.alt = "Second Quokka Image";
            imgTT.src = "images/quokka2.jpg";
        console.log(imgTT);
    }

    else {
        imgTT.alt = "First Quokka Image";
        imgTT.src = "images/quokka1.jpg";
    }}

    colorBtn.addEventListener("click", changingColor);
    toggleBtn.addEventListener("click", changingColor);
    toggleBtn.addEventListener("click", togglingImage);