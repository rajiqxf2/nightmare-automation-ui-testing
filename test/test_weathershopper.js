var Nightmare = require('nightmare')
var nightmare = Nightmare({ show: true })
var assert = require('assert')
var temperature = 0
var shopping = ['Buy moisturizers', 'Buy sunscreens']
var shopping_buttons = ['div:nth-child(1) > a button', 'div:nth-child(2) > a button']
var shopping_decision
var decision = null
var title = null
var product_list = null
var price_selector

function temperature_val(nightmare) {
    return nightmare
        .wait(1500)
        .evaluate(function() {
            temperature = document.querySelector('#temperature').textContent
            return temperature
        })
}

function web_page_title(url) {
    return nightmare
        .goto(url)
        .wait(1500)
        .evaluate(function() {
            title = document.querySelector('title').textContent
            return title
        })
}

function get_product_list(nightmare) {
    return nightmare
        .wait(1500)
        .evaluate(function() {
            var product_list = Array.from(document.querySelectorAll(".font-weight-bold")).map(Element => Element.textContent)
            return product_list
        })
}

describe('Test weather shopper', function() {
    it('load weather shopper with out any error', function(done) {
        //check if weathershopper launch     
        web_page_title('https://weathershopper.pythonanywhere.com').then(function(title) {
            console.log('web page title: ', title)
        })
        done()
            .catch(error => {
                console.error('Loading failed:', error)
            })
    })

    it('print hint text of weather shopper', function(done) {
        nightmare
            .wait(2000)
            .exists('#temperature')
            .then(function(elementExists) {
                if (elementExists) {
                    console.log("Temperature element found on weathershopper.com")
                        // get hint text on the home page
                    nightmare
                        .wait(1500)
                        .evaluate(function() {
                            return document.querySelector(".octicon-info").getAttribute('data-content')
                        })
                        .then(function(htext) {
                            if (htext == null || htext == '') {
                                console.log('Hint text appears to be null or empty')
                            } else {
                                console.log("weathershopper hint: ", htext)
                            }
                        })
                }
            })
        done()
            .catch(error => {
                console.error('Getting hint text failed:', error)
            })

    })

    it('check current temperature', function(done) {
        //check current temperature value
        temperature_val(nightmare).then(function(temperature) {
            console.log('current temperature value: ', temperature)
        })
        done()
            .catch(error => {
                console.error('Getting temperature value failed:', error)
            })
    })

    it('Decide shopping ', function(done) {
        //Decide shopping based on temperature value
        shopping_decision = temperature_val(nightmare)
            .then(function(temperature) {
                if (temperature != 0) {
                    temp = parseInt(temperature.split('℃').slice(-2)[0].trim())
                    console.log('temperature value split: ', temp)
                    if (temp < 19) {
                        decision = shopping[0]
                    } else if (temp > 34) {
                        decision = shopping[1]
                    } else {
                        console.log('weather is moderate , no shopping !')
                    }
                }
                console.log('shopping decision: ', decision)
            })
        done()
            .catch(error => {
                console.error('Shopping moisturizers failed:', error)
            })
    })

    it('Shop for moisturizers', function(done) {
        shopping_decision
            .then(function() {
                if (decision == shopping[0]) {
                    nightmare
                        .wait(1500)
                        .click(shopping_buttons[0])
                    get_product_list(nightmare).then(function(product_list) {
                        console.log('products: ', product_list)
                        if (product_list.length > 0) {
                            for (i = 0; i < product_list.length; i++) {
                                if ([0, 1, 2].includes(i)) {
                                    x = 2
                                    y = i + (i + 1)
                                } else if ([3, 4, 5].includes(i)) {
                                    x = 3
                                    y = i - 2
                                }
                                product_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + "> font-weight-bold"
                                price_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + "> p:nth-child(3)"
                                button_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + ") button"
                                if (product_list[i].includes('Aloe')) {
                                    nightmare
                                        .evaluate(function() {
                                            return document.querySelector(price_selector).textContent
                                        })
                                        .then(function(price) {
                                            console.log('product name: ', product_list[i])
                                            console.log('price: ', price)
                                        })
                                }
                                if (product_list[i].includes('Almond')) {
                                    nightmare
                                        .evaluate(function() {
                                            return document.querySelector(price_selector).textContent
                                        })
                                        .then(function(price) {
                                            console.log('product name: ', product_list[i])
                                            console.log('price: ', price)
                                        })
                                }
                            }
                        }
                    })
                }
            })
        done()
            .catch(error => {
                console.error('Shopping sunscreens failed:', error)
            })
    })

    it('Shop for sunscreens', function(done) {
        shopping_decision
            .then(function() {
                if (decision == shopping[1]) {
                    nightmare
                        .wait(1500)
                        .click(shopping_buttons[1])
                    get_product_list(nightmare).then(function(product_list) {
                        console.log('products: ', product_list)
                        if (product_list.length > 0) {
                            for (i = 0; i < product_list.length; i++) {
                                if ([0, 1, 2].includes(i)) {
                                    x = 2
                                    y = i + (i + 1)
                                } else if ([3, 4, 5].includes(i)) {
                                    x = 3
                                    y = i - 2
                                }
                                product_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + "> font-weight-bold"
                                price_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + "> p:nth-child(3)"
                                button_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + ") button"
                                if (product_list[i].includes('SPF-50')) {
                                    nightmare
                                        .evaluate(function() {
                                            return document.querySelector(price_selector).textContent
                                        })
                                        .then(function(price) {
                                            console.log('product name: ', product_list[i])
                                            console.log('price: ', price)
                                        })
                                }
                                if (product_list[i].includes('SPF-30')) {
                                    nightmare
                                        .evaluate(function() {
                                            return document.querySelector(price_selector).textContent
                                        })
                                        .then(function(price) {
                                            console.log('product name: ', product_list[i])
                                            console.log('price: ', price)
                                        })
                                }
                            }
                        }
                    })
                }
            })
        done()
            .catch(error => {
                console.error('Getting temperature value failed:', error)
            })
    })
})