/* 
Try automating https://weathershopper.com basic testcases using nightmare
1. Go to home page - Done
2. Check temperature value and hint text - Done
3. Based on hint text navigate to moisturizers or sunscreens shopping page - Done
4. Add products to cart based on hint text - InProgress
5. Submit cart product with some test stripe card details
test credit cards: Visa: 4242 4242 4242 4242. Mastercard: 5555 5555 5555 4444. American Express: 3782 822463 10005.
6. Check for successful payment confirmation 

Some Pit falls of nightmare 
1. nightmare instance inside a loop does not work , need to use work around like array.reduce()
2. document.queryselectAll() does not return web elements using nightmare unless mapping it to some attribute
3. Nightmare does not let you store element attributes outside the nightmare scope
References 
https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md
*/

var Nightmare = require('nightmare')
var nightmare = Nightmare({ show: true })
var assert = require('assert')
var temperature = 0
var shopping = ['buy moisturizers', 'buy sunscreens']
var shopping_buttons = ['div:nth-child(1) > a button', 'div:nth-child(2) > a button']
var decision
var title = null
var shopping_button = null
var min_aloe_price = 100000
var min_almond_price = 100000
var min_spf30_price = 100000
var min_spf50_price = 100000
var min_price_aloe_products = []
var min_price_almond_products = []
var min_price_spf30_products = []
var min_price_spf50_products = []
var selectors = []


function temperature_val(nightmare) {
    //return temperature value from home page
    return nightmare
        .wait(1500)
        .evaluate(function() {
            temperature = document.querySelector('#temperature').textContent
            return temperature
        })
}

function web_page_title(url) {
    //return web page title
    return nightmare
        .goto(url)
        .wait(1500)
        .evaluate(function() {
            title = document.querySelector('title').textContent
            return title
        })
}

function get_product_list(nightmare) {
    //return product list from sunscreen or moisturizers page
    return nightmare
        .wait(2000)
        .evaluate(function() {
            var product_list = Array.from(document.querySelectorAll(".font-weight-bold")).map(Element => Element.textContent)
            return product_list
        })
}

function get_product_price(nightmare, selectors) {
    //Regex used to return integer value from price because sunscreen has both "Price: Rs." and "Price:"
    return nightmare
        .wait(1500)
        .evaluate((selectors) => {
            price = document.querySelector(selectors[0]).textContent
            price = price.trim()
            price = price.replace(/[^0-9]+/ig, "")
            price = parseInt(price)
            return price
        }, selectors)

}

function get_product_selectors(product, i) {
    //return product name, price & button selectors 
    if ([0, 1, 2].includes(i)) {
        x = 2
        y = i + (i + 1)
    } else if ([3, 4, 5].includes(i)) {
        x = 3
        y = i - 2
    }
    //product_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + ")> .font-weight-bold"
    price_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + ")> p:nth-child(3)"
    button_selector = ".row:nth-child(" + x + ")>.text-center:nth-child(" + y + ") button"
    return [price_selector, button_selector]
}

describe('Test weather shopper', function() {
    it('load weather shopper with out any error', function(done) {
        //check if weathershopper application is launched     
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
                        .wait(3000)
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
        //temperature_val is a function that returns temperature value
        shopping_decision = temperature_val(nightmare)
            .then(function(temperature) {
                if (temperature != 0) {
                    temp = parseInt(temperature.split('℃').slice(-2)[0].trim())
                    console.log('temperature value split: ', temp)
                    if (temp < 19) {
                        decision = shopping[0]
                        shopping_button = shopping_buttons[0]
                    } else if (temp > 34) {
                        decision = shopping[1]
                        shopping_button = shopping_buttons[1]
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

    it('Shop for moisturizers or sunscreens', function(done) {
        //this test step is continuation of above test step nightmare instance "shopping decision"
        //iterate through product list and get matching products
        //iterate through nightmare does not work in for or array loop , need to use array.reduce or any other additional package
        shopping_decision.then(function() {
            nightmare
                .wait(1500)
                .click(shopping_button)
            get_product_list(nightmare).then(function(product_list) {
                console.log('products: ', product_list)
                if (product_list.length > 0) {
                    product_list.reduce(function(accumulator, product, i) {
                        return accumulator.then(function() {
                            product = product.toLowerCase()
                            selectors = get_product_selectors(product, i)
                            return get_product_price(nightmare, selectors).then(function(price) {
                                if (decision.includes('moisturizer')) {
                                    if (price < min_aloe_price && product.includes('aloe')) {
                                        min_aloe_price = price
                                        min_price_aloe_products = [product, price, selectors[1]]
                                    }
                                    if (price < min_almond_price && product.includes('almond')) {
                                        min_almond_price = price
                                        min_price_almond_products = [product, price, selectors[1]]
                                    }
                                } else if (decision.includes('sunscreen')) {
                                    if (price < min_spf30_price && product.includes('spf-30')) {
                                        min_spf30_price = price
                                        min_price_spf30_products = [product, price, selectors[1]]
                                    }
                                    if (price < min_spf50_price && product.includes('spf-50')) {
                                        min_spf50_price = price
                                        min_price_spf50_products = [product, price, selectors[1]]
                                    }
                                }
                            })
                        })
                    }, Promise.resolve([])).then(function() {
                        //results contains the array of all of the finished promise results,
                        //in this case, the titles from every page visited
                        //you could do something with that here
                        if (decision.includes('moisturizer')) {
                            console.log(min_price_aloe_products[2])
                            nightmare
                                .wait(1500)
                                .click(min_price_aloe_products[2])
                                .click(min_price_almond_products[2])
                        } else if (decision.includes('sunscreen')) {
                            console.log(min_price_spf30_products[2])
                            nightmare
                                .wait(1500)
                                .click(min_price_spf30_products[2])
                                .click(min_price_spf50_products[2])
                        }
                    })
                }
            })
        })
        done()
            .catch(error => {
                console.error('Shopping products based on temperature failed:', error)
            })
    })

})