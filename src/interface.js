window.addEventListener('load', (event) => {
   setTimeout(closePreloader, 10)
});

function openPreloader() {
    const preloader = document.getElementById('preloader');
    preloader.style.visibility = "visible";
}

function closePreloader() {
    const preloader = document.getElementById('preloader');
    preloader.style.visibility = "hidden";
}

function menuState() {
    const menu = document.getElementById('menu');
    const button = document.getElementById('buttonMenu');

    if(menu.style.width != '0px') {
        button.style.transform = 'rotate(90deg)'
        menu.style.width = "0px"
    }

    else {
        button.style.transform = 'rotate(-90deg)'
        menu.style.width = "auto"
    }
    
}