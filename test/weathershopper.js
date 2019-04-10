const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

//navigate to weathershopper.com
nightmare
    .goto('https://weathershopper.pythonanywhere.com')
    //check if weathershopper launched
    .then(function(gotoresult) {
        console.log("weathershopper.com response code:", gotoresult.code)
            //check if weathershopper http response code is 200
        if (gotoresult.code === 200) {
            // if temperature element found means the page loaded properly
            nightmare
                .exists('#temperature')
                .then(function(elementExists) {
                    if (elementExists) {
                        console.log("Temperature element found on weathershoppers.com")
                            // get hint text on the home page
                        nightmare
                            .evaluate(function() {
                                return document.querySelector(".octicon-info").getAttribute('data-content')
                            })
                            .then(function(htext) {
                                if (htext == null || htext == '') {
                                    console.log('Hint text appears to be null or empty')
                                } else {
                                    console.log("home page hint: ", htext)
                                }
                            })
                            // get temperature value on the home page
                        nightmare
                            .wait(1500)
                            .evaluate(function() {
                                return document.querySelector('#temperature').textContent
                            })
                            .then(function(temperature) {
                                console.log("current temperature value: ", temperature);
                                if (temperature != null) {
                                    // as per hint hard coded the conditions 
                                    if (temperature[0] > '34') {
                                        // go to sunscreen page
                                        console.log("temperature is higher than 34 °C , buy sunscreens!")
                                        nightmare
                                            .wait(1500)
                                            .click('[href="/sunscreen"]')
                                            .wait(1500)
                                            .evaluate(function() {
                                                return document.querySelector(".octicon-info").getAttribute('data-content')
                                            })
                                            .then(function(htext) {
                                                // get hint text on the sunscreen page
                                                if (htext == null || htext == '') {
                                                    console.log('Hint text appears to be null or empty')
                                                } else {
                                                    console.log("sunscreen shopping page hint: ", htext)
                                                    nightmare
                                                        .evaluate(function() {
                                                            var sunscreenlist = Array.from(document.querySelectorAll(".text-center"))
                                                            return sunscreenlist
                                                        })
                                                        .then(function(sunscreenlist) {
                                                            console.log('sunscreen list: ', sunscreenlist)
                                                        })
                                                }
                                            })
                                    } else if (temperature[0] < '19') {
                                        // go to moisturizer page
                                        console.log("temperature is lesser than 19 °C , buy moisturizers!")
                                        nightmare
                                            .wait(1500)
                                            .click('[href="/moisturizer"]')
                                            .wait(1500)
                                            .evaluate(function() {
                                                return document.querySelector(".octicon-info").getAttribute('data-content')
                                            })
                                            .then(function(htext) {
                                                // get hint text on the moisturizer page
                                                if (htext == null || htext == '') {
                                                    console.log('Hint text appears to be null or empty')
                                                } else {
                                                    console.log("moisturizers shopping page hint: ", htext)
                                                    nightmare
                                                        .evaluate(function() {
                                                            var moistlist = Array.from(document.querySelectorAll(".text-center"))
                                                            return moistlist
                                                        })
                                                        .then(function(moistlist) {
                                                            console.log('moistlist list: ', moistlist)
                                                        })
                                                }
                                            })
                                    } else {
                                        console.log("temperature is between 19 °C to 34 °C , no shopping!")
                                        return nightmare.end()
                                    }
                                } else {
                                    //temperature value is not null
                                    return nightmare.end()
                                }
                            })
                    } else {
                        console.log("Temperature element not found on weathershoppers.com")
                        return nightmare.end()
                    }
                })
        } else {
            //cant access the weathershopper.com 
            return nightmare.end()
        }
    })