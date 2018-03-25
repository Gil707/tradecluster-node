$(document).ready(function () {

    $('#botcfg-addblock').load('/botconfigs/admin/forms/' + $('#botselector').val());

    $('#delete-post').on('click', function (e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type: 'DELETE',
            url: '/posts/' + id,
            success: function (response) {
                alert('Deleting Post');
                window.location.href = '/';
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});


$('#allow_restr_cfg').click(function (e) {
    let target = $(e.target);
    $.ajax({
        type: 'POST',
        url: '/orders/changeaccess/' + target.attr('x-target') + '/' + target.attr('action'),
        success: function (data) {
            $("#usr_orders").load(location.href + " #usr_orders>*", "");
        },
        error: function (err) {
            console.log(err);
        }
    });
});


$('#allowaccess').click(function (e) {
    console.log($(this).attr('x-target'));
    $.ajax({
        type: 'POST',
        url: '/orders/allowaccess/' + $(this).attr('x-target'),
        success: function (data) {
            $("#usr_orders").load(location.href + " #usr_orders>*", "");
        },
        error: function (err) {
            console.log(err);
        }
    });
});

$('#restrictaccess').click(function (e) {
    console.log($(this).attr('x-target'));

    $.ajax({
        type: 'POST',
        url: '/orders/restrictaccess/' + $(this).attr('x-target'),
        success: function (data) {
            $("#usr_orders").load(location.href + " #usr_orders>*", "");
        },
        error: function (err) {
            console.log(err);
        }
    });
});

$('#botselector').change(function () {
    $('#botcfg-addblock').load('/botconfigs/admin/forms/' + $(this).val());
});

$("#freeblock").click(function () {
    if ($("#freeblock-list").css('display') === 'none') {
        $("#freeblock-list").show(500);
        $("#freeblock-hint").hide();
    } else {
        $("#freeblock-list").hide(500);
        $("#freeblock-hint").show();
    }
});

$("#chargeableblock").click(function () {
    if ($("#chargeableblock-list").css('display') === 'none') {
        $("#chargeableblock-list").show(500);
        $("#chargeableblock-hint").hide();
    } else {
        $("#chargeableblock-list").hide(500);
        $("#chargeableblock-hint").show();
    }
});

function loadBTCCourses() {
    $.getJSON("https://blockchain.info/ticker", function (data) {

        let items = [];
        let date = new Date($.now());
        items.push("<span style='margin-right: 4px'>Courses: </span>")
        items.push("<ul style='display: inline; padding: 0'>");

        $.each(data, function (key, val) {
            items.push("<li class='crs_itm_val'>" + key + "/BTC : " + val['last'].toFixed(2) + "</li><span style='color: #666699; font-size: 10px; margin: 0 3px'> | </span>");
        });
        items.push("<ul/>");
        items.push("<span class='hint'>Last refresh in " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "</span>");

        $("#courses").html(items);

    });
}

function loadNews() {
    $('#cryptonews-div').load('/cryptonews/refresh');
    $('#tradenews-div').load('/tradenews/refresh');
}


loadNews();
loadBTCCourses();


setInterval(function () {
    loadBTCCourses();
    loadNews();
}, 10000);
