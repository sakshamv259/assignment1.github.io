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
    // Define types
    interface Article {
        title: string;
        description?: string;
        pubDate: string;
        url: string;
        imageUrl?: string;
    }

    interface Opportunity {
        title: string;
        description: string;
    }

    interface Event {
        title: string;
        start: string;
        category: string;
    }

    interface JQuery {
        modal(action: string): any;
        fullCalendar(options?: any): any;
        fullCalendar(method: string): any;
    }
    
    // User Authentication Functionality
    function checkAuthentication(): void {
        const username: string | null = localStorage.getItem("username");
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

    $(document).ready(() => checkAuthentication());

    function displayHome(): void {
        setActiveNav('home');
        console.log("Displaying Home Page...");
    }

    function displayNews(): void {
        setActiveNav('news');

        const newsContainer = $("#news-container");
        newsContainer.empty();
        const apiKey = "883fb7ef-ff6e-4f57-b94f-22a972d7049b";
        const apiUrl = `https://api.goperigon.com/v1/all?category=Business&sourceGroup=top100&showReprints=false&apiKey=${apiKey}`;

        $.ajax({
            url: apiUrl,
            method: "GET",
            success: function (data: { articles: Article[] }) {
                $("#loading").remove();
                if (data.articles?.length > 0) {
                    data.articles.forEach((article: Article) => {
                        const imageUrl = article.imageUrl ?? "public/img/news.jpg";
                        const newsCard = `
                            <div class="card mb-3">
                                <div class="row g-0">
                                    <div class="col-md-4">
                                        <img src="${imageUrl}" class="img-fluid news-image" alt="news image">
                                    </div>
                                    <div class="col-md-8">
                                        <div class="card-body">
                                            <h5 class="card-title">${article.title}</h5>
                                            <p class="card-text">${article.description ?? "No description available."}</p>
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
            error: function () {
                $("#loading").remove();
                newsContainer.append('<p class="text-danger text-center">Failed to load news. Please try again later.</p>');
            }
        });
    }

    function displayEventsPage(): void {
        setActiveNav('event');
        const $eventContainer = $('#calendar');
        const $eventFilter = $('#eventFilter');

        const categories: string[] = [...new Set(events.map((event: Event) => event.category))];

        categories.forEach((category: string) => {
            const option = `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
            $eventFilter.append(option);
        });

        $eventFilter.prepend('<option value="all">All Events</option>');

        $eventContainer.fullCalendar({
            events: events,
            eventRender: function (event: Event, element: JQuery<HTMLElement>) {
                const selectedCategory = $('#eventFilter').val() as string;
                if (selectedCategory !== 'all' && event.category !== selectedCategory) {
                    element.hide();
                } else {
                    element.show();
                }
            }
        });

        $eventFilter.change(() => $eventContainer.fullCalendar('rerenderEvents'));
    }

    function searchOpportunities(): void {
        $("#searchInput").on("input", function () {
            const searchText = ($(this).val() as string).toLowerCase();
            $(".opportunity-card").each(function () {
                const title = $(this).find(".card-title").text().toLowerCase();
                const description = $(this).find(".card-text").text().toLowerCase();
                $(this).toggle(title.includes(searchText) || description.includes(searchText));
            });
        });
    }

    function displayOpportunities(): void {
        setActiveNav('opp');
        const $opportunityContainer = $(".card_holder");
        $opportunityContainer.empty();

        opportunities.forEach((opp: Opportunity, index: number) => {
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
            const index = $(this).data("value") as number;
            openModal(index);
        });

        searchOpportunities();
    }

    function submitContactForm(): void {
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

    function displayGallery(): void {
        setActiveNav('gal');
        const $galleryContainer = $('#gallery-container');
        $galleryContainer.empty();

        $.ajax({
            url: 'public/js/gallery.json',
            method: 'GET',
            dataType: 'json',
            success: function (images: { url: string; caption: string }[]) {
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
                } else {
                    $galleryContainer.append('<p class="text-center text-muted">No gallery images available.</p>');
                }
            },
            error: function () {
                $galleryContainer.append('<p class="text-danger text-center">Failed to load gallery images. Please try again later.</p>');
            }
        });
    }

    function setActiveNav(navId: string): void {
        $(".navitm").removeClass("active");
        $(`#${navId}`).addClass("active");
    }

    function start(): void {
        console.log("Starting app...");
        switch (document.title) {
            case "Home": displayHome(); break;
            case "Opportunities": displayOpportunities(); break;
            case "Events": displayEventsPage(); break;
            case "Contact": submitContactForm(); break;
            case "News": displayNews(); break;
            case "Gallery": displayGallery(); break;
            default: console.log("Unknown page.");
        }
    }

    start();
});
