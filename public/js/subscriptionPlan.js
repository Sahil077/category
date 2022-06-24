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
    let url = https://interviewhelp.me/subscriptions'
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json",
        data: JSON.stringify({
            id:data.id
        }),
        success: function (output) {
            console.log('CREATE SUBSCRIPTION '+ JSON.stringify(output));
            // verifyPayment(output)
            document.getElementById('payforsubscription').style.display = 'block'
            document.getElementById('pay').style.display = 'none'
            var a = document.getElementById('payforsubscription'); //or grab it by tagname etc
            a.href = output.short_url
        },
        error: function (err) {
            console.log(err)
        }
    });
}
