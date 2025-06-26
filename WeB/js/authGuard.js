// WeB/js/authGuard.js
export function protectPage() { //
    const token = localStorage.getItem('token'); //
    const pageContent = document.getElementById('page-content'); //
    const loader = document.getElementById('full-page-loader'); //

    if (!token) { //
        window.location.replace('login.html'); //
        return false; //
    } else {
        if (loader) loader.style.display = 'none'; //
        if (pageContent) pageContent.style.display = 'block'; //
        return true; //
    }
}