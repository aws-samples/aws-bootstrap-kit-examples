<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">

    <title>Tools Shop</title>
    <style>
        main {
            display: flex;
            align-items: flex-start;
        }

        #list {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: deepskyblue;
            border-radius: 20px;
            margin: 10px;
            padding: 10px;
        }

        aside {
            background-color: deepskyblue;
            border-radius: 20px;
            margin: 10px;
            padding: 10px;
            min-width: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
        }

        .item {
            display: flex;
            align-items: center;
            margin: 10px;
            padding: 10px;
        }

        .product {
            margin: 10px;
            padding: 10px;
        }

        #basket {
            margin: 10px;
            padding: 10px;
        }

        .itemContainer {
            border: 1px solid blue;
            background-color: white;
            border-radius: 10px;
            margin: 10px;
            padding: 10px;
        }

        .space {
            margin: 10px;
            padding: 10px;
        }
    </style>
    <script src="https://js.stripe.com/v3/"></script>
</head>

<body>
    <nav class="navbar navbar-light bg-light">
        <?php
            $url = getenv("ECS_CONTAINER_METADATA_URI_V4");
            $json = file_get_contents($url);
            $data = json_decode($json, true);
            $ip = $data['Networks'][0]['IPv4Addresses'][0];
            echo "<h5> Hello from ${ip} </h5>";
        ?>
    </nav>
    <main>
        <div id="list">
        </div>
        <aside>
            <h5>Basket</h5>
            <div id="basket"></div>
            <h5>Total = $<span id="total">0</span></h5>
            <button id="checkout-button" type="button" class="btn btn-primary">Checkout</button>
        </aside>
    </main>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
    <script>
    
        const productsList = document.getElementById('list');
        const basketList = document.getElementById('basket');
        const total = document.getElementById('total');
        let products;
        const basket = [];
        
        var stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx");
        var checkoutButton = document.getElementById("checkout-button");
        checkoutButton.addEventListener("click", function () {
          fetch(`/create-session.php?ids=[${basket.map(item => item.productId).join(',')}]`, {
            method: "POST",
          })
            .then(function (response) {
              return response.json();
            })
            .then(function (session) {
              return stripe.redirectToCheckout({ sessionId: session.id });
            })
            .then(function (result) {
              if (result.error) {
                alert(result.error.message);
              }
            })
            .catch(function (error) {
              console.error("Error:", error);
            });
        });

        function addToBasket(id) {
            const selection = products.find(product => product.productId == id);
            const basketItem = document.createElement('div')
            basketItem.innerHTML = `
            <div class="itemContainer">
                <div class="item">
                    <img class="space" width="50px;" src="${selection.image}" >
                    <div class="space">${selection.name}</div>
                    <div class="space">$${selection.price}</div>
                </div>
            </div>
            `;
            basketList.appendChild(basketItem);
            total.innerHTML = (+total.innerHTML + +selection.price).toFixed(2);
            basket.push(selection);
        }

        fetch('/get-products.php')
            .then(response => response.json())
            .then(data => {
                products = data;
                productsList.innerHTML = data.map(product =>
                `<div class="itemContainer">
                    <h4 style="text-align: center;">${product.name}</h4>
                    <div class="item">
                        <img width="90px;" src="${product.image}" >
                        <p style="margin:10px;max-width:300px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>
                        <div>
                            <h5 style="text-align:center;">$${product.price}</h5>
                            <button type="button" class="btn btn-primary" onclick="addToBasket(${product.productId});">add to Basket</button>
                        </div>
                    </div>
                </div>`
                ).join('');
            });
    </script>
</body>

</html>
