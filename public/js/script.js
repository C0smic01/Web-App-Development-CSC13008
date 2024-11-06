// const bar = document.getElementById('bar');
// const nav = document.getElementById('navbar');
// const Close = document.getElementById('Close');

// if (bar) {
//     bar.addEventListener('click', () => {
//         nav.classList.add('active');
//     });
// }

// if (Close) {
//     Close.addEventListener('click', () => {
//         nav.classList.remove('active');
//     });
// }
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});