function createPlan(){
// document.getElementById('pay').onclick = function (e) {
    $('#create_plan_sub').hide()
    $('#loading_plan').show()
    const period = 'daily'
    const interval = 7
    const amount = 100 // 100paise = 1rs
    const currency = 'INR'
    const name = 'InterviewHelp Feature'
    let url = 'https://interviewhelp.me/plans'
    // let url = 'http://localhost:3000/plans'
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify({
            amount: amount,
            currency: currency,
            name: name,
            period:period,
            interval:interval
        }),
        success: function (output) {
            createSubscription(output)
        },
        error: function (err) {
            console.log(err)
        }
    });
}


function createSubscription(data){
    let url = 'https://interviewhelp.me/subscriptions'
    // let url = 'http://localhost:3000/subscriptions'
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify({
            id:data.id
        }),
        success: function (output) {
            verifyPayment(output)
        },
        error: function (err) {
            console.log(err)
        }
    });
}

function verifyPayment(orderDetails) {
    console.log(JSON.stringify(orderDetails))
    // KEY FOR SUBSCRIPTION PLAN CREDENTIALS
    var options = { 
        "key": "rzp_live_5V9Rr2HtEbDI2n",
        // "key": "rzp_test_SQS56XrzM6nFIo",
        "subscription_id": orderDetails.id, 
        "name": "InterviewHelp", 
        "description": "Monthly Test Plan", 
        "handler": function(response) { 
            // console.log(response)
            $('#create_plan_sub').show()
             $('#loading_plan').hide()
               let url = 'https://interviewhelp.me/subscription-status_exp'
                $.ajax({
                    type: 'POST',
                    url: url,
                    contentType: "application/json",
                    data: JSON.stringify({
                        subId: orderDetails.id,
                    }),
                    success: function (output) {
                        console.log(output)
                        window.open(`https://interviewhelp.me/categories`, "_self")
                    },
                    error: function (err) {
                        console.log(err)
                    }
                });
        },prefill: {
            email: orderDetails.email,
            // contact: "9999999999",
          },
     }; 
     var paymentObject = new Razorpay(options);
     paymentObject.open()
}
