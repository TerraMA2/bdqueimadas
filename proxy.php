<?php

echo file_get_contents($_GET['url'] . '?map=' . $_GET['map'] . '&service=' . $_GET['service'] . '&request=' . $_GET['request'] . '&version=' . $_GET['version']);
//echo $_GET['url'] . '?map=' . $_GET['map'] . '&service=' . $_GET['service'] . '&request=' . $_GET['request'] . '&version=' . $_GET['version'];

//url=http://localhost:9095/geoserver/ows&service=WMS&request=getCapabilities
