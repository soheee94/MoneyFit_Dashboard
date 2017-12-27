"use strict";
var table;
var info = "";

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

    $('#client-search-input').on( 'keyup', function () {
        table.search( this.value ).draw();
    } );

    getFitnessList();
    getClientList(0);

}

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    document.getElementById('today-date').innerHTML = [year, month, day].join('-');
}

function getFitnessList() {
    var fitnessList = [];
    $.ajax({
        url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_fitness_list.php',
        type: 'POST',
        dataType: 'json',
        success: function(data) {
            $.each(data, function(i, itemData) {
                var fitnessId = itemData.fitnessid;
                var fitnessName = itemData.fitnessname;
                var fitnessBranch = itemData.branch;

                var data = {
                    "id": fitnessId,
                    "text": fitnessName + " ( " + fitnessBranch + " )"
                };
                fitnessList.push(data);
            });

            $("#fitness-drop").select2({
                data: fitnessList
            });

        },
        error: function(request, status, error) {
            console.log(request, status, error);
        },
    });
}

function getFitnessInfo() {
    var fitnessSelect = document.getElementById('fitness-drop');
    var selected_fitnessname = fitnessSelect.options[fitnessSelect.selectedIndex].text;
    var selected_fitnessid = fitnessSelect.options[fitnessSelect.selectedIndex].value;
    var fitnessname = document.getElementById('fitnessname');
    fitnessname.innerHTML = selected_fitnessname;
    var post_data = "fitnessid=" + selected_fitnessid;

    $.ajax({
        url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_fitness_info.php',
        type: 'POST',
        data: post_data,
        dataType: 'json',
        success: function(data) {
            document.getElementById('fitnessDeviceCount').innerHTML = data[0].cnt;
            document.getElementById('fitnessDeviceUpdateDate').innerHTML = data[0].maxdate;

            getClientList(selected_fitnessid);
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

function getClientList(fitnessid) {
    table.clear().draw();

    var post_data;
    var price = 0;

    if(fitnessid === 0){
        post_data = "";
    }
    else{
        post_data = "fitnessid=" + fitnessid;
    }
    $.ajax({
        url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_client_list.php',
        type: 'POST',
        data : post_data,
        dataType: 'json',
        success: function(data) {
            var sex;
            var successRate;
            var totalSuccessRate = 0;

            for(var i in data){
                if(data[i].sex === '1'){
                    sex = "남";
                }
                else{
                    sex = "여";
                }

                successRate = successCheck(data[i].mon) + successCheck(data[i].tue) + successCheck(data[i].wed) + successCheck(data[i].thu) + successCheck(data[i].fri) + successCheck(data[i].sat) + successCheck(data[i].sun);
                successRate = ((successRate / 7) * 100).toFixed(1);

                table.row.add([
                    info + data[i].fitnessname + " ( "+ data[i].branch + " )",
                    info + '<a href="./userInfo.html?clientid='+ data[i].client_id +'">'+ data[i].name + '</a>',
                    info + sex,
                    info + data[i].birth,
                    info + setNamingforJointdirection(data[i].exercisecode),
                    info + data[i].price + "원",
                    info + successRate + "%",
                ]).draw(false);

                price = price + parseInt(data[i].price);
                totalSuccessRate = totalSuccessRate + parseInt(successRate);
            }
            totalSuccessRate = (totalSuccessRate / data.length).toFixed(1);

            $.ajax({
                url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_client_not_used_list.php',
                type: 'POST',
                data : post_data,
                dataType: 'json',
                success: function(data) {
                    for(var i in data){
                        var sex;
                        if(data[i].sex === '1'){
                            sex = "남";
                        }
                        else{
                            sex = "여";
                        }
                        table.row.add([
                            info + data[i].fitnessname + " ( "+ data[i].branch + " )",
                            info + '<a href="./userInfo.html?clientid='+ data[i].client_id +'">'+ data[i].name + '</a>',
                            info + sex,
                            info + data[i].birth,
                            info + "--",
                            info + "--",
                            info + "--",
                        ]).draw(false);
                    }

                    document.getElementById('total-amount').innerHTML = price;
                    document.getElementById('total-users').innerHTML = document.getElementById('client-datatable').getElementsByTagName("tr").length - 1;

                    if(isNaN(totalSuccessRate)){
                        totalSuccessRate = 0;
                    }

                    document.getElementById('Challenge-success-rate').innerHTML = totalSuccessRate;
                    
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
                    
        },
        error: function(request, status, error) {
            console.log(request, status, error);
        },
    });

}


//*****************꼭 필요한지 ? 
// function getChallengeList() {
//     var challengeList = [];
//     $.ajax({
//         url: 'https://elysium.azurewebsites.net/php/mf_admin_php/get_challenge_list.php',
//         type: 'POST',
//         dataType: 'json',
//         success: function(data) {
//             $.each(data, function(i, itemData) {
//                 var challengeId = itemData.challengeid;
//                 var challengeCode = itemData.exercisecode;
  
//                 var data = {
//                     "id": challengeId,
//                     "text": setNamingforJointdirection(challengeCode)
//                 };
//                 challengeList.push(data);
//             });

//             $("#challenge-drop").select2({
//                 data: challengeList
//             });
//         },
//         error: function(request, status, error) {
//             console.log(request, status, error);
//         },
//     });

// }


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