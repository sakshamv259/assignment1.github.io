// <!-- Name: Saksham Verma, Arsh -->
// <!-- Student ID: 100886325 -->
// <!-- Date: 23-02-2025 -->
import "fullcalendar"; // Import FullCalendar jQuery plugin
import $ from "jquery"; // Import jQuery
import moment from "moment";
// import moment from "https://cdn.jsdelivr.net/npm/moment@2.29.4/dist/moment.min.js";
import { events } from './events.js';
import { opportunities } from './opportunities.js';
$(function () {
    // User Authentication Functionality
    function checkAuthentication() {
        const username = localStorage.getItem("username");
        if (username) {
            $(".nav-auth").html(`
                <span class="navbar-text text-light">Welcome, ${username}</span>
                <button class="btn btn-danger btn-sm ms-2" id="logoutBtn">Log Out</button>
            `);
            $("#logoutBtn").on("click", function () {
                localStorage.removeItem("username");
                location.reload();
            });
        }
        else {
            $(".nav-auth").html(`<a href="login.html" class="btn btn-success btn-sm">Log In</a>`);
        }
    }
    $(document).ready(() => checkAuthentication());
    function displayHome() {
        setActiveNav('home');
        console.log("Displaying Home Page...");
    }




    window.displayNews = function displayNews() {
        setActiveNav('news');  // Ensure this function exists in main.js
        const newsContainer = $("#news-container");
        newsContainer.empty();
        const apiKey = "883fb7ef-ff6e-4f57-b94f-22a972d7049b";
        const apiUrl = `https://api.goperigon.com/v1/all?category=Business&sourceGroup=top100&showReprints=false&apiKey=${apiKey}`;
    
        $.ajax({
            url: apiUrl,
            method: "GET",
            success: function (data) {
                $("#loading").remove();
                if (data.articles?.length > 0) {
                    data.articles.forEach((article) => {
                        const imageUrl = article.imageUrl || "public/img/news.jpg";
                        const formattedDate = moment(article.pubDate).format("MMMM Do, YYYY");
                        const newsCard = `
                            <div class="card mb-3">
                                <div class="row g-0">
                                    <div class="col-md-4">
                                        <img src="${imageUrl}" class="img-fluid news-image" alt="news image">
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body">
                                            <h5 class="card-title">${article.title}</h5>
                                            <p class="card-text">${article.description || "No description available."}</p>
                                            <p class="card-text"><small class="text-muted">Published on: ${formattedDate}</small></p>
                                            <a href="${article.url}" target="_blank" class="btn btn-primary">Read More</a>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        newsContainer.append(newsCard);
                    });
                } else {
                    newsContainer.append('<p class="text-center text-muted">No news articles found.</p>');
                }
            },
            error: function () {
                $("#loading").remove();
                newsContainer.append('<p class="text-danger text-center">Failed to load news. Please try again later.</p>');
            }
        });
    };
    
    




    
    // function displayNews() {
    //     setActiveNav('news');
    //     const newsContainer = $("#news-container");
    //     newsContainer.empty();
    //     const apiKey = "883fb7ef-ff6e-4f57-b94f-22a972d7049b";
    //     const apiUrl = `https://api.goperigon.com/v1/all?category=Business&sourceGroup=top100&showReprints=false&apiKey=${apiKey}`;
    //     $.ajax({
    //         url: apiUrl,
    //         method: "GET",
    //         success: function (data) {
    //             var _a;
    //             $("#loading").remove();
    //             if (((_a = data.articles) === null || _a === void 0 ? void 0 : _a.length) > 0) {
    //                 data.articles.forEach((article) => {
    //                     var _a, _b;
    //                     const imageUrl = (_a = article.imageUrl) !== null && _a !== void 0 ? _a : "public/img/news.jpg";
    //                     const newsCard = `
    //                         <div class="card mb-3">
    //                             <div class="row g-0">
    //                                 <div class="col-md-4">
    //                                     <img src="${imageUrl}" class="img-fluid news-image" alt="news image">
    //                                 </div>
    //                                 <div class="col-md-8">
    //                                     <div class="card-body">
    //                                         <h5 class="card-title">${article.title}</h5>
    //                                         <p class="card-text">${(_b = article.description) !== null && _b !== void 0 ? _b : "No description available."}</p>
    //                                         <p class="card-text"><small class="text-muted">Published on: ${moment(article.pubDate).format("MMMM Do, YYYY")}</small></p>
    //                                         <a href="${article.url}" target="_blank" class="btn btn-primary">Read More</a>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>`;
    //                     newsContainer.append(newsCard);
    //                 });
    //             }
    //             else {
    //                 newsContainer.append('<p class="text-center text-muted">No news articles found.</p>');
    //             }
    //         },
    //         error: function () {
    //             $("#loading").remove();
    //             newsContainer.append('<p class="text-danger text-center">Failed to load news. Please try again later.</p>');
    //         }
    //     });
    // }


    if (localStorage.getItem('loggedInUser')) {
        navBarHtml += `
            <li><a href="statistics.html"><i class="fa fa-chart-bar"></i> Statistics</a></li>
        `;
    }
    




    function displayEventsPage() {
        setActiveNav('event');
        const $eventContainer = $('#calendar');
        const $eventFilter = $('#eventFilter');
        const categories = [...new Set(events.map((event) => event.category))];
        categories.forEach((category) => {
            const option = `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
            $eventFilter.append(option);
        });
        $eventFilter.prepend('<option value="all">All Events</option>');
        $eventContainer.fullCalendar({
            events: events,
            eventRender: function (event, element) {
                const selectedCategory = $('#eventFilter').val();
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
        $("#searchInput").on("input", function () {
            const searchText = $(this).val().toLowerCase();
            $(".opportunity-card").each(function () {
                const title = $(this).find(".card-title").text().toLowerCase();
                const description = $(this).find(".card-text").text().toLowerCase();
                $(this).toggle(title.includes(searchText) || description.includes(searchText));
            });
        });
    }
    function displayOpportunities() {
        setActiveNav('opp');
        const $opportunityContainer = $(".card_holder");
        $opportunityContainer.empty();
        opportunities.forEach((opp, index) => {
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
        $(".sign_up").on("click", function () {
            const index = $(this).data("value");
            openModal(index);
        });
        searchOpportunities();
    }
    function submitContactForm() {
        setActiveNav('contact');
        $('#contactForm').on('submit', function (event) {
            event.preventDefault();
            $('#successMessage, #errorMessage').hide();
            $('#spinner').show();
            setTimeout(() => {
                $('#spinner').hide();
                $('#successMessage').show();
                $('#contactForm')[0].reset();
            }, 2000);
        });
    }
    function displayGallery() {
        setActiveNav('gal');
        const $galleryContainer = $('#gallery-container');
        $galleryContainer.empty();
        $.ajax({
            url: 'public/js/gallery.json',
            method: 'GET',
            dataType: 'json',
            success: function (images) {
                if (images.length > 0) {
                    const rowContainer = $('<div class="row"></div>');
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
        $(".navitm").removeClass("active");
        $(`#${navId}`).addClass("active");
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

    // Login form submission
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: $('#username').val(),
                    password: $('#password').val()
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'index.html';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while logging in');
        }
    });

    // Create new event
    async function createEvent(eventData) {
        try {
            const response = await fetch('http://localhost:3000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            
            if (response.ok) {
                return data.event;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // Load events
    async function loadEvents() {
        try {
            const response = await fetch('http://localhost:3000/api/events', {
                credentials: 'include'
            });

            const events = await response.json();
            
            if (response.ok) {
                displayEvents(events);
            } else {
                throw new Error('Failed to load events');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load events');
        }
    }
});
