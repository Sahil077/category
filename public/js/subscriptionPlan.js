function createPlan(){
// document.getElementById('pay').onclick = function (e) {
    const period = 'daily'
    const interval = 7
    const amount = 100 // 100paise = 1rs
    const currency = 'INR'
    const name = 'InterviewHelp Feature'
    let url = 'https://interviewhelp.me/plans'
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
            console.log('CREATE PLAN = ' + JSON.stringify(output));
            createSubscription(output)
        },
        error: function (err) {
            console.log(err)
        }
    });
}


function createSubscription(data){
    console.log(JSON.stringify(data))
    let url = 'https://interviewhelp.me/subscriptions'
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify({
            id:data.id
        }),
        success: function (output) {
            console.log('CREATE SUBSCRIPTION '+ JSON.stringify(output));
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
        "key": "rzp_test_umWrzSCH1vLjLL",
        "subscription_id": orderDetails.id, 
        "name": "InterviewHelp", 
        "description": "Monthly Test Plan", 
        "handler": function(response) { 
            console.log(response)
            // razorPayverify(response)
            if (typeof response.razorpay_payment_id == 'undefined' ||  response.razorpay_payment_id < 1) {
                window.open(`https://interviewhelp.me/subscriptionPlan`, "_self")
              } else {
                window.open(`https://interviewhelp.me/categories`, "_self")
              }
        } 
     }; 
     var paymentObject = new Razorpay(options);
     paymentObject.open()
}
