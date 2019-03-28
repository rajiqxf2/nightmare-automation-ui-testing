const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

//navigate to weathershopper.com
nightmare
    .goto('https://weathershopper.pythonanywhere.com')
    //check if weathershopper launched
    .then(function(gotoresult) {
        console.log("weathershopper.com response code:", gotoresult.code)
        if (gotoresult.code === 200) {
            nightmare
                .exists('#temperature')
                .then(function(elementExists) {
                    if (elementExists) {
                        console.log("Temperature element found on weathershoppers.com")
                        nightmare.evaluate(function() {
                                return document.querySelector('#temperature').textContent
                            })
                            .then(function(temperature) {
                                console.log("current temperature value: ", temperature);
                                if (temperature != null) {
                                    if (temperature > '20 °C') {
                                        console.log("temperature is higher than 20 °C , buy lowest price sunscreen!")
                                        nightmare
                                            .click('[href="/sunscreen"]')
                                    } else {
                                        console.log("temperature is lesser than 20 °C , buy lowest price moisturizer!")
                                        nightmare
                                            .click('[href="/moisturizer"]')
                                    }
                                } else {
                                    //temperature value is not null
                                    nightmare.end()
                                }
                            })
                    } else {
                        console.log("Temperature element not found on weathershoppers.com")
                        nightmare.end()
                    }
                })
        } else {
            //cant access the weathershopper.com 
            nightmare.end()
        }
    })