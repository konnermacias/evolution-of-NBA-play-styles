/*
    Define dimensions
*/

var svgHeight = 900;
var svgWidth = 2000;

var margin = { top: 0, right: 40, left: 100, bottom: 40 };

var vizHeight = svgHeight - margin.top - margin.bottom;
var vizWidth = svgWidth - margin.left - margin.right;

// starting stats
var curStat = "PTS";
var margin = 100, diameter = 700;

/*
    Define game changers
*/

var gameChangers = [1982, 1996, 2016]

for (var i = 0; i < gameChangers.length; i++) {
  drawGameChanger(gameChangers[i]);
}

var header = d3.selectAll("p:nth-child(1)");
var node;


/*
    main drawing function

    Credit: https://sports.sites.yale.edu/clustering-nba-players
*/

function drawGameChanger(gameChangerID) {
  // load data from github
  d3.json(gameChangerID + ".json", function (error, root) {
    if (error) throw error;

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var color = d3.scale.linear()
        .domain([-1,5])
        .range(["hsl(36, 100%, 50%)", "hsl(355, 100%, 50%)"])
        .interpolate(d3.interpolateHcl);
    
    var pack = d3.layout.pack()
        .padding(1)
        .size([diameter - margin, diameter - margin])
        .value(function (d) { return d[curStat]}) // d.stats[curStat]
    
    var svg = d3.select(".wrapper" + gameChangerID)
        .append("g")
        .attr("transform", "translate(" + (diameter / 2)  + "," + diameter / 2 + ")");
    
    
    var focus = root;
    var view;
    var root_save = root;
    nodes = pack.nodes(root);
    root.name = "";

    var circle = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("id", "g" + gameChangerID)
        .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
        .style("fill", function (d) { return d.children ? color(d.depth) : null; });
        //.on("click", function (d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); }); // show teammates
    
    var images = svg.selectAll("image[id*='g" + gameChangerID + "']")
        .data(nodes)
        .enter().append("svg:image")
        .attr("class", "image")
        .attr("id", "g" + gameChangerID)
        //.attr("xlink:href", function (d) { if (d.image) return "https://raw.githubusercontent.com/mmenz/YUSAG/master/Basketball/ClusterVisual/" + d.image; return; })
        .attr("xlink:href", function (d) { if (d.Image) return d.Image; return; })
        .on("click", function (d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); })
        .on("mouseover", function (d) { // if you hover over the player
            // grab all nodes for this circle
            node = svg.selectAll("cirlce,text,image").selectAll("#g" + gameChangerID);
            node.filter(function (e) { return e.Tm != d.Tm && !d.children && !e.children; })
                .style("opacity", 0.5);
            if (d.Tm)
                header.text(d.Tm);
            else
                header.text("NBA")
            div.transition()
                .duration(200)
                .style("opacity", .9);
            if (!d.children) {
                var trueCurStat = curStat;
                if (curStat == "PTS") {
                    trueCurStat = "PTS";
                }
                div.html(d.Player + "<br\>" + curStat + " : " + Number(d[trueCurStat]).toFixed(2) + "<br\>" + "Season(s) : " + d["Season"]) //info about highlighted player
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 18) + "px");
            }
        })
        .on("mouseout", function (d) {
            node.style("opacity", 1.0);
            header.text("NBA"); div.transition()
                .duration(500)
                .style("opacity", 0);
    });
    
    var text = svg.selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("id", "g" + gameChangerID)
        .style("fill-opacity", function (d) { return d.parent === root ? 1 : 0; })
        .text(function (d) { return d.name; });

    node = svg.selectAll("circle,text,image")

    d3.select("body")
        .on("click", function () { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function (d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function (t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
            .style("font-size", function (d) { return focus.size > 0 ? "30px" : "11px"; })
            .style("fill-opacity", function (d) { return (d.parent === focus || d === focus) ? 1 : 0; })
            .each("start", function (d) { if (d.parent === focus || d === focus) this.style.display = "inline"; })
            .each("end", function (d) { if (d.parent !== focus && d !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function (d) { return d.r * k; });
        text.attr("dy", function (d) { return -d.r * k; });
        images.attr("width", function (d) { return 1.5 * d.r * k; });
        images.attr("height", function (d) { return 1.5 * d.r * k; });
        images.attr('x', function (d) { return -d.r * k / 1.5 - 2; })
        images.attr('y', function (d) { return -d.r * k / 1.5 - 2; })
    }

    });
}