// <!-- Name: Saksham Verma, Arsh-->
// <!-- Student ID: 100886325-->
// <!-- Date:23-02-2025 -->
import moment from "https://cdn.jsdelivr.net/npm/moment@2.29.4/dist/moment.min.js";
import { events } from './events.js';
import { opportunities } from './opportunities.js';

$(function() {

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
        } else {
            $(".nav-auth").html(`<a href="login.html" class="btn btn-success btn-sm">Log In</a>`);
        }
    }

    // Call the function on page load
    $(document).ready(function () {
        checkAuthentication();
    });



    /** =========================
     * Display Home Page Function
     * ========================= */
    function displayHome() {
        setActiveNav('home');
        console.log("Displaying Home Page...");
    }

    /** =========================
     * Display News Function 
     * - Fetch and Render News Articles
     * ========================= */
    function displayNews() {
        setActiveNav('news');

        const newsContainer = $("#news-container");
        newsContainer.empty(); // Clear existing content
        const apiKey = "883fb7ef-ff6e-4f57-b94f-22a972d7049b"; // Replace with actual API Key
        const apiUrl = `https://api.goperigon.com/v1/all?category=Business&sourceGroup=top100&showReprints=false&apiKey=${apiKey}`;

        $.ajax({
            url: apiUrl,
            method: "GET",
            success: function(data) {
                $("#loading").remove(); // Remove loading spinner
                if (data.articles && data.articles.length > 0) {
                    data.articles.forEach(article => {
                        const imageUrl = article.imageUrl ? article.imageUrl : "public/img/news.jpg"; // Fallback image
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
                                            <p class="card-text"><small class="text-muted">Published on: ${moment(article.pubDate).format("MMMM Do, YYYY")}</small></p>
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
            error: function() {
                $("#loading").remove();
                newsContainer.append('<p class="text-danger text-center">Failed to load news. Please try again later.</p>');
            }
        });
    }

    /** =========================
     * Display Events Function 
     * - Fetch and Display Events
     * ========================= */
    function displayEventsPage() {
        setActiveNav('event');
        const $eventContainer = $('#calendar');
        const $eventFilter = $('#eventFilter');

        const categories = [...new Set(events.map(event => event.category))];
        categories.forEach(category => {
            const option = `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
            $eventFilter.append(option);
        });
        $eventFilter.prepend('<option value="all">All Events</option>');

        $eventContainer.fullCalendar({
            events: events,
            eventRender: function(event, element) {
                const selectedCategory = $('#eventFilter').val();
                if (selectedCategory !== 'all' && event.category !== selectedCategory) {
                    element.hide();
                } else {
                    element.show();
                }
            }
        });

        $eventFilter.change(function() {
            $eventContainer.fullCalendar('rerenderEvents');
        });
    }
// Function to Filter Opportunities
function searchOpportunities() {
    $("#searchInput").on("input", function () {
        const searchText = $(this).val().toLowerCase();
        $(".opportunity-card").each(function () {
            const title = $(this).find(".card-title").text().toLowerCase();
            const description = $(this).find(".card-text").text().toLowerCase();
            if (title.includes(searchText) || description.includes(searchText)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

// Call this function when displaying opportunities
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
            </div>
        `;
        $opportunityContainer.append(card);
    });

    $(".sign_up").on("click", function () {
        const index = $(this).data("value");
        openModal(index);
    });

    searchOpportunities(); // Enable search functionality
}


    /** =========================
     * Display Contact Page Function 
     * - Handles Contact Form Submission
     * ========================= */
    function submitContactForm() {
        setActiveNav('contact');
        $('#contactForm').on('submit', function (event) {
            event.preventDefault();
            $('#successMessage, #errorMessage').hide();
            $('#spinner').show();

            setTimeout(function () {
                $('#spinner').hide();
                $('#successMessage').show();
                $('#contactForm')[0].reset();
            }, 2000);
        });
    }

    /** =========================
     * Display About Page Function
     * ========================= */
    function displayAbout() {
        setActiveNav('about');
    }

    /** =========================
     * Display Gallery Function 
     * - Fetch and Display Images Dynamically
     * ========================= */
function displayGallery() {
    setActiveNav('gal'); // Set navigation state

    const $galleryContainer = $('#gallery-container');
    $galleryContainer.empty(); // Clear existing content

    // Fetch the gallery images from the JSON file
    $.ajax({
        url: 'public/js/gallery.json', // Ensure this is the correct path to your JSON file
        method: 'GET',
        dataType: 'json',
        success: function(images) {
            if (images.length > 0) {
                const rowContainer = $('<div class="row"></div>'); // Bootstrap row for better alignment

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
            } else {
                $galleryContainer.append('<p class="text-center text-muted">No gallery images available.</p>');
            }
        },
        error: function() {
            $galleryContainer.append('<p class="text-danger text-center">Failed to load gallery images. Please try again later.</p>');
        }
    });
}



    /** =========================
     * Function to Handle Navigation Active States
     * ========================= */
    function setActiveNav(navId) {
        $(".navitm").removeClass("active");
        $(`#${navId}`).addClass("active");
    }

    /** =========================
     * Initialize App - Determine which function to call 
     * based on the page title
     * ========================= */
    function start() {
        console.log("Starting app...");

        $("#feedbackForm").on("submit", function (event) {
        event.preventDefault();

        let feedbackData = {
            name: $("#feedbackName").val(),
            email: $("#feedbackEmail").val(),
            message: $("#feedbackMessage").val()
        };

        $.ajax({
            url: "#", 
            method: "POST",
            data: JSON.stringify(feedbackData),
            contentType: "application/json; charset=UTF-8",
            success: function (response) {
                $("#feedbackSummary").html(`
                    <strong>Name:</strong> ${feedbackData.name}<br>
                    <strong>Email:</strong> ${feedbackData.email}<br>
                    <strong>Message:</strong> ${feedbackData.message}
                `);
                $("#feedbackModal").modal("show");
                $("#feedbackForm")[0].reset();
            },
            error: function () {
                alert("Failed to submit feedback. Please try again.");
            }
        });
    });
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
            case "About":
                displayAbout();
                break;
            case "News":
                displayNews();
                break;
            case "Gallery":
                displayGallery();
                break;
            default:
                console.log("Unknown page.");
                break;
        }
    }

    start();
});
