$(document).ready(function () {
    
        var $menu = $(".nav--mobile .mod_navigation").mmenu({
            //   options
        });
        var $icon = $("#hamburger-icon");
        var API = $menu.data("mmenu");
    
        $icon.on("click", function () {
            API.open();
        });
    
        API.bind("open:finish", function () {
            $icon.addClass("is-active");
        });
        API.bind("close:finish", function () {
            $icon.removeClass("is-active");
        });
    
        $('.mm-menu ul.level_2').removeClass('dropdown-menu');
    });
    
    var timer;
    
    $(window).scroll(function () {
        if ($(window).scrollTop() > 50) {
            $('#header').addClass('scrolled');
        } else {
            $('#header').removeClass('scrolled');
        }
    });