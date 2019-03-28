const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

//navigate to weathershopper.com
nightmare
    .goto('https://weathershopper.pythonanywhere.com')
    //check if weathershopper launched
    .then(function(gotoresult) {
        if (gotoresult.code === 200) {
            return nightmare
                .exists('#temperature')
                .then(function(elementExists) {
                    if (elementExists) {
                        console.log("weathershoppers.com loaded")
                        return nightmare
                            .evaluate(function() {
                                return document.querySelector('#temperature').textContent
                            })
                            .then(function(temperature) {
                                console.log("current temperature value: ", temperature);
                                if (temperature != null) {
                                    if (temperature > '20 °C') {
                                        console.log("temperature is higher than 20 °C , buy lowest price sunscreen!")
                                        return nightmare
                                            .click('[href="/sunscreen"]')
                                    } else {
                                        console.log("temperature is lesser than 20 °C , buy lowest price moisturizer!")
                                        return nightmare
                                            .click('[href="/moisturizer"]')
                                    }
                                } else {
                                    //temperature value is not null
                                    return nightmare.end()
                                }
                            })
                    } else {
                        console.log("Some issue with loading weathershoppers.com")
                        return nightmare.end()
                    }
                })
        } else {
            console.log("cant access the weathershopper.com")
            return nightmare.end()
        }
    })