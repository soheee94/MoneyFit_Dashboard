"use strict";
var table;
var info = "";
var clientid;

window.onload = function() {
    Number.prototype.format = function(n) {
        var r = new RegExp('\\d(?=(\\d{3})+' + (n > 0 ? '\\.' : '$') + ')', 'g');
        return this.toFixed(0).replace(r, '$&,');
    };

    Number.prototype.formatFloat = function(n) {
        var r = new RegExp('\\d(?=(\\d{3})+' + (n > 0 ? '\\.' : '$') + ')', 'g');
        return this.toFixed(1).replace(r, '$&,');
    };
    

    table = $('#client-datatable').DataTable({
        select: {
            style: 'multi'
        },
        "language": {
            "lengthMenu": "Display _MENU_ records per page",
            "zeroRecords": "검색 정보가 없습니다.",
            "infoEmpty": "기록 없음",
            "infoFiltered": "(filtered from _MAX_ total records)"
        },
        paging: true,
        dom: 'rt<"bottom"ip><"clear">',

    });

    clientid = getParameterByName('clientid');

    getUserInfo(clientid);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getUserInfo(clientid){
	var post_data = "clientid=" + clientid;

	$.ajax({
        url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_user_info.php',
        type: 'POST',
        data: post_data,
        dataType: 'json',
        success: function(data) {
        	var sex;
        	if(data[0].sex === '1'){
        		sex = '남';
        	}
        	else{
        		sex = '여';
        	}
        	document.getElementById('member-name').innerHTML = data[0].name;
        	document.getElementById('member-age').innerHTML = data[0].birth;
        	document.getElementById('member-sex').innerHTML = sex;
        	document.getElementById('member-email').innerHTML = data[0].email;
        	document.getElementById('member-fitness').innerHTML = data[0].fitnessname + " (" + data[0].branch + ") ";        
        	document.getElementById('member-balance').innerHTML = data[0].balance;

        	$('.count').each(function() {
			    $(this).prop('counter', 0).animate({
			        counter: $(this).text()
			    }, {
			        duration: 2000,
			        easing: 'easeOutExpo',
			        step: function(step) {
			            $(this).text(step.format());
			        }
			    });
			});
        },
        error: function(request, status, error) {
            console.log(request, status, error);
        },
    });

}