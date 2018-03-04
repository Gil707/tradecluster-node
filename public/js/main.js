
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

$('#botselector').change(function () {
        $('#botcfg-addblock').load('/botconfigs/admin/forms/' + $(this).val());
});

$("#freeblock").click(function(){
    if ($("#freeblock-list").css('display') === 'none') {
        $("#freeblock-list").show(500);
        $("#freeblock-hint").hide();
    } else {
        $("#freeblock-list").hide(500);
        $("#freeblock-hint").show();
    }
});

$("#chargeableblock").click(function(){
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
        items.push("<span class='crs_timehead'>Last refresh in " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "</span>");
        items.push("<ul>");

        $.each(data, function (key, val) {
            items.push("<li class='crs_itm_val'>" + key + "/BTC : " + val['last'].toFixed(2) + "</li>");
        });
        items.push("<ul/>");

        $("#courses").html(items);

    });
}

function loadNews() {
    $('#news-div').load('/news/refresh');
}



loadBTCCourses();
loadNews();

setInterval(function () {
    loadBTCCourses();
    loadNews();
}, 10000);
