//2017 Roman G. Bragin (roman.bragin.kn@gmail.com)
//yard-measure
//The sample was taken from http://webmap-blog.ru/bez-rubriki/risuem-poliliniyu-na-karte-i-opredelyaem-ee-dlinu-ispolzuya-api-google-maps-v3
//
//To run, you need to:
//
//1.Add a line to the html header. For example:
//<head>
//....
//<script type="text/javascript" src="measure_map.js"></script>
//....
//</head>
//
//2.The block in which the map will be assigned id="main_m". For example:
//<div id="main_m">
//      <div id='map'></div>
//</div>
//
//3.After the map is initialized, run the ruler:
//var map = new google.maps.Map(mapCanvas,mapOptions);//Your map
//
//measure_map = map;
//path_to_image = '../measure_map/';
//google.maps.event.addListener(measure_map, "click", mapLeftClick);
//initPolyline();
//
//Good luck!


        $(document).ready(function() { 
            var html_txt = '<div id="chk_line" style="background-color: #ffffff; position: absolute; z-index: 50;" > \
                            <table class="text"> \
                            <tr> \
                                <td> \
                                    <input type="checkbox" id="check_main_m" name="check_main_m"> \
                                </td> \
                                <td>измерить расстояние</td> \
                            </tr> \
                            </table> \
                            </div> \
                    ';
            var html_old = $('#main_m').html();
            $('#main_m').html(html_txt+html_old);

            var ll = ($('#main_m').width()-$('#chk_line').width())/2;
            $('#chk_line').offset({left: ll});
            
            $('#check_main_m').change(function() {
                if ($('#check_main_m').prop('checked') === false) {
                    check_main_m_clear();
                }
            });            

        });
        
        var measure_map = null;
        var path_to_image;
        var polyLine;
        var tmpPolyLine;
        var markers = [];
        var vmarkers = [];
        var infowinds = [];
        var count_inf = 1; 
        var g = google.maps;  
        
			var initPolyline = function() {
				var polyOptions = {
					strokeColor: "#ff0061",
					strokeOpacity: 0.8,
					strokeWeight: 2
				};
				var tmpPolyOptions = {
					strokeColor: "#ff0061",
					strokeOpacity: 0.4,
					strokeWeight: 2
				};
				polyLine = new g.Polyline(polyOptions);
				polyLine.setMap(measure_map);
				tmpPolyLine = new g.Polyline(tmpPolyOptions);
				tmpPolyLine.setMap(measure_map);
			};
 
			var mapLeftClick = function (event) {
                            //только если стоит галочка в чекбоксе
                            if ($('#check_main_m').prop("checked") === true) {
				if (event.latLng) {
					var marker = createMarker(event.latLng);
					markers.push(marker);
                                        infowinds.push(count_inf);                                        
					if (markers.length != 1) {
						var vmarker = createVMarker(event.latLng);
						vmarkers.push(vmarker);
						vmarker = null;
					}
					var path = polyLine.getPath();
					path.push(event.latLng);
                                        
                                            if (markers[0] != marker) {    
                                                var infowindow = new google.maps.InfoWindow({
                                                  content: '<div class="text" id="marroles_'+count_inf+'"></div>'
                                                });
                                                infowindow.open(measure_map, marker);                                                
                                                g.event.addListener(marker, "mouseover", function() {
                                                    if (!infowindow.getMap()) {
                                                            infowindow.open(measure_map, this);
                                                    }        
                                                });      
                                                count_inf = count_inf + 1;                                                
                                                distance();                                        
                                            }    
					marker = null;
				}

                                m = null;                                 
				event = null;
                            } else {
                                //если линейка выключена, выводим координаты тыкнутой точки
                                 var iwindow= new google.maps.InfoWindow({
                                     position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng())
                                 });
                                 iwindow.setContent(event.latLng.lat().toFixed(6)+" , "+event.latLng.lng().toFixed(6));
                                 iwindow.open(measure_map,this); 
                                 g.event.addListener(measure_map, "click", function() {
					iwindow.close();
				});                                 
                              }   
			};
 
			var createMarker = function (point) {
				var imageNormal = new g.MarkerImage(
					path_to_image+"square.png",
					new g.Size(11, 11),
					new g.Point(0, 0),
					new g.Point(6, 6)
				);
				var imageHover = new g.MarkerImage(
					path_to_image+"square_over.png",
					new g.Size(11, 11),
					new g.Point(0, 0),
					new g.Point(6, 6)
				);
				var marker = new g.Marker({
					position: point,
					map: measure_map,
					icon: imageNormal,
					draggable: true
				});
                                
				g.event.addListener(marker, "mouseover", function() {
					marker.setIcon(imageHover);
				});
				g.event.addListener(marker, "mouseout", function() {
					marker.setIcon(imageNormal);
				});
				g.event.addListener(marker, "drag", function() {
					for (var m = 0; m < markers.length; m++) {
						if (markers[m] == marker) {
							polyLine.getPath().setAt(m, marker.getPosition());
							moveVMarker(m);
							break;
						}
					}
					m = null;
                                        distance();                                        
				});
				g.event.addListener(marker, "click", function() {
					for (var m = 0; m < markers.length; m++) {
						if (markers[m] == marker && m != 0) {
							marker.setMap(null);
							markers.splice(m, 1);
                                                        infowinds.splice(m, 1);
							polyLine.getPath().removeAt(m);
							removeVMarkers(m);
							break;
						}
					}
					m = null;
                                        distance();                                        
				});

				return marker;
			};
 
			var createVMarker = function (point) {
				var prevpoint = markers[markers.length-2].getPosition();
				var imageNormal = new g.MarkerImage(
					path_to_image+"square_transparent.png",
					new g.Size(11, 11),
					new g.Point(0, 0),
					new g.Point(6, 6)
				);
				var imageHover = new g.MarkerImage(
					path_to_image+"square_transparent_over.png",
					new g.Size(11, 11),
					new g.Point(0, 0),
					new g.Point(6, 6)
				);
				var marker = new g.Marker({
					position: new g.LatLng(
						point.lat() - (0.5 * (point.lat() - prevpoint.lat())),
						point.lng() - (0.5 * (point.lng() - prevpoint.lng()))
					),
					map: measure_map,
					icon: imageNormal,
					draggable: true
				});
				g.event.addListener(marker, "mouseover", function() {
					marker.setIcon(imageHover);
				});
				g.event.addListener(marker, "mouseout", function() {
					marker.setIcon(imageNormal);
				});
				g.event.addListener(marker, "dragstart", function() {
					for (var m = 0; m < vmarkers.length; m++) {
						if (vmarkers[m] == marker) {
							var tmpPath = tmpPolyLine.getPath();
							tmpPath.push(markers[m].getPosition());
							tmpPath.push(vmarkers[m].getPosition());
							tmpPath.push(markers[m+1].getPosition());
							break;
						}
					}
					m = null;
				});
				g.event.addListener(marker, "drag", function() {
					for (var m = 0; m < vmarkers.length; m++) {
						if (vmarkers[m] == marker) {
							tmpPolyLine.getPath().setAt(1, marker.getPosition());
							break;
						}
					}
					m = null;
				});
				g.event.addListener(marker, "dragend", function() {
					for (var m = 0; m < vmarkers.length; m++) {
						if (vmarkers[m] == marker) {
							var newpos = marker.getPosition();
							var startMarkerPos = markers[m].getPosition();
							var firstVPos = new g.LatLng(
								newpos.lat() - (0.5 * (newpos.lat() - startMarkerPos.lat())),
								newpos.lng() - (0.5 * (newpos.lng() - startMarkerPos.lng()))
							);
							var endMarkerPos = markers[m+1].getPosition();
							var secondVPos = new g.LatLng(
								newpos.lat() - (0.5 * (newpos.lat() - endMarkerPos.lat())),
								newpos.lng() - (0.5 * (newpos.lng() - endMarkerPos.lng()))
							);
							var newVMarker = createVMarker(secondVPos);
							newVMarker.setPosition(secondVPos);//apply the correct position to the vmarker
							var newMarker = createMarker(newpos);
							markers.splice(m+1, 0, newMarker);
                                                        
                                                        var infowindow = new google.maps.InfoWindow({
                                                          content: '<div class="text" id="marroles_'+count_inf+'"></div>'
                                                        });
                                                        infowindow.open(measure_map, newMarker);                                                
                                                        g.event.addListener(newMarker, "mouseover", function() {
                                                            if (!infowindow.getMap()) {
                                                                    infowindow.open(measure_map, this);
                                                            }        
                                                        });                                                         

                                                        infowinds.splice(m+1, 0, count_inf);
                                                        count_inf = count_inf + 1;                                                
							polyLine.getPath().insertAt(m+1, newpos);
							marker.setPosition(firstVPos);
							vmarkers.splice(m+1, 0, newVMarker);
							tmpPolyLine.getPath().removeAt(2);
							tmpPolyLine.getPath().removeAt(1);
							tmpPolyLine.getPath().removeAt(0);
							newpos = null;
							startMarkerPos = null;
							firstVPos = null;
							endMarkerPos = null;
							secondVPos = null;
							newVMarker = null;
							newMarker = null;
                                                        distance();
							break;
						}
					}
				});
				return marker;
			};
 
			var moveVMarker = function (index) {
				var newpos = markers[index].getPosition();
				if (index != 0) {
					var prevpos = markers[index-1].getPosition();
					vmarkers[index-1].setPosition(new g.LatLng(
						newpos.lat() - (0.5 * (newpos.lat() - prevpos.lat())),
						newpos.lng() - (0.5 * (newpos.lng() - prevpos.lng()))
					));
					prevpos = null;
				}
				if (index != markers.length - 1) {
					var nextpos = markers[index+1].getPosition();
					vmarkers[index].setPosition(new g.LatLng(
						newpos.lat() - (0.5 * (newpos.lat() - nextpos.lat())), 
						newpos.lng() - (0.5 * (newpos.lng() - nextpos.lng()))
					));
					nextpos = null;
				}
				newpos = null;
				index = null;
			};
 
			var removeVMarkers = function(index) {
				if (markers.length > 0) {//при клике на маркере он удаляется
					if (index != markers.length) {
						vmarkers[index].setMap(null);
						vmarkers.splice(index, 1);
					} else {
						vmarkers[index-1].setMap(null);
						vmarkers.splice(index-1, 1);
					}
				}
				if (index != 0 && index != markers.length) {
					var prevpos = markers[index-1].getPosition();
					var newpos = markers[index].getPosition();
					vmarkers[index-1].setPosition(new g.LatLng(
						newpos.lat() - (0.5 * (newpos.lat() - prevpos.lat())),
						newpos.lng() - (0.5 * (newpos.lng() - prevpos.lng()))
					));
					prevpos = null;
					newpos = null;
				}
				index = null;
			};
                        
function check_main_m_clear() {
    //убиваем линейку
    var mm = markers.length-1;
    for (var m = mm; m >= 0; m--) {
        markers[m].setMap(null);
        markers.splice(m, 1);
        infowinds.splice(m, 1);
        polyLine.getPath().removeAt(m);
        removeVMarkers(m);
    }
    markers = [];
    infowinds = [];
    vmarkers = [];
    count_inf = 1;    
    m = null;    
}               
function distance() {
 
	var dist = 0;
 
	if (markers.length > 0) {
            for (var im = 0; im < markers.length-1; im++) {	
                var marpos1 = markers[im].getPosition();
                var marpos2 = markers[im+1].getPosition();

                var R = 6371000; // km (коэффициент для определения расстояния между двумя точками в километрах)
                var dLat = (marpos2.lat()-marpos1.lat()) * Math.PI / 180;
                var dLon = (marpos2.lng()-marpos1.lng()) * Math.PI / 180;

                var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(marpos1.lat() * Math.PI / 180 ) * Math.cos(marpos2.lat() * Math.PI / 180 ) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                var d = R * c;

                dist = dist+d;
                var distans = Math.round(dist/10)/100;
                
                $('#marroles_'+infowinds[im+1]).html(distans+' км');
            }
 
	}
}                     
                     
        