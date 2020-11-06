<?php
    try {
      header("Content-Type:application/json");

      $secrets = getenv('SECRETS');
      $configs = json_decode($secrets);
      $host = $configs->host;
      $username = $configs->username;
      $password = $configs->password;
      $dbName = $configs->dbname;

      $conn = new PDO("mysql:host=$host;dbname=$dbName", $username, $password);
      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      
      $stmt = $conn->prepare("SELECT * FROM products");
      $stmt->execute();
      $stmt->setFetchMode(PDO::FETCH_ASSOC);
      $result = $stmt->fetchAll();
      
      $json_response = json_encode($result);
      echo $json_response;
      
    } catch(PDOException $e) {
      echo "Connection failed: " . $e->getMessage();
    }
    
?>