<?php
require 'vendor/autoload.php';
\Stripe\Stripe::setApiKey('sk_test_4eC39HqLyjWDarjtT1zdp7dc'); // STRIPE TEST API KEY
try {
  header('Content-Type: application/json');

  $YOUR_DOMAIN = getenv('DOMAIN');
  $secrets = getenv('SECRETS');
  $configs = json_decode($secrets);
  $host = $configs->host;
  $username = $configs->username;
  $password = $configs->password;
  $dbName = $configs->dbname;

  $conn = new PDO("mysql:host=$host;dbname=$dbName", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $query = $_GET['ids'];

  $ids = json_decode($query);
  $questionMarks  = str_repeat('?,', count($ids) - 1) . '?';
  $stmt = $conn->prepare("SELECT * FROM products where productId in ($questionMarks)");
  $stmt->execute($ids);
  $stmt->setFetchMode(PDO::FETCH_ASSOC);
  $products = $stmt->fetchAll();

  $basket=[];
  foreach ($products as &$product) {
      array_push($basket,[
          'price_data' => [
            'currency' => 'usd',
            'unit_amount' => $product['price'] * 100,
            'product_data' => [
              'name' => $product['name'],
              'images' => [$product['image']],
            ],
          ],
          'quantity' => 1,
        ]);
  }
      
  $checkout_session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => [$basket],
    'mode' => 'payment',
    'success_url' => $YOUR_DOMAIN . '/success.php',
    'cancel_url' => $YOUR_DOMAIN . '/cancel.php',
  ]);
  echo json_encode(['id' => $checkout_session->id]);
} catch(Exception $e) {
  echo "Error: " . $e->getMessage();
}