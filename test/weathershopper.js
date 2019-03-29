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
                        nightmare
                            .wait(1500)
                            .evaluate(function() {
                                return document.querySelector('#temperature').textContent
                            })
                            .then(function(temperature) {
                                console.log("current temperature value: ", temperature);
                                if (temperature != null) {
                                    if (temperature[0] > '34') {
                                        console.log("temperature is higher than 34 °C , buy sunscreens!")
                                        nightmare
                                            .wait(1500)
                                            .click('[href="/sunscreen"]')
                                            .wait(1500)
                                            .evaluate(function() {
                                                return document.querySelector(".octicon-info").getAttribute('data-content')
                                            })
                                            .then(function(htext) {
                                                if (htext == null || htext == '') {
                                                    console.log('Hint text appears to be null or empty')
                                                } else {
                                                    console.log("sunscreen shopping page hint: ", htext)
                                                    nightmare
                                                        .wait(2500)
                                                        .evaluate(function() {
                                                            var sunscreenlist = Array.from(document.querySelectorAll(".font-weight-bold")).map(element => element.innerText)
                                                            return sunscreenlist
                                                        })
                                                        .then(function(sunscreenlist) {
                                                            console.log('sunscreen list: ', sunscreenlist)
                                                            if (sunscreenlist.length > 0) {
                                                                for (i = 0; i < sunscreenlist.length; i++) {
                                                                    if (sunscreenlist[i].includes('Aloe')) {
                                                                        nightmare
                                                                            .wait(1500)
                                                                            .click('.btn-primary')[i]
                                                                    } else {
                                                                        return nightmare.end()
                                                                    }
                                                                }
                                                            } else {
                                                                console.log('no sunscreens found')
                                                            }
                                                        })
                                                }
                                            })
                                    } else if (temperature[0] < '19') {
                                        console.log("temperature is lesser than 19 °C , buy moisturizers!")
                                        nightmare
                                            .wait(1500)
                                            .click('[href="/moisturizer"]')
                                            .wait(1500)
                                            .evaluate(function() {
                                                return document.querySelector(".octicon-info").getAttribute('data-content')
                                            })
                                            .then(function(htext) {
                                                if (htext == null || htext == '') {
                                                    console.log('Hint text appears to be null or empty')
                                                } else {
                                                    console.log("moisturizers shopping page hint: ", htext)
                                                    nightmare
                                                        .evaluate(function() {
                                                            var moistlist = Array.from(document.querySelectorAll(".font-weight-bold")).map(element => element.innerText)
                                                            return moistlist
                                                        })
                                                        .then(function(moistlist) {
                                                            console.log('moisturizers list: ', moistlist)
                                                            if (moistlist.length > 0) {
                                                                for (i = 0; i < moistlist.length; i++) {
                                                                    if (moistlist[i].includes('Aloe')) {
                                                                        nightmare
                                                                            .wait(1500)
                                                                            .click('.btn-primary')[i]
                                                                    } else {
                                                                        return nightmare.end()
                                                                    }
                                                                }
                                                            } else {
                                                                console.log('no moisturizers found')
                                                            }
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