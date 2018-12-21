'use strict';

function changeSource(event) {
    document.querySelectorAll('.environment.active, .environment-content.active').forEach(siteElement => {
        siteElement.classList.remove('active');
    });
    document.getElementById(`${event.target.id}-content`).classList.add('active');
    event.target.classList.add('active');
}
function showSite(event) {
    document.querySelectorAll('.site-list-item.active, .site-content.active').forEach(siteElement => {
        siteElement.classList.remove('active');
    });
    document.getElementsByName(`site-${event.target.innerText}`).forEach(siteElement => {
        siteElement.classList.add('active');
    });
    event.target.classList.add('active');
}
function nextSource() {
    const activeSource = document.querySelector('.environment.active');
    const nextSibling = activeSource.nextElementSibling;
    if (nextSibling) {
        changeSource({ target: nextSibling });
    }
}
function previousSource() {
    const activeSource = document.querySelector('.environment.active');
    const previousSibling = activeSource.previousElementSibling;
    if (previousSibling) {
        changeSource({ target: previousSibling });
    }
}
function nextSite() {
    const activeSite = document.querySelector('.site-list-item.active');
    const nextSibling = activeSite.nextElementSibling;
    if (nextSibling) {
        showSite({ target: nextSibling });
    }
}
function previousSite() {
    const activeSite = document.querySelector('.site-list-item.active');
    const previousSibling = activeSite.previousElementSibling;
    if (previousSibling) {
        showSite({ target: previousSibling });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    changeSource({ target: document.getElementById('server-server') });
    showSite({ target: document.getElementsByClassName('site-list-item')[0] });
    window.addEventListener('keydown', e => {
        if (e.metaKey) {
            switch (e.keyCode) {
                case 37:
                    e.preventDefault();
                    previousSource();
                    break;
                case 38:
                    e.preventDefault();
                    previousSite();
                    break;
                case 39:
                    e.preventDefault();
                    nextSource();
                    break;
                case 40:
                    e.preventDefault();
                    nextSite();
                    break;
                default:
                    break;
            }
        }
    });
});
