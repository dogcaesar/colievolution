
/**
 * Sample HTML5 page for network visualization with cytoscape.js
 *
 * @type {string}
 */
(function () {
    "use strict";

    // var NETWORK_DATA_URI = 'http://localhost:9988/v1/networks/views';
//    var NETWORK_LOCAL_DATA_URI = 'data/galFiltered2.json';
    // var VISUAL_STYLE_URI = 'data/vs.json';
    var NETWORK_LOCAL_DATA_URI = 'data/netJSON.min.d3';
//    var VISUAL_STYLE_URI = 'data/vs.json';
    var NETWORK_WINDOW_TAG = "#network-view";
	
	var n = 8;
	var r = 5;
    var trans=[0,0]
    var scale=1;
	var width = $(NETWORK_WINDOW_TAG).width(),
	    height = $(NETWORK_WINDOW_TAG).height();
	var color = d3.scale.category20();	
	var previousd;
	
	var vis = d3.select(NETWORK_WINDOW_TAG)
		.append("svg")
        	.attr("id", "playgraph")
	        .attr({
	          "width": width,
	          "height": height
	        })
        	.attr("viewBox", "0 0 " + width + " " + height )
        	.attr("preserveAspectRatio", "xMidYMid meet")
		    .attr("pointer-events", "all")
	  	 .append('svg:g')
 	    	.call(d3.behavior.zoom().on("zoom", redraw))
	  	 .append('svg:g')
		 
	
 	var rect = vis.append('svg:rect')
 	    .attr('width', width)
 	    .attr('height', height)
 	    .attr('fill', 'white')
		.on("click", function(){$(".pop-up").fadeOut(50)};previousd="");
	
	function redraw() {
        $(".pop-up").fadeOut(50);
		previousd="";
		trans=d3.event.translate;
		scale=d3.event.scale;

		vis.attr("transform","translate(" + trans + ")"+" scale(" + scale + ")");
	}
		
	d3.json(NETWORK_LOCAL_DATA_URI, function(error, graph) {
		var force = d3.layout.force()
	        // .charge(-120)
	        // .linkDistance(30)
			.links(graph.links)
			.nodes(graph.nodes)
		    .size([width, height]);
	  	      	//.start();	
	    
		var link = vis.selectAll("line.link")
	        .data(graph.links)
	        .enter().append("svg:line")
	      	.style("stroke-width", function(d) { return d.accumulated+1; })
	        .attr("class", "link")
			.on("click",lover);
		var node_drag = d3.behavior.drag()
		    .on("dragstart", dragstart)
		    .on("drag", dragmove)
		    .on("dragend", dragend);
			
		function dragstart(d, i) {
		    force.stop() // stops the force auto positioning before you start dragging
	        $(".pop-up").fadeOut(50);
		}
	
		function dragmove(d, i) {
		    d.px += d3.event.dx;
		    d.py += d3.event.dy;
		    d.x += d3.event.dx;
		    d.y += d3.event.dy; 
		    tick(); // this is the key to make it work together with updating both px,py,x,y on d !
		}
	
		function dragend(d, i) {
		    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
		    tick();
		}
		
		var gnodes = vis.selectAll('.node')
			.data(graph.nodes)
			.enter()
			.append('g')
			.call(node_drag)
			.on("click",mover)
			.classed('gnode', true);
		var node = gnodes.append("circle")
			.attr("class", "node")
			.attr("r", r - .5)
			// .on ("mouseout",mout)
	        .style("stroke", function(d) { return d3.rgb(color(d.GO_ref)).darker(); })
	        .style("stroke-width", 0.5)
			.style("fill", function(d) { return color(d.GO_ref); });
		var labels = gnodes.append("text")
	    	.attr("dy", ".3em")
	    	.attr("text-anchor", "middle")
			.style("font-size","2.5px")
			.text(function(d) { return d.main; });
		
	  	  node.append("title")
	  	      .text(function(d) { return d.main; });
		
		force.on("tick", tick);
		
		function tick(){
	  		  // Update the links
	  		  link.attr("x1", function(d) { return d.source.x; })
	  		    .attr("y1", function(d) { return d.source.y; })
	  		    .attr("x2", function(d) { return d.target.x; })
	  		    .attr("y2", function(d) { return d.target.y; });
								
	  		  // Translate the groups
	  		  gnodes.attr("transform", function(d) { 
	  		    return 'translate(' + [d.x, d.y] + ')'; 
				});				
		}
	    function mover(d,i) {
	        $(".pop-up").fadeOut(50);
			if(d.name != previousd){
				previousd = d.name;
		        $("#pop-up-node").fadeOut(100,function () {
		            // Popup content
		            $("#node-title").html(d.main + " (" + d.name + ")");
		            $("#nodename").html(d.Protein_names);
		            $("#uniprot").html(d.Entry);
		            $("#gofun").html(d.GO_ref);
		            $("#gofundesc").html(d.GOref_description);
					var enrichpval;
					if(d.reference_pval == "NA"){
						enrichpval="NA"
					}else{
						enrichpval=parseFloat(d.reference_pval.toPrecision(5));
					}
					$("#gofunpval").html(enrichpval) ;
					
		            // $("#pop-desc").html("M+T: text text test");

		            // Popup position
		            var popLeft = (d.x*scale)+trans[0]+20;//lE.cL[0] + 20;
		            var popTop = (d.y*scale)+trans[1]+20;//lE.cL[1] + 70;
		            $("#pop-up-node").css({"left":popLeft,"top":popTop});
		            $("#pop-up-node").fadeIn(100);
		        });
			}else{
				previousd = "";
			}
	    }
		
		
	    function lover(d,i) {
	        $(".pop-up").fadeOut(50);
			if(d.name != previousd){
				previousd = d.name;
		        $("#pop-up-link").fadeOut(100,function () {
		            // Popup content
		            $("#link-title").html("Interaction: " + d.name);
					$("#orthologs").html(d.n);
					$("#mt").html(Math.round(d.r).toFixed(5));			
					var pval;
					if(d.p_value == 0){
						pval="< 1E-3";
					}else{
						pval=d.p_value;
					}
					$("#pMT").html(pval);
					$("#context").html(d.context_lvl10);
					var binary,complex,kpath,ecopath,reg;
					if(d.binary_physical == "NA"){
						binary="&#10008";
					}else{
						binary="&#10004";
					}
					if(d.ecocyc_complexes == "NA"){
						complex="&#10008";
					}else{
						complex="&#10004";
					}
					if(d.kegg_pathways == "NA"){
						kpath="&#10008";
					}else{
						kpath="&#10004";
					}
					if(d.ecocyc_pathways == "NA"){
						ecopath="&#10008";
					}else{
						ecopath="&#10004";
					}
					if(d.ecocyc_regulation == "NA"){
						reg="&#10008";
					}else{
						reg="&#10004";
					}
					$("#binary_physical").html(binary);
					$("#ecocyc_complexes").html(complex);
					$("#kegg_pathways").html(kpath);
					$("#ecocyc_pathways").html(ecopath);
					$("#ecocyc_regulation").html(reg);
					
		            // Popup position
		            var popLeft = (((d.source.x + d.target.x)/2)*scale)+trans[0]+20;//lE.cL[0] + 20;
		            var popTop = (((d.source.y + d.target.y)/2)*scale)+trans[1]+20;//lE.cL[1] + 70;
		            $("#pop-up-link").css({"left":popLeft,"top":popTop});
		            $("#pop-up-link").fadeIn(100);
		        });
			}else{
				previousd = "";
			}
	    }
		
	    // function mout(d) {
	    //     //d3.select(this).attr("fill","url(#ten1)");
	    // }
	  	setTimeout(function() {
	  		  // Run the layout a fixed number of times.
	  		  // The ideal number of times scales with graph complexity.
	  		  // Of course, don't run too long—you'll hang the page!
	  		  force.start();
	  		  for (var i = n * n; i > 0; --i) force.tick();
	  		  force.stop();
			  			  
	  		  // vis.selectAll("line")
	  		  //     .data(link)
	  		  //   .enter().append("line")
	  		  //     .attr("x1", function(d) { return d.source.x; })
	  		  //     .attr("y1", function(d) { return d.source.y; })
	  		  //     .attr("x2", function(d) { return d.target.x; })
	  		  //     .attr("y2", function(d) { return d.target.y; });
	  		  // vis.selectAll("circle")
	  		  //     .data(node)
	  		  //   .enter().append("circle")
	  		  //     .attr("cx", function(d) { return d.x; })
	  		  //     .attr("cy", function(d) { return d.y; })
			  $("#loadingCon").fadeOut();
	  		}, 10);	
			console.log( document.getElementsByTagName('*').length )	  
	});
	
}).call(this);

