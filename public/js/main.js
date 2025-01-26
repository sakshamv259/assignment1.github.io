
import { opportunities } from './opportunities.js'; 
import { events } from './events.js'; 

$(function() {


    // Display Opportunities Function
    function displayOpportunities() {
        const Navs = $(".navitm");
        Navs.each(function() {
            $(this).removeClass('active');
        });
        
        $('#opp').addClass('active');
        


        const $opportunityContainer = $('.card_holder');        
        opportunities.forEach((opp, index) => {
            const date = moment(opp.date, "DD-MM-YYYY").format("MMMM Do, YYYY");
            const card = `<div class="card" style="width: 18rem;">
                            <div class="card-body">
                                <h5 class="card-title">${opp.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${date}</h6>
                                <p class="card-text">${opp.description}</p>
                                <button class="sign_up bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300" data-value="${index}">
                                    Sign Up
                                </button>
                            </div>
                          </div>`;

            $opportunityContainer.append(card);
        });
  
        // Handle Opportunity Sign Up Button
        $('.card_holder').on('click', '.sign_up', function() {
            const retrievedIndex = $(this).data('value');
            openModal(retrievedIndex);
        });
    }

    // Display Events Page Function
    function displayEventsPage(){



        const Navs = $(".navitm");
        Navs.each(function() {
            $(this).removeClass('active');
        });
        
        $('#event').addClass('active');

        const categories = [...new Set(events.map(event => event.category))];
        console.log(categories);
        const $eventFilter = $('#eventFilter');
        categories.forEach(category => {
            const option = `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`;
            $eventFilter.append(option);
        });
    
        $eventFilter.prepend('<option value="all">All Events</option>');
    
        // FullCalendar Setup
        $('#calendar').fullCalendar({
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

        // Event Filter Change Handler
        $('#eventFilter').change(function() {
            $('#calendar').fullCalendar('rerenderEvents');
        });
    }
  
    // Open Modal for Sign Up
    function openModal(index) {
        const opportunity = opportunities[index];
        $("#signupForm")[0].reset(); 
        $("#signupModalLabel").text(`Sign Up for ${opportunity.title}`);
        $("#opportunityTitle").text(opportunity.title);
        const modalElement = document.getElementById('signupModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
  
        // Handle Sign Up Form Submit
        $("#signupForm").off("submit").on("submit", function(event) {
            event.preventDefault();
  
            const name = $("#name").val();
            const email = $("#email").val();
            const role = $("#role").val();
  
            if (name && email && role) {
                $("#confirmationMessage").text(`Thank you, ${name}, for signing up for ${opportunity.title}!`).show();
                $("#signupForm")[0].reset(); 
            }
        });
    }

    // Submit Contact Form Function
    function submitContactForm() {

        const Navs = $(".navitm");
        Navs.each(function() {
            $(this).removeClass('active');
        });
        
        $('#contact').addClass('active');
        $('#contactForm').on('submit', function (event) {
            event.preventDefault();
            
            // Hide success/error messages initially
            $('#successMessage').hide();
            $('#errorMessage').hide();
            
            // Show the spinner while submitting
            $('#spinner').show();

            // Simulate form submission with a timeout
            setTimeout(function () {
                // Hide the spinner after the simulated delay
                $('#spinner').hide();
                
                // Show success message
                $('#successMessage').show();
                
                // Reset the form after submission
                $('#contactForm')[0].reset();
            }, 2000); // Simulate a 2-second delay
        });
    }

    function createStickyFooter(){
        const footer = document.createElement('footer');
        footer.classList.add('sticky-footer');
      
        const privacyLink = document.createElement('a');
        privacyLink.href = '/privacy-policy';
        privacyLink.textContent = 'Privacy Policy';
      
        const termsLink = document.createElement('a');
        termsLink.href = '/terms-of-service';
        termsLink.textContent = 'Terms of Service';
      
        footer.appendChild(privacyLink);
        footer.appendChild(termsLink);
      
        document.body.appendChild(footer);
      
        // CSS to make the footer sticky
        const style = document.createElement('style');
        style.textContent = `
          .sticky-footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            background-color: #333;
            color: white;
            text-align: center;
            padding: 10px;
            z-index:5;
          }
          .sticky-footer a {
            margin: 0 15px;
            color: white;
            text-decoration: none;
          }
          .sticky-footer a:hover {
            text-decoration: underline;
          }
        `;
        document.head.appendChild(style);
    }

    function backToTop(){
        const backToTopButton = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 200) {
        backToTopButton.style.display = 'block'; 
        } else {
        backToTopButton.style.display = 'none';  
        }
    });
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
        top: 0,
        behavior: 'smooth'  
        });
    });
    }


    function displayHome(){
        const Navs = $(".navitm");
        Navs.each(function() {
            $(this).removeClass('active');
        });
        
        $('#home').addClass('active');
        
    }




    function displayAbout(){
        const Navs = $(".navitm");
        Navs.each(function() {
            $(this).removeClass('active');
        });
        
        $('#about').addClass('active');
    }
    // Start Function to Initialize App
    function start() {
        const navbar = document.querySelector('.navbar'); 
        const donateLink = document.createElement('a');
        donateLink.href = '/donate';
        donateLink.textContent = 'Donate';
        navbar.appendChild(donateLink);
      
        //changing the opportunities link text
        const opportunitiesLink = $(".opp_to_volunteer");
        opportunitiesLink.text('Volunteer Now');
        console.log("Starting app...");

        backToTop();
        createStickyFooter();
        switch (document.title) {
            case "Home":
                displayHome()
                console.log("homepage");
                break;
            case "Opportunities":
                displayOpportunities();
                break;
            case "Events":
                console.log("events page");
                displayEventsPage();
                break;  // Added break to prevent fall-through to the next case
            case "Contact":
                console.log("contact us page");
                submitContactForm();
                break;
            case "About":
                displayAbout();
                console.log("about page");
                break;
            default:
                console.log("default");
                break;
        }
    }

    // Initialize App on DOM Ready
    start();

});
