<?php
require 'vendor/autoload.php';
\Stripe\Stripe::setApiKey('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
header('Content-Type: application/json');

$YOUR_DOMAIN = getenv('DOMAIN');
$secrets = getenv('SECRETS');
$configs = json_decode($secrets);
$host = $configs->host;
$username = $configs->username;
$password = $configs->password;
$dbName = $configs->dbname;

$id = $_GET['id'];

$conn = new PDO("mysql:host=$host;dbname=$dbName", $username, $password);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->prepare("SELECT * FROM products where productId=$id");
$stmt->execute();
$stmt->setFetchMode(PDO::FETCH_ASSOC);
$products = $stmt->fetchAll();
$product = $products[0];
    
$checkout_session = \Stripe\Checkout\Session::create([
  'payment_method_types' => ['card'],
  'line_items' => [[
    'price_data' => [
      'currency' => 'usd',
      'unit_amount' => $product['price'] * 100,
      'product_data' => [
        'name' => $product['name'],
        'images' => [$product['image']],
      ],
    ],
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'success_url' => $YOUR_DOMAIN . '/success.php',
  'cancel_url' => $YOUR_DOMAIN . '/cancel.php',
]);
echo json_encode(['id' => $checkout_session->id]);