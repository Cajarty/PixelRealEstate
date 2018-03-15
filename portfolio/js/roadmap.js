$(function() {

    // var canvas = $('#canvas-roadmap');
    var canvas = document.getElementById('canvas-roadmap');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = 1200;
    var height = canvas.height = 500;

    // define the path to plot
    var vertices = [];
    vertices.push({ x: 0,    y: 250 });
    vertices.push({ x: 300,  y: 250 });
    vertices.push({ x: 600,  y: 250 });
    vertices.push({ x: 900,  y: 250 });
    vertices.push({ x: 1200, y: 250 });

    // calc waypoints traveling along vertices
    function calcWaypoints(vertices){
        var waypoints = [];
        for (var i = 1; i < vertices.length; i++) {
            var pt0 = vertices[i - 1];
            var pt1 = vertices[i];
            var dx  = pt1.x - pt0.x;
            var dy  = pt1.y - pt0.y;
            for (var j = 0; j < 100; j++) {
                var x = pt0.x + dx * j/ 100;
                var y = pt0.y + dy * j/ 100;
                waypoints.push({x: x, y: y});
            }
        }
        return (waypoints);
    }

    var mainline = calcWaypoints(vertices);

    var t = 1;
    var t1 = 1;

    animate(t, mainline);

    // incrementally draw additional line segments along the path
    function animate(inc, path) {
        if (inc < path.length - 1) { 
            requestAnimationFrame(animate(inc, path)); 
        }
        // console.log('t', t);
        // draw a line segment from the last waypoint
        // to the current waypoint
        ctx.beginPath();
        ctx.moveTo(path[inc - 1].x,path[inc - 1].y);
        ctx.lineTo(path[inc].x,path[inc].y);
        ctx.stroke();
        // increment "t" to get the next waypoint
        inc++;
    }

    

});