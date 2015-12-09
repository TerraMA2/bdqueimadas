<?php

echo file_get_contents($_GET['url'] . '?map=' . $_GET['map'] . '&service=' . $_GET['service'] . '&request=' . $_GET['request'] . '&version=' . $_GET['version']);
