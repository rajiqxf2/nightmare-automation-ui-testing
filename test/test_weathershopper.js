/* 
Automating https://weathershopper.com basic use cases using nightmarejs
1. Go to home page - Done
2. Check temperature value and hint text - Done
3. Based on hint text navigate to moisturizers or sunscreens shopping page - Done
4. Add products to cart based on hint text conditions - Done
5. Submit cart product with some test stripe card details - Not Done
test credit cards: Visa: 4242 4242 4242 4242. Mastercard: 5555 5555 5555 4444. American Express: 3782 822463 10005.

Listed down some of the nightmarejs pitfalls and limitations that I have come across,
during the Nightmare.js automation proof of concept using weathershopper.com test application  

1. nightmare instance inside a loop does not work(it returns first iteration results for every iteration),
need to use work around like Array.reduce (Vanilla JS) or vo
Reference: https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md

2. document.queryselectAll() does not return web elements using nightmare unless mapping it to some attribute 
(DOM elements and DOM element lists are not serializable) 
https://github.com/segmentio/nightmare/issues/567#issuecomment-209533871
https://github.com/segmentio/nightmare/issues/1500

3. Getting the global variables inside the nightmare evaluate scope is not straight forward
https://github.com/segmentio/nightmare/issues/89

3. Nightmare does not pass element attributes outside the nightmare scope 
one of the work around is to save the nightmare response and reuse 
https://github.com/rosshinkley/nightmare-examples/blob/master/docs/known-issues/globally-defined-variables.md

4. Nightmare function 'evaluate' will return value only to 'then' caller
https://github.com/segmentio/nightmare/issues/1131

4. Asynchronous operations can lead to simultaneous calls causing early returns with wrong results
Reference: https://github.com/segmentio/nightmare/issues/493

5. Need to install nightmare iframe manager separately to work with iframe
Reference: https://github.com/rosshinkley/nightmare-iframe-manager 
*/

var Nightmare = require('nightmare')
require('nightmare-iframe-manager')(Nightmare)
var nightmare = Nightmare({
    show: true,
    webPreferences: {
        webSecurity: false
    }
})
var assert = require('assert')
var temperature = 0
var shopping = ['buy moisturizers', 'buy sunscreens']
var shopping_buttons = ['div:nth-child(1) > a button', 'div:nth-child(2) > a button']
var decision
var title = null
var shopping_button = null
var min_product1_price = 100000
var min_product2_price = 100000
var min_product1 = []
var min_product2 = []
var selectors = []
var shopping_cart
var shopping_products
var frame

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
        .exists('#temperature')
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

    it('Navigate to shopping page', function(done) {
        //Navigate to shopping moisturizers/sunscreens page
        shopping_page = shopping_decision.then(function() {
            return nightmare
                .wait(1500)
                .click(shopping_button)
        })
        done()
            .catch(error => {
                console.error('Shopping products based on temperature failed:', error)
            })
    })

    it('Select minimum price moisturizer or sunscreen products', function(done) {
        //this test step is continuation of above test step nightmare instance "shopping decision"
        //iterate through product list and get matching products
        //iterate through nightmare does not work in for or array loop , need to use array.reduce or any other additional package
        shopping_products = shopping_page.then(function() {
            return get_product_list(nightmare).then(function(product_list) {
                if (product_list.length > 0) {
                    return product_list.reduce(function(accumulator, product, i) {
                        return accumulator.then(function() {
                            product = product.toLowerCase()
                            selectors = get_product_selectors(product, i)
                            console.log('product: ', product)
                            return get_product_price(nightmare, selectors).then(function(price) {
                                console.log('price: ', price)
                                if ((product.includes('aloe') || product.includes('spf-30')) && price < min_product1_price) {
                                    min_product1_price = price
                                    min_product1 = [product, price, selectors[1]]
                                }
                                if ((product.includes('almond') || product.includes('spf-50')) && price < min_product2_price) {
                                    min_product2_price = price
                                    min_product2 = [product, price, selectors[1]]
                                }
                            })
                        })
                    }, Promise.resolve())
                }
            })

        })
        done()
            .catch(error => {
                console.error('Shopping products based on temperature failed:', error)
            })
    })

    it('Add shopping products and navigate to shopping cart', function(done) {
        //Add products to the cart
        shopping_cart = shopping_products.then(function() {
            console.log('Selected minimum price products are ', min_product1[0], min_product1[1])
            console.log('And ', min_product2[0], min_product2[1])
            return nightmare
                .wait(1500)
                .click(min_product1[2])
                .click(min_product2[2])
                .wait(1500)
                .click('.navbar-nav>button')
                .wait(5000)
                .end()
        })

        done()
            .catch(error => {
                console.error('Shopping products based on temperature failed:', error)
            })
    })


})