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
    getUserChallenge(clientid);
    getUserBeforeChallenge(clientid);
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
        	console.log(data);
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

function getUserChallenge(clientid){
	var post_data = "clientid=" + clientid;

	$.ajax({
        url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_client_challenge.php',
        type: 'POST',
        data: post_data,
        dataType: 'json',
        success: function(data) {
        	if(data.length === 0){
        		document.getElementById('not-used-challenge').style.display = 'block';
        		document.getElementById('challenge-info').style.display = 'none';
        	}
        	else{
        		var successRate;
	        	successRate = successCheck(data[0].mon) + successCheck(data[0].tue) + successCheck(data[0].wed) + successCheck(data[0].thu) + successCheck(data[0].fri) + successCheck(data[0].sat) + successCheck(data[0].sun);
	            successRate = ((successRate / 7) * 100).toFixed(1);

	        	document.getElementById('challenge-name').innerHTML = setNamingforJointdirection(data[0].exercisecode);
	        	document.getElementById('challenge-price').innerHTML = data[0].price;
	        	document.getElementById('challenge-date').innerHTML = (data[0].start_time).split(" ")[0] + " ~ " + (data[0].end_time).split(" ")[0];

	        	document.getElementById('challenge-success-rate').innerHTML = successRate;
        	}
        },
        error: function(request, status, error) {
            console.log(request, status, error);
        },
    });

}

function getUserBeforeChallenge(clientid){
	var post_data = "clientid=" + clientid;
	table.clear().draw();

	$.ajax({
        url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_client_before_challenge.php',
        type: 'POST',
        data: post_data,
        dataType: 'json',
        success: function(data) {
        	var totalSuccessRate = 0;
        	for(var i in data){
        		var successResult;
        		if(data[i].success === '0'){
        			successResult = "실패";
        		}
        		else{
        			successResult = "성공";
        			totalSuccessRate++;
        		}

        		table.row.add([
				    info + setNamingforJointdirection(data[i].exercisecode),
				    info + data[i].price + "원",
				    info + (data[0].start_time).split(" ")[0] + " ~ " + (data[0].end_time).split(" ")[0],
				    info + successResult,
				    info + "--",
				]).draw(false);
        	}

        	totalSuccessRate = (totalSuccessRate / data.length) * 100;
        	if(isNaN(totalSuccessRate)){
               totalSuccessRate = 0;
            }
        	document.getElementById('member-total-success-rate').innerHTML = totalSuccessRate;
        	$('.count-float').each(function() {
			    $(this).prop('counter', 0).animate({
			        counter: $(this).text()
			    }, {
			        duration: 2000,
			        easing: 'easeOutExpo',
			        step: function(step) {
			            $(this).text(step.formatFloat());
			        }
			    });
			});
        	
        	
        },
        error: function(request, status, error) {
            console.log(request, status, error);
        },
    });
}

function successCheck(result){
    if(result === '2'){
        return 1;
    }
    else{
        return 0 ;
    }
}


function setNamingforJointdirection(jointdirection) {
    switch (jointdirection) {
         case "500":
            jointdirection = 'Push Up';
            break;
        case "510":
            jointdirection = 'Squat';
            break;
        case "520":
            jointdirection = 'Hip Extension';
            break;
        case "530":
            jointdirection = 'Side Lunge';
            break;
        case "540":
            jointdirection = 'Slopes Towards';
            break;
        case "550":
            jointdirection = 'Windmills';
            break;
        case "560":
            jointdirection = 'Opposite Arm & Leg Extension';
            break;

        default:
    }
    return jointdirection;
}