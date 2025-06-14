<?php
session_start();
if (!isset($_SESSION['userID'])) {
  header('Location: login.php');
  exit;
}

require '../php/connect.php';
$userId = $_SESSION['userID'];

// Get all joined groups
$stmt = $conn->prepare("SELECT g.GroupID, g.Name FROM studygroups g JOIN groupmemberships gm ON g.GroupID = gm.GroupID WHERE gm.UserID = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
$groups = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();
?>

<!DOCTYPE html>
<html>
<head>
  <title>Set Your Targets</title>
    <link rel="stylesheet" href="../css/targets.css">
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../css/nav.css">
</head>
<body>

<div class="sidebar">
    <h2>Study Hub</h2>
    <ul>
      <li><a href="/Study-Hub/User/home.php">Home</a></li>
      <li><a href="/Study-Hub/User/profile.php">Profile</a></li>
      <li><a href="/Study-Hub/Metrics/metrics.html">Metrics</a></li>
      <li><a href="/Study-Hub/User/pomodoro.php">Pomodoro</a></li>
      <li><a href="/Study-Hub/Metrics/targets.php">Targets</a></li>
      <li><a href="/Study-Hub/User/files.php">Files</a></li>
      <li><a href="/Study-Hub/php/logout.php">Logout</a></li>
    </ul>
  </div>
  <h1>Set Your Targets!</h1>
  <div class="targets-container">
  <?php foreach ($groups as $group): ?>
    <div class="target-card">
      <h3><?= htmlspecialchars($group['Name']) ?></h3>
      <form action="../php/save_targets.php" method="POST">
        <input type="hidden" name="group_id" value="<?= $group['GroupID'] ?>">
        <?php for ($i = 1; $i <= 5; $i++): ?>
  <div class="cat-input">
    <label>CAT <?= $i ?>:</label>
    <input type="number" name="cat_scores[]" placeholder="Score">
    <input type="number" name="cat_outof[]" placeholder="Out of">
  </div>
<?php endfor; ?>

        <div class="cat-input">
          <label>Exam:</label>
          <input type="number" name="exam_score" placeholder="Score" required>
          <input type="number" name="exam_outof" placeholder="Out of" required>
        </div>
        <button type="submit" class="submit-btn">Save Targets</button>
      </form>
    </div>
  <?php endforeach; ?>
</div>

  </form>
</body>
</html>
