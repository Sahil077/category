document.getElementById('pay').onclick = function (e) {
    const amount = 100
    const currency = 'INR'
    const receipt = 'InterviewHelp Feature'
    let url = 'https://interviewhelp.me/createOrder'
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify({
            amount: amount,
            currency: currency,
            receipt: receipt,
        }),
        success: function (output) {
            // console.log(output);
            verifyPayment(output)
        },
        error: function (err) {
            console.log(err)
        }
    });

}

function verifyPayment(orderDetails) {
    console.log(orderDetails)
    var amount = (orderDetails.amount) * 100
    var options = {
        "order_id": orderDetails.id,
        "entity": orderDetails.entity,
        "key": 'rzp_live_5V9Rr2HtEbDI2n',
        "amount": amount, // 100 -> paise
        "currency": "INR",
        "first_min_partial_amount": amount,
        "name": "InterviewHelp.Me",
        "description": "Interview help platform for professionals",
        "handler": function (response) {
            razorPayverify(response)
            // alert("This step of Payment Succeeded");
        },
        notify: {
            sms: true,
            email: true
        },
        reminder_enable: true,
        options: {
            checkout: {
                theme: {
                    hide_topbar: true
                }
            }
        }
    };

    var razorpayObject = new Razorpay(options);
    console.log(razorpayObject);
    razorpayObject.on('payment.failed', function (response) {
        console.log(response);
        alert("This step of Payment Failed");
    });

    razorpayObject.open();
    orderDetails.preventDefault();
}


function razorPayverify(data){
    console.log(data)
    const order_id = data.razorpay_order_id
    const payment_id = data.razorpay_payment_id
    const signature = data.razorpay_signature
    let url = 'https://interviewhelp.me/verifyOrder'
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify({
            order_id: order_id,
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