<?php         
// URL of SHOUTCast streaming
$url = filter_input(INPUT_GET, 'url', FILTER_SANITIZE_URL);

// true or false to get the next song
// Your streaming must show thins info. You can check if it is disponible on http://streaming URL:port/nextsong
$nextSong = filter_input(INPUT_GET, 'next', FILTER_VALIDATE_BOOLEAN);

// true or false to show history of played songs
$historic = filter_input(INPUT_GET, 'historic', FILTER_VALIDATE_BOOLEAN);

// Type of streaming server used, shoutcast or icecast supported
$streamingType = filter_input(INPUT_GET, 'streamtype', FILTER_SANITIZE_STRING);

if(!empty($url)) {
   if ($streamingType === 'icecast'){
		$url_explode = explode("/", $url);
		array_pop($url_explode);
		$url = implode("/", $url_explode);
		$url = $url."/status-json.xsl";

      //$url = "https://cast.cef-informatique.com:8443/status-json.xsl";
      //$url = "http://51.91.77.127:8000/status-json.xsl";
      //$url = "https://streaming.brasilhits.com/status-json.xsl";
   	  $url = "https://icecast.cef-informatique.com:8443/status-json.xsl";
      
		$data = file_get_contents($url);
      //AJOUT CEFI $data = utf8_encode($data);
  
		// if cURL don't works, use file_get_contents
		// $curl = curl_init($url);
		// curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		// curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0');
		// $data = curl_exec($curl);
		// curl_close($curl);

      // $hostname = "51.91.77.127";
      // putenv('RES_OPTIONS=retrans:1 retry:1 timeout:1 attempts:1');
      // gethostbyname ($hostname);
      // echo '<br>';
      // $result = dns_get_record("php.net");
      // print_r($result);
      // echo '<br>';
      // echo ($data);
 		
      //
      if(!empty($data)) {

			$ice_stats = json_decode($data, true);

			if(is_array($ice_stats["icestats"]["source"])) {
				$ice_stats_source = $ice_stats["icestats"]["source"][0];
            //echo "------------ CAS 1 --------------";
			} else {
				$ice_stats_source = $ice_stats["icestats"]["source"];
            //echo "------------ CAS 2 --------------";
			}
			
			$array['listenersPeak'] = $ice_stats_source["listener_peak"];
			$array['listeners'] = $ice_stats_source["listeners"];
			$array['transmissionFrequency'] = $ice_stats_source["bitrate"];	
			
         $currently_playing = $ice_stats_source["title"];
			$currently_playing = explode(" - ", $currently_playing, 2);
			
         $array['currentSong'] = $currently_playing[1];
			$array['currentArtist'] = explode(";",$currently_playing[0])[0];

			// check if it is alredy in played songs and append if necessary
			$track_history = file("player.log");
			$track_list = array_slice($track_history, 0, 20);
			if (stripos($track_history[0], $currently_playing[0]." - ".$currently_playing[1]) === false){
				array_unshift($track_list, $currently_playing[0]." - ".$currently_playing[1]."\n");
				file_put_contents("player.log", $track_list);
			}
         
		} else {
			$array = ['error' => 'Failed to fetch data url: '.$url.' count occ:'.count(is_array($ice_stats["icestats"]["source"]))];
		}

		$track_history = file("player.log");
		// remove first element from history
		array_shift($track_history);

		if($historic) {
			$i = 0;

			foreach ($track_history as $line){
				if($i > 4) continue;

				$track = explode(" - ", $line, 2);
				$last_artist = explode(";",$track[0])[0];
				$last_song = str_replace(array("\n", "\r"), '', $track[1]);
				$array['songHistory'][] = ['artist' => "$last_artist", 'song' => "$last_song"];

				$i++;
			}
		}
	} else {
		$array = ['error' => 'STREAM_TYPE parameter not found'];
	}
} else {
	$array = ['error' => 'URL parameter not found'];
}

$urlHost = $_SERVER['HTTP_HOST'];

header('Access-Control-Allow-Origin: '.$urlHost);
header('Content-type: application/json', true);
echo json_encode($array);
//echo "<br />";
//echo "--------------------------";
//die ($data);
