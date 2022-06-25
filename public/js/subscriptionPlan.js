document.getElementById('pay').onclick = function (e) {
    const period = 'daily'
    const interval = 1
    const amount = 100
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
        //    document.getElementById('payforsubscription').style.display = 'block'
        //    document.getElementById('pay').style.display = 'none'
         //   var a = document.getElementById('payforsubscription'); //or grab it by tagname etc
        //    a.href = output.short_url
        },
        error: function (err) {
            console.log(err)
        }
    });
}

function verifyPayment(orderDetails) {
    console.log(JSON.stringify(orderDetails))
    var options = { 
        "key": "rzp_test_umWrzSCH1vLjLL",
        "subscription_id": orderDetails.id, 
        "name": "InterviewHelp", 
        "description": "Monthly Test Plan", 
        "handler": function(response) { 
            console.log(response)
            razorPayverify(response)
        } 
     }; 
     var paymentObject = new Razorpay(options);
     paymentObject.open()
}

function razorPayverify(data){
    console.log('KEYS======= ' + JSON.stringify(data))

    const payment_id = data.razorpay_payment_id
    const signature = data.razorpay_signature
    let url = 'https://interviewhelp.me/verifypayment'
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify({
           
            payment_id: payment_id,
            signature: signature,
        }),
        success: function (output) {
            console.log(output);
            if(output.success == true){
                window.open(`https://interviewhelp.me/categories`, "_self")
            }else{
                alert('Payment Failed, Try again Later.')
            }
            
        },
        error: function (err) {
            console.log(err)
        }
    });
}
