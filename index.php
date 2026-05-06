<head>		       
   <title>Radio Choup - cooking radio       
   </title>		       
   <meta name="description" content="The girlyest radio in the world. baking cupcakes, pin up in the kitchen, sexy house cleaning, boudoir, smooth">		       
   <meta name="keywords" content="radio, cuisine, retro, glamour, chic, pinup, cooking dress, cupcake">		       
   <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8">		       
   <meta name="robots" content="index,follow">		       
   <meta http-equiv="Cache-control" content="no-cache">		            
   <!--link rel="icon" type="image/vnd.microsoft.icon" href="https://www.madamechoup.com/img/favicon.ico" -->   		       
   <!--link rel="shortcut icon" type="image/x-icon" href="https://www.madamechoup.com/img/favicon.ico" -->                       
   <link rel="icon" type="image/png" href="img/logo.png" />           
   <meta charset='utf-8'>           
   <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">           
   <meta property="og:image" content="https://www.radiochoup.com/img/logo.png">           
   
   <link rel="stylesheet" href="/config/color.css"         type="text/css">           
   <link rel="stylesheet" href="/css/font-awesome.min.css" type="text/css">           
   <link rel="stylesheet" href="/css/animate.css"          type="text/css">           
   <link rel="stylesheet" href="/css/player_style.css"     type="text/css">           		   

   <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

</head>

<body id="index">              
   <div id="page" class="h-100" >
   
      <!-- ------------- Header ---------------- -->
      <div class="d-none d-sm-block d-md-block d-lg-block d-xl-block">  			                   
         <div id="header" class="row" >                                      
            <div id="logo" class="col-3">                                  
               <a href="https://www.radiochoup.com/" title="Radio Choup">                                       
                  <img src="img/logo.png" alt="Radio Choup - cooking radio"></a>                           
            </div>                                    
            <div id="links_block_left" class="col-6">                                  
               <ul class="row">                                         
                  <li class="lien_1 col-4 align-middle">                               
                     <a href="" class="active">Qui sommes nous</a>                          
                  </li>                                         
                  <li class="lien_2 col-4 align-middle">                               
                     <a href="" rel="external">Suggestion</a>                          
                  </li>                                         
                  <li class="lien_3 col-4 align-middle">                               
                     <a href="" rel="external">Faites un don</a>                          
                  </li>                                  
               </ul>                           
            </div>                                      
            <div id="TableauCuisine" class="logo_covert col-3 animated swing">                                           
               <div class="cover-album">
                  <div id="currentCoverArt"></div>              
                  <div class="_watermark"></div>
               </div>                                                                                                                      
            </div>                             
         </div>
      </div>

      <div class="container-fluid">                             
         <div class="d-flex flex-row-reverse">

            <!-- ------------- GSM ---------------- -->
            <div class="web-playergsm d-sm-none d-md-none d-lg-none d-xl-none">
               <div class="row justify-content-center align-items-end" >
                  <div class="col-10 covert-position-gsm-btn">                                                                 
                     <div class="play-pause col-12 col-md-2 text-center">                                                                                                 
                        <a id="playerButtongsm" href="javascript:togglePlay();" class="BIPP" style="display:block;">                                                                                 
                           <img id="imgplayerButtongsm" class="animated infinite pulse" src="img/lecteur/btn_pause.png">
                        </a>                                                                 
                     </div>                                                          
                  </div>                                            
                  <div class="col-10 covert-position-gsm">                                                                               
                     <div class="justify-content-center"  >                                                                                                                                   
                        <div class="d-block">                                                                  
                           <h2 id="currentSonggsm" class="info-current-song text-uppercase">...</h2>                                                                 
                           <h3 id="currentArtistgsm" class="info-current-song text-captalize">...</h3>                                                          
                        </div>                                                                                                             
                     </div>                                                                                                                                                                              
                  </div>                                         
               </div>
            </div>            

            <!-- ------------- PC ---------------- -->
            <div class="web-player d-none d-sm-block d-md-block d-lg-block d-xl-block">                                                                  
               <div class="row justify-content-center align-items-end" >                                            
                  <div class="col-10 covert-position">                                                                               
                     <div class="row justify-content-center"  >                                                          
                        <div class="col-2">                                                                 
                           <div class="volume-icon col-1 mt-2">                                                   
                              <i class="fa fa-volume-up"></i>                                              
                           </div>                                                                 
                           <div class="row volume-control">                                                                        
                              <div class="volume-slide col-9">                                                        
                                 <input type="range" id="volume" step="1" min="0" max="100" value="80">                                                   
                              </div>                                                                
                           </div>                                                          
                        </div>                                                                         
                        <div class="col-6 ">                                                                  
                           <h2 id="currentSong" class="info-current-song text-uppercase">...</h2>                                                                 
                           <h3 id="currentArtist" class="info-current-song text-captalize">...</h3>                                                          
                        </div>                                                          
                        <div class="col-2 px-0 pt-1">                                                                 
                           <div class="play-pause col-12 col-md-2 text-center">                                                                                                 
                              <a id="playerButton" href="javascript:togglePlay();" class="BIPP" style="display:block;">                                                                                 
                                 <img id="imgplayerButton" class="animated infinite pulse" src="img/lecteur/btn_pause.png">
                              </a>                                                                 
                           </div>                                                          
                        </div>                                                   
                     </div>
                     <div class="row justify-content-center">
                        <div class="row mr-3 col-6">                                                                    
                           <div class="col-4 text-center call-lyrics mt-2 pt-0"><a href="#" class="lyrics" data-target="#modalLyrics">Paroles</a></div>
                           <div class="col-4 text-center call-history mt-2 pt-0"><a href="#" class="history" data-target="#modalhistoric">Historique</a></div>          
                           <div class="col-4 text-center call-lyrics mt-2 pt-0"><a href="#" class="Programmation" data-target="#modalProgrammation">Programme</a></div>
                        </div>
                     </div>                                                                                                                                                                              
                  </div>                                         
               </div>                                                               
            </div>
                                 
         </div>                      
      </div>

      <!-- ------------- Publicité Deguizland ---------------- -->
      <div class="d-none d-sm-block d-md-block d-lg-block d-xl-block">
      <div id="promo" class="row col-12 mx-0 px-0 justify-content-center" >
         <div class="col-4 bg-white align-middle d-none d-lg-block d-xl-block"  >				                 
            <img src="img/appstore.jpg"><!-- img id="open-prog" src="img/programme.jpg" -->
         </div>
         <div class="col-sm-5 col-md-5 col-lg-4 col-xl-4  bg-white align-middle" >
            <img id="open-prog" class="" src="img/FaitesUnDon.png"  >
         </div>
         <div class="col-sm-5 col-md-5 col-lg-4 col-xl-4 bg-white align-middle" >				                 
            <a href="https://www.deguizland.com/catalogsearch/result/?q=ann%C3%A9e+50" target="_blank" rel="external"><img src="img/pub_polkamatik.png"></a>
         </div>                  
      </div>
      </div>
      
      <!-- ------------- Copyright ---------------- -->      
      <div id="footer"  class="" >				                 
         <a href="https://www.mariepierrepastini.fr/" rel="external">Webdesign MP Pastini</a> -                  
         <a href="" rel="external">Développement Cef-i</a> - <a href="" rel="external">Radio Choup, tous droits réservés</a> 			            
      </div>
      
      <!-- -------------HISTORIQUE-------------- -->
      <div class="modal fade" id="modalhistoric" tabindex="-1" role="dialog" aria-labelledby="historicSong" aria-hidden="true">
         <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">                                           
               <div class="modal-header">
                  <h2>Derniers titres &eacute;cout&eacute;s</h2>                                                           
               </div>
               <div class="modal-body">
                  <div class="row justify-content-center historic" >                                                            
                     <div class="col-12">          
                        <div class="row justify-content-center historic historicBox" id="historicSong">                                                                              
                           <article class="col-2 "><div class="cover-historic"></div><div class="music-info"><div class="song">...</div><div class="artist">...</div></div></article>                                                                              
                           <article class="col-2 "><div class="cover-historic"></div><div class="music-info"><div class="song">...</div><div class="artist">...</div></div></article>                                                                              
                           <article class="col-2 "><div class="cover-historic"></div><div class="music-info"><div class="song">...</div><div class="artist">...</div></div></article>                                                                              
                           <article class="col-2 "><div class="cover-historic"></div><div class="music-info"><div class="song">...</div><div class="artist">...</div></div></article>
                           <article class="col-2 "><div class="cover-historic"></div><div class="music-info"><div class="song">...</div><div class="artist">...</div></div></article>                                                                     
                        </div>                                                            
                     </div>                                                                                                   
                  </div>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-success" data-dismiss="modal">Fermé</button></div>
             </div>
         </div>
      </div>

      <!-- -------------PAROLES-------------- --> 	                   
      <div class="modal fade" id="modalLyrics" tabindex="-1" role="dialog" aria-labelledby="lyricsSong" aria-hidden="true">                       
         <div class="modal-dialog modal" role="document">                                  
            <div class="modal-content">                                           
               <div class="modal-header">
                  <h2 class="modal-title" id="lyricsSong">Paroles</h2>
                  <button type="button" class="btn btn-success" data-dismiss="modal">Fermé</button>
               </div>                                                          
               <div class="modal-body" id="lyric">                                           
                  <div class="vagalume text-center">                                                  
                     <a href="https://www.vagalume.com.br/" target="_blank" rel="noopener"><!-- img src="img/103-fundo-escuro.jpg" class="" / --></a>
                     <br />Powered by <a href="https://www.vagalume.com.br/" target="_blank" rel="noopener">Vagalume</a>                                           
                  </div>
               </div>
               <div class="modal-footer"><button type="button" class="btn btn-success" data-dismiss="modal">Fermé</button></div>                                                              
            </div>                         
         </div>                  
      </div>
                   			            
      <!-- -------------PROGRAMMATION-------------- -->
      <div class="modal fade" id="modalProgrammation" tabindex="-1" role="dialog" aria-labelledby="ProgrammationSong" aria-hidden="true">
         <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content ">
                  <div class="modal-header">
                     <h2>Programmation musicale de la semaine</h2>
                     <button type="button" class="btn btn-success" data-dismiss="modal">Fermé</button>
                  </div>
                  <div class="modal-body">   				                 
                     <div id="programme">
                        <div id="prog-head">
                           <div class="head-d">H</div>					                      
                           <div class="head-d">LUN</div>                     
                           <div class="head-d">MAR</div>                     
                           <div class="head-d">MER</div>                     
                           <div class="head-d">JEU</div>                     
                           <div class="head-d">VEN</div>                     
                           <div class="head-d">SAM</div>                     
                           <div class="head-d">DIM</div>				                 
                        </div>				                 
                        <div id="prog-hours">					                      
                           <div class="hours-h">06</div><div class="hours-h"> -</div>
                           <div class="hours-h">07</div><div class="hours-h"> -</div>
                           <div class="hours-h">08</div><div class="hours-h"> -</div>
                           <div class="hours-h">09</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">10</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">11</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">12</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">13</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">14</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">15</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">16</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">17</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">18</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">19</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">20</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">21</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">22</div><div class="hours-h"> -</div>
                           <div class="hours-h">23</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">00</div><div class="hours-h"> -</div>
                           <div class="hours-h">01</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">02</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">03</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">04</div><div class="hours-h"> -</div>                     
                           <div class="hours-h">05</div><div class="hours-h"> -</div>				                 
                        </div>                  				                 
                        <div id="prog-grille">					                      
                           <!-- div class="grille-inner rose">Nom du programme</div -->
                           <div class="grille-inner"></div>
                           <!-- div class="grille-inner jaune">Nom du programme</div -->  					                      
                           <div><img src="img/programmation.jpg" style="width:700px;" /></div>				                 
                        </div>
                     </div>
                  </div>
                  <div class="modal-footer"><button type="button" class="btn btn-success" data-dismiss="modal">Fermé</button></div>                                                           
            </div>         
         </div>      
      </div>     
   </div>
       
  
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js"></script>
    <script type="text/javascript" src="/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="/config/player_config.js"></script>
    <script type="text/javascript" src="/js/script.js"></script>


</body>     
</html>