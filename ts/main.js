"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// <!-- Name: Saksham Verma, Arsh -->
// <!-- Student ID: 100886325 -->
// <!-- Date: 23-02-2025 -->
const moment_1 = require("moment");
const jquery_1 = require("jquery"); // Import jQuery
require("fullcalendar"); // Import FullCalendar jQuery plugin
// import moment from "https://cdn.jsdelivr.net/npm/moment@2.29.4/dist/moment.min.js";
const events_js_1 = require("./events.js");
const opportunities_js_1 = require("./opportunities.js");
(0, jquery_1.default)(function () {
    // User Authentication Functionality
    function checkAuthentication() {
        const username = localStorage.getItem("username");
        if (username) {
            (0, jquery_1.default)(".nav-auth").html(`
                <span class="navbar-text text-light">Welcome, ${username}</span>
                <button class="btn btn-danger btn-sm ms-2" id="logoutBtn">Log Out</button>
            `);
            (0, jquery_1.default)("#logoutBtn").on("click", function () {
                localStorage.removeItem("username");
                location.reload();
            });
        }
        else {
            (0, jquery_1.default)(".nav-auth").html(`<a href="login.html" class="btn btn-success btn-sm">Log In</a>`);
        }
    }
    (0, jquery_1.default)(document).ready(() => checkAuthentication());
    function displayHome() {
        setActiveNav('home');
        console.log("Displaying Home Page...");
    }
    function displayNews() {
        setActiveNav('news');
        const newsContainer = (0, jquery_1.default)("#news-container");
        newsContainer.empty();
        const apiKey = "883fb7ef-ff6e-4f57-b94f-22a972d7049b";
        const apiUrl = `https://api.goperigon.com/v1/all?category=Business&sourceGroup=top100&showReprints=false&apiKey=${apiKey}`;
        jquery_1.default.ajax({
            url: apiUrl,
            method: "GET",
            success: function (data) {
                var _a;
                (0, jquery_1.default)("#loading").remove();
                if (((_a = data.articles) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    data.articles.forEach((article) => {
                        var _a, _b;
                        const imageUrl = (_a = article.imageUrl) !== null && _a !== void 0 ? _a : "public/img/news.jpg";
                        const newsCard = `
                            <div class="card mb-3">
                                <div class="row g-0">
                                    <div class="col-md-4">
                                        <img src="${imageUrl}" class="img-fluid news-image" alt="news image">
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body">
                                            <h5 class="card-title">${article.title}</h5>
                                            <p class="card-text">${(_b = article.description) !== null && _b !== void 0 ? _b : "No description available."}</p>
                                            <p class="card-text"><small class="text-muted">Published on: ${(0, moment_1.default)(article.pubDate).format("MMMM Do, YYYY")}</small></p>
                                            <a href="${article.url}" target="_blank" class="btn btn-primary">Read More</a>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        newsContainer.append(newsCard);
                    });
                }
                else {
                    newsContainer.append('<p class="text-center text-muted">No news articles found.</p>');
                }
            },
            error: function () {
                (0, jquery_1.default)("#loading").remove();
                newsContainer.append('<p class="text-danger text-center">Failed to load news. Please try again later.</p>');
            }
        });
    }
    function displayEventsPage() {
        setActiveNav('event');
        const $eventContainer = (0, jquery_1.default)('#calendar');
        const $eventFilter = (0, jquery_1.default)('#eventFilter');
        const categories = [...new Set(events_js_1.events.map((event) => event.category))];
        categories.forEach((category) => {
            const option = `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
            $eventFilter.append(option);
        });
        $eventFilter.prepend('<option value="all">All Events</option>');
        $eventContainer.fullCalendar({
            events: events_js_1.events,
            eventRender: function (event, element) {
                const selectedCategory = (0, jquery_1.default)('#eventFilter').val();
                if (selectedCategory !== 'all' && event.category !== selectedCategory) {
                    element.hide();
                }
                else {
                    element.show();
                }
            }
        });
        $eventFilter.change(() => $eventContainer.fullCalendar('rerenderEvents'));
    }
    function searchOpportunities() {
        (0, jquery_1.default)("#searchInput").on("input", function () {
            const searchText = (0, jquery_1.default)(this).val().toLowerCase();
            (0, jquery_1.default)(".opportunity-card").each(function () {
                const title = (0, jquery_1.default)(this).find(".card-title").text().toLowerCase();
                const description = (0, jquery_1.default)(this).find(".card-text").text().toLowerCase();
                (0, jquery_1.default)(this).toggle(title.includes(searchText) || description.includes(searchText));
            });
        });
    }
    function displayOpportunities() {
        setActiveNav('opp');
        const $opportunityContainer = (0, jquery_1.default)(".card_holder");
        $opportunityContainer.empty();
        opportunities_js_1.opportunities.forEach((opp, index) => {
            const card = `
                <div class="card opportunity-card" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">${opp.title}</h5>
                        <p class="card-text">${opp.description}</p>
                        <button class="btn btn-primary sign_up" data-value="${index}">Sign Up</button>
                    </div>
                </div>`;
            $opportunityContainer.append(card);
        });
        (0, jquery_1.default)(".sign_up").on("click", function () {
            const index = (0, jquery_1.default)(this).data("value");
            openModal(index);
        });
        searchOpportunities();
    }
    function submitContactForm() {
        setActiveNav('contact');
        (0, jquery_1.default)('#contactForm').on('submit', function (event) {
            event.preventDefault();
            (0, jquery_1.default)('#successMessage, #errorMessage').hide();
            (0, jquery_1.default)('#spinner').show();
            setTimeout(() => {
                (0, jquery_1.default)('#spinner').hide();
                (0, jquery_1.default)('#successMessage').show();
                (0, jquery_1.default)('#contactForm')[0].reset();
            }, 2000);
        });
    }
    function displayGallery() {
        setActiveNav('gal');
        const $galleryContainer = (0, jquery_1.default)('#gallery-container');
        $galleryContainer.empty();
        jquery_1.default.ajax({
            url: 'public/js/gallery.json',
            method: 'GET',
            dataType: 'json',
            success: function (images) {
                if (images.length > 0) {
                    const rowContainer = (0, jquery_1.default)('<div class="row"></div>');
                    images.forEach(image => {
                        const imgElement = `
                            <div class="col-md-4 gallery-container">
                                <a href="${image.url}" data-lightbox="gallery" data-title="${image.caption}">
                                    <img src="${image.url}" class="gallery-image img-fluid" alt="Gallery Image">
                                </a>
                                <p class="text-center mt-2">${image.caption}</p>
                            </div>`;
                        rowContainer.append(imgElement);
                    });
                    $galleryContainer.append(rowContainer);
                }
                else {
                    $galleryContainer.append('<p class="text-center text-muted">No gallery images available.</p>');
                }
            },
            error: function () {
                $galleryContainer.append('<p class="text-danger text-center">Failed to load gallery images. Please try again later.</p>');
            }
        });
    }
    function setActiveNav(navId) {
        (0, jquery_1.default)(".navitm").removeClass("active");
        (0, jquery_1.default)(`#${navId}`).addClass("active");
    }
    function start() {
        console.log("Starting app...");
        switch (document.title) {
            case "Home":
                displayHome();
                break;
            case "Opportunities":
                displayOpportunities();
                break;
            case "Events":
                displayEventsPage();
                break;
            case "Contact":
                submitContactForm();
                break;
            case "News":
                displayNews();
                break;
            case "Gallery":
                displayGallery();
                break;
            default: console.log("Unknown page.");
        }
    }
    start();
});
